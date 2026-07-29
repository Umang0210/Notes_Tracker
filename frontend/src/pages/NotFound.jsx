import { useNavigate } from 'react-router-dom';
import { StickyNote, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-bg)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '2rem'
      }}
    >
      <StickyNote size={48} color="var(--color-accent)" style={{ marginBottom: '1.5rem', opacity: 0.7 }} />
      <h1 style={{ fontSize: '5rem', fontWeight: 800, color: 'var(--color-accent)', lineHeight: 1, marginBottom: '0.5rem' }}>
        404
      </h1>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.75rem' }}>
        Page Not Found
      </h2>
      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', marginBottom: '2rem', maxWidth: '380px', lineHeight: 1.6 }}>
        The page you are looking for does not exist, or may have been moved. Check the URL and try again.
      </p>
      <button
        className="btn-primary"
        onClick={() => navigate('/')}
        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.7rem 1.5rem' }}
      >
        <ArrowLeft size={16} />
        Back to Home
      </button>
    </div>
  );
}
