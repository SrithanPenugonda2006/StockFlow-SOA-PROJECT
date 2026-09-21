import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { StatCard } from '../../components/common/StatCard';
import { Button } from '../../components/common/Button';
import {
  Package,
  Building2,
  Boxes,
  AlertTriangle,
  ShoppingBag,
  Server,
  ShieldCheck,
  Database,
  Layers,
  Activity,
  CheckCircle2,
  RefreshCw,
  UserCheck,
  Warehouse as WarehouseIcon,
} from 'lucide-react';
import { productApi } from '../../api/productApi';
import { warehouseApi } from '../../api/warehouseApi';
import { inventoryApi } from '../../api/inventoryApi';
import { orderApi } from '../../api/orderApi';
import { adminApi, Manager } from '../../api/adminApi';

export const AdminOverviewPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [stats, setStats] = useState({
    productsCount: 0,
    warehousesCount: 0,
    totalStock: 0,
    availableStock: 0,
    reservedStock: 0,
    lowStockCount: 0,
    ordersCount: 0,
    recentTransactionsCount: 0,
    totalManagers: 0,
    activeManagers: 0,
    inactiveManagers: 0,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [productsRes, warehousesRes, lowStockRes, ordersRes, txRes, managersRes] =
        await Promise.allSettled([
          productApi.getProducts({ page: 0, size: 100 }),
          warehouseApi.getWarehouses(),
          inventoryApi.getLowStockInventory(),
          orderApi.getOrders(0, 100),
          inventoryApi.getTransactionHistory(undefined, undefined, 0, 100),
          adminApi.getManagers(),
        ]);

      const products = productsRes.status === 'fulfilled' ? productsRes.value.content || [] : [];
      const warehouses = warehousesRes.status === 'fulfilled' ? warehousesRes.value || [] : [];
      const lowStock = lowStockRes.status === 'fulfilled' ? lowStockRes.value || [] : [];
      const orders = ordersRes.status === 'fulfilled' ? ordersRes.value.content || [] : [];
      const txs = txRes.status === 'fulfilled' ? txRes.value.content || [] : [];
      const mgrs = managersRes.status === 'fulfilled' ? managersRes.value || [] : [];

      setManagers(mgrs);

      let total = 0;
      let reserved = 0;
      lowStock.forEach((item) => {
        total += item.quantity || 0;
        reserved += item.reservedQuantity || 0;
      });
      const available = total - reserved;

      const activeMgrs = mgrs.filter((m) => m.status === 'ACTIVE').length;
      const inactiveMgrs = mgrs.filter((m) => m.status === 'INACTIVE').length;

      setStats({
        productsCount: products.length,
        warehousesCount: warehouses.length,
        totalStock: total,
        availableStock: available,
        reservedStock: reserved,
        lowStockCount: lowStock.length,
        ordersCount: orders.length,
        recentTransactionsCount: txs.length,
        totalManagers: mgrs.length,
        activeManagers: activeMgrs,
        inactiveManagers: inactiveMgrs,
      });
    } catch (err) {
      console.error('Failed to load admin overview data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const services = [
    { name: 'API Gateway (Port 8080)', status: 'HEALTHY', details: 'Spring Cloud Gateway Route Management' },
    { name: 'Eureka Service Discovery (Port 8761)', status: 'HEALTHY', details: 'Dynamic Microservice Registry' },
    { name: 'Auth Service (Port 8081)', status: 'HEALTHY', details: 'JWT Token Issuer, Users & Managers Domain' },
    { name: 'Product Service (Port 8082)', status: 'HEALTHY', details: 'PostgreSQL Catalog & SKU Registry' },
    { name: 'Inventory Service (Port 8083)', status: 'HEALTHY', details: 'Multi-Warehouse Stock & Lock Engine' },
    { name: 'Order Service (Port 8084)', status: 'HEALTHY', details: 'Distributed Saga Order Fulfillment' },
  ];

  return (
    <div className="flex flex-col gap-6 text-left max-w-7xl mx-auto pb-12">
      <PageHeader
        title="Admin Control Center"
        subtitle="Executive system metrics, platform architecture, operational manager status, and service health."
        actions={
          <Button variant="ghost" onClick={fetchData} leftIcon={<RefreshCw className="w-4 h-4" />}>
            Refresh Metrics
          </Button>
        }
      />

      {/* Operational Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Products"
          value={loading ? '...' : stats.productsCount}
          change="Registered SKUs"
          icon={<Package className="w-6 h-6" />}
          variant="blue"
        />
        <StatCard
          title="Warehouses"
          value={loading ? '...' : stats.warehousesCount}
          change="Fulfillment hubs"
          icon={<Building2 className="w-6 h-6" />}
          variant="blue"
        />
        <StatCard
          title="Total Managers"
          value={loading ? '...' : stats.totalManagers}
          change={`${stats.activeManagers} Active / ${stats.inactiveManagers} Inactive`}
          icon={<UserCheck className="w-6 h-6" />}
          variant="amber"
        />
        <StatCard
          title="Low Stock Alerts"
          value={loading ? '...' : stats.lowStockCount}
          change="Records <= Reorder Level"
          isPositive={false}
          icon={<AlertTriangle className="w-6 h-6" />}
          variant="amber"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="Customer Orders"
          value={loading ? '...' : stats.ordersCount}
          change="Total platform orders"
          icon={<ShoppingBag className="w-6 h-6" />}
          variant="purple"
        />
        <StatCard
          title="Stock Transactions"
          value={loading ? '...' : stats.recentTransactionsCount}
          change="Audit movement records"
          icon={<Activity className="w-6 h-6" />}
          variant="blue"
        />
        <StatCard
          title="Platform Status"
          value="OPERATIONAL"
          change="6 Microservices Active"
          icon={<CheckCircle2 className="w-6 h-6" />}
          variant="emerald"
        />
      </div>

      {/* Manager Distribution Card */}
      <Card title="Manager Distribution by Warehouse">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-xs text-slate-400 uppercase font-bold block mb-1">Total Managers</span>
            <span className="text-2xl font-black text-amber-400">{stats.totalManagers}</span>
            <span className="text-[11px] text-slate-400 block mt-1">Operational role accounts</span>
          </div>
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-xs text-slate-400 uppercase font-bold block mb-1">Active Managers</span>
            <span className="text-2xl font-black text-emerald-400">{stats.activeManagers}</span>
            <span className="text-[11px] text-slate-400 block mt-1">Authentication enabled</span>
          </div>
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-xs text-slate-400 uppercase font-bold block mb-1">Inactive Managers</span>
            <span className="text-2xl font-black text-rose-400">{stats.inactiveManagers}</span>
            <span className="text-[11px] text-slate-400 block mt-1">Access suspended</span>
          </div>
        </div>
      </Card>

      {/* Microservices Cluster Health */}
      <Card title="Spring Boot Microservices Cluster Health">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((srv, idx) => (
            <div key={idx} className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg">
                  <Server className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-100 text-sm">{srv.name}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">{srv.details}</p>
                </div>
              </div>
              <Badge variant="success">{srv.status}</Badge>
            </div>
          ))}
        </div>
      </Card>

      {/* Infrastructure Safeguards */}
      <Card title="Infrastructure & Concurrency Safety Protocols">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
            <ShieldCheck className="w-6 h-6 text-indigo-400 mb-2" />
            <h5 className="font-bold text-slate-200 text-sm">Pessimistic Locks</h5>
            <p className="text-xs text-slate-400 mt-1">
              PESSIMISTIC_WRITE locks prevent stock allocation race conditions during concurrent checkout.
            </p>
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
            <Database className="w-6 h-6 text-emerald-400 mb-2" />
            <h5 className="font-bold text-slate-200 text-sm">PostgreSQL Multi-Database</h5>
            <p className="text-xs text-slate-400 mt-1">
              Dedicated databases for Auth, Product, Inventory, and Order domains with Flyway migrations.
            </p>
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
            <Layers className="w-6 h-6 text-sky-400 mb-2" />
            <h5 className="font-bold text-slate-200 text-sm">Eureka Discovery & Gateway</h5>
            <p className="text-xs text-slate-400 mt-1">
              Centralized API Gateway router with Eureka service discovery and JWT token verification.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
