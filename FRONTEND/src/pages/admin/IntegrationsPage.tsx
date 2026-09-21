import React from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';

export const IntegrationsPage: React.FC = () => {
  const activeIntegrations = [
    { name: 'Netflix Eureka Service Registry', type: 'Service Discovery', status: 'ACTIVE', endpoint: 'http://localhost:8761' },
    { name: 'Spring Cloud API Gateway', type: 'REST Gateway', status: 'ACTIVE', endpoint: 'http://localhost:8080' },
    { name: 'Spring Boot Mail SMTP', type: 'Email OTP Dispatcher', status: 'ACTIVE', endpoint: 'JavaMailSender' },
    { name: 'PostgreSQL Relational DBs', type: 'Persistence', status: 'ACTIVE', endpoint: 'Ports 5431, 5433, 5434, 5435' },
  ];

  return (
    <div className="flex flex-col gap-6 text-left max-w-7xl mx-auto">
      <PageHeader
        title="System Integrations"
        subtitle="Connected backend infrastructure components, discovery servers, and database persistence layers."
      />

      <Card title="Connected Infrastructure Integrations">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeIntegrations.map((item, idx) => (
            <div key={idx} className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-bold text-slate-100 text-sm">{item.name}</h4>
                  <Badge variant="success">{item.status}</Badge>
                </div>
                <p className="text-xs text-slate-400">{item.type}</p>
                <span className="text-[11px] font-mono text-indigo-400 mt-2 block">{item.endpoint}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
