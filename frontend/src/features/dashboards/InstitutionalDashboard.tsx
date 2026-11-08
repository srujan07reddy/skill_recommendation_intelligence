import { useState, useEffect, useMemo } from 'react';
import {
  analysisApi,
  InstitutionalSkillAnalytics,
  InstitutionalGapReport,
} from '../../api/analysis.api';
import { sessionsApi, SessionResponse } from '../../api/sessions.api';
import { adminApi, SchoolItem } from '../../api/admin.api';
import { useAuthStore } from '../auth/useAuthStore';
import { SkillDistributionChart } from '../../components/charts/SkillDistributionChart';
import { ProficiencyBreakdownChart } from '../../components/charts/ProficiencyBreakdownChart';
import { SkillGapHeatmap } from '../../components/charts/SkillGapHeatmap';
import {
  Building2,
  Users,
  Sparkles,
  Target,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  Layers,
} from 'lucide-react';

interface InstitutionalDashboardProps {
  onNavigateToComparison: () => void;
  onNavigateToRecommendations: () => void;
}

export function InstitutionalDashboard({
  onNavigateToComparison,
  onNavigateToRecommendations,
}: InstitutionalDashboardProps) {
  const [sessions, setSessions] = useState<SessionResponse[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string>('');
  const [schools, setSchools] = useState<SchoolItem[]>([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>('ALL');
  const [analytics, setAnalytics] = useState<InstitutionalSkillAnalytics | null>(null);
  const [gapReport, setGapReport] = useState<InstitutionalGapReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuthStore();
  const userRoles = useMemo(() => user?.roles.map((r) => r.toLowerCase()) || [], [user]);
  const isAdmin = userRoles.includes('administrator');

  // Load available schools for Administrator overall view
  useEffect(() => {
    if (isAdmin) {
      adminApi.getAcademicStructure().then(setSchools).catch(() => {});
    }
  }, [isAdmin]);

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

  // 2. Fetch institutional analytics when session or school filter changes
  const fetchDashboardData = async () => {
    if (!selectedSessionId) return;
    setIsLoading(true);
    setError(null);
    try {
      const schoolFilter = isAdmin && selectedSchoolId !== 'ALL' ? selectedSchoolId : undefined;
      const [distData, gapsData] = await Promise.all([
        analysisApi.getInstitutionalDistribution(selectedSessionId, schoolFilter),
        analysisApi.getInstitutionalGaps(selectedSessionId, true), // include draft for complete visibility
      ]);
      setAnalytics(distData);
      setGapReport(gapsData);
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'Failed to load institutional analytics.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [selectedSessionId, selectedSchoolId]);

  return (
    <div className="space-y-6">
      {/* Top Banner & Session Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                isAdmin
                  ? 'bg-purple-100 text-purple-800'
                  : 'bg-blue-100 text-blue-800'
              }`}
            >
              {isAdmin
                ? 'Administrator Overall Scope'
                : `${user?.school_name || 'School'} Dean Scope`}
            </span>
            <span className="text-xs text-slate-400">
              {isAdmin
                ? 'University-Wide Multi-School Intelligence'
                : `Dedicated Scope: ${user?.school_name || 'Assigned School'}`}
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            {isAdmin
              ? 'University Overall Skill Intelligence'
              : `${user?.school_name || 'School'} Skill Intelligence Dashboard`}
          </h2>
          <p className="text-xs text-slate-500">
            {isAdmin
              ? 'Comprehensive cross-school cohort competency analytics and curriculum monitoring.'
              : `Departmental cohort competency analytics and benchmark monitoring for ${
                  user?.school_name || 'your assigned school'
                }.`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Admin-only School Switcher */}
          {isAdmin && schools.length > 0 && (
            <div className="flex items-center space-x-1.5">
              <span className="text-xs font-semibold text-slate-600">School:</span>
              <select
                value={selectedSchoolId}
                onChange={(e) => setSelectedSchoolId(e.target.value)}
                className="px-2.5 py-1.5 border border-slate-200 bg-white rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-sm"
              >
                <option value="ALL">All Schools ({schools.length})</option>
                {schools.map((sch) => (
                  <option key={sch.school_id} value={sch.school_id}>
                    {sch.school_name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-600">Active Window:</span>
            <select
              value={selectedSessionId}
              onChange={(e) => setSelectedSessionId(e.target.value)}
              className="px-3 py-1.5 border border-slate-200 bg-white rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            >
              {sessions.map((s) => (
                <option key={s.session_id} value={s.session_id}>
                  {s.session_name} ({s.status})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={fetchDashboardData}
            disabled={isLoading}
            className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 transition"
            title="Refresh Dashboard"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs">
          {error}
        </div>
      )}

      {/* University KPI Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <p className="text-xs text-slate-500 font-medium flex items-center space-x-1.5">
            <Users className="w-3.5 h-3.5 text-blue-600" />
            <span>Participating Students</span>
          </p>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            {analytics?.total_participating_students || 0}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Distinct students across schools
          </p>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <p className="text-xs text-slate-500 font-medium flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Assessed Competencies</span>
          </p>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            {analytics?.distinct_skills_evaluated || 0}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">Across canonical taxonomy</p>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <p className="text-xs text-slate-500 font-medium flex items-center space-x-1.5">
            <Target className="w-3.5 h-3.5 text-indigo-600" />
            <span>Benchmarks Evaluated</span>
          </p>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            {gapReport?.total_benchmarks_evaluated || 0}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Approved & candidate targets
          </p>
        </div>

        <div className="bg-rose-50/60 p-4 rounded-xl border border-rose-200">
          <p className="text-xs text-rose-700 font-semibold flex items-center space-x-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            <span>Critical Deficits</span>
          </p>
          <p className="text-2xl font-bold text-rose-800 mt-1">
            {gapReport?.total_critical_gaps || 0}
          </p>
          <p className="text-[11px] text-rose-600 mt-0.5">
            Requiring institutional action
          </p>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Institutional Skills Distribution */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wide">
                Top Skills by Student Penetration (%)
              </h3>
            </div>
            <span className="text-[11px] text-slate-400">University-wide coverage</span>
          </div>

          <SkillDistributionChart
            data={analytics?.top_skills || []}
            metric="coverage"
            height={260}
          />
        </div>

        {/* 3-Tier Proficiency Split */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center space-x-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wide">
                3-Tier Proficiency Distribution (ADR-007)
              </h3>
            </div>
            <span className="text-[11px] text-slate-400">Beg (1.0) / Inter (2.0) / Exp (3.0)</span>
          </div>

          <ProficiencyBreakdownChart
            data={analytics?.top_skills || []}
            height={260}
          />
        </div>
      </div>

      {/* Department Performance Overview Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Building2 className="w-4 h-4 text-blue-600" />
            <h4 className="text-xs font-bold text-slate-800">
              Departmental Competency Summary & Coverage
            </h4>
          </div>

          <button
            onClick={onNavigateToComparison}
            className="flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-700 font-semibold transition"
          >
            <span>Compare Departments</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-600">
              <tr>
                <th className="p-2.5">Department</th>
                <th className="p-2.5">Code</th>
                <th className="p-2.5">Participating Students</th>
                <th className="p-2.5">Distinct Skills</th>
                <th className="p-2.5">Total Records</th>
                <th className="p-2.5">Average Competency (1.0 - 3.0)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {analytics?.department_summaries.map((dept) => (
                <tr key={dept.department_id} className="hover:bg-slate-50">
                  <td className="p-2.5 font-bold text-slate-900">{dept.department_name}</td>
                  <td className="p-2.5 font-mono text-slate-600">{dept.department_code}</td>
                  <td className="p-2.5 font-mono text-slate-800">{dept.participating_students}</td>
                  <td className="p-2.5 font-mono text-slate-800">{dept.distinct_skills_count}</td>
                  <td className="p-2.5 font-mono text-slate-500">{dept.total_records}</td>
                  <td className="p-2.5">
                    <span className="font-mono font-bold text-blue-700">
                      {dept.average_proficiency.toFixed(2)} / 3.0
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Institutional Priority Skill Gaps Heatmap */}
      {gapReport && gapReport.priority_gaps.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wide">
                Institutional Priority Curriculum Deficits
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Matrix of observed deficits ranked by weighted gap score
              </p>
            </div>

            <button
              onClick={onNavigateToRecommendations}
              className="flex items-center space-x-1 text-xs text-indigo-600 hover:text-indigo-700 font-semibold transition"
            >
              <span>View Recommended Events</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <SkillGapHeatmap gaps={gapReport.priority_gaps} />
        </div>
      )}
    </div>
  );
}
