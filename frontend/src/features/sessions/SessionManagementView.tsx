import React, { useState, useEffect } from 'react';
import {
  sessionsApi,
  SessionResponse,
  SessionCreateRequest,
} from '../../api/sessions.api';
import { useAuthStore } from '../auth/useAuthStore';
import {
  PlusCircle,
  Play,
  StopCircle,
  Trash2,
  UploadCloud,
  Clock,
  RefreshCw,
} from 'lucide-react';

interface SessionManagementViewProps {
  selectedSessionId: string | null;
  onSelectSession: (session: SessionResponse | null) => void;
  onNavigateToIngestion: () => void;
}

export function SessionManagementView({
  selectedSessionId,
  onSelectSession,
  onNavigateToIngestion,
}: SessionManagementViewProps) {
  const { user } = useAuthStore();
  const isHOD = user?.roles.some((r) => r.toLowerCase() === 'hod') || false;
  const [sessions, setSessions] = useState<SessionResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New session form state
  const [formData, setFormData] = useState<SessionCreateRequest>({
    session_name: '',
    session_type: 'COMBINED',
    department_id: user?.department_id || undefined,
    academic_year: '2026-2027',
    expiry_hours: 24,
  });

  const fetchSessions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await sessionsApi.listSessions();
      setSessions(data);
      if (selectedSessionId) {
        const found = data.find((s) => s.session_id === selectedSessionId);
        if (found) onSelectSession(found);
      } else if (data.length > 0) {
        // Auto-select first active or created session
        const activeOne = data.find((s) => s.status === 'Active') || data[0];
        onSelectSession(activeOne);
      }
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'Failed to load sessions');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.session_name.trim()) return;

    try {
      const created = await sessionsApi.createSession(formData);
      setShowCreateModal(false);
      setFormData({
        session_name: '',
        session_type: 'COMBINED',
        department_id: user?.department_id || undefined,
        academic_year: '2026-2027',
        expiry_hours: 24,
      });
      await fetchSessions();
      onSelectSession(created);
    } catch (err: any) {
      alert(err?.response?.data?.error?.message || 'Failed to create session');
    }
  };

  const handleActivate = async (sessionId: string) => {
    try {
      const updated = await sessionsApi.activateSession(sessionId);
      setSessions((prev) => prev.map((s) => (s.session_id === sessionId ? updated : s)));
      if (selectedSessionId === sessionId) onSelectSession(updated);
    } catch (err: any) {
      alert(err?.response?.data?.error?.message || 'Failed to activate session');
    }
  };

  const handleClose = async (sessionId: string) => {
    if (!confirm('Are you sure you want to close this session? Further submissions will be blocked.')) return;
    try {
      const updated = await sessionsApi.closeSession(sessionId);
      setSessions((prev) => prev.map((s) => (s.session_id === sessionId ? updated : s)));
      if (selectedSessionId === sessionId) onSelectSession(updated);
    } catch (err: any) {
      alert(err?.response?.data?.error?.message || 'Failed to close session');
    }
  };

  const handlePurge = async (sessionId: string) => {
    if (!confirm('WARNING: Zero-retention purge. This will permanently delete this session and all its ephemeral assessment records across all buffers. Continue?')) return;
    try {
      await sessionsApi.purgeSession(sessionId);
      if (selectedSessionId === sessionId) onSelectSession(null);
      await fetchSessions();
    } catch (err: any) {
      alert(err?.response?.data?.error?.message || 'Failed to purge session');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Created':
      case 'Scheduled':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Closed':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Expired':
      case 'Cleaned':
      case 'PURGED':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Assessment Sessions</h2>
          <p className="text-xs text-slate-500">
            Ephemeral collection windows governed by TTL and zero permanent retention.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={fetchSessions}
            disabled={isLoading}
            className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 transition"
            title="Refresh Sessions"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Session</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs">
          {error}
        </div>
      )}

      {/* Sessions Table / Cards */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        {sessions.length === 0 ? (
          <div className="text-center py-12 px-4 space-y-3">
            <Clock className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">No active assessment sessions found</p>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Create a new assessment collection window to start ingesting datasets or sharing student assessment links.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-2 inline-flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>New Session</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {sessions.map((session) => {
              const isSelected = session.session_id === selectedSessionId;
              return (
                <div
                  key={session.session_id}
                  className={`p-4 transition flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    isSelected ? 'bg-blue-50/50 border-l-4 border-l-blue-600' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="space-y-1.5 flex-1 cursor-pointer" onClick={() => onSelectSession(session)}>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getStatusBadge(
                          session.status
                        )}`}
                      >
                        {session.status}
                      </span>
                      <span className="text-xs font-semibold text-slate-900">
                        {session.session_name}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                      <span>Type: <strong className="text-slate-700">{session.session_type}</strong></span>
                      <span>Dept: <strong className="text-slate-700">{session.department_name || 'Institutional'}</strong></span>
                      <span>Records: <strong className="text-slate-700">{session.record_count}</strong></span>
                      <span>Students: <strong className="text-slate-700">{session.student_count}</strong></span>
                      <span>Expires: <strong className="text-slate-700">{new Date(session.expiry_time).toLocaleString()}</strong></span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 shrink-0">
                    {session.status === 'Created' && (
                      <button
                        onClick={() => handleActivate(session.session_id)}
                        className="flex items-center space-x-1 px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-medium transition"
                        title="Activate Session"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>Activate</span>
                      </button>
                    )}

                    {session.status === 'Active' && (
                      <>
                        {isHOD && (
                          <button
                            onClick={() => {
                              onSelectSession(session);
                              onNavigateToIngestion();
                            }}
                            className="flex items-center space-x-1 px-2.5 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 rounded text-xs font-medium transition"
                            title="Import Bulk Dataset"
                          >
                            <UploadCloud className="w-3.5 h-3.5" />
                            <span>Import Data</span>
                          </button>
                        )}

                        <button
                          onClick={() => handleClose(session.session_id)}
                          className="flex items-center space-x-1 px-2.5 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 rounded text-xs font-medium transition"
                          title="Close Session"
                        >
                          <StopCircle className="w-3.5 h-3.5" />
                          <span>Close</span>
                        </button>
                      </>
                    )}

                    <button
                      onClick={() => handlePurge(session.session_id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition"
                      title="Purge Session (Zero Retention)"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Session Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Create Assessment Session</h3>
            <form onSubmit={handleCreateSession} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Session Title</label>
                <input
                  type="text"
                  required
                  value={formData.session_name}
                  onChange={(e) => setFormData({ ...formData, session_name: e.target.value })}
                  placeholder="e.g. Fall 2026 CSE Skill Intelligence Assessment"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Session Type</label>
                  <select
                    value={formData.session_type}
                    onChange={(e) => setFormData({ ...formData, session_type: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="COMBINED">Combined (Form & Upload)</option>
                    <option value="BULK_UPLOAD">Bulk Upload Only</option>
                    <option value="FORM_COLLECTION">Web Form Only</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">TTL Expiry (Hours)</label>
                  <input
                    type="number"
                    min={1}
                    max={168}
                    value={formData.expiry_hours}
                    onChange={(e) => setFormData({ ...formData, expiry_hours: parseInt(e.target.value) || 24 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Academic Year</label>
                <input
                  type="text"
                  value={formData.academic_year}
                  onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-500">
                <strong>ADR-001 Notice:</strong> A unique 256-bit HMAC secret is generated per session to securely pseudonymize student roll numbers. All raw references are discarded.
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition shadow-sm"
                >
                  Create Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
