import { useMemo, useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { PageShell } from '../layout/PageShell';
import { Card, CardHeader } from '../ui/Card';
import { Select } from '../ui/FormControls';
import { CategoryBreakdownChart } from '../charts/CategoryBreakdownChart';
import { IncomeExpenseTrendChart } from '../charts/IncomeExpenseTrendChart';
import { CashFlowChart, SavingsGrowthChart } from '../charts/CashFlowAndSavingsCharts';
import { ChartTooltip } from '../charts/IncomeExpenseTrendChart';
import { BeamProgress } from '../ui/BalanceBeam';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { ALL_CATEGORIES } from '../../lib/constants';
import { formatMoney, formatCompactMoney } from '../../lib/format';
import { isWithinInterval, parseISO, subDays } from 'date-fns';
import './AnalyticsPage.css';

const RANGE_OPTIONS = [
  { value: '30', label: 'Last 30 days' },
  { value: '90', label: 'Last 3 months' },
  { value: '180', label: 'Last 6 months' },
  { value: '365', label: 'Last 12 months' },
];

export function AnalyticsPage() {
  const { transactions, accounts, activeBudgets, monthsTrend } = useData();
  const { profile } = useAuth();
  const currency = profile?.currency || 'USD';

  const [range, setRange] = useState('90');
  const [category, setCategory] = useState('all');
  const [accountId, setAccountId] = useState('all');

  const filteredTx = useMemo(() => {
    const since = subDays(new Date(), Number(range));
    return transactions.filter((t) => {
      const date = typeof t.date === 'string' ? parseISO(t.date) : new Date(t.date);
      const inRange = isWithinInterval(date, { start: since, end: new Date() }) || date >= since;
      const matchesCategory = category === 'all' || t.category === category;
      const matchesAccount = accountId === 'all' || t.accountId === accountId;
      return inRange && matchesCategory && matchesAccount;
    });
  }, [transactions, range, category, accountId]);

  const totalIncome = filteredTx.filter((t) => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0);
  const totalExpense = filteredTx.filter((t) => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);

  const categoryTotals = useMemo(() => {
    const map = {};
    filteredTx.filter((t) => t.type === 'expense').forEach((t) => {
      map[t.category] = (map[t.category] || 0) + Number(t.amount);
    });
    return Object.entries(map).map(([cat, amount]) => ({ category: cat, amount })).sort((a, b) => b.amount - a.amount);
  }, [filteredTx]);

  // Monthly comparison: this period vs previous equivalent period
  const monthComparisonData = useMemo(() => {
    return monthsTrend.map((m) => ({ month: m.month, income: m.income, expense: m.expense }));
  }, [monthsTrend]);

  const incomeGrowth = useMemo(() => {
    const last = monthsTrend[monthsTrend.length - 1]?.income || 0;
    const prev = monthsTrend[monthsTrend.length - 2]?.income || 0;
    return prev > 0 ? ((last - prev) / prev) * 100 : 0;
  }, [monthsTrend]);

  return (
    <PageShell title="Analytics" subtitle="Deep insights into your income, spending, and savings.">
      <Card padded className="eq-analytics-filters">
        <Select
          options={RANGE_OPTIONS}
          value={range}
          onChange={(e) => setRange(e.target.value)}
        />
        <Select
          options={[{ value: 'all', label: 'All categories' }, ...ALL_CATEGORIES.map((c) => ({ value: c.id, label: c.label }))]}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
        <Select
          options={[{ value: 'all', label: 'All accounts' }, ...accounts.map((a) => ({ value: a.id, label: a.name }))]}
          value={accountId}
          onChange={(e) => setAccountId(e.target.value)}
        />
      </Card>

      <div className="eq-grid eq-grid--three" style={{ marginTop: 24 }}>
        <Card padded>
          <span className="eq-analytics-stat__label">Total Income</span>
          <p className="eq-analytics-stat__value mono-num" style={{ color: 'var(--positive)' }}>{formatMoney(totalIncome, currency)}</p>
        </Card>
        <Card padded>
          <span className="eq-analytics-stat__label">Total Expense</span>
          <p className="eq-analytics-stat__value mono-num" style={{ color: 'var(--negative)' }}>{formatMoney(totalExpense, currency)}</p>
        </Card>
        <Card padded>
          <span className="eq-analytics-stat__label">Net Cash Flow</span>
          <p className="eq-analytics-stat__value mono-num">{formatMoney(totalIncome - totalExpense, currency, { signed: true })}</p>
        </Card>
      </div>

      <div className="eq-grid eq-grid--two" style={{ marginTop: 24 }}>
        <Card>
          <CardHeader title="Spending Trends" subtitle="Income vs. expense over time" />
          <IncomeExpenseTrendChart data={monthsTrend} />
        </Card>
        <Card>
          <CardHeader title="Category Analysis" subtitle="Where your money goes" />
          <CategoryBreakdownChart data={categoryTotals} />
        </Card>
      </div>

      <div className="eq-grid eq-grid--two" style={{ marginTop: 24 }}>
        <Card>
          <CardHeader title="Monthly Comparison" subtitle="Income and expense, side by side" />
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={monthComparisonData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
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
              <Legend iconType="circle" formatter={(v) => <span style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>{v}</span>} />
              <Bar dataKey="income" name="Income" fill="var(--positive)" radius={[6, 6, 0, 0]} />
              <Bar dataKey="expense" name="Expense" fill="var(--negative)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <CardHeader title="Cash Flow Analysis" subtitle="Net monthly cash flow" />
          <CashFlowChart data={monthsTrend} />
        </Card>
      </div>

      <div className="eq-grid eq-grid--two" style={{ marginTop: 24 }}>
        <Card>
          <CardHeader title="Income Growth" subtitle={`${incomeGrowth >= 0 ? '+' : ''}${incomeGrowth.toFixed(1)}% vs. previous month`} />
          <SavingsGrowthChart data={monthsTrend.map((m) => ({ month: m.month, savings: m.income }))} />
        </Card>
        <Card>
          <CardHeader title="Budget Performance" subtitle="How each budget is tracking" />
          {activeBudgets.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Create a budget to see performance here.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {activeBudgets.map((b) => (
                <BeamProgress
                  key={b.id}
                  label={b.name}
                  valueLabel={`${formatMoney(b.spent, currency)} / ${formatMoney(b.limit, currency)}`}
                  percent={b.percentUsed}
                  tone={b.percentUsed >= 100 ? 'danger' : b.percentUsed >= 80 ? 'warning' : 'brand'}
                />
              ))}
            </div>
          )}
        </Card>
      </div>
    </PageShell>
  );
}
