import React from 'react';
import { Order, OrderStatus } from '../../types/order';
import { DataTable, Column } from '../common/DataTable';
import { OrderStatusBadge } from './OrderStatusBadge';
import { Button } from '../common/Button';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Eye, Truck, CheckCircle } from 'lucide-react';

interface OrderTableProps {
  orders: Order[];
  isLoading?: boolean;
  onViewOrder?: (order: Order) => void;
  onUpdateStatus?: (orderId: number, newStatus: OrderStatus) => void;
  isManagement?: boolean;
}

export const OrderTable: React.FC<OrderTableProps> = ({
  orders,
  isLoading = false,
  onViewOrder,
  onUpdateStatus,
  isManagement = false,
}) => {
  const columns: Column<Order>[] = [
    {
      header: 'Order Reference',
      accessorKey: 'id',
      cell: (row) => (
        <div>
          <span className="font-bold text-slate-100 block">Order #{row.id}</span>
          <span className="text-xs text-slate-400">Customer: {row.customerId}</span>
        </div>
      ),
    },
    {
      header: 'Items',
      cell: (row) => (
        <span className="text-xs font-semibold bg-slate-800 px-2 py-1 rounded-md text-slate-300">
          {row.items ? row.items.length : 0} Product(s)
        </span>
      ),
    },
    {
      header: 'Total Amount',
      accessorKey: 'totalAmount',
      cell: (row) => <span className="font-bold text-emerald-400">{formatCurrency(row.totalAmount)}</span>,
    },
    {
      header: 'Status',
      cell: (row) => <OrderStatusBadge status={row.status} />,
    },
    {
      header: 'Placed Date',
      accessorKey: 'createdAt',
      cell: (row) => <span className="text-xs text-slate-400">{formatDate(row.createdAt)}</span>,
    },
    {
      header: 'Actions',
      cell: (row) => (
        <div className="flex items-center gap-2">
          {onViewOrder && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onViewOrder(row)}
              leftIcon={<Eye className="w-3.5 h-3.5" />}
            >
              Details
            </Button>
          )}

          {isManagement && onUpdateStatus && row.status === 'CONFIRMED' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onUpdateStatus(row.id, 'SHIPPED')}
              leftIcon={<Truck className="w-3.5 h-3.5 text-amber-400" />}
            >
              Dispatch
            </Button>
          )}

          {isManagement && onUpdateStatus && row.status === 'SHIPPED' && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => onUpdateStatus(row.id, 'DELIVERED')}
              leftIcon={<CheckCircle className="w-3.5 h-3.5" />}
            >
              Deliver
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={orders}
      keyExtractor={(row) => row.id}
      isLoading={isLoading}
      emptyMessage="No customer orders recorded yet."
    />
  );
};
