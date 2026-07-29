import { useNavigate } from 'react-router-dom';
import { StickyNote, Shield, Search, Zap, Star, Archive } from 'lucide-react';

const features = [
  { icon: StickyNote, title: 'Organize Notes', desc: 'Create, pin, archive and favourite your notes with ease.' },
  { icon: Shield, title: 'Secure & Private', desc: 'JWT-protected accounts. Your notes belong only to you.' },
  { icon: Search, title: 'Powerful Search', desc: 'Full-text search with filters by category, tag and priority.' },
  { icon: Zap, title: 'Fast & Lightweight', desc: 'Built on React + Vite. Pages load instantly.' },
  { icon: Star, title: 'Favourites', desc: 'Mark important notes and access them immediately.' },
  { icon: Archive, title: 'Archive', desc: 'Keep your workspace clean by archiving old notes.' }
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}>
      {/* Navbar */}
      <nav
        style={{
          padding: '1rem 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--color-border)',
          backgroundColor: 'var(--color-surface)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <StickyNote size={22} color="var(--color-accent)" />
          <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>NoteTracker</span>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn-ghost" onClick={() => navigate('/login')}>Login</button>
          <button className="btn-primary" onClick={() => navigate('/register')}>Get Started</button>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ textAlign: 'center', padding: '5rem 1.5rem 4rem' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: '9999px',
            padding: '0.35rem 1rem',
            fontSize: '0.8rem',
            color: 'var(--color-text-muted)',
            marginBottom: '2rem'
          }}
        >
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--color-success)', display: 'inline-block' }} />
          Production-ready · Open Source
        </div>

        <h1
          style={{
            fontSize: 'clamp(2.25rem, 6vw, 4rem)',
            fontWeight: 800,
            lineHeight: 1.15,
            marginBottom: '1.25rem',
            letterSpacing: '-0.02em'
          }}
        >
          Your notes,{' '}
          <span style={{ color: 'var(--color-accent)' }}>organized</span>
          <br />your way.
        </h1>

        <p
          style={{
            fontSize: '1.1rem',
            color: 'var(--color-text-muted)',
            maxWidth: '520px',
            margin: '0 auto 2.5rem',
            lineHeight: 1.65
          }}
        >
          A full-featured note tracker with categories, tags, priorities, reminders, favourites, and a powerful search — built for people who think clearly.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            className="btn-primary"
            onClick={() => navigate('/register')}
            style={{ padding: '0.75rem 2rem', fontSize: '1rem' }}
          >
            Start for free
          </button>
          <button
            className="btn-ghost"
            onClick={() => navigate('/login')}
            style={{ padding: '0.75rem 2rem', fontSize: '1rem' }}
          >
            Sign in
          </button>
        </div>
      </section>

      {/* Features Grid */}
      <section style={{ padding: '2rem 1.5rem 5rem', maxWidth: '960px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: '1.5rem', fontWeight: 700, marginBottom: '2.5rem' }}>
          Everything you need to stay organized
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1.25rem'
          }}
        >
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div
                style={{
                  width: '2.5rem',
                  height: '2.5rem',
                  borderRadius: '0.625rem',
                  backgroundColor: 'var(--color-surface-2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Icon size={18} color="var(--color-accent)" />
              </div>
              <h3 style={{ fontWeight: 600, fontSize: '0.95rem' }}>{title}</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          textAlign: 'center',
          padding: '1.5rem',
          borderTop: '1px solid var(--color-border)',
          fontSize: '0.8rem',
          color: 'var(--color-text-muted)'
        }}
      >
        © {new Date().getFullYear()} NoteTracker · Built with ♥ using the MERN stack
      </footer>
    </div>
  );
}
