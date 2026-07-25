import { NavLink, useNavigate } from 'react-router-dom';
import {
  RiDashboardLine,
  RiArticleLine,
  RiLogoutBoxLine,
  RiCloseLine,
  RiTeamLine,
  RiRocketLine,
  RiFundsLine,
  RiSwordLine,
  RiMoneyDollarCircleLine,
  RiCalendarEventLine,
} from 'react-icons/ri';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { user } = useAuth();

  async function handleLogout() {
    localStorage.removeItem('authToken');
    await supabase.auth.signOut();
    navigate('/login');
  }

  function handleNavClick() {
    // Close sidebar on mobile after nav
    if (onClose) onClose();
  }

  return (
    <aside className={`sidebar${isOpen ? ' sidebar-open' : ''}`}>
      {/* Mobile close button */}
      <button className="sidebar-close-btn" onClick={onClose} aria-label="Close menu">
        <RiCloseLine size={20} />
      </button>

      <div className="sidebar-logo">
        <span className="sidebar-logo-text">EVO<span className="sidebar-logo-accent">A</span></span>
        <span className="sidebar-logo-subtitle">Admin</span>
      </div>

      <nav className="sidebar-nav">
        <NavLink
          to="/dashboard"
          className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
          onClick={handleNavClick}
        >
          <RiDashboardLine />
          <span>Dashboard</span>
        </NavLink>
        <NavLink
          to="/users"
          className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
          onClick={handleNavClick}
        >
          <RiTeamLine />
          <span>Users</span>
        </NavLink>
        <NavLink
          to="/startups"
          className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
          onClick={handleNavClick}
        >
          <RiRocketLine />
          <span>Startups</span>
        </NavLink>
        <NavLink
          to="/investors"
          className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
          onClick={handleNavClick}
        >
          <RiFundsLine />
          <span>Investors</span>
        </NavLink>
        <NavLink
          to="/battleground"
          className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
          onClick={handleNavClick}
        >
          <RiSwordLine />
          <span>Battleground</span>
        </NavLink>
        <NavLink
          to="/payments"
          className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
          onClick={handleNavClick}
        >
          <RiMoneyDollarCircleLine />
          <span>Payments</span>
        </NavLink>
        <NavLink
          to="/blogs"
          className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
          onClick={handleNavClick}
        >
          <RiArticleLine />
          <span>Blogs</span>
        </NavLink>
        <NavLink
          to="/events"
          className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
          onClick={handleNavClick}
        >
          <RiCalendarEventLine />
          <span>Events</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user-email">{user?.email}</div>
        <button className="sidebar-logout-btn" onClick={handleLogout}>
          <RiLogoutBoxLine />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
