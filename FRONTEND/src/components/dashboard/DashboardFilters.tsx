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
    <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-xs">
      <div className="flex items-center gap-2 text-gray-900 font-bold text-sm">
        <Filter className="w-4 h-4 text-[#111111]" />
        <span>Analytics Controls</span>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {/* Warehouse Filter */}
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs">
          <Building2 className="w-3.5 h-3.5 text-gray-400" />
          <select
            value={selectedWarehouseId}
            onChange={(e) => onWarehouseChange(e.target.value)}
            className="bg-transparent text-gray-900 font-semibold focus:outline-none cursor-pointer pr-1"
          >
            <option value="ALL" className="bg-white text-gray-900">
              All Warehouses
            </option>
            {warehouses.map((w) => (
              <option key={w.id} value={w.id.toString()} className="bg-white text-gray-900">
                {w.name}
              </option>
            ))}
          </select>
        </div>

        {/* Product Filter */}
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs">
          <Package className="w-3.5 h-3.5 text-gray-400" />
          <select
            value={selectedProductId}
            onChange={(e) => onProductChange(e.target.value)}
            className="bg-transparent text-gray-900 font-semibold focus:outline-none cursor-pointer pr-1 max-w-[180px] truncate"
          >
            <option value="ALL" className="bg-white text-gray-900">
              All Products
            </option>
            {products.map((p) => (
              <option key={p.id} value={p.id.toString()} className="bg-white text-gray-900">
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Time Range Filter */}
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs">
          <Calendar className="w-3.5 h-3.5 text-gray-400" />
          <select
            value={timeRange}
            onChange={(e) => onTimeRangeChange(e.target.value)}
            className="bg-transparent text-gray-900 font-semibold focus:outline-none cursor-pointer pr-1"
          >
            <option value="7D" className="bg-white text-gray-900">
              Last 7 Days
            </option>
            <option value="30D" className="bg-white text-gray-900">
              Last 30 Days
            </option>
            <option value="90D" className="bg-white text-gray-900">
              Last 90 Days
            </option>
          </select>
        </div>

        {/* Reset Filter Button */}
        {isFiltered && (
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#111111] hover:text-[#111111] transition-colors px-2 py-1 cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Reset Filters</span>
          </button>
        )}
      </div>
    </div>
  );
};
