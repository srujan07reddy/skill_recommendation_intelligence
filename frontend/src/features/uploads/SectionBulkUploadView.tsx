import React, { useState, useEffect, useRef } from 'react';
import { uploadsApi, ValidationReportResponse } from '../../api/uploads.api';
import { sessionsApi, SessionResponse } from '../../api/sessions.api';
import { ValidationResultsView } from './ValidationResultsView';
import { useAuthStore } from '../auth/useAuthStore';
import {
  UploadCloud,
  FileSpreadsheet,
  AlertCircle,
  Download,
  Layers,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

interface SectionBulkUploadViewProps {
  onUploadCommitted: (sessionId: string, sectionsDetected?: string[]) => void;
}

const PRESET_SECTIONS = ['Auto-Detect from Sheet', 'Section A', 'Section B', 'Section C', 'Section D'];

export function SectionBulkUploadView({ onUploadCommitted }: SectionBulkUploadViewProps) {
  const { user } = useAuthStore();
  const [sessions, setSessions] = useState<SessionResponse[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string>('AUTO');
  const [selectedSectionMode, setSelectedSectionMode] = useState<string>('Section A');
  const [customSection, setCustomSection] = useState<string>('');
  const [batchName, setBatchName] = useState<string>('');

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [validationReport, setValidationReport] = useState<ValidationReportResponse | null>(null);
  const [resolvedSession, setResolvedSession] = useState<SessionResponse | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    sessionsApi.listSessions().then((data) => {
      setSessions(data.filter((s) => s.status !== 'Closed' && s.status !== 'Cleaned'));
    }).catch(() => {});
  }, []);

  const effectiveSection =
    selectedSectionMode === 'Auto-Detect from Sheet'
      ? undefined
      : selectedSectionMode === 'CUSTOM'
      ? customSection.trim() || undefined
      : selectedSectionMode;

  const validateAndSetFile = (file: File) => {
    setErrorMessage(null);
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!ext || !['xlsx', 'xls', 'csv'].includes(ext)) {
      setErrorMessage('Unsupported file format. Please upload an Excel (.xlsx, .xls) or CSV (.csv) spreadsheet.');
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      setErrorMessage('File size exceeds maximum allowable limit of 25MB.');
      return;
    }
    setSelectedFile(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleUploadAndValidate = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setErrorMessage(null);

    try {
      const report = await uploadsApi.directBulkUpload(selectedFile, {
        section: effectiveSection,
        sessionId: selectedSessionId,
        sessionName: batchName.trim() || undefined,
      });

      const targetSid = report.session_id || selectedSessionId;
      let sessionObj = sessions.find((s) => s.session_id === targetSid) || null;
      if (!sessionObj && targetSid && targetSid !== 'AUTO' && targetSid !== 'NEW') {
        try {
          sessionObj = await sessionsApi.getSession(targetSid);
        } catch {
          sessionObj = {
            session_id: targetSid,
            session_name: batchName.trim() || `${user?.department_id || 'DEPT'} Bulk Evaluation`,
            session_type: 'BULK_UPLOAD',
            department_id: user?.department_id || undefined,
            department_name: user?.department_name || undefined,
            academic_year: '2026-2027',
            status: 'Active',
            record_count: 0,
            student_count: 0,
            created_at: new Date().toISOString(),
            expiry_time: new Date().toISOString(),
          };
        }
      }
      setResolvedSession(sessionObj);
      setValidationReport(report);
    } catch (err: any) {
      setErrorMessage(
        err?.response?.data?.error?.message ||
          'Failed to parse and validate spreadsheet. Verify column headers match supported formats.'
      );
    } finally {
      setIsUploading(false);
    }
  };

  const downloadCsv = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadWideTemplate = () => {
    const secName = effectiveSection || 'Section A';
    const csvContent =
      'Student ID,Section,Python,SQL,Data Structures,Git\n' +
      `24CSE001,${secName},82,65,45,Beginner\n` +
      `24CSE002,${secName},40,55,78,Intermediate\n` +
      `24CSE003,${secName},Expert,88,70,75\n` +
      `24CSE004,${secName},32,38,42,Beginner\n`;
    downloadCsv('SSIP_Section_Wide_Marksheet_Template.csv', csvContent);
  };

  const handleDownloadLongTemplate = () => {
    const secName = effectiveSection || 'Section A';
    const deptCode = user?.department_id || 'DEPT-CSE';
    const csvContent =
      'Student ID,Section,Department,Skill Name,Proficiency Level\n' +
      `24CSE001,${secName},${deptCode},Python,Intermediate\n` +
      `24CSE001,${secName},${deptCode},SQL,Beginner\n` +
      `24CSE002,${secName},${deptCode},Data Structures,Expert\n`;
    downloadCsv('SSIP_Section_Detailed_Template.csv', csvContent);
  };

  if (validationReport && resolvedSession) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <ValidationResultsView
          report={validationReport}
          session={resolvedSession}
          onConfirmSuccess={() => {
            onUploadCommitted(
              resolvedSession.session_id,
              validationReport.sections_detected
            );
          }}
          onReupload={() => {
            setValidationReport(null);
            setSelectedFile(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 uppercase tracking-wider">
                HOD Direct Bulk Ingestion
              </span>
              <span className="text-xs font-medium text-slate-500">
                Scoped Department: <strong className="text-slate-800">{user?.department_name || 'Computer Science & Engineering'}</strong>
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1.5">
              Section-Wise Bulk Student Assessment Upload
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Upload your section Excel (<code className="text-indigo-700">.xlsx</code>, <code className="text-indigo-700">.xls</code>) or CSV (<code className="text-indigo-700">.csv</code>) sheet to automatically evaluate what students have, skill gaps, and what they need to study.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleDownloadWideTemplate}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold transition"
              title="1 row per student with skill columns & marks"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Wide Sheet Template (.csv)</span>
            </button>
            <button
              onClick={handleDownloadLongTemplate}
              className="flex items-center space-x-1.5 px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition"
              title="Row per student-skill record"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Detailed Template</span>
            </button>
          </div>
        </div>

        {errorMessage && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Section & Batch Configuration Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Section Picker */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                <Layers className="w-4 h-4 text-indigo-600" />
                <span>1. Select Class / Section</span>
              </label>
              <span className="text-[11px] text-slate-500">Applied if Section column is omitted</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {PRESET_SECTIONS.map((sec) => {
                const active = selectedSectionMode === sec;
                return (
                  <button
                    key={sec}
                    type="button"
                    onClick={() => setSelectedSectionMode(sec)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                      active
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300'
                    }`}
                  >
                    {sec}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => setSelectedSectionMode('CUSTOM')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                  selectedSectionMode === 'CUSTOM'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300'
                }`}
              >
                Custom Section...
              </button>
            </div>

            {selectedSectionMode === 'CUSTOM' && (
              <input
                type="text"
                value={customSection}
                onChange={(e) => setCustomSection(e.target.value)}
                placeholder="e.g., CSE-A, II-Year Sec B, Honors Batch"
                className="w-full px-3 py-2 border border-slate-300 bg-white rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            )}
          </div>

          {/* Target Evaluation Batch */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>2. Evaluation Batch (Auto-Managed)</span>
              </label>
              <span className="text-[11px] text-emerald-700 font-semibold flex items-center space-x-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>No manual setup required</span>
              </span>
            </div>

            <select
              value={selectedSessionId}
              onChange={(e) => setSelectedSessionId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 bg-white rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="AUTO">
                Auto-Reuse Active Department Session (or Create Automatically)
              </option>
              <option value="NEW">
                Start Fresh Evaluation Batch (Create New Session)
              </option>
              {sessions.map((s) => (
                <option key={s.session_id} value={s.session_id}>
                  Add to: {s.session_name} ({s.status} &bull; {s.student_count} students)
                </option>
              ))}
            </select>

            {(selectedSessionId === 'AUTO' || selectedSessionId === 'NEW') && (
              <input
                type="text"
                value={batchName}
                onChange={(e) => setBatchName(e.target.value)}
                placeholder="Optional batch title (e.g. CSE 2026 Mid-Sem Evaluation)"
                className="w-full px-3 py-1.5 border border-slate-200 bg-white rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            )}
          </div>
        </div>

        {/* Drag & Drop Upload Zone */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-9 text-center cursor-pointer transition ${
            selectedFile
              ? 'border-indigo-500 bg-indigo-50/30'
              : 'border-slate-300 hover:border-indigo-400 bg-slate-50/50 hover:bg-indigo-50/10'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="max-w-lg mx-auto space-y-3">
            <div className="w-14 h-14 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto">
              <UploadCloud className="w-7 h-7" />
            </div>

            {selectedFile ? (
              <div>
                <p className="text-sm font-bold text-slate-900 flex items-center justify-center space-x-2">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>{selectedFile.name}</span>
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {(selectedFile.size / 1024).toFixed(1)} KB &bull; Target:{' '}
                  <strong className="text-indigo-700">
                    {effectiveSection || 'Auto-Detect Section'}
                  </strong>
                </p>
                <p className="text-xs text-indigo-600 font-medium mt-2">
                  Click or drag another file to replace
                </p>
              </div>
            ) : (
              <div>
                <p className="text-sm font-bold text-slate-800">
                  Drag and drop your Section Excel / CSV file here, or click to browse
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Supports <strong>.xlsx</strong>, <strong>.xls</strong>, and <strong>.csv</strong> (up to 25MB)
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Supported Formats & Action Footer */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2">
            <h4 className="font-bold text-slate-800">Flexible Excel / CSV Layouts Accepted</h4>
            <ul className="space-y-1 text-slate-600 list-disc list-inside">
              <li>
                <strong>Wide Format (1 row per student):</strong>{' '}
                <code className="bg-slate-100 px-1 rounded">Student ID, Section, Python, SQL, Git...</code>
              </li>
              <li>
                <strong>Detailed Format (1 row per skill):</strong>{' '}
                <code className="bg-slate-100 px-1 rounded">Student ID, Section, Skill Name, Proficiency Level</code>
              </li>
              <li>
                <strong>Scores &amp; Levels:</strong> Marks (<code className="bg-slate-100 px-1 rounded">0-100</code> or <code className="bg-slate-100 px-1 rounded">%</code>) or <code className="bg-slate-100 px-1 rounded">Beginner / Intermediate / Expert</code>
              </li>
              <li>
                <em>Department is automatically scoped to {user?.department_id || 'your department'}</em>
              </li>
            </ul>
          </div>

          <div className="p-4 bg-emerald-50/40 border border-emerald-200 rounded-xl space-y-2">
            <h4 className="font-bold text-emerald-900 flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Automatic Section Evaluation &amp; Zero-DB Privacy</span>
            </h4>
            <p className="text-emerald-800 leading-relaxed">
              Roll numbers are immediately pseudonymized via ADR-001 HMAC-SHA256 in volatile memory. Once confirmed, SSIP evaluates each section and student for <strong>current skills</strong>, <strong>benchmark gaps</strong>, and <strong>required study topics</strong>.
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <button
            onClick={handleUploadAndValidate}
            disabled={!selectedFile || isUploading}
            className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white shadow-sm transition ${
              !selectedFile || isUploading
                ? 'bg-slate-300 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {isUploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Validating &amp; Parsing Spreadsheet...</span>
              </>
            ) : (
              <>
                <UploadCloud className="w-4 h-4" />
                <span>Validate &amp; Preview Section Sheet</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
