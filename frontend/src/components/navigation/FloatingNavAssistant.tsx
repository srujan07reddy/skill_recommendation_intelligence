import React, { useState, useEffect, useMemo } from 'react';
import {
  Compass,
  Search,
  X,
  LayoutDashboard,
  UploadCloud,
  Layers,
  FileCheck2,
  FileSpreadsheet,
  ShieldCheck,
  Building,
  Settings,
  Activity,
  ArrowRight,
  BookOpen,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  FolderTree,
  Users,
} from 'lucide-react';
import { useAuthStore } from '../../features/auth/useAuthStore';

interface NavFeature {
  id: string;
  name: string;
  category: 'Intelligence' | 'Governance & Exports' | 'Academic Administration';
  description: string;
  rolesAllowed: string[]; // ['dean', 'hod', 'administrator', 'faculty']
  icon: React.ComponentType<{ className?: string }>;
  recommendedFor?: string;
  keywords: string[];
}

interface FloatingNavAssistantProps {
  currentTab: string;
  onNavigate: (tabId: string) => void;
}

export function FloatingNavAssistant({ currentTab, onNavigate }: FloatingNavAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeView, setActiveView] = useState<'features' | 'guide'>('features');
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuthStore();

  const userRoles = useMemo(
    () => user?.roles.map((r) => r.toLowerCase()) || [],
    [user]
  );

  const features: NavFeature[] = useMemo(
    () => [
      {
        id: 'overview',
        name: userRoles.includes('dean')
          ? 'Institutional Overview Dashboard'
          : userRoles.includes('hod')
          ? 'Department Dashboard'
          : 'System Overview',
        category: 'Intelligence',
        description:
          'High-level university KPI cards, skill penetration rates, and top canonical competencies.',
        rolesAllowed: ['dean', 'hod', 'administrator', 'faculty'],
        icon: LayoutDashboard,
        keywords: ['overview', 'dashboard', 'kpi', 'penetration', 'summary', 'home'],
      },
      {
        id: 'ingestion',
        name: 'Sessions & Data Ingestion',
        category: 'Intelligence',
        description:
          'Create time-bounded assessment windows, upload Excel (.xlsx) / CSV datasets, and inspect row validation reports.',
        rolesAllowed: ['dean', 'hod', 'administrator'],
        icon: UploadCloud,
        recommendedFor: 'HODs & Academic Deans',
        keywords: ['sessions', 'upload', 'import', 'excel', 'csv', 'validation', 'ingestion'],
      },
      {
        id: 'analytics',
        name: 'Skill Analytics & Curriculum Gaps',
        category: 'Intelligence',
        description:
          'Explore 3-tier proficiency breakdowns (Beginner/Intermediate/Expert) and matrix gap heatmaps.',
        rolesAllowed: ['dean', 'hod', 'administrator', 'faculty'],
        icon: Layers,
        keywords: ['analytics', 'skills', 'gaps', 'heatmap', 'proficiency', 'distribution'],
      },
      {
        id: 'student-form',
        name: 'Student Assessment Portal',
        category: 'Intelligence',
        description:
          'Direct self-evaluation entry for students to rate their technical skills during an active session.',
        rolesAllowed: ['dean', 'hod', 'administrator', 'faculty', 'student'],
        icon: FileCheck2,
        keywords: ['student', 'form', 'self assessment', 'evaluation', 'submit'],
      },
      {
        id: 'individual-records',
        name: 'Individual Assessment Records',
        category: 'Intelligence',
        description:
          'Inspect individual student skill submissions, proficiency ratings, and timestamps with CSV export capabilities.',
        rolesAllowed: ['dean', 'hod', 'administrator'],
        icon: Users,
        keywords: ['individual', 'records', 'students', 'evaluations', 'raw data', 'submissions', 'rows'],
      },
      {
        id: 'comparison',
        name: 'Department Comparison Workspace',
        category: 'Intelligence',
        description:
          'Side-by-side competency comparisons between programs within a school (e.g. CSE vs IT vs AI&DS).',
        rolesAllowed: ['dean', 'administrator'],
        icon: FolderTree,
        recommendedFor: 'Dean of Academics',
        keywords: ['comparison', 'benchmark', 'school', 'cross department', 'trends'],
      },
      {
        id: 'recommendations',
        name: 'Targeted Development Events',
        category: 'Intelligence',
        description:
          'Deterministic recommendations mapping detected curriculum deficits to Bootcamps, Workshops, and Certifications.',
        rolesAllowed: ['dean', 'hod', 'administrator', 'faculty'],
        icon: Compass,
        keywords: ['recommendations', 'bootcamp', 'workshop', 'events', 'training', 'interventions'],
      },
      {
        id: 'proposals',
        name: userRoles.includes('dean') || userRoles.includes('administrator')
          ? 'Governance Proposal Review'
          : 'Submit Training Proposal',
        category: 'Governance & Exports',
        description:
          'HOD proposal formulation and Dean institutional approval workflow (ADR-002 ephemeral governance).',
        rolesAllowed: ['dean', 'hod', 'administrator'],
        icon: FileCheck2,
        keywords: ['proposals', 'governance', 'funding', 'budget', 'approval', 'dean review'],
      },
      {
        id: 'exports',
        name: 'Institutional Export Center',
        category: 'Governance & Exports',
        description:
          'Download multi-tab Excel summaries, CSV data, executive PDF reports, and complete ZIP packages with SHA-256 manifests.',
        rolesAllowed: ['dean', 'hod', 'administrator', 'faculty'],
        icon: FileSpreadsheet,
        keywords: ['exports', 'excel', 'pdf', 'csv', 'zip', 'manifest', 'reports'],
      },
      {
        id: 'benchmarks',
        name: 'Curriculum Benchmarks (ADR-008)',
        category: 'Academic Administration',
        description:
          'Review candidate skill mappings and grant institutional approval to activate benchmarks for gap analysis.',
        rolesAllowed: ['dean', 'administrator'],
        icon: ShieldCheck,
        recommendedFor: 'Dean of Academics',
        keywords: ['benchmarks', 'curriculum', 'approval', 'draft', 'adr-008'],
      },
      {
        id: 'academic-structure',
        name: 'Jeppiaar Academic Structure',
        category: 'Academic Administration',
        description:
          'Manage university Schools (Computing, Engineering, Management), Departments, and Degree Programs.',
        rolesAllowed: ['dean', 'administrator'],
        icon: Building,
        keywords: ['schools', 'departments', 'programs', 'academic structure', 'faculty'],
      },
      {
        id: 'taxonomy',
        name: 'Canonical Skill Taxonomy',
        category: 'Academic Administration',
        description:
          'Browse approved technical skill inventory, domain hierarchies, and alias resolution dictionaries.',
        rolesAllowed: ['dean', 'administrator'],
        icon: Settings,
        keywords: ['taxonomy', 'skills', 'aliases', 'normalization', 'domains', 'categories'],
      },
      {
        id: 'telemetry',
        name: 'Operational & Privacy Telemetry',
        category: 'Academic Administration',
        description:
          'Real-time session monitoring, 7-boundary zero-retention compliance matrix, and emergency data purges.',
        rolesAllowed: ['dean', 'administrator'],
        icon: Activity,
        keywords: ['telemetry', 'privacy', 'zero retention', 'cleanup', 'sweep', 'purge'],
      },
    ],
    [userRoles]
  );

  // Filter features based on user role and search query
  const filteredFeatures = useMemo(() => {
    return features.filter((feat) => {
      const roleMatches =
        feat.rolesAllowed.some((r) => userRoles.includes(r)) || userRoles.includes('administrator');
      if (!roleMatches) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        feat.name.toLowerCase().includes(q) ||
        feat.description.toLowerCase().includes(q) ||
        feat.category.toLowerCase().includes(q) ||
        feat.keywords.some((k) => k.includes(q))
      );
    });
  }, [features, userRoles, searchQuery]);

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleSelect = (tabId: string) => {
    onNavigate(tabId);
    setIsOpen(false);
  };

  return (
    <>
      {/* Floating Action Button (FAB) */}
      <div className="fixed bottom-6 right-6 z-40 flex items-center gap-3">
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white font-medium text-xs px-4 py-3 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 border border-blue-400/30"
          title="Open Feature Navigator & Tour (Ctrl+K)"
          aria-label="Open Feature Navigator"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
          </span>
          <Compass className="w-4 h-4 text-white group-hover:rotate-45 transition-transform duration-300" />
          <span className="font-semibold tracking-wide">Explore Features</span>
          <span className="hidden sm:inline-block text-[10px] bg-white/20 px-1.5 py-0.5 rounded font-mono text-blue-100">
            Ctrl+K
          </span>
        </button>
      </div>

      {/* Modal Backdrop & Container */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 animate-in fade-in duration-150">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsOpen(false)}
          />

          <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden z-10 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-indigo-50/30">
              <div className="flex items-center gap-3">
                <span className="p-2 bg-blue-600 text-white rounded-xl shadow-xs">
                  <Sparkles className="w-5 h-5" />
                </span>
                <div>
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    SSIP Feature Navigator & Guide
                    <span className="text-[11px] font-normal px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                      Jeppiaar University
                    </span>
                  </h2>
                  <p className="text-xs text-slate-500">
                    Quickly jump to any intelligence workspace, governance tool, or curriculum settings.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex bg-slate-200/70 p-0.5 rounded-lg text-xs font-semibold">
                  <button
                    onClick={() => setActiveView('features')}
                    className={`px-3 py-1 rounded-md transition-all ${
                      activeView === 'features'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Feature Directory
                  </button>
                  <button
                    onClick={() => setActiveView('guide')}
                    className={`px-3 py-1 rounded-md transition-all flex items-center gap-1 ${
                      activeView === 'guide'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                    Workflow Tour
                  </button>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
                  aria-label="Close Navigator"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* View 1: Search & Feature Directory */}
            {activeView === 'features' && (
              <div className="flex-1 flex flex-col min-h-0">
                {/* Search Bar */}
                <div className="p-4 border-b border-slate-100 bg-white">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      autoFocus
                      placeholder="Type a feature name, keyword, or workflow (e.g. heatmap, upload, proposal, exports)..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                {/* Features List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {filteredFeatures.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 space-y-2">
                      <HelpCircle className="w-8 h-8 mx-auto text-slate-300" />
                      <p className="text-sm font-semibold text-slate-600">No matching features found</p>
                      <p className="text-xs text-slate-400">
                        Try searching for keywords like "analytics", "excel", "dean", or "purges".
                      </p>
                    </div>
                  ) : (
                    filteredFeatures.map((feat) => {
                      const Icon = feat.icon;
                      const isCurrent = currentTab === feat.id;
                      return (
                        <div
                          key={feat.id}
                          onClick={() => handleSelect(feat.id)}
                          className={`group p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                            isCurrent
                              ? 'bg-blue-50/60 border-blue-300 shadow-xs ring-1 ring-blue-400/20'
                              : 'bg-white border-slate-200/80 hover:border-blue-300 hover:bg-slate-50/70 hover:shadow-xs'
                          }`}
                        >
                          <div className="flex items-start gap-3.5">
                            <span
                              className={`p-2.5 rounded-xl transition-colors shrink-0 mt-0.5 ${
                                isCurrent
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-slate-100 text-slate-600 group-hover:bg-blue-100 group-hover:text-blue-700'
                              }`}
                            >
                              <Icon className="w-5 h-5" />
                            </span>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                                  {feat.name}
                                </h3>
                                {isCurrent && (
                                  <span className="text-[10px] font-semibold px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                                    Current View
                                  </span>
                                )}
                                {feat.recommendedFor && (
                                  <span className="text-[10px] font-medium px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full">
                                    {feat.recommendedFor}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                                {feat.description}
                              </p>
                              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mt-1.5 inline-block">
                                Category: {feat.category}
                              </span>
                            </div>
                          </div>

                          <div className="pl-4 shrink-0">
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400 group-hover:text-blue-600 transition-colors">
                              Open
                              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* View 2: End-to-End Workflow Tour Guide */}
            {activeView === 'guide' && (
              <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-slate-50/50">
                <div className="bg-white p-4 rounded-xl border border-blue-200 shadow-xs flex items-center gap-3">
                  <span className="p-2 bg-blue-50 text-blue-700 rounded-lg shrink-0">
                    <BookOpen className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Jeppiaar University SSIP Workflow Lifecycle
                    </h3>
                    <p className="text-xs text-slate-500">
                      Standard operating procedure tracing data from ingestion through governance and zero-retention purge.
                    </p>
                  </div>
                </div>

                <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
                  {/* Step 1 */}
                  <div className="relative">
                    <span className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] font-bold flex items-center justify-center ring-4 ring-white">
                      1
                    </span>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-slate-900">1. Session Creation & Ingestion</h4>
                        <button
                          onClick={() => handleSelect('ingestion')}
                          className="text-xs text-blue-600 font-semibold hover:underline"
                        >
                          Go to Ingestion →
                        </button>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">
                        HOD or Dean opens a time-bounded session (e.g. 24h retention) and uploads cohort assessment spreadsheets (.xlsx/.csv). Raw roll numbers are converted to HMAC pseudonyms and never stored permanently.
                      </p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="relative">
                    <span className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] font-bold flex items-center justify-center ring-4 ring-white">
                      2
                    </span>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-slate-900">2. Skill Distribution & Gap Analysis</h4>
                        <button
                          onClick={() => handleSelect('analytics')}
                          className="text-xs text-blue-600 font-semibold hover:underline"
                        >
                          Go to Analytics →
                        </button>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">
                        The engine computes 3-tier proficiency (Beginner, Intermediate, Expert) and evaluates cohort coverage against approved curriculum benchmarks (ADR-008).
                      </p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="relative">
                    <span className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] font-bold flex items-center justify-center ring-4 ring-white">
                      3
                    </span>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-slate-900">3. Deterministic Event Recommendations</h4>
                        <button
                          onClick={() => handleSelect('recommendations')}
                          className="text-xs text-blue-600 font-semibold hover:underline"
                        >
                          Go to Events →
                        </button>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">
                        Detected gaps automatically generate institutional interventions: Critical Gaps trigger Bootcamps; Coverage Deficits trigger Workshops; Advanced Gaps trigger Certification Prep.
                      </p>
                    </div>
                  </div>

                  {/* Step 4 */}
                  <div className="relative">
                    <span className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] font-bold flex items-center justify-center ring-4 ring-white">
                      4
                    </span>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-slate-900">4. Ephemeral Governance Proposal</h4>
                        <button
                          onClick={() => handleSelect('proposals')}
                          className="text-xs text-blue-600 font-semibold hover:underline"
                        >
                          Go to Proposals →
                        </button>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">
                        HOD submits a training proposal linked to specific gap metrics. The Dean reviews justification, adjusts budget, and records approval (ADR-002).
                      </p>
                    </div>
                  </div>

                  {/* Step 5 */}
                  <div className="relative">
                    <span className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] font-bold flex items-center justify-center ring-4 ring-white">
                      5
                    </span>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-slate-900">5. Multi-Format Institutional Exports</h4>
                        <button
                          onClick={() => handleSelect('exports')}
                          className="text-xs text-blue-600 font-semibold hover:underline"
                        >
                          Go to Exports →
                        </button>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">
                        Export formatted Excel sheets with formula protection, CSV summaries, executive PDF reports, or complete ZIP packages with cryptographic SHA-256 manifests (ADR-005).
                      </p>
                    </div>
                  </div>

                  {/* Step 6 */}
                  <div className="relative">
                    <span className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] font-bold flex items-center justify-center ring-4 ring-white">
                      ✓
                    </span>
                    <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-200 shadow-xs">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-emerald-900">6. Zero-Retention Data Purge</h4>
                        <button
                          onClick={() => handleSelect('telemetry')}
                          className="text-xs text-emerald-700 font-semibold hover:underline"
                        >
                          Telemetry & Purge →
                        </button>
                      </div>
                      <p className="text-xs text-emerald-700 mt-1">
                        Upon session expiration or manual purge, all ephemeral assessment memory and temporary export files are permanently destroyed across all 7 privacy boundaries.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Modal Footer */}
            <div className="p-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Zero-Retention Architecture Active</span>
              </div>
              <div className="flex items-center gap-3">
                <span>Press <kbd className="px-1.5 py-0.5 bg-slate-200 rounded text-[10px] font-mono">Esc</kbd> to close</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

