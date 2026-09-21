import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, AlertTriangle, CheckCircle } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { orderApi } from '../../api/orderApi';
import { Button } from '../../components/common/Button';
import { formatCurrency, extractErrorMessage } from '../../utils/formatters';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart, totalAmount, clearCart } = useCart();
  const { showToast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stockConflict, setStockConflict] = useState<string | null>(null);

  if (cart.length === 0) {
    navigate('/customer/products');
    return null;
  }

  const handlePlaceOrder = async () => {
    setIsSubmitting(true);
    setStockConflict(null);

    const idempotencyKey = `IDEM-KEY-${Date.now()}`;
    const orderItems = cart.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
    }));

    try {
      const order = await orderApi.createOrder({
        customerId: user?.username || 'john_doe',
        idempotencyKey,
        items: orderItems,
      });

      clearCart();
      showToast('success', 'Order is Successful', `Order Reference #${order.id} placed successfully.`);
      navigate(`/customer/orders`, { state: { successOrderId: order.id } });
    } catch (err: any) {
      console.error('Order creation error:', err);
      const msg = err.response?.data || err.message;
      if (typeof msg === 'string' && (msg.includes('Insufficient stock') || msg.includes('stock'))) {
        setStockConflict(msg);
        showToast('error', 'Stock Changed', 'The requested quantity is no longer available in warehouse stock.');
      } else {
        showToast('error', 'Checkout Failed', typeof msg === 'string' ? msg : 'Unable to place order.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 text-left max-w-3xl mx-auto">
      <h1 className="text-2xl font-black text-white tracking-tight">Review & Confirm Order</h1>

      {stockConflict && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-300 text-sm flex flex-col gap-2">
          <div className="flex items-center gap-2 font-bold text-rose-400">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>Stock Conflict Detected</span>
          </div>
          <p className="text-xs leading-relaxed">{stockConflict}</p>
          <Button variant="secondary" size="sm" onClick={() => navigate('/customer/cart')} className="w-fit mt-1">
            Update Cart Quantities
          </Button>
        </div>
      )}

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl divide-y divide-slate-800">
        <div className="pb-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Customer Identity</h3>
          <p className="text-sm text-slate-200 font-semibold mt-1">{user?.username} ({user?.role})</p>
        </div>

        <div className="py-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3">Order Items</h3>
          <div className="flex flex-col gap-2">
            {cart.map((item) => (
              <div key={item.productId} className="flex justify-between text-sm py-1">
                <span className="text-slate-300">
                  {item.name} <strong className="text-slate-500">× {item.quantity}</strong>
                </span>
                <span className="font-bold text-emerald-400">{formatCurrency(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 flex justify-between items-center">
          <div>
            <span className="text-xs text-slate-500 block uppercase font-bold">Total Payment</span>
            <span className="text-2xl font-black text-emerald-400">{formatCurrency(totalAmount)}</span>
          </div>

          <Button variant="primary" size="lg" onClick={handlePlaceOrder} isLoading={isSubmitting}>
            Confirm & Place Order
          </Button>
        </div>
      </div>
    </div>
  );
};
