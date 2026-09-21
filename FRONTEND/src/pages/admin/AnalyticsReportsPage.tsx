import React from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { AdminServiceNotice } from '../../components/admin/AdminServiceNotice';
import { FileText } from 'lucide-react';

export const AnalyticsReportsPage: React.FC = () => {
  return (
    <div className="flex flex-col gap-6 text-left max-w-7xl mx-auto">
      <PageHeader
        title="Administrative Reports"
        subtitle="Generate and export inventory, order fulfillment, and audit compliance reports."
      />
      <AdminServiceNotice
        title="Report Export Engine Not Configured"
        description="Automated PDF/Excel report export engine is not enabled in this deployment. Operational data is accessible via live API endpoints."
        icon={FileText}
        actionText="Export Engine: Not Configured"
      />
    </div>
  );
};
