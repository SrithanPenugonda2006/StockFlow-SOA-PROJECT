import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Boxes, ShoppingCart, User, LogOut, Package, ShoppingBag } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { totalItems } = useCart();

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <Link to="/customer/products" className="flex items-center gap-3 group">
          <div className="p-2.5 rounded-xl bg-[#111111] text-white group-hover:scale-105 transition-transform">
            <Boxes className="w-6 h-6" />
          </div>
          <div className="text-left">
            <h1 className="text-xl font-bold tracking-tight text-gray-900">StockFlow</h1>
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-900 block">Catalog Store</span>
          </div>
        </Link>

        {/* Links */}
        <div className="flex items-center gap-6 text-sm font-medium">
          <NavLink
            to="/customer/products"
            className={({ isActive }) =>
              `flex items-center gap-2 hover:text-[#111111] transition-colors ${
                isActive ? 'text-[#111111] font-bold' : 'text-gray-600'
              }`
            }
          >
            <Package className="w-4 h-4" /> Products
          </NavLink>

          <NavLink
            to="/customer/orders"
            className={({ isActive }) =>
              `flex items-center gap-2 hover:text-[#111111] transition-colors ${
                isActive ? 'text-[#111111] font-bold' : 'text-gray-600'
              }`
            }
          >
            <ShoppingBag className="w-4 h-4" /> My Orders
          </NavLink>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          <Link
            to="/customer/cart"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#111111] border border-[#D4D4D4] text-[#111111] hover:bg-[#111111]/20 transition-all relative"
          >
            <ShoppingCart className="w-4 h-4 text-[#111111]" />
            <span className="text-sm font-semibold">Cart</span>
            {totalItems > 0 && (
              <span className="ml-1 bg-[#111111] text-white text-xs font-bold px-2 py-0.5 rounded-full ">
                {totalItems}
              </span>
            )}
          </Link>

          {isAuthenticated ? (
            <div className="flex items-center gap-3 border-l border-gray-200 pl-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-white border border-gray-200 text-[#111111]">
                  <User className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-gray-800 hidden sm:inline">{user?.username}</span>
              </div>
              <button
                onClick={logout}
                className="p-2 text-gray-500 hover:text-gray-900 hover:bg-white rounded-lg transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="text-sm font-semibold text-white bg-[#111111] hover:bg-[#111111] px-4 py-2 rounded-xl  transition-all"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};
