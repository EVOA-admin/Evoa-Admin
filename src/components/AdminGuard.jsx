import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ADMIN_EMAIL = 'admin@evoa.co.in';

export default function AdminGuard({ children }) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#f8f9fa' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (!user || (profile?.role !== 'admin' && user.email !== ADMIN_EMAIL)) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
