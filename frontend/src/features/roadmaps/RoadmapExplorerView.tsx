import { useState, useEffect } from 'react';
import {
  recommendationsApi,
  SessionRoadmapAnalysisResponse,
  RoadmapRoleTrackAnalysis,
  RoadmapRoleNode,
} from '../../api/recommendations.api';
import { sessionsApi, SessionResponse } from '../../api/sessions.api';
import { useAuthStore } from '../auth/useAuthStore';
import {
  Map,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  RefreshCw,
  ArrowRight,
  Compass,
  BookOpen,
} from 'lucide-react';

interface RoadmapExplorerViewProps {
  initialSessionId?: string;
}

export function RoadmapExplorerView({ initialSessionId }: RoadmapExplorerViewProps) {
  const { user } = useAuthStore();
  const [sessions, setSessions] = useState<SessionResponse[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string>(initialSessionId || '');
  const [selectedSection, setSelectedSection] = useState<string>('ALL');

  const [analysis, setAnalysis] = useState<SessionRoadmapAnalysisResponse | null>(null);
  const [catalogFallback, setCatalogFallback] = useState<RoadmapRoleTrackAnalysis[]>([]);
  const [selectedTrackSlug, setSelectedTrackSlug] = useState<string>('backend');
  const [selectedNode, setSelectedNode] = useState<RoadmapRoleNode | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([sessionsApi.listSessions(), recommendationsApi.getRoadmapCatalog()])
      .then(([sessData, catData]) => {
        setSessions(sessData);
        if (catData?.role_tracks) {
          const fallbackTracks: RoadmapRoleTrackAnalysis[] = catData.role_tracks.map((t) => ({
            role_track: t.role_track,
            slug: t.slug,
            roadmap_url: t.url,
            description: t.description,
            readiness_percentage: 0,
            total_nodes: t.skills.length,
            mastered_count: 0,
            developing_count: 0,
            missing_count: t.skills.length,
            nodes: t.skills.map((sk) => {
              const skMeta = (catData.skill_tracks || []).find(
                (st: any) => st.skill_key.toLowerCase() === sk.toLowerCase()
              );
              return {
                skill_name: sk,
                status: 'MISSING',
                student_count: 0,
                coverage_percentage: 0,
                actual_proficiency: 0,
                target_proficiency: 2.0,
                gap_severity: 'BASELINE',
                roadmap_slug: skMeta?.slug || t.slug,
                roadmap_url: skMeta?.roadmap_url || t.url,
                prerequisites: skMeta?.prerequisites || [],
                recommended_milestones: skMeta?.milestones?.INTERMEDIATE || skMeta?.milestones?.BEGINNER || [],
              };
            }),
          }));
          setCatalogFallback(fallbackTracks);
        }

        if (initialSessionId) {
          setSelectedSessionId(initialSessionId);
        } else if (sessData.length > 0) {
          const best =
            sessData.find((s) => s.status === 'Active' && s.record_count > 0) ||
            sessData.find((s) => s.status === 'Active') ||
            sessData[0];
          setSelectedSessionId(best.session_id);
        }
      })
      .catch(() => {});
  }, [initialSessionId]);

  const fetchRoadmapAnalysis = async () => {
    if (!selectedSessionId) return;
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await recommendationsApi.getSessionRoadmapAnalysis(selectedSessionId, {
        department_id: user?.department_id || undefined,
        section: selectedSection,
        include_draft: true,
      });
      setAnalysis(data);
      if (data.role_tracks.length > 0) {
        const currentExists = data.role_tracks.some((r) => r.slug === selectedTrackSlug);
        const chosen = currentExists
          ? data.role_tracks.find((r) => r.slug === selectedTrackSlug)!
          : data.role_tracks[0];
        setSelectedTrackSlug(chosen.slug);
        setSelectedNode(chosen.nodes[0] || null);
      }
    } catch (err: any) {
      setErrorMessage(
        err?.response?.data?.error?.message || 'Unable to overlay session data onto roadmap.sh paths.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRoadmapAnalysis();
  }, [selectedSessionId, selectedSection]);

  const tracks = analysis?.role_tracks || catalogFallback;
  const activeTrack =
    tracks.find((t) => t.slug === selectedTrackSlug) || tracks[0] || null;

  useEffect(() => {
    if (activeTrack && activeTrack.nodes.length > 0) {
      if (!selectedNode || !activeTrack.nodes.some((n) => n.skill_name === selectedNode.skill_name)) {
        setSelectedNode(activeTrack.nodes[0]);
      }
    }
  }, [activeTrack]);

  const getNodeStyle = (status: string) => {
    switch (status) {
      case 'MASTERED':
        return {
          card: 'border-emerald-300 bg-emerald-50/70 hover:bg-emerald-50',
          badge: 'bg-emerald-100 text-emerald-800',
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />,
        };
      case 'DEVELOPING':
        return {
          card: 'border-amber-300 bg-amber-50/70 hover:bg-amber-50',
          badge: 'bg-amber-100 text-amber-800',
          icon: <Clock className="w-4 h-4 text-amber-600 shrink-0" />,
        };
      default:
        return {
          card: 'border-rose-200 bg-rose-50/60 hover:bg-rose-50',
          badge: 'bg-rose-100 text-rose-800',
          icon: <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />,
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 uppercase tracking-wider">
                roadmap.sh Integration
              </span>
              <span className="text-xs text-slate-500">
                Visual Career &amp; Curriculum Gap Mapping
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1 flex items-center space-x-2">
              <Map className="w-5 h-5 text-indigo-600" />
              <span>Career Roadmaps &amp; Study Paths</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Overlay cohort &amp; section competencies directly onto industry career tracks from{' '}
              <a
                href="https://roadmap.sh"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 font-semibold hover:underline"
              >
                roadmap.sh
              </a>{' '}
              for fast visual gap analysis.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedSessionId}
              onChange={(e) => {
                setSelectedSessionId(e.target.value);
                setSelectedSection('ALL');
              }}
              className="px-3 py-1.5 border border-slate-200 bg-slate-50 rounded-lg text-xs font-semibold text-slate-800"
            >
              <option value="">Catalog Preview Mode (No Session)</option>
              {sessions.map((s) => (
                <option key={s.session_id} value={s.session_id}>
                  {s.session_name} ({s.student_count} students &bull; {s.status})
                </option>
              ))}
            </select>

            <button
              onClick={fetchRoadmapAnalysis}
              disabled={isLoading || !selectedSessionId}
              className="p-1.5 text-slate-500 hover:text-indigo-600 rounded-lg border border-slate-200 hover:bg-slate-50 transition"
              title="Refresh Roadmap Analysis"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Section Filter Pills if session has sections */}
        {analysis && analysis.available_sections.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
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
              All Sections ({analysis.participating_students} students)
            </button>
            {analysis.available_sections.map((sec) => (
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
        )}
      </div>

      {errorMessage && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs">
          {errorMessage}
        </div>
      )}

      {/* Career Role Track Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tracks.map((track) => {
          const isSelected = activeTrack?.slug === track.slug;
          return (
            <button
              key={track.slug}
              onClick={() => setSelectedTrackSlug(track.slug)}
              className={`text-left p-4 rounded-xl border transition space-y-3 ${
                isSelected
                  ? 'border-indigo-500 bg-indigo-50/40 ring-2 ring-indigo-500/20 shadow-sm'
                  : 'border-slate-200 bg-white hover:border-indigo-300'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{track.role_track}</h3>
                  <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                    {track.description}
                  </p>
                </div>
                <span className="text-sm font-black text-indigo-700 shrink-0">
                  {track.readiness_percentage}%
                </span>
              </div>

              {/* Readiness Bar */}
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all"
                  style={{ width: `${Math.min(100, track.readiness_percentage)}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] font-semibold">
                <span className="text-emerald-700">{track.mastered_count} Mastered</span>
                <span className="text-amber-700">{track.developing_count} Developing</span>
                <span className="text-rose-700">{track.missing_count} Missing</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Role Track Visual Roadmap Nodes + Selected Node Detail */}
      {activeTrack && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Columns: Visual Skill Flow Diagram */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {activeTrack.role_track} Roadmap Nodes
                </h3>
                <p className="text-xs text-slate-500">
                  Click any skill node to inspect step-by-step study milestones &amp; coverage gaps.
                </p>
              </div>
              <a
                href={activeTrack.roadmap_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Open Full Map on roadmap.sh</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {activeTrack.nodes.map((node, idx) => {
                const st = getNodeStyle(node.status);
                const isNodeSelected = selectedNode?.skill_name === node.skill_name;
                return (
                  <button
                    key={node.skill_name}
                    onClick={() => setSelectedNode(node)}
                    className={`text-left p-3.5 rounded-xl border transition space-y-2 ${st.card} ${
                      isNodeSelected ? 'ring-2 ring-indigo-500 shadow-sm' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-mono font-bold text-slate-400">
                          #{idx + 1}
                        </span>
                        {st.icon}
                        <span className="text-xs font-bold text-slate-900">{node.skill_name}</span>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${st.badge}`}>
                        {node.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-600">
                      <span>
                        Students: <strong>{node.student_count}</strong> ({node.coverage_percentage}%)
                      </span>
                      <span>
                        Avg Tier: <strong>{node.actual_proficiency.toFixed(1)}</strong> /{' '}
                        {node.target_proficiency.toFixed(1)}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Selected Skill Study Guide Details */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            {selectedNode ? (
              <>
                <div className="border-b border-slate-100 pb-3 space-y-1">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 uppercase">
                    Milestone Guide
                  </span>
                  <h4 className="text-base font-bold text-slate-900">{selectedNode.skill_name}</h4>
                  <p className="text-xs text-slate-500">
                    Cohort Coverage: <strong>{selectedNode.coverage_percentage}%</strong> &bull;
                    Average Proficiency: <strong>{selectedNode.actual_proficiency.toFixed(2)}</strong>
                  </p>
                </div>

                {selectedNode.prerequisites.length > 0 && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                    <p className="font-bold text-slate-700">Prerequisites Before Studying:</p>
                    <div className="flex flex-wrap items-center gap-1.5 text-slate-600">
                      {selectedNode.prerequisites.map((p, i) => (
                        <span key={i} className="inline-flex items-center space-x-1">
                          <span className="px-2 py-0.5 bg-white border border-slate-200 rounded font-medium">
                            {p}
                          </span>
                          {i < selectedNode.prerequisites.length - 1 && (
                            <ArrowRight className="w-3 h-3 text-slate-400" />
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2 text-xs">
                  <p className="font-bold text-slate-800 flex items-center space-x-1.5">
                    <BookOpen className="w-4 h-4 text-indigo-600" />
                    <span>Next roadmap.sh Milestones to Study:</span>
                  </p>
                  <ul className="space-y-2">
                    {selectedNode.recommended_milestones.map((m, i) => (
                      <li
                        key={i}
                        className="p-2.5 rounded-lg bg-indigo-50/50 border border-indigo-100 text-slate-800 flex items-start space-x-2"
                      >
                        <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                          {i + 1}
                        </span>
                        <span>{m}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <a
                  href={selectedNode.roadmap_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
                >
                  <span>Explore {selectedNode.skill_name} on roadmap.sh</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </>
            ) : (
              <p className="text-xs text-slate-400 text-center py-8">
                Select a skill node to view roadmap milestones.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

