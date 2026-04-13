import { useState, useEffect } from 'react';
import RichTextEditor from './RichTextEditor';

const CATEGORIES = ['Funding', 'Pitching', 'Networking', 'Technology', 'Growth', 'Sustainability'];

const EMPTY = {
  title: '',
  content: '',
  cover_image: '',
  category: CATEGORIES[0],
  author: '',
  read_time: '',
  status: 'draft',
};

export default function BlogForm({
  initialData,
  onSubmit,
  saving,
  successMsg,
  errorMsg,
  submitLabel = 'Create Blog',
}) {
  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    if (initialData) {
      setForm({
        title: initialData.title || '',
        content: initialData.content || '',
        cover_image: initialData.cover_image || '',
        category: initialData.category || CATEGORIES[0],
        author: initialData.author || '',
        read_time: initialData.read_time || '',
        status: initialData.status || 'draft',
      });
    }
  }, [initialData]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit(form);
  }

  return (
    <form className="blog-form" onSubmit={handleSubmit}>
      <div className="form-card">
        <div className="form-grid">
          {/* Title */}
          <div className="form-group form-full">
            <label className="form-label">Title <span className="required">*</span></label>
            <input
              name="title"
              type="text"
              className="form-input"
              placeholder="e.g. The Future of Startup Funding"
              value={form.title}
              onChange={handleChange}
              required
            />
          </div>

          {/* Cover Image */}
          <div className="form-group form-full">
            <label className="form-label">Cover Image URL</label>
            <input
              name="cover_image"
              type="url"
              className="form-input"
              placeholder="https://..."
              value={form.cover_image}
              onChange={handleChange}
            />
            {form.cover_image && (
              <img
                src={form.cover_image}
                alt="Cover preview"
                className="cover-preview"
                onError={e => e.target.style.display = 'none'}
              />
            )}
          </div>

          {/* Author */}
          <div className="form-group">
            <label className="form-label">Author <span className="required">*</span></label>
            <input
              name="author"
              type="text"
              className="form-input"
              placeholder="e.g. Jane Smith"
              value={form.author}
              onChange={handleChange}
              required
            />
          </div>

          {/* Read Time */}
          <div className="form-group">
            <label className="form-label">Read Time</label>
            <input
              name="read_time"
              type="text"
              className="form-input"
              placeholder="e.g. 5 min"
              value={form.read_time}
              onChange={handleChange}
            />
          </div>

          {/* Category */}
          <div className="form-group">
            <label className="form-label">Category</label>
            <select
              name="category"
              className="form-select"
              value={form.category}
              onChange={handleChange}
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div className="form-group">
            <label className="form-label">Status</label>
            <div className="radio-group">
              {['draft', 'published'].map(s => (
                <label key={s} className={`radio-label ${form.status === s ? 'radio-active' : ''}`}>
                  <input
                    type="radio"
                    name="status"
                    value={s}
                    checked={form.status === s}
                    onChange={handleChange}
                  />
                  <span className={`radio-dot radio-dot-${s}`} />
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </label>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="form-group form-full">
            <label className="form-label">Content <span className="required">*</span></label>
            <RichTextEditor
              value={form.content}
              onChange={html => setForm(prev => ({ ...prev, content: html }))}
            />
          </div>
        </div>

        {/* Feedback */}
        {successMsg && (
          <div className="alert alert-success"><span>✓</span> {successMsg}</div>
        )}
        {errorMsg && (
          <div className="alert alert-error"><span>⚠</span> {errorMsg}</div>
        )}

        {/* Actions */}
        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? <><span className="spinner-sm" /> Saving…</> : submitLabel}
          </button>
        </div>
      </div>
    </form>
  );
}
