import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { RiAddLine, RiEditLine, RiDeleteBinLine, RiEyeLine, RiEyeOffLine } from 'react-icons/ri';
import { getAllBlogs, deleteBlog, toggleBlogStatus } from '../services/blogService';
import DeleteModal from '../components/DeleteModal';

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  });
}

export default function BlogList() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toastMsg, setToastMsg] = useState('');
  const [toastType, setToastType] = useState('success');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  useEffect(() => { loadBlogs(); }, []);

  async function loadBlogs() {
    try {
      setLoading(true);
      const data = await getAllBlogs();
      setBlogs(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function showToast(msg, type = 'success') {
    setToastMsg(msg);
    setToastType(type);
    setTimeout(() => setToastMsg(''), 3500);
  }

  async function handleToggle(blog) {
    setTogglingId(blog.id);
    try {
      const updated = await toggleBlogStatus(blog.id, blog.status);
      setBlogs(prev => prev.map(b => b.id === blog.id ? updated : b));
      showToast(`Blog ${updated.status === 'published' ? 'published' : 'moved to draft'}.`);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setTogglingId(null);
    }
  }

  async function handleDelete() {
    try {
      await deleteBlog(deleteTarget.id);
      setBlogs(prev => prev.filter(b => b.id !== deleteTarget.id));
      showToast('Blog deleted.');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setDeleteTarget(null);
    }
  }

  return (
    <div className="page">
      {toastMsg && (
        <div className={`toast toast-${toastType}`}>
          {toastType === 'success' ? '✓' : '⚠'} {toastMsg}
        </div>
      )}

      <div className="page-header">
        <div>
          <h1 className="page-title">Blogs</h1>
          <p className="page-subtitle">Manage all blog posts</p>
        </div>
        <Link to="/blogs/create" className="btn btn-primary">
          <RiAddLine /> <span className="btn-label">New Blog</span>
        </Link>
      </div>

      {error && <div className="alert alert-error"><span>⚠</span> {error}</div>}

      {loading ? (
        <div className="table-skeleton">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton skeleton-row" />
          ))}
        </div>
      ) : blogs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📝</div>
          <h3>No blogs yet</h3>
          <p>Create your first blog post to get started.</p>
          <Link to="/blogs/create" className="btn btn-primary">Create Blog</Link>
        </div>
      ) : (
        <>
          {/* ── DESKTOP TABLE ── */}
          <div className="table-wrap desktop-only">
            <table className="table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {blogs.map(blog => (
                  <tr key={blog.id}>
                    <td>
                      <div className="blog-title-cell">{blog.title}</div>
                      <div className="blog-author-cell">{blog.author}</div>
                    </td>
                    <td><span className="category-badge">{blog.category || '—'}</span></td>
                    <td>
                      <span className={`status-badge status-${blog.status}`}>
                        {blog.status}
                      </span>
                    </td>
                    <td className="date-cell">{formatDate(blog.created_at)}</td>
                    <td>
                      <div className="action-btns">
                        <Link to={`/blogs/edit/${blog.id}`} className="action-btn action-edit" title="Edit">
                          <RiEditLine />
                        </Link>
                        <button
                          className={`action-btn ${blog.status === 'published' ? 'action-unpublish' : 'action-publish'}`}
                          onClick={() => handleToggle(blog)}
                          disabled={togglingId === blog.id}
                          title={blog.status === 'published' ? 'Unpublish' : 'Publish'}
                        >
                          {blog.status === 'published' ? <RiEyeOffLine /> : <RiEyeLine />}
                        </button>
                        <button
                          className="action-btn action-delete"
                          onClick={() => setDeleteTarget(blog)}
                          title="Delete"
                        >
                          <RiDeleteBinLine />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── MOBILE CARDS ── */}
          <div className="blog-cards mobile-only">
            {blogs.map(blog => (
              <div key={blog.id} className="blog-card-mobile">
                <div className="bcm-header">
                  <div className="bcm-meta">
                    <span className={`status-badge status-${blog.status}`}>{blog.status}</span>
                    {blog.category && <span className="category-badge">{blog.category}</span>}
                  </div>
                  <div className="bcm-date">{formatDate(blog.created_at)}</div>
                </div>

                <h3 className="bcm-title">{blog.title}</h3>
                {blog.author && <p className="bcm-author">by {blog.author} · {blog.read_time}</p>}

                <div className="bcm-actions">
                  <Link to={`/blogs/edit/${blog.id}`} className="bcm-btn bcm-edit">
                    <RiEditLine /> Edit
                  </Link>
                  <button
                    className={`bcm-btn ${blog.status === 'published' ? 'bcm-unpublish' : 'bcm-publish'}`}
                    onClick={() => handleToggle(blog)}
                    disabled={togglingId === blog.id}
                  >
                    {blog.status === 'published'
                      ? <><RiEyeOffLine /> Unpublish</>
                      : <><RiEyeLine /> Publish</>
                    }
                  </button>
                  <button
                    className="bcm-btn bcm-delete"
                    onClick={() => setDeleteTarget(blog)}
                  >
                    <RiDeleteBinLine /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {deleteTarget && (
        <DeleteModal
          title={deleteTarget.title}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
