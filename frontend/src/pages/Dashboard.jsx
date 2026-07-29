import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  StickyNote, Archive, Star, Pin, Trash2, LayoutGrid,
  Plus, Search, Filter, AlertCircle, Edit2, RotateCcw
} from 'lucide-react';
import { apiRequest } from '../services/api';

const PRIORITY_COLORS = { high: '#ef4444', medium: '#f59e0b', low: '#22c55e' };
const STATUS_LABELS = { active: 'Active', archived: 'Archived', trash: 'Trash' };

// Small reusable stat card
function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div
      className="card"
      style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}
    >
      <div
        style={{
          width: '2.75rem',
          height: '2.75rem',
          borderRadius: '0.625rem',
          backgroundColor: `${color}20`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}
      >
        <Icon size={18} color={color} />
      </div>
      <div>
        <p style={{ fontSize: '1.5rem', fontWeight: 700, lineHeight: 1 }}>{value}</p>
        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>{label}</p>
      </div>
    </div>
  );
}

// Single note card with action buttons
function NoteCard({ note, onTogglePin, onToggleArchive, onToggleFavourite, onDelete, onRestore }) {
  const navigate = useNavigate();
  const isTrash = note.status === 'trash';

  return (
    <div
      className="card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        borderLeft: `3px solid ${note.color || 'var(--color-border)'}`,
        position: 'relative',
        cursor: isTrash ? 'default' : 'pointer'
      }}
      onClick={() => !isTrash && navigate(`/notes/${note._id}/edit`)}
    >
      {/* Priority badge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span
          className="badge"
          style={{
            backgroundColor: `${PRIORITY_COLORS[note.priority]}20`,
            color: PRIORITY_COLORS[note.priority]
          }}
        >
          {note.priority}
        </span>
        <div style={{ display: 'flex', gap: '0.25rem' }} onClick={(e) => e.stopPropagation()}>
          {isTrash ? (
            <>
              <ActionBtn icon={RotateCcw} title="Restore" onClick={() => onRestore(note._id)} color="var(--color-success)" />
              <ActionBtn icon={Trash2} title="Delete permanently" onClick={() => onDelete(note._id)} color="var(--color-danger)" />
            </>
          ) : (
            <>
              <ActionBtn icon={Pin} title={note.pinned ? 'Unpin' : 'Pin'} onClick={() => onTogglePin(note._id)} color={note.pinned ? 'var(--color-accent)' : undefined} />
              <ActionBtn icon={Star} title={note.favourite ? 'Unfavourite' : 'Favourite'} onClick={() => onToggleFavourite(note._id)} color={note.favourite ? '#f59e0b' : undefined} />
              <ActionBtn icon={Archive} title={note.archived ? 'Restore' : 'Archive'} onClick={() => onToggleArchive(note._id)} color={note.archived ? 'var(--color-accent)' : undefined} />
              <ActionBtn icon={Edit2} title="Edit" onClick={() => navigate(`/notes/${note._id}/edit`)} />
              <ActionBtn icon={Trash2} title="Delete" onClick={() => onDelete(note._id)} color="var(--color-danger)" />
            </>
          )}
        </div>
      </div>

      {/* Title */}
      <h3
        style={{
          fontWeight: 600,
          fontSize: '0.925rem',
          color: 'var(--color-text)',
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 1,
          WebkitBoxOrient: 'vertical'
        }}
      >
        {note.title}
      </h3>

      {/* Description */}
      {note.description && (
        <p
          style={{
            fontSize: '0.8rem',
            color: 'var(--color-text-muted)',
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            lineHeight: 1.5
          }}
        >
          {note.description}
        </p>
      )}

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
        {note.category && (
          <span
            className="badge"
            style={{
              backgroundColor: `${note.category.color}25`,
              color: note.category.color
            }}
          >
            {note.category.name}
          </span>
        )}
        <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginLeft: 'auto' }}>
          {new Date(note.updatedAt).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
}

function ActionBtn({ icon: Icon, title, onClick, color }) {
  return (
    <button
      title={title}
      onClick={onClick}
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '0.3rem',
        borderRadius: '0.375rem',
        color: color || 'var(--color-text-muted)',
        display: 'flex',
        transition: 'background 0.1s ease'
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-surface-2)')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
    >
      <Icon size={14} />
    </button>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [notes, setNotes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterStatus, setFilterStatus] = useState('active');
  const [sortBy, setSortBy] = useState('createdAt');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await apiRequest('/dashboard');
      setStats(res.data.stats);
    } catch {
      // non-critical
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await apiRequest('/categories');
      setCategories(res.data.categories);
    } catch {
      // non-critical
    }
  }, []);

  const fetchNotes = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        page,
        limit: 12,
        sortBy,
        sortOrder: 'desc',
        status: filterStatus || 'active'
      });
      if (search) params.set('search', search);
      if (filterCategory) params.set('category', filterCategory);
      if (filterPriority) params.set('priority', filterPriority);

      const res = await apiRequest(`/notes?${params}`);
      setNotes(res.data.notes);
      setPagination(res.data.pagination);
    } catch (err) {
      setError(err.message);
    }
  }, [page, search, sortBy, filterCategory, filterPriority, filterStatus]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([fetchDashboard(), fetchCategories(), fetchNotes()]);
      setLoading(false);
    };
    load();
  }, [fetchDashboard, fetchCategories, fetchNotes]);

  // Refresh notes after toggling
  const refreshNotes = () => {
    fetchNotes();
    fetchDashboard();
  };

  const handleTogglePin = async (id) => {
    await apiRequest(`/notes/${id}/pin`, { method: 'PUT' });
    refreshNotes();
  };

  const handleToggleArchive = async (id) => {
    await apiRequest(`/notes/${id}/archive`, { method: 'PUT' });
    refreshNotes();
  };

  const handleToggleFavourite = async (id) => {
    await apiRequest(`/notes/${id}/favourite`, { method: 'PUT' });
    refreshNotes();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Move this note to trash?')) return;
    await apiRequest(`/notes/${id}`, { method: 'DELETE' });
    refreshNotes();
  };

  const handleRestore = async (id) => {
    await apiRequest(`/notes/${id}/restore`, { method: 'PUT' });
    refreshNotes();
  };

  // Reset page when filters change
  useEffect(() => setPage(1), [search, filterCategory, filterPriority, filterStatus]);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Stats */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
          <StatCard icon={StickyNote} label="Total Notes" value={stats.totalNotes} color="var(--color-accent)" />
          <StatCard icon={Pin} label="Pinned" value={stats.pinnedNotes} color="#6366f1" />
          <StatCard icon={Star} label="Favourites" value={stats.favouriteNotes} color="#f59e0b" />
          <StatCard icon={Archive} label="Archived" value={stats.archivedNotes} color="#64748b" />
          <StatCard icon={Trash2} label="Trash" value={stats.trashNotes} color="var(--color-danger)" />
        </div>
      )}

      {/* Search + Filters */}
      <div className="card" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1', minWidth: '180px' }}>
          <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
          <input
            className="input"
            type="text"
            placeholder="Search notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '2.25rem' }}
          />
        </div>

        <select className="input" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ width: 'auto' }}>
          <option value="active">Active</option>
          <option value="archived">Archived</option>
          <option value="trash">Trash</option>
          <option value="">All</option>
        </select>

        <select className="input" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} style={{ width: 'auto' }}>
          <option value="">All Categories</option>
          <option value="null">Uncategorized</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>

        <select className="input" value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} style={{ width: 'auto' }}>
          <option value="">All Priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        <select className="input" value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ width: 'auto' }}>
          <option value="createdAt">Newest First</option>
          <option value="updatedAt">Recently Updated</option>
          <option value="title">Title A-Z</option>
          <option value="priority">Priority</option>
        </select>

        <button className="btn-primary" onClick={() => navigate('/notes/new')} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexShrink: 0 }}>
          <Plus size={14} /> New Note
        </button>
      </div>

      {/* Error */}
      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-danger)', fontSize: '0.875rem' }}>
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* Notes Grid */}
      {notes.length === 0 ? (
        <div
          className="card"
          style={{ textAlign: 'center', padding: '4rem 1.5rem', color: 'var(--color-text-muted)' }}
        >
          <LayoutGrid size={36} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
          <p style={{ fontWeight: 500 }}>No notes found</p>
          <p style={{ fontSize: '0.875rem', marginTop: '0.375rem' }}>
            {filterStatus === 'active' ? 'Create your first note to get started.' : `No ${STATUS_LABELS[filterStatus]?.toLowerCase()} notes.`}
          </p>
          {filterStatus === 'active' && (
            <button className="btn-primary" onClick={() => navigate('/notes/new')} style={{ marginTop: '1.25rem' }}>
              Create Note
            </button>
          )}
        </div>
      ) : (
        <>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '1rem'
            }}
          >
            {notes.map((note) => (
              <NoteCard
                key={note._id}
                note={note}
                onTogglePin={handleTogglePin}
                onToggleArchive={handleToggleArchive}
                onToggleFavourite={handleToggleFavourite}
                onDelete={handleDelete}
                onRestore={handleRestore}
              />
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button
                className="btn-ghost"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </button>
              <span style={{ display: 'flex', alignItems: 'center', fontSize: '0.875rem', color: 'var(--color-text-muted)', padding: '0 0.5rem' }}>
                Page {page} of {pagination.pages}
              </span>
              <button
                className="btn-ghost"
                onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                disabled={page === pagination.pages}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
