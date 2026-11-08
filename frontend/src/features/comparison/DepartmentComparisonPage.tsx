import { useState, useEffect } from 'react';
import {
  analysisApi,
  InstitutionalSkillAnalytics,
} from '../../api/analysis.api';
import { sessionsApi, SessionResponse } from '../../api/sessions.api';
import { DepartmentComparisonChart } from '../../components/charts/DepartmentComparisonChart';
import {
  TrendingUp,
  RefreshCw,
  AlertTriangle,
  ArrowUpDown,
  CheckSquare,
  Square,
} from 'lucide-react';

export function DepartmentComparisonPage() {
  const [sessions, setSessions] = useState<SessionResponse[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string>('');
  const [analytics, setAnalytics] = useState<InstitutionalSkillAnalytics | null>(null);
  const [selectedDeptCodes, setSelectedDeptCodes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'students' | 'skills' | 'proficiency'>('students');

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

  // 2. Fetch institutional analytics containing department summaries
  const fetchData = async () => {
    if (!selectedSessionId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await analysisApi.getInstitutionalDistribution(selectedSessionId);
      setAnalytics(data);
      if (selectedDeptCodes.length === 0 && data.department_summaries) {
        // Select all departments by default
        setSelectedDeptCodes(data.department_summaries.map((d) => d.department_code));
      }
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'Failed to load department comparison data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedSessionId]);

  const toggleDept = (code: string) => {
    if (selectedDeptCodes.includes(code)) {
      if (selectedDeptCodes.length > 1) {
        setSelectedDeptCodes(selectedDeptCodes.filter((c) => c !== code));
      }
    } else {
      setSelectedDeptCodes([...selectedDeptCodes, code]);
    }
  };

  const selectAllDepts = () => {
    if (analytics) {
      setSelectedDeptCodes(analytics.department_summaries.map((d) => d.department_code));
    }
  };

  // Filter and sort department summaries
  const allSummaries = analytics?.department_summaries || [];
  const filteredSummaries = allSummaries.filter((d) =>
    selectedDeptCodes.includes(d.department_code)
  );

  const sortedSummaries = [...filteredSummaries].sort((a, b) => {
    if (sortBy === 'students') return b.participating_students - a.participating_students;
    if (sortBy === 'skills') return b.distinct_skills_count - a.distinct_skills_count;
    if (sortBy === 'proficiency') return b.average_proficiency - a.average_proficiency;
    return 0;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 uppercase tracking-wider">
              Dean Intelligence
            </span>
            <span className="text-xs text-slate-400">Institutional Cross-Department Comparison</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            Department Performance & Competency Comparison
          </h2>
          <p className="text-xs text-slate-500">
            Compare student assessment participation, skill diversity, and average proficiency across Jeppiaar University departments.
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
            onClick={fetchData}
            disabled={isLoading || !selectedSessionId}
            className="p-1.5 text-slate-500 hover:text-blue-600 rounded-lg hover:bg-slate-100 border border-slate-200 transition"
            title="Refresh analytics"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter and Selection Controls */}
      {allSummaries.length > 0 && (
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Included Departments ({selectedDeptCodes.length} / {allSummaries.length})
            </p>
            <button
              onClick={selectAllDepts}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition"
            >
              Select All
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {allSummaries.map((dept) => {
              const isSelected = selectedDeptCodes.includes(dept.department_code);
              return (
                <button
                  key={dept.department_code}
                  onClick={() => toggleDept(dept.department_code)}
                  className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition border ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {isSelected ? (
                    <CheckSquare className="w-3.5 h-3.5" />
                  ) : (
                    <Square className="w-3.5 h-3.5 text-slate-400" />
                  )}
                  <span>{dept.department_name} ({dept.department_code.replace('DEPT-', '')})</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Comparison Chart */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span>Cross-Department Metric Visualizer</span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Blue: Assessed Students | Indigo: Skills Evaluated | Emerald: Average Proficiency (scaled x10)
            </p>
          </div>

          {/* Sort By controls */}
          <div className="flex items-center space-x-2 text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500 font-medium">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2.5 py-1 border border-slate-200 bg-white rounded-lg text-xs font-semibold text-slate-700 focus:outline-none"
            >
              <option value="students">Students Count</option>
              <option value="skills">Distinct Skills</option>
              <option value="proficiency">Avg Proficiency</option>
            </select>
          </div>
        </div>

        <DepartmentComparisonChart data={sortedSummaries} height={320} />
      </div>

      {/* Tabular Side-by-Side Breakdown */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Comparative Department Summary Table
          </h4>
          <span className="text-[11px] text-slate-400">
            {sortedSummaries.length} departments selected
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4 text-center">Code</th>
                <th className="py-3 px-4 text-right">Assessed Students</th>
                <th className="py-3 px-4 text-right">Distinct Skills</th>
                <th className="py-3 px-4 text-right">Total Submissions</th>
                <th className="py-3 px-4 text-right">Avg Proficiency (1-3)</th>
                <th className="py-3 px-4 text-center">Tier Quality</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {sortedSummaries.map((dept) => {
                const avg = dept.average_proficiency;
                const tier = avg >= 2.5 ? 'High (Expert)' : avg >= 1.7 ? 'Moderate (Inter.)' : 'Emerging (Beginner)';
                const badgeColor =
                  avg >= 2.5
                    ? 'bg-purple-100 text-purple-800'
                    : avg >= 1.7
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-emerald-100 text-emerald-800';

                return (
                  <tr key={dept.department_code} className="hover:bg-slate-50/60 transition">
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {dept.department_name}
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-slate-500">
                      {dept.department_code}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900">
                      {dept.participating_students}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-slate-600">
                      {dept.distinct_skills_count}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-slate-600">
                      {dept.total_records}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-blue-600">
                      {avg.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${badgeColor}`}>
                        {tier}
                      </span>
                    </td>
                  </tr>
                );
              })}

              {sortedSummaries.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400">
                    No departments selected for comparison.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
