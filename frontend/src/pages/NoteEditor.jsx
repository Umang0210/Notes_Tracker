import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, X, Plus, Upload, AlertCircle, ArrowLeft } from 'lucide-react';
import { apiRequest } from '../services/api';

const COLORS = ['#ffffff', '#fef3c7', '#dbeafe', '#dcfce7', '#fce7f3', '#ede9fe', '#ffedd5', '#f0fdf4'];
const PRIORITIES = ['low', 'medium', 'high'];

export default function NoteEditor() {
  const navigate = useNavigate();
  const { id } = useParams(); // present when editing
  const isEditing = Boolean(id);

  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    title: '',
    description: '',
    content: '',
    category: '',
    tags: [],
    color: '#ffffff',
    priority: 'medium',
    reminder: ''
  });
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditing);
  const [error, setError] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  // Load categories
  useEffect(() => {
    apiRequest('/categories').then((r) => setCategories(r.data.categories)).catch(() => {});
  }, []);

  // Load existing note when editing
  useEffect(() => {
    if (!isEditing) return;
    setFetching(true);
    apiRequest(`/notes/${id}`)
      .then((r) => {
        const n = r.data.note;
        setForm({
          title: n.title || '',
          description: n.description || '',
          content: n.content || '',
          category: n.category?._id || '',
          tags: n.tags || [],
          color: n.color || '#ffffff',
          priority: n.priority || 'medium',
          reminder: n.reminder ? n.reminder.slice(0, 16) : ''
        });
      })
      .catch((err) => setError(err.message))
      .finally(() => setFetching(false));
  }, [id, isEditing]);

  const handleChange = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !form.tags.includes(tag)) {
      setForm((prev) => ({ ...prev, tags: [...prev.tags, tag] }));
    }
    setTagInput('');
  };

  const removeTag = (tag) => {
    setForm((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tag) }));
  };

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await apiRequest('/uploads/image', { method: 'POST', body: formData });
      // Insert image markdown into content
      const imageMarkdown = `\n![Image](${res.data.url})\n`;
      handleChange('content', form.content + imageMarkdown);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.title.trim()) {
      setError('Note title is required.');
      return;
    }

    const payload = {
      ...form,
      category: form.category || null,
      reminder: form.reminder || null
    };

    setLoading(true);
    try {
      if (isEditing) {
        await apiRequest(`/notes/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
      } else {
        await apiRequest('/notes', { method: 'POST', body: JSON.stringify(payload) });
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <p style={{ color: 'var(--color-text-muted)' }}>Loading note...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '820px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <button
          onClick={() => navigate('/dashboard')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', display: 'flex' }}
        >
          <ArrowLeft size={20} />
        </button>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
          {isEditing ? 'Edit Note' : 'New Note'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '0.5rem', padding: '0.75rem', color: 'var(--color-danger)', fontSize: '0.875rem' }}>
            <AlertCircle size={15} /> {error}
          </div>
        )}

        {/* Title */}
        <div>
          <label className="label" htmlFor="title">Title *</label>
          <input id="title" className="input" type="text" value={form.title} onChange={(e) => handleChange('title', e.target.value)} placeholder="Note title" />
        </div>

        {/* Description */}
        <div>
          <label className="label" htmlFor="desc">Short Description</label>
          <input id="desc" className="input" type="text" value={form.description} onChange={(e) => handleChange('description', e.target.value)} placeholder="One-line summary..." maxLength={500} />
        </div>

        {/* Content */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.375rem' }}>
            <label className="label" style={{ marginBottom: 0 }}>Content</label>
            <label htmlFor="imageUpload" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', color: 'var(--color-accent)', fontWeight: 500 }}>
              <Upload size={13} />
              {uploadingImage ? 'Uploading...' : 'Upload Image'}
              <input id="imageUpload" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
            </label>
          </div>
          <textarea
            className="input"
            value={form.content}
            onChange={(e) => handleChange('content', e.target.value)}
            placeholder="Write your note here..."
            rows={10}
            style={{ resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6 }}
          />
        </div>

        {/* Row: Category + Priority */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label className="label" htmlFor="category">Category</label>
            <select id="category" className="input" value={form.category} onChange={(e) => handleChange('category', e.target.value)}>
              <option value="">No Category</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Priority</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {PRIORITIES.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => handleChange('priority', p)}
                  style={{
                    flex: 1,
                    padding: '0.5rem',
                    borderRadius: '0.5rem',
                    border: `1px solid ${form.priority === p ? 'var(--color-accent)' : 'var(--color-border)'}`,
                    backgroundColor: form.priority === p ? 'var(--color-accent)' : 'var(--color-surface)',
                    color: form.priority === p ? '#fff' : 'var(--color-text-muted)',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    textTransform: 'capitalize'
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Row: Colour picker + Reminder */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label className="label">Note Colour</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => handleChange('color', c)}
                  style={{
                    width: '1.75rem',
                    height: '1.75rem',
                    borderRadius: '50%',
                    backgroundColor: c,
                    border: form.color === c ? '3px solid var(--color-accent)' : '2px solid var(--color-border)',
                    cursor: 'pointer'
                  }}
                />
              ))}
            </div>
          </div>
          <div>
            <label className="label" htmlFor="reminder">Reminder</label>
            <input
              id="reminder"
              className="input"
              type="datetime-local"
              value={form.reminder}
              onChange={(e) => handleChange('reminder', e.target.value)}
            />
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="label">Tags</label>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
            {form.tags.map((tag) => (
              <span
                key={tag}
                className="badge"
                style={{ backgroundColor: 'var(--color-surface-2)', color: 'var(--color-text)', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--color-text-muted)', display: 'flex' }}
                >
                  <X size={11} />
                </button>
              </span>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              className="input"
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              placeholder="Add a tag and press Enter"
            />
            <button type="button" className="btn-ghost" onClick={addTag} style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <Plus size={14} /> Add
            </button>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', paddingTop: '0.25rem' }}>
          <button type="button" className="btn-ghost" onClick={() => navigate('/dashboard')}>
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}
          >
            <Save size={14} />
            {loading ? 'Saving...' : isEditing ? 'Update Note' : 'Save Note'}
          </button>
        </div>
      </form>
    </div>
  );
}
