import React from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { AdminServiceNotice } from '../../components/admin/AdminServiceNotice';
import { Building } from 'lucide-react';

export const OrganizationsPage: React.FC = () => {
  return (
    <div className="flex flex-col gap-6 text-left max-w-7xl mx-auto">
      <PageHeader
        title="Organizations Management"
        subtitle="Multi-tenant organization partitions, tenant policies, and workspace configurations."
      />
      <AdminServiceNotice
        title="Multi-Tenant Organizations Not Configured"
        description="This StockFlow deployment operates as a single-tenant enterprise system. Multi-tenant organization partitioning requires additional backend multi-tenancy microservice support."
        icon={Building}
        actionText="Deployment Mode: Single Tenant"
      />
    </div>
  );
};
