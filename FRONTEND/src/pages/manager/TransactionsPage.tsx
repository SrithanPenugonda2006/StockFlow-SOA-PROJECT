import { PageHeader } from "../../components/common/PageHeader";
import React, { useEffect, useState } from 'react';
import { History, RefreshCw } from 'lucide-react';
import { InventoryTransaction } from '../../types/inventory';
import { Product } from '../../types/product';
import { Warehouse } from '../../types/warehouse';
import { inventoryApi } from '../../api/inventoryApi';
import { productApi } from '../../api/productApi';
import { warehouseApi } from '../../api/warehouseApi';
import { DataTable, Column } from '../../components/common/DataTable';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Pagination } from '../../components/common/Pagination';
import { formatDate } from '../../utils/formatters';
import { useToast } from '../../context/ToastContext';

export const TransactionsPage: React.FC = () => {
  const { showToast } = useToast();

  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [productMap, setProductMap] = useState<Record<number, Product>>({});
  const [warehouseMap, setWarehouseMap] = useState<Record<number, Warehouse>>({});
  const [isLoading, setIsLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalElements, setTotalElements] = useState<number>(0);

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const res = await inventoryApi.getTransactionHistory(undefined, undefined, currentPage, 10);
      setTransactions(res.content || []);
      setTotalPages(res.totalPages || 1);
      setTotalElements(res.totalElements || 0);

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
    } catch (err) {
      showToast('error', 'Error Loading Audit Logs', 'Unable to fetch transaction history.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [currentPage]);

  const columns: Column<InventoryTransaction>[] = [
    {
      header: 'Timestamp',
      accessorKey: 'createdAt',
      cell: (row) => <span className="text-xs text-slate-400 font-mono">{formatDate(row.createdAt)}</span>,
    },
    {
      header: 'Transaction Type',
      cell: (row) => {
        switch (row.transactionType) {
          case 'RESTOCK':
            return <Badge variant="success">RESTOCK</Badge>;
          case 'RESERVATION':
            return <Badge variant="warning">RESERVATION</Badge>;
          case 'CONFIRMATION':
            return <Badge variant="info">CONFIRMATION</Badge>;
          case 'RECONCILIATION':
            return <Badge variant="purple">RECONCILIATION</Badge>;
          case 'RELEASE':
            return <Badge variant="neutral">RELEASE</Badge>;
          default:
            return <Badge variant="neutral">{row.transactionType}</Badge>;
        }
      },
    },
    {
      header: 'Product',
      cell: (row) => {
        const prod = productMap[row.productId];
        return (
          <div>
            <span className="font-bold text-slate-100 block">{prod ? prod.name : `Product #${row.productId}`}</span>
            <span className="text-xs text-slate-400 font-mono">SKU: {prod ? prod.sku : 'N/A'}</span>
          </div>
        );
      },
    },
    {
      header: 'Warehouse',
      cell: (row) => {
        const wh = warehouseMap[row.warehouseId];
        return <span className="font-medium text-slate-300">{wh ? wh.name : `Warehouse #${row.warehouseId}`}</span>;
      },
    },
    {
      header: 'Qty Change',
      cell: (row) => (
        <span
          className={`font-bold ${
            row.quantityChange > 0
              ? 'text-emerald-400'
              : row.quantityChange < 0
              ? 'text-rose-400'
              : 'text-slate-400'
          }`}
        >
          {row.quantityChange > 0 ? `+${row.quantityChange}` : row.quantityChange}
        </span>
      ),
    },
    {
      header: 'Reason / Performed By',
      cell: (row) => (
        <div>
          <span className="text-xs font-semibold text-slate-300 block">{row.reason}</span>
          <span className="text-[10px] text-slate-500 font-mono">By: {row.performedBy || 'System'}</span>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6 text-left">
      <PageHeader
        title="Inventory Audit Transaction Logs"
        subtitle="Complete historical ledger of stock reservations, adjustments, and movements."
        actions={
          <Button variant="ghost" onClick={fetchTransactions} leftIcon={<RefreshCw className="w-4 h-4" />}>
            Refresh Ledger
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={transactions}
        keyExtractor={(row) => row.id}
        isLoading={isLoading}
        emptyMessage="No audit transaction records logged yet."
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalElements={totalElements}
        pageSize={10}
        onPageChange={(p) => setCurrentPage(p)}
      />
    </div>
  );
};
