import React from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { AdminServiceNotice } from '../../components/admin/AdminServiceNotice';
import { Receipt } from 'lucide-react';

export const BillingInvoicesPage: React.FC = () => {
  return (
    <div className="flex flex-col gap-6 text-left max-w-7xl mx-auto">
      <PageHeader
        title="Billing Invoices"
        subtitle="View payment receipts, tax breakdown, and historical invoices."
      />
      <AdminServiceNotice
        title="Invoicing Service Not Configured"
        description="Invoicing and payment processing are not active for this enterprise deployment."
        icon={Receipt}
        actionText="Invoicing Status: Not Configured"
      />
    </div>
  );
};
