import React from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { AdminServiceNotice } from '../../components/admin/AdminServiceNotice';
import { CreditCard } from 'lucide-react';

export const BillingPlansPage: React.FC = () => {
  return (
    <div className="flex flex-col gap-6 text-left max-w-7xl mx-auto">
      <PageHeader
        title="Subscription Plans"
        subtitle="SaaS tier configurations, quota limits, and pricing plan definitions."
      />
      <AdminServiceNotice
        title="Billing & Subscription Service Not Configured"
        description="Billing services are not configured for this deployment. StockFlow runs as an internal enterprise inventory control platform."
        icon={CreditCard}
        actionText="Billing Status: Not Configured"
      />
    </div>
  );
};
