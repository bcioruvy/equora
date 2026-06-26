import { useEffect, useRef } from 'react';
import { addDays, addMonths, addWeeks, addYears, isBefore, isAfter, parseISO } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { addNotification, updateTransaction } from '../firebase/firestore';
import { getCategoryById } from '../lib/constants';
import { formatMoney } from '../lib/format';

function nextOccurrence(date, recurrence) {
  switch (recurrence) {
    case 'daily': return addDays(date, 1);
    case 'weekly': return addWeeks(date, 1);
    case 'monthly': return addMonths(date, 1);
    case 'yearly': return addYears(date, 1);
    default: return null;
  }
}

/**
 * Computes nextDueDate for recurring transactions (for the Upcoming Bills
 * widget) and raises in-app notifications for budgets exceeded, bills due
 * soon, and goal milestones reached. Runs once per data refresh, guarded
 * so it doesn't spam duplicate notifications.
 */
export function useFinancialAutomation() {
  const { user, profile } = useAuth();
  const { transactions, activeBudgets, goals, notifications } = useData();
  const processedRef = useRef(new Set());

  // Keep recurring transactions' nextDueDate fresh
  useEffect(() => {
    if (!user) return;
    transactions
      .filter((t) => t.recurrence && t.recurrence !== 'none')
      .forEach((t) => {
        const baseDate = typeof t.date === 'string' ? parseISO(t.date) : new Date(t.date);
        let due = t.nextDueDate ? parseISO(t.nextDueDate) : nextOccurrence(baseDate, t.recurrence);
        if (due && isBefore(due, new Date())) {
          due = nextOccurrence(due, t.recurrence);
        }
        const dueStr = due?.toISOString().slice(0, 10);
        if (due && dueStr !== t.nextDueDate) {
          updateTransaction(user.uid, t.id, { nextDueDate: dueStr }).catch(() => {});
        }
      });
  }, [user, transactions]);

  // Budget exceeded alerts
  useEffect(() => {
    if (!user) return;
    activeBudgets.forEach((b) => {
      const key = `budget-${b.id}-exceeded`;
      if (b.percentUsed >= 100 && !processedRef.current.has(key)) {
        const alreadyExists = notifications.some((n) => n.dedupeKey === key);
        if (!alreadyExists) {
          addNotification(user.uid, {
            category: 'budget',
            message: `You've exceeded your "${b.name}" budget.`,
            dedupeKey: key,
            read: false,
          }).catch(() => {});
        }
        processedRef.current.add(key);
      }
    });
  }, [user, activeBudgets, notifications]);

  // Upcoming bill reminders (due within 3 days)
  useEffect(() => {
    if (!user) return;
    const soon = addDays(new Date(), 3);
    transactions
      .filter((t) => t.recurrence !== 'none' && t.nextDueDate)
      .forEach((t) => {
        const due = parseISO(t.nextDueDate);
        const key = `bill-${t.id}-${t.nextDueDate}`;
        if (isBefore(due, soon) && isAfter(due, new Date()) && !processedRef.current.has(key)) {
          const alreadyExists = notifications.some((n) => n.dedupeKey === key);
          if (!alreadyExists) {
            addNotification(user.uid, {
              category: 'bill',
              message: `${getCategoryById(t.category).label} bill of ${formatMoney(t.amount, profile?.currency || 'USD')} is due soon.`,
              dedupeKey: key,
              read: false,
            }).catch(() => {});
          }
          processedRef.current.add(key);
        }
      });
  }, [user, transactions, notifications, profile]);

  // Savings goal milestones (25/50/75/100%)
  useEffect(() => {
    if (!user) return;
    goals.forEach((g) => {
      const pct = Math.min(100, ((g.currentAmount || 0) / Math.max(1, g.targetAmount)) * 100);
      [25, 50, 75, 100].forEach((milestone) => {
        const key = `goal-${g.id}-${milestone}`;
        if (pct >= milestone && !processedRef.current.has(key)) {
          const alreadyExists = notifications.some((n) => n.dedupeKey === key);
          if (!alreadyExists) {
            addNotification(user.uid, {
              category: 'goal',
              message:
                milestone === 100
                  ? `You reached your "${g.name}" savings goal!`
                  : `You're ${milestone}% of the way to your "${g.name}" goal.`,
              dedupeKey: key,
              read: false,
            }).catch(() => {});
          }
          processedRef.current.add(key);
        }
      });
    });
  }, [user, goals, notifications]);
}
