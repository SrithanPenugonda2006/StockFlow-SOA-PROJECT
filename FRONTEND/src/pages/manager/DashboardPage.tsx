import React, { useEffect, useState, useMemo } from 'react';
import { Package, Building2, Boxes, AlertTriangle, ShoppingBag, CheckCircle2, Lock } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { StatCard } from '../../components/common/StatCard';
import { productApi } from '../../api/productApi';
import { warehouseApi } from '../../api/warehouseApi';
import { inventoryApi } from '../../api/inventoryApi';
import { orderApi } from '../../api/orderApi';
import { Inventory, InventoryTransaction, LowStockItem } from '../../types/inventory';
import { Product } from '../../types/product';
import { Warehouse } from '../../types/warehouse';
import { evaluateStockStatus } from '../../utils/stockStatus';

import { DashboardFilters } from '../../components/dashboard/DashboardFilters';
import { StockByWarehouseChart, WarehouseStockData } from '../../components/dashboard/StockByWarehouseChart';
import { InventoryMovementChart, MovementTrendPoint } from '../../components/dashboard/InventoryMovementChart';
import { LowStockReorderChart, LowStockReorderData } from '../../components/dashboard/LowStockReorderChart';
import { InventoryHealthChart, InventoryHealthCounts } from '../../components/dashboard/InventoryHealthChart';
import { RecentActivityTable } from '../../components/dashboard/RecentActivityTable';

export const DashboardPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [productMap, setProductMap] = useState<Record<number, Product>>({});
  const [warehouseMap, setWarehouseMap] = useState<Record<number, Warehouse>>({});

  const [totalProducts, setTotalProducts] = useState(0);
  const [totalWarehouses, setTotalWarehouses] = useState(0);
  const [totalStock, setTotalStock] = useState(0);
  const [reservedStock, setReservedStock] = useState(0);
  const [availableStock, setAvailableStock] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [confirmedOrdersCount, setConfirmedOrdersCount] = useState(0);

  const [allInventories, setAllInventories] = useState<Inventory[]>([]);
  const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<InventoryTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters State
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>('ALL');
  const [selectedProductId, setSelectedProductId] = useState<string>('ALL');
  const [timeRange, setTimeRange] = useState<string>('30D');

  const isFiltered = selectedWarehouseId !== 'ALL' || selectedProductId !== 'ALL' || timeRange !== '30D';

  const handleResetFilters = () => {
    setSelectedWarehouseId('ALL');
    setSelectedProductId('ALL');
    setTimeRange('30D');
  };

  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true);
      try {
        // 1. Fetch Products Catalog
        const prodsRes = await productApi.getProducts({ page: 0, size: 100 });
        const prodsList = prodsRes.content || [];
        setProducts(prodsList);
        setTotalProducts(prodsRes.totalElements || prodsList.length);
        const pMap: Record<number, Product> = {};
        prodsList.forEach((p) => {
          pMap[p.id] = p;
        });
        setProductMap(pMap);

        // 2. Fetch Warehouses
        const whsList = (await warehouseApi.getWarehouses()) || [];
        setWarehouses(whsList);
        setTotalWarehouses(whsList.length);
        const wMap: Record<number, Warehouse> = {};
        whsList.forEach((w) => {
          wMap[w.id] = w;
        });
        setWarehouseMap(wMap);

        // 3. Fetch Orders Count
        const ordersRes = await orderApi.getOrders(0, 100);
        setConfirmedOrdersCount(ordersRes.totalElements || 0);

        // 4. Fetch Low Stock Alerts
        const lowStock = await inventoryApi.getLowStockInventory();
        const validLowStock = (lowStock || []).filter((item) => !!pMap[item.productId]);
        setLowStockItems(validLowStock);
        setLowStockCount(validLowStock.length);

        // 5. Fetch Inventory Records across Warehouses
        const inventoryRecords: Inventory[] = [];
        let grandTotal = 0;
        let grandReserved = 0;
        let grandAvailable = 0;

        for (const w of whsList) {
          const invs = await inventoryApi.getInventoryByWarehouse(w.id);
          (invs || []).forEach((inv) => {
            inventoryRecords.push(inv);
            grandTotal += inv.quantity;
            grandReserved += inv.reservedQuantity;
            grandAvailable += inv.availableQuantity;
          });
        }

        setAllInventories(inventoryRecords);
        setTotalStock(grandTotal);
        setReservedStock(grandReserved);
        setAvailableStock(grandAvailable);

        // 6. Fetch Recent Transactions Audit History
        const txRes = await inventoryApi.getTransactionHistory(undefined, undefined, 0, 50);
        setRecentTransactions(txRes.content || []);
      } catch (err) {
        console.error('Error loading analytics dashboard:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  // Filtered Inventories
  const filteredInventories = useMemo(() => {
    return allInventories.filter((inv) => {
      if (selectedWarehouseId !== 'ALL' && inv.warehouseId !== Number(selectedWarehouseId)) {
        return false;
      }
      if (selectedProductId !== 'ALL' && inv.productId !== Number(selectedProductId)) {
        return false;
      }
      return true;
    });
  }, [allInventories, selectedWarehouseId, selectedProductId]);

  // Chart 1 Data — Stock by Warehouse (Stacked Bar)
  const warehouseStockChartData = useMemo<WarehouseStockData[]>(() => {
    const map: Record<number, { name: string; available: number; reserved: number; total: number }> = {};

    warehouses.forEach((w) => {
      if (selectedWarehouseId === 'ALL' || w.id === Number(selectedWarehouseId)) {
        map[w.id] = { name: w.name, available: 0, reserved: 0, total: 0 };
      }
    });

    filteredInventories.forEach((inv) => {
      if (map[inv.warehouseId]) {
        map[inv.warehouseId].available += inv.availableQuantity;
        map[inv.warehouseId].reserved += inv.reservedQuantity;
        map[inv.warehouseId].total += inv.quantity;
      }
    });

    return Object.values(map);
  }, [warehouses, filteredInventories, selectedWarehouseId]);

  // Chart 2 Data — Inventory Movement Trend (Line Chart)
  const movementTrendData = useMemo<MovementTrendPoint[]>(() => {
    const filteredTxs = recentTransactions.filter((tx) => {
      if (selectedWarehouseId !== 'ALL' && tx.warehouseId !== Number(selectedWarehouseId)) return false;
      if (selectedProductId !== 'ALL' && tx.productId !== Number(selectedProductId)) return false;
      return true;
    });

    if (filteredTxs.length === 0) return [];

    const dateMap: Record<string, { date: string; inflow: number; outflow: number }> = {};

    filteredTxs.forEach((tx) => {
      const ts = tx.createdAt || tx.timestamp || '';
      const dateStr = ts ? ts.split('T')[0] : 'Recent';
      if (!dateMap[dateStr]) {
        dateMap[dateStr] = { date: dateStr, inflow: 0, outflow: 0 };
      }

      const change = tx.quantityChange ?? tx.quantity ?? 0;
      const q = Math.abs(change);
      if (tx.transactionType === 'RESTOCK' || tx.transactionType === 'RELEASE' || change > 0) {
        dateMap[dateStr].inflow += q;
      } else {
        dateMap[dateStr].outflow += q;
      }
    });

    return Object.values(dateMap).sort((a, b) => a.date.localeCompare(b.date));
  }, [recentTransactions, selectedWarehouseId, selectedProductId, timeRange]);

  // Chart 3 Data — Low Stock vs Reorder Level (Horizontal Bar)
  const lowStockReorderChartData = useMemo<LowStockReorderData[]>(() => {
    const filteredLowStock = lowStockItems.filter((item) => {
      if (selectedWarehouseId !== 'ALL' && item.warehouseId !== Number(selectedWarehouseId)) return false;
      if (selectedProductId !== 'ALL' && item.productId !== Number(selectedProductId)) return false;
      return true;
    });

    return filteredLowStock.map((item) => {
      const prod = productMap[item.productId];
      const threshold = item.threshold || 25;
      return {
        productName: prod ? prod.name : `Product #${item.productId}`,
        sku: prod ? prod.sku : 'N/A',
        available: item.availableQuantity,
        threshold: threshold,
        difference: item.availableQuantity - threshold,
      };
    });
  }, [lowStockItems, productMap, selectedWarehouseId, selectedProductId]);

  // Chart 4 Data — Inventory Health (Distribution Counts)
  const inventoryHealthCounts = useMemo<InventoryHealthCounts>(() => {
    let healthy = 0;
    let lowStock = 0;
    let critical = 0;
    let outOfStock = 0;

    filteredInventories.forEach((inv) => {
      const status = evaluateStockStatus(inv.availableQuantity, 25);
      switch (status.type) {
        case 'HEALTHY':
          healthy += 1;
          break;
        case 'LOW_STOCK':
          lowStock += 1;
          break;
        case 'CRITICAL':
          critical += 1;
          break;
        case 'OUT_OF_STOCK':
          outOfStock += 1;
          break;
      }
    });

    return {
      healthy,
      lowStock,
      critical,
      outOfStock,
      total: filteredInventories.length,
    };
  }, [filteredInventories]);

  // Table 5 Data — Filtered Recent Activity
  const filteredActivityTransactions = useMemo(() => {
    return recentTransactions.filter((tx) => {
      if (selectedWarehouseId !== 'ALL' && tx.warehouseId !== Number(selectedWarehouseId)) return false;
      if (selectedProductId !== 'ALL' && tx.productId !== Number(selectedProductId)) return false;
      return true;
    });
  }, [recentTransactions, selectedWarehouseId, selectedProductId]);

  return (
    <div className="flex flex-col gap-6 text-left">
      <PageHeader
        title="Executive Operations Dashboard"
        subtitle="Real-time multi-warehouse inventory control, stock reservation, and fulfillment analytics."
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Products"
          value={totalProducts}
          icon={<Package className="w-6 h-6" />}
          variant="purple"
        />
        <StatCard
          title="Warehouses"
          value={totalWarehouses}
          icon={<Building2 className="w-6 h-6" />}
          variant="blue"
        />
        <StatCard
          title="Total Inventory Stock"
          value={totalStock.toLocaleString()}
          icon={<Boxes className="w-6 h-6" />}
          variant="emerald"
        />
        <StatCard
          title="Low Stock Alerts"
          value={lowStockCount}
          icon={<AlertTriangle className="w-6 h-6" />}
          variant="rose"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          title="Available Stock"
          value={availableStock.toLocaleString()}
          icon={<CheckCircle2 className="w-6 h-6" />}
          variant="emerald"
        />
        <StatCard
          title="Reserved Stock"
          value={reservedStock.toLocaleString()}
          icon={<Lock className="w-6 h-6" />}
          variant="amber"
        />
        <StatCard
          title="Total Customer Orders"
          value={confirmedOrdersCount}
          icon={<ShoppingBag className="w-6 h-6" />}
          variant="blue"
        />
      </div>

      {/* Dashboard Filter Bar */}
      <DashboardFilters
        warehouses={warehouses}
        products={products}
        selectedWarehouseId={selectedWarehouseId}
        selectedProductId={selectedProductId}
        timeRange={timeRange}
        onWarehouseChange={setSelectedWarehouseId}
        onProductChange={setSelectedProductId}
        onTimeRangeChange={setTimeRange}
        onReset={handleResetFilters}
        isFiltered={isFiltered}
      />

      {/* Analytics Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <StockByWarehouseChart data={warehouseStockChartData} isLoading={isLoading} />
        <InventoryMovementChart data={movementTrendData} isLoading={isLoading} />
      </div>

      {/* Analytics Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <LowStockReorderChart data={lowStockReorderChartData} isLoading={isLoading} />
        <InventoryHealthChart counts={inventoryHealthCounts} isLoading={isLoading} />
      </div>

      {/* Analytics Row 3 — Full Width Activity Table */}
      <RecentActivityTable
        transactions={filteredActivityTransactions}
        productMap={productMap}
        warehouseMap={warehouseMap}
        isLoading={isLoading}
      />
    </div>
  );
};
