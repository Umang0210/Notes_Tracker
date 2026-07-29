import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import MainLayout from './layouts/MainLayout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import NoteEditor from './pages/NoteEditor';
import Categories from './pages/Categories';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

// Redirects unauthenticated users to login
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          backgroundColor: 'var(--color-bg)'
        }}
      >
        <div
          style={{
            width: '2rem',
            height: '2rem',
            border: '3px solid var(--color-border)',
            borderTopColor: 'var(--color-accent)',
            borderRadius: '50%',
            animation: 'spin 0.75s linear infinite'
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" replace />;
}

// Redirects authenticated users away from auth pages
function GuestRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return !user ? children : <Navigate to="/dashboard" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<GuestRoute><Landing /></GuestRoute>} />
        <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />

        {/* Protected — wrapped in sidebar layout */}
        <Route
          path="/dashboard"
          element={<ProtectedRoute><MainLayout><Dashboard /></MainLayout></ProtectedRoute>}
        />
        <Route
          path="/notes/new"
          element={<ProtectedRoute><MainLayout><NoteEditor /></MainLayout></ProtectedRoute>}
        />
        <Route
          path="/notes/:id/edit"
          element={<ProtectedRoute><MainLayout><NoteEditor /></MainLayout></ProtectedRoute>}
        />
        <Route
          path="/categories"
          element={<ProtectedRoute><MainLayout><Categories /></MainLayout></ProtectedRoute>}
        />
        <Route
          path="/profile"
          element={<ProtectedRoute><MainLayout><Profile /></MainLayout></ProtectedRoute>}
        />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
