"""
SSIP Session Store Factory & Dependency
Provides the active ephemeral storage provider (InMemory by default for local/dev, Redis for production).
"""
from typing import Optional
from app.storage.interfaces.session_store import AbstractSessionStore
from app.storage.memory.session_store import InMemorySessionStore

_session_store_instance: Optional[AbstractSessionStore] = None


def get_session_store() -> AbstractSessionStore:
    """Returns singleton instance of the ephemeral session storage provider."""
    global _session_store_instance
    if _session_store_instance is None:
        _session_store_instance = InMemorySessionStore()
    return _session_store_instance

