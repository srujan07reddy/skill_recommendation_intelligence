"""
SSIP Session Cleanup & Lifecycle Purge Worker
SESSION_MANAGEMENT.md §11, §14, DATA_PRIVACY_AND_RETENTION.md §5, ADR-004
Executes automated sweeps to transition Expired/Closed sessions -> Cleaning -> Cleaned,
unlinking all temporary export packages and flushing ephemeral memory caches.
"""
import asyncio
import os
import tempfile
import logging
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from dateutil.parser import isoparse

from app.storage.interfaces.session_store import AbstractSessionStore

logger = logging.getLogger("ssip.cleanup")


class SessionCleanupWorker:
    def __init__(
        self,
        session_store: AbstractSessionStore,
        sweep_interval_seconds: int = 60,
    ):
        self.session_store = session_store
        self.sweep_interval_seconds = sweep_interval_seconds
        self.export_dir = os.path.join(tempfile.gettempdir(), "ssip_exports")
        self._running = False
        self._task: Optional[asyncio.Task] = None

    async def sweep_once(self) -> Dict[str, Any]:
        """
        Execute a single authoritative cleanup sweep across all ephemeral sessions.
        SESSION_MANAGEMENT.md §14.2
        """
        now = datetime.now(timezone.utc)
        all_sessions = await self.session_store.list_sessions()
        
        expired_detected = 0
        cleaned_sessions: List[str] = []
        files_unlinked = 0

        for s in all_sessions:
            session_id = s.get("session_id")
            if not session_id:
                continue

            status = s.get("status", "")
            expiry_str = s.get("expiry_time")
            is_time_expired = False
            if expiry_str:
                try:
                    exp_dt = isoparse(expiry_str)
                    if exp_dt.tzinfo is None:
                        exp_dt = exp_dt.replace(tzinfo=timezone.utc)
                    if now > exp_dt:
                        is_time_expired = True
                except Exception:
                    pass

            # Eligible for cleanup if explicitly Expired/Closed or expired by wall-clock
            if status in ("Expired", "Closed") or is_time_expired:
                expired_detected += 1
                try:
                    # 1. Transition state: Expired -> Cleaning (SESSION_MANAGEMENT.md §8)
                    await self.session_store.update_session_status(session_id, "Cleaning")

                    # 2. Unlink associated export files on temporary disk (ADR-004)
                    if os.path.exists(self.export_dir):
                        for fname in os.listdir(self.export_dir):
                            if session_id in fname:
                                fpath = os.path.join(self.export_dir, fname)
                                try:
                                    if os.path.isfile(fpath):
                                        os.remove(fpath)
                                        files_unlinked += 1
                                except Exception as fe:
                                    logger.warning(f"Could not unlink temporary export file {fpath}: {fe}")

                    # 3. Physically delete ephemeral assessment records, proposals, and export metadata
                    await self.session_store.delete_session(session_id)

                    # 4. Mark Cleaned
                    cleaned_sessions.append(session_id)
                    logger.info(
                        f"Zero-Retention Lifecycle: Assessment session '{session_id}' successfully purged across memory and temp disk."
                    )
                except Exception as e:
                    logger.error(f"Failed to execute cleanup for session '{session_id}': {e}")
                    await self.session_store.update_session_status(session_id, "Cleaning-Retry")

        return {
            "swept_at": now.isoformat(),
            "expired_detected": expired_detected,
            "cleaned_sessions_count": len(cleaned_sessions),
            "cleaned_session_ids": cleaned_sessions,
            "temporary_files_unlinked": files_unlinked,
        }

    async def _run_loop(self):
        logger.info(f"Session Cleanup Worker active. Sweep interval: {self.sweep_interval_seconds}s")
        while self._running:
            try:
                await asyncio.sleep(self.sweep_interval_seconds)
                await self.sweep_once()
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Error during scheduled cleanup worker sweep: {e}")

    def start(self):
        """Start the background sweep task."""
        if not self._running:
            self._running = True
            self._task = asyncio.create_task(self._run_loop())

    def stop(self):
        """Stop the background sweep task."""
        self._running = False
        if self._task and not self._task.done():
            self._task.cancel()
            self._task = None
        logger.info("Session Cleanup Worker stopped.")


# Global singleton instance
_cleanup_worker_instance: Optional[SessionCleanupWorker] = None


def get_cleanup_worker(session_store: AbstractSessionStore) -> SessionCleanupWorker:
    global _cleanup_worker_instance
    if _cleanup_worker_instance is None:
        _cleanup_worker_instance = SessionCleanupWorker(session_store=session_store)
    return _cleanup_worker_instance

