import { useState, useEffect, useMemo } from 'react';
import {
  sessionsApi,
  SessionResponse,
  IndividualAssessmentRecord,
} from '../../api/sessions.api';
import {
  Users,
  Search,
  Download,
  RefreshCw,
  AlertTriangle,
  GraduationCap,
  Calendar,
  FileSpreadsheet,
} from 'lucide-react';
import { useAuthStore } from '../auth/useAuthStore';

interface IndividualRecordsViewProps {
  initialSessionId?: string;
}

export function IndividualRecordsView({ initialSessionId }: IndividualRecordsViewProps) {
  const [sessions, setSessions] = useState<SessionResponse[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string>(initialSessionId || '');
  const [records, setRecords] = useState<IndividualAssessmentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedSection, setSelectedSection] = useState('ALL');
  const [selectedProficiency, setSelectedProficiency] = useState('ALL');

  const { user } = useAuthStore();
  const userRoles = useMemo(() => user?.roles.map((r) => r.toLowerCase()) || [], [user]);
  const isDean = userRoles.includes('dean');
  const isAdmin = userRoles.includes('administrator');

  // Load sessions on mount
  useEffect(() => {
    sessionsApi.listSessions().then((data) => {
      setSessions(data);
      if (!selectedSessionId && data.length > 0) {
        const active = data.find((s) => s.status === 'Active') || data[0];
        setSelectedSessionId(active.session_id);
      }
    });
  }, []);

  // Fetch individual records
  const fetchRecords = async () => {
    if (!selectedSessionId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await sessionsApi.getIndividualRecords(selectedSessionId);
      setRecords(data.records);
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'Failed to load individual assessment records.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [selectedSessionId]);

  // Extract unique departments & sections from records
  const availableDepts = useMemo(() => {
    const depts = new Set<string>();
    records.forEach((r) => {
      if (r.department_code) depts.add(r.department_code);
    });
    return Array.from(depts).sort();
  }, [records]);

  const availableSections = useMemo(() => {
    const secs = new Set<string>();
    records.forEach((r) => {
      if (r.section) secs.add(r.section);
    });
    return Array.from(secs).sort();
  }, [records]);

  // Client-side filtering
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      if (selectedDept !== 'ALL' && r.department_code !== selectedDept) return false;
      if (selectedSection !== 'ALL' && (r.section || 'General') !== selectedSection) return false;
      if (selectedProficiency !== 'ALL' && r.proficiency_level.toUpperCase() !== selectedProficiency)
        return false;
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesRef = r.session_student_ref.toLowerCase().includes(q);
        const matchesSkill = r.skill_name.toLowerCase().includes(q);
        const matchesDept = r.department_code.toLowerCase().includes(q);
        const matchesSection = (r.section || '').toLowerCase().includes(q);
        if (!matchesRef && !matchesSkill && !matchesDept && !matchesSection) return false;
      }
      return true;
    });
  }, [records, selectedDept, selectedSection, selectedProficiency, searchTerm]);

  const uniqueStudentsCount = useMemo(() => {
    return new Set(filteredRecords.map((r) => r.session_student_ref)).size;
  }, [filteredRecords]);

  // Export filtered individual records to CSV
  const handleExportCSV = () => {
    if (filteredRecords.length === 0) return;
    const headers = [
      'Student Pseudonym',
      'Department',
      'Section',
      'Skill Name',
      'Proficiency Level',
      'Numeric Proficiency',
      'Submitted At',
    ];
    const rows = filteredRecords.map((r) => [
      `"${r.session_student_ref}"`,
      `"${r.department_code}"`,
      `"${r.section || 'General'}"`,
      `"${r.skill_name}"`,
      `"${r.proficiency_level}"`,
      r.numeric_proficiency,
      `"${r.submitted_at}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `individual_assessments_${selectedSessionId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase tracking-wider">
              {isAdmin ? 'University Overall Scope' : isDean ? `${user?.school_name || 'School'} Scope` : 'Department Scope'}
            </span>
            <span className="text-xs text-slate-400">Zero-Retention In-Memory Buffer</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-1">Individual Assessment Records</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Inspect individual student skill submissions and proficiency ratings within your institutional scope.
          </p>
        </div>

        {/* Session Selector & Actions */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <select
              value={selectedSessionId}
              onChange={(e) => setSelectedSessionId(e.target.value)}
              className="text-xs border border-slate-200 bg-white rounded-lg px-3 py-2 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {sessions.map((s) => (
                <option key={s.session_id} value={s.session_id}>
                  {s.session_name} ({s.status})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={fetchRecords}
            disabled={isLoading}
            className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition disabled:opacity-50"
            title="Refresh records"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleExportCSV}
            disabled={filteredRecords.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-rose-700 text-sm">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Evaluations</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{filteredRecords.length}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Filtered assessment rows</p>
          </div>
          <FileSpreadsheet className="w-8 h-8 text-blue-500 bg-blue-50 p-1.5 rounded-lg" />
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Unique Students</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{uniqueStudentsCount}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Distinct participating students</p>
          </div>
          <Users className="w-8 h-8 text-indigo-500 bg-indigo-50 p-1.5 rounded-lg" />
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Departments in Scope</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{availableDepts.length}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {isDean ? `Under ${user?.school_name || 'School'}` : isAdmin ? 'All University Schools' : 'Department'}
            </p>
          </div>
          <GraduationCap className="w-8 h-8 text-emerald-500 bg-emerald-50 p-1.5 rounded-lg" />
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 justify-between items-center">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search student pseudonym, skill, or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Department Filter (Only for Dean or Admin who have multi-department scope) */}
          {(isAdmin || isDean) && (
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-500 font-medium">Department:</span>
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="text-xs border border-slate-200 bg-slate-50 rounded-lg px-2.5 py-1.5 font-medium text-slate-700"
              >
                <option value="ALL">All Departments ({availableDepts.length})</option>
                {availableDepts.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Section Filter */}
          {availableSections.length > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-500 font-medium">Section:</span>
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="text-xs border border-slate-200 bg-slate-50 rounded-lg px-2.5 py-1.5 font-medium text-slate-700"
              >
                <option value="ALL">All Sections ({availableSections.length})</option>
                {availableSections.map((sec) => (
                  <option key={sec} value={sec}>
                    {sec}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Proficiency Level Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500 font-medium">Proficiency:</span>
            <select
              value={selectedProficiency}
              onChange={(e) => setSelectedProficiency(e.target.value)}
              className="text-xs border border-slate-200 bg-slate-50 rounded-lg px-2.5 py-1.5 font-medium text-slate-700"
            >
              <option value="ALL">All Levels</option>
              <option value="BEGINNER">Beginner</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="EXPERT">Expert</option>
            </select>
          </div>
        </div>
      </div>

      {/* Individual Records Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500" />
            <p className="text-xs">Loading individual assessment data...</p>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <Users className="w-8 h-8 mx-auto text-slate-300" />
            <p className="text-sm font-semibold text-slate-600">No individual assessment records found</p>
            <p className="text-xs text-slate-400">
              There are no student skill evaluations matching your filters in this session.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Student Pseudonym</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Section</th>
                  <th className="py-3 px-4">Skill Name</th>
                  <th className="py-3 px-4">Proficiency Level</th>
                  <th className="py-3 px-4 text-center">Score</th>
                  <th className="py-3 px-4">Submitted At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRecords.map((r, idx) => {
                  const prof = r.proficiency_level.toUpperCase();
                  const profBadge =
                    prof === 'EXPERT'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : prof === 'INTERMEDIATE'
                      ? 'bg-purple-50 text-purple-700 border-purple-200'
                      : 'bg-blue-50 text-blue-700 border-blue-200';

                  return (
                    <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-medium text-slate-800">
                        {r.session_student_ref}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold px-2 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-200">
                          {r.department_code}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold px-2 py-0.5 bg-cyan-50 text-cyan-800 rounded border border-cyan-200">
                          {r.section || 'General'}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900">{r.skill_name}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${profBadge}`}
                        >
                          {r.proficiency_level}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-slate-700">
                        {r.raw_score != null ? `${r.raw_score}%` : r.numeric_proficiency.toFixed(1)}
                      </td>
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                        {r.submitted_at ? new Date(r.submitted_at).toLocaleString() : 'N/A'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
