import React from 'react';
import { Filter, Calendar, Building2, Package, RefreshCw } from 'lucide-react';
import { Warehouse } from '../../types/warehouse';
import { Product } from '../../types/product';

interface DashboardFiltersProps {
  warehouses: Warehouse[];
  products: Product[];
  selectedWarehouseId: string;
  selectedProductId: string;
  timeRange: string;
  onWarehouseChange: (id: string) => void;
  onProductChange: (id: string) => void;
  onTimeRangeChange: (range: string) => void;
  onReset: () => void;
  isFiltered: boolean;
}

export const DashboardFilters: React.FC<DashboardFiltersProps> = ({
  warehouses,
  products,
  selectedWarehouseId,
  selectedProductId,
  timeRange,
  onWarehouseChange,
  onProductChange,
  onTimeRangeChange,
  onReset,
  isFiltered,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-2 text-slate-300 font-semibold text-sm">
        <Filter className="w-4 h-4 text-indigo-400" />
        <span>Analytics Controls</span>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {/* Warehouse Filter */}
        <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/60 rounded-lg px-3 py-1.5 text-xs">
          <Building2 className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={selectedWarehouseId}
            onChange={(e) => onWarehouseChange(e.target.value)}
            className="bg-transparent text-slate-200 focus:outline-none cursor-pointer pr-1"
          >
            <option value="ALL" className="bg-slate-900 text-slate-200">
              All Warehouses
            </option>
            {warehouses.map((w) => (
              <option key={w.id} value={w.id.toString()} className="bg-slate-900 text-slate-200">
                {w.name}
              </option>
            ))}
          </select>
        </div>

        {/* Product Filter */}
        <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/60 rounded-lg px-3 py-1.5 text-xs">
          <Package className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={selectedProductId}
            onChange={(e) => onProductChange(e.target.value)}
            className="bg-transparent text-slate-200 focus:outline-none cursor-pointer pr-1 max-w-[180px] truncate"
          >
            <option value="ALL" className="bg-slate-900 text-slate-200">
              All Products
            </option>
            {products.map((p) => (
              <option key={p.id} value={p.id.toString()} className="bg-slate-900 text-slate-200">
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Time Range Filter */}
        <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/60 rounded-lg px-3 py-1.5 text-xs">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={timeRange}
            onChange={(e) => onTimeRangeChange(e.target.value)}
            className="bg-transparent text-slate-200 focus:outline-none cursor-pointer pr-1"
          >
            <option value="7D" className="bg-slate-900 text-slate-200">
              Last 7 Days
            </option>
            <option value="30D" className="bg-slate-900 text-slate-200">
              Last 30 Days
            </option>
            <option value="90D" className="bg-slate-900 text-slate-200">
              Last 90 Days
            </option>
          </select>
        </div>

        {/* Reset Filter Button */}
        {isFiltered && (
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition-colors px-2 py-1"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Reset Filters</span>
          </button>
        )}
      </div>
    </div>
  );
};
