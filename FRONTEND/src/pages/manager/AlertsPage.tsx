import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  AlertTriangle,
  Building2,
  Boxes,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  RefreshCw,
  ShoppingBag,
  ArrowRightLeft,
} from 'lucide-react';
import { inventoryApi } from '../../api/inventoryApi';
import { warehouseApi } from '../../api/warehouseApi';
import { productApi } from '../../api/productApi';
import { Pagination } from '../../components/common/Pagination';
import { LowStockItem } from '../../types/inventory';
import { Warehouse } from '../../types/warehouse';
import { Product } from '../../types/product';

export const AlertsPage: React.FC = () => {
  const navigate = useNavigate();
  const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const [lowRes, whRes, prodRes] = await Promise.all([
        inventoryApi.getLowStockInventory(),
        warehouseApi.getWarehouses(),
        productApi.getProducts({ size: 100 }),
      ]);
      setLowStockItems(lowRes || []);
      setWarehouses(whRes || []);
      setProducts(prodRes?.content || []);
    } catch (err) {
      console.error('Failed to fetch alerts feed', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  // Filter capacity warning warehouses (> 80% occupied)
  const capacityAlertWarehouses = warehouses.filter((w) => {
    const cap = w.totalCapacity || 10000;
    const occ = w.occupiedCapacity || 0;
    return (occ / cap) > 0.8;
  });

  const startIndex = (currentPage - 1) * pageSize;
  const paginatedAlertItems = lowStockItems.slice(startIndex, startIndex + pageSize);

  const criticalStockouts = lowStockItems.filter((i) => i.availableQuantity === 0).length;
  const lowStockCount = lowStockItems.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2.5">
            <Bell className="w-7 h-7 text-[#666666]" />
            Live System Alerts & Exception Monitoring
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Real-time feed for stockout risks, low inventory thresholds, and warehouse capacity warnings.
          </p>
        </div>

        <button
          onClick={fetchAlerts}
          className="p-2.5 rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors w-fit"
          title="Refresh Alerts"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Summary KPI Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-gray-100 border border-gray-800 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-900 uppercase tracking-wider">Critical Stockouts</span>
            <ShieldAlert className="w-4 h-4 text-gray-900" />
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">{criticalStockouts}</p>
        </div>

        <div className="p-4 rounded-2xl bg-gray-100 border border-gray-600 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Low Stock Warnings</span>
            <AlertTriangle className="w-4 h-4 text-gray-700" />
          </div>
          <p className="text-2xl font-bold text-gray-700 mt-2">{lowStockCount}</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#F5F5F5] border border-[#E5E5E5] backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#666666] uppercase tracking-wider">Warehouse Capacity Alerts</span>
            <Building2 className="w-4 h-4 text-[#666666]" />
          </div>
          <p className="text-2xl font-bold text-[#666666] mt-2">{capacityAlertWarehouses.length}</p>
        </div>
      </div>

      {/* Alert Feeds */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-gray-700" />
          Active Exceptions & Action Required
        </h2>

        {loading ? (
          <div className="p-12 text-center text-gray-500 bg-white/60 rounded-2xl border border-gray-200">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#666666] mb-2" />
            Loading system alerts...
          </div>
        ) : lowStockItems.length === 0 && capacityAlertWarehouses.length === 0 ? (
          <div className="p-12 text-center text-gray-400 bg-white/60 rounded-2xl border border-gray-200">
            <CheckCircle2 className="w-10 h-10 mx-auto text-gray-900 mb-3" />
            <p className="font-semibold text-gray-600">All Systems Operational</p>
            <p className="text-xs text-gray-400 mt-1">No low stock thresholds or warehouse capacity exceptions detected.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Warehouse Capacity Warnings */}
            {capacityAlertWarehouses.map((w) => {
              const cap = w.totalCapacity || 10000;
              const occ = w.occupiedCapacity || 0;
              const pct = Math.round((occ / cap) * 100);

              return (
                <div
                  key={`wh-${w.id}`}
                  className="p-4 rounded-2xl bg-white/80 border border-[#D4D4D4]/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-[#111111]/10 text-[#666666] border border-[#D4D4D4]/20 shrink-0">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 text-base">{w.name} ({w.code})</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#111111]/20 text-[#111111]">
                          HIGH OCCUPANCY
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Storage capacity is at <strong className="text-[#111111]">{pct}%</strong> ({occ.toLocaleString()} / {cap.toLocaleString()} units). Consider initiating an inter-warehouse stock transfer.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate('/transfers')}
                    className="px-4 py-2 rounded-xl bg-[#111111] hover:bg-[#111111] text-white text-xs font-semibold transition-all flex items-center justify-center gap-2 shrink-0"
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5" />
                    Transfer Stock
                  </button>
                </div>
              );
            })}

            {/* Low Stock Items */}
            {paginatedAlertItems.map((item) => {
              const prod = products.find((p) => p.id === item.productId);
              const wh = warehouses.find((w) => w.id === item.warehouseId);
              const isZero = item.availableQuantity === 0;

              return (
                <div
                  key={`item-${item.id}`}
                  className={`p-4 rounded-2xl bg-white/80 border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${
                    isZero ? 'border-gray-900/40' : 'border-gray-700/30'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2.5 rounded-xl shrink-0 ${
                        isZero
                          ? 'bg-gray-900/10 text-gray-900 border border-gray-900/20'
                          : 'bg-gray-700/10 text-gray-700 border border-gray-700/20'
                      }`}
                    >
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 text-base">
                          {prod?.name || `Product #${item.productId}`}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            isZero ? 'bg-gray-900/20 text-gray-900' : 'bg-gray-700/20 text-gray-700'
                          }`}
                        >
                          {isZero ? 'STOCKOUT' : 'LOW STOCK'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Location: <strong className="text-gray-800">{wh?.name || item.warehouseName || `Warehouse #${item.warehouseId}`}</strong> | Available:{' '}
                        <strong className={isZero ? 'text-gray-900' : 'text-gray-700'}>
                          {item.availableQuantity} units
                        </strong>{' '}
                        (Safety threshold: {item.threshold || 10} units).
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate('/procurement')}
                    className="px-4 py-2 rounded-xl bg-[#111111] hover:bg-[#2A2A2A] text-white text-xs font-semibold transition-all flex items-center justify-center gap-2 shrink-0"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    Create Purchase Order
                  </button>
                </div>
              );
            })}
            <div className="mt-4 p-4 bg-white border border-gray-200 rounded-2xl shadow-xs">
              <Pagination
                totalItems={lowStockItems.length}
                currentPage={currentPage}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
