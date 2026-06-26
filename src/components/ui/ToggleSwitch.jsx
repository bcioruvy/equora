import './ToggleSwitch.css';

export function ToggleSwitch({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className={`eq-toggle ${checked ? 'eq-toggle--on' : ''}`}
      onClick={() => onChange(!checked)}
    >
      <span className="eq-toggle__thumb" />
    </button>
  );
}
