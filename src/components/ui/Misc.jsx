import clsx from 'clsx';
import './Misc.css';

export function Badge({ tone = 'neutral', children, icon }) {
  return (
    <span className={clsx('eq-badge', `eq-badge--${tone}`)}>
      {icon && <span className="eq-badge__icon">{icon}</span>}
      {children}
    </span>
  );
}

export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="eq-empty">
      {icon && <div className="eq-empty__icon">{icon}</div>}
      <h3 className="eq-empty__title">{title}</h3>
      {description && <p className="eq-empty__desc">{description}</p>}
      {action && <div className="eq-empty__action">{action}</div>}
    </div>
  );
}

export function Spinner({ size = 24 }) {
  return (
    <div
      className="eq-spinner"
      style={{ width: size, height: size }}
      role="status"
      aria-label="Loading"
    />
  );
}

export function PageSpinner({ label = 'Loading your data…' }) {
  return (
    <div className="eq-page-spinner">
      <Spinner size={32} />
      <p>{label}</p>
    </div>
  );
}

export function IconButton({ icon, label, onClick, tone = 'neutral', className, ...props }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={clsx('eq-icon-btn', `eq-icon-btn--${tone}`, className)}
      {...props}
    >
      {icon}
    </button>
  );
}

export function Avatar({ name, photoUrl, size = 36 }) {
  const initials = (name || '')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={name}
        className="eq-avatar"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div className="eq-avatar eq-avatar--initials" style={{ width: size, height: size, fontSize: size * 0.4 }}>
      {initials || '?'}
    </div>
  );
}
