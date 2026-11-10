import { useState, useEffect } from 'react';
import {
  analysisApi,
  DepartmentSkillAnalytics,
  DepartmentGapReport,
} from '../../api/analysis.api';
import { sessionsApi, SessionResponse } from '../../api/sessions.api';
import { useAuthStore } from '../auth/useAuthStore';
import { SkillDistributionChart } from '../../components/charts/SkillDistributionChart';
import { ProficiencyBreakdownChart } from '../../components/charts/ProficiencyBreakdownChart';
import { SkillGapHeatmap } from '../../components/charts/SkillGapHeatmap';
import {
  Users,
  Target,
  Sparkles,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Layers,
  BookOpen,
  CheckCircle2,
  Clock,
  UploadCloud,
} from 'lucide-react';

interface DepartmentDashboardProps {
  onNavigateToRecommendations?: () => void;
  onNavigateToBenchmarks?: () => void;
  onNavigateToBulkUpload?: () => void;
  onNavigateToSectionEval?: () => void;
}

export function DepartmentDashboard({
  onNavigateToRecommendations,
  onNavigateToBenchmarks,
  onNavigateToBulkUpload,
  onNavigateToSectionEval,
}: DepartmentDashboardProps) {
  const { user } = useAuthStore();
  const departmentId = user?.department_id || 'DEPT-CSE';
  const departmentName = user?.department_name || 'Computer Science & Engineering';

  const [sessions, setSessions] = useState<SessionResponse[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string>('');
  const [analytics, setAnalytics] = useState<DepartmentSkillAnalytics | null>(null);
  const [gapReport, setGapReport] = useState<DepartmentGapReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  // 2. Fetch department analytics & gap reports
  const fetchDashboardData = async () => {
    if (!selectedSessionId) return;
    setIsLoading(true);
    setError(null);
    try {
      const [deptAnalytics, gaps] = await Promise.all([
        analysisApi.getDepartmentAnalytics(selectedSessionId, departmentId),
        analysisApi.getDepartmentGaps(selectedSessionId, departmentId, true),
      ]);
      setAnalytics(deptAnalytics);
      setGapReport(gaps);
    } catch (err: any) {
      setError(
        err?.response?.data?.error?.message ||
          'Failed to load department analytics. Ensure student assessment data is ingested.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [selectedSessionId, departmentId]);

  return (
    <div className="space-y-6">
      {/* Top Banner & Session Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 uppercase tracking-wider">
              Department Workspace (HOD)
            </span>
            <span className="text-xs text-slate-400">Department Code: {departmentId}</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            {departmentName}
          </h2>
          <p className="text-xs text-slate-500">
            Real-time cohort competency, 3-tier proficiency breakdown, and curriculum benchmark gaps.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onNavigateToBulkUpload && (
            <button
              onClick={onNavigateToBulkUpload}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Upload Section Sheet</span>
            </button>
          )}
          {onNavigateToSectionEval && (
            <button
              onClick={onNavigateToSectionEval}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 rounded-lg text-xs font-semibold transition"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Section Study &amp; Gap Eval</span>
            </button>
          )}
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-600">Active Session:</span>
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
            onClick={fetchDashboardData}
            disabled={isLoading || !selectedSessionId}
            className="p-1.5 text-slate-500 hover:text-blue-600 rounded-lg hover:bg-slate-100 border border-slate-200 transition"
            title="Refresh analytics"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{error}</span>
          </div>
          <span className="text-[11px] text-amber-700 font-medium">Session: {selectedSessionId}</span>
        </div>
      )}

      {/* Loading state */}
      {isLoading && !analytics && (
        <div className="py-16 text-center space-y-3">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-medium">Computing Department Competency Intelligence...</p>
        </div>
      )}

      {/* Analytics Content */}
      {analytics && (
        <>
          {/* Department KPI Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider">Eligible Students</span>
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-2xl font-black text-slate-900">{analytics.total_eligible_students}</p>
              <p className="text-[11px] text-slate-500 mt-1">Total registered in department</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider">Assessed Students</span>
                <Sparkles className="w-4 h-4 text-indigo-600" />
              </div>
              <p className="text-2xl font-black text-slate-900">{analytics.participating_students}</p>
              <p className="text-[11px] text-slate-500 mt-1">Unique session pseudonyms</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider">Participation Rate</span>
                <Target className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-2xl font-black text-emerald-600">
                {analytics.participation_rate.toFixed(1)}%
              </p>
              <p className="text-[11px] text-slate-500 mt-1">Cohort turnout in active session</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider">Skills Assessed</span>
                <Layers className="w-4 h-4 text-purple-600" />
              </div>
              <p className="text-2xl font-black text-slate-900">{analytics.skills_count}</p>
              <p className="text-[11px] text-slate-500 mt-1">Distinct canonical skills</p>
            </div>
          </div>

          {/* Benchmark Gap Overview Cards */}
          {gapReport && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-red-50/60 border border-red-200 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold text-red-800 uppercase tracking-wider">Critical Gaps</p>
                  <p className="text-2xl font-black text-red-700 mt-0.5">{gapReport.critical_gaps_count}</p>
                  <p className="text-[11px] text-red-600 mt-0.5">High-priority core deficits</p>
                </div>
                <div className="p-3 bg-red-100 rounded-xl">
                  <AlertTriangle className="w-5 h-5 text-red-700" />
                </div>
              </div>

              <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">Moderate Gaps</p>
                  <p className="text-2xl font-black text-amber-700 mt-0.5">{gapReport.moderate_gaps_count}</p>
                  <p className="text-[11px] text-amber-600 mt-0.5">Secondary skill improvements</p>
                </div>
                <div className="p-3 bg-amber-100 rounded-xl">
                  <Clock className="w-5 h-5 text-amber-700" />
                </div>
              </div>

              <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Satisfied Benchmarks</p>
                  <p className="text-2xl font-black text-emerald-700 mt-0.5">{gapReport.satisfied_count}</p>
                  <p className="text-[11px] text-emerald-600 mt-0.5">Meeting or exceeding targets</p>
                </div>
                <div className="p-3 bg-emerald-100 rounded-xl">
                  <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                </div>
              </div>
            </div>
          )}

          {/* Primary Charts: Coverage & 3-Tier Proficiency */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-slate-800">
                Top Evaluated Skills ({analytics.department_code})
              </h3>
              <SkillDistributionChart
                data={analytics.skills.slice(0, 10).map((s) => ({
                  skill_name: s.skill_name,
                  student_count: s.student_count,
                  coverage_percentage: s.coverage_percentage,
                  average_numeric_proficiency: s.average_numeric_proficiency,
                }))}
              />
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-slate-800">
                3-Tier Proficiency Distribution
              </h3>
              <ProficiencyBreakdownChart
                data={analytics.skills.slice(0, 10)}
              />
            </div>
          </div>

          {/* Skill Gap Matrix Heatmap */}
          {gapReport && gapReport.gaps.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
                  <Target className="w-4 h-4 text-blue-600" />
                  <span>Curriculum Benchmark Evaluation Matrix ({gapReport.department_code})</span>
                </h3>
                {onNavigateToBenchmarks && (
                  <button
                    onClick={onNavigateToBenchmarks}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                  >
                    <span>Manage Benchmarks</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <SkillGapHeatmap gaps={gapReport.gaps} />
              </div>
            </div>
          )}

          {/* Quick Action Navigation Card */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-blue-950 flex items-center space-x-1.5">
                <BookOpen className="w-4 h-4 text-blue-600" />
                <span>Explainable Development Interventions Ready</span>
              </h4>
              <p className="text-xs text-blue-800">
                The recommendation engine has mapped these identified deficits to targeted department bootcamps and workshops.
              </p>
            </div>
            {onNavigateToRecommendations && (
              <button
                onClick={onNavigateToRecommendations}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 shadow-sm transition whitespace-nowrap self-start sm:self-auto"
              >
                <span>Review Recommended Events</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </>
      )}

      {/* Ephemeral Architecture Notice */}
      <div className="text-[11px] text-slate-400 border-t border-slate-100 pt-3 flex items-center justify-between">
        <span>Jeppiaar University SSIP &bull; Zero-Retention Ephemeral Privacy</span>
        <span>HMAC-SHA256 Pseudonymized Sessions</span>
      </div>
    </div>
  );
}
