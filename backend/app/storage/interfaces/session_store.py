"""
SSIP Ephemeral Session Storage Interface
SESSION_MANAGEMENT.md §6.1, DATABASE_DESIGN.md §8
Defines abstract contracts for ephemeral session and assessment storage.
"""
from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional
from datetime import datetime
import uuid


class AbstractSessionStore(ABC):
    """
    Contract for managing ephemeral assessment sessions and temporary records.
    Never persists raw student records to relational database.
    """

    @abstractmethod
    async def create_session(self, session_data: Dict[str, Any], ttl_seconds: int) -> Dict[str, Any]:
        """Store new session metadata with TTL."""
        pass

    @abstractmethod
    async def get_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve session metadata."""
        pass

    @abstractmethod
    async def list_sessions(self, department_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """List active/accessible sessions."""
        pass

    @abstractmethod
    async def update_session_status(self, session_id: str, new_status: str) -> Optional[Dict[str, Any]]:
        """Update session lifecycle state machine."""
        pass

    @abstractmethod
    async def delete_session(self, session_id: str) -> bool:
        """Immediately purge all session data and temporary records."""
        pass

    @abstractmethod
    async def add_assessment_records(self, session_id: str, records: List[Dict[str, Any]]) -> int:
        """Store normalized, pseudonymized student assessment records into session buffer."""
        pass

    @abstractmethod
    async def get_assessment_records(self, session_id: str) -> List[Dict[str, Any]]:
        """Retrieve all ephemeral assessment records for analysis."""
        pass

    @abstractmethod
    async def check_student_submitted(self, session_id: str, student_ref: str) -> bool:
        """Check if student pseudonym has already submitted in this session (ADR-006)."""
        pass

    @abstractmethod
    async def store_upload_preview(self, upload_id: str, preview_data: Dict[str, Any], ttl_seconds: int = 3600) -> None:
        """Temporarily hold upload preview and validation log before confirmation."""
        pass

    @abstractmethod
    async def get_upload_preview(self, upload_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve upload preview and validation log."""
        pass

    @abstractmethod
    async def delete_upload_preview(self, upload_id: str) -> bool:
        """Purge temporary upload preview."""
        pass

    # Ephemeral Proposal Management (ADR-002)
    @abstractmethod
    async def create_proposal(self, proposal_data: Dict[str, Any]) -> Dict[str, Any]:
        """Store ephemeral proposal in active session cache."""
        pass

    @abstractmethod
    async def get_proposal(self, proposal_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve ephemeral proposal."""
        pass

    @abstractmethod
    async def list_proposals(self, session_id: Optional[str] = None, department_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """List proposals for session and/or department."""
        pass

    @abstractmethod
    async def update_proposal(self, proposal_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Update ephemeral proposal state or content."""
        pass

    @abstractmethod
    async def delete_proposal(self, proposal_id: str) -> bool:
        """Evict proposal from session cache."""
        pass

    # Ephemeral Export Management (ADR-004)
    @abstractmethod
    async def create_export(self, export_data: Dict[str, Any], ttl_seconds: int = 86400) -> Dict[str, Any]:
        """Store export metadata with 24-hour TTL."""
        pass

    @abstractmethod
    async def get_export(self, export_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve export metadata."""
        pass

    @abstractmethod
    async def list_exports(self, session_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """List active exports."""
        pass

    @abstractmethod
    async def delete_export(self, export_id: str) -> bool:
        """Delete export metadata and signal file cleanup."""
        pass

