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
  RiShieldUserLine,
} from 'react-icons/ri';
import { useAuth } from '../contexts/AuthContext';

export default function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { user, profile, logout } = useAuth();

  const isEventAdmin = profile?.role === 'EVENT_ADMIN';

  async function handleLogout() {
    if (logout) {
      await logout();
    } else {
      localStorage.removeItem('authToken');
      localStorage.removeItem('adminProfile');
    }
    navigate('/login');
  }

  function handleNavClick() {
    if (onClose) onClose();
  }

  return (
    <aside className={`sidebar${isOpen ? ' sidebar-open' : ''}`}>
      <button className="sidebar-close-btn" onClick={onClose} aria-label="Close menu">
        <RiCloseLine size={20} />
      </button>

      <div className="sidebar-logo">
        <span className="sidebar-logo-text">EVO<span className="sidebar-logo-accent">A</span></span>
        <span className="sidebar-logo-subtitle">{isEventAdmin ? 'Event Admin' : 'Admin'}</span>
      </div>

      <nav className="sidebar-nav">
        {!isEventAdmin && (
          <NavLink
            to="/dashboard"
            className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
            onClick={handleNavClick}
          >
            <RiDashboardLine />
            <span>Dashboard</span>
          </NavLink>
        )}

        {!isEventAdmin && (
          <>
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
          </>
        )}

        <NavLink
          to="/events"
          className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
          onClick={handleNavClick}
        >
          <RiCalendarEventLine />
          <span>Events</span>
        </NavLink>

        {!isEventAdmin && (
          <NavLink
            to="/admin-management"
            className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
            onClick={handleNavClick}
          >
            <RiShieldUserLine />
            <span>Admin Management</span>
          </NavLink>
        )}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user-email">{profile?.fullName || profile?.email || user?.email}</div>
        <button className="sidebar-logout-btn" onClick={handleLogout}>
          <RiLogoutBoxLine />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
