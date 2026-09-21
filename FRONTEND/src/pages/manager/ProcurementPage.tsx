import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Plus,
  Search,
  Filter,
  Truck,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Package,
  Building2,
  Calendar,
  IndianRupee,
  RefreshCw,
  X,
  PlusCircle,
  Trash2,
} from 'lucide-react';
import { Pagination } from '../../components/common/Pagination';
import { inventoryApi } from '../../api/inventoryApi';
import { warehouseApi } from '../../api/warehouseApi';
import { productApi } from '../../api/productApi';
import { PurchaseOrder, Supplier, PurchaseOrderItem } from '../../types/inventory';
import { Warehouse } from '../../types/warehouse';
import { Product } from '../../types/product';

export const ProcurementPage: React.FC = () => {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // New PO form state
  const [selectedSupplierId, setSelectedSupplierId] = useState<number | ''>('');
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<number | ''>('');
  const [poItems, setPoItems] = useState<PurchaseOrderItem[]>([
    { productId: 0, quantity: 1, unitCost: 0 },
  ]);

  const fetchProcurementData = async () => {
    setLoading(true);
    try {
      const [posData, suppliersData, whData, prodData] = await Promise.all([
        inventoryApi.getPurchaseOrders(),
        inventoryApi.getSuppliers(),
        warehouseApi.getWarehouses(),
        productApi.getProducts({ size: 100 }),
      ]);
      setPurchaseOrders(posData || []);
      setSuppliers(suppliersData || []);
      setWarehouses(whData || []);
      setProducts(prodData?.content || []);
    } catch (err: any) {
      console.error('Failed to fetch procurement data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProcurementData();
  }, []);

  // Items calculation
  const calculatedTotal = poItems.reduce((sum, item) => sum + item.quantity * item.unitCost, 0);

  const handleAddItem = () => {
    setPoItems([...poItems, { productId: 0, quantity: 1, unitCost: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    if (poItems.length > 1) {
      setPoItems(poItems.filter((_, i) => i !== index));
    }
  };

  const handleItemChange = (index: number, field: keyof PurchaseOrderItem, value: any) => {
    const updated = [...poItems];
    if (field === 'productId') {
      const prodId = Number(value);
      const prod = products.find((p) => p.id === prodId);
      updated[index] = {
        ...updated[index],
        productId: prodId,
        productName: prod?.name || '',
        unitCost: prod?.unitCost || prod?.price || 0,
      };
    } else {
      updated[index] = {
        ...updated[index],
        [field]: Number(value),
      };
    }
    setPoItems(updated);
  };

  const handleCreatePO = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!selectedSupplierId) {
      setErrorMsg('Please select a supplier.');
      return;
    }
    if (!selectedWarehouseId) {
      setErrorMsg('Please select a destination warehouse.');
      return;
    }
    const validItems = poItems.filter((item) => item.productId > 0 && item.quantity > 0);
    if (validItems.length === 0) {
      setErrorMsg('Please add at least one valid product with quantity > 0.');
      return;
    }

    setSubmitting(true);
    try {
      await inventoryApi.createPurchaseOrder({
        supplierId: Number(selectedSupplierId),
        warehouseId: Number(selectedWarehouseId),
        items: validItems,
        totalAmount: calculatedTotal,
      });
      setIsModalOpen(false);
      // Reset form
      setSelectedSupplierId('');
      setSelectedWarehouseId('');
      setPoItems([{ productId: 0, quantity: 1, unitCost: 0 }]);
      fetchProcurementData();
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || 'Failed to create Purchase Order');
    } finally {
      setSubmitting(false);
    }
  };

  // Status Badge Helper
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
      case 'FULLY_RECEIVED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-900/10 text-gray-900 border border-gray-900/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {status.replace('_', ' ')}
          </span>
        );
      case 'PENDING_APPROVAL':
      case 'SENT':
      case 'PARTIALLY_RECEIVED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-700/10 text-gray-700 border border-gray-700/20">
            <Clock className="w-3.5 h-3.5" />
            {status.replace('_', ' ')}
          </span>
        );
      case 'CANCELLED':
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-900/10 text-gray-900 border border-gray-900/20">
            <XCircle className="w-3.5 h-3.5" />
            {status.replace('_', ' ')}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-300">
            <Clock className="w-3.5 h-3.5" />
            {status}
          </span>
        );
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  // Filtered List
  const filteredOrders = purchaseOrders.filter((po) => {
    const matchesStatus = statusFilter === 'ALL' || po.status === statusFilter;
    const matchesSearch =
      po.poNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      po.supplierName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      po.warehouseName?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Analytics Metrics
  const totalPOs = purchaseOrders.length;
  const pendingPOs = purchaseOrders.filter(
    (po) => po.status === 'PENDING_APPROVAL' || po.status === 'SENT' || po.status === 'DRAFT'
  ).length;
  const receivedPOs = purchaseOrders.filter((po) => po.status === 'FULLY_RECEIVED').length;
  const totalSpend = purchaseOrders.reduce((sum, po) => sum + (po.totalAmount || 0), 0);

  const startIndex = (currentPage - 1) * pageSize;
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + pageSize);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2.5">
            <ShoppingBag className="w-7 h-7 text-[#666666]" />
            Procurement & Purchase Orders
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage vendor purchase orders, inbound stock replenishment, and order fulfillment workflows.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchProcurementData}
            className="p-2.5 rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-white hover:bg-gray-100 transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#111111] hover:bg-[#2A2A2A] text-white font-semibold text-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            Create Purchase Order
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white/60 border border-gray-200 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Purchase Orders</span>
            <div className="p-2 rounded-xl bg-[#111111]/10 text-[#666666] border border-[#D4D4D4]/20">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white mt-2">{totalPOs}</p>
        </div>

        <div className="p-4 rounded-2xl bg-white/60 border border-gray-200 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Pending Fulfillment</span>
            <div className="p-2 rounded-xl bg-gray-700/10 text-gray-700 border border-gray-700/20">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-700 mt-2">{pendingPOs}</p>
        </div>

        <div className="p-4 rounded-2xl bg-white/60 border border-gray-200 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Fully Received</span>
            <div className="p-2 rounded-xl bg-gray-900/10 text-gray-900 border border-gray-900/20">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">{receivedPOs}</p>
        </div>

        <div className="p-4 rounded-2xl bg-white/60 border border-gray-200 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Procurement Spend</span>
            <div className="p-2 rounded-xl bg-[#111111]/10 text-[#666666] border border-[#D4D4D4]/20">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white mt-2">
            ₹{totalSpend.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white/60 border border-gray-200">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search by PO number, supplier, or warehouse..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#F7F8FA] border border-gray-200 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900/20"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
          {['ALL', 'PENDING_APPROVAL', 'APPROVED', 'SENT', 'FULLY_RECEIVED', 'CANCELLED'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === status
                  ? 'bg-[#111111] text-white '
                  : 'bg-[#F7F8FA] text-gray-500 hover:text-gray-800 border border-gray-200'
              }`}
            >
              {status === 'ALL' ? 'All Orders' : status.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* PO Table */}
      <div className="rounded-2xl bg-white/60 border border-gray-200 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-[#F7F8FA]/80 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">PO Number</th>
                <th className="px-6 py-4">Supplier</th>
                <th className="px-6 py-4">Destination Warehouse</th>
                <th className="px-6 py-4">Total Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Created Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#666666] mb-2" />
                    Loading purchase orders...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    <ShoppingBag className="w-10 h-10 mx-auto text-slate-600 mb-3" />
                    <p className="font-semibold text-gray-500">No Purchase Orders Found</p>
                    <p className="text-xs text-gray-400 mt-1">Create a new purchase order to initiate stock replenishment.</p>
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((po) => (
                  <tr key={po.id} className="hover:bg-gray-100/40 transition-colors">
                    <td className="px-6 py-4 font-bold text-white flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4 text-[#666666] shrink-0" />
                      {po.poNumber}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Truck className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                        <span>{po.supplierName || `Supplier #${po.supplierId}`}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                        <span>{po.warehouseName || `Warehouse #${po.warehouseId}`}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      ₹{po.totalAmount ? po.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '0.00'}
                    </td>
                    <td className="px-6 py-4">{renderStatusBadge(po.status)}</td>
                    <td className="px-6 py-4 text-xs text-gray-500">
                      {po.createdAt ? new Date(po.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-gray-200 bg-gray-50/50">
          <Pagination
            totalItems={filteredOrders.length}
            currentPage={currentPage}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {/* Modal: Create Purchase Order */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#F7F8FA]/80 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden my-8">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-[#F7F8FA]/50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#111111]/10 text-[#666666] border border-[#D4D4D4]/20">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Create Purchase Order</h3>
                  <p className="text-xs text-gray-500">Issue a replenishment request to a verified supplier.</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-gray-500 hover:text-white hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePO} className="p-6 space-y-5">
              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-gray-100 border border-gray-800 text-gray-900 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {errorMsg}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Supplier */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                    Supplier *
                  </label>
                  <select
                    value={selectedSupplierId}
                    onChange={(e) => setSelectedSupplierId(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F8FA] border border-gray-200 text-sm text-white focus:outline-none focus:ring-2 focus:ring-gray-900/20"
                    required
                  >
                    <option value="">Select Supplier</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.code})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Warehouse */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                    Destination Warehouse *
                  </label>
                  <select
                    value={selectedWarehouseId}
                    onChange={(e) => setSelectedWarehouseId(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F8FA] border border-gray-200 text-sm text-white focus:outline-none focus:ring-2 focus:ring-gray-900/20"
                    required
                  >
                    <option value="">Select Destination Warehouse</option>
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name} ({w.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Items Section */}
              <div className="space-y-3 pt-2 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Order Items *
                  </label>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="text-xs text-[#666666] hover:text-[#666666] font-semibold flex items-center gap-1"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    Add Product Line
                  </button>
                </div>

                {poItems.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-3 items-center bg-[#F7F8FA]/60 p-3 rounded-xl border border-gray-200">
                    <div className="col-span-5">
                      <label className="block text-[10px] text-gray-500 mb-1">Product</label>
                      <select
                        value={item.productId}
                        onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-gray-200 text-xs text-white focus:outline-none focus:ring-1 focus:ring-gray-900/20"
                        required
                      >
                        <option value={0}>Select Product</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.sku})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-span-3">
                      <label className="block text-[10px] text-gray-500 mb-1">Quantity</label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-gray-200 text-xs text-white focus:outline-none focus:ring-1 focus:ring-gray-900/20"
                        required
                      />
                    </div>

                    <div className="col-span-3">
                      <label className="block text-[10px] text-gray-500 mb-1">Unit Cost (₹)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.unitCost}
                        onChange={(e) => handleItemChange(index, 'unitCost', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-gray-200 text-xs text-white focus:outline-none focus:ring-1 focus:ring-gray-900/20"
                        required
                      />
                    </div>

                    <div className="col-span-1 text-right pt-4">
                      {poItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="p-1 text-gray-400 hover:text-gray-900 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Total Summary */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#F5F5F5] border border-[#E5E5E5]">
                <span className="text-xs font-semibold text-[#111111]">Total Purchase Order Value</span>
                <span className="text-lg font-bold text-gray-900">
                  ₹{calculatedTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-[#F7F8FA] border border-gray-200 text-gray-500 hover:text-white text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-[#111111] hover:bg-[#2A2A2A] text-white text-xs font-semibold transition-all flex items-center gap-2"
                >
                  {submitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  Submit Purchase Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
