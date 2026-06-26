import clsx from 'clsx';
import './Card.css';

export function Card({ className, padded = true, children, as: Tag = 'div', ...props }) {
  return (
    <Tag className={clsx('eq-card', padded && 'eq-card--padded', className)} {...props}>
      {children}
    </Tag>
  );
}

export function CardHeader({ title, subtitle, action, icon, className }) {
  return (
    <div className={clsx('eq-card__header', className)}>
      <div className="eq-card__header-text">
        <div className="eq-card__title-row">
          {icon && <span className="eq-card__icon">{icon}</span>}
          <h3 className="eq-card__title">{title}</h3>
        </div>
        {subtitle && <p className="eq-card__subtitle">{subtitle}</p>}
      </div>
      {action && <div className="eq-card__action">{action}</div>}
    </div>
  );
}
