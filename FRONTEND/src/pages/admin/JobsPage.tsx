import React from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { AdminServiceNotice } from '../../components/admin/AdminServiceNotice';
import { Cpu } from 'lucide-react';

export const JobsPage: React.FC = () => {
  return (
    <div className="flex flex-col gap-6 text-left max-w-7xl mx-auto">
      <PageHeader
        title="Background Jobs"
        subtitle="Monitor system background tasks, scheduled crons, and async worker queues."
      />
      <AdminServiceNotice
        title="Background Job Engine Not Configured"
        description="System background job scheduling and asynchronous worker queues are not active in this environment."
        icon={Cpu}
        actionText="Engine Status: Not Configured"
      />
    </div>
  );
};
