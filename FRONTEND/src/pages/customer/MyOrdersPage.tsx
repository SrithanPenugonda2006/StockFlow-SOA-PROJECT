import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Order } from '../../types/order';
import { Product } from '../../types/product';
import { orderApi } from '../../api/orderApi';
import { productApi } from '../../api/productApi';
import { OrderTable } from '../../components/orders/OrderTable';
import { OrderDetailsModal } from '../../components/orders/OrderDetailsModal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Pagination } from '../../components/common/Pagination';
import { CheckCircle } from 'lucide-react';

export const MyOrdersPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const location = useLocation();
  const successOrderId = (location.state as any)?.successOrderId;

  const [orders, setOrders] = useState<Order[]>([]);
  const [productMap, setProductMap] = useState<Record<number, Product>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const [currentPage, setCurrentPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalElements, setTotalElements] = useState<number>(0);

  useEffect(() => {
    if (!user) return;
    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        const res = await orderApi.getOrdersByCustomer(user.username, currentPage, 5);
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
        console.error('Error fetching customer orders:', err);
        showToast('error', 'Error Loading Orders', 'Unable to fetch your order history.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, [user, currentPage]);

  return (
    <div className="flex flex-col gap-6 text-left max-w-5xl mx-auto">
      {successOrderId && (
        <div className="p-4 bg-gray-100 border border-gray-800 rounded-2xl text-gray-800 text-sm flex items-center justify-between shadow-lg shadow-gray-900/5">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-gray-900 shrink-0" />
            <div>
              <h4 className="font-extrabold text-gray-800">Order is Successful!</h4>
              <p className="text-xs text-gray-900 mt-0.5">Your order #{successOrderId} has been confirmed and reserved in warehouse inventory.</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">My Order History</h1>
          <p className="text-xs text-gray-500 mt-0.5">Track real-time fulfillment status for customer orders.</p>
        </div>
      </div>

      <OrderTable
        orders={orders}
        isLoading={isLoading}
        onViewOrder={(order) => setSelectedOrder(order)}
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
