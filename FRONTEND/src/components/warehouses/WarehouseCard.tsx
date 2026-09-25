import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, MapPin, Boxes, Edit, Trash2, ArrowRight } from 'lucide-react';
import { Warehouse } from '../../types/warehouse';
import { Button } from '../common/Button';
import { StorageCapacityCard } from './StorageCapacityCard';

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
  const navigate = useNavigate();

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-300 flex flex-col justify-between text-left group">
      <div>
        <div className="flex items-start justify-between mb-4">
          <div 
            onClick={() => navigate(`/warehouses/${warehouse.id}`)}
            className="p-3.5 bg-[#F5F5F5] border border-[#E5E5E5] text-[#262626] rounded-xl group-hover:scale-105 cursor-pointer transition-transform"
          >
            <Building2 className="w-6 h-6" />
          </div>
          <span className="text-xs font-mono text-gray-400 font-semibold">ID: #{warehouse.id}</span>
        </div>

        <h3 
          onClick={() => navigate(`/warehouses/${warehouse.id}`)}
          className="text-lg font-bold text-gray-900 group-hover:text-black cursor-pointer transition-colors flex items-center justify-between"
        >
          <span>{warehouse.name}</span>
          <ArrowRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
        </h3>

        <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1 mb-4">
          <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <span>{warehouse.location}</span>
        </div>

        {/* Compact Storage Capacity Progress Section */}
        <div className="pt-3 border-t border-gray-200/60">
          <StorageCapacityCard
            variant="compact"
            totalCapacity={warehouse.totalCapacity ?? warehouse.capacity}
            usedCapacity={warehouse.occupiedCapacity ?? warehouse.usedCapacity}
          />
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate(`/warehouses/${warehouse.id}`)}
          >
            Details
          </Button>

          {onViewInventory && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewInventory(warehouse)}
              leftIcon={<Boxes className="w-3.5 h-3.5" />}
            >
              Stock
            </Button>
          )}
        </div>

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
