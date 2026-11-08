import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface ProficiencyItem {
  skill_name: string;
  proficiency_distribution: {
    beginner_count: number;
    beginner_percentage: number;
    intermediate_count: number;
    intermediate_percentage: number;
    expert_count: number;
    expert_percentage: number;
    total_classified: number;
  };
}

interface ProficiencyBreakdownChartProps {
  data: ProficiencyItem[];
  height?: number;
}

export function ProficiencyBreakdownChart({
  data,
  height = 280,
}: ProficiencyBreakdownChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-xs text-slate-400 bg-slate-50/50 rounded-xl border border-slate-100">
        No proficiency breakdown data available
      </div>
    );
  }

  const chartData = data.slice(0, 8).map((item) => {
    const dist = item.proficiency_distribution;
    return {
      name: item.skill_name.length > 12 ? `${item.skill_name.slice(0, 10)}…` : item.skill_name,
      fullName: item.skill_name,
      Beginner: dist.beginner_percentage,
      Intermediate: dist.intermediate_percentage,
      Expert: dist.expert_percentage,
      begCount: dist.beginner_count,
      interCount: dist.intermediate_count,
      expCount: dist.expert_count,
      total: dist.total_classified,
    };
  });

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 25 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: '#64748b' }}
            interval={0}
            angle={-25}
            textAnchor="end"
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#64748b' }}
            domain={[0, 100]}
            unit="%"
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload;
                return (
                  <div className="bg-slate-900 text-white p-3 rounded-lg text-xs shadow-lg space-y-1.5 min-w-[180px]">
                    <p className="font-bold text-white border-b border-slate-700 pb-1">
                      {item.fullName}
                    </p>
                    <div className="space-y-0.5 text-slate-300">
                      <p className="flex justify-between">
                        <span className="text-blue-300">Beginner (1.0):</span>
                        <span>{item.begCount} ({item.Beginner}%)</span>
                      </p>
                      <p className="flex justify-between">
                        <span className="text-blue-400">Intermediate (2.0):</span>
                        <span>{item.interCount} ({item.Intermediate}%)</span>
                      </p>
                      <p className="flex justify-between">
                        <span className="text-indigo-300 font-semibold">Expert (3.0):</span>
                        <span className="font-semibold text-white">{item.expCount} ({item.Expert}%)</span>
                      </p>
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend
            verticalAlign="top"
            align="right"
            iconType="circle"
            wrapperStyle={{ fontSize: 11, paddingBottom: 10 }}
          />
          <Bar dataKey="Beginner" stackId="a" fill="#93c5fd" />
          <Bar dataKey="Intermediate" stackId="a" fill="#2563eb" />
          <Bar dataKey="Expert" stackId="a" fill="#1e1b4b" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

