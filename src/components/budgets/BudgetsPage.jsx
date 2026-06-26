import { useState } from 'react';
import { Plus, PiggyBank, AlertTriangle, Pencil, Trash2 } from 'lucide-react';
import { PageShell } from '../layout/PageShell';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge, EmptyState, IconButton } from '../ui/Misc';
import { BeamProgress } from '../ui/BalanceBeam';
import { BudgetFormModal } from './BudgetFormModal';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../ui/Toast';
import { deleteBudget } from '../../firebase/firestore';
import { getCategoryById } from '../../lib/constants';
import { formatMoney } from '../../lib/format';
import { differenceInDays, endOfMonth } from 'date-fns';
import './BudgetsPage.css';

export function BudgetsPage() {
  const { activeBudgets } = useData();
  const { user, profile } = useAuth();
  const { showToast } = useToast();
  const currency = profile?.currency || 'USD';

  const [modal, setModal] = useState({ open: false, budget: null });

  async function handleDelete(id) {
    if (!window.confirm('Delete this budget? This cannot be undone.')) return;
    try {
      await deleteBudget(user.uid, id);
      showToast('Budget deleted', { tone: 'success' });
    } catch {
      showToast('Could not delete budget.', { tone: 'error' });
    }
  }

  const daysLeftInMonth = differenceInDays(endOfMonth(new Date()), new Date()) + 1;

  return (
    <PageShell
      title="Budgets"
      subtitle="Set spending limits and stay ahead of them."
      actions={<Button icon={<Plus size={16} />} onClick={() => setModal({ open: true, budget: null })}>Create Budget</Button>}
    >
      {activeBudgets.length === 0 ? (
        <Card>
          <EmptyState
            icon={<PiggyBank size={32} />}
            title="No budgets yet"
            description="Create a monthly, category, or savings budget to track your spending limits."
            action={<Button icon={<Plus size={16} />} onClick={() => setModal({ open: true, budget: null })}>Create your first budget</Button>}
          />
        </Card>
      ) : (
        <div className="eq-grid eq-grid--two">
          {activeBudgets.map((b) => {
            const isOver = b.percentUsed >= 100;
            const isNearLimit = b.percentUsed >= 80 && b.percentUsed < 100;
            const forecastDaily = b.spent / Math.max(1, 30 - daysLeftInMonth || 1);
            const projectedTotal = b.spent + forecastDaily * daysLeftInMonth;

            return (
              <Card key={b.id} className="eq-budget-card">
                <div className="eq-budget-card__header">
                  <div>
                    <h3 className="eq-budget-card__name">{b.name}</h3>
                    <span className="eq-budget-card__meta">
                      {b.type === 'category' ? getCategoryById(b.category).label : b.type === 'savings' ? 'Savings budget' : 'Monthly budget'}
                      {' · '}{b.period}
                    </span>
                  </div>
                  <div className="eq-budget-card__actions">
                    <IconButton icon={<Pencil size={15} />} label="Edit budget" onClick={() => setModal({ open: true, budget: b })} />
                    <IconButton icon={<Trash2 size={15} />} label="Delete budget" tone="danger" onClick={() => handleDelete(b.id)} />
                  </div>
                </div>

                {isOver && (
                  <Badge tone="negative" icon={<AlertTriangle size={12} />}>Over budget</Badge>
                )}
                {isNearLimit && !isOver && (
                  <Badge tone="warning" icon={<AlertTriangle size={12} />}>Approaching limit</Badge>
                )}

                <div style={{ marginTop: 14 }}>
                  <BeamProgress
                    valueLabel={`${formatMoney(b.spent, currency)} of ${formatMoney(b.limit, currency)}`}
                    percent={b.percentUsed}
                    tone={isOver ? 'danger' : isNearLimit ? 'warning' : 'brand'}
                  />
                </div>

                <div className="eq-budget-card__footer">
                  <div>
                    <span className="eq-budget-card__footer-label">Remaining</span>
                    <span className="eq-budget-card__footer-value mono-num">{formatMoney(b.remaining, currency)}</span>
                  </div>
                  <div>
                    <span className="eq-budget-card__footer-label">Forecast (month end)</span>
                    <span className="eq-budget-card__footer-value mono-num" style={{ color: projectedTotal > b.limit ? 'var(--negative)' : 'var(--text-primary)' }}>
                      {formatMoney(projectedTotal, currency)}
                    </span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <BudgetFormModal isOpen={modal.open} editingBudget={modal.budget} onClose={() => setModal({ open: false, budget: null })} />
    </PageShell>
  );
}
