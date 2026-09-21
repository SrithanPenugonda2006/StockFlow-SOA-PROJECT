import { PageHeader } from "../../components/common/PageHeader";
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, RefreshCw } from 'lucide-react';
import { Inventory, InventoryCreateDTO, ReconciliationRequest } from '../../types/inventory';
import { Product } from '../../types/product';
import { Warehouse } from '../../types/warehouse';
import { inventoryApi } from '../../api/inventoryApi';
import { productApi } from '../../api/productApi';
import { warehouseApi } from '../../api/warehouseApi';
import { InventoryTable } from '../../components/inventory/InventoryTable';
import { StockUpdateModal } from '../../components/inventory/StockUpdateModal';
import { ReconciliationFormModal } from '../../components/inventory/ReconciliationFormModal';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Button } from '../../components/common/Button';
import { useToast } from '../../context/ToastContext';

export const InventoryPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();

  const [inventoryItems, setInventoryItems] = useState<Inventory[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);

  const [productMap, setProductMap] = useState<Record<number, { name: string; sku: string }>>({});
  const [warehouseMap, setWarehouseMap] = useState<Record<number, { name: string }>>({});
  const [isLoading, setIsLoading] = useState(true);

  const [selectedItemForUpdate, setSelectedItemForUpdate] = useState<Inventory | null>(null);
  const [selectedItemForReconcile, setSelectedItemForReconcile] = useState<Inventory | null>(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newProductId, setNewProductId] = useState<number>(0);
  const [newWarehouseId, setNewWarehouseId] = useState<number>(0);
  const [newQuantity, setNewQuantity] = useState<number>(100);

  const filterWarehouseId = searchParams.get('warehouseId');

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      const prodsRes = await productApi.getProducts({ page: 0, size: 100 });
      const prods = prodsRes.content || [];
      setProducts(prods);

      const pMap: Record<number, { name: string; sku: string }> = {};
      prods.forEach((p) => {
        pMap[p.id] = { name: p.name, sku: p.sku };
      });
      setProductMap(pMap);

      const whs = await warehouseApi.getWarehouses();
      setWarehouses(whs || []);

      const wMap: Record<number, { name: string }> = {};
      (whs || []).forEach((w) => {
        wMap[w.id] = { name: w.name };
      });
      setWarehouseMap(wMap);

      let invs: Inventory[] = [];
      if (filterWarehouseId) {
        invs = await inventoryApi.getInventoryByWarehouse(Number(filterWarehouseId));
      } else if (whs && whs.length > 0) {
        const invResults = await Promise.all(
          whs.map((w) => inventoryApi.getInventoryByWarehouse(w.id))
        );
        invs = invResults.flat();
      }
      const validInvs = (invs || []).filter((item) => !!pMap[item.productId]);
      setInventoryItems(validInvs);
    } catch (err) {
      console.error('Error fetching inventory:', err);
      showToast('error', 'Error Loading Ledger', 'Unable to fetch inventory records.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [filterWarehouseId]);

  const handleStockUpdate = async (dto: InventoryCreateDTO) => {
    try {
      if (selectedItemForUpdate) {
        await inventoryApi.updateInventory(selectedItemForUpdate.id, dto);
        showToast('success', 'Stock Level Saved', 'Inventory quantity updated successfully.');
        fetchAllData();
      }
    } catch (err) {
      showToast('error', 'Update Failed', 'Failed to update stock level.');
    }
  };

  const handleReconcile = async (request: ReconciliationRequest) => {
    try {
      await inventoryApi.reconcileInventory(request);
      showToast('success', 'Stock Reconciled', 'Physical audit adjustment logged.');
      fetchAllData();
    } catch (err) {
      showToast('error', 'Audit Error', 'Failed to perform stock reconciliation.');
    }
  };

  const handleAddStockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await inventoryApi.addInventory({
        productId: Number(newProductId),
        warehouseId: Number(newWarehouseId),
        quantity: Number(newQuantity),
      });
      showToast('success', 'Stock Initialized', 'Inventory record added.');
      setIsAddModalOpen(false);
      fetchAllData();
    } catch (err) {
      showToast('error', 'Initialization Failed', 'Failed to initialize stock.');
    }
  };

  return (
    <div className="flex flex-col gap-6 text-left">
      <PageHeader
        title="Multi-Warehouse Inventory Ledger"
        subtitle="Real-time stock reservation, available balances, and audits."
        actions={
          <>
            <Button variant="ghost" onClick={fetchAllData} leftIcon={<RefreshCw className="w-4 h-4" />}>
              Refresh
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                if (products.length > 0) setNewProductId(products[0].id);
                if (warehouses.length > 0) setNewWarehouseId(warehouses[0].id);
                setIsAddModalOpen(true);
              }}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Initialize Stock
            </Button>
          </>
        }
      />

      <InventoryTable
        inventoryItems={inventoryItems}
        productMap={productMap}
        warehouseMap={warehouseMap}
        isLoading={isLoading}
        onUpdateStock={(item) => setSelectedItemForUpdate(item)}
        onReconcile={(item) => setSelectedItemForReconcile(item)}
      />

      <StockUpdateModal
        isOpen={!!selectedItemForUpdate}
        onClose={() => setSelectedItemForUpdate(null)}
        onSubmit={handleStockUpdate}
        inventoryItem={selectedItemForUpdate}
      />

      <ReconciliationFormModal
        isOpen={!!selectedItemForReconcile}
        onClose={() => setSelectedItemForReconcile(null)}
        onSubmit={handleReconcile}
        inventoryItem={selectedItemForReconcile}
      />

      {/* Modal for Initializing New Inventory */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Initialize Warehouse Product Stock"
        subtitle="Allocate starting inventory count for a product in a warehouse facility"
      >
        <form onSubmit={handleAddStockSubmit} className="flex flex-col gap-4">
          <Select
            label="Product"
            options={products.map((p) => ({ value: p.id, label: `${p.name} (SKU: ${p.sku})` }))}
            value={newProductId}
            onChange={(e) => setNewProductId(Number(e.target.value))}
            required
          />

          <Select
            label="Warehouse Facility"
            options={warehouses.map((w) => ({ value: w.id, label: `${w.name} (${w.location})` }))}
            value={newWarehouseId}
            onChange={(e) => setNewWarehouseId(Number(e.target.value))}
            required
          />

          <Input
            label="Initial Stock Quantity"
            type="number"
            value={newQuantity}
            onChange={(e) => setNewQuantity(Number(e.target.value))}
            required
          />

          <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-200">
            <Button variant="secondary" type="button" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Initialize Inventory
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
