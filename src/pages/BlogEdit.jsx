import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getBlogById, updateBlog } from '../services/blogService';
import BlogForm from '../components/BlogForm';

export default function BlogEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [initialData, setInitialData] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    async function fetch() {
      try {
        const blog = await getBlogById(id);
        setInitialData(blog);
      } catch (err) {
        setLoadError(err.message);
      }
    }
    fetch();
  }, [id]);

  async function handleSubmit(formData) {
    setSaving(true);
    setErrorMsg('');
    try {
      await updateBlog(id, formData);
      setSuccessMsg('Blog updated successfully!');
      setTimeout(() => navigate('/blogs'), 1200);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Edit Blog</h1>
          <p className="page-subtitle">Update blog post details</p>
        </div>
      </div>

      {loadError && <div className="alert alert-error"><span>⚠</span> {loadError}</div>}

      {!initialData && !loadError && (
        <div className="form-skeleton">
          {[...Array(6)].map((_, i) => <div key={i} className="skeleton skeleton-field" />)}
        </div>
      )}

      {initialData && (
        <BlogForm
          initialData={initialData}
          onSubmit={handleSubmit}
          saving={saving}
          successMsg={successMsg}
          errorMsg={errorMsg}
          submitLabel="Update Blog"
        />
      )}
    </div>
  );
}
