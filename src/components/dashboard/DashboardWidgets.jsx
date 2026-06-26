import { Link } from 'react-router-dom';
import { Plus, ArrowDownCircle, ArrowUpCircle, Repeat, PiggyBank, Calendar, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Card, CardHeader } from '../ui/Card';
import { EmptyState } from '../ui/Misc';
import { TransactionRow } from '../transactions/TransactionRow';
import { BeamProgress } from '../ui/BalanceBeam';
import { formatMoney } from '../../lib/format';
import { useAuth } from '../../context/AuthContext';
import './DashboardWidgets.css';

export function RecentTransactionsWidget({ transactions, accounts }) {
  const recent = transactions.slice(0, 6);
  return (
    <Card>
      <CardHeader
        title="Recent transactions"
        action={<Link to="/app/transactions" className="eq-widget-link">View all</Link>}
      />
      {recent.length === 0 ? (
        <EmptyState
          icon={<ArrowDownCircle size={28} />}
          title="No transactions yet"
          description="Add your first income or expense to get started."
        />
      ) : (
        <div>
          {recent.map((t) => (
            <TransactionRow key={t.id} transaction={t} account={accounts.find((a) => a.id === t.accountId)} />
          ))}
        </div>
      )}
    </Card>
  );
}

export function UpcomingBillsWidget({ bills }) {
  const { profile } = useAuth();
  const currency = profile?.currency || 'USD';
  return (
    <Card>
      <CardHeader title="Upcoming bills" icon={<Calendar size={16} />} />
      {bills.length === 0 ? (
        <EmptyState icon={<Calendar size={28} />} title="No bills scheduled" description="Recurring bills will appear here." />
      ) : (
        <ul className="eq-bills-list">
          {bills.map((b) => (
            <li key={b.id} className="eq-bills-list__item">
              <div className="eq-bills-list__icon"><Repeat size={15} /></div>
              <div className="eq-bills-list__main">
                <span className="eq-bills-list__name">{b.notes || b.category}</span>
                <span className="eq-bills-list__date">Due {new Date(b.nextDueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
              </div>
              <span className="eq-bills-list__amount mono-num">{formatMoney(b.amount, currency)}</span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

export function BudgetProgressWidget({ budgets }) {
  return (
    <Card>
      <CardHeader title="Budget progress" icon={<PiggyBank size={16} />} action={<Link to="/app/budgets" className="eq-widget-link">Manage</Link>} />
      {budgets.length === 0 ? (
        <EmptyState icon={<PiggyBank size={28} />} title="No budgets yet" description="Create a budget to track your spending limits." />
      ) : (
        <div className="eq-budget-progress-list">
          {budgets.slice(0, 4).map((b) => (
            <BeamProgress
              key={b.id}
              label={b.name}
              valueLabel={`${b.percentUsed.toFixed(0)}%`}
              percent={b.percentUsed}
              tone={b.percentUsed >= 100 ? 'danger' : b.percentUsed >= 80 ? 'warning' : 'brand'}
            />
          ))}
        </div>
      )}
    </Card>
  );
}

export function QuickActionsWidget({ onAddIncome, onAddExpense, onTransfer, onCreateBudget }) {
  const actions = [
    { label: 'Add Income', icon: <ArrowUpCircle size={18} />, onClick: onAddIncome, tone: 'positive' },
    { label: 'Add Expense', icon: <ArrowDownCircle size={18} />, onClick: onAddExpense, tone: 'negative' },
    { label: 'Transfer', icon: <Repeat size={18} />, onClick: onTransfer, tone: 'neutral' },
    { label: 'Create Budget', icon: <PiggyBank size={18} />, onClick: onCreateBudget, tone: 'brand' },
  ];
  return (
    <Card>
      <CardHeader title="Quick actions" icon={<Plus size={16} />} />
      <div className="eq-quick-actions">
        {actions.map((a) => (
          <button key={a.label} className={`eq-quick-action eq-quick-action--${a.tone}`} onClick={a.onClick}>
            {a.icon}
            <span>{a.label}</span>
          </button>
        ))}
      </div>
    </Card>
  );
}

const INSIGHT_ICONS = { positive: CheckCircle2, warning: AlertTriangle, negative: AlertTriangle };

export function InsightsWidget({ insights }) {
  return (
    <Card>
      <CardHeader title="Spending insights" icon={<TrendingUp size={16} />} />
      {insights.length === 0 ? (
        <EmptyState icon={<TrendingUp size={28} />} title="No insights yet" description="Keep tracking transactions and we'll surface patterns here." />
      ) : (
        <ul className="eq-insights-list">
          {insights.map((insight) => {
            const Icon = INSIGHT_ICONS[insight.tone] || TrendingUp;
            return (
              <li key={insight.id} className={`eq-insights-list__item eq-insights-list__item--${insight.tone}`}>
                <Icon size={15} />
                <span>{insight.text}</span>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
