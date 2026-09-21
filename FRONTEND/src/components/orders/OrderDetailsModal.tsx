import React, { useState, useEffect } from "react";
import { Order } from "../../types/order";
import { Modal } from "../common/Modal";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { Pagination } from "../common/Pagination";
import { formatCurrency, formatDate } from "../../utils/formatters";
import { PackageCheck, ShoppingBag } from "lucide-react";

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order?: Order | null;
  productMap?: Record<number, { name: string; sku: string }>;
}

export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  isOpen,
  onClose,
  order,
  productMap = {},
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  useEffect(() => {
    setCurrentPage(1);
  }, [order?.id]);

  if (!order) return null;

  const items = order.items || [];
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedItems = items.slice(startIndex, startIndex + pageSize);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Order Reference #${order.id}`}
      subtitle={`Placed on ${formatDate(order.createdAt)}`}
      maxWidth="lg"
    >
      <div className="flex flex-col gap-6 text-left">
        <div className="flex items-center justify-between p-4 bg-[#F7F8FA] rounded-xl border border-gray-200">
          <div>
            <span className="text-xs text-gray-400 block uppercase font-semibold">Customer ID</span>
            <span className="text-sm font-bold text-gray-800">{order.customerId}</span>
          </div>
          <div>
            <span className="text-xs text-gray-400 block uppercase font-semibold mb-1">Status</span>
            <OrderStatusBadge status={order.status} />
          </div>
          <div>
            <span className="text-xs text-gray-400 block uppercase font-semibold">Grand Total</span>
            <span className="text-base font-black text-gray-900">{formatCurrency(order.totalAmount)}</span>
          </div>
        </div>

        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-[#666666]" /> Purchased Items Breakdown
          </h4>

          <div className="divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden bg-[#F7F8FA]">
            {items.length > 0 ? (
              <>
                {paginatedItems.map((item) => {
                  const prod = productMap[item.productId];
                  return (
                    <div key={item.id} className="p-4 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-gray-900 text-sm block">
                          {prod ? prod.name : `Product #${item.productId}`}
                        </span>
                        <span className="text-xs text-gray-500 font-mono">
                          {prod ? `SKU: ${prod.sku}` : `Product ID: ${item.productId}`}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-gray-500 block">
                          {item.quantity} × {formatCurrency(item.price)}
                        </span>
                        <span className="font-bold text-gray-900 text-sm">
                          {formatCurrency(item.quantity * item.price)}
                        </span>
                      </div>
                    </div>
                  );
                })}
                <div className="p-3 bg-white border-t border-gray-200">
                  <Pagination
                    totalItems={items.length}
                    currentPage={currentPage}
                    pageSize={pageSize}
                    onPageChange={setCurrentPage}
                  />
                </div>
              </>
            ) : (
              <div className="p-4 text-xs text-gray-400 text-center">No item details available</div>
            )}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#F5F5F5] border border-[#E5E5E5] flex items-center gap-3 text-xs text-[#111111]">
          <PackageCheck className="w-5 h-5 shrink-0 text-[#666666]" />
          <span>Inventory stock was automatically locked & reserved during confirmation.</span>
        </div>
      </div>
    </Modal>
  );
};
