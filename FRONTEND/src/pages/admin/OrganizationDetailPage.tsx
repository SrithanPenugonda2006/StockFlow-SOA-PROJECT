import React from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { AdminServiceNotice } from '../../components/admin/AdminServiceNotice';
import { Building } from 'lucide-react';

export const OrganizationDetailPage: React.FC = () => {
  return (
    <div className="flex flex-col gap-6 text-left max-w-7xl mx-auto">
      <PageHeader
        title="Organization Details"
        subtitle="View single tenant organizational information and parameters."
      />
      <AdminServiceNotice
        title="Organization Details Unavailable"
        description="Detailed multi-tenant organization profiling is not configured for this single-tenant StockFlow deployment."
        icon={Building}
        actionText="Backend Status: Single Tenant"
      />
    </div>
  );
};
