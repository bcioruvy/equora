import { useState } from 'react';
import { Plus, Target, Pencil, Trash2, CalendarClock } from 'lucide-react';
import * as Icons from 'lucide-react';
import { PageShell } from '../layout/PageShell';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge, EmptyState, IconButton } from '../ui/Misc';
import { BeamProgress } from '../ui/BalanceBeam';
import { GoalFormModal } from './GoalFormModal';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../ui/Toast';
import { deleteGoal } from '../../firebase/firestore';
import { GOAL_TEMPLATES } from '../../lib/constants';
import { formatMoney, clampPercent } from '../../lib/format';
import { differenceInCalendarDays, differenceInCalendarMonths, addMonths, format as formatDate } from 'date-fns';
import './GoalsPage.css';

export function GoalsPage() {
  const { goals } = useData();
  const { user, profile } = useAuth();
  const { showToast } = useToast();
  const currency = profile?.currency || 'USD';

  const [modal, setModal] = useState({ open: false, goal: null });

  async function handleDelete(id) {
    if (!window.confirm('Delete this savings goal? This cannot be undone.')) return;
    try {
      await deleteGoal(user.uid, id);
      showToast('Goal deleted', { tone: 'success' });
    } catch {
      showToast('Could not delete goal.', { tone: 'error' });
    }
  }

  return (
    <PageShell
      title="Goals & Savings"
      subtitle="Set targets and watch your progress tip toward done."
      actions={<Button icon={<Plus size={16} />} onClick={() => setModal({ open: true, goal: null })}>New Goal</Button>}
    >
      {goals.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Target size={32} />}
            title="No savings goals yet"
            description="Create a goal — an emergency fund, a trip, a deposit — and track your progress toward it."
            action={<Button icon={<Plus size={16} />} onClick={() => setModal({ open: true, goal: null })}>Create your first goal</Button>}
          />
        </Card>
      ) : (
        <div className="eq-grid eq-grid--three">
          {goals.map((g) => {
            const template = GOAL_TEMPLATES.find((t) => t.id === g.template) || GOAL_TEMPLATES[GOAL_TEMPLATES.length - 1];
            const Icon = Icons[template.icon] || Target;
            const percent = clampPercent((Number(g.currentAmount || 0) / Math.max(1, Number(g.targetAmount))) * 100);
            const isComplete = percent >= 100;
            const daysLeft = g.deadline ? differenceInCalendarDays(new Date(g.deadline), new Date()) : null;

            // Estimate completion based on remaining amount and avg monthly progress assumption
            const remaining = Math.max(0, Number(g.targetAmount) - Number(g.currentAmount || 0));
            const monthsElapsed = Math.max(1, differenceInCalendarMonths(new Date(), new Date(g.createdAt?.toDate?.() || g.createdAt || new Date())) || 1);
            const avgMonthlyProgress = Number(g.currentAmount || 0) / monthsElapsed || 1;
            const monthsToGo = avgMonthlyProgress > 0 ? Math.ceil(remaining / avgMonthlyProgress) : null;
            const estimatedDate = monthsToGo ? addMonths(new Date(), monthsToGo) : null;

            return (
              <Card key={g.id} className="eq-goal-card">
                <div className="eq-goal-card__header">
                  <span className="eq-goal-card__icon"><Icon size={18} /></span>
                  <div className="eq-goal-card__actions">
                    <IconButton icon={<Pencil size={14} />} label="Edit goal" onClick={() => setModal({ open: true, goal: g })} />
                    <IconButton icon={<Trash2 size={14} />} label="Delete goal" tone="danger" onClick={() => handleDelete(g.id)} />
                  </div>
                </div>
                <h3 className="eq-goal-card__name">{g.name}</h3>
                {isComplete && <Badge tone="positive">Goal reached 🎉</Badge>}

                <div style={{ marginTop: 12 }}>
                  <BeamProgress
                    valueLabel={`${percent.toFixed(0)}%`}
                    percent={percent}
                    tone={isComplete ? 'brand' : 'brand'}
                  />
                </div>

                <div className="eq-goal-card__amounts">
                  <span className="mono-num">{formatMoney(g.currentAmount || 0, currency)}</span>
                  <span className="eq-goal-card__of">of</span>
                  <span className="mono-num eq-goal-card__target">{formatMoney(g.targetAmount, currency)}</span>
                </div>

                <div className="eq-goal-card__footer">
                  {g.deadline && (
                    <span className="eq-goal-card__deadline">
                      <CalendarClock size={13} />
                      {daysLeft >= 0 ? `${daysLeft} day${daysLeft === 1 ? '' : 's'} left` : 'Past deadline'}
                    </span>
                  )}
                  {!isComplete && estimatedDate && (
                    <span className="eq-goal-card__estimate">
                      Est. completion: {formatDate(estimatedDate, 'MMM yyyy')}
                    </span>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <GoalFormModal isOpen={modal.open} editingGoal={modal.goal} onClose={() => setModal({ open: false, goal: null })} />
    </PageShell>
  );
}
