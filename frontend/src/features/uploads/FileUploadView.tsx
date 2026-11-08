import React, { useState, useRef } from 'react';
import { uploadsApi, ValidationReportResponse } from '../../api/uploads.api';
import { SessionResponse } from '../../api/sessions.api';
import { UploadCloud, FileSpreadsheet, AlertCircle, ArrowLeft, Download } from 'lucide-react';

interface FileUploadViewProps {
  session: SessionResponse;
  onValidationComplete: (report: ValidationReportResponse) => void;
  onBack: () => void;
}

export function FileUploadView({ session, onValidationComplete, onBack }: FileUploadViewProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      validateAndSetFile(file);
    }
  };

  const validateAndSetFile = (file: File) => {
    setErrorMessage(null);
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext !== 'xlsx' && ext !== 'csv') {
      setErrorMessage('Unsupported file format. Please upload an Excel (.xlsx) or CSV (.csv) file.');
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setErrorMessage('File size exceeds maximum allowable limit of 25MB.');
      return;
    }

    setSelectedFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setErrorMessage(null);

    try {
      const report = await uploadsApi.uploadDataset(session.session_id, selectedFile);
      onValidationComplete(report);
    } catch (err: any) {
      setErrorMessage(
        err?.response?.data?.error?.message ||
          'Failed to upload and validate file. Please ensure columns match the required format.'
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownloadTemplate = () => {
    const csvContent =
      'Student ID,Department,Degree Program,Skill Name,Proficiency Level\n' +
      'JEP2026CSE001,DEPT-CSE,PRG-SET-CSE,Python,Intermediate\n' +
      'JEP2026CSE002,DEPT-CSE,PRG-SET-CSE,SQL,Beginner\n' +
      'JEP2026CSE003,DEPT-CSE,PRG-SET-CSE,Data Structures,Expert\n';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'SSIP_Skill_Assessment_Template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Session Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Bulk Dataset Ingestion
            </h3>
            <p className="text-xs text-slate-500">
              Target Session: <strong className="text-slate-800">{session.session_name}</strong> ({session.status})
            </p>
          </div>
        </div>

        <button
          onClick={handleDownloadTemplate}
          className="flex items-center space-x-1.5 px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download CSV Template</span>
        </button>
      </div>

      {errorMessage && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Drag & Drop Upload Zone */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition ${
          selectedFile
            ? 'border-indigo-400 bg-indigo-50/20'
            : 'border-slate-300 hover:border-indigo-400 bg-slate-50/50 hover:bg-indigo-50/10'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.csv"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="max-w-md mx-auto space-y-3">
          <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto">
            <UploadCloud className="w-6 h-6" />
          </div>

          {selectedFile ? (
            <div>
              <p className="text-sm font-bold text-slate-900 flex items-center justify-center space-x-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>{selectedFile.name}</span>
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready for validation
              </p>
              <p className="text-xs text-indigo-600 font-medium mt-2">
                Click or drag another file to replace
              </p>
            </div>
          ) : (
            <div>
              <p className="text-sm font-bold text-slate-800">
                Click to browse or drag and drop your spreadsheet here
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Supports Excel (.xlsx) and CSV (.csv) up to 25MB
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Formatting Guidelines & Boundary Reminder */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2">
          <h4 className="font-bold text-slate-800">Required Column Headers</h4>
          <ul className="space-y-1 text-slate-600 list-disc list-inside">
            <li><strong>Student ID / Roll No</strong>: Pseudonymized via ADR-001 HMAC</li>
            <li><strong>Department</strong>: e.g. DEPT-CSE, Computer Science & Engineering</li>
            <li><strong>Skill Name</strong>: Canonical name or approved alias (e.g. Python, SQL)</li>
            <li><strong>Proficiency Level</strong>: Beginner, Intermediate, Expert (ADR-007)</li>
            <li><em>Degree Program (Optional)</em>: e.g. PRG-SET-CSE</li>
          </ul>
        </div>

        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
          <h4 className="font-bold text-slate-800">Zero-Retention Privacy Guarantee</h4>
          <p className="text-slate-600 leading-relaxed">
            Raw student identifiers are strictly used to compute the session-scoped HMAC pseudonym and are immediately discarded. Neither the uploaded file nor student roll numbers are ever written to the relational database.
          </p>
        </div>
      </div>

      {/* Action Button */}
      <div className="flex items-center justify-end space-x-3 pt-2">
        <button
          onClick={onBack}
          className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg text-xs font-semibold transition"
        >
          Cancel
        </button>

        <button
          onClick={handleUpload}
          disabled={!selectedFile || isUploading}
          className={`flex items-center space-x-2 px-5 py-2 rounded-lg text-xs font-semibold text-white shadow-sm transition ${
            !selectedFile || isUploading
              ? 'bg-slate-300 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
        >
          {isUploading ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Validating Dataset...</span>
            </>
          ) : (
            <>
              <UploadCloud className="w-4 h-4" />
              <span>Validate & Preview Dataset</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

