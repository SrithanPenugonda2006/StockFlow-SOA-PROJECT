import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, LayoutDashboard, Shield, Lock } from 'lucide-react';
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
    <div className="min-h-screen bg-[#F7F8FA] text-gray-900 flex items-center justify-center p-6 text-left">
      <div className="w-full max-w-2xl bg-white border border-gray-200 rounded-3xl p-8 shadow-xl space-y-6">
        {/* Header Icon & Title */}
        <div className="flex items-start gap-4 pb-6 border-b border-gray-200">
          <div className="p-3.5 rounded-2xl bg-gray-100 border border-gray-800 text-gray-900 shrink-0">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-gray-100 border border-gray-800 text-gray-900 text-xs font-bold uppercase tracking-wider">
                HTTP 403 Forbidden
              </span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-gray-900">Access Denied</h1>
            <p className="text-sm text-gray-500 mt-1">
              You don't have permission to access this feature. Your account remains safely authenticated.
            </p>
          </div>
        </div>

        {/* Authorization Details Box */}
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-[#111111]" />
            <span>Authorization Context</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-gray-500 font-semibold block uppercase text-[10px] tracking-wider">Requested Feature</span>
              <span className="font-bold text-gray-900 text-sm">{meta.featureName}</span>
              <span className="text-[11px] text-gray-500 font-mono block mt-0.5">{location.pathname}</span>
            </div>

            <div>
              <span className="text-gray-500 font-semibold block uppercase text-[10px] tracking-wider">Authenticated Account</span>
              <span className="font-bold text-gray-900 text-sm">{user?.username || 'Authenticated User'}</span>
              <div className="mt-1 flex items-center gap-1.5">
                <span className="text-gray-500">Current Role:</span>
                <Badge variant={currentRole === 'ADMIN' ? 'purple' : currentRole === 'MANAGER' ? 'info' : 'neutral'}>
                  {currentRole}
                </Badge>
              </div>
            </div>

            <div>
              <span className="text-gray-500 font-semibold block uppercase text-[10px] tracking-wider">Required Role</span>
              <div className="mt-1">
                <Badge variant="purple">{meta.requiredRole}</Badge>
              </div>
            </div>

            <div>
              <span className="text-gray-500 font-semibold block uppercase text-[10px] tracking-wider">Required Permission</span>
              <span className="font-mono text-gray-700 text-xs mt-1 block font-semibold">{meta.requiredPermission}</span>
            </div>
          </div>

          <div className="pt-3 border-t border-gray-200">
            <span className="text-gray-500 font-semibold block uppercase text-[10px] tracking-wider">Authorization Reason</span>
            <p className="text-xs text-gray-900 font-medium mt-1">{meta.reason}</p>
          </div>
        </div>

        {/* Administrator Help Instruction */}
        <p className="text-xs text-gray-500 flex items-center gap-2">
          <Lock className="w-4 h-4 text-gray-400 shrink-0" />
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
