import { Card, CardHeader } from '../ui/Card';
import { HeartPulse } from 'lucide-react';
import './FinancialHealthWidget.css';

function getHealthTone(score) {
  if (score >= 70) return { tone: 'positive', label: 'Strong' };
  if (score >= 40) return { tone: 'warning', label: 'Fair' };
  return { tone: 'negative', label: 'Needs attention' };
}

export function FinancialHealthWidget({ score }) {
  const { tone, label } = getHealthTone(score);
  const circumference = 2 * Math.PI * 52;
  const offset = circumference - (score / 100) * circumference;

  return (
    <Card>
      <CardHeader title="Financial Health Score" icon={<HeartPulse size={16} />} />
      <div className="eq-health">
        <svg viewBox="0 0 120 120" className="eq-health__gauge">
          <circle cx="60" cy="60" r="52" fill="none" stroke="var(--bg-sunken)" strokeWidth="10" />
          <circle
            cx="60"
            cy="60"
            r="52"
            fill="none"
            stroke={`var(--${tone === 'positive' ? 'positive' : tone === 'warning' ? 'warning' : 'negative'})`}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform="rotate(-90 60 60)"
            style={{ transition: 'stroke-dashoffset 700ms cubic-bezier(0.16,1,0.3,1)' }}
          />
          <text x="60" y="56" textAnchor="middle" className="eq-health__score-num" fontSize="26" fontWeight="700" fill="var(--text-primary)">
            {score}
          </text>
          <text x="60" y="76" textAnchor="middle" fontSize="11" fill="var(--text-tertiary)">
            out of 100
          </text>
        </svg>
        <div className="eq-health__info">
          <span className={`eq-health__badge eq-health__badge--${tone}`}>{label}</span>
          <p className="eq-health__desc">
            Based on your savings rate, budget discipline, and progress toward savings goals this month.
          </p>
        </div>
      </div>
    </Card>
  );
}
