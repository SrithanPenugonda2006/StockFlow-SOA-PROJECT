import React from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { AdminServiceNotice } from '../../components/admin/AdminServiceNotice';
import { AlertCircle } from 'lucide-react';

export const IncidentsPage: React.FC = () => {
  return (
    <div className="flex flex-col gap-6 text-left max-w-7xl mx-auto">
      <PageHeader
        title="System Incidents"
        subtitle="Platform alerts, unhandled exceptions, and outage reporting."
      />
      <AdminServiceNotice
        title="No Active Incidents"
        description="All 6 Spring Boot microservices are running normally with 0 reported outages or circuit-breaker trips."
        icon={AlertCircle}
        actionText="Incident Tracker: 0 Alerts"
      />
    </div>
  );
};
