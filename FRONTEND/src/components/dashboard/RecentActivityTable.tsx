import React from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { ArrowRight, Clock, History } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { InventoryTransaction } from '../../types/inventory';
import { Product } from '../../types/product';
import { Warehouse } from '../../types/warehouse';

interface RecentActivityTableProps {
  transactions: InventoryTransaction[];
  productMap: Record<number, Product>;
  warehouseMap: Record<number, Warehouse>;
  isLoading: boolean;
}

export const RecentActivityTable: React.FC<RecentActivityTableProps> = ({
  transactions,
  productMap,
  warehouseMap,
  isLoading,
}) => {
  const navigate = useNavigate();

  const renderBadge = (type: string) => {
    switch (type) {
      case 'RESTOCK':
        return <Badge variant="success">RESTOCK</Badge>;
      case 'RESERVATION':
        return <Badge variant="warning">RESERVATION</Badge>;
      case 'CONFIRMATION':
      case 'SALE':
        return <Badge variant="info">SALE / CONFIRM</Badge>;
      case 'RECONCILIATION':
        return <Badge variant="purple">RECONCILIATION</Badge>;
      case 'RELEASE':
        return <Badge variant="neutral">RELEASE</Badge>;
      default:
        return <Badge variant="neutral">{type}</Badge>;
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Recent';
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return dateStr;
    }
  };

  return (
    <Card
      title="Recent Inventory Activity"
      subtitle="Live audit feed of multi-warehouse stock adjustments and transactions"
      headerAction={
        <button
          onClick={() => navigate('/transactions')}
          className="flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
        >
          <span>View All Transactions</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      }
    >
      {isLoading ? (
        <div className="py-12 flex items-center justify-center text-slate-500 text-xs">
          Loading recent inventory transactions...
        </div>
      ) : transactions.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                <th className="pb-3 px-3">Time</th>
                <th className="pb-3 px-3">Action</th>
                <th className="pb-3 px-3">Product</th>
                <th className="pb-3 px-3">Warehouse</th>
                <th className="pb-3 px-3">Qty Change</th>
                <th className="pb-3 px-3">Performed By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {transactions.slice(0, 7).map((tx) => {
                const prod = productMap[tx.productId];
                const wh = warehouseMap[tx.warehouseId];
                const isPositive = tx.quantityChange > 0;
                const isNegative = tx.quantityChange < 0;

                return (
                  <tr key={tx.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3 font-mono text-slate-400 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>{formatDate(tx.createdAt)}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">{renderBadge(tx.transactionType)}</td>
                    <td className="py-3 px-3">
                      <div>
                        <span className="font-semibold text-slate-100 block">{prod ? prod.name : `Product #${tx.productId}`}</span>
                        <span className="text-[10px] text-slate-400 font-mono">SKU: {prod ? prod.sku : 'N/A'}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-300 font-medium whitespace-nowrap">
                      {wh ? wh.name : `Warehouse #${tx.warehouseId}`}
                    </td>
                    <td className="py-3 px-3 font-bold whitespace-nowrap">
                      <span
                        className={
                          isPositive
                            ? 'text-emerald-400'
                            : isNegative
                            ? 'text-rose-400'
                            : 'text-slate-400'
                        }
                      >
                        {isPositive ? `+${tx.quantityChange}` : tx.quantityChange}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                      {tx.performedBy || 'System'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-500 text-xs">
          <History className="w-6 h-6 text-slate-600" />
          <span>No recent inventory activity records logged.</span>
        </div>
      )}
    </Card>
  );
};
