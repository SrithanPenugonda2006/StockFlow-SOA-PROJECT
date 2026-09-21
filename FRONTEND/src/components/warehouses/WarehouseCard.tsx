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
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl hover:border-slate-700 transition-all duration-300 flex flex-col justify-between text-left group">
      <div>
        <div className="flex items-start justify-between mb-4">
          <div className="p-3.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl group-hover:scale-105 transition-transform">
            <Building2 className="w-7 h-7" />
          </div>
          <span className="text-xs font-mono text-slate-500 font-semibold">ID: #{warehouse.id}</span>
        </div>

        <h3 className="text-lg font-bold text-slate-100 group-hover:text-indigo-400 transition-colors">
          {warehouse.name}
        </h3>

        <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-2">
          <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span>{warehouse.location}</span>
        </div>

        {warehouse.capacity && (
          <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs">
            <span className="text-slate-400">Storage Capacity</span>
            <span className="font-bold text-slate-200">{warehouse.capacity.toLocaleString()} Units</span>
          </div>
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
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
              className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-lg transition-colors"
              title="Edit Warehouse"
            >
              <Edit className="w-4 h-4" />
            </button>
          )}

          {isAdmin && onDelete && (
            <button
              onClick={() => onDelete(warehouse)}
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
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
