import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';

import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import Charging from './pages/Charging';
import History from './pages/History';

import Stations from './pages/admin/Stations';
import ActiveSessions from './pages/admin/ActiveSessions';
import Stats from './pages/admin/Stats';

function PrivateRoute({ children, adminOnly }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/" replace />;
  if (!adminOnly && user.role === 'admin') return <Navigate to="/admin/stations" replace />;
  return children;
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
        <Route path="/charging/:sessionId" element={<PrivateRoute><Charging /></PrivateRoute>} />
        <Route path="/history" element={<PrivateRoute><History /></PrivateRoute>} />

        <Route path="/admin/stations" element={<PrivateRoute adminOnly><Stations /></PrivateRoute>} />
        <Route path="/admin/active" element={<PrivateRoute adminOnly><ActiveSessions /></PrivateRoute>} />
        <Route path="/admin/stats" element={<PrivateRoute adminOnly><Stats /></PrivateRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
