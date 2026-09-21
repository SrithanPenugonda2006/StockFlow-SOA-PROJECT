import React, { useState, useEffect } from "react";
import { Card } from "../common/Card";
import { Badge } from "../common/Badge";
import { Pagination } from "../common/Pagination";
import { ArrowRight, Clock, History } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { InventoryTransaction } from "../../types/inventory";
import { Product } from "../../types/product";
import { Warehouse } from "../../types/warehouse";

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
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  useEffect(() => {
    const totalPages = Math.ceil(transactions.length / pageSize) || 1;
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [transactions.length, currentPage]);

  const startIndex = (currentPage - 1) * pageSize;
  const paginatedTransactions = transactions.slice(startIndex, startIndex + pageSize);

  const renderBadge = (type: string) => {
    switch (type) {
      case "RESTOCK":
        return <Badge variant="success">RESTOCK</Badge>;
      case "RESERVATION":
        return <Badge variant="warning">RESERVATION</Badge>;
      case "CONFIRMATION":
      case "SALE":
        return <Badge variant="info">SALE / CONFIRM</Badge>;
      case "RECONCILIATION":
        return <Badge variant="purple">RECONCILIATION</Badge>;
      case "RELEASE":
        return <Badge variant="neutral">RELEASE</Badge>;
      default:
        return <Badge variant="neutral">{type}</Badge>;
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "Recent";
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
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
          onClick={() => navigate("/transactions")}
          className="flex items-center gap-1.5 text-xs font-semibold text-[#666666] hover:text-[#666666] transition-colors cursor-pointer"
        >
          <span>View All Transactions</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      }
    >
      {isLoading ? (
        <div className="py-12 flex items-center justify-center text-gray-400 text-xs">
          Loading recent inventory transactions...
        </div>
      ) : transactions.length > 0 ? (
        <div className="flex flex-col gap-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                  <th className="pb-3 px-3">Time</th>
                  <th className="pb-3 px-3">Action</th>
                  <th className="pb-3 px-3">Product</th>
                  <th className="pb-3 px-3">Warehouse</th>
                  <th className="pb-3 px-3">Qty Change</th>
                  <th className="pb-3 px-3">Performed By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100/60 text-xs">
                {paginatedTransactions.map((tx) => {
                  const prod = productMap[tx.productId];
                  const wh = warehouseMap[tx.warehouseId];
                  const change = tx.quantityChange ?? tx.quantity ?? 0;
                  const isPositive = change > 0;
                  const isNegative = change < 0;

                  return (
                    <tr key={tx.id} className="hover:bg-gray-100/40 transition-colors">
                      <td className="py-3 px-3 font-mono text-gray-500 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-gray-400" />
                          <span>{formatDate(tx.createdAt)}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">{renderBadge(tx.transactionType)}</td>
                      <td className="py-3 px-3">
                        <div>
                          <span className="font-semibold text-gray-900 block">{prod ? prod.name : `Product #${tx.productId}`}</span>
                          <span className="text-[10px] text-gray-500 font-mono">SKU: {prod ? prod.sku : "N/A"}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-gray-600 font-medium whitespace-nowrap">
                        {wh ? wh.name : `Warehouse #${tx.warehouseId}`}
                      </td>
                      <td className="py-3 px-3 font-bold whitespace-nowrap">
                        <span
                          className={
                            isPositive
                              ? "text-gray-900"
                              : isNegative
                              ? "text-gray-900"
                              : "text-gray-500"
                          }
                        >
                          {isPositive ? `+${tx.quantityChange}` : tx.quantityChange}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-gray-500 font-mono text-[11px] whitespace-nowrap">
                        {tx.performedBy || "System"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Pagination
            totalItems={transactions.length}
            currentPage={currentPage}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
          />
        </div>
      ) : (
        <div className="py-12 flex flex-col items-center justify-center gap-2 text-gray-400 text-xs">
          <History className="w-6 h-6 text-slate-600" />
          <span>No recent inventory activity records logged.</span>
        </div>
      )}
    </Card>
  );
};
