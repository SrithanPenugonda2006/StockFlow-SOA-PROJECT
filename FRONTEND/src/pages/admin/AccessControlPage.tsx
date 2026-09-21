import React from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { ShieldCheck, CheckCircle2, XCircle } from 'lucide-react';

interface PermissionRow {
  module: string;
  admin: { view: boolean; create: boolean; edit: boolean; delete: boolean };
  manager: { view: boolean; create: boolean; edit: boolean; delete: boolean };
  customer: { view: boolean; create: boolean; edit: boolean; delete: boolean };
}

export const AccessControlPage: React.FC = () => {
  const permissions: PermissionRow[] = [
    {
      module: 'Dashboard Overview',
      admin: { view: true, create: true, edit: true, delete: true },
      manager: { view: true, create: false, edit: false, delete: false },
      customer: { view: false, create: false, edit: false, delete: false },
    },
    {
      module: 'Products Catalog',
      admin: { view: true, create: true, edit: true, delete: true },
      manager: { view: true, create: true, edit: true, delete: false },
      customer: { view: true, create: false, edit: false, delete: false },
    },
    {
      module: 'Warehouses',
      admin: { view: true, create: true, edit: true, delete: true },
      manager: { view: true, create: false, edit: false, delete: false },
      customer: { view: false, create: false, edit: false, delete: false },
    },
    {
      module: 'Inventory (Assigned Warehouses)',
      admin: { view: true, create: true, edit: true, delete: true },
      manager: { view: true, create: true, edit: true, delete: false },
      customer: { view: false, create: false, edit: false, delete: false },
    },
    {
      module: 'Low Stock Alerts',
      admin: { view: true, create: true, edit: true, delete: true },
      manager: { view: true, create: false, edit: false, delete: false },
      customer: { view: false, create: false, edit: false, delete: false },
    },
    {
      module: 'Reconciliation',
      admin: { view: true, create: true, edit: true, delete: true },
      manager: { view: true, create: true, edit: true, delete: false },
      customer: { view: false, create: false, edit: false, delete: false },
    },
    {
      module: 'Stock Transactions',
      admin: { view: true, create: true, edit: true, delete: true },
      manager: { view: true, create: false, edit: false, delete: false },
      customer: { view: false, create: false, edit: false, delete: false },
    },
    {
      module: 'Customer Orders',
      admin: { view: true, create: true, edit: true, delete: true },
      manager: { view: true, create: true, edit: true, delete: false },
      customer: { view: true, create: true, edit: false, delete: false },
    },
    {
      module: 'Administration (Managers / Users / Security)',
      admin: { view: true, create: true, edit: true, delete: true },
      manager: { view: false, create: false, edit: false, delete: false },
      customer: { view: false, create: false, edit: false, delete: false },
    },
  ];

  const renderCell = (active: boolean) =>
    active ? (
      <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" />
    ) : (
      <XCircle className="w-4 h-4 text-slate-700 mx-auto" />
    );

  return (
    <div className="flex flex-col gap-6 text-left max-w-7xl mx-auto pb-12">
      <PageHeader
        title="Role-Based Access Control (RBAC)"
        subtitle="Operational and administrative security permissions matrix for ADMIN, MANAGER, and CUSTOMER roles."
      />

      {/* Role Summary Badges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 flex items-center gap-3">
          <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-100 text-sm">ADMIN</span>
              <Badge variant="purple">Superuser</Badge>
            </div>
            <span className="text-xs text-slate-400 block mt-0.5">
              Full system control, manager management, audit logs, and settings.
            </span>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-100 text-sm">MANAGER</span>
              <Badge variant="warning">Operational</Badge>
            </div>
            <span className="text-xs text-slate-400 block mt-0.5">
              Restricted to assigned warehouses for inventory, products, and orders.
            </span>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-100 text-sm">CUSTOMER</span>
              <Badge variant="info">End-User</Badge>
            </div>
            <span className="text-xs text-slate-400 block mt-0.5">
              Browse products, place orders, view order history.
            </span>
          </div>
        </Card>
      </div>

      {/* Permissions Matrix Table */}
      <Card title="RBAC Permission Matrix">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase font-semibold">
                <th className="py-3 px-4">System Module</th>
                <th className="py-3 px-4 text-center border-l border-slate-800/80 bg-purple-950/20 text-purple-300" colSpan={4}>
                  ADMIN
                </th>
                <th className="py-3 px-4 text-center border-l border-slate-800/80 bg-amber-950/20 text-amber-300" colSpan={4}>
                  MANAGER
                </th>
                <th className="py-3 px-4 text-center border-l border-slate-800/80 bg-blue-950/20 text-blue-300" colSpan={4}>
                  CUSTOMER
                </th>
              </tr>
              <tr className="border-b border-slate-800 text-[10px] text-slate-500 uppercase">
                <th className="py-1 px-4"></th>
                <th className="py-1 px-2 text-center border-l border-slate-800/80">View</th>
                <th className="py-1 px-2 text-center">Create</th>
                <th className="py-1 px-2 text-center">Edit</th>
                <th className="py-1 px-2 text-center">Delete</th>
                <th className="py-1 px-2 text-center border-l border-slate-800/80">View</th>
                <th className="py-1 px-2 text-center">Create</th>
                <th className="py-1 px-2 text-center">Edit</th>
                <th className="py-1 px-2 text-center">Delete</th>
                <th className="py-1 px-2 text-center border-l border-slate-800/80">View</th>
                <th className="py-1 px-2 text-center">Create</th>
                <th className="py-1 px-2 text-center">Edit</th>
                <th className="py-1 px-2 text-center">Delete</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {permissions.map((p) => (
                <tr key={p.module} className="hover:bg-slate-900/50">
                  <td className="py-3 px-4 font-bold text-slate-200">{p.module}</td>
                  {/* ADMIN */}
                  <td className="py-3 px-2 text-center border-l border-slate-800/80">{renderCell(p.admin.view)}</td>
                  <td className="py-3 px-2 text-center">{renderCell(p.admin.create)}</td>
                  <td className="py-3 px-2 text-center">{renderCell(p.admin.edit)}</td>
                  <td className="py-3 px-2 text-center">{renderCell(p.admin.delete)}</td>
                  {/* MANAGER */}
                  <td className="py-3 px-2 text-center border-l border-slate-800/80">{renderCell(p.manager.view)}</td>
                  <td className="py-3 px-2 text-center">{renderCell(p.manager.create)}</td>
                  <td className="py-3 px-2 text-center">{renderCell(p.manager.edit)}</td>
                  <td className="py-3 px-2 text-center">{renderCell(p.manager.delete)}</td>
                  {/* CUSTOMER */}
                  <td className="py-3 px-2 text-center border-l border-slate-800/80">{renderCell(p.customer.view)}</td>
                  <td className="py-3 px-2 text-center">{renderCell(p.customer.create)}</td>
                  <td className="py-3 px-2 text-center">{renderCell(p.customer.edit)}</td>
                  <td className="py-3 px-2 text-center">{renderCell(p.customer.delete)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
