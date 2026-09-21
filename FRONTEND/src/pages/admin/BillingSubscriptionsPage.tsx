import React from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { AdminServiceNotice } from '../../components/admin/AdminServiceNotice';
import { CreditCard } from 'lucide-react';

export const BillingSubscriptionsPage: React.FC = () => {
  return (
    <div className="flex flex-col gap-6 text-left max-w-7xl mx-auto">
      <PageHeader
        title="Active Subscriptions"
        subtitle="Tenant subscription statuses, renewal dates, and billing cycles."
      />
      <AdminServiceNotice
        title="Subscriptions Service Not Configured"
        description="Subscription lifecycle management requires payment gateway and billing backend integration."
        icon={CreditCard}
        actionText="Subscription Status: Single License"
      />
    </div>
  );
};
