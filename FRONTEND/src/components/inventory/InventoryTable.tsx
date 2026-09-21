import { renderStockStatusBadge } from "../../utils/stockStatus";
import React, { useState, useEffect } from "react";
import { Inventory } from "../../types/inventory";
import { DataTable, Column } from "../common/DataTable";
import { Button } from "../common/Button";
import { Edit3, RefreshCw } from "lucide-react";

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
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  useEffect(() => {
    const totalPages = Math.ceil(inventoryItems.length / pageSize) || 1;
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [inventoryItems.length, currentPage]);

  const startIndex = (currentPage - 1) * pageSize;
  const paginatedItems = inventoryItems.slice(startIndex, startIndex + pageSize);

  const columns: Column<Inventory>[] = [
    {
      header: "Product",
      cell: (row: Inventory) => {
        const prod = productMap[row.productId];
        return (
          <div>
            <span className="font-bold text-gray-900 block">
              {prod ? prod.name : `Product #${row.productId}`}
            </span>
            <span className="text-xs text-gray-500 font-mono">
              SKU: {prod ? prod.sku : `ID-${row.productId}`}
            </span>
          </div>
        );
      },
    },
    {
      header: "Warehouse",
      cell: (row: Inventory) => {
        const wh = warehouseMap[row.warehouseId];
        return <span className="font-medium text-gray-600">{wh ? wh.name : `Warehouse #${row.warehouseId}`}</span>;
      },
    },
    {
      header: "Total Stock",
      accessorKey: "quantity",
      cell: (row: Inventory) => <span className="font-bold text-gray-900">{row.quantity}</span>,
    },
    {
      header: "Reserved",
      accessorKey: "reservedQuantity",
      cell: (row: Inventory) => <span className="font-semibold text-gray-700">{row.reservedQuantity}</span>,
    },
    {
      header: "Available",
      accessorKey: "availableQuantity",
      cell: (row: Inventory) => <span className="font-bold text-gray-900">{row.availableQuantity}</span>,
    },
    {
      header: "Stock Status",
      cell: (row: Inventory) => renderStockStatusBadge(row.availableQuantity),
    },
    {
      header: "Actions",
      cell: (row: Inventory) => (
        <div className="flex items-center gap-2">
          {onUpdateStock && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onUpdateStock(row)}
              leftIcon={<Edit3 className="w-3.5 h-3.5 text-[#666666]" />}
            >
              Update
            </Button>
          )}
          {onReconcile && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onReconcile(row)}
              leftIcon={<RefreshCw className="w-3.5 h-3.5 text-gray-600" />}
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
      data={paginatedItems}
      keyExtractor={(row) => row.id}
      isLoading={isLoading}
      emptyMessage="No inventory records allocated yet."
      pagination={{
        currentPage,
        totalItems: inventoryItems.length,
        pageSize,
        onPageChange: setCurrentPage,
      }}
    />
  );
};
