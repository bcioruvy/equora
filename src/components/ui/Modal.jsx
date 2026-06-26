import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import './Modal.css';

export function Modal({ isOpen, onClose, title, children, footer, size = 'md' }) {
  const modalRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    modalRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, onClose]);

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
