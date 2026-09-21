import { renderStockStatusBadge } from "../../utils/stockStatus";
import { PageHeader } from "../../components/common/PageHeader";
import React, { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { LowStockItem } from "../../types/inventory";
import { Product } from "../../types/product";
import { Warehouse } from "../../types/warehouse";
import { inventoryApi } from "../../api/inventoryApi";
import { productApi } from "../../api/productApi";
import { warehouseApi } from "../../api/warehouseApi";
import { DataTable, Column } from "../../components/common/DataTable";
import { Button } from "../../components/common/Button";
import { useToast } from "../../context/ToastContext";

export const LowStockPage: React.FC = () => {
  const { showToast } = useToast();

  const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([]);
  const [productMap, setProductMap] = useState<Record<number, Product>>({});
  const [warehouseMap, setWarehouseMap] = useState<Record<number, Warehouse>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const fetchLowStock = async () => {
    setIsLoading(true);
    try {
      const prods = await productApi.getProducts({ page: 0, size: 100 });
      const pMap: Record<number, Product> = {};
      (prods.content || []).forEach((p) => {
        pMap[p.id] = p;
      });
      setProductMap(pMap);

      const whs = await warehouseApi.getWarehouses();
      const wMap: Record<number, Warehouse> = {};
      (whs || []).forEach((w) => {
        wMap[w.id] = w;
      });
      setWarehouseMap(wMap);

      const items = await inventoryApi.getLowStockInventory();
      const validItems = (items || []).filter((item) => !!pMap[item.productId]);
      setLowStockItems(validItems);
      setCurrentPage(1);
    } catch (err) {
      showToast("error", "Error Loading Alerts", "Unable to fetch low stock warnings.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLowStock();
  }, []);

  useEffect(() => {
    const totalPages = Math.ceil(lowStockItems.length / pageSize) || 1;
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [lowStockItems.length, currentPage]);

  const startIndex = (currentPage - 1) * pageSize;
  const paginatedItems = lowStockItems.slice(startIndex, startIndex + pageSize);

  const columns: Column<LowStockItem>[] = [
    {
      header: "Product",
      cell: (row) => {
        const prod = productMap[row.productId];
        return (
          <div>
            <span className="font-bold text-gray-900 block">{prod ? prod.name : `Product #${row.productId}`}</span>
            <span className="text-xs text-gray-500 font-mono">SKU: {prod ? prod.sku : "N/A"}</span>
          </div>
        );
      },
    },
    {
      header: "Warehouse Location",
      cell: (row) => {
        const wh = warehouseMap[row.warehouseId];
        return <span className="font-medium text-gray-600">{wh ? wh.name : `Warehouse #${row.warehouseId}`}</span>;
      },
    },
    {
      header: "Available Stock",
      cell: (row) => <span className="font-bold text-gray-900 text-base">{row.availableQuantity} Units</span>,
    },
    {
      header: "Alert Level",
      cell: (row) => renderStockStatusBadge(row.availableQuantity, row.threshold),
    },
  ];

  return (
    <div className="flex flex-col gap-6 text-left">
      <PageHeader
        title="Critical Low Stock Monitoring"
        subtitle="Real-time alerts for items falling below replenishment threshold."
        actions={
          <Button variant="ghost" onClick={fetchLowStock} leftIcon={<RefreshCw className="w-4 h-4" />}>
            Refresh Alerts
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={paginatedItems}
        keyExtractor={(row) => row.id}
        isLoading={isLoading}
        emptyMessage="All warehouse product stock levels are healthy."
        pagination={{
          currentPage,
          totalItems: lowStockItems.length,
          pageSize,
          onPageChange: setCurrentPage,
        }}
      />
    </div>
  );
};
