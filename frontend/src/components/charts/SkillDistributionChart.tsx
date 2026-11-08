import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface SkillDistributionItem {
  skill_name: string;
  student_count: number;
  coverage_percentage: number;
  average_numeric_proficiency: number;
}

interface SkillDistributionChartProps {
  data: SkillDistributionItem[];
  metric?: 'coverage' | 'count';
  height?: number;
}

export function SkillDistributionChart({
  data,
  metric = 'coverage',
  height = 280,
}: SkillDistributionChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-xs text-slate-400 bg-slate-50/50 rounded-xl border border-slate-100">
        No skill distribution data available
      </div>
    );
  }

  const chartData = data.slice(0, 10).map((item) => ({
    name: item.skill_name.length > 14 ? `${item.skill_name.slice(0, 12)}…` : item.skill_name,
    fullName: item.skill_name,
    coverage: item.coverage_percentage,
    count: item.student_count,
    avg: item.average_numeric_proficiency,
  }));

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
            domain={metric === 'coverage' ? [0, 100] : [0, 'auto']}
            unit={metric === 'coverage' ? '%' : ''}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload;
                return (
                  <div className="bg-slate-900 text-white p-2.5 rounded-lg text-xs shadow-lg space-y-1">
                    <p className="font-bold text-blue-200">{item.fullName}</p>
                    <p className="text-slate-300">
                      Coverage:{' '}
                      <strong className="text-white">{item.coverage}%</strong>
                    </p>
                    <p className="text-slate-300">
                      Students:{' '}
                      <strong className="text-white">{item.count}</strong>
                    </p>
                    <p className="text-slate-300">
                      Avg Proficiency:{' '}
                      <strong className="text-amber-300">{item.avg.toFixed(2)} / 3.0</strong>
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar
            dataKey={metric === 'coverage' ? 'coverage' : 'count'}
            fill="#3b82f6"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

