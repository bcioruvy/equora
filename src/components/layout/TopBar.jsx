import { useState, useRef, useEffect } from 'react';
import { Menu, Bell, AlertTriangle, Calendar, Target, TrendingUp } from 'lucide-react';
import { useData } from '../../context/DataContext';
import './TopBar.css';

const ICONS = {
  budget: AlertTriangle,
  bill: Calendar,
  goal: Target,
  insight: TrendingUp,
};

export function TopBar({ title, subtitle, onOpenMobileMenu, actions }) {
  const { notifications } = useData();
  const [open, setOpen] = useState(false);
  const popRef = useRef(null);
  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    function handleClick(e) {
      if (open && popRef.current && !popRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  return (
    <header className="eq-topbar">
      <button className="eq-topbar__menu-btn" onClick={onOpenMobileMenu} aria-label="Open navigation menu">
        <Menu size={20} />
      </button>

      <div className="eq-topbar__titles">
        <h1 className="eq-topbar__title">{title}</h1>
        {subtitle && <p className="eq-topbar__subtitle">{subtitle}</p>}
      </div>

      <div className="eq-topbar__actions">
        {actions}
        <div className="eq-topbar__notif" ref={popRef}>
          <button
            className="eq-topbar__icon-btn"
            onClick={() => setOpen((o) => !o)}
            aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
            aria-expanded={open}
          >
            <Bell size={19} />
            {unreadCount > 0 && <span className="eq-topbar__badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
          </button>
          {open && (
            <div className="eq-topbar__dropdown" role="menu">
              <div className="eq-topbar__dropdown-header">Notifications</div>
              {notifications.length === 0 ? (
                <p className="eq-topbar__empty">You're all caught up.</p>
              ) : (
                <ul className="eq-topbar__list">
                  {notifications.slice(0, 8).map((n) => {
                    const Icon = ICONS[n.category] || Bell;
                    return (
                      <li key={n.id} className={`eq-topbar__item ${!n.read ? 'eq-topbar__item--unread' : ''}`}>
                        <Icon size={15} />
                        <span>{n.message}</span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
