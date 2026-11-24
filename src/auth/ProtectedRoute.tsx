import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import type { UserRole } from '../types/common.types';
import { useAuth } from './AuthContext';

interface ProtectedRouteProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}

export function ProtectedRoute({ allowedRoles, children }: ProtectedRouteProps) {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user.approvalStatus !== 'Active') {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    const fallback = user.role === 'Employee' ? '/employee/dashboard' : '/manager/dashboard';
    return <Navigate to={fallback} replace />;
  }

  return <>{children}</>;
}
