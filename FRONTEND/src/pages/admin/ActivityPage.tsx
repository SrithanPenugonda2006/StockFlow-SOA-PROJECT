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

export const ActivityPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);

  const fetchActivity = async () => {
    setLoading(true);
    try {
      const data = await inventoryApi.getTransactionHistory(undefined, undefined, 0, 50);
      setTransactions(data.content || []);
    } catch (err) {
      console.error('Failed to load activity stream:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivity();
  }, []);

  const columns: Column<InventoryTransaction>[] = [
    {
      header: 'Transaction ID',
      cell: (row) => <span className="font-mono text-xs text-indigo-400 font-bold">#{row.id}</span>,
    },
    {
      header: 'Activity Type',
      cell: (row) => {
        const type = row.transactionType || 'ADJUSTMENT';
        const variant =
          type.includes('RESERVE') || type.includes('DEDUCTION')
            ? 'warning'
            : type.includes('RELEASE') || type.includes('RECONCILE')
            ? 'info'
            : 'success';
        return <Badge variant={variant}>{type}</Badge>;
      },
    },
    {
      header: 'Inventory SKU',
      cell: (row) => (
        <span className="font-mono text-xs text-slate-200">
          Product #{row.productId} / WH #{row.warehouseId}
        </span>
      ),
    },
    {
      header: 'Quantity Delta',
      cell: (row) => (
        <span className={`font-mono text-xs font-bold ${row.quantityChange < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
          {row.quantityChange > 0 ? `+${row.quantityChange}` : row.quantityChange}
        </span>
      ),
    },
    {
      header: 'Reference Note',
      cell: (row) => <span className="text-xs text-slate-300">{row.reason || 'System operation'}</span>,
    },
    {
      header: 'Timestamp',
      cell: (row) => (
        <span className="text-xs text-slate-400 font-mono">
          {formatDate(row.createdAt || '')}
        </span>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6 text-left max-w-7xl mx-auto">
      <PageHeader
        title="Operations Activity Stream"
        subtitle="Live administrative audit log of stock movements, reservations, reconciliations, and transactions."
        actions={
          <Button variant="ghost" onClick={fetchActivity} leftIcon={<RefreshCw className="w-4 h-4" />}>
            Refresh Stream
          </Button>
        }
      />

      <Card title={`System Activity Log (${transactions.length} Records)`}>
        <DataTable
          columns={columns}
          data={transactions}
          keyExtractor={(item) => item.id}
          isLoading={loading}
          emptyMessage="No activity records logged."
        />
      </Card>
    </div>
  );
};
