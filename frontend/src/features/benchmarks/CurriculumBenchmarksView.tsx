import { useState, useEffect } from 'react';
import { analysisApi, BenchmarkResponse } from '../../api/analysis.api';
import { useAuthStore } from '../auth/useAuthStore';
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  BookOpen,
  RefreshCw,
} from 'lucide-react';

export function CurriculumBenchmarksView() {
  const { user } = useAuthStore();
  const [benchmarks, setBenchmarks] = useState<BenchmarkResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const isDeanOrAdmin =
    user?.roles.some((r) => ['dean', 'administrator'].includes(r.toLowerCase())) || false;

  const fetchBenchmarks = async () => {
    setIsLoading(true);
    try {
      const data = await analysisApi.listBenchmarks();
      setBenchmarks(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBenchmarks();
  }, []);

  const handleBulkApprove = async () => {
    if (!confirm('Officially approve candidate curriculum benchmarks for institutional gap computation (ADR-008)?')) return;

    setIsApproving(true);
    setMessage(null);
    try {
      const res = await analysisApi.bulkApproveBenchmarks(
        'DEPT-CSE',
        'Approved by Academic Affairs for active cohort skill gap analysis.'
      );
      setMessage(`Successfully approved ${res.approved_count} benchmarks.`);
      await fetchBenchmarks();
    } catch (err: any) {
      alert(err?.response?.data?.error?.message || 'Failed to approve benchmarks.');
    } finally {
      setIsApproving(false);
    }
  };

  const handleSingleApprove = async (mappingId: string) => {
    try {
      await analysisApi.approveBenchmark(
        mappingId,
        'Officially approved by Dean of Academic Affairs.'
      );
      await fetchBenchmarks();
    } catch (err: any) {
      alert(err?.response?.data?.error?.message || 'Failed to approve benchmark.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Curriculum Skill Benchmarks & Institutional Approval
          </h2>
          <p className="text-xs text-slate-500">
            Governed by ADR-008: Candidate benchmarks remain in DRAFT until formally approved by Academic Affairs.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={fetchBenchmarks}
            disabled={isLoading}
            className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 transition"
            title="Refresh Benchmarks"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          {isDeanOrAdmin && (
            <button
              onClick={handleBulkApprove}
              disabled={isApproving}
              className="flex items-center space-x-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isApproving ? 'Approving...' : 'Bulk Approve Benchmarks (ADR-008)'}</span>
            </button>
          )}
        </div>
      </div>

      {message && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Benchmarks Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-4 h-4 text-blue-600" />
            <h4 className="text-xs font-bold text-slate-800">
              Department Curriculum Competency Baselines
            </h4>
          </div>
          <span className="text-[11px] text-slate-500">
            Total {benchmarks.length} registered mappings
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-600">
              <tr>
                <th className="p-2.5">Department</th>
                <th className="p-2.5">Competency Skill</th>
                <th className="p-2.5">Relevance</th>
                <th className="p-2.5">Target Proficiency</th>
                <th className="p-2.5">Min Coverage</th>
                <th className="p-2.5">Weight</th>
                <th className="p-2.5">ADR-008 Status</th>
                {isDeanOrAdmin && <th className="p-2.5 text-right">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {benchmarks.map((b) => (
                <tr key={b.mapping_id} className="hover:bg-slate-50">
                  <td className="p-2.5 font-semibold text-slate-700">{b.department_code}</td>
                  <td className="p-2.5 font-bold text-slate-900">{b.skill_name}</td>
                  <td className="p-2.5 text-slate-600">{b.relevance_type}</td>
                  <td className="p-2.5 font-mono text-slate-800">{b.target_proficiency.toFixed(1)}</td>
                  <td className="p-2.5 font-mono text-slate-800">{b.minimum_coverage.toFixed(0)}%</td>
                  <td className="p-2.5 font-mono text-slate-800">{b.priority_weight.toFixed(1)}x</td>
                  <td className="p-2.5">
                    <span
                      className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                        b.status === 'APPROVED'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}
                    >
                      {b.status === 'APPROVED' ? (
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <Clock className="w-3 h-3 text-amber-600" />
                      )}
                      <span>{b.status}</span>
                    </span>
                  </td>
                  {isDeanOrAdmin && (
                    <td className="p-2.5 text-right">
                      {b.status === 'DRAFT' ? (
                        <button
                          onClick={() => handleSingleApprove(b.mapping_id)}
                          className="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded text-[11px] font-semibold transition"
                        >
                          Approve
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-medium">Approved</span>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
