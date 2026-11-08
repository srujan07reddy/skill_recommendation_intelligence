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

interface DepartmentSummaryItem {
  department_code: string;
  department_name: string;
  participating_students: number;
  distinct_skills_count: number;
  average_proficiency: number;
}

interface DepartmentComparisonChartProps {
  data: DepartmentSummaryItem[];
  height?: number;
}

export function DepartmentComparisonChart({
  data,
  height = 280,
}: DepartmentComparisonChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-xs text-slate-400 bg-slate-50/50 rounded-xl border border-slate-100">
        No departmental comparison data available
      </div>
    );
  }

  const chartData = data.map((d) => ({
    name: d.department_code.replace('DEPT-', ''),
    fullName: d.department_name,
    code: d.department_code,
    students: d.participating_students,
    skills: d.distinct_skills_count,
    avgScore: d.average_proficiency,
  }));

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: '#64748b' }}
          />
          <YAxis
            yAxisId="left"
            tick={{ fontSize: 11, fill: '#64748b' }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            domain={[0, 3.0]}
            tick={{ fontSize: 11, fill: '#64748b' }}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload;
                return (
                  <div className="bg-slate-900 text-white p-3 rounded-lg text-xs shadow-lg space-y-1">
                    <p className="font-bold text-blue-200">{item.fullName} ({item.code})</p>
                    <p className="text-slate-300">
                      Participating Students: <strong className="text-white">{item.students}</strong>
                    </p>
                    <p className="text-slate-300">
                      Skills Assessed: <strong className="text-white">{item.skills}</strong>
                    </p>
                    <p className="text-slate-300">
                      Avg Competency: <strong className="text-amber-300">{item.avgScore.toFixed(2)} / 3.0</strong>
                    </p>
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
          <Bar yAxisId="left" dataKey="students" name="Students" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          <Bar yAxisId="left" dataKey="skills" name="Skills Count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

