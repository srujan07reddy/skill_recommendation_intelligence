import { useState, useEffect } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { useAuthStore } from '../../features/auth/useAuthStore';
import { LoginPage } from '../../pages/auth/LoginPage';
import { Activity, CheckCircle2 } from 'lucide-react';
import { getSystemHealth, HealthCheckResponse } from '../../api/health.api';
import { SessionResponse } from '../../api/sessions.api';
import { ValidationReportResponse } from '../../api/uploads.api';
import { SessionManagementView } from '../../features/sessions/SessionManagementView';
import { FileUploadView } from '../../features/uploads/FileUploadView';
import { ValidationResultsView } from '../../features/uploads/ValidationResultsView';
import { StudentAssessmentForm } from '../../features/assessments/StudentAssessmentForm';
import { DepartmentAnalyticsView } from '../../features/analytics/DepartmentAnalyticsView';
import { CurriculumBenchmarksView } from '../../features/benchmarks/CurriculumBenchmarksView';
import { RecommendationsView } from '../../features/recommendations/RecommendationsView';
import { InstitutionalDashboard } from '../../features/dashboards/InstitutionalDashboard';
import { DepartmentDashboard } from '../../features/dashboards/DepartmentDashboard';
import { DepartmentComparisonPage } from '../../features/comparison/DepartmentComparisonPage';
import { DevelopmentProposalPage } from '../../features/governance/DevelopmentProposalPage';
import { ProposalReviewPage } from '../../features/governance/ProposalReviewPage';
import { ExportCenterView } from '../../features/exports/ExportCenterView';
import { DepartmentManagementPage } from '../../features/admin/DepartmentManagementPage';
import { SkillTaxonomyPage } from '../../features/admin/SkillTaxonomyPage';
import { OperationalMonitoringPage } from '../../features/admin/OperationalMonitoringPage';
import { FloatingNavAssistant } from '../navigation/FloatingNavAssistant';

export function AppShell() {
  const { user, token, isLoading, initialize } = useAuthStore();
  const [currentTab, setCurrentTab] = useState('overview');
  const [health, setHealth] = useState<HealthCheckResponse | null>(null);

  // Ingestion workflow state
  const [selectedSession, setSelectedSession] = useState<SessionResponse | null>(null);
  const [ingestionStep, setIngestionStep] = useState<'sessions' | 'upload' | 'validation'>('sessions');
  const [validationReport, setValidationReport] = useState<ValidationReportResponse | null>(null);
  const [activeStudentSessionId, setActiveStudentSessionId] = useState<string | null>(null);

  useEffect(() => {
    initialize();
    getSystemHealth().then(setHealth).catch(() => {});
  }, [initialize]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-medium">Initializing SSIP Platform Security...</p>
        </div>
      </div>
    );
  }

  if (!token || !user) {
    return <LoginPage />;
  }

  const roles = user.roles.map((r) => r.toLowerCase());
  const isDean = roles.includes('dean');
  const isAdmin = roles.includes('administrator');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar
          currentTab={currentTab}
          onSelectTab={(tab) => {
            setCurrentTab(tab);
            if (tab === 'ingestion') {
              setIngestionStep('sessions');
            }
          }}
        />

        {/* Dynamic Workspace Container */}
        <main className="flex-1 p-6 md:p-8 max-w-6xl space-y-6">
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-2xl p-6 text-white shadow-md flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-700/60 text-blue-200 border border-blue-500/30">
                {user.roles[0]} Workspace
              </span>
              <h2 className="text-xl md:text-2xl font-bold mt-2">
                Welcome back, {user.full_name}
              </h2>
              <p className="text-xs md:text-sm text-blue-200 mt-1">
                {user.department_name
                  ? `${user.department_name} Department • ${user.school_name || 'Jeppiaar University'}`
                  : 'Institutional Governance Scope • Jeppiaar University'}
              </p>
            </div>
            <div className="hidden sm:block text-right space-y-1">
              <span className="inline-flex items-center text-xs font-medium text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-3 py-1 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                Phase 8 Operational Management Active
              </span>
              {health && (
                <div className="flex items-center justify-end space-x-1.5 text-[11px] text-blue-200">
                  <Activity className="w-3 h-3 text-emerald-400" />
                  <span>Engine: {health.status} ({health.storage.ephemeral_cache})</span>
                </div>
              )}
            </div>
          </div>

          {/* Active Workspace Content */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-semibold text-slate-900 capitalize">
                {currentTab.replace('-', ' ')}
              </h3>
              <span className="text-xs text-slate-400">Authenticated via signed JWT</span>
            </div>

            {currentTab === 'overview' && (
              <div className="space-y-6">
                {isDean || isAdmin ? (
                  <InstitutionalDashboard
                    onNavigateToComparison={() => setCurrentTab('comparison')}
                    onNavigateToRecommendations={() => setCurrentTab('recommendations')}
                  />
                ) : (
                  <DepartmentDashboard
                    onNavigateToRecommendations={() => setCurrentTab('recommendations')}
                    onNavigateToBenchmarks={() => setCurrentTab('benchmarks')}
                  />
                )}
              </div>
            )}

            {currentTab === 'comparison' && (
              <DepartmentComparisonPage />
            )}

            {currentTab === 'ingestion' && (
              <div>
                {ingestionStep === 'sessions' && (
                  <SessionManagementView
                    selectedSessionId={selectedSession?.session_id || null}
                    onSelectSession={setSelectedSession}
                    onNavigateToIngestion={() => setIngestionStep('upload')}
                    onNavigateToStudentForm={(sid) => {
                      setActiveStudentSessionId(sid);
                      setCurrentTab('student-form');
                    }}
                  />
                )}

                {ingestionStep === 'upload' && selectedSession && (
                  <FileUploadView
                    session={selectedSession}
                    onValidationComplete={(report) => {
                      setValidationReport(report);
                      setIngestionStep('validation');
                    }}
                    onBack={() => setIngestionStep('sessions')}
                  />
                )}

                {ingestionStep === 'validation' && selectedSession && validationReport && (
                  <ValidationResultsView
                    report={validationReport}
                    session={selectedSession}
                    onConfirmSuccess={() => {
                      alert('Dataset successfully committed into active session buffer!');
                      setIngestionStep('sessions');
                    }}
                    onReupload={() => setIngestionStep('upload')}
                  />
                )}
              </div>
            )}

            {currentTab === 'student-form' && (
              <div>
                {activeStudentSessionId || selectedSession?.session_id ? (
                  <StudentAssessmentForm
                    sessionId={activeStudentSessionId || selectedSession!.session_id}
                    onBack={() => setCurrentTab('ingestion')}
                  />
                ) : (
                  <div className="text-center py-12 space-y-3">
                    <p className="text-sm font-semibold text-slate-700">No session selected</p>
                    <p className="text-xs text-slate-400">
                      Please select or activate an assessment session from the Sessions & Ingestion view first.
                    </p>
                    <button
                      onClick={() => setCurrentTab('ingestion')}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition"
                    >
                      Go to Sessions
                    </button>
                  </div>
                )}
              </div>
            )}

            {currentTab === 'analytics' && (
              <div>
                {selectedSession?.session_id ? (
                  <DepartmentAnalyticsView
                    sessionId={selectedSession.session_id}
                    defaultDepartmentId={user.department_id || 'DEPT-CSE'}
                  />
                ) : (
                  <div className="text-center py-12 space-y-3">
                    <p className="text-sm font-semibold text-slate-700">No session selected for analysis</p>
                    <p className="text-xs text-slate-400">
                      Please select an assessment session with ingested student records to compute skill intelligence.
                    </p>
                    <button
                      onClick={() => setCurrentTab('ingestion')}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition"
                    >
                      Select an Active Session
                    </button>
                  </div>
                )}
              </div>
            )}

            {currentTab === 'benchmarks' && (
              <CurriculumBenchmarksView />
            )}

            {currentTab === 'recommendations' && (
              <div>
                {selectedSession?.session_id ? (
                  <RecommendationsView sessionId={selectedSession.session_id} />
                ) : (
                  <div className="text-center py-12 space-y-3">
                    <p className="text-sm font-semibold text-slate-700">No session selected for recommendations</p>
                    <p className="text-xs text-slate-400">
                      Please select an assessment session with evaluated skill gaps to view recommended events.
                    </p>
                    <button
                      onClick={() => setCurrentTab('ingestion')}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition"
                    >
                      Select an Active Session
                    </button>
                  </div>
                )}
              </div>
            )}

            {currentTab === 'proposals' && (
              isDean || isAdmin ? (
                <ProposalReviewPage />
              ) : (
                <DevelopmentProposalPage />
              )
            )}

            {currentTab === 'exports' && (
              <ExportCenterView />
            )}

            {currentTab === 'academic-structure' && (
              <DepartmentManagementPage />
            )}

            {currentTab === 'taxonomy' && (
              <SkillTaxonomyPage />
            )}

            {currentTab === 'telemetry' && (
              <OperationalMonitoringPage />
            )}

            {currentTab !== 'overview' &&
              currentTab !== 'ingestion' &&
              currentTab !== 'student-form' &&
              currentTab !== 'analytics' &&
              currentTab !== 'benchmarks' &&
              currentTab !== 'recommendations' &&
              currentTab !== 'comparison' &&
              currentTab !== 'proposals' &&
              currentTab !== 'exports' &&
              currentTab !== 'academic-structure' &&
              currentTab !== 'taxonomy' &&
              currentTab !== 'telemetry' && (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <p className="text-sm font-medium text-slate-600 capitalize">{currentTab.replace('-', ' ')} Module</p>
                <p className="text-xs text-slate-400">Scheduled for sequential activation in subsequent development phases.</p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Floating Feature & Navigation Assistant */}
      <FloatingNavAssistant
        currentTab={currentTab}
        onNavigate={(tab) => {
          setCurrentTab(tab);
          if (tab === 'ingestion') {
            setIngestionStep('sessions');
          }
        }}
      />
    </div>
  );
}
