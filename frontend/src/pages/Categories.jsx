import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Tag, AlertCircle, Check, X } from 'lucide-react';
import { apiRequest } from '../services/api';

const PRESET_COLORS = ['#6366f1', '#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#ec4899', '#14b8a6', '#8b5cf6'];

function CategoryRow({ category, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(category.name);
  const [color, setColor] = useState(category.color);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    setError('');
    try {
      const res = await apiRequest(`/categories/${category._id}`, {
        method: 'PUT',
        body: JSON.stringify({ name, color })
      });
      onUpdate(res.data.category);
      setEditing(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setName(category.name);
    setColor(category.color);
    setEditing(false);
    setError('');
  };

  return (
    <div
      className="card"
      style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}
    >
      {/* Color dot */}
      <div
        style={{
          width: '0.875rem',
          height: '0.875rem',
          borderRadius: '50%',
          backgroundColor: color,
          flexShrink: 0
        }}
      />

      {editing ? (
        <>
          <input
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ flex: 1, minWidth: '140px' }}
            autoFocus
          />
          <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                style={{
                  width: '1.25rem',
                  height: '1.25rem',
                  borderRadius: '50%',
                  backgroundColor: c,
                  border: color === c ? '2px solid var(--color-text)' : '2px solid transparent',
                  cursor: 'pointer'
                }}
              />
            ))}
          </div>
          {error && <span style={{ fontSize: '0.75rem', color: 'var(--color-danger)' }}>{error}</span>}
          <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto' }}>
            <button onClick={handleSave} disabled={saving} className="btn-primary" style={{ padding: '0.375rem 0.75rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Check size={13} /> {saving ? 'Saving...' : 'Save'}
            </button>
            <button onClick={handleCancel} className="btn-ghost" style={{ padding: '0.375rem 0.75rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <X size={13} /> Cancel
            </button>
          </div>
        </>
      ) : (
        <>
          <span style={{ flex: 1, fontWeight: 500, fontSize: '0.9rem' }}>{category.name}</span>
          <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto' }}>
            <button onClick={() => setEditing(true)} className="btn-ghost" style={{ padding: '0.375rem 0.75rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Edit2 size={13} /> Edit
            </button>
            <button onClick={() => onDelete(category._id)} className="btn-ghost" style={{ padding: '0.375rem 0.75rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--color-danger)', borderColor: 'rgba(239,68,68,0.3)' }}>
              <Trash2 size={13} /> Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState('#6366f1');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const fetchCategories = async () => {
    try {
      const res = await apiRequest('/categories');
      setCategories(res.data.categories);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setError('');
    setCreating(true);
    try {
      const res = await apiRequest('/categories', {
        method: 'POST',
        body: JSON.stringify({ name: newName.trim(), color: newColor })
      });
      setCategories((prev) => [...prev, res.data.category]);
      setNewName('');
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleUpdate = (updated) => {
    setCategories((prev) => prev.map((c) => (c._id === updated._id ? updated : c)));
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category? Notes using it will become uncategorized.')) return;
    try {
      await apiRequest(`/categories/${id}`, { method: 'DELETE' });
      setCategories((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <h1 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Categories</h1>

      {/* Create new category */}
      <div className="card">
        <h2 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '1rem' }}>Create Category</h2>
        <form onSubmit={handleCreate} style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'flex-end' }}>
          <div style={{ flex: 1, minWidth: '160px' }}>
            <label className="label" htmlFor="newName">Name</label>
            <input
              id="newName"
              className="input"
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Work, Personal"
            />
          </div>
          <div>
            <label className="label">Colour</label>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setNewColor(c)}
                  style={{
                    width: '1.5rem',
                    height: '1.5rem',
                    borderRadius: '50%',
                    backgroundColor: c,
                    border: newColor === c ? '2px solid var(--color-text)' : '2px solid transparent',
                    cursor: 'pointer'
                  }}
                />
              ))}
            </div>
          </div>
          <button
            type="submit"
            className="btn-primary"
            disabled={creating || !newName.trim()}
            style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', alignSelf: 'flex-end' }}
          >
            <Plus size={14} /> {creating ? 'Creating...' : 'Create'}
          </button>
        </form>
        {error && (
          <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-danger)', fontSize: '0.875rem' }}>
            <AlertCircle size={14} /> {error}
          </div>
        )}
      </div>

      {/* Category list */}
      {loading ? (
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Loading categories...</p>
      ) : categories.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
          <Tag size={32} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
          <p>No categories yet. Create one above.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {categories.map((cat) => (
            <CategoryRow key={cat._id} category={cat} onUpdate={handleUpdate} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
