import clsx from 'clsx';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Card } from '../ui/Card';
import './SummaryCard.css';

export function SummaryCard({ label, value, icon, trend, tone = 'neutral' }) {
  return (
    <Card className="eq-summary-card" padded>
      <div className="eq-summary-card__top">
        <span className="eq-summary-card__label">{label}</span>
        <span className={clsx('eq-summary-card__icon', `eq-summary-card__icon--${tone}`)}>{icon}</span>
      </div>
      <p className="eq-summary-card__value mono-num">{value}</p>
      {trend && (
        <div className={clsx('eq-summary-card__trend', trend.direction === 'up' ? 'eq-summary-card__trend--up' : 'eq-summary-card__trend--down')}>
          {trend.direction === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          <span>{trend.text}</span>
        </div>
      )}
    </Card>
  );
}
