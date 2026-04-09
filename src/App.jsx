import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import AdminGuard from './components/AdminGuard';
import AdminLayout from './components/AdminLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import BlogList from './pages/BlogList';
import BlogCreate from './pages/BlogCreate';
import BlogEdit from './pages/BlogEdit';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />

          {/* Protected admin routes */}
          <Route
            element={
              <AdminGuard>
                <AdminLayout />
              </AdminGuard>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/blogs" element={<BlogList />} />
            <Route path="/blogs/create" element={<BlogCreate />} />
            <Route path="/blogs/edit/:id" element={<BlogEdit />} />
          </Route>

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
