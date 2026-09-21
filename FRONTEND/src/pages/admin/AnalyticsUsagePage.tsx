import React from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';

export const AnalyticsUsagePage: React.FC = () => {
  return (
    <div className="flex flex-col gap-6 text-left max-w-7xl mx-auto">
      <PageHeader
        title="Usage Analytics"
        subtitle="Monitor system throughput, database query volume, and API Gateway traffic."
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Database Telemetry">
          <div className="space-y-3 pt-2">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
              <span className="text-xs text-slate-300 font-semibold">PostgreSQL Databases</span>
              <span className="text-xs font-mono text-indigo-400 font-bold">4 Dedicated DBs</span>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
              <span className="text-xs text-slate-300 font-semibold">Flyway Migration Version</span>
              <span className="text-xs font-mono text-emerald-400 font-bold">V3 Executed</span>
            </div>
          </div>
        </Card>

        <Card title="API Traffic Profile">
          <div className="space-y-3 pt-2">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
              <span className="text-xs text-slate-300 font-semibold">API Gateway Router</span>
              <span className="text-xs font-mono text-purple-400 font-bold">Port 8080 Active</span>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
              <span className="text-xs text-slate-300 font-semibold">Service Discovery</span>
              <span className="text-xs font-mono text-sky-400 font-bold">Eureka Heartbeat OK</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
