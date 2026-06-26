import { ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine } from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { formatCompactMoney } from '../../lib/format';
import { ChartTooltip } from './IncomeExpenseTrendChart';

export function CashFlowChart({ data }) {
  const { profile } = useAuth();
  const currency = profile?.currency || 'USD';
  const chartData = data.map((d) => ({ month: d.month, net: d.savings }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="var(--border-hairline)" />
        <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} />
        <YAxis
          tick={{ fontSize: 12, fill: 'var(--text-tertiary)' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => formatCompactMoney(v, currency)}
          width={56}
        />
        <ReferenceLine y={0} stroke="var(--border-strong)" />
        <Tooltip content={<ChartTooltip currency={currency} />} />
        <Bar dataKey="net" name="Net cash flow" radius={[6, 6, 6, 6]}>
          {chartData.map((d, idx) => (
            <Bar key={idx} dataKey="net" fill={d.net >= 0 ? 'var(--positive)' : 'var(--negative)'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function SavingsGrowthChart({ data }) {
  const { profile } = useAuth();
  const currency = profile?.currency || 'USD';
  let cumulative = 0;
  const chartData = data.map((d) => {
    cumulative += d.savings;
    return { month: d.month, cumulative };
  });

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="var(--border-hairline)" />
        <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} />
        <YAxis
          tick={{ fontSize: 12, fill: 'var(--text-tertiary)' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => formatCompactMoney(v, currency)}
          width={56}
        />
        <Tooltip content={<ChartTooltip currency={currency} />} />
        <Line
          type="monotone"
          dataKey="cumulative"
          name="Cumulative savings"
          stroke="var(--brand-emerald)"
          strokeWidth={2.5}
          dot={{ r: 3, fill: 'var(--brand-emerald)' }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
