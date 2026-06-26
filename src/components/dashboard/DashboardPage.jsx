import { useState } from 'react';
import { Wallet, TrendingUp, TrendingDown, PiggyBank, Gauge } from 'lucide-react';
import { PageShell } from '../layout/PageShell';
import { Card, CardHeader } from '../ui/Card';
import { SummaryCard } from './SummaryCard';
import { IncomeExpenseTrendChart } from '../charts/IncomeExpenseTrendChart';
import { CategoryBreakdownChart } from '../charts/CategoryBreakdownChart';
import { CashFlowChart, SavingsGrowthChart } from '../charts/CashFlowAndSavingsCharts';
import {
  RecentTransactionsWidget,
  UpcomingBillsWidget,
  BudgetProgressWidget,
  QuickActionsWidget,
  InsightsWidget,
} from './DashboardWidgets';
import { FinancialHealthWidget } from './FinancialHealthWidget';
import { BalanceBeam } from '../ui/BalanceBeam';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { formatMoney, formatPercent } from '../../lib/format';
import { TransactionFormModal } from '../transactions/TransactionFormModal';
import { TransferModal } from '../transactions/TransferModal';
import { BudgetFormModal } from '../budgets/BudgetFormModal';

export function DashboardPage() {
  const { profile, user } = useAuth();
  const data = useData();
  const currency = profile?.currency || 'USD';

  const [txModal, setTxModal] = useState({ open: false, type: 'expense' });
  const [transferOpen, setTransferOpen] = useState(false);
  const [budgetOpen, setBudgetOpen] = useState(false);

  const greetingName = profile?.fullName?.split(' ')[0] || user?.displayName?.split(' ')[0] || '';

  return (
    <PageShell title="Dashboard" subtitle={greetingName ? `Welcome back, ${greetingName}.` : 'Your financial overview.'}>
      <div className="eq-grid eq-grid--summary">
        <SummaryCard
          label="Current Balance"
          value={formatMoney(data.currentBalance, currency)}
          icon={<Wallet size={16} />}
          tone="brand"
        />
        <SummaryCard
          label="Monthly Income"
          value={formatMoney(data.monthlyIncome, currency)}
          icon={<TrendingUp size={16} />}
          tone="positive"
        />
        <SummaryCard
          label="Monthly Expenses"
          value={formatMoney(data.monthlyExpense, currency)}
          icon={<TrendingDown size={16} />}
          tone="negative"
        />
        <SummaryCard
          label="Savings This Month"
          value={formatMoney(data.savingsThisMonth, currency, { signed: true })}
          icon={<PiggyBank size={16} />}
          tone={data.savingsThisMonth >= 0 ? 'positive' : 'negative'}
        />
        <SummaryCard
          label="Budget Usage"
          value={formatPercent(data.overallBudgetUsagePct)}
          icon={<Gauge size={16} />}
          tone={data.overallBudgetUsagePct >= 100 ? 'negative' : data.overallBudgetUsagePct >= 80 ? 'warning' : 'brand'}
        />
      </div>

      <div className="eq-grid eq-grid--two-thirds" style={{ marginTop: 24 }}>
        <Card>
          <CardHeader title="Income vs. Expense Trend" subtitle="Last 6 months" />
          <IncomeExpenseTrendChart data={data.monthsTrend} />
        </Card>
        <Card>
          <CardHeader title="This month's balance" subtitle="Income weighed against expense" />
          <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0' }}>
            <BalanceBeam
              leftLabel="Income"
              rightLabel="Expense"
              leftValue={data.monthlyIncome}
              rightValue={data.monthlyExpense}
            />
          </div>
        </Card>
      </div>

      <div className="eq-grid eq-grid--two" style={{ marginTop: 24 }}>
        <Card>
          <CardHeader title="Spending Breakdown" subtitle="By category, this month" />
          <CategoryBreakdownChart data={data.spendingByCategory} />
        </Card>
        <Card>
          <CardHeader title="Monthly Cash Flow" subtitle="Net income minus expenses" />
          <CashFlowChart data={data.monthsTrend} />
        </Card>
      </div>

      <div className="eq-grid eq-grid--two" style={{ marginTop: 24 }}>
        <Card>
          <CardHeader title="Savings Growth" subtitle="Cumulative over time" />
          <SavingsGrowthChart data={data.monthsTrend} />
        </Card>
        <FinancialHealthWidget score={data.financialHealthScore} />
      </div>

      <div className="eq-grid eq-grid--dashboard-bottom" style={{ marginTop: 24 }}>
        <QuickActionsWidget
          onAddIncome={() => setTxModal({ open: true, type: 'income' })}
          onAddExpense={() => setTxModal({ open: true, type: 'expense' })}
          onTransfer={() => setTransferOpen(true)}
          onCreateBudget={() => setBudgetOpen(true)}
        />
        <RecentTransactionsWidget transactions={data.transactions} accounts={data.accounts} />
        <UpcomingBillsWidget bills={data.upcomingBills} />
        <BudgetProgressWidget budgets={data.activeBudgets} />
        <InsightsWidget insights={data.insights} />
      </div>

      <TransactionFormModal
        isOpen={txModal.open}
        type={txModal.type}
        onClose={() => setTxModal({ open: false, type: 'expense' })}
      />
      <TransferModal isOpen={transferOpen} onClose={() => setTransferOpen(false)} />
      <BudgetFormModal isOpen={budgetOpen} onClose={() => setBudgetOpen(false)} />
    </PageShell>
  );
}
