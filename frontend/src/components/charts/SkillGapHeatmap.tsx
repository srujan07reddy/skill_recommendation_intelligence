import { useState } from 'react';
import { SkillGapItem } from '../../api/analysis.api';

interface SkillGapHeatmapProps {
  gaps: SkillGapItem[];
}

export function SkillGapHeatmap({ gaps }: SkillGapHeatmapProps) {
  const [hoveredGap, setHoveredGap] = useState<SkillGapItem | null>(null);

  if (!gaps || gaps.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-xs text-slate-400 bg-slate-50/50 rounded-xl border border-slate-100">
        No curriculum benchmark gap data available
      </div>
    );
  }

  const getHeatmapColor = (severity: string) => {
    switch (severity.toUpperCase()) {
      case 'CRITICAL':
        return 'bg-rose-600 hover:bg-rose-700 text-white';
      case 'MODERATE':
        return 'bg-amber-400 hover:bg-amber-500 text-slate-900';
      case 'MINOR':
        return 'bg-blue-300 hover:bg-blue-400 text-slate-900';
      case 'SATISFIED':
        return 'bg-emerald-500 hover:bg-emerald-600 text-white';
      default:
        return 'bg-slate-200 text-slate-600';
    }
  };

  return (
    <div className="space-y-4">
      {/* Heatmap Matrix Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {gaps.map((gap) => (
          <div
            key={gap.skill_id}
            onMouseEnter={() => setHoveredGap(gap)}
            onMouseLeave={() => setHoveredGap(null)}
            className={`p-3 rounded-xl border border-black/5 shadow-sm cursor-pointer transition flex flex-col justify-between ${getHeatmapColor(
              gap.gap_severity
            )}`}
          >
            <div>
              <div className="flex items-center justify-between text-[10px] font-bold opacity-80 uppercase tracking-wider">
                <span>{gap.relevance_type}</span>
                <span>{gap.gap_severity}</span>
              </div>
              <h4 className="font-bold text-sm mt-1 truncate">{gap.skill_name}</h4>
            </div>

            <div className="mt-3 pt-2 border-t border-black/10 flex items-center justify-between text-xs font-mono">
              <span>Gap: {gap.proficiency_gap.toFixed(1)}</span>
              <span className="font-bold">Score: {gap.gap_score.toFixed(2)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Hover Detail Panel */}
      {hoveredGap && (
        <div className="p-3 bg-slate-900 text-white rounded-xl text-xs space-y-1.5 shadow-md flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-bold text-sm text-blue-200">{hoveredGap.skill_name}</p>
            <p className="text-slate-400">
              Department: {hoveredGap.department_code} • Relevance: {hoveredGap.relevance_type}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-slate-300 font-mono text-[11px]">
            <span>
              Target Prof: <strong className="text-white">{hoveredGap.target_proficiency.toFixed(1)}</strong>
            </span>
            <span>
              Observed Avg: <strong className="text-white">{hoveredGap.actual_average_proficiency.toFixed(2)}</strong>
            </span>
            <span>
              Coverage Deficit: <strong className="text-white">{hoveredGap.coverage_gap.toFixed(1)}%</strong>
            </span>
            <span>
              Weight: <strong className="text-white">{hoveredGap.priority_weight.toFixed(1)}x</strong>
            </span>
            <span className="px-2 py-0.5 rounded bg-blue-600 text-white font-bold">
              Gap Score: {hoveredGap.gap_score.toFixed(2)}
            </span>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-end gap-3 text-[11px] text-slate-500">
        <span className="flex items-center space-x-1">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-600 inline-block" />
          <span>Critical (Score ≥ 1.5)</span>
        </span>
        <span className="flex items-center space-x-1">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
          <span>Moderate (Score ≥ 0.7)</span>
        </span>
        <span className="flex items-center space-x-1">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-300 inline-block" />
          <span>Minor (&gt; 0)</span>
        </span>
        <span className="flex items-center space-x-1">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
          <span>Satisfied (Gap = 0)</span>
        </span>
      </div>
    </div>
  );
}

