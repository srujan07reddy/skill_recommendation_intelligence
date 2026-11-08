import { useState, useEffect } from 'react';
import { adminApi, SchoolItem } from '../../api/admin.api';
import {
  Building2,
  GraduationCap,
  Layers,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Search,
  BookOpen,
} from 'lucide-react';

export function DepartmentManagementPage() {
  const [schools, setSchools] = useState<SchoolItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSchools = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await adminApi.getAcademicStructure();
      setSchools(data);
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'Failed to load academic structure.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSchools();
  }, []);

  const totalDepts = schools.reduce((acc, s) => acc + s.departments.length, 0);
  const totalPrograms = schools.reduce(
    (acc, s) => acc + s.departments.reduce((dAcc, d) => dAcc + d.programs.length, 0),
    0
  );

  const filteredSchools = schools.map((school) => {
    const filteredDepts = school.departments.filter(
      (dept) =>
        dept.department_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dept.department_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dept.programs.some((p) => p.program_name.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    return {
      ...school,
      departments: filteredDepts,
    };
  }).filter((school) =>
    school.school_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    school.departments.length > 0
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 uppercase tracking-wider">
              Administration Workspace
            </span>
            <span className="text-xs text-slate-400">Institutional Academic Configuration</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            Jeppiaar University Academic Structure
          </h2>
          <p className="text-xs text-slate-500">
            Hierarchical mapping of University Schools, Academic Departments, and Degree Programmes.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={loadSchools}
            disabled={isLoading}
            className="p-1.5 text-slate-500 hover:text-blue-600 rounded-lg hover:bg-slate-100 border border-slate-200 transition"
            title="Refresh structure"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-900 text-xs flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Schools</p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">{schools.length}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Autonomous Academic Units</p>
          </div>
          <div className="p-3 bg-blue-100 rounded-xl">
            <Building2 className="w-5 h-5 text-blue-700" />
          </div>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Departments</p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">{totalDepts}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Engineering & Arts Disciplines</p>
          </div>
          <div className="p-3 bg-indigo-100 rounded-xl">
            <Layers className="w-5 h-5 text-indigo-700" />
          </div>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Degree Programmes</p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">{totalPrograms}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">B.Tech, B.Sc, BCA & Postgrad</p>
          </div>
          <div className="p-3 bg-emerald-100 rounded-xl">
            <GraduationCap className="w-5 h-5 text-emerald-700" />
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by school, department name, code (e.g. CSE, ECE), or programme..."
          className="w-full text-xs pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Hierarchical Schools Accordion / Cards */}
      <div className="space-y-4">
        {filteredSchools.map((school) => (
          <div key={school.school_id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 bg-gradient-to-r from-slate-50 to-blue-50/40 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <Building2 className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-sm">{school.school_name}</h3>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">
                  {school.school_code}
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-medium">
                {school.departments.length} Department{school.departments.length !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="p-5 divide-y divide-slate-100">
              {school.departments.map((dept) => (
                <div key={dept.department_id} className="py-3 first:pt-0 last:pb-0 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-800 text-xs">{dept.department_name}</span>
                      <span className="font-mono text-[10px] text-slate-400">{dept.department_code}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center space-x-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Active</span>
                    </span>
                  </div>

                  {/* Program Pills */}
                  <div className="flex flex-wrap gap-1.5 pl-2">
                    {dept.programs.map((prog) => (
                      <span
                        key={prog.program_id}
                        className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded bg-slate-50 border border-slate-200 text-[11px] text-slate-700"
                      >
                        <BookOpen className="w-3 h-3 text-slate-400" />
                        <span>{prog.qualification} {prog.program_name}</span>
                        <span className="text-[9px] font-mono text-slate-400">({prog.program_code})</span>
                      </span>
                    ))}
                    {dept.programs.length === 0 && (
                      <span className="text-[11px] text-slate-400 italic">No degree programmes linked.</span>
                    )}
                  </div>
                </div>
              ))}

              {school.departments.length === 0 && (
                <p className="text-center py-4 text-xs text-slate-400">No departments match your search.</p>
              )}
            </div>
          </div>
        ))}

        {filteredSchools.length === 0 && (
          <div className="py-16 text-center text-slate-400 text-xs">
            No schools or departments found matching "{searchTerm}".
          </div>
        )}
      </div>
    </div>
  );
}

