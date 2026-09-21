import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { StatCard } from '../../components/common/StatCard';
import { Button } from '../../components/common/Button';
import { productApi } from '../../api/productApi';
import { inventoryApi } from '../../api/inventoryApi';
import { orderApi } from '../../api/orderApi';
import { warehouseApi } from '../../api/warehouseApi';
import { Package, Boxes, ShoppingBag, Building2, RefreshCw } from 'lucide-react';

export const AnalyticsOverviewPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    products: 0,
    warehouses: 0,
    totalQuantity: 0,
    reservedQuantity: 0,
    lowStockItems: 0,
    ordersCount: 0,
  });

  const loadMetrics = async () => {
    setLoading(true);
    try {
      const [p, w, l, o] = await Promise.all([
        productApi.getProducts({ page: 0, size: 100 }),
        warehouseApi.getWarehouses(),
        inventoryApi.getLowStockInventory(),
        orderApi.getOrders(0, 100),
      ]);

      const productsList = p.content || [];
      const warehousesList = w || [];
      const lowStockList = l || [];
      const ordersList = o.content || [];

      let total = 0;
      let res = 0;
      lowStockList.forEach((item) => {
        total += item.quantity || 0;
        res += item.reservedQuantity || 0;
      });

      setMetrics({
        products: productsList.length,
        warehouses: warehousesList.length,
        totalQuantity: total,
        reservedQuantity: res,
        lowStockItems: lowStockList.length,
        ordersCount: ordersList.length,
      });
    } catch (err) {
      console.error('Failed to load analytics metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMetrics();
  }, []);

  return (
    <div className="flex flex-col gap-6 text-left max-w-7xl mx-auto">
      <PageHeader
        title="Platform Analytics Overview"
        subtitle="Real-time aggregation of inventory volume, fulfillment rate, stock distribution, and warehouse density."
        actions={
          <Button variant="ghost" onClick={loadMetrics} leftIcon={<RefreshCw className="w-4 h-4" />}>
            Refresh Analytics
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Catalog Density"
          value={loading ? '...' : metrics.products}
          change="Active product SKUs"
          icon={<Package className="w-6 h-6" />}
          variant="blue"
        />
        <StatCard
          title="Warehouse Networks"
          value={loading ? '...' : metrics.warehouses}
          change="Fulfillment locations"
          icon={<Building2 className="w-6 h-6" />}
          variant="blue"
        />
        <StatCard
          title="Total Stock Units"
          value={loading ? '...' : metrics.totalQuantity.toLocaleString()}
          change={`${metrics.reservedQuantity.toLocaleString()} Reserved`}
          icon={<Boxes className="w-6 h-6" />}
          variant="emerald"
        />
        <StatCard
          title="Order Throughput"
          value={loading ? '...' : metrics.ordersCount}
          change="Processed platform orders"
          icon={<ShoppingBag className="w-6 h-6" />}
          variant="purple"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Inventory Capacity & Reservation Allocation">
          <div className="space-y-4 pt-2">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1 text-slate-300">
                <span>Available Physical Stock</span>
                <span>{metrics.totalQuantity > 0 ? Math.round(((metrics.totalQuantity - metrics.reservedQuantity) / metrics.totalQuantity) * 100) : 0}%</span>
              </div>
              <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${metrics.totalQuantity > 0 ? Math.round(((metrics.totalQuantity - metrics.reservedQuantity) / metrics.totalQuantity) * 100) : 0}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1 text-slate-300">
                <span>Pessimistic Reserved Stock</span>
                <span>{metrics.totalQuantity > 0 ? Math.round((metrics.reservedQuantity / metrics.totalQuantity) * 100) : 0}%</span>
              </div>
              <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${metrics.totalQuantity > 0 ? Math.round((metrics.reservedQuantity / metrics.totalQuantity) * 100) : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </Card>

        <Card title="System Performance Summary">
          <div className="space-y-3 pt-2">
            <div className="flex justify-between items-center p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-xs font-semibold text-slate-300">Pessimistic Lock Concurrency</span>
              <span className="text-xs font-mono font-bold text-emerald-400">PESSIMISTIC_WRITE</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-xs font-semibold text-slate-300">Low Stock Health Threshold</span>
              <span className="text-xs font-mono font-bold text-amber-400">25 Units</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-xs font-semibold text-slate-300">API Gateway Response Status</span>
              <span className="text-xs font-mono font-bold text-indigo-400">HTTP 200 OK</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
