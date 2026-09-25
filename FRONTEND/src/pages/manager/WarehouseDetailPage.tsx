import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Building2, MapPin, ArrowLeft, RefreshCw, Edit, Boxes, 
  Layers, Package, ArrowUpRight, ArrowDownLeft, Search, Filter,
  AlertTriangle, ShieldCheck
} from 'lucide-react';
import { Warehouse, WarehouseCreateDTO } from '../../types/warehouse';
import { Inventory } from '../../types/inventory';
import { Product } from '../../types/product';
import { warehouseApi } from '../../api/warehouseApi';
import { inventoryApi } from '../../api/inventoryApi';
import { productApi } from '../../api/productApi';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/common/Button';
import { StorageCapacityCard } from '../../components/warehouses/StorageCapacityCard';
import { WarehouseFormModal } from '../../components/warehouses/WarehouseFormModal';
import { Pagination } from '../../components/common/Pagination';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { extractErrorMessage } from '../../utils/formatters';

export const WarehouseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { role } = useAuth();
  const isAdmin = role === 'ADMIN';

  const warehouseId = Number(id);

  const [warehouse, setWarehouse] = useState<Warehouse | null>(null);
  const [inventories, setInventories] = useState<Inventory[]>([]);
  const [productMap, setProductMap] = useState<Record<number, Product>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [page, setPage] = useState<number>(1);

  const loadData = async () => {
    if (!warehouseId || isNaN(warehouseId)) return;
    setIsLoading(true);
    try {
      const [whData, invData, prodList] = await Promise.all([
        warehouseApi.getWarehouse(warehouseId),
        inventoryApi.getInventoryByWarehouse(warehouseId),
        productApi.getProducts(),
      ]);

      setWarehouse(whData);
      setInventories(invData || []);

      const pMap: Record<number, Product> = {};
      const pArray = Array.isArray(prodList) ? prodList : (prodList?.content || []);
      pArray.forEach((p: Product) => {
        pMap[p.id] = p;
      });
      setProductMap(pMap);
    } catch (err) {
      showToast('error', 'Error Loading Details', 'Unable to load warehouse details.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [warehouseId]);

  const handleUpdateWarehouse = async (data: WarehouseCreateDTO) => {
    if (!warehouseId) return;
    try {
      const updated = await warehouseApi.updateWarehouse(warehouseId, data);
      setWarehouse(updated);
      showToast('success', 'Warehouse Updated', 'Warehouse details updated successfully.');
      loadData();
    } catch (err: any) {
      showToast('error', 'Update Error', extractErrorMessage(err));
    }
  };

  // Filtered Inventories for table
  const filteredInventories = inventories.filter((item) => {
    const product = productMap[item.productId];
    const name = product?.name || `Product #${item.productId}`;
    const sku = product?.sku || '';
    const query = searchQuery.toLowerCase();
    return name.toLowerCase().includes(query) || sku.toLowerCase().includes(query);
  });

  const totalOccupiedUnits = inventories.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const totalReservedUnits = inventories.reduce((sum, item) => sum + (item.reservedQuantity || 0), 0);
  const lowStockCount = inventories.filter((i) => i.availableQuantity <= 10).length;

  if (isLoading && !warehouse) {
    return (
      <div className="flex flex-col gap-6 text-left p-6 animate-pulse">
        <div className="h-12 bg-gray-200 rounded-xl w-1/3" />
        <div className="h-48 bg-gray-200 rounded-2xl w-full" />
        <div className="h-64 bg-gray-200 rounded-2xl w-full" />
      </div>
    );
  }

  if (!warehouse) {
    return (
      <div className="flex flex-col gap-6 text-left p-6">
        <Button variant="ghost" onClick={() => navigate('/warehouses')} leftIcon={<ArrowLeft className="w-4 h-4" />}>
          Back to Warehouses
        </Button>
        <div className="p-12 text-center text-gray-500 bg-white border border-gray-200 rounded-2xl">
          Warehouse not found or invalid ID.
        </div>
      </div>
    );
  }

  const totalCap = warehouse.totalCapacity ?? warehouse.capacity ?? 10000;
  const usedCap = warehouse.occupiedCapacity ?? warehouse.usedCapacity ?? totalOccupiedUnits;

  return (
    <div className="flex flex-col gap-6 text-left pb-12">
      {/* 1. Warehouse Header */}
      <div className="flex flex-col gap-4 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/warehouses')}
            className="flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-black transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Warehouses
          </button>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={loadData} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
              Refresh
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsEditModalOpen(true)}
              leftIcon={<Edit className="w-3.5 h-3.5" />}
            >
              Edit Facility
            </Button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
          <div className="flex items-start gap-4">
            <div className="p-4 bg-[#111111] text-white rounded-2xl shrink-0 shadow-md">
              <Building2 className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-gray-900 tracking-tight">{warehouse.name}</h1>
                <span className="px-2.5 py-0.5 text-xs font-mono font-semibold bg-gray-100 text-gray-700 border border-gray-200 rounded-md">
                  {warehouse.code || `WH-#${warehouse.id}`}
                </span>
                <span className="px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider bg-black text-white rounded-md">
                  {warehouse.status || 'ACTIVE'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500 mt-1.5">
                <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <span>{warehouse.location}</span>
                {warehouse.address && <span>• {warehouse.address}</span>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Warehouse KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-semibold text-[#737373] uppercase tracking-wider">Total Units Stored</span>
          <p className="text-2xl font-black text-gray-900 mt-1 font-mono">{usedCap.toLocaleString()}</p>
          <span className="text-[11px] text-gray-500">Across {inventories.length} inventory records</span>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-semibold text-[#737373] uppercase tracking-wider">Max Capacity</span>
          <p className="text-2xl font-black text-gray-900 mt-1 font-mono">{totalCap.toLocaleString()}</p>
          <span className="text-[11px] text-gray-500">Allocated storage volume</span>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-semibold text-[#737373] uppercase tracking-wider">Reserved Stock</span>
          <p className="text-2xl font-black text-gray-900 mt-1 font-mono">{totalReservedUnits.toLocaleString()}</p>
          <span className="text-[11px] text-gray-500">Committed for active orders/transfers</span>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-semibold text-[#737373] uppercase tracking-wider">Low Stock Alerts</span>
          <p className="text-2xl font-black text-gray-900 mt-1 font-mono">{lowStockCount}</p>
          <span className="text-[11px] text-gray-500">Items below safety threshold</span>
        </div>
      </div>

      {/* 3. Storage Capacity (Main Prominence Section) */}
      <section className="flex flex-col gap-2">
        <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
          <Layers className="w-4 h-4 text-black" />
          Facility Utilization & Storage Capacity
        </h2>
        <StorageCapacityCard
          variant="card"
          totalCapacity={totalCap}
          usedCapacity={usedCap}
        />
      </section>

      {/* 4. Warehouse Inventory Table */}
      <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
          <div>
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Boxes className="w-4 h-4 text-black" />
              Stored Physical Stock ({filteredInventories.length})
            </h2>
            <p className="text-xs text-gray-500">Real-time inventory ledger associated with this facility.</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search SKU or product..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black transition-colors"
              />
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate(`/stock-operations?warehouseId=${warehouse.id}`)}
              leftIcon={<Boxes className="w-3.5 h-3.5" />}
            >
              Stock Actions
            </Button>
          </div>
        </div>

        {filteredInventories.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/50 text-[#737373] uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4 font-semibold">Product / SKU</th>
                  <th className="py-3 px-4 font-semibold">Category</th>
                  <th className="py-3 px-4 font-semibold text-right">On Hand</th>
                  <th className="py-3 px-4 font-semibold text-right">Reserved</th>
                  <th className="py-3 px-4 font-semibold text-right">Available</th>
                  <th className="py-3 px-4 font-semibold text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-mono">
                {filteredInventories.slice((page - 1) * 5, page * 5).map((item) => {
                  const product = productMap[item.productId];
                  const isLow = item.availableQuantity <= 10;
                  return (
                    <tr key={item.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-3 px-4 font-sans font-semibold text-gray-900">
                        <div>
                          <span>{product?.name || `Product #${item.productId}`}</span>
                          {product?.sku && (
                            <span className="block text-[11px] font-mono text-gray-400 font-normal">
                              SKU: {product.sku}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-sans text-gray-600">
                        {product?.category || 'General'}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-gray-900">
                        {item.quantity.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-500">
                        {item.reservedQuantity.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-black">
                        {item.availableQuantity.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-center font-sans">
                        {isLow ? (
                          <span className="px-2 py-0.5 text-[10px] font-bold bg-black text-white rounded uppercase tracking-wider">
                            Low Stock
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 text-[10px] font-medium bg-gray-100 text-gray-700 rounded border border-gray-200">
                            In Stock
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="mt-4">
              <Pagination
                totalItems={filteredInventories.length}
                currentPage={page}
                pageSize={5}
                onPageChange={setPage}
              />
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-gray-500">
            No inventory records registered for this warehouse location.
          </div>
        )}
      </section>

      {/* 5. Facility Locations / Bins Layout */}
      <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-black" />
              Fulfillment Rack & Storage Zones Layout
            </h2>
            <p className="text-xs text-gray-500">Logical bin assignments and storage zone allocation.</p>
          </div>
          <span className="text-xs font-mono text-gray-400 font-semibold">4 Active Zones</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { zone: 'Zone A - High Density', racks: 'Racks A1–A12', occupancy: '78%' },
            { zone: 'Zone B - Bulk Pallet', racks: 'Racks B1–B08', occupancy: '62%' },
            { zone: 'Zone C - Cold Storage', racks: 'Racks C1–C04', occupancy: '45%' },
            { zone: 'Zone D - Staging & Dispatch', racks: 'Racks D1–D06', occupancy: '20%' },
          ].map((z, idx) => (
            <div key={idx} className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-left">
              <span className="text-xs font-bold text-gray-900 block">{z.zone}</span>
              <span className="text-[11px] font-mono text-gray-500 block mt-0.5">{z.racks}</span>
              <div className="mt-3 pt-2 border-t border-gray-200/80 flex items-center justify-between text-[11px]">
                <span className="text-gray-500">Zone Capacity</span>
                <span className="font-bold font-mono text-black">{z.occupancy}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Edit Form Modal */}
      <WarehouseFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleUpdateWarehouse}
        warehouse={warehouse}
      />
    </div>
  );
};
