import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  StickyNote,
  Tag,
  User,
  Sun,
  Moon,
  LogOut,
  Menu,
  X,
  Plus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navLinks = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/notes/new', icon: Plus, label: 'New Note' },
  { to: '/categories', icon: Tag, label: 'Categories' },
  { to: '/profile', icon: User, label: 'Profile' }
];

export default function MainLayout({ children }) {
  const { user, logout, darkMode, toggleDarkMode } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--color-bg)' }}>
      {/* Sidebar Overlay (mobile) */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 40
          }}
        />
      )}

      {/* Sidebar */}
      <aside
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          width: '240px',
          backgroundColor: 'var(--color-surface)',
          borderRight: '1px solid var(--color-border)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 50,
          transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.2s ease'
        }}
        className="lg-sidebar"
      >
        {/* Logo */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <StickyNote size={20} color="var(--color-accent)" />
            <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-text)' }}>
              NoteTracker
            </span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav Links */}
        <nav style={{ padding: '1rem 0.75rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {navLinks.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.625rem 0.875rem',
                borderRadius: '0.5rem',
                textDecoration: 'none',
                fontSize: '0.875rem',
                fontWeight: 500,
                color: isActive ? '#fff' : 'var(--color-text-muted)',
                backgroundColor: isActive ? 'var(--color-accent)' : 'transparent',
                transition: 'all 0.15s ease'
              })}
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Bottom: user + controls */}
        <div style={{ padding: '1rem', borderTop: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <div
              style={{
                width: '2rem',
                height: '2rem',
                borderRadius: '50%',
                backgroundColor: 'var(--color-accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#fff',
                flexShrink: 0
              }}
            >
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.name}
              </p>
              <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.email}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={toggleDarkMode} className="btn-ghost" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem', padding: '0.4rem' }}>
              {darkMode ? <Sun size={14} /> : <Moon size={14} />}
              <span style={{ fontSize: '0.75rem' }}>{darkMode ? 'Light' : 'Dark'}</span>
            </button>
            <button onClick={handleLogout} className="btn-ghost" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem', padding: '0.4rem' }}>
              <LogOut size={14} />
              <span style={{ fontSize: '0.75rem' }}>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top navbar */}
        <header
          style={{
            height: '60px',
            backgroundColor: 'var(--color-surface)',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            padding: '0 1.25rem',
            gap: '1rem',
            position: 'sticky',
            top: 0,
            zIndex: 30
          }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', display: 'flex' }}
          >
            <Menu size={20} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <StickyNote size={18} color="var(--color-accent)" />
            <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-text)' }}>
              NoteTracker
            </span>
          </div>

          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={toggleDarkMode}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', display: 'flex' }}
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              onClick={() => navigate('/notes/new')}
              className="btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.4rem 0.875rem' }}
            >
              <Plus size={14} />
              <span>New Note</span>
            </button>
            <button
              onClick={() => navigate('/profile')}
              style={{
                width: '2rem',
                height: '2rem',
                borderRadius: '50%',
                backgroundColor: 'var(--color-accent)',
                color: '#fff',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '0.8rem'
              }}
            >
              {user?.name?.charAt(0).toUpperCase()}
            </button>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, padding: '1.5rem', overflowY: 'auto' }}>
          {children}
        </main>
      </div>

      <style>{`
        @media (min-width: 1024px) {
          .lg-sidebar {
            transform: translateX(0) !important;
            position: sticky !important;
            top: 0 !important;
            height: 100vh !important;
          }
        }
      `}</style>
    </div>
  );
}
