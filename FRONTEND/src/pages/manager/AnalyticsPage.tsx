import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Building2,
  PieChart,
  Boxes,
  IndianRupee,
  RefreshCw,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import { warehouseApi } from '../../api/warehouseApi';
import { inventoryApi } from '../../api/inventoryApi';
import { productApi } from '../../api/productApi';
import { Warehouse } from '../../types/warehouse';
import { SmartInventory } from '../../types/inventory';
import { Product } from '../../types/product';

export const AnalyticsPage: React.FC = () => {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [smartItems, setSmartItems] = useState<SmartInventory[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      const [whRes, smartRes, prodRes] = await Promise.all([
        warehouseApi.getWarehouses(),
        inventoryApi.getSmartInventory(),
        productApi.getProducts({ size: 100 }),
      ]);
      setWarehouses(whRes || []);
      setSmartItems(smartRes || []);
      setProducts(prodRes?.content || []);
    } catch (err) {
      console.error('Failed to load analytics data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const totalValuation = smartItems.reduce((sum, i) => sum + (i.inventoryValue || 0), 0);
  const totalCapacity = warehouses.reduce((sum, w) => sum + (w.totalCapacity || 0), 0);
  const totalOccupied = warehouses.reduce((sum, w) => sum + (w.occupiedCapacity || 0), 0);
  const overallOccupancyPct = totalCapacity > 0 ? Math.round((totalOccupied / totalCapacity) * 100) : 0;

  // Category breakdown calculation
  const categoryMap: { [cat: string]: { count: number; value: number } } = {};
  products.forEach((p) => {
    const cat = p.category || 'Uncategorized';
    if (!categoryMap[cat]) categoryMap[cat] = { count: 0, value: 0 };
    categoryMap[cat].count += 1;
    const smart = smartItems.find((s) => s.productId === p.id);
    categoryMap[cat].value += smart?.inventoryValue || (p.price || 0) * (smart?.currentStock || 0);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2.5">
            <BarChart3 className="w-7 h-7 text-[#666666]" />
            StockFlow Valuation & Analytics
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Real-time multi-warehouse inventory valuation, capacity utilization, and category distribution.
          </p>
        </div>

        <button
          onClick={fetchAnalyticsData}
          className="p-2.5 rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors w-fit"
          title="Refresh Analytics"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white/60 border border-gray-200 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Inventory Value</span>
            <div className="p-2 rounded-xl bg-gray-900/10 text-gray-900 border border-gray-900/20">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            ₹{totalValuation.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white/60 border border-gray-200 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Overall Capacity Usage</span>
            <div className="p-2 rounded-xl bg-[#111111]/10 text-[#666666] border border-[#D4D4D4]/20">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">{overallOccupancyPct}%</p>
          <span className="text-xs text-gray-500 mt-1 block">
            {totalOccupied.toLocaleString()} / {totalCapacity.toLocaleString()} units
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white/60 border border-gray-200 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Warehouses</span>
            <div className="p-2 rounded-xl bg-[#111111]/10 text-[#666666] border border-[#D4D4D4]/20">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">{warehouses.length}</p>
        </div>

        <div className="p-4 rounded-2xl bg-white/60 border border-gray-200 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Catalog SKUs</span>
            <div className="p-2 rounded-xl bg-[#111111]/10 text-[#666666] border border-[#D4D4D4]/20">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">{products.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Warehouse Capacity Utilization */}
        <div className="p-6 rounded-2xl bg-white/60 border border-gray-200 backdrop-blur-sm space-y-4">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#666666]" />
            Warehouse Capacity Utilization
          </h2>

          <div className="space-y-4 pt-2">
            {warehouses.map((w) => {
              const cap = w.totalCapacity || 10000;
              const occ = w.occupiedCapacity || 0;
              const pct = Math.min(100, Math.round((occ / cap) * 100));

              return (
                <div key={w.id} className="space-y-1.5 p-3 rounded-xl bg-[#F7F8FA]/60 border border-gray-200">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-gray-900">{w.name} ({w.code})</span>
                    <span className="font-mono text-[#666666] font-semibold">{pct}% Occupied</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2.5 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        pct > 85 ? 'bg-gray-900' : pct > 65 ? 'bg-gray-700' : 'bg-gray-900'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-gray-500">
                    <span>Occupied: {occ.toLocaleString()} units</span>
                    <span>Total Limit: {cap.toLocaleString()} units</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="p-6 rounded-2xl bg-white/60 border border-gray-200 backdrop-blur-sm space-y-4">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-[#666666]" />
            Inventory Value by Product Category
          </h2>

          <div className="space-y-3 pt-2">
            {Object.entries(categoryMap).map(([catName, data]) => {
              const pct = totalValuation > 0 ? Math.round((data.value / totalValuation) * 100) : 0;

              return (
                <div key={catName} className="p-3.5 rounded-xl bg-[#F7F8FA]/60 border border-gray-200 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-gray-800 text-sm block">{catName}</span>
                    <span className="text-xs text-gray-500">{data.count} SKU Types</span>
                  </div>

                  <div className="text-right">
                    <span className="font-bold text-gray-900 text-sm block">
                      ₹{data.value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-[10px] text-[#666666] font-mono">{pct}% of Total Portfolio</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
