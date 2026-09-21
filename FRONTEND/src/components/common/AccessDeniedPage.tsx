import React from 'react';
import { ShieldAlert, ArrowLeft, LayoutDashboard, Lock, UserCheck, Shield } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from './Button';
import { Badge } from './Badge';

export interface FeatureMeta {
  featureName: string;
  requiredRole: string;
  requiredPermission: string;
  reason: string;
}

export function getFeatureMetadata(pathname: string, currentRole: string): FeatureMeta {
  if (pathname.includes('/admin/managers')) {
    return {
      featureName: 'Manager User Administration',
      requiredRole: 'ADMIN',
      requiredPermission: 'MANAGER_MANAGEMENT',
      reason: 'Only System Administrators can create, update, or manage manager accounts.',
    };
  }
  if (pathname.includes('/admin/users')) {
    return {
      featureName: 'System User Directory',
      requiredRole: 'ADMIN',
      requiredPermission: 'USER_MANAGEMENT',
      reason: 'Access to system-wide user credentials and role assignments is restricted to ADMIN.',
    };
  }
  if (pathname.includes('/admin/roles') || pathname.includes('/admin/access-control')) {
    return {
      featureName: 'Role-Based Access Control Matrix',
      requiredRole: 'ADMIN',
      requiredPermission: 'ACCESS_CONTROL_WRITE',
      reason: 'Modifying RBAC permissions and security policies requires administrative privileges.',
    };
  }
  if (pathname.includes('/admin/audit-logs')) {
    return {
      featureName: 'Security Audit Logs',
      requiredRole: 'ADMIN',
      requiredPermission: 'AUDIT_LOG_VIEW',
      reason: 'Viewing system audit trails and security event logs is restricted to ADMIN.',
    };
  }
  if (pathname.includes('/admin/reports')) {
    return {
      featureName: 'System Analytics & Export Reports',
      requiredRole: 'ADMIN',
      requiredPermission: 'REPORTS_EXPORT',
      reason: 'Generating and exporting executive system analytics reports requires ADMIN access.',
    };
  }
  if (pathname.includes('/admin/settings')) {
    return {
      featureName: 'System Settings & Config',
      requiredRole: 'ADMIN',
      requiredPermission: 'SYSTEM_SETTINGS_WRITE',
      reason: 'Configuring system-wide application settings is restricted to ADMIN.',
    };
  }
  if (pathname.includes('/admin')) {
    return {
      featureName: 'Administration Control Center',
      requiredRole: 'ADMIN',
      requiredPermission: 'ADMIN_ACCESS',
      reason: 'This section is strictly reserved for full system administrators.',
    };
  }
  if (
    pathname.includes('/dashboard') ||
    pathname.includes('/products') ||
    pathname.includes('/warehouses') ||
    pathname.includes('/inventory') ||
    pathname.includes('/low-stock') ||
    pathname.includes('/reconciliation') ||
    pathname.includes('/transactions') ||
    pathname.includes('/orders')
  ) {
    return {
      featureName: 'Operational Management Portal',
      requiredRole: 'MANAGER or ADMIN',
      requiredPermission: 'INVENTORY_OPERATIONS',
      reason: 'Customer accounts cannot access backend inventory operations or fulfillment ledgers.',
    };
  }

  return {
    featureName: 'Protected Application Feature',
    requiredRole: 'ADMIN',
    requiredPermission: 'AUTHORIZED_ACCESS',
    reason: `Your current role (${currentRole}) does not have permission to access this resource.`,
  };
}

export const AccessDeniedPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, role } = useAuth();

  const currentRole = role || 'UNAUTHORIZED';
  const meta = getFeatureMetadata(location.pathname, currentRole);

  const homePath = currentRole === 'CUSTOMER' ? '/customer/products' : '/dashboard';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 text-left">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
        {/* Header Icon & Title */}
        <div className="flex items-start gap-4 pb-6 border-b border-slate-800">
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 shrink-0">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-bold uppercase tracking-wider">
                HTTP 403 Forbidden
              </span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">Access Denied</h1>
            <p className="text-sm text-slate-400 mt-1">
              You don't have permission to access this feature. Your account remains safely authenticated.
            </p>
          </div>
        </div>

        {/* AWS-Style Authorization Details Box */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-indigo-400" />
            <span>Authorization Context</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-500 font-semibold block uppercase text-[10px] tracking-wider">Requested Feature</span>
              <span className="font-bold text-slate-100 text-sm">{meta.featureName}</span>
              <span className="text-[11px] text-slate-400 font-mono block mt-0.5">{location.pathname}</span>
            </div>

            <div>
              <span className="text-slate-500 font-semibold block uppercase text-[10px] tracking-wider">Authenticated Account</span>
              <span className="font-bold text-slate-100 text-sm">{user?.username || 'Authenticated User'}</span>
              <div className="mt-1 flex items-center gap-1.5">
                <span className="text-slate-400">Current Role:</span>
                <Badge variant={currentRole === 'ADMIN' ? 'purple' : currentRole === 'MANAGER' ? 'info' : 'neutral'}>
                  {currentRole}
                </Badge>
              </div>
            </div>

            <div>
              <span className="text-slate-500 font-semibold block uppercase text-[10px] tracking-wider">Required Role</span>
              <div className="mt-1">
                <Badge variant="purple">{meta.requiredRole}</Badge>
              </div>
            </div>

            <div>
              <span className="text-slate-500 font-semibold block uppercase text-[10px] tracking-wider">Required Permission</span>
              <span className="font-mono text-slate-300 text-xs mt-1 block font-semibold">{meta.requiredPermission}</span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800/80">
            <span className="text-slate-500 font-semibold block uppercase text-[10px] tracking-wider">Authorization Reason</span>
            <p className="text-xs text-rose-300 font-medium mt-1">{meta.reason}</p>
          </div>
        </div>

        {/* Administrator Help Instruction */}
        <p className="text-xs text-slate-400 flex items-center gap-2">
          <Lock className="w-4 h-4 text-slate-500 shrink-0" />
          <span>Contact your administrator if you believe your account requires access to this module.</span>
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            Go Back
          </Button>

          <Button
            variant="primary"
            onClick={() => navigate(homePath)}
            leftIcon={<LayoutDashboard className="w-4 h-4" />}
          >
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};
