import { createContext, useCallback, useContext, useState } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import './Toast.css';

const ToastContext = createContext(null);
let idCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message, { tone = 'success', duration = 4000 } = {}) => {
      const id = ++idCounter;
      setToasts((prev) => [...prev, { id, message, tone }]);
      if (duration) {
        setTimeout(() => dismiss(id), duration);
      }
      return id;
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ showToast, dismiss }}>
      {children}
      <div className="eq-toast-stack" aria-live="polite" aria-atomic="true">
        {toasts.map((t) => (
          <div key={t.id} className={`eq-toast eq-toast--${t.tone}`} role="status">
            {t.tone === 'success' && <CheckCircle2 size={18} />}
            {t.tone === 'error' && <AlertCircle size={18} />}
            {t.tone === 'info' && <Info size={18} />}
            <span className="eq-toast__msg">{t.message}</span>
            <button className="eq-toast__close" onClick={() => dismiss(t.id)} aria-label="Dismiss notification">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
