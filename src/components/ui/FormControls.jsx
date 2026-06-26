import { forwardRef, useId, useState } from 'react';
import clsx from 'clsx';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import './FormControls.css';

export const Input = forwardRef(function Input(
  { label, error, hint, icon, type = 'text', className, required, ...props },
  ref
) {
  const id = useId();
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className={clsx('eq-field', className)}>
      {label && (
        <label htmlFor={id} className="eq-field__label">
          {label}
          {required && <span className="eq-field__required" aria-hidden="true"> *</span>}
        </label>
      )}
      <div className={clsx('eq-field__control', error && 'eq-field__control--error')}>
        {icon && <span className="eq-field__icon">{icon}</span>}
        <input
          ref={ref}
          id={id}
          type={inputType}
          className="eq-field__input"
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          required={required}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            className="eq-field__toggle"
            onClick={() => setShowPassword((s) => !s)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            tabIndex={0}
          >
            {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        )}
      </div>
      {error && (
        <p id={`${id}-error`} className="eq-field__error" role="alert">
          <AlertCircle size={13} /> {error}
        </p>
      )}
      {!error && hint && (
        <p id={`${id}-hint`} className="eq-field__hint">
          {hint}
        </p>
      )}
    </div>
  );
});

export const Select = forwardRef(function Select(
  { label, error, hint, options = [], placeholder, className, required, icon, ...props },
  ref
) {
  const id = useId();
  return (
    <div className={clsx('eq-field', className)}>
      {label && (
        <label htmlFor={id} className="eq-field__label">
          {label}
          {required && <span className="eq-field__required" aria-hidden="true"> *</span>}
        </label>
      )}
      <div className={clsx('eq-field__control', error && 'eq-field__control--error')}>
        {icon && <span className="eq-field__icon">{icon}</span>}
        <select
          ref={ref}
          id={id}
          className="eq-field__input eq-field__select"
          aria-invalid={!!error}
          required={required}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value ?? opt.id} value={opt.value ?? opt.id}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      {error && (
        <p className="eq-field__error" role="alert">
          <AlertCircle size={13} /> {error}
        </p>
      )}
      {!error && hint && <p className="eq-field__hint">{hint}</p>}
    </div>
  );
});

export const Textarea = forwardRef(function Textarea({ label, error, hint, className, ...props }, ref) {
  const id = useId();
  return (
    <div className={clsx('eq-field', className)}>
      {label && (
        <label htmlFor={id} className="eq-field__label">
          {label}
        </label>
      )}
      <div className={clsx('eq-field__control', error && 'eq-field__control--error')}>
        <textarea ref={ref} id={id} className="eq-field__input eq-field__textarea" {...props} />
      </div>
      {error && (
        <p className="eq-field__error" role="alert">
          <AlertCircle size={13} /> {error}
        </p>
      )}
      {!error && hint && <p className="eq-field__hint">{hint}</p>}
    </div>
  );
});

export function Checkbox({ label, checked, onChange, id, ...props }) {
  const generatedId = useId();
  const checkboxId = id || generatedId;
  return (
    <label htmlFor={checkboxId} className="eq-checkbox">
      <input id={checkboxId} type="checkbox" checked={checked} onChange={onChange} {...props} />
      <span className="eq-checkbox__box" aria-hidden="true" />
      <span className="eq-checkbox__label">{label}</span>
    </label>
  );
}
