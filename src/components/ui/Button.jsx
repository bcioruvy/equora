import { forwardRef } from 'react';
import clsx from 'clsx';
import './Button.css';

export const Button = forwardRef(function Button(
  { variant = 'primary', size = 'md', icon, iconPosition = 'left', loading, fullWidth, className, children, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      className={clsx('eq-btn', `eq-btn--${variant}`, `eq-btn--${size}`, fullWidth && 'eq-btn--full', className)}
      disabled={props.disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="eq-btn__spinner" aria-hidden="true" />
      ) : (
        <>
          {icon && iconPosition === 'left' && <span className="eq-btn__icon">{icon}</span>}
          {children && <span className="eq-btn__label">{children}</span>}
          {icon && iconPosition === 'right' && <span className="eq-btn__icon">{icon}</span>}
        </>
      )}
    </button>
  );
});
