import { PageHeader } from "../../components/common/PageHeader";
import React, { useEffect, useState } from 'react';
import { RefreshCw, CheckCircle2 } from 'lucide-react';
import { Product } from '../../types/product';
import { Warehouse } from '../../types/warehouse';
import { Inventory } from '../../types/inventory';
import { productApi } from '../../api/productApi';
import { warehouseApi } from '../../api/warehouseApi';
import { inventoryApi } from '../../api/inventoryApi';
import { Select } from '../../components/common/Select';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { useToast } from '../../context/ToastContext';

export const ReconciliationPage: React.FC = () => {
  const { showToast } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);

  const [selectedProductId, setSelectedProductId] = useState<number>(0);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<number>(0);

  const [currentInventory, setCurrentInventory] = useState<Inventory | null>(null);
  const [actualQuantity, setActualQuantity] = useState<number>(0);
  const [reason, setReason] = useState<string>('Physical Audit Discrepancy');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadInit = async () => {
      try {
        const prodsRes = await productApi.getProducts({ page: 0, size: 100 });
        const prods = prodsRes.content || [];
        setProducts(prods);
        if (prods.length > 0) setSelectedProductId(prods[0].id);

        const whs = await warehouseApi.getWarehouses();
        setWarehouses(whs || []);
        if (whs && whs.length > 0) setSelectedWarehouseId(whs[0].id);
      } catch (err) {
        console.error('Error initializing form:', err);
      }
    };
    loadInit();
  }, []);

  useEffect(() => {
    if (!selectedProductId || !selectedWarehouseId) return;
    const fetchRecord = async () => {
      try {
        const list = await inventoryApi.getInventoryByProduct(selectedProductId);
        const record = (list || []).find((i) => i.warehouseId === selectedWarehouseId);
        setCurrentInventory(record || null);
        if (record) setActualQuantity(record.quantity);
      } catch (err) {
        console.error('Error fetching inventory record:', err);
      }
    };
    fetchRecord();
  }, [selectedProductId, selectedWarehouseId]);

  const handleSubmitReconciliation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || !selectedWarehouseId) return;

    setIsSubmitting(true);
    try {
      await inventoryApi.reconcileInventory({
        productId: selectedProductId,
        warehouseId: selectedWarehouseId,
        actualQuantity,
        reason,
      });

      showToast('success', 'Stock Reconciliation Logged', 'System quantity successfully adjusted.');
      // Refresh current record
      const list = await inventoryApi.getInventoryByProduct(selectedProductId);
      const record = (list || []).find((i) => i.warehouseId === selectedWarehouseId);
      setCurrentInventory(record || null);
    } catch (err) {
      showToast('error', 'Reconciliation Error', 'Failed to adjust stock quantity.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const difference = currentInventory ? actualQuantity - currentInventory.quantity : 0;

  return (
    <div className="flex flex-col gap-6 text-left max-w-3xl mx-auto">
      <PageHeader
        title="Physical Audit & Stock Reconciliation"
        subtitle="Reconcile physical inventory counts and log discrepancy adjustments."
      />

      <Card>
        <form onSubmit={handleSubmitReconciliation} className="flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Select Product Catalog Item"
              options={products.map((p) => ({ value: p.id, label: `${p.name} (SKU: ${p.sku})` }))}
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(Number(e.target.value))}
              required
            />

            <Select
              label="Select Warehouse Facility"
              options={warehouses.map((w) => ({ value: w.id, label: `${w.name} (${w.location})` }))}
              value={selectedWarehouseId}
              onChange={(e) => setSelectedWarehouseId(Number(e.target.value))}
              required
            />
          </div>

          {currentInventory ? (
            <div className="grid grid-cols-3 gap-4 bg-slate-950 p-5 rounded-2xl border border-slate-800 text-center">
              <div>
                <span className="text-xs text-slate-500 block uppercase font-bold">System Record</span>
                <span className="text-xl font-bold text-slate-100">{currentInventory.quantity}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block uppercase font-bold">Physical Audit</span>
                <span className="text-xl font-bold text-indigo-400">{actualQuantity}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block uppercase font-bold">Variance</span>
                <span
                  className={`text-xl font-bold ${
                    difference === 0
                      ? 'text-slate-400'
                      : difference > 0
                      ? 'text-emerald-400'
                      : 'text-rose-400'
                  }`}
                >
                  {difference > 0 ? `+${difference}` : difference}
                </span>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-500 text-center">
              No existing stock record initialized for this product in selected warehouse facility.
            </div>
          )}

          <Input
            label="Actual Physical Stock Quantity Counted"
            type="number"
            value={actualQuantity}
            onChange={(e) => setActualQuantity(Number(e.target.value))}
            required
          />

          <Select
            label="Audit Discrepancy Reason"
            options={[
              { value: 'Physical Audit Discrepancy', label: 'Monthly Physical Stock Audit' },
              { value: 'Damaged Goods Removal', label: 'Damaged / Expired Goods Removal' },
              { value: 'Shrinkage & Theft Loss', label: 'Stock Shrinkage / Theft Loss' },
              { value: 'Supplier Stock Correction', label: 'Supplier Receipt Correction' },
            ]}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />

          <Button
            variant="primary"
            size="lg"
            type="submit"
            isLoading={isSubmitting}
            disabled={!currentInventory}
            leftIcon={<CheckCircle2 className="w-5 h-5" />}
          >
            Reconcile System Stock
          </Button>
        </form>
      </Card>
    </div>
  );
};
