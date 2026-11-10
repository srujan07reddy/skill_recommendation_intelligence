import {
  LayoutDashboard,
  UploadCloud,
  Layers,
  Compass,
  FileCheck2,
  FileSpreadsheet,
  Settings,
  ShieldCheck,
  Building,
  Users,
  Map,
} from 'lucide-react';
import { useAuthStore } from '../../features/auth/useAuthStore';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
}

export function Sidebar({ currentTab, onSelectTab }: SidebarProps) {
  const { user } = useAuthStore();
  const roles = user?.roles.map((r) => r.toLowerCase()) || [];

  const isDean = roles.includes('dean');
  const isHOD = roles.includes('hod');
  const isAdmin = roles.includes('administrator');

  return (
    <aside className="w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-65px)] p-4 flex flex-col justify-between shrink-0">
      <div className="space-y-6">
        {/* Core Analytical Workspaces */}
        <div>
          <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Intelligence Workspaces
          </p>
          <nav className="space-y-1">
            <button
              onClick={() => onSelectTab('overview')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                currentTab === 'overview'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-blue-600" />
              <span>
                {isAdmin
                  ? 'University Overall View'
                  : isDean
                  ? `${user?.school_name || 'School'} Overview`
                  : isHOD
                  ? 'Department Dashboard'
                  : 'System Overview'}
              </span>
            </button>

            {(isDean || isHOD || isAdmin) && (
              <button
                onClick={() => onSelectTab('individual-records')}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                  currentTab === 'individual-records'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Users className="w-4 h-4 text-cyan-600" />
                <span>Individual Assessment Data</span>
              </button>
            )}

            {isHOD && (
              <button
                onClick={() => onSelectTab('bulk-upload')}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                  currentTab === 'bulk-upload'
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <UploadCloud className="w-4 h-4 text-indigo-600" />
                <span>Section Bulk Upload</span>
              </button>
            )}

            {(isHOD || isDean || isAdmin) && (
              <button
                onClick={() => onSelectTab('section-eval')}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                  currentTab === 'section-eval'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Section Eval &amp; Study Plan</span>
              </button>
            )}

            {(isDean || isHOD) && (
              <button
                onClick={() => onSelectTab('ingestion')}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                  currentTab === 'ingestion'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Layers className="w-4 h-4 text-indigo-500" />
                <span>Assessment Sessions</span>
              </button>
            )}

            <button
              onClick={() => onSelectTab('analytics')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                currentTab === 'analytics'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Layers className="w-4 h-4 text-purple-600" />
              <span>Skill Analytics &amp; Gaps</span>
            </button>

            {(isDean || isAdmin) && (
              <button
                onClick={() => onSelectTab('comparison')}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                  currentTab === 'comparison'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Layers className="w-4 h-4 text-emerald-600" />
                <span>{isAdmin ? 'Cross-School Department Comparison' : `${user?.school_name || 'School'} Comparison`}</span>
              </button>
            )}

            <button
              onClick={() => onSelectTab('recommendations')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                currentTab === 'recommendations'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Compass className="w-4 h-4 text-amber-600" />
              <span>Development Events</span>
            </button>

            <button
              onClick={() => onSelectTab('roadmaps')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                currentTab === 'roadmaps'
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Map className="w-4 h-4 text-indigo-600" />
              <span>Roadmaps (roadmap.sh)</span>
            </button>
          </nav>
        </div>

        {/* Governance & Exports */}
        <div>
          <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Governance & Exports
          </p>
          <nav className="space-y-1">
            {(isDean || isHOD) && (
              <button
                onClick={() => onSelectTab('proposals')}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                  currentTab === 'proposals'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <FileCheck2 className="w-4 h-4 text-purple-600" />
                <span>{isDean ? 'Review Proposals' : 'Submit Proposal'}</span>
              </button>
            )}

            <button
              onClick={() => onSelectTab('exports')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                currentTab === 'exports'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4 text-teal-600" />
              <span>Export Center</span>
            </button>
          </nav>
        </div>

        {/* Administration Configuration (Admin/Dean) */}
        {(isAdmin || isDean) && (
          <div>
            <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Academic Settings
            </p>
            <nav className="space-y-1">
              <button
                onClick={() => onSelectTab('benchmarks')}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                  currentTab === 'benchmarks'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Curriculum Benchmarks (ADR-008)</span>
              </button>

              <button
                onClick={() => onSelectTab('academic-structure')}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                  currentTab === 'academic-structure'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Building className="w-4 h-4 text-slate-600" />
                <span>{isAdmin ? 'Schools, Depts & Deans' : 'Departments & HOD Logins'}</span>
              </button>

              <button
                onClick={() => onSelectTab('taxonomy')}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                  currentTab === 'taxonomy'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Settings className="w-4 h-4 text-slate-600" />
                <span>Skill Taxonomy</span>
              </button>

              <button
                onClick={() => onSelectTab('telemetry')}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                  currentTab === 'telemetry'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <span>Operational Telemetry</span>
              </button>
            </nav>
          </div>
        )}
      </div>

      {/* Ephemeral Architecture Indicator */}
      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-[11px] text-slate-500 space-y-1">
        <div className="flex items-center space-x-1.5 font-semibold text-slate-700">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Session Scoped</span>
        </div>
        <p className="leading-tight text-[10px]">Zero persistent student skill records. TTL eviction active.</p>
      </div>
    </aside>
  );
}
