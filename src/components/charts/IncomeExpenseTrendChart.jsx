import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { formatCompactMoney, formatMoney } from '../../lib/format';
import './ChartShared.css';

export function IncomeExpenseTrendChart({ data }) {
  const { profile } = useAuth();
  const currency = profile?.currency || 'USD';

  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--positive)" stopOpacity={0.28} />
            <stop offset="100%" stopColor="var(--positive)" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--negative)" stopOpacity={0.22} />
            <stop offset="100%" stopColor="var(--negative)" stopOpacity={0} />
          </linearGradient>
        </defs>
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
        <Legend
          iconType="circle"
          formatter={(value) => <span style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>{value}</span>}
        />
        <Area type="monotone" dataKey="income" name="Income" stroke="var(--positive)" strokeWidth={2.25} fill="url(#incomeGradient)" />
        <Area type="monotone" dataKey="expense" name="Expense" stroke="var(--negative)" strokeWidth={2.25} fill="url(#expenseGradient)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function ChartTooltip({ active, payload, label, currency = 'USD' }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="eq-chart-tooltip">
      <p className="eq-chart-tooltip__label">{label}</p>
      {payload.map((entry) => (
        <div key={entry.dataKey || entry.name} className="eq-chart-tooltip__row">
          <span className="eq-chart-tooltip__dot" style={{ background: entry.color || entry.fill }} />
          <span className="eq-chart-tooltip__name">{entry.name}</span>
          <span className="eq-chart-tooltip__value mono-num">{formatMoney(entry.value, currency)}</span>
        </div>
      ))}
    </div>
  );
}
