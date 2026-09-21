import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { DataTable, Column } from '../../components/common/DataTable';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { inventoryApi } from '../../api/inventoryApi';
import { InventoryTransaction } from '../../types/inventory';
import { RefreshCw } from 'lucide-react';
import { formatDate } from '../../utils/formatters';

export const AuditLogsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<InventoryTransaction[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await inventoryApi.getTransactionHistory(undefined, undefined, 0, 50);
      setLogs(data.content || []);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const startIndex = (currentPage - 1) * pageSize;
  const paginatedLogs = logs.slice(startIndex, startIndex + pageSize);

  const columns: Column<InventoryTransaction>[] = [
    {
      header: 'Audit ID',
      cell: (row) => <span className="font-mono text-xs text-[#666666] font-bold">AUDIT-{row.id}</span>,
    },
    {
      header: 'Event Category',
      cell: () => <Badge variant="purple">INVENTORY_AUDIT</Badge>,
    },
    {
      header: 'Action Executed',
      cell: (row) => <Badge variant="info">{row.transactionType || 'MODIFICATION'}</Badge>,
    },
    {
      header: 'Notes / Reference',
      cell: (row) => <span className="text-xs text-gray-600">{row.reason || 'System operation'}</span>,
    },
    {
      header: 'Timestamp',
      cell: (row) => (
        <span className="text-xs text-gray-500 font-mono">
          {formatDate(row.createdAt || '')}
        </span>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6 text-left max-w-7xl mx-auto">
      <PageHeader
        title="Security Audit Logs"
        subtitle="Persistent immutable audit trail of system transactions and state modifications."
        actions={
          <Button variant="ghost" onClick={fetchLogs} leftIcon={<RefreshCw className="w-4 h-4" />}>
            Refresh Audit Trail
          </Button>
        }
      />

      <Card title={`Audit Events Trail (${logs.length} Records)`}>
        <DataTable
          columns={columns}
          data={paginatedLogs}
          keyExtractor={(item) => item.id}
          isLoading={loading}
          emptyMessage="No security audit records logged."
          pagination={{
            currentPage,
            totalItems: logs.length,
            pageSize,
            onPageChange: setCurrentPage,
          }}
        />
      </Card>
    </div>
  );
};
