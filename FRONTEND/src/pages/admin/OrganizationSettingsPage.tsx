import React from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { AdminServiceNotice } from '../../components/admin/AdminServiceNotice';
import { Building } from 'lucide-react';

export const OrganizationSettingsPage: React.FC = () => {
  return (
    <div className="flex flex-col gap-6 text-left max-w-7xl mx-auto">
      <PageHeader
        title="Organization Settings"
        subtitle="Configure organization-level defaults and policies."
      />
      <AdminServiceNotice
        title="Organization Settings Not Configured"
        description="Organization-level policy configuration requires backend tenant management support."
        icon={Building}
        actionText="Service Status: Unconfigured"
      />
    </div>
  );
};
