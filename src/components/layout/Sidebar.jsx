import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ArrowLeftRight,
  BarChart3,
  PiggyBank,
  Target,
  FileText,
  Settings,
  Sun,
  Moon,
  LogOut,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { logout } from '../../firebase/auth';
import { useToast } from '../ui/Toast';
import { Avatar } from '../ui/Misc';
import './Sidebar.css';

const NAV_ITEMS = [
  { to: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/app/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { to: '/app/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/app/budgets', label: 'Budgets', icon: PiggyBank },
  { to: '/app/goals', label: 'Goals & Savings', icon: Target },
  { to: '/app/reports', label: 'Reports', icon: FileText },
  { to: '/app/settings', label: 'Settings', icon: Settings },
];

export function Sidebar({ collapsed, onToggleCollapse, mobileOpen, onCloseMobile }) {
  const { theme, toggleTheme } = useTheme();
  const { user, profile } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await logout();
      showToast('Signed out successfully', { tone: 'success' });
      navigate('/auth');
    } catch {
      showToast('Could not sign out. Try again.', { tone: 'error' });
    }
  }

  return (
    <>
      {mobileOpen && <div className="eq-sidebar__scrim" onClick={onCloseMobile} aria-hidden="true" />}
      <aside className={`eq-sidebar ${collapsed ? 'eq-sidebar--collapsed' : ''} ${mobileOpen ? 'eq-sidebar--mobile-open' : ''}`}>
        <div className="eq-sidebar__brand">
          <img src="/equora-mark.svg" alt="" width={32} height={32} className="eq-sidebar__logo" />
          {!collapsed && <span className="eq-sidebar__brand-name">Equora</span>}
          <button
            className="eq-sidebar__collapse-btn"
            onClick={onToggleCollapse}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
          </button>
        </div>

        <nav className="eq-sidebar__nav" aria-label="Main navigation">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onCloseMobile}
              onDoubleClick={() => collapsed && onToggleCollapse()}
              className={({ isActive }) => `eq-sidebar__link ${isActive ? 'eq-sidebar__link--active' : ''}`}
              title={collapsed ? label : undefined}
            >
              <Icon size={19} strokeWidth={2} className="eq-sidebar__link-icon" />
              {!collapsed && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="eq-sidebar__footer">
          <button
            className="eq-sidebar__theme-toggle"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            title={collapsed ? `Switch to ${theme === 'light' ? 'dark' : 'light'} mode` : undefined}
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            {!collapsed && <span>{theme === 'light' ? 'Dark mode' : 'Light mode'}</span>}
          </button>

          <NavLink to="/app/settings" className="eq-sidebar__profile" title={collapsed ? 'Profile' : undefined}>
            <Avatar name={profile?.fullName || user?.displayName || user?.email} photoUrl={profile?.photoUrl} size={32} />
            {!collapsed && (
              <div className="eq-sidebar__profile-text">
                <span className="eq-sidebar__profile-name">{profile?.fullName || user?.displayName || 'Account'}</span>
                <span className="eq-sidebar__profile-email">{user?.email}</span>
              </div>
            )}
          </NavLink>

          <button className="eq-sidebar__logout" onClick={handleLogout} title={collapsed ? 'Log out' : undefined}>
            <LogOut size={18} />
            {!collapsed && <span>Log out</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
