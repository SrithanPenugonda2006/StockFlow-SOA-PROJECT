import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  AlertTriangle,
  TrendingUp,
  Package,
  Boxes,
  RefreshCw,
  ShoppingBag,
  CheckCircle2,
  AlertCircle,
  Archive,
  ArrowUpRight,
  ShieldAlert,
} from 'lucide-react';
import { Pagination } from '../../components/common/Pagination';
import { inventoryApi } from '../../api/inventoryApi';
import { SmartInventory } from '../../types/inventory';

export const SmartInventoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [smartItems, setSmartItems] = useState<SmartInventory[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;
  const [activeTab, setActiveTab] = useState<'ALL' | 'REORDER' | 'OVERSTOCK' | 'DEAD_STOCK'>('ALL');

  const fetchSmartInventory = async () => {
    setLoading(true);
    try {
      const data = await inventoryApi.getSmartInventory();
      setSmartItems(data || []);
    } catch (err: any) {
      console.error('Failed to fetch smart inventory analytics', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSmartInventory();
  }, []);

  const reorderCount = smartItems.filter((i) => i.isReorderNeeded).length;
  const overstockCount = smartItems.filter((i) => i.isOverstock).length;
  const deadStockCount = smartItems.filter((i) => i.isDeadStock).length;
  const totalValuation = smartItems.reduce((sum, i) => sum + (i.inventoryValue || 0), 0);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  const filteredItems = smartItems.filter((i) => {
    if (activeTab === 'REORDER') return i.isReorderNeeded;
    if (activeTab === 'OVERSTOCK') return i.isOverstock;
    if (activeTab === 'DEAD_STOCK') return i.isDeadStock;
    return true;
  });

  const startIndex = (currentPage - 1) * pageSize;
  const paginatedItems = filteredItems.slice(startIndex, startIndex + pageSize);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2.5">
            <Sparkles className="w-7 h-7 text-[#666666]" />
            Smart Inventory Analytics & Reorder Intelligence
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Predictive stock level optimization, automatic reorder recommendations, and dead-stock identification.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchSmartInventory}
            className="p-2.5 rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-white hover:bg-gray-100 transition-colors"
            title="Recalculate Metrics"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => navigate('/procurement')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#111111] hover:bg-[#2A2A2A] text-white font-semibold text-sm transition-all"
          >
            <ShoppingBag className="w-4 h-4" />
            Go to Procurement
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => setActiveTab('REORDER')}
          className={`p-4 rounded-2xl cursor-pointer transition-all border ${
            activeTab === 'REORDER'
              ? 'bg-gray-700/10 border-gray-700/40 shadow-lg shadow-gray-700/10'
              : 'bg-white/60 border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Reorder Alerts</span>
            <div className="p-2 rounded-xl bg-gray-700/10 text-gray-700 border border-gray-700/20">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-700 mt-2">{reorderCount}</p>
          <span className="text-[11px] text-gray-400 mt-1 block">Below safety reorder threshold</span>
        </div>

        <div
          onClick={() => setActiveTab('OVERSTOCK')}
          className={`p-4 rounded-2xl cursor-pointer transition-all border ${
            activeTab === 'OVERSTOCK'
              ? 'bg-[#111111]/10 border-[#D4D4D4]/40 500/10'
              : 'bg-white/60 border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Overstocked SKUs</span>
            <div className="p-2 rounded-xl bg-[#111111]/10 text-[#666666] border border-[#D4D4D4]/20">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#666666] mt-2">{overstockCount}</p>
          <span className="text-[11px] text-gray-400 mt-1 block">Capital locked in excess stock</span>
        </div>

        <div
          onClick={() => setActiveTab('DEAD_STOCK')}
          className={`p-4 rounded-2xl cursor-pointer transition-all border ${
            activeTab === 'DEAD_STOCK'
              ? 'bg-gray-900/10 border-gray-900/40 shadow-lg shadow-gray-900/10'
              : 'bg-white/60 border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Dead Stock Risk</span>
            <div className="p-2 rounded-xl bg-gray-900/10 text-gray-900 border border-gray-900/20">
              <Archive className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">{deadStockCount}</p>
          <span className="text-[11px] text-gray-400 mt-1 block">Zero movement over 90 days</span>
        </div>

        <div className="p-4 rounded-2xl bg-white/60 border border-gray-200 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Inventory Value</span>
            <div className="p-2 rounded-xl bg-gray-900/10 text-gray-900 border border-gray-900/20">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            ₹{totalValuation.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <span className="text-[11px] text-gray-400 mt-1 block">Across all active catalog SKUs</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white/80 border border-gray-200 w-fit">
        {[
          { id: 'ALL', label: `All Items (${smartItems.length})` },
          { id: 'REORDER', label: `Reorder Needed (${reorderCount})` },
          { id: 'OVERSTOCK', label: `Overstock (${overstockCount})` },
          { id: 'DEAD_STOCK', label: `Dead Stock (${deadStockCount})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === tab.id
                ? 'bg-[#111111] text-white '
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Analytics Table */}
      <div className="rounded-2xl bg-white/60 border border-gray-200 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-[#F7F8FA]/80 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">Product Name</th>
                <th className="px-6 py-4">Current Stock</th>
                <th className="px-6 py-4">Safety Stock</th>
                <th className="px-6 py-4">Reorder Point</th>
                <th className="px-6 py-4">Recommended Order</th>
                <th className="px-6 py-4">Valuation</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#666666] mb-2" />
                    Computing smart inventory parameters...
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                    <Sparkles className="w-10 h-10 mx-auto text-slate-600 mb-3" />
                    <p className="font-semibold text-gray-500">No Items Found</p>
                    <p className="text-xs text-gray-400 mt-1">All catalog items are performing within optimal safety margins.</p>
                  </td>
                </tr>
              ) : (
                paginatedItems.map((item) => (
                  <tr key={item.productId} className="hover:bg-gray-100/40 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <span className="font-bold text-white block">{item.productName || `Product #${item.productId}`}</span>
                        <span className="text-xs text-[#666666] font-mono">{item.sku}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-bold ${item.currentStock <= item.reorderPoint ? 'text-gray-700' : 'text-gray-800'}`}>
                        {item.currentStock} units
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{item.safetyStock} units</td>
                    <td className="px-6 py-4 text-gray-500">{item.reorderPoint} units</td>
                    <td className="px-6 py-4">
                      {item.isReorderNeeded ? (
                        <span className="font-bold text-gray-700 flex items-center gap-1">
                          +{item.recommendedReorderQty} units
                        </span>
                      ) : (
                        <span className="text-gray-400">0</span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      ₹{item.inventoryValue ? item.inventoryValue.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '0.00'}
                    </td>
                    <td className="px-6 py-4">
                      {item.isReorderNeeded ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-700/10 text-gray-700 border border-gray-700/20">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Reorder Needed
                        </span>
                      ) : item.isOverstock ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#111111]/10 text-[#666666] border border-[#D4D4D4]/20">
                          <Boxes className="w-3.5 h-3.5" />
                          Overstocked
                        </span>
                      ) : item.isDeadStock ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-900/10 text-gray-900 border border-gray-900/20">
                          <Archive className="w-3.5 h-3.5" />
                          Dead Stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-900/10 text-gray-900 border border-gray-900/20">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Optimal
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-gray-200 bg-gray-50/50">
          <Pagination
            totalItems={filteredItems.length}
            currentPage={currentPage}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </div>
  );
};
