import React from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { AdminServiceNotice } from '../../components/admin/AdminServiceNotice';
import { Key } from 'lucide-react';

export const ApiKeysPage: React.FC = () => {
  return (
    <div className="flex flex-col gap-6 text-left max-w-7xl mx-auto">
      <PageHeader
        title="API Key Management"
        subtitle="Generate and manage programmatic API keys for external REST integrations."
      />
      <AdminServiceNotice
        title="API Key Management Service Not Configured"
        description="External programmatic API key generation requires API Gateway rate-limiting and secret vault configuration."
        icon={Key}
        actionText="Auth Protocol: JWT Bearer Only"
      />
    </div>
  );
};
