import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Boxes, ShoppingCart, User, LogOut, Package, ShoppingBag } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { totalItems } = useCart();

  return (
    <nav className="bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-40 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <Link to="/customer/products" className="flex items-center gap-3 group">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 shadow-lg shadow-indigo-600/30 text-white group-hover:scale-105 transition-transform">
            <Boxes className="w-6 h-6" />
          </div>
          <div className="text-left">
            <h1 className="text-xl font-black tracking-tight text-white">StockFlow</h1>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">Catalog Store</span>
          </div>
        </Link>

        {/* Links */}
        <div className="flex items-center gap-6 text-sm font-medium">
          <NavLink
            to="/customer/products"
            className={({ isActive }) =>
              `flex items-center gap-2 hover:text-indigo-400 transition-colors ${
                isActive ? 'text-indigo-400 font-bold' : 'text-slate-300'
              }`
            }
          >
            <Package className="w-4 h-4" /> Products
          </NavLink>

          <NavLink
            to="/customer/orders"
            className={({ isActive }) =>
              `flex items-center gap-2 hover:text-indigo-400 transition-colors ${
                isActive ? 'text-indigo-400 font-bold' : 'text-slate-300'
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
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600/10 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-600/20 transition-all relative"
          >
            <ShoppingCart className="w-4 h-4 text-indigo-400" />
            <span className="text-sm font-semibold">Cart</span>
            {totalItems > 0 && (
              <span className="ml-1 bg-indigo-600 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-md shadow-indigo-600/40">
                {totalItems}
              </span>
            )}
          </Link>

          {isAuthenticated ? (
            <div className="flex items-center gap-3 border-l border-slate-800 pl-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-indigo-400">
                  <User className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-200 hidden sm:inline">{user?.username}</span>
              </div>
              <button
                onClick={logout}
                className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-900 rounded-lg transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-xl shadow-lg shadow-indigo-600/30 transition-all"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};
