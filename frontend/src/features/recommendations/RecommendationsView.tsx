import { useState, useEffect } from 'react';
import {
  recommendationsApi,
  RecommendationResponse,
  RecommendationSummaryResponse,
} from '../../api/recommendations.api';
import { useAuthStore } from '../auth/useAuthStore';
import {
  Compass,
  Sparkles,
  Target,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Layers,
  RefreshCw,
  Send,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';

interface RecommendationsViewProps {
  sessionId: string;
}

export function RecommendationsView({ sessionId }: RecommendationsViewProps) {
  const { user } = useAuthStore();
  const [summary, setSummary] = useState<RecommendationSummaryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [includeDraft, setIncludeDraft] = useState(true);
  const [proposedIds, setProposedIds] = useState<Set<string>>(new Set());

  const isDean = user?.roles.some((r) => r.toLowerCase() === 'dean');
  const userDeptId = user?.department_id;

  const fetchRecommendations = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      let data: RecommendationSummaryResponse;
      if (isDean) {
        data = await recommendationsApi.getInstitutionalEvents(sessionId, includeDraft);
      } else if (userDeptId) {
        data = await recommendationsApi.getDepartmentRecommendations(
          sessionId,
          userDeptId,
          includeDraft
        );
      } else {
        data = await recommendationsApi.getDepartmentRecommendations(
          sessionId,
          'DEPT-CSE',
          includeDraft
        );
      }
      setSummary(data);
    } catch (err: any) {
      setErrorMessage(
        err?.response?.data?.error?.message || 'Failed to load development recommendations.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [sessionId, includeDraft]);

  const handlePropose = (rec: RecommendationResponse) => {
    setProposedIds((prev) => new Set(prev).add(rec.recommendation_id));
    alert(
      `Recommendation "${rec.recommendation_title}" accepted for Departmental Proposal package (Phase 7 Governance)!`
    );
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority.toUpperCase()) {
      case 'CRITICAL':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'HIGH':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'MEDIUM':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'LOW':
        return 'bg-slate-100 text-slate-800 border-slate-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  const getCategoryBadge = (category: string) => {
    switch (category.toUpperCase()) {
      case 'BOOTCAMP':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'WORKSHOP':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'CERTIFICATION_PREP':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'PRACTICAL_LAB':
        return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  const filteredRecs =
    summary?.recommendations.filter((r) =>
      selectedCategory === 'ALL' ? true : r.initiative_category.toUpperCase() === selectedCategory
    ) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Explainable Development Recommendations
          </h2>
          <p className="text-xs text-slate-500">
            Decision support for HODs and Deans. Scoped strictly to departmental cohorts (no individual progression).
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* ADR-008 Simulation Toggle */}
          <button
            onClick={() => setIncludeDraft(!includeDraft)}
            className="flex items-center space-x-1.5 px-3 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-700 transition"
            title="Toggle candidate DRAFT benchmarks (ADR-008)"
          >
            {includeDraft ? (
              <ToggleRight className="w-4 h-4 text-blue-600" />
            ) : (
              <ToggleLeft className="w-4 h-4 text-slate-400" />
            )}
            <span>Include DRAFT Benchmarks</span>
          </button>

          <button
            onClick={fetchRecommendations}
            disabled={isLoading}
            className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 transition"
            title="Refresh Recommendations"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs">
          {errorMessage}
        </div>
      )}

      {/* KPI Counters */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <p className="text-xs text-slate-500 font-medium flex items-center space-x-1">
              <Compass className="w-3.5 h-3.5 text-blue-600" />
              <span>Recommended Events</span>
            </p>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              {summary.total_recommendations}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Targeting identified competency deficits
            </p>
          </div>

          <div className="bg-rose-50/50 p-4 rounded-xl border border-rose-200">
            <p className="text-xs text-rose-700 font-semibold flex items-center space-x-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Critical Bootcamps</span>
            </p>
            <p className="text-2xl font-bold text-rose-800 mt-1">
              {summary.critical_count}
            </p>
            <p className="text-[11px] text-rose-600 mt-0.5">
              High deficit in core curriculum
            </p>
          </div>

          <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-200">
            <p className="text-xs text-amber-700 font-semibold flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>High Priority Events</span>
            </p>
            <p className="text-2xl font-bold text-amber-800 mt-1">
              {summary.high_count}
            </p>
            <p className="text-[11px] text-amber-600 mt-0.5">
              Significant coverage deficits
            </p>
          </div>

          <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-200">
            <p className="text-xs text-indigo-700 font-semibold flex items-center space-x-1">
              <Target className="w-3.5 h-3.5" />
              <span>Initiative Categories</span>
            </p>
            <p className="text-2xl font-bold text-indigo-800 mt-1">
              {Object.keys(summary.category_breakdown).length}
            </p>
            <p className="text-[11px] text-indigo-600 mt-0.5">
              Bootcamps, workshops & cert tracks
            </p>
          </div>
        </div>
      )}

      {/* Category Filter Pills */}
      {summary && (
        <div className="flex flex-wrap items-center gap-2">
          {['ALL', 'BOOTCAMP', 'WORKSHOP', 'CERTIFICATION_PREP', 'PRACTICAL_LAB'].map((cat) => {
            const count =
              cat === 'ALL'
                ? summary.total_recommendations
                : summary.category_breakdown[cat] || 0;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {cat.replace('_', ' ')} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* Recommendations Cards Grid */}
      <div className="space-y-4">
        {filteredRecs.length === 0 ? (
          <div className="text-center py-12 px-4 bg-white rounded-xl border border-slate-200 space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <p className="text-sm font-semibold text-slate-800">
              No skill deficits currently require development initiatives
            </p>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              All evaluated curriculum benchmarks are currently satisfied for this cohort.
            </p>
          </div>
        ) : (
          filteredRecs.map((rec) => {
            const isProposed = proposedIds.has(rec.recommendation_id);
            const m = rec.supporting_metrics;
            return (
              <div
                key={rec.recommendation_id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4 hover:border-slate-300 transition"
              >
                {/* Card Top: Badges & Title */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${getCategoryBadge(
                          rec.initiative_category
                        )}`}
                      >
                        {rec.initiative_category.replace('_', ' ')}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${getPriorityBadge(
                          rec.priority
                        )}`}
                      >
                        {rec.priority} PRIORITY
                      </span>
                      <span className="text-xs font-semibold text-slate-400">
                        {rec.rule_id}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900">
                      {rec.recommendation_title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                      <span className="flex items-center space-x-1">
                        <Layers className="w-3.5 h-3.5 text-slate-400" />
                        <span>Target: <strong className="text-slate-700">{rec.target_cohort}</strong></span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Duration: <strong className="text-slate-700">{rec.suggested_duration}</strong></span>
                      </span>
                    </div>
                  </div>

                  {/* Propose Action Button */}
                  <button
                    onClick={() => handlePropose(rec)}
                    disabled={isProposed}
                    className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition shrink-0 ${
                      isProposed
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 cursor-default'
                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                    }`}
                  >
                    {isProposed ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Accepted for Proposal</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Include in HOD Proposal</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Explainable Rationale Box */}
                <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1.5">
                  <p className="font-bold text-slate-800">Explainable Analytical Rationale</p>
                  <p className="text-slate-600 leading-relaxed">{rec.justification}</p>

                  {/* Supporting Metrics Chips */}
                  <div className="flex flex-wrap gap-2 pt-1 font-mono text-[11px]">
                    <span className="px-2 py-0.5 bg-white border border-slate-200 rounded text-slate-700">
                      Target Prof: <strong>{m.target_proficiency?.toFixed(1)}</strong>
                    </span>
                    <span className="px-2 py-0.5 bg-white border border-slate-200 rounded text-slate-700">
                      Observed Avg: <strong>{m.actual_average_proficiency?.toFixed(2)}</strong>
                    </span>
                    <span className="px-2 py-0.5 bg-white border border-slate-200 rounded text-slate-700">
                      Prof Deficit: <strong>{m.proficiency_gap?.toFixed(2)}</strong>
                    </span>
                    <span className="px-2 py-0.5 bg-white border border-slate-200 rounded text-slate-700">
                      Coverage Deficit: <strong>{m.coverage_gap?.toFixed(1)}%</strong>
                    </span>
                    <span className="px-2 py-0.5 bg-indigo-50 border border-indigo-200 rounded text-indigo-800 font-bold">
                      Gap Score: {m.gap_score?.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Suggested Learning Objectives */}
                {rec.learning_objectives.length > 0 && (
                  <div className="space-y-1 text-xs">
                    <p className="font-semibold text-slate-700">Suggested Learning Objectives:</p>
                    <ul className="space-y-1 text-slate-600">
                      {rec.learning_objectives.map((obj, i) => (
                        <li key={i} className="flex items-start space-x-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                          <span>{obj}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
