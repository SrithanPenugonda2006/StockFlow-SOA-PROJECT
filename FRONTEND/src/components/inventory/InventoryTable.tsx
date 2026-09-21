import { renderStockStatusBadge } from "../../utils/stockStatus";
import React from 'react';
import { Inventory } from '../../types/inventory';
import { DataTable, Column } from '../common/DataTable';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Edit3, RefreshCw } from 'lucide-react';

interface InventoryTableProps {
  inventoryItems: Inventory[];
  productMap?: Record<number, { name: string; sku: string }>;
  warehouseMap?: Record<number, { name: string }>;
  isLoading?: boolean;
  onUpdateStock?: (item: Inventory) => void;
  onReconcile?: (item: Inventory) => void;
}

export const InventoryTable: React.FC<InventoryTableProps> = ({
  inventoryItems,
  productMap = {},
  warehouseMap = {},
  isLoading = false,
  onUpdateStock,
  onReconcile,
}) => {


  const columns: Column<Inventory>[] = [
    {
      header: 'Product',
      cell: (row: Inventory) => {
        const prod = productMap[row.productId];
        return (
          <div>
            <span className="font-bold text-slate-100 block">
              {prod ? prod.name : `Product #${row.productId}`}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              SKU: {prod ? prod.sku : `ID-${row.productId}`}
            </span>
          </div>
        );
      },
    },
    {
      header: 'Warehouse',
      cell: (row: Inventory) => {
        const wh = warehouseMap[row.warehouseId];
        return <span className="font-medium text-slate-300">{wh ? wh.name : `Warehouse #${row.warehouseId}`}</span>;
      },
    },
    {
      header: 'Total Stock',
      accessorKey: 'quantity',
      cell: (row: Inventory) => <span className="font-bold text-slate-100">{row.quantity}</span>,
    },
    {
      header: 'Reserved',
      accessorKey: 'reservedQuantity',
      cell: (row: Inventory) => <span className="font-semibold text-amber-400">{row.reservedQuantity}</span>,
    },
    {
      header: 'Available',
      accessorKey: 'availableQuantity',
      cell: (row: Inventory) => <span className="font-bold text-emerald-400">{row.availableQuantity}</span>,
    },
    {
      header: 'Stock Status',
      cell: (row: Inventory) => renderStockStatusBadge(row.availableQuantity),
    },
    {
      header: 'Actions',
      cell: (row: Inventory) => (
        <div className="flex items-center gap-2">
          {onUpdateStock && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onUpdateStock(row)}
              leftIcon={<Edit3 className="w-3.5 h-3.5 text-indigo-400" />}
            >
              Update
            </Button>
          )}
          {onReconcile && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onReconcile(row)}
              leftIcon={<RefreshCw className="w-3.5 h-3.5 text-sky-400" />}
            >
              Audit
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={inventoryItems}
      keyExtractor={(row) => row.id}
      isLoading={isLoading}
      emptyMessage="No inventory records allocated yet."
    />
  );
};
