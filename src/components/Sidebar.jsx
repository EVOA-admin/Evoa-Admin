import { NavLink, useNavigate } from 'react-router-dom';
import { RiDashboardLine, RiArticleLine, RiLogoutBoxLine } from 'react-icons/ri';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function Sidebar() {
  const navigate = useNavigate();
  const { user } = useAuth();

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate('/login');
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <span className="sidebar-logo-text">EVO<span className="sidebar-logo-accent">A</span></span>
        <span className="sidebar-logo-subtitle">Admin</span>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
          <RiDashboardLine />
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/blogs" className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
          <RiArticleLine />
          <span>Blogs</span>
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
