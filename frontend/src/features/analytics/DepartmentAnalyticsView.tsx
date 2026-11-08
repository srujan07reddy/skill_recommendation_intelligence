import { useState, useEffect } from 'react';
import {
  analysisApi,
  DepartmentSkillAnalytics,
  DepartmentGapReport,
} from '../../api/analysis.api';
import { useAuthStore } from '../auth/useAuthStore';
import {
  Users,
  Target,
  AlertTriangle,
  TrendingUp,
  Sparkles,
  RefreshCw,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';

interface DepartmentAnalyticsViewProps {
  sessionId: string;
  defaultDepartmentId?: string;
}

export function DepartmentAnalyticsView({
  sessionId,
  defaultDepartmentId = 'DEPT-CSE',
}: DepartmentAnalyticsViewProps) {
  const { user } = useAuthStore();
  const [departmentId, setDepartmentId] = useState(
    user?.department_id || defaultDepartmentId
  );
  const [analytics, setAnalytics] = useState<DepartmentSkillAnalytics | null>(null);
  const [gapReport, setGapReport] = useState<DepartmentGapReport | null>(null);
  const [includeDraft, setIncludeDraft] = useState(true); // ADR-008 simulation toggle
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const [skillsData, gapsData] = await Promise.all([
        analysisApi.getDepartmentAnalytics(sessionId, departmentId),
        analysisApi.getDepartmentGaps(sessionId, departmentId, includeDraft),
      ]);
      setAnalytics(skillsData);
      setGapReport(gapsData);
    } catch (err: any) {
      setErrorMessage(
        err?.response?.data?.error?.message ||
        'Failed to load departmental skill intelligence or gap analysis.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [sessionId, departmentId, includeDraft]);

  const getSeverityBadge = (severity: string) => {
    switch (severity.toUpperCase()) {
      case 'CRITICAL':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'MODERATE':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'MINOR':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'SATISFIED':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Department Skill Intelligence & Benchmark Gap Analysis
          </h2>
          <p className="text-xs text-slate-500">
            Aggregated cohort distributions and curriculum benchmark evaluation (ADR-007, ADR-008).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {!user?.department_id && (
            <select
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              className="px-3 py-1.5 border border-slate-200 bg-white rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="DEPT-CSE">CSE Department</option>
              <option value="DEPT-ECE">ECE Department</option>
              <option value="DEPT-MECH">Mechanical Department</option>
              <option value="DEPT-CIVIL">Civil Department</option>
              <option value="DEPT-IT">IT Department</option>
            </select>
          )}

          {/* ADR-008 Simulation Toggle */}
          <button
            onClick={() => setIncludeDraft(!includeDraft)}
            className="flex items-center space-x-1.5 px-3 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-700 transition"
            title="Toggle evaluating candidate DRAFT curriculum benchmarks (ADR-008)"
          >
            {includeDraft ? (
              <ToggleRight className="w-4 h-4 text-blue-600" />
            ) : (
              <ToggleLeft className="w-4 h-4 text-slate-400" />
            )}
            <span>Include DRAFT Benchmarks</span>
          </button>

          <button
            onClick={fetchAnalytics}
            disabled={isLoading}
            className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 transition"
            title="Refresh Analysis"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs">
          {errorMessage}
        </div>
      )}

      {/* KPI Cards */}
      {analytics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <p className="text-xs text-slate-500 font-medium flex items-center space-x-1">
              <Users className="w-3.5 h-3.5 text-blue-600" />
              <span>Participating Cohort</span>
            </p>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              {analytics.participating_students}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {analytics.participation_rate}% of {analytics.total_eligible_students} eligible students
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <p className="text-xs text-slate-500 font-medium flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Skills Assessed</span>
            </p>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              {analytics.skills_count}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">Across canonical taxonomy</p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <p className="text-xs text-slate-500 font-medium flex items-center space-x-1">
              <Target className="w-3.5 h-3.5 text-indigo-600" />
              <span>Benchmarks Evaluated</span>
            </p>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              {gapReport?.benchmarks_evaluated || 0}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {gapReport?.approved_benchmarks_count || 0} Approved • {gapReport?.draft_benchmarks_count || 0} Draft
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <p className="text-xs text-slate-500 font-medium flex items-center space-x-1">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
              <span>Critical Gaps Identified</span>
            </p>
            <p className="text-2xl font-bold text-rose-700 mt-1">
              {gapReport?.critical_gaps_count || 0}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {gapReport?.moderate_gaps_count || 0} moderate • {gapReport?.satisfied_count || 0} satisfied
            </p>
          </div>
        </div>
      )}

      {/* Curriculum Benchmark Gap Table */}
      {gapReport && gapReport.gaps.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Target className="w-4 h-4 text-indigo-600" />
              <h4 className="text-xs font-bold text-slate-800">
                Curriculum Benchmark Gap Analysis ({gapReport.gaps.length} Competencies)
              </h4>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">
              Gap Score = max(0, Target - Actual) × Weight
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-600">
                <tr>
                  <th className="p-2.5">Competency</th>
                  <th className="p-2.5">Relevance</th>
                  <th className="p-2.5">Target Prof.</th>
                  <th className="p-2.5">Observed Prof.</th>
                  <th className="p-2.5">Target Cov.</th>
                  <th className="p-2.5">Observed Cov.</th>
                  <th className="p-2.5">Gap Score</th>
                  <th className="p-2.5">Severity</th>
                  <th className="p-2.5">ADR-008 Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {gapReport.gaps.map((g, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="p-2.5 font-bold text-slate-900">{g.skill_name}</td>
                    <td className="p-2.5 text-slate-600 font-medium">{g.relevance_type}</td>
                    <td className="p-2.5 font-mono text-slate-700">{g.target_proficiency.toFixed(1)}</td>
                    <td className="p-2.5 font-mono text-slate-700">{g.actual_average_proficiency.toFixed(2)}</td>
                    <td className="p-2.5 font-mono text-slate-700">{g.target_coverage.toFixed(0)}%</td>
                    <td className="p-2.5 font-mono text-slate-700">{g.actual_coverage.toFixed(1)}%</td>
                    <td className="p-2.5 font-mono font-bold text-indigo-700">{g.gap_score.toFixed(2)}</td>
                    <td className="p-2.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getSeverityBadge(
                          g.gap_severity
                        )}`}
                      >
                        {g.gap_severity}
                      </span>
                    </td>
                    <td className="p-2.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${g.benchmark_status === 'APPROVED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                          }`}
                      >
                        {g.benchmark_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Observed Skills & 3-Tier Proficiency Distribution Table */}
      {analytics && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <h4 className="text-xs font-bold text-slate-800">
                Cohort Skill Penetration & 3-Tier Proficiency Split (ADR-007)
              </h4>
            </div>
            <span className="text-[11px] text-slate-500">
              Strictly Beginners (1.0), Intermediate (2.0), Expert (3.0)
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-600">
                <tr>
                  <th className="p-2.5">Skill Name</th>
                  <th className="p-2.5">Category</th>
                  <th className="p-2.5">Students</th>
                  <th className="p-2.5">Coverage %</th>
                  <th className="p-2.5">Avg Score</th>
                  <th className="p-2.5 min-w-[220px]">
                    Proficiency Split (Beg / Inter / Exp)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {analytics.skills.map((s, idx) => {
                  const dist = s.proficiency_distribution;
                  return (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-2.5 font-bold text-slate-900">{s.skill_name}</td>
                      <td className="p-2.5 text-slate-500">{s.category_name}</td>
                      <td className="p-2.5 font-mono text-slate-800">{s.student_count}</td>
                      <td className="p-2.5 font-mono font-semibold text-slate-800">
                        {s.coverage_percentage.toFixed(1)}%
                      </td>
                      <td className="p-2.5 font-mono font-bold text-blue-700">
                        {s.average_numeric_proficiency.toFixed(2)}
                      </td>
                      <td className="p-2.5">
                        <div className="space-y-1">
                          <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                            <div
                              style={{ width: `${dist.beginner_percentage}%` }}
                              className="bg-blue-300"
                              title={`Beginner: ${dist.beginner_percentage}%`}
                            />
                            <div
                              style={{ width: `${dist.intermediate_percentage}%` }}
                              className="bg-blue-600"
                              title={`Intermediate: ${dist.intermediate_percentage}%`}
                            />
                            <div
                              style={{ width: `${dist.expert_percentage}%` }}
                              className="bg-indigo-900"
                              title={`Expert: ${dist.expert_percentage}%`}
                            />
                          </div>
                          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                            <span>Beg: {dist.beginner_count} ({dist.beginner_percentage}%)</span>
                            <span>Int: {dist.intermediate_count} ({dist.intermediate_percentage}%)</span>
                            <span>Exp: {dist.expert_count} ({dist.expert_percentage}%)</span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
