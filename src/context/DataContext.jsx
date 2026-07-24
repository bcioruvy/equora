import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';
import {
  subscribeToTransactions,
  subscribeToAccounts,
  subscribeToBudgets,
  subscribeToGoals,
  subscribeToNotifications,
  subscribeToQuickAdds,
} from '../firebase/firestore';
import { isSameMonth, isThisMonth, parseISO, startOfMonth, subMonths } from 'date-fns';

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [goals, setGoals] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [quickAdds, setQuickAdds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setTransactions([]);
      setAccounts([]);
      setBudgets([]);
      setGoals([]);
      setNotifications([]);
      setQuickAdds([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    // Wait for the first snapshot of each core collection before dropping the
    // loading state — otherwise the dashboard briefly renders with $0 values
    // before Firestore's initial data arrives.
    const loadedKeys = new Set();
    const CORE_SOURCES = ['transactions', 'accounts', 'budgets', 'goals'];
    const markLoaded = (key) => {
      loadedKeys.add(key);
      if (CORE_SOURCES.every((k) => loadedKeys.has(k))) {
        setLoading(false);
      }
    };
    const unsubs = [
      subscribeToTransactions(user.uid, (items) => {
        setTransactions(items);
        markLoaded('transactions');
      }),
      subscribeToAccounts(user.uid, (items) => {
        setAccounts(items);
        markLoaded('accounts');
      }),
      subscribeToBudgets(user.uid, (items) => {
        setBudgets(items);
        markLoaded('budgets');
      }),
      subscribeToGoals(user.uid, (items) => {
        setGoals(items);
        markLoaded('goals');
      }),
      subscribeToNotifications(user.uid, (items) => setNotifications(items)),
      subscribeToQuickAdds(user.uid, (items) => setQuickAdds(items)),
    ];
    return () => unsubs.forEach((fn) => fn && fn());
  }, [user]);

  // ---------- Derived metrics ----------

  const derived = useMemo(() => {
    const safeDate = (t) => {
      try {
        return typeof t.date === 'string' ? parseISO(t.date) : t.date?.toDate?.() || new Date(t.date);
      } catch {
        return new Date();
      }
    };

    const thisMonthTx = transactions.filter((t) => isThisMonth(safeDate(t)));
    const lastMonthDate = subMonths(new Date(), 1);
    const lastMonthTx = transactions.filter((t) => isSameMonth(safeDate(t), lastMonthDate));

    const sumByType = (list, type) =>
      list.filter((t) => t.type === type).reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

    const monthlyIncome = sumByType(thisMonthTx, 'income');
    const monthlyExpense = sumByType(thisMonthTx, 'expense');
    const lastMonthIncome = sumByType(lastMonthTx, 'income');
    const lastMonthExpense = sumByType(lastMonthTx, 'expense');

    const totalIncomeAllTime = sumByType(transactions, 'income');
    const totalExpenseAllTime = sumByType(transactions, 'expense');
    const currentBalance =
      accounts.reduce((sum, a) => sum + (Number(a.openingBalance) || 0), 0) +
      totalIncomeAllTime -
      totalExpenseAllTime;

    // Each account's live balance = its opening balance plus everything
    // that's happened in it since (income adds, expenses subtract).
    // Transfers are already recorded as a normal expense on the source
    // account and a normal income on the destination account, so they fall
    // out of this the same way — no special-casing needed.
    const accountsWithBalance = accounts.map((a) => {
      const accountTx = transactions.filter((t) => t.accountId === a.id);
      const balance =
        (Number(a.openingBalance) || 0) + sumByType(accountTx, 'income') - sumByType(accountTx, 'expense');
      return { ...a, balance };
    });

    const savingsThisMonth = monthlyIncome - monthlyExpense;
    const savingsLastMonth = lastMonthIncome - lastMonthExpense;

    // Spending by category (this month)
    const categoryMap = {};
    thisMonthTx
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        categoryMap[t.category] = (categoryMap[t.category] || 0) + (Number(t.amount) || 0);
      });
    const spendingByCategory = Object.entries(categoryMap)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);

    // Last 6 months trend
    const monthsTrend = Array.from({ length: 6 }).map((_, idx) => {
      const monthDate = subMonths(new Date(), 5 - idx);
      const monthTx = transactions.filter((t) => isSameMonth(safeDate(t), monthDate));
      return {
        month: monthDate.toLocaleDateString(undefined, { month: 'short' }),
        income: sumByType(monthTx, 'income'),
        expense: sumByType(monthTx, 'expense'),
        savings: sumByType(monthTx, 'income') - sumByType(monthTx, 'expense'),
      };
    });

    // Budget usage
    const monthStart = startOfMonth(new Date());
    const activeBudgets = budgets.map((b) => {
      const spent = thisMonthTx
        .filter((t) => t.type === 'expense' && (b.type === 'category' ? t.category === b.category : true))
        .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
      const pct = b.limit > 0 ? Math.min(100, (spent / b.limit) * 100) : 0;
      return { ...b, spent, percentUsed: pct, remaining: Math.max(0, b.limit - spent), monthStart };
    });

    const overallBudgetLimit = budgets.reduce((sum, b) => sum + (Number(b.limit) || 0), 0);
    const overallBudgetUsagePct =
      overallBudgetLimit > 0 ? Math.min(100, (monthlyExpense / overallBudgetLimit) * 100) : 0;

    // Financial health score (0-100): blends savings rate, budget discipline, goal progress
    const savingsRate = monthlyIncome > 0 ? Math.max(0, savingsThisMonth / monthlyIncome) : 0;
    const budgetDiscipline = activeBudgets.length
      ? activeBudgets.filter((b) => b.percentUsed <= 100).length / activeBudgets.length
      : 0.8;
    const goalsOnTrack = goals.length
      ? goals.filter((g) => (g.currentAmount || 0) / (g.targetAmount || 1) >= 0.1).length / goals.length
      : 0.5;
    const financialHealthScore = Math.round(
      Math.min(100, savingsRate * 50 + budgetDiscipline * 30 + goalsOnTrack * 20)
    );

    const dining = categoryMap['food_dining'] || 0;
    const lastMonthDining = lastMonthTx
      .filter((t) => t.type === 'expense' && t.category === 'food_dining')
      .reduce((s, t) => s + (Number(t.amount) || 0), 0);
    const diningChangePct = lastMonthDining > 0 ? ((dining - lastMonthDining) / lastMonthDining) * 100 : 0;

    const insights = [];
    if (Math.abs(diningChangePct) > 10) {
      insights.push({
        id: 'dining-trend',
        text: `You spent ${Math.abs(diningChangePct).toFixed(0)}% ${
          diningChangePct > 0 ? 'more' : 'less'
        } on Food & Dining this month.`,
        tone: diningChangePct > 0 ? 'warning' : 'positive',
      });
    }
    if (monthlyExpense > lastMonthExpense && lastMonthExpense > 0) {
      const pct = (((monthlyExpense - lastMonthExpense) / lastMonthExpense) * 100).toFixed(0);
      insights.push({
        id: 'overall-spend',
        text: `Overall spending is up ${pct}% compared to last month.`,
        tone: 'warning',
      });
    }
    if (savingsThisMonth > savingsLastMonth && savingsLastMonth >= 0) {
      insights.push({
        id: 'savings-up',
        text: `Nice work — your savings improved compared to last month.`,
        tone: 'positive',
      });
    }
    activeBudgets
      .filter((b) => b.percentUsed >= 100)
      .forEach((b) => {
        insights.push({
          id: `budget-over-${b.id}`,
          text: `You've exceeded your "${b.name}" budget for this period.`,
          tone: 'negative',
        });
      });

    const upcomingBills = transactions
      .filter((t) => t.recurrence && t.recurrence !== 'none' && t.nextDueDate)
      .sort((a, b) => new Date(a.nextDueDate) - new Date(b.nextDueDate))
      .slice(0, 5);

    return {
      currentBalance,
      accountsWithBalance,
      monthlyIncome,
      monthlyExpense,
      savingsThisMonth,
      savingsLastMonth,
      spendingByCategory,
      monthsTrend,
      activeBudgets,
      overallBudgetUsagePct,
      financialHealthScore,
      insights,
      upcomingBills,
      thisMonthTx,
    };
  }, [transactions, accounts, budgets, goals]);

const value = {
    transactions,
    accounts,
    budgets,
    goals,
    notifications,
    quickAdds,
    loading,
    ...derived,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
