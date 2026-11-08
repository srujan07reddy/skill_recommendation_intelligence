import { useState, useEffect } from 'react';
import {
  assessmentsApi,
  TaxonomyFormResponse,
  SkillAssessmentItem,
} from '../../api/assessments.api';
import {
  ShieldCheck,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';

interface StudentAssessmentFormProps {
  sessionId: string;
  onBack?: () => void;
}

export function StudentAssessmentForm({ sessionId, onBack }: StudentAssessmentFormProps) {
  const [metadata, setMetadata] = useState<TaxonomyFormResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Form Fields
  const [studentId, setStudentId] = useState('');
  const [departmentCode, setDepartmentCode] = useState('');
  const [programCode, setProgramCode] = useState('');
  const [skills, setSkills] = useState<SkillAssessmentItem[]>([
    {
      skill_name: '',
      proficiency_level: 'INTERMEDIATE',
      experience_type: ['Coursework'],
      evidence_description: '',
    },
  ]);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<{
    student_ref: string;
    skills_count: number;
    submitted_at: string;
  } | null>(null);

  useEffect(() => {
    const loadForm = async () => {
      setIsLoading(true);
      setFetchError(null);
      try {
        const data = await assessmentsApi.getAssessmentForm(sessionId);
        setMetadata(data);
        if (data.departments.length > 0) {
          setDepartmentCode(data.departments[0].department_code);
        }
        if (data.available_skills.length > 0) {
          setSkills([
            {
              skill_name: data.available_skills[0].skill_name,
              proficiency_level: 'INTERMEDIATE',
              experience_type: ['Coursework'],
              evidence_description: '',
            },
          ]);
        }
      } catch (err: any) {
        setFetchError(
          err?.response?.data?.error?.message ||
            'Unable to load assessment form. Session may be inactive or expired.'
        );
      } finally {
        setIsLoading(false);
      }
    };
    loadForm();
  }, [sessionId]);

  const handleAddSkill = () => {
    if (!metadata || metadata.available_skills.length === 0) return;
    // Find first skill not yet in list
    const selectedNames = new Set(skills.map((s) => s.skill_name));
    const nextSkill =
      metadata.available_skills.find((s) => !selectedNames.has(s.skill_name)) ||
      metadata.available_skills[0];

    setSkills([
      ...skills,
      {
        skill_name: nextSkill.skill_name,
        proficiency_level: 'INTERMEDIATE',
        experience_type: ['Coursework'],
        evidence_description: '',
      },
    ]);
  };

  const handleRemoveSkill = (index: number) => {
    if (skills.length <= 1) return;
    setSkills(skills.filter((_, i) => i !== index));
  };

  const handleSkillChange = (index: number, updated: Partial<SkillAssessmentItem>) => {
    setSkills(
      skills.map((item, i) => (i === index ? { ...item, ...updated } : item))
    );
  };

  const handleExperienceToggle = (index: number, exp: string) => {
    const current = skills[index].experience_type || [];
    const next = current.includes(exp)
      ? current.filter((x) => x !== exp)
      : [...current, exp];
    handleSkillChange(index, { experience_type: next });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId.trim()) {
      setSubmitError('Please enter your Student Roll Number or Registration ID.');
      return;
    }
    if (skills.length === 0) {
      setSubmitError('Please add at least one skill assessment.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await assessmentsApi.submitAssessment(sessionId, {
        student_identifier: studentId.trim(),
        department_code: departmentCode,
        program_code: programCode || undefined,
        skills,
      });

      setReceipt({
        student_ref: res.session_student_ref,
        skills_count: res.recorded_skills_count,
        submitted_at: res.submitted_at,
      });
    } catch (err: any) {
      setSubmitError(
        err?.response?.data?.error?.message ||
          'Failed to record assessment. Please check your inputs.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-16 text-center space-y-3">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-500 font-medium">Loading Assessment Taxonomy...</p>
      </div>
    );
  }

  if (fetchError || !metadata) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 text-center space-y-4">
        <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900">Session Unavailable</h3>
        <p className="text-xs text-slate-500">{fetchError}</p>
        {onBack && (
          <button
            onClick={onBack}
            className="mt-2 inline-flex items-center space-x-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Sessions</span>
          </button>
        )}
      </div>
    );
  }

  // Success Receipt Screen
  if (receipt) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 space-y-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm text-center space-y-4">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Assessment Successfully Recorded
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Your skill inventory has been committed to the active session buffer.
            </p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-left space-y-2 text-xs">
            <div className="flex justify-between items-center py-1 border-b border-slate-200">
              <span className="text-slate-500">Session</span>
              <span className="font-semibold text-slate-800">{metadata.session_name}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-200">
              <span className="text-slate-500">HMAC Session Pseudonym</span>
              <span className="font-mono font-bold text-indigo-700">{receipt.student_ref}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-200">
              <span className="text-slate-500">Skills Evaluated</span>
              <span className="font-semibold text-slate-800">{receipt.skills_count} skills</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-500">Timestamp</span>
              <span className="text-slate-600">{new Date(receipt.submitted_at).toLocaleString()}</span>
            </div>
          </div>

          <div className="text-[11px] text-slate-400">
            ADR-001 Zero-Retention Notice: Your student roll number was used strictly as HMAC seed and was discarded immediately.
          </div>

          {onBack && (
            <button
              onClick={onBack}
              className="mt-4 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
            >
              Back to Overview
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center space-x-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Student Technical Skill Assessment
            </h3>
            <p className="text-xs text-slate-500">
              Session: <strong className="text-slate-800">{metadata.session_name}</strong>
            </p>
          </div>
        </div>

        <span className="hidden sm:inline-flex items-center space-x-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[11px] font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>ADR-001 Ephemeral Privacy</span>
        </span>
      </div>

      {submitError && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{submitError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Student Identity Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <BookOpen className="w-4 h-4 text-blue-600" />
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              Academic Information
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Student ID / Roll Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="e.g. JEP2026CSE001"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none uppercase"
              />
              <p className="text-[10px] text-slate-400 mt-1">Pseudonymized immediately on submit</p>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Department <span className="text-rose-500">*</span>
              </label>
              <select
                value={departmentCode}
                onChange={(e) => setDepartmentCode(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {metadata.departments.map((d) => (
                  <option key={d.department_code} value={d.department_code}>
                    {d.department_name} ({d.department_code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Degree Program (Optional)
              </label>
              <input
                type="text"
                value={programCode}
                onChange={(e) => setProgramCode(e.target.value)}
                placeholder="e.g. PRG-SET-CSE"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Skill Assessments List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                Technical Competencies ({skills.length})
              </h4>
            </div>

            <button
              type="button"
              onClick={handleAddSkill}
              className="flex items-center space-x-1 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-lg text-xs font-semibold transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Another Skill</span>
            </button>
          </div>

          {skills.map((skillItem, index) => (
            <div
              key={index}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-xs font-bold text-slate-700">
                  Skill #{index + 1}
                </span>

                {skills.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(index)}
                    className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition"
                    title="Remove Skill"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Skill Name Selector */}
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Select Technical Skill
                  </label>
                  <select
                    value={skillItem.skill_name}
                    onChange={(e) =>
                      handleSkillChange(index, { skill_name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    {metadata.available_skills.map((s) => (
                      <option key={s.skill_id} value={s.skill_name}>
                        {s.skill_name} ({s.category_name})
                      </option>
                    ))}
                  </select>
                </div>

                {/* 3-Tier Proficiency Selector (ADR-007) */}
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Proficiency Level (ADR-007)
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['BEGINNER', 'INTERMEDIATE', 'EXPERT'] as const).map((lvl) => {
                      const isSelected = skillItem.proficiency_level === lvl;
                      return (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() =>
                            handleSkillChange(index, { proficiency_level: lvl })
                          }
                          className={`py-2 text-[11px] font-bold rounded-lg border transition ${
                            isSelected
                              ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {lvl}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Experience Sources */}
              <div className="text-xs space-y-1.5">
                <label className="block text-slate-700 font-semibold">
                  Source of Experience (Optional)
                </label>
                <div className="flex flex-wrap gap-2">
                  {['Coursework', 'Capstone / Project', 'Internship', 'Self-Taught'].map(
                    (exp) => {
                      const active = (skillItem.experience_type || []).includes(exp);
                      return (
                        <button
                          key={exp}
                          type="button"
                          onClick={() => handleExperienceToggle(index, exp)}
                          className={`px-3 py-1 rounded-full text-[11px] font-medium border transition ${
                            active
                              ? 'bg-indigo-50 text-indigo-700 border-indigo-300'
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {exp}
                        </button>
                      );
                    }
                  )}
                </div>
              </div>

              {/* Brief Description */}
              <div className="text-xs">
                <label className="block text-slate-700 font-semibold mb-1">
                  Brief Evidence / Project Description (Optional)
                </label>
                <input
                  type="text"
                  maxLength={500}
                  value={skillItem.evidence_description || ''}
                  onChange={(e) =>
                    handleSkillChange(index, { evidence_description: e.target.value })
                  }
                  placeholder="e.g. Developed semester project using Python and PostgreSQL"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-xs"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Submit Bar */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <p className="text-xs text-slate-500">
            Review your ratings carefully. Once submitted, ratings cannot be re-submitted for this active session (ADR-006).
          </p>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`flex items-center space-x-2 px-6 py-2 rounded-lg text-xs font-semibold text-white shadow-sm transition ${
              isSubmitting
                ? 'bg-slate-300 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Recording Assessment...</span>
              </>
            ) : (
              <span>Submit Assessment</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

