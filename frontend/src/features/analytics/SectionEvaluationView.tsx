import { useState, useEffect, useMemo } from 'react';
import {
  analysisApi,
  SectionEvaluationResponse,
  StudentEvaluationSummary,
} from '../../api/analysis.api';
import { sessionsApi, SessionResponse } from '../../api/sessions.api';
import { useAuthStore } from '../auth/useAuthStore';
import {
  Users,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  Layers,
  Search,
  Download,
  RefreshCw,
  UploadCloud,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  GraduationCap,
  ExternalLink,
  Map,
} from 'lucide-react';

interface SectionEvaluationViewProps {
  initialSessionId?: string;
  initialSection?: string;
  onNavigateToBulkUpload?: () => void;
}

export function SectionEvaluationView({
  initialSessionId,
  initialSection,
  onNavigateToBulkUpload,
}: SectionEvaluationViewProps) {
  const { user } = useAuthStore();
  const roles = user?.roles.map((r) => r.toLowerCase()) || [];
  const isHOD = roles.includes('hod');

  const [sessions, setSessions] = useState<SessionResponse[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string>(initialSessionId || '');
  const [departmentId, setDepartmentId] = useState<string>(user?.department_id || 'DEPT-CSE');
  const [selectedSection, setSelectedSection] = useState<string>(initialSection || 'ALL');
  const [includeDraft, setIncludeDraft] = useState<boolean>(true);

  const [evaluation, setEvaluation] = useState<SectionEvaluationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [activeSubTab, setActiveSubTab] = useState<'students' | 'skills_gaps' | 'roadmap'>('students');
  const [searchTerm, setSearchTerm] = useState('');
  const [readinessFilter, setReadinessFilter] = useState('ALL');

  useEffect(() => {
    sessionsApi.listSessions().then((data) => {
      setSessions(data);
      if (initialSessionId) {
        setSelectedSessionId(initialSessionId);
      } else if (data.length > 0) {
        const activeWithData =
          data.find((s) => s.status === 'Active' && s.record_count > 0) ||
          data.find((s) => s.status === 'Active') ||
          data[0];
        setSelectedSessionId(activeWithData.session_id);
      }
    }).catch(() => {});
  }, [initialSessionId]);

  const fetchEvaluation = async () => {
    if (!selectedSessionId) return;
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await analysisApi.getSectionEvaluation(
        selectedSessionId,
        departmentId,
        selectedSection,
        includeDraft
      );
      setEvaluation(data);
    } catch (err: any) {
      setErrorMessage(
        err?.response?.data?.error?.message ||
          'Failed to load section evaluation. Ensure bulk student data has been uploaded.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvaluation();
  }, [selectedSessionId, departmentId, selectedSection, includeDraft]);

  const filteredStudents = useMemo<StudentEvaluationSummary[]>(() => {
    if (!evaluation) return [];
    return evaluation.student_evaluations.filter((stu) => {
      if (readinessFilter !== 'ALL' && stu.readiness_status !== readinessFilter) return false;
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchId = stu.session_student_ref.toLowerCase().includes(q);
        const matchSec = stu.section.toLowerCase().includes(q);
        const matchSkill = stu.skills_have.some((s) => s.skill_name.toLowerCase().includes(q));
        const matchStudy = stu.what_to_study.some((st) => st.skill_name.toLowerCase().includes(q));
        if (!matchId && !matchSec && !matchSkill && !matchStudy) return false;
      }
      return true;
    });
  }, [evaluation, readinessFilter, searchTerm]);

  const needsStudyCount = useMemo(() => {
    if (!evaluation) return 0;
    return evaluation.student_evaluations.filter((s) => s.readiness_status !== 'BENCHMARK_READY').length;
  }, [evaluation]);

  const handleExportStudyPlanCSV = () => {
    if (filteredStudents.length === 0) return;
    const headers = [
      'Student Pseudonym',
      'Section',
      'Department',
      'Readiness Status',
      'What They Have (Current Skills)',
      'Identified Skill Gaps',
      'What They Need To Study',
    ];
    const rows = filteredStudents.map((stu) => {
      const haveStr = stu.skills_have
        .map((s) => `${s.skill_name} (${s.proficiency_level}${s.raw_score != null ? ` ${s.raw_score}%` : ''})`)
        .join('; ');
      const gapStr =
        stu.skill_gaps.length > 0
          ? stu.skill_gaps.map((g) => `${g.skill_name} [${g.status}]`).join('; ')
          : 'None';
      const studyStr = stu.what_to_study.map((w) => `[${w.priority}] ${w.study_focus}`).join(' | ');
      return [
        `"${stu.session_student_ref}"`,
        `"${stu.section}"`,
        `"${stu.department_code}"`,
        `"${stu.readiness_status}"`,
        `"${haveStr.replace(/"/g, '""')}"`,
        `"${gapStr.replace(/"/g, '""')}"`,
        `"${studyStr.replace(/"/g, '""')}"`,
      ];
    });
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const secSlug = selectedSection === 'ALL' ? 'all_sections' : selectedSection.replace(/\s+/g, '_');
    link.setAttribute('download', `section_evaluation_${secSlug}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getReadinessBadge = (status: string) => {
    switch (status) {
      case 'NEEDS_CORE_STUDY':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'DEVELOPING':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'BENCHMARK_READY':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getProficiencyPill = (level: string) => {
    switch (level.toUpperCase()) {
      case 'EXPERT':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'INTERMEDIATE':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      default:
        return 'bg-amber-50 text-amber-800 border-amber-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 uppercase tracking-wider">
                Section-Wise Skill &amp; Gap Evaluation
              </span>
              <span className="text-xs text-slate-500">
                {evaluation?.department_name || user?.department_name || departmentId}
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1">
              What Students Have, Gaps &amp; Required Study Plan
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {isHOD && onNavigateToBulkUpload && (
              <button
                onClick={onNavigateToBulkUpload}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Upload Section Sheet</span>
              </button>
            )}

            <button
              onClick={() => setIncludeDraft(!includeDraft)}
              className="flex items-center space-x-1.5 px-3 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-700 transition"
              title="Toggle evaluating DRAFT curriculum benchmarks (ADR-008)"
            >
              {includeDraft ? (
                <ToggleRight className="w-4 h-4 text-blue-600" />
              ) : (
                <ToggleLeft className="w-4 h-4 text-slate-400" />
              )}
              <span>Include DRAFT Benchmarks</span>
            </button>

            <button
              onClick={fetchEvaluation}
              disabled={isLoading || !selectedSessionId}
              className="p-1.5 text-slate-500 hover:text-indigo-600 rounded-lg border border-slate-200 hover:bg-slate-50 transition"
              title="Refresh Evaluation"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Session, Department & Section Pills */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={selectedSessionId}
              onChange={(e) => {
                setSelectedSessionId(e.target.value);
                setSelectedSection('ALL');
              }}
              className="px-3 py-1.5 border border-slate-200 bg-slate-50 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {sessions.length === 0 && <option value="">No batches available</option>}
              {sessions.map((s) => (
                <option key={s.session_id} value={s.session_id}>
                  {s.session_name} ({s.student_count} students &bull; {s.status})
                </option>
              ))}
            </select>

            {!user?.department_id && (
              <select
                value={departmentId}
                onChange={(e) => {
                  setDepartmentId(e.target.value);
                  setSelectedSection('ALL');
                }}
                className="px-3 py-1.5 border border-slate-200 bg-slate-50 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="DEPT-CSE">CSE Department</option>
                <option value="DEPT-ECE">ECE Department</option>
                <option value="DEPT-BT">Biotechnology</option>
              </select>
            )}
          </div>

          {/* Section Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500 flex items-center space-x-1 mr-1">
              <Layers className="w-3.5 h-3.5 text-indigo-500" />
              <span>Section:</span>
            </span>
            <button
              onClick={() => setSelectedSection('ALL')}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                selectedSection === 'ALL'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              All Sections
            </button>
            {evaluation?.available_sections.map((sec) => (
              <button
                key={sec}
                onClick={() => setSelectedSection(sec)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                  selectedSection.toLowerCase() === sec.toLowerCase()
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {sec}
              </button>
            ))}
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {!selectedSessionId && !isLoading && (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center space-y-3">
          <GraduationCap className="w-10 h-10 text-indigo-400 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No Assessment Data Uploaded Yet</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Upload a section Excel (.xlsx, .xls) or CSV (.csv) dataset to view current skills, curriculum gaps, and student study recommendations.
          </p>
          {isHOD && onNavigateToBulkUpload && (
            <button
              onClick={onNavigateToBulkUpload}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition"
            >
              Go to Bulk Upload
            </button>
          )}
        </div>
      )}

      {evaluation && (
        <>
          {/* KPI Summary Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <p className="text-xs text-slate-500 font-medium flex items-center space-x-1.5">
                <Users className="w-3.5 h-3.5 text-indigo-600" />
                <span>Students Evaluated</span>
              </p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{evaluation.total_students}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {selectedSection === 'ALL' ? 'Across all uploaded sections' : `In ${selectedSection}`}
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <p className="text-xs text-slate-500 font-medium flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Skills Observed (Have)</span>
              </p>
              <p className="text-2xl font-bold text-emerald-700 mt-1">
                {evaluation.what_they_have.length}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {evaluation.total_records} total evaluated marks
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <p className="text-xs text-slate-500 font-medium flex items-center space-x-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                <span>Benchmarked Skill Gaps</span>
              </p>
              <p className="text-2xl font-bold text-rose-700 mt-1">
                {evaluation.gap_report.critical_gaps_count + evaluation.gap_report.moderate_gaps_count}
              </p>
              <p className="text-[11px] text-rose-600 mt-0.5">
                {evaluation.gap_report.critical_gaps_count} Critical &bull;{' '}
                {evaluation.gap_report.moderate_gaps_count} Moderate
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <p className="text-xs text-slate-500 font-medium flex items-center space-x-1.5">
                <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                <span>Students Needing Study Plan</span>
              </p>
              <p className="text-2xl font-bold text-amber-700 mt-1">{needsStudyCount}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Targeted study modules generated
              </p>
            </div>
          </div>

          {/* Sub-Navigation Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-2">
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveSubTab('students')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
                  activeSubTab === 'students'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                Student Evaluation: Have / Gap / Study ({evaluation.total_students})
              </button>
              <button
                onClick={() => setActiveSubTab('skills_gaps')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
                  activeSubTab === 'skills_gaps'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                Section Skill Matrix &amp; Benchmarks
              </button>
              <button
                onClick={() => setActiveSubTab('roadmap')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
                  activeSubTab === 'roadmap'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                Cohort Study Roadmap ({evaluation.cohort_study_roadmap.length})
              </button>
            </div>

            {activeSubTab === 'students' && (
              <button
                onClick={handleExportStudyPlanCSV}
                disabled={filteredStudents.length === 0}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded-lg text-xs font-semibold shadow-sm transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Section Study Plan (CSV)</span>
              </button>
            )}
          </div>

          {/* Sub-Tab 1: Student-by-Student Evaluation */}
          {activeSubTab === 'students' && (
            <div className="space-y-4">
              {/* Filter Bar */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by Student Pseudonym (STU-...), Section, Skill..."
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 bg-white rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <select
                  value={readinessFilter}
                  onChange={(e) => setReadinessFilter(e.target.value)}
                  className="px-3 py-2 border border-slate-200 bg-white rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="ALL">All Readiness Levels</option>
                  <option value="NEEDS_CORE_STUDY">Needs Core Study</option>
                  <option value="DEVELOPING">Developing (Partial Gaps)</option>
                  <option value="BENCHMARK_READY">Benchmark Ready</option>
                </select>
              </div>

              {filteredStudents.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-xs text-slate-500">
                  No student records match the current filter.
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredStudents.map((stu) => (
                    <div
                      key={stu.session_student_ref}
                      className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:border-indigo-200 transition space-y-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                        <div className="flex items-center space-x-3">
                          <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
                            {stu.session_student_ref}
                          </span>
                          <span className="text-xs font-bold text-cyan-800 bg-cyan-50 px-2.5 py-1 rounded-lg border border-cyan-100">
                            {stu.section}
                          </span>
                          <span className="text-xs text-slate-500">
                            Avg Tier Score: <strong className="text-slate-800">{stu.average_proficiency.toFixed(2)}</strong> / 3.0
                          </span>
                        </div>

                        <span
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${getReadinessBadge(
                            stu.readiness_status
                          )}`}
                        >
                          {stu.readiness_status.replace(/_/g, ' ')}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-xs">
                        {/* Column 1: What They Have */}
                        <div className="space-y-2">
                          <p className="font-bold text-slate-700 flex items-center space-x-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>What They Have ({stu.skills_have.length})</span>
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {stu.skills_have.map((sk) => (
                              <span
                                key={sk.skill_id}
                                className={`px-2 py-1 rounded-md border text-[11px] font-semibold ${getProficiencyPill(
                                  sk.proficiency_level
                                )}`}
                              >
                                {sk.skill_name}: {sk.proficiency_level}
                                {sk.raw_score != null ? ` (${sk.raw_score}%)` : ''}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Column 2: Skill Gaps */}
                        <div className="space-y-2">
                          <p className="font-bold text-slate-700 flex items-center space-x-1.5">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                            <span>Skill Gaps ({stu.skill_gaps.length})</span>
                          </p>
                          {stu.skill_gaps.length === 0 ? (
                            <p className="text-emerald-700 text-[11px] font-medium">
                              No curriculum gaps detected. Meets all active benchmarks.
                            </p>
                          ) : (
                            <div className="flex flex-wrap gap-1.5">
                              {stu.skill_gaps.map((g, i) => (
                                <span
                                  key={i}
                                  className={`px-2 py-1 rounded-md border text-[11px] font-semibold ${
                                    g.status === 'MISSING'
                                      ? 'bg-rose-50 text-rose-800 border-rose-200'
                                      : 'bg-amber-50 text-amber-800 border-amber-200'
                                  }`}
                                >
                                  {g.skill_name} &bull;{' '}
                                  {g.status === 'MISSING'
                                    ? 'Missing Skill'
                                    : `-${g.gap_delta.toFixed(1)} Gap`}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Column 3: What They Need To Study */}
                        <div className="space-y-2">
                          <p className="font-bold text-slate-700 flex items-center space-x-1.5">
                            <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                            <span>What They Need To Study</span>
                          </p>
                          <ul className="space-y-1.5">
                            {stu.what_to_study.map((item, idx) => (
                              <li
                                key={idx}
                                className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-700 space-y-1.5"
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <span
                                      className={`inline-block font-bold mr-1.5 ${
                                        item.priority === 'CRITICAL'
                                          ? 'text-rose-700'
                                          : item.priority === 'HIGH'
                                          ? 'text-amber-700'
                                          : 'text-indigo-700'
                                      }`}
                                    >
                                      [{item.priority}]
                                    </span>
                                    {item.study_focus}
                                  </div>
                                  {item.roadmap_url && (
                                    <a
                                      href={item.roadmap_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-indigo-100 hover:bg-indigo-200 text-indigo-800 text-[10px] font-bold shrink-0 transition"
                                      title="Open learning roadmap on roadmap.sh"
                                    >
                                      <span>roadmap.sh</span>
                                      <ExternalLink className="w-2.5 h-2.5" />
                                    </a>
                                  )}
                                </div>
                                {item.roadmap_topics && item.roadmap_topics.length > 0 && (
                                  <div className="flex flex-wrap gap-1 pt-0.5">
                                    {item.roadmap_topics.slice(0, 3).map((tp, tIdx) => (
                                      <span
                                        key={tIdx}
                                        className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-[10px] text-slate-600"
                                      >
                                        {tp}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Sub-Tab 2: Section Skill Matrix & Benchmark Gaps */}
          {activeSubTab === 'skills_gaps' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* What the Section Has */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200">
                  <h3 className="text-xs font-bold text-slate-800">
                    What This Section Has (Observed Competency Distribution)
                  </h3>
                </div>
                <div className="divide-y divide-slate-100">
                  {evaluation.what_they_have.length === 0 ? (
                    <p className="p-6 text-xs text-slate-500">No skills recorded in this section.</p>
                  ) : (
                    evaluation.what_they_have.map((sk) => (
                      <div key={sk.skill_id} className="p-4 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-900">{sk.skill_name}</span>
                          <span className="text-slate-500">
                            {sk.student_count} students ({sk.coverage_percentage}%) &bull; Avg:{' '}
                            <strong className="text-indigo-700">
                              {sk.average_numeric_proficiency.toFixed(2)}
                            </strong>
                            /3.0
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 text-[11px]">
                          <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                            Beginner: {sk.proficiency_distribution.beginner_count}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                            Intermediate: {sk.proficiency_distribution.intermediate_count}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                            Expert: {sk.proficiency_distribution.expert_count}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Section Curriculum Gaps */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200">
                  <h3 className="text-xs font-bold text-slate-800">
                    Curriculum Gap Evaluation vs Benchmarks
                  </h3>
                </div>
                <div className="divide-y divide-slate-100">
                  {evaluation.gap_report.gaps.length === 0 ? (
                    <p className="p-6 text-xs text-slate-500">
                      No approved/active benchmarks evaluated. Toggle &ldquo;Include DRAFT Benchmarks&rdquo; to preview candidate targets.
                    </p>
                  ) : (
                    evaluation.gap_report.gaps.map((g, idx) => (
                      <div key={idx} className="p-4 flex items-center justify-between text-xs">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-slate-900">{g.skill_name}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">
                              {g.relevance_type}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Target: {g.target_proficiency.toFixed(1)} ({g.target_coverage}% cov) &bull; Actual:{' '}
                            {g.actual_average_proficiency.toFixed(2)} ({g.actual_coverage}% cov)
                          </p>
                        </div>
                        <div className="text-right">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              g.gap_severity === 'CRITICAL'
                                ? 'bg-rose-100 text-rose-800'
                                : g.gap_severity === 'MODERATE'
                                ? 'bg-amber-100 text-amber-800'
                                : g.gap_severity === 'SATISFIED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {g.gap_severity}
                          </span>
                          <p className="text-[11px] text-slate-500 mt-1">
                            Score: <strong>{g.gap_score.toFixed(2)}</strong>
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Sub-Tab 3: Cohort Study Roadmap */}
          {activeSubTab === 'roadmap' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {evaluation.cohort_study_roadmap.length === 0 ? (
                <div className="col-span-2 bg-white rounded-xl border border-slate-200 p-8 text-center text-xs text-slate-500">
                  All evaluated curriculum benchmarks for this section are currently satisfied.
                </div>
              ) : (
                evaluation.cohort_study_roadmap.map((rec: any, idx: number) => (
                  <div
                    key={rec.recommendation_id || idx}
                    className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 uppercase">
                        {rec.initiative_category}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          rec.priority === 'CRITICAL'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {rec.priority} PRIORITY
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">{rec.recommendation_title}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {rec.recommendation_description}
                    </p>
                    <div className="text-[11px] bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-1">
                      <p className="font-bold text-slate-700 flex items-center space-x-1">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Suggested Study Modules ({rec.suggested_duration}):</span>
                      </p>
                      <ul className="list-disc list-inside text-slate-600 space-y-0.5">
                        {Array.isArray(rec.learning_objectives) &&
                          rec.learning_objectives.map((obj: string, i: number) => (
                            <li key={i}>{obj}</li>
                          ))}
                      </ul>
                    </div>
                    {rec.roadmap_sh && (
                      <div className="p-2.5 bg-indigo-50/70 rounded-lg border border-indigo-200 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                        <span className="font-semibold text-indigo-900 flex items-center space-x-1">
                          <Map className="w-3.5 h-3.5 text-indigo-600" />
                          <span>{rec.roadmap_sh.title}</span>
                        </span>
                        <a
                          href={rec.roadmap_sh.roadmap_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-1 px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-semibold transition"
                        >
                          <span>View on roadmap.sh</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
