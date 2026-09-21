import React from 'react';
import { Order } from '../../types/order';
import { Modal } from '../common/Modal';
import { OrderStatusBadge } from './OrderStatusBadge';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { PackageCheck, ShoppingBag } from 'lucide-react';

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
  if (!order) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Order Reference #${order.id}`}
      subtitle={`Placed on ${formatDate(order.createdAt)}`}
      maxWidth="lg"
    >
      <div className="flex flex-col gap-6 text-left">
        <div className="flex items-center justify-between p-4 bg-slate-950 rounded-xl border border-slate-800">
          <div>
            <span className="text-xs text-slate-500 block uppercase font-semibold">Customer ID</span>
            <span className="text-sm font-bold text-slate-200">{order.customerId}</span>
          </div>
          <div>
            <span className="text-xs text-slate-500 block uppercase font-semibold mb-1">Status</span>
            <OrderStatusBadge status={order.status} />
          </div>
          <div>
            <span className="text-xs text-slate-500 block uppercase font-semibold">Grand Total</span>
            <span className="text-base font-black text-emerald-400">{formatCurrency(order.totalAmount)}</span>
          </div>
        </div>

        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-indigo-400" /> Purchased Items Breakdown
          </h4>

          <div className="divide-y divide-slate-800 border border-slate-800 rounded-xl overflow-hidden bg-slate-950">
            {order.items && order.items.length > 0 ? (
              order.items.map((item) => {
                const prod = productMap[item.productId];
                return (
                  <div key={item.id} className="p-4 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-100 text-sm block">
                        {prod ? prod.name : `Product #${item.productId}`}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        {prod ? `SKU: ${prod.sku}` : `Product ID: ${item.productId}`}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-400 block">
                        {item.quantity} × {formatCurrency(item.price)}
                      </span>
                      <span className="font-bold text-emerald-400 text-sm">
                        {formatCurrency(item.quantity * item.price)}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-4 text-xs text-slate-500 text-center">No item details available</div>
            )}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center gap-3 text-xs text-indigo-300">
          <PackageCheck className="w-5 h-5 shrink-0 text-indigo-400" />
          <span>Inventory stock was automatically locked & reserved during confirmation.</span>
        </div>
      </div>
    </Modal>
  );
};
