import React from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { AdminServiceNotice } from '../../components/admin/AdminServiceNotice';
import { UserPlus } from 'lucide-react';

export const InvitationsPage: React.FC = () => {
  return (
    <div className="flex flex-col gap-6 text-left max-w-7xl mx-auto">
      <PageHeader
        title="User Invitations"
        subtitle="Send invitation tokens for platform onboarding."
      />
      <AdminServiceNotice
        title="User Invitation Service Not Configured"
        description="Direct email invitation dispatch is not configured for this deployment. User accounts are created via register portal or seed authentication API."
        icon={UserPlus}
        actionText="Auth Endpoint: Direct Registration"
      />
    </div>
  );
};
