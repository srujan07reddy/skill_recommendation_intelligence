import { useState } from 'react';
import { uploadsApi, ValidationReportResponse } from '../../api/uploads.api';
import { SessionResponse } from '../../api/sessions.api';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowLeft,
  ShieldCheck,
  Database,
  FileCheck,
} from 'lucide-react';

interface ValidationResultsViewProps {
  report: ValidationReportResponse;
  session: SessionResponse;
  onConfirmSuccess: (committedCount: number) => void;
  onReupload: () => void;
}

export function ValidationResultsView({
  report,
  session,
  onConfirmSuccess,
  onReupload,
}: ValidationResultsViewProps) {
  const [isCommitting, setIsCommitting] = useState(false);
  const [commitError, setCommitError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setIsCommitting(true);
    setCommitError(null);

    try {
      const res = await uploadsApi.confirmUpload(session.session_id, report.upload_id);
      onConfirmSuccess(res.committed_records_count);
    } catch (err: any) {
      setCommitError(
        err?.response?.data?.error?.message || 'Failed to commit dataset into session buffer.'
      );
    } finally {
      setIsCommitting(false);
    }
  };

  const isInvalid = report.validation_status === 'INVALID' || report.valid_rows_count === 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={onReupload}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <span>Dataset Validation Report</span>
              {report.format_detected && (
                <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 text-[10px] font-bold uppercase">
                  {report.format_detected} Format
                </span>
              )}
              {report.sections_detected && report.sections_detected.length > 0 && (
                <span className="px-2 py-0.5 rounded bg-cyan-100 text-cyan-800 text-[10px] font-bold">
                  Sections: {report.sections_detected.join(', ')}
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-500">
              File: <strong className="text-slate-800">{report.filename}</strong> • Session:{' '}
              <strong className="text-slate-800">{session.session_name}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onReupload}
            className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition"
          >
            Re-Upload File
          </button>
          <button
            onClick={handleConfirm}
            disabled={isInvalid || isCommitting}
            className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold text-white shadow-sm transition ${
              isInvalid || isCommitting
                ? 'bg-slate-300 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
          >
            {isCommitting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Committing Records...</span>
              </>
            ) : (
              <>
                <FileCheck className="w-4 h-4" />
                <span>Confirm & Import ({report.valid_rows_count} Rows)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {commitError && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs flex items-center space-x-2">
          <XCircle className="w-4 h-4 shrink-0" />
          <span>{commitError}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <p className="text-xs text-slate-500 font-medium">Total Rows Parsed</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{report.total_rows}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Read from spreadsheet</p>
        </div>

        <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-200">
          <p className="text-xs text-emerald-700 font-semibold flex items-center space-x-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Valid for Import</span>
          </p>
          <p className="text-2xl font-bold text-emerald-900 mt-1">{report.valid_rows_count}</p>
          <p className="text-[11px] text-emerald-600 mt-0.5">Ready to enter active buffer</p>
        </div>

        <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-200">
          <p className="text-xs text-amber-700 font-semibold flex items-center space-x-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Duplicate Warnings</span>
          </p>
          <p className="text-2xl font-bold text-amber-900 mt-1">{report.warning_rows_count}</p>
          <p className="text-[11px] text-amber-600 mt-0.5">ADR-006: Overwritten with latest</p>
        </div>

        <div className="bg-rose-50/50 p-4 rounded-xl border border-rose-200">
          <p className="text-xs text-rose-700 font-semibold flex items-center space-x-1">
            <XCircle className="w-3.5 h-3.5" />
            <span>Error Rows</span>
          </p>
          <p className="text-2xl font-bold text-rose-900 mt-1">{report.error_rows_count}</p>
          <p className="text-[11px] text-rose-600 mt-0.5">Unrecognized skills/departments</p>
        </div>
      </div>

      {/* Validation Errors & Warnings Table */}
      {report.errors.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-800">
              Validation Diagnostics ({report.errors.length} Issues)
            </h4>
            <span className="text-[11px] text-slate-500">
              Errors must be resolved before full dataset import
            </span>
          </div>

          <div className="max-h-60 overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-600 sticky top-0">
                <tr>
                  <th className="p-2.5">Row</th>
                  <th className="p-2.5">Column</th>
                  <th className="p-2.5">Value</th>
                  <th className="p-2.5">Severity</th>
                  <th className="p-2.5">Diagnostic Message</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {report.errors.map((err, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="p-2.5 font-mono text-slate-700">#{err.row_index}</td>
                    <td className="p-2.5 font-semibold text-slate-800">{err.column}</td>
                    <td className="p-2.5 font-mono text-slate-600 truncate max-w-xs">
                      {err.value || '<empty>'}
                    </td>
                    <td className="p-2.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          err.severity === 'ERROR'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {err.severity}
                      </span>
                    </td>
                    <td className="p-2.5 text-slate-700">{err.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sample Valid Rows Preview */}
      {report.sample_valid_rows.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <h4 className="text-xs font-bold text-slate-800">
                Pseudonymized Sample Records (First {report.sample_valid_rows.length} Rows)
              </h4>
            </div>
            <span className="text-[11px] text-slate-500">
              Raw roll numbers pseudonymized via ADR-001 HMAC
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-600">
                <tr>
                  <th className="p-2.5">Session Student Pseudonym</th>
                  <th className="p-2.5">Department</th>
                  <th className="p-2.5">Section</th>
                  <th className="p-2.5">Canonical Skill Name</th>
                  <th className="p-2.5">Proficiency Level (ADR-007)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {report.sample_valid_rows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 font-mono text-[11px]">
                    <td className="p-2.5 text-indigo-700 font-bold">
                      {row.session_student_ref}
                    </td>
                    <td className="p-2.5 text-slate-700">{row.department_code}</td>
                    <td className="p-2.5 text-cyan-700 font-semibold font-sans">
                      {row.section || 'General'}
                    </td>
                    <td className="p-2.5 text-slate-900 font-semibold font-sans">
                      {row.skill_name}
                    </td>
                    <td className="p-2.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 font-sans">
                        {row.proficiency_level}
                        {row.raw_score !== undefined && row.raw_score !== null ? ` (${row.raw_score}%)` : ''}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirmation Bottom Banner */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-2 text-xs text-slate-600">
          <Database className="w-4 h-4 text-indigo-600 shrink-0" />
          <span>
            Clicking <strong>Confirm & Import</strong> writes {report.valid_rows_count} records to the active session ephemeral buffer. Upload preview buffer will be deleted immediately.
          </span>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={onReupload}
            className="px-3 py-1.5 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold transition"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isInvalid || isCommitting}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold text-white shadow-sm transition ${
              isInvalid || isCommitting
                ? 'bg-slate-300 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
          >
            {isCommitting ? 'Importing...' : 'Confirm Import'}
          </button>
        </div>
      </div>
    </div>
  );
}

