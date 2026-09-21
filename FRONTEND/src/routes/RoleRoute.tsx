import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types/auth';
import { AccessDeniedPage } from '../components/common/AccessDeniedPage';

interface RoleRouteProps {
  allowedRoles: UserRole[];
}

export const RoleRoute: React.FC<RoleRouteProps> = ({ allowedRoles }) => {
  const { role, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // 401 Unauthenticated Condition -> Redirect to Login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 403 Forbidden Condition -> Render AWS-Style Access Denied Page (Session Preserved)
  if (role && !allowedRoles.includes(role)) {
    return <AccessDeniedPage />;
  }

  return <Outlet />;
};
