import { createBrowserRouter, Navigate } from 'react-router-dom';
import { PublicLayout } from '../layouts/PublicLayout';
import { AppLayout } from '../layouts/AppLayout';
import { ProtectedRoute } from '../components/ProtectedRoute';

// Public pages
import { Landing } from '../pages/Landing';
import { Login } from '../pages/Login';
import { Register } from '../pages/Register';
import { PublicBatch } from '../pages/PublicBatch';

// App pages
import { Dashboard } from '../pages/Dashboard';
import { Profile } from '../pages/Profile';
import { Identify } from '../pages/Identify';
import { Batches } from '../pages/Batches';
import { BatchDetails } from '../pages/BatchDetails';
import { Incoming } from '../pages/Incoming';
import { History } from '../pages/History';
import { VerifyBatch } from '../pages/VerifyBatch';

// Expert pages
import {
  ExpertDashboard,
  ExpertReviews,
  ReviewDetails,
  ExpertHistory,
  ExpertMaterials,
} from '../pages/expert/ExpertPages';

// Admin pages
import {
  AdminDashboard,
  AdminUsers,
  AdminMaterials,
  AdminPredictions,
  AdminBatches,
  AdminReviews,
  AdminAnalytics,
} from '../pages/admin/AdminPages';

export const router = createBrowserRouter([
  // Public Routes
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      { path: '', element: <Landing /> },
      { path: 'auth/login', element: <Login /> },
      { path: 'auth/register', element: <Register /> },
      { path: 'public/batch/:batchId', element: <PublicBatch /> },
    ],
  },
  
  // Authenticated App Routes
  {
    path: '/app',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: '', element: <Navigate to="/app/dashboard" replace /> },
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'profile', element: <Profile /> },
      { path: 'identify', element: <Identify /> },
      { path: 'batches', element: <Batches /> },
      { path: 'batches/:batchId', element: <BatchDetails /> },
      { path: 'incoming', element: <Incoming /> },
      { path: 'history', element: <History /> },
      { path: 'verify/:batchId', element: <VerifyBatch /> },
    ],
  },

  // Expert Routes
  {
    path: '/expert',
    element: (
      <ProtectedRoute allowedRoles={['EXPERT', 'ADMIN']}>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: '', element: <Navigate to="/expert/dashboard" replace /> },
      { path: 'dashboard', element: <ExpertDashboard /> },
      { path: 'reviews', element: <ExpertReviews /> },
      { path: 'reviews/:reviewId', element: <ReviewDetails /> },
      { path: 'history', element: <ExpertHistory /> },
      { path: 'materials', element: <ExpertMaterials /> },
    ],
  },

  // Admin Routes
  {
    path: '/admin',
    element: (
      <ProtectedRoute allowedRoles={['ADMIN']}>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: '', element: <Navigate to="/admin/dashboard" replace /> },
      { path: 'dashboard', element: <AdminDashboard /> },
      { path: 'users', element: <AdminUsers /> },
      { path: 'materials', element: <AdminMaterials /> },
      { path: 'predictions', element: <AdminPredictions /> },
      { path: 'batches', element: <AdminBatches /> },
      { path: 'reviews', element: <AdminReviews /> },
      { path: 'analytics', element: <AdminAnalytics /> },
    ],
  },

  // Fallback redirect
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
