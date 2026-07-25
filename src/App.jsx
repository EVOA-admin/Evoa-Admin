import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import AdminGuard from './components/AdminGuard';
import AdminLayout from './components/AdminLayout';
import ErrorBoundary from './components/ErrorBoundary';
import Login from './pages/Login';

/* Lazy-load heavy pages so a single broken module can't kill the whole app */
const Dashboard  = lazy(() => import('./pages/Dashboard'));
const Users = lazy(() => import('./pages/Users'));
const Startups = lazy(() => import('./pages/Startups'));
const Investors = lazy(() => import('./pages/Investors'));
const Battleground = lazy(() => import('./pages/Battleground'));
const Payments = lazy(() => import('./pages/Payments'));
const BlogList   = lazy(() => import('./pages/BlogList'));
const BlogCreate = lazy(() => import('./pages/BlogCreate'));
const BlogEdit   = lazy(() => import('./pages/BlogEdit'));
const EventList   = lazy(() => import('./pages/EventList'));
const EventCreate = lazy(() => import('./pages/EventCreate'));
const EventEdit   = lazy(() => import('./pages/EventEdit'));

function PageLoader() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <span style={{ width: 36, height: 36, border: '3px solid #e8eaed', borderTopColor: '#4f46e5', borderRadius: '50%', animation: 'spin .7s linear infinite', display: 'inline-block' }} />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
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
              <Route path="/dashboard" element={<Suspense fallback={<PageLoader />}><ErrorBoundary><Dashboard /></ErrorBoundary></Suspense>} />
              <Route path="/users" element={<Suspense fallback={<PageLoader />}><ErrorBoundary><Users /></ErrorBoundary></Suspense>} />
              <Route path="/startups" element={<Suspense fallback={<PageLoader />}><ErrorBoundary><Startups /></ErrorBoundary></Suspense>} />
              <Route path="/investors" element={<Suspense fallback={<PageLoader />}><ErrorBoundary><Investors /></ErrorBoundary></Suspense>} />
              <Route path="/battleground" element={<Suspense fallback={<PageLoader />}><ErrorBoundary><Battleground /></ErrorBoundary></Suspense>} />
              <Route path="/payments" element={<Suspense fallback={<PageLoader />}><ErrorBoundary><Payments /></ErrorBoundary></Suspense>} />
              <Route path="/blogs" element={<Suspense fallback={<PageLoader />}><ErrorBoundary><BlogList /></ErrorBoundary></Suspense>} />
              <Route path="/blogs/create" element={<Suspense fallback={<PageLoader />}><ErrorBoundary><BlogCreate /></ErrorBoundary></Suspense>} />
              <Route path="/blogs/edit/:id" element={<Suspense fallback={<PageLoader />}><ErrorBoundary><BlogEdit /></ErrorBoundary></Suspense>} />
              <Route path="/events" element={<Suspense fallback={<PageLoader />}><ErrorBoundary><EventList /></ErrorBoundary></Suspense>} />
              <Route path="/events/create" element={<Suspense fallback={<PageLoader />}><ErrorBoundary><EventCreate /></ErrorBoundary></Suspense>} />
              <Route path="/events/edit/:id" element={<Suspense fallback={<PageLoader />}><ErrorBoundary><EventEdit /></ErrorBoundary></Suspense>} />
            </Route>

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}
