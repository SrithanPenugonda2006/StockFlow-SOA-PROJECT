import { PageHeader } from "../../components/common/PageHeader";
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, RefreshCw } from 'lucide-react';
import { Warehouse, WarehouseCreateDTO } from '../../types/warehouse';
import { warehouseApi } from '../../api/warehouseApi';
import { WarehouseCard } from '../../components/warehouses/WarehouseCard';
import { WarehouseFormModal } from '../../components/warehouses/WarehouseFormModal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { extractErrorMessage } from '../../utils/formatters';

export const WarehousesPage: React.FC = () => {
  const navigate = useNavigate();
  const { role } = useAuth();
  const { showToast } = useToast();
  const isAdmin = role === 'ADMIN';

  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);
  const [warehouseToDelete, setWarehouseToDelete] = useState<Warehouse | null>(null);

  const fetchWarehouses = async () => {
    setIsLoading(true);
    try {
      const list = await warehouseApi.getWarehouses();
      setWarehouses(list || []);
    } catch (err) {
      showToast('error', 'Error Loading Warehouses', 'Unable to fetch warehouse list.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const handleSaveWarehouse = async (data: WarehouseCreateDTO) => {
    try {
      if (selectedWarehouse) {
        await warehouseApi.updateWarehouse(selectedWarehouse.id, data);
        showToast('success', 'Warehouse Updated', `${data.name} updated successfully.`);
      } else {
        await warehouseApi.createWarehouse(data);
        showToast('success', 'Warehouse Created', `${data.name} created successfully.`);
      }
      fetchWarehouses();
    } catch (err: any) {
      showToast('error', 'Save Error', extractErrorMessage(err));
    }
  };

  const handleDeleteWarehouse = async () => {
    if (!warehouseToDelete) return;
    try {
      await warehouseApi.deleteWarehouse(warehouseToDelete.id);
      showToast('success', 'Warehouse Deleted', `${warehouseToDelete.name} deleted.`);
      setWarehouseToDelete(null);
      fetchWarehouses();
    } catch (err: any) {
      showToast('error', 'Delete Error', extractErrorMessage(err));
    }
  };

  return (
    <div className="flex flex-col gap-6 text-left">
      <PageHeader
        title="Physical Warehouses Control"
        subtitle="Manage fulfillment centers, locations, and capacity."
        actions={
          <>
            <Button variant="ghost" onClick={fetchWarehouses} leftIcon={<RefreshCw className="w-4 h-4" />}>
              Refresh
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setSelectedWarehouse(null);
                setIsModalOpen(true);
              }}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Create Warehouse
            </Button>
          </>
        }
      />

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-56 bg-slate-900 border border-slate-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : warehouses.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {warehouses.map((wh) => (
            <WarehouseCard
              key={wh.id}
              warehouse={wh}
              isAdmin={isAdmin}
              onViewInventory={(w) => navigate(`/inventory?warehouseId=${w.id}`)}
              onEdit={(w) => {
                setSelectedWarehouse(w);
                setIsModalOpen(true);
              }}
              onDelete={(w) => setWarehouseToDelete(w)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
          No physical warehouses registered yet.
        </div>
      )}

      <WarehouseFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSaveWarehouse}
        warehouse={selectedWarehouse}
      />

      <ConfirmDialog
        isOpen={!!warehouseToDelete}
        onClose={() => setWarehouseToDelete(null)}
        onConfirm={handleDeleteWarehouse}
        title="Delete Warehouse Facility"
        message={`Are you sure you want to delete warehouse "${warehouseToDelete?.name}"?`}
      />
    </div>
  );
};
