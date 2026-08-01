import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function AdminGuard({ children }) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#f8f9fa' }}>
        <div className="spinner" />
      </div>
    );
  }

  const token = localStorage.getItem('authToken');

  if (!user && !profile && !token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
