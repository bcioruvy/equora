import clsx from 'clsx';
import './BalanceBeam.css';

/**
 * The Balance Beam — Equora's signature motif.
 * Renders a fulcrum-and-beam SVG that visually tips toward
 * whichever side (left/right) has more weight, echoing the
 * logo mark. Used for income-vs-expense, and reused as a
 * "tipping" progress style for budgets/goals via `percent`.
 */
export function BalanceBeam({ leftLabel, rightLabel, leftValue, rightValue, leftColor = 'var(--positive)', rightColor = 'var(--negative)' }) {
  const total = leftValue + rightValue || 1;
  const tiltRatio = (leftValue - rightValue) / total; // -1..1
  const angle = Math.max(-9, Math.min(9, tiltRatio * -9));

  return (
    <div className="eq-beam">
      <svg viewBox="0 0 240 90" className="eq-beam__svg" role="img" aria-label={`${leftLabel} versus ${rightLabel}`}>
        <line x1="120" y1="14" x2="120" y2="40" stroke="var(--border-strong)" strokeWidth="2" />
        <g style={{ transform: `rotate(${angle}deg)`, transformOrigin: '120px 40px', transition: 'transform 600ms cubic-bezier(0.16,1,0.3,1)' }}>
          <line x1="20" y1="40" x2="220" y2="40" stroke="var(--border-strong)" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="20" cy="40" r="5" fill={leftColor} />
          <circle cx="220" cy="40" r="5" fill={rightColor} />
        </g>
        <polygon points="120,40 110,62 130,62" fill="var(--border-strong)" />
        <line x1="100" y1="63" x2="140" y2="63" stroke="var(--border-strong)" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
      <div className="eq-beam__legend">
        <div className="eq-beam__legend-item">
          <span className="eq-beam__dot" style={{ background: leftColor }} />
          <span className="eq-beam__legend-label">{leftLabel}</span>
        </div>
        <div className="eq-beam__legend-item">
          <span className="eq-beam__dot" style={{ background: rightColor }} />
          <span className="eq-beam__legend-label">{rightLabel}</span>
        </div>
      </div>
    </div>
  );
}

/** A horizontal progress bar styled as a short balance beam tipping toward completion. */
export function BeamProgress({ percent = 0, tone = 'brand', label, valueLabel }) {
  const clamped = Math.max(0, Math.min(100, percent));
  return (
    <div className="eq-beam-progress">
      {(label || valueLabel) && (
        <div className="eq-beam-progress__row">
          {label && <span className="eq-beam-progress__label">{label}</span>}
          {valueLabel && <span className="eq-beam-progress__value mono-num">{valueLabel}</span>}
        </div>
      )}
      <div className="eq-beam-progress__track" role="progressbar" aria-valuenow={Math.round(clamped)} aria-valuemin={0} aria-valuemax={100}>
        <div
          className={clsx('eq-beam-progress__fill', `eq-beam-progress__fill--${tone}`)}
          style={{ width: `${clamped}%` }}
        />
        <div className="eq-beam-progress__notch" style={{ left: `${clamped}%` }} />
      </div>
    </div>
  );
}
