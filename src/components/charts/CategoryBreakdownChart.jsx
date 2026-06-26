import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { getCategoryById } from '../../lib/constants';
import { formatMoney } from '../../lib/format';
import { EmptyState } from '../ui/Misc';
import { PieChart as PieIcon } from 'lucide-react';

const PALETTE = [
  '#1f6f5c', '#c97a2b', '#b3473a', '#5b6470', '#2a8a73',
  '#d4a04c', '#8a5a4f', '#3f6f8f', '#7a6a9e', '#a3814a',
];

export function CategoryBreakdownChart({ data }) {
  const { profile } = useAuth();
  const currency = profile?.currency || 'USD';

  if (!data?.length) {
    return (
      <EmptyState
        icon={<PieIcon size={32} />}
        title="No spending yet"
        description="Add an expense to see your category breakdown."
      />
    );
  }

  const chartData = data.slice(0, 8).map((d) => ({
    name: getCategoryById(d.category).label,
    value: d.amount,
  }));

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 16 }}>
      <ResponsiveContainer width="100%" height={240} style={{ minWidth: 200, flex: '1 1 220px' }}>
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            innerRadius="58%"
            outerRadius="85%"
            paddingAngle={2}
            stroke="none"
          >
            {chartData.map((_, idx) => (
              <Cell key={idx} fill={PALETTE[idx % PALETTE.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => formatMoney(value, currency)}
            contentStyle={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-hairline)',
              borderRadius: 10,
              fontSize: 12.5,
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      <ul style={{ flex: '1 1 180px', display: 'flex', flexDirection: 'column', gap: 8, minWidth: 160 }}>
        {chartData.map((d, idx) => (
          <li key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: PALETTE[idx % PALETTE.length], flexShrink: 0 }} />
            <span style={{ color: 'var(--text-secondary)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.name}</span>
            <span className="mono-num" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{formatMoney(d.value, currency)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
