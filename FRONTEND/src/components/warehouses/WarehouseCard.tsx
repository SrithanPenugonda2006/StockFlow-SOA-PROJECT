import React from 'react';
import { Building2, MapPin, Boxes, Edit, Trash2 } from 'lucide-react';
import { Warehouse } from '../../types/warehouse';
import { Button } from '../common/Button';

interface WarehouseCardProps {
  warehouse: Warehouse;
  onViewInventory?: (warehouse: Warehouse) => void;
  onEdit?: (warehouse: Warehouse) => void;
  onDelete?: (warehouse: Warehouse) => void;
  isAdmin?: boolean;
}

export const WarehouseCard: React.FC<WarehouseCardProps> = ({
  warehouse,
  onViewInventory,
  onEdit,
  onDelete,
  isAdmin = false,
}) => {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xl hover:border-gray-300 transition-all duration-300 flex flex-col justify-between text-left group">
      <div>
        <div className="flex items-start justify-between mb-4">
          <div className="p-3.5 bg-[#F5F5F5] border border-[#E5E5E5] text-[#666666] rounded-xl group-hover:scale-105 transition-transform">
            <Building2 className="w-7 h-7" />
          </div>
          <span className="text-xs font-mono text-gray-400 font-semibold">ID: #{warehouse.id}</span>
        </div>

        <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#666666] transition-colors">
          {warehouse.name}
        </h3>

        <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-2">
          <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <span>{warehouse.location}</span>
        </div>

        {warehouse.capacity && (
          <div className="mt-4 pt-3 border-t border-gray-200/60 flex items-center justify-between text-xs">
            <span className="text-gray-500">Storage Capacity</span>
            <span className="font-bold text-gray-800">{warehouse.capacity.toLocaleString()} Units</span>
          </div>
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200 flex items-center justify-between">
        {onViewInventory && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onViewInventory(warehouse)}
            leftIcon={<Boxes className="w-4 h-4" />}
          >
            View Inventory
          </Button>
        )}

        <div className="flex items-center gap-1">
          {onEdit && (
            <button
              onClick={() => onEdit(warehouse)}
              className="p-2 text-gray-500 hover:text-[#666666] hover:bg-gray-100 rounded-lg transition-colors"
              title="Edit Warehouse"
            >
              <Edit className="w-4 h-4" />
            </button>
          )}

          {isAdmin && onDelete && (
            <button
              onClick={() => onDelete(warehouse)}
              className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              title="Delete Warehouse"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
