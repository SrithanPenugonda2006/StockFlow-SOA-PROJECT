import React from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';

export const SettingsPage: React.FC = () => {
  return (
    <div className="flex flex-col gap-6 text-left max-w-7xl mx-auto">
      <PageHeader
        title="Platform Settings"
        subtitle="View system operational parameters, authentication settings, and default thresholds."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="General Operational Defaults">
          <div className="space-y-4 pt-2">
            <div className="flex justify-between items-center p-3 bg-slate-950 rounded-xl border border-slate-800">
              <div>
                <span className="text-xs text-slate-300 font-semibold block">Default Low-Stock Threshold</span>
                <span className="text-[11px] text-slate-500">Alert level for inventory replenishment</span>
              </div>
              <Badge variant="warning">25 Units</Badge>
            </div>

            <div className="flex justify-between items-center p-3 bg-slate-950 rounded-xl border border-slate-800">
              <div>
                <span className="text-xs text-slate-300 font-semibold block">Database Concurrency Control</span>
                <span className="text-[11px] text-slate-500">Locking policy for checkout reservations</span>
              </div>
              <Badge variant="purple">PESSIMISTIC_WRITE</Badge>
            </div>
          </div>
        </Card>

        <Card title="Security & Authentication Config">
          <div className="space-y-4 pt-2">
            <div className="flex justify-between items-center p-3 bg-slate-950 rounded-xl border border-slate-800">
              <div>
                <span className="text-xs text-slate-300 font-semibold block">Token Authentication Protocol</span>
                <span className="text-[11px] text-slate-500">Bearer JWT signature verification</span>
              </div>
              <Badge variant="success">HMAC-SHA256</Badge>
            </div>

            <div className="flex justify-between items-center p-3 bg-slate-950 rounded-xl border border-slate-800">
              <div>
                <span className="text-xs text-slate-300 font-semibold block">Email Verification (OTP)</span>
                <span className="text-[11px] text-slate-500">Registration OTP via Spring Mail SMTP</span>
              </div>
              <Badge variant="info">ENABLED</Badge>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
