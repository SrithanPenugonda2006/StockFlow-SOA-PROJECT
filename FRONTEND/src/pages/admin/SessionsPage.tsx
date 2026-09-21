import React from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { useAuth } from '../../context/AuthContext';
import { parseJwt } from '../../utils/jwt';
import { Shield, User, CheckCircle2 } from 'lucide-react';

export const SessionsPage: React.FC = () => {
  const { user, role } = useAuth();
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const claims = token ? parseJwt(token) : null;

  return (
    <div className="flex flex-col gap-6 text-left max-w-7xl mx-auto">
      <PageHeader
        title="Active Security Sessions"
        subtitle="Inspect authenticated user session parameters, JWT token claims, and security credentials."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Current Session Identity">
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-3 p-3 bg-slate-950 rounded-xl border border-slate-800">
              <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400">
                <User className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-slate-400 block">Authenticated User</span>
                <span className="text-sm font-bold text-white">{user?.username || 'Unknown'}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-950 rounded-xl border border-slate-800">
              <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-400">
                <Shield className="w-5 h-5" />
              </div>
              <div className="flex-1 flex justify-between items-center">
                <div>
                  <span className="text-xs text-slate-400 block">Active Role</span>
                  <span className="text-sm font-bold text-white">{role || 'None'}</span>
                </div>
                <Badge variant="purple">{role}</Badge>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-950 rounded-xl border border-slate-800">
              <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-slate-400 block">Session Status</span>
                <span className="text-sm font-bold text-emerald-400">Authenticated & Active</span>
              </div>
            </div>
          </div>
        </Card>

        <Card title="JWT Token Claims & Expiration">
          <div className="space-y-3 pt-2">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 block">Subject (Sub)</span>
              <span className="text-xs font-mono text-indigo-300 font-bold">{claims?.sub || user?.username || 'auth-service'}</span>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 block">Role Claim</span>
              <span className="text-xs font-mono text-emerald-400 font-bold">{claims?.role || role || 'N/A'}</span>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 block">Expiration Timestamp (Exp)</span>
              <span className="text-xs font-mono text-amber-300 font-bold">
                {claims?.exp ? new Date(claims.exp * 1000).toLocaleString() : 'Active Session'}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
