import { useState, useEffect } from 'react';
import {
  governanceApi,
  ProposalResponse,
  ProposalDecisionRequest,
} from '../../api/governance.api';
import { sessionsApi, SessionResponse } from '../../api/sessions.api';
import {
  FileCheck2,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  ShieldCheck,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';

export function ProposalReviewPage() {
  const [sessions, setSessions] = useState<SessionResponse[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string>('');
  const [proposals, setProposals] = useState<ProposalResponse[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedProposal, setSelectedProposal] = useState<ProposalResponse | null>(null);
  const [remarks, setRemarks] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isActing, setIsActing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // 1. Fetch available sessions
  useEffect(() => {
    sessionsApi.listSessions().then((data) => {
      setSessions(data);
      if (data.length > 0) {
        const active = data.find((s) => s.status === 'Active') || data[0];
        setSelectedSessionId(active.session_id);
      }
    });
  }, []);

  // 2. Fetch proposals across all departments
  const loadProposals = async () => {
    if (!selectedSessionId) return;
    setIsLoading(true);
    setError(null);
    try {
      const list = await governanceApi.listProposals(selectedSessionId);
      setProposals(list);
      if (selectedProposal) {
        const updated = list.find((p) => p.proposal_id === selectedProposal.proposal_id);
        if (updated) setSelectedProposal(updated);
      }
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'Failed to load proposals for review.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProposals();
  }, [selectedSessionId]);

  const handleDecision = async (decision: 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED' | 'DEFERRED') => {
    if (!selectedProposal) return;
    setIsActing(true);
    setError(null);
    try {
      const payload: ProposalDecisionRequest = {
        decision,
        remarks: remarks.trim() || undefined,
      };
      const res = await governanceApi.recordDecision(selectedProposal.proposal_id, payload);
      setSelectedProposal(res);
      setSuccessMsg(`Proposal ${decision.toLowerCase()} successfully.`);
      setRemarks('');
      loadProposals();
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'Failed to record proposal decision.');
    } finally {
      setIsActing(false);
    }
  };

  const filteredProposals = proposals.filter((p) => {
    if (statusFilter === 'ALL') return true;
    return p.status === statusFilter;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Window Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 uppercase tracking-wider">
              Dean of Academic Affairs
            </span>
            <span className="text-xs text-slate-400">Institutional Governance & Intervention Approval</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            Department Development Proposals Review
          </h2>
          <p className="text-xs text-slate-500">
            Review, validate and approve departmental bootcamps, workshops and curriculum interventions.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-600">Active Window:</span>
            <select
              value={selectedSessionId}
              onChange={(e) => setSelectedSessionId(e.target.value)}
              className="px-3 py-1.5 border border-slate-200 bg-white rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            >
              {sessions.map((s) => (
                <option key={s.session_id} value={s.session_id}>
                  {s.session_name} ({s.academic_year} &bull; {s.session_type}) &bull; {s.status}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={loadProposals}
            disabled={isLoading || !selectedSessionId}
            className="p-1.5 text-slate-500 hover:text-blue-600 rounded-lg hover:bg-slate-100 border border-slate-200 transition"
            title="Refresh review list"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-900 text-xs flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Governance Scope Notice */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-start space-x-3">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-slate-800">ADR-002: Ephemeral Lifecycle & Offline Retention</p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Dean approval commits institutional sponsorship to the active session buffer. To retain permanent records
            prior to session purge, download the verified institutional report in the Export Center.
          </p>
        </div>
      </div>

      {/* Status Filter Chips */}
      <div className="flex flex-wrap items-center gap-2">
        {['ALL', 'SUBMITTED', 'APPROVED', 'CHANGES_REQUESTED', 'REJECTED', 'DRAFT'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition border ${
              statusFilter === st
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
            }`}
          >
            {st.replace('_', ' ')} (
            {st === 'ALL'
              ? proposals.length
              : proposals.filter((p) => p.status === st).length}
            )
          </button>
        ))}
      </div>

      {/* Split Review Workspace: List on Left, Detail on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Proposal List Column */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Department Proposals ({filteredProposals.length})
            </span>
          </div>

          <div className="max-h-[580px] overflow-y-auto divide-y divide-slate-100">
            {filteredProposals.map((prop) => {
              const isSelected = selectedProposal?.proposal_id === prop.proposal_id;
              return (
                <div
                  key={prop.proposal_id}
                  onClick={() => {
                    setSelectedProposal(prop);
                    setRemarks(prop.decision_remarks || '');
                  }}
                  className={`p-4 cursor-pointer transition text-xs space-y-1.5 ${
                    isSelected
                      ? 'bg-blue-50/70 border-l-4 border-blue-600'
                      : 'hover:bg-slate-50/80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{prop.department_code}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      prop.status === 'APPROVED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : prop.status === 'SUBMITTED'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {prop.status}
                    </span>
                  </div>
                  <p className="font-bold text-slate-800 line-clamp-1">{prop.proposal_title}</p>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>{prop.initiative_category} &bull; {prop.proposed_duration_weeks} Wks</span>
                    <span className="font-mono font-semibold text-slate-700">₹{prop.estimated_cost.toLocaleString()}</span>
                  </div>
                </div>
              );
            })}

            {filteredProposals.length === 0 && (
              <div className="p-8 text-center text-slate-400 text-xs">
                No proposals matching the selected filter.
              </div>
            )}
          </div>
        </div>

        {/* Detail & Decision Column */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5">
          {selectedProposal ? (
            <>
              {/* Proposal Header */}
              <div className="border-b border-slate-100 pb-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                    {selectedProposal.initiative_category}
                  </span>
                  <span className="text-xs font-mono text-slate-400">{selectedProposal.proposal_id}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900">{selectedProposal.proposal_title}</h3>
                <p className="text-xs text-slate-500">
                  {selectedProposal.department_name} ({selectedProposal.department_code}) &bull; Submitted by {selectedProposal.submitted_by || 'HOD'}
                </p>
              </div>

              {/* Proposal Specs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Target Cohort</span>
                  <p className="font-semibold text-slate-800 mt-0.5">{selectedProposal.target_cohort}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Duration</span>
                  <p className="font-semibold text-slate-800 mt-0.5">{selectedProposal.proposed_duration_weeks} Weeks</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Estimated Cost</span>
                  <p className="font-mono font-bold text-slate-900 mt-0.5">₹{selectedProposal.estimated_cost.toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Current Status</span>
                  <p className="font-bold text-blue-600 mt-0.5">{selectedProposal.status}</p>
                </div>
              </div>

              {/* Justification Rationale */}
              <div className="space-y-1.5 text-xs">
                <h4 className="font-bold text-slate-800">Explainable Rationale & Justification</h4>
                <p className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-slate-700 leading-relaxed">
                  {selectedProposal.justification}
                </p>
              </div>

              {/* Learning Outcomes */}
              <div className="space-y-2 text-xs">
                <h4 className="font-bold text-slate-800">Target Competencies & Learning Outcomes</h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedProposal.learning_outcomes.map((lo, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded bg-blue-50 text-blue-800 font-medium border border-blue-200"
                    >
                      {lo}
                    </span>
                  ))}
                </div>
              </div>

              {/* Dean Decision & Remarks Box */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Dean Institutional Decision
                </h4>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Institutional Remarks / Modification Guidance
                  </label>
                  <textarea
                    rows={3}
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Provide Dean remarks, budget approval conditions, or modification requirements..."
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    onClick={() => handleDecision('APPROVED')}
                    disabled={isActing}
                    className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition shadow-sm"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve Proposal</span>
                  </button>

                  <button
                    onClick={() => handleDecision('CHANGES_REQUESTED')}
                    disabled={isActing}
                    className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-amber-500 text-white rounded-lg text-xs font-bold hover:bg-amber-600 transition shadow-sm"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Request Changes</span>
                  </button>

                  <button
                    onClick={() => handleDecision('DEFERRED')}
                    disabled={isActing}
                    className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-slate-600 text-white rounded-lg text-xs font-bold hover:bg-slate-700 transition shadow-sm"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Defer Decision</span>
                  </button>

                  <button
                    onClick={() => handleDecision('REJECTED')}
                    disabled={isActing}
                    className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-700 transition shadow-sm"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="py-24 text-center text-slate-400 space-y-2">
              <FileCheck2 className="w-10 h-10 mx-auto text-slate-300" />
              <p className="text-xs font-medium text-slate-600">No proposal selected</p>
              <p className="text-[11px] text-slate-400">Select a proposal from the left list to inspect details and record decisions.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
