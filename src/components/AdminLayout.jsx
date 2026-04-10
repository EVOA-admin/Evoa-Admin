import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { RiMenuLine, RiCloseLine } from 'react-icons/ri';

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="admin-layout">
      {/* Mobile topbar */}
      <header className="mobile-topbar">
        <button
          className="hamburger-btn"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open menu"
        >
          <RiMenuLine size={22} />
        </button>
        <span className="mobile-topbar-logo">
          EVO<span className="mobile-topbar-accent">A</span>
          <span className="mobile-topbar-sub">Admin</span>
        </span>
      </header>

      {/* Sidebar drawer overlay */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
