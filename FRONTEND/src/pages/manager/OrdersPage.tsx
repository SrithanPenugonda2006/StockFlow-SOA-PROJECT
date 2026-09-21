import { PageHeader } from "../../components/common/PageHeader";
import React, { useEffect, useState } from 'react';
import { ShoppingBag, RefreshCw } from 'lucide-react';
import { Order, OrderStatus } from '../../types/order';
import { Product } from '../../types/product';
import { orderApi } from '../../api/orderApi';
import { productApi } from '../../api/productApi';
import { OrderTable } from '../../components/orders/OrderTable';
import { OrderDetailsModal } from '../../components/orders/OrderDetailsModal';
import { Button } from '../../components/common/Button';
import { Pagination } from '../../components/common/Pagination';
import { useToast } from '../../context/ToastContext';

export const OrdersPage: React.FC = () => {
  const { showToast } = useToast();

  const [orders, setOrders] = useState<Order[]>([]);
  const [productMap, setProductMap] = useState<Record<number, Product>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const [currentPage, setCurrentPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalElements, setTotalElements] = useState<number>(0);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const res = await orderApi.getOrders(currentPage, 5);
      setOrders(res.content || []);
      setTotalPages(res.totalPages || 1);
      setTotalElements(res.totalElements || 0);

      const prods = await productApi.getProducts({ page: 0, size: 100 });
      const map: Record<number, Product> = {};
      (prods.content || []).forEach((p) => {
        map[p.id] = p;
      });
      setProductMap(map);
    } catch (err) {
      showToast('error', 'Error Loading Orders', 'Unable to fetch orders.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [currentPage]);

  const handleUpdateStatus = async (orderId: number, newStatus: OrderStatus) => {
    try {
      await orderApi.updateOrderStatus(orderId, newStatus);
      showToast('success', 'Status Updated', `Order #${orderId} status changed to ${newStatus}.`);
      fetchOrders();
    } catch (err) {
      showToast('error', 'Update Failed', 'Failed to update order status.');
    }
  };

  return (
    <div className="flex flex-col gap-6 text-left">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Customer Orders Fulfillment</h1>
          <p className="text-xs text-gray-500 mt-0.5">Manage customer orders and dispatch fulfillment workflows.</p>
        </div>

        <Button variant="ghost" onClick={fetchOrders} leftIcon={<RefreshCw className="w-4 h-4" />}>
          Refresh Orders
        </Button>
      </div>

      <OrderTable
        orders={orders}
        isLoading={isLoading}
        isManagement={true}
        onViewOrder={(order) => setSelectedOrder(order)}
        onUpdateStatus={handleUpdateStatus}
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalElements={totalElements}
        pageSize={5} totalItems={totalElements} isZeroBased={true}
        onPageChange={(p) => setCurrentPage(p)}
      />

      <OrderDetailsModal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        order={selectedOrder}
        productMap={productMap}
      />
    </div>
  );
};
