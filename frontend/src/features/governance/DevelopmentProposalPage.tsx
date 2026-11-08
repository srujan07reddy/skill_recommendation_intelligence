import { useState, useEffect } from 'react';
import {
  governanceApi,
  ProposalResponse,
  ProposalCreateRequest,
} from '../../api/governance.api';
import { sessionsApi, SessionResponse } from '../../api/sessions.api';
import { recommendationsApi, RecommendationResponse } from '../../api/recommendations.api';
import { useAuthStore } from '../auth/useAuthStore';
import {
  FileCheck2,
  Plus,
  Send,
  AlertTriangle,
  Clock,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RefreshCw,
} from 'lucide-react';

export function DevelopmentProposalPage() {
  const { user } = useAuthStore();
  const departmentId = user?.department_id || 'DEPT-CSE';
  const departmentName = user?.department_name || 'Computer Science & Engineering';

  const [sessions, setSessions] = useState<SessionResponse[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string>('');
  const [proposals, setProposals] = useState<ProposalResponse[]>([]);
  const [recommendations, setRecommendations] = useState<RecommendationResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState<ProposalCreateRequest>({
    session_id: '',
    department_id: departmentId,
    proposal_title: '',
    initiative_category: 'WORKSHOP',
    target_cohort: `${departmentName} 3rd & 4th Year Cohort`,
    learning_outcomes: ['Core Competency Mastery', 'Hands-on Implementation'],
    justification: '',
    proposed_duration_weeks: 2,
    estimated_cost: 25000,
    recommendation_id: null,
  });
  const [newOutcome, setNewOutcome] = useState('');

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

  // 2. Fetch proposals & recommendations when session changes
  const loadData = async () => {
    if (!selectedSessionId) return;
    setIsLoading(true);
    setError(null);
    try {
      const [propsList, recsSummary] = await Promise.all([
        governanceApi.listProposals(selectedSessionId, departmentId),
        recommendationsApi.getDepartmentRecommendations(selectedSessionId, departmentId).catch(() => null),
      ]);
      setProposals(propsList);
      setRecommendations(recsSummary?.recommendations || []);
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'Failed to load governance proposals.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    setFormData((prev) => ({
      ...prev,
      session_id: selectedSessionId,
      department_id: departmentId,
    }));
  }, [selectedSessionId, departmentId]);

  const handlePreFillRecommendation = (rec: RecommendationResponse) => {
    const durNum = parseInt(rec.suggested_duration) || 2;
    setFormData({
      session_id: selectedSessionId,
      department_id: departmentId,
      proposal_title: rec.recommendation_title,
      initiative_category: (rec.initiative_category as any) || 'WORKSHOP',
      target_cohort: rec.target_cohort,
      learning_outcomes: rec.learning_objectives.length > 0 ? rec.learning_objectives : ['Competency Building'],
      justification: rec.justification,
      proposed_duration_weeks: durNum,
      estimated_cost: rec.initiative_category === 'BOOTCAMP' ? 45000 : 25000,
      recommendation_id: rec.recommendation_id,
    });
    setShowCreateModal(true);
  };

  const handleCreateProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.proposal_title.trim() || !formData.justification.trim()) {
      setError('Please provide proposal title and explainable justification.');
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      await governanceApi.createProposal(formData);
      setSuccessMsg('Proposal drafted successfully!');
      setShowCreateModal(false);
      loadData();
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'Failed to create proposal.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitToDean = async (proposalId: string) => {
    if (!confirm('Are you sure you want to submit this development proposal to the Dean of Academic Affairs?')) {
      return;
    }
    try {
      await governanceApi.submitProposal(proposalId);
      setSuccessMsg('Proposal formally submitted for Dean institutional review.');
      loadData();
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'Failed to submit proposal.');
    }
  };

  const addOutcome = () => {
    if (newOutcome.trim()) {
      setFormData((prev) => ({
        ...prev,
        learning_outcomes: [...prev.learning_outcomes, newOutcome.trim()],
      }));
      setNewOutcome('');
    }
  };

  const removeOutcome = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      learning_outcomes: prev.learning_outcomes.filter((_, i) => i !== index),
    }));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center space-x-1"><CheckCircle2 className="w-3 h-3" /><span>Approved</span></span>;
      case 'SUBMITTED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 flex items-center space-x-1"><Send className="w-3 h-3" /><span>Submitted</span></span>;
      case 'UNDER_REVIEW':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 flex items-center space-x-1"><Clock className="w-3 h-3" /><span>Under Review</span></span>;
      case 'CHANGES_REQUESTED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 flex items-center space-x-1"><HelpCircle className="w-3 h-3" /><span>Changes Requested</span></span>;
      case 'REJECTED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 flex items-center space-x-1"><XCircle className="w-3 h-3" /><span>Rejected</span></span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">Draft</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Window Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 uppercase tracking-wider">
              HOD Governance Workspace
            </span>
            <span className="text-xs text-slate-400">Department: {departmentName}</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            Department Student Development Proposals
          </h2>
          <p className="text-xs text-slate-500">
            Formulate curriculum interventions, bootcamps, and workshops addressed to the Dean of Academic Affairs.
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
            onClick={loadData}
            disabled={isLoading || !selectedSessionId}
            className="p-1.5 text-slate-500 hover:text-blue-600 rounded-lg hover:bg-slate-100 border border-slate-200 transition"
            title="Refresh proposals"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Proposal</span>
          </button>
        </div>
      </div>

      {/* Messages */}
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

      {/* Ephemeral Governance Notice (ADR-002) */}
      <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-4 flex items-start space-x-3 text-xs text-blue-900">
        <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-blue-950">ADR-002: Ephemeral Session Governance Scope</p>
          <p className="text-blue-800 text-[11px] mt-0.5">
            Development proposals and Dean decisions are ephemeral and stored within the active assessment session buffer.
            Upon session expiration or purge, records are erased from the server. Once approved by the Dean, please export
            and download the institutional PDF/Excel report from the Export Center to retain offline records.
          </p>
        </div>
      </div>

      {/* Recommended Interventions Quick Selector */}
      {recommendations.length > 0 && (
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Algorithmic Recommendations Available ({recommendations.length})</span>
            </h4>
            <span className="text-[11px] text-slate-400">Click to convert into formal HOD proposal</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {recommendations.slice(0, 4).map((rec) => (
              <div
                key={rec.recommendation_id}
                onClick={() => handlePreFillRecommendation(rec)}
                className="bg-white p-3 rounded-lg border border-slate-200 hover:border-blue-400 hover:shadow-sm cursor-pointer transition space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                    {rec.initiative_category}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {rec.suggested_duration}
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-900">{rec.recommendation_title}</p>
                <p className="text-[11px] text-slate-500 line-clamp-2">{rec.justification}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Proposals List Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-2">
            <FileCheck2 className="w-4 h-4 text-blue-600" />
            <span>Active Department Proposals ({proposals.length})</span>
          </h4>
          <span className="text-[11px] text-slate-400">Session ID: {selectedSessionId}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Title & Initiative</th>
                <th className="py-3 px-4">Target Cohort</th>
                <th className="py-3 px-4 text-center">Duration</th>
                <th className="py-3 px-4 text-right">Est. Budget</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4">Dean Remarks</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {proposals.map((prop) => (
                <tr key={prop.proposal_id} className="hover:bg-slate-50/60 transition">
                  <td className="py-3 px-4">
                    <p className="font-bold text-slate-900">{prop.proposal_title}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{prop.initiative_category} &bull; {prop.proposal_id}</p>
                  </td>
                  <td className="py-3 px-4 text-slate-600">{prop.target_cohort}</td>
                  <td className="py-3 px-4 text-center font-medium">{prop.proposed_duration_weeks} wks</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                    ₹{prop.estimated_cost.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {getStatusBadge(prop.status)}
                  </td>
                  <td className="py-3 px-4 text-slate-500 max-w-xs truncate">
                    {prop.decision_remarks || <span className="text-slate-300 italic">Pending review</span>}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {prop.status === 'DRAFT' || prop.status === 'CHANGES_REQUESTED' ? (
                      <button
                        onClick={() => handleSubmitToDean(prop.proposal_id)}
                        className="inline-flex items-center space-x-1 px-2.5 py-1 bg-emerald-600 text-white rounded text-[11px] font-bold hover:bg-emerald-700 transition"
                      >
                        <Send className="w-3 h-3" />
                        <span>Submit to Dean</span>
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">Locked</span>
                    )}
                  </td>
                </tr>
              ))}

              {proposals.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">
                    No proposals submitted yet for this assessment window. Click "New Proposal" to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Proposal Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Create Development Proposal</h3>
                <p className="text-xs text-slate-500">Draft intervention addressed to Dean of Academic Affairs</p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateProposal} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Proposal Title</label>
                <input
                  type="text"
                  required
                  value={formData.proposal_title}
                  onChange={(e) => setFormData({ ...formData, proposal_title: e.target.value })}
                  placeholder="e.g. Deep Learning with PyTorch Hands-On Bootcamp"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Initiative Category</label>
                  <select
                    value={formData.initiative_category}
                    onChange={(e) => setFormData({ ...formData, initiative_category: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                  >
                    <option value="BOOTCAMP">BOOTCAMP (Critical Core)</option>
                    <option value="WORKSHOP">WORKSHOP (Skill Broadening)</option>
                    <option value="CERTIFICATION_PREP">CERTIFICATION_PREP (Advanced)</option>
                    <option value="PRACTICAL_LAB">PRACTICAL_LAB (Experiential)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Duration (Weeks)</label>
                  <input
                    type="number"
                    min={1}
                    max={16}
                    value={formData.proposed_duration_weeks}
                    onChange={(e) => setFormData({ ...formData, proposed_duration_weeks: parseInt(e.target.value) || 2 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Cohort</label>
                  <input
                    type="text"
                    required
                    value={formData.target_cohort}
                    onChange={(e) => setFormData({ ...formData, target_cohort: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Estimated Budget (₹ INR)</label>
                  <input
                    type="number"
                    min={0}
                    step={1000}
                    value={formData.estimated_cost}
                    onChange={(e) => setFormData({ ...formData, estimated_cost: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Explainable Justification (Referencing Gaps)</label>
                <textarea
                  required
                  rows={3}
                  value={formData.justification}
                  onChange={(e) => setFormData({ ...formData, justification: e.target.value })}
                  placeholder="Explain why this intervention is needed based on cohort assessment benchmark deficits..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Learning Outcomes Tagging */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Learning Outcomes & Competencies</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newOutcome}
                    onChange={(e) => setNewOutcome(e.target.value)}
                    placeholder="Add learning outcome..."
                    className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addOutcome();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={addOutcome}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-xs"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {formData.learning_outcomes.map((item, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-blue-50 text-blue-800 text-[11px] font-medium border border-blue-200"
                    >
                      <span>{item}</span>
                      <button
                        type="button"
                        onClick={() => removeOutcome(index)}
                        className="text-blue-500 hover:text-blue-700 font-bold ml-1"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition"
                >
                  {isSubmitting ? 'Saving Draft...' : 'Save Draft Proposal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
