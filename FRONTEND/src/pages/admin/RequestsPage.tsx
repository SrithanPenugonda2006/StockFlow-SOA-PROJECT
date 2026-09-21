import React from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { AdminServiceNotice } from '../../components/admin/AdminServiceNotice';
import { Network } from 'lucide-react';

export const RequestsPage: React.FC = () => {
  return (
    <div className="flex flex-col gap-6 text-left max-w-7xl mx-auto">
      <PageHeader
        title="System Requests"
        subtitle="HTTP request tracing, gateway rate limits, and latency telemetry."
      />
      <AdminServiceNotice
        title="Request Telemetry Not Configured"
        description="Distributed HTTP request tracing and telemetry export (Zipkin/Jaeger) are not enabled."
        icon={Network}
        actionText="Telemetry Status: Not Configured"
      />
    </div>
  );
};
