import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import './Modal.css';

export function Modal({ isOpen, onClose, title, children, footer, size = 'md' }) {
  const modalRef = useRef(null);
  // Keep the latest onClose in a ref so the effect below doesn't need it in
  // its dependency array. onClose is a new function reference on every
  // render (it's usually an inline arrow function), and every keystroke in
  // a form inside this modal causes a re-render — if onClose were a
  // dependency, that would re-run modalRef.current.focus() after every
  // single character, stealing focus from the input and dismissing the
  // on-screen keyboard.
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onCloseRef.current?.();
    };
    document.addEventListener('keydown', handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    modalRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div className="eq-modal__overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}>
      <div
        className={`eq-modal eq-modal--${size}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        ref={modalRef}
        tabIndex={-1}
      >
        <div className="eq-modal__header">
          <h2 className="eq-modal__title">{title}</h2>
          <button className="eq-modal__close" onClick={onClose} aria-label="Close dialog">
            <X size={18} />
          </button>
        </div>
        <div className="eq-modal__body">{children}</div>
        {footer && <div className="eq-modal__footer">{footer}</div>}
      </div>
    </div>,
    document.body
  );
}
