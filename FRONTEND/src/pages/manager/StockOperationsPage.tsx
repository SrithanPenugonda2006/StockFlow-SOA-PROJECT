import React, { useState, useEffect } from 'react';
import { Warehouse } from '../../types/warehouse';
import { Product } from '../../types/product';
import { warehouseApi } from '../../api/warehouseApi';
import { productApi } from '../../api/productApi';
import { inventoryApi } from '../../api/inventoryApi';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { useToast } from '../../context/ToastContext';
import { extractErrorMessage } from '../../utils/formatters';
import { ArrowDownRight, ArrowUpRight, Wrench, RefreshCw } from 'lucide-react';

export const StockOperationsPage: React.FC = () => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'in' | 'out' | 'adjust'>('in');
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Form State
  const [warehouseId, setWarehouseId] = useState<number | ''>('');
  const [productId, setProductId] = useState<number | ''>('');
  const [quantity, setQuantity] = useState<number>(10);
  const [reason, setReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const fetchDropdownData = async () => {
    setIsLoading(true);
    try {
      const [whRes, prodRes] = await Promise.all([
        warehouseApi.getWarehouses(),
        productApi.getProducts({ page: 0, size: 100 }),
      ]);
      setWarehouses(whRes || []);
      setProducts(prodRes.content || []);
    } catch (err) {
      showToast('error', 'Error Loading Reference Data', extractErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDropdownData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!warehouseId || !productId || quantity <= 0) {
      showToast('error', 'Validation Error', 'Please select warehouse, product, and valid quantity.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (activeTab === 'in') {
        await inventoryApi.addInventory({
          warehouseId: Number(warehouseId),
          productId: Number(productId),
          quantity,
        });
        showToast('success', 'Stock In Complete', `Added ${quantity} units to warehouse stock.`);
      } else if (activeTab === 'out') {
        await inventoryApi.stockOut(Number(productId), Number(warehouseId), quantity, reason);
        showToast('success', 'Stock Out Complete', `Dispatched ${quantity} units from warehouse stock.`);
      } else {
        await inventoryApi.addInventory({
          warehouseId: Number(warehouseId),
          productId: Number(productId),
          quantity,
        });
        showToast('success', 'Adjustment Complete', `Adjusted inventory quantity by ${quantity} units.`);
      }
      setQuantity(10);
      setReason('');
    } catch (err) {
      showToast('error', 'Operation Failed', extractErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 text-left">
      <PageHeader
        title="Stock Operations Center"
        subtitle="Perform physical Goods In (Receipt), Goods Out (Issue), and manual inventory adjustments."
      />

      {/* TABS */}
      <div className="flex items-center gap-3 border-b border-gray-200 pb-2">
        <button
          onClick={() => setActiveTab('in')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'in'
              ? 'bg-gray-900 text-white shadow-lg shadow-gray-900/25'
              : 'bg-white text-gray-500 hover:text-gray-900 border border-gray-200'
          }`}
        >
          <ArrowDownRight className="w-4 h-4 text-gray-900" />
          <span>Stock In (Receipt)</span>
        </button>

        <button
          onClick={() => setActiveTab('out')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'out'
              ? 'bg-gray-900 text-white shadow-lg shadow-gray-900/25'
              : 'bg-white text-gray-500 hover:text-gray-900 border border-gray-200'
          }`}
        >
          <ArrowUpRight className="w-4 h-4 text-gray-900" />
          <span>Stock Out (Dispatch)</span>
        </button>

        <button
          onClick={() => setActiveTab('adjust')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'adjust'
              ? 'bg-[#111111] text-white shadow-lg '
              : 'bg-white text-gray-500 hover:text-gray-900 border border-gray-200'
          }`}
        >
          <Wrench className="w-4 h-4 text-[#111111]" />
          <span>Stock Adjustment</span>
        </button>
      </div>

      {/* OPERATION FORM CARD */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 max-w-2xl">
        <h3 className="text-lg font-bold text-gray-900 mb-1">
          {activeTab === 'in' ? 'Record Goods Receipt' : activeTab === 'out' ? 'Record Stock Issue / Dispatch' : 'Record Inventory Adjustment'}
        </h3>
        <p className="text-xs text-gray-500 mb-6">
          Every transaction updates live database inventory levels and generates audit history.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Warehouse <span className="text-gray-900">*</span>
            </label>
            <select
              value={warehouseId}
              onChange={(e) => setWarehouseId(Number(e.target.value))}
              className="w-full bg-[#F7F8FA] border border-gray-200 rounded-xl text-sm text-gray-900 p-3"
              required
            >
              <option value="">Select Warehouse</option>
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} ({w.location})
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Product <span className="text-gray-900">*</span>
            </label>
            <select
              value={productId}
              onChange={(e) => setProductId(Number(e.target.value))}
              className="w-full bg-[#F7F8FA] border border-gray-200 rounded-xl text-sm text-gray-900 p-3"
              required
            >
              <option value="">Select Catalog Product</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.productName || p.name} ({p.skuCode || p.sku})
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Quantity Units"
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            required
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Reason / Reference Notes</label>
            <textarea
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Received shipment from supplier / Damaged box replacement"
              className="w-full bg-[#F7F8FA] border border-gray-200 rounded-xl text-sm text-gray-900 p-3"
            />
          </div>

          <div className="pt-3 border-t border-gray-200 flex justify-end">
            <Button
              variant={activeTab === 'in' ? 'primary' : activeTab === 'out' ? 'danger' : 'primary'}
              type="submit"
              isLoading={isSubmitting}
            >
              {activeTab === 'in' ? 'Execute Stock In' : activeTab === 'out' ? 'Execute Stock Out' : 'Apply Adjustment'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
