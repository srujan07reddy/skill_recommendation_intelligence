"""
SSIP In-Memory Ephemeral Session Store
Provides local thread-safe ephemeral session and assessment storage with TTL support.
"""
import asyncio
from datetime import datetime, timezone, timedelta
from typing import Any, Dict, List, Optional
from app.storage.interfaces.session_store import AbstractSessionStore


class InMemorySessionStore(AbstractSessionStore):
    def __init__(self):
        self._lock = asyncio.Lock()
        self._sessions: Dict[str, Dict[str, Any]] = {}
        self._records: Dict[str, List[Dict[str, Any]]] = {}
        self._submitted_students: Dict[str, set] = {}
        self._upload_previews: Dict[str, Dict[str, Any]] = {}
        self._proposals: Dict[str, Dict[str, Any]] = {}
        self._exports: Dict[str, Dict[str, Any]] = {}
        self._expiry_times: Dict[str, datetime] = {}

    def _is_expired(self, key: str) -> bool:
        if key in self._expiry_times:
            if datetime.now(timezone.utc) > self._expiry_times[key]:
                return True
        return False

    async def create_session(self, session_data: Dict[str, Any], ttl_seconds: int) -> Dict[str, Any]:
        async with self._lock:
            session_id = session_data["session_id"]
            now = datetime.now(timezone.utc)
            expiry = now + timedelta(seconds=ttl_seconds)

            session_data["created_at"] = now.isoformat()
            session_data["expiry_time"] = expiry.isoformat()
            if "status" not in session_data:
                session_data["status"] = "Created"

            self._sessions[session_id] = session_data
            self._records[session_id] = []
            self._submitted_students[session_id] = set()
            self._expiry_times[session_id] = expiry
            return session_data

    async def get_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        async with self._lock:
            if session_id not in self._sessions:
                return None
            if self._is_expired(session_id):
                # Transition to Expired
                self._sessions[session_id]["status"] = "Expired"
            return dict(self._sessions[session_id])

    async def list_sessions(self, department_id: Optional[str] = None) -> List[Dict[str, Any]]:
        async with self._lock:
            results = []
            now = datetime.now(timezone.utc)
            for sid, s in list(self._sessions.items()):
                if self._is_expired(sid):
                    s["status"] = "Expired"
                
                # Department filter
                if department_id and s.get("department_id") and s["department_id"] != department_id:
                    continue
                
                # Exclude cleaned/purged sessions
                if s["status"] in ("Cleaned", "PURGED"):
                    continue

                session_copy = dict(s)
                session_copy["record_count"] = len(self._records.get(sid, []))
                session_copy["student_count"] = len(self._submitted_students.get(sid, set()))
                results.append(session_copy)
            return sorted(results, key=lambda x: x.get("created_at", ""), reverse=True)

    async def update_session_status(self, session_id: str, new_status: str) -> Optional[Dict[str, Any]]:
        async with self._lock:
            if session_id not in self._sessions:
                return None
            self._sessions[session_id]["status"] = new_status
            self._sessions[session_id]["updated_at"] = datetime.now(timezone.utc).isoformat()
            return dict(self._sessions[session_id])

    async def delete_session(self, session_id: str) -> bool:
        async with self._lock:
            # Physical eviction across memory
            self._sessions.pop(session_id, None)
            self._records.pop(session_id, None)
            self._submitted_students.pop(session_id, None)
            self._expiry_times.pop(session_id, None)

            # Evict proposals for this session (ADR-002)
            proposal_ids_to_remove = [
                pid for pid, p in self._proposals.items() if p.get("session_id") == session_id
            ]
            for pid in proposal_ids_to_remove:
                self._proposals.pop(pid, None)

            # Evict exports for this session (ADR-004)
            export_ids_to_remove = [
                eid for eid, exp in self._exports.items() if exp.get("session_id") == session_id
            ]
            for eid in export_ids_to_remove:
                self._exports.pop(eid, None)
                self._expiry_times.pop(f"export:{eid}", None)

            return True

    async def add_assessment_records(self, session_id: str, records: List[Dict[str, Any]]) -> int:
        async with self._lock:
            if session_id not in self._records:
                self._records[session_id] = []
            if session_id not in self._submitted_students:
                self._submitted_students[session_id] = set()

            for r in records:
                self._records[session_id].append(r)
                student_ref = r.get("session_student_ref")
                if student_ref:
                    self._submitted_students[session_id].add(student_ref)

            return len(records)

    async def get_assessment_records(self, session_id: str) -> List[Dict[str, Any]]:
        async with self._lock:
            return list(self._records.get(session_id, []))

    async def check_student_submitted(self, session_id: str, student_ref: str) -> bool:
        async with self._lock:
            submitted_set = self._submitted_students.get(session_id, set())
            return student_ref in submitted_set

    async def store_upload_preview(self, upload_id: str, preview_data: Dict[str, Any], ttl_seconds: int = 3600) -> None:
        async with self._lock:
            self._upload_previews[upload_id] = preview_data
            self._expiry_times[f"upload:{upload_id}"] = datetime.now(timezone.utc) + timedelta(seconds=ttl_seconds)

    async def get_upload_preview(self, upload_id: str) -> Optional[Dict[str, Any]]:
        async with self._lock:
            upload_key = f"upload:{upload_id}"
            if upload_id not in self._upload_previews or self._is_expired(upload_key):
                self._upload_previews.pop(upload_id, None)
                return None
            return dict(self._upload_previews[upload_id])

    async def delete_upload_preview(self, upload_id: str) -> bool:
        async with self._lock:
            self._upload_previews.pop(upload_id, None)
            self._expiry_times.pop(f"upload:{upload_id}", None)
            return True

    # Ephemeral Proposal Management (ADR-002)
    async def create_proposal(self, proposal_data: Dict[str, Any]) -> Dict[str, Any]:
        async with self._lock:
            pid = proposal_data["proposal_id"]
            now = datetime.now(timezone.utc).isoformat()
            proposal_data["created_at"] = now
            proposal_data["updated_at"] = now
            self._proposals[pid] = proposal_data
            return dict(proposal_data)

    async def get_proposal(self, proposal_id: str) -> Optional[Dict[str, Any]]:
        async with self._lock:
            p = self._proposals.get(proposal_id)
            if not p:
                return None
            # Check if parent session has expired
            sid = p.get("session_id")
            if sid and self._is_expired(sid):
                # Unavailable via UI/API when session expires (ADR-002)
                return None
            return dict(p)

    async def list_proposals(self, session_id: Optional[str] = None, department_id: Optional[str] = None) -> List[Dict[str, Any]]:
        async with self._lock:
            results = []
            for p in self._proposals.values():
                sid = p.get("session_id")
                if sid and self._is_expired(sid):
                    continue
                if session_id and sid != session_id:
                    continue
                if department_id and p.get("department_id") != department_id:
                    continue
                results.append(dict(p))
            return sorted(results, key=lambda x: x.get("created_at", ""), reverse=True)

    async def update_proposal(self, proposal_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        async with self._lock:
            if proposal_id not in self._proposals:
                return None
            p = self._proposals[proposal_id]
            sid = p.get("session_id")
            if sid and self._is_expired(sid):
                return None
            p.update(updates)
            p["updated_at"] = datetime.now(timezone.utc).isoformat()
            return dict(p)

    async def delete_proposal(self, proposal_id: str) -> bool:
        async with self._lock:
            if proposal_id in self._proposals:
                self._proposals.pop(proposal_id)
                return True
            return False

    # Ephemeral Export Management (ADR-004)
    async def create_export(self, export_data: Dict[str, Any], ttl_seconds: int = 86400) -> Dict[str, Any]:
        async with self._lock:
            eid = export_data["export_id"]
            now = datetime.now(timezone.utc)
            expiry = now + timedelta(seconds=ttl_seconds)
            export_data["created_at"] = now.isoformat()
            export_data["expires_at"] = expiry.isoformat()
            self._exports[eid] = export_data
            self._expiry_times[f"export:{eid}"] = expiry
            return dict(export_data)

    async def get_export(self, export_id: str) -> Optional[Dict[str, Any]]:
        async with self._lock:
            if export_id not in self._exports or self._is_expired(f"export:{export_id}"):
                return None
            # Also check parent session
            sid = self._exports[export_id].get("session_id")
            if sid and self._is_expired(sid):
                return None
            return dict(self._exports[export_id])

    async def list_exports(self, session_id: Optional[str] = None) -> List[Dict[str, Any]]:
        async with self._lock:
            results = []
            for eid, exp in list(self._exports.items()):
                if self._is_expired(f"export:{eid}"):
                    continue
                sid = exp.get("session_id")
                if sid and self._is_expired(sid):
                    continue
                if session_id and sid != session_id:
                    continue
                results.append(dict(exp))
            return sorted(results, key=lambda x: x.get("created_at", ""), reverse=True)

    async def delete_export(self, export_id: str) -> bool:
        async with self._lock:
            self._exports.pop(export_id, None)
            self._expiry_times.pop(f"export:{export_id}", None)
            return True

