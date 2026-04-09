import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createBlog } from '../services/blogService';
import BlogForm from '../components/BlogForm';

export default function BlogCreate() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(formData) {
    setSaving(true);
    setErrorMsg('');
    try {
      await createBlog(formData);
      setSuccessMsg('Blog created successfully!');
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
          <h1 className="page-title">Create Blog</h1>
          <p className="page-subtitle">Write and publish a new blog post</p>
        </div>
      </div>
      <BlogForm
        onSubmit={handleSubmit}
        saving={saving}
        successMsg={successMsg}
        errorMsg={errorMsg}
      />
    </div>
  );
}
