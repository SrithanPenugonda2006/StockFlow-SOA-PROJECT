import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Trash2, ArrowRight, ArrowLeft } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { Button } from '../../components/common/Button';
import { formatCurrency } from '../../utils/formatters';

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { cart, removeFromCart, updateQuantity, clearCart, totalAmount } = useCart();

  if (cart.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center max-w-md mx-auto my-12 flex flex-col items-center">
        <div className="p-4 bg-[#F5F5F5] border border-[#E5E5E5] text-[#666666] rounded-2xl mb-4">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Your Shopping Cart is Empty</h2>
        <p className="text-xs text-gray-500 mt-2">Explore our catalog to add items for fulfillment.</p>
        <Button onClick={() => navigate('/customer/products')} className="mt-6">
          Browse Product Catalog
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 text-left max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Shopping Cart</h1>
        <button
          onClick={clearCart}
          className="text-xs text-gray-900 hover:text-gray-900 font-semibold transition-colors"
        >
          Clear Entire Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-3xl p-6 shadow-2xl divide-y divide-gray-100">
          {cart.map((item) => (
            <div key={item.productId} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
              <div>
                <h4 className="font-bold text-gray-900 text-sm">{item.name}</h4>
                <span className="text-xs text-gray-500 font-mono">SKU: {item.sku}</span>
                <span className="text-xs text-gray-900 font-bold block mt-1">{formatCurrency(item.price)}</span>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center bg-[#F7F8FA] rounded-xl border border-gray-200 p-1">
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                    className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-white font-bold"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-xs font-bold text-gray-800">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-white font-bold"
                  >
                    +
                  </button>
                </div>

                <span className="font-bold text-gray-900 text-sm min-w-[80px] text-right">
                  {formatCurrency(item.price * item.quantity)}
                </span>

                <button
                  onClick={() => removeFromCart(item.productId)}
                  className="p-2 text-gray-400 hover:text-gray-900 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Cart Summary */}
        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-2xl flex flex-col justify-between h-fit">
          <div>
            <h3 className="text-base font-bold text-gray-900 pb-3 border-b border-gray-200">Order Summary</h3>
            <div className="py-4 flex justify-between text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span className="font-bold text-gray-800">{formatCurrency(totalAmount)}</span>
            </div>
            <div className="py-2 flex justify-between text-sm border-t border-gray-200">
              <span className="text-gray-500">Fulfillment Fee</span>
              <span className="text-xs font-bold text-gray-900">FREE</span>
            </div>
            <div className="pt-4 border-t border-gray-200 flex justify-between text-base">
              <span className="font-bold text-gray-900">Total Payable</span>
              <span className="font-black text-gray-900">{formatCurrency(totalAmount)}</span>
            </div>
          </div>

          <Button
            variant="primary"
            size="lg"
            onClick={() => navigate('/customer/checkout')}
            className="mt-6 w-full"
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Proceed to Checkout
          </Button>
        </div>
      </div>
    </div>
  );
};
