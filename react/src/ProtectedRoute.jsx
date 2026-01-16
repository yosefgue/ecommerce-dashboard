import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { isAuthenticated } from './auth.js';

export default function ProtectedRoute() {
  const authed = isAuthenticated();
  return authed ? <Outlet /> : <Navigate to="/login" replace />;
}
