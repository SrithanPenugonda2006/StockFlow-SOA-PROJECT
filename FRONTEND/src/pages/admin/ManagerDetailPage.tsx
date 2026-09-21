import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { adminApi, Manager, AdminAuditLog } from '../../api/adminApi';
import {
  UserCheck,
  Mail,
  Phone,
  Calendar,
  Warehouse as WarehouseIcon,
  ShieldCheck,
  Edit,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  History,
  AlertCircle,
} from 'lucide-react';

export const ManagerDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [manager, setManager] = useState<Manager | null>(null);
  const [activity, setActivity] = useState<AdminAuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const mgrId = parseInt(id, 10);
        const [mgr, actList] = await Promise.all([
          adminApi.getManagerById(mgrId),
          adminApi.getManagerActivity(mgrId).catch(() => []),
        ]);
        setManager(mgr);
        setActivity(actList);
      } catch (err: any) {
        console.error('Failed to load manager details:', err);
        setError(err.message || 'Failed to fetch manager details.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-400 text-sm animate-pulse max-w-5xl mx-auto">
        Loading manager profile details...
      </div>
    );
  }

  if (error || !manager) {
    return (
      <div className="flex flex-col gap-4 max-w-5xl mx-auto text-left">
        <Button variant="outline" onClick={() => navigate('/admin/managers')} className="w-fit flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Managers</span>
        </Button>
        <div className="p-6 rounded-xl bg-gray-100 border border-gray-800 text-gray-900 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error || 'Manager profile not found.'}</span>
        </div>
      </div>
    );
  }

  // Permission Matrix representation
  const permissions = [
    { module: 'Dashboard', view: true, create: false, edit: false, desc: 'Operational Overview' },
    { module: 'Products', view: true, create: true, edit: true, desc: 'Manage Catalog Products' },
    { module: 'Warehouses', view: true, create: false, edit: false, desc: 'View Assigned Warehouses' },
    { module: 'Inventory', view: true, create: true, edit: true, desc: 'Update & Stock Adjustments' },
    { module: 'Low Stock', view: true, create: false, edit: false, desc: 'Low Stock Monitoring' },
    { module: 'Reconciliation', view: true, create: true, edit: true, desc: 'Stock Physical Reconciliation' },
    { module: 'Transactions', view: true, create: false, edit: false, desc: 'Audit Stock Movement' },
    { module: 'Orders', view: true, create: true, edit: true, desc: 'Process Customer Orders' },
    { module: 'Administration', view: false, create: false, edit: false, desc: 'Restricted (Admin Only)' },
  ];

  return (
    <div className="flex flex-col gap-6 text-left max-w-5xl mx-auto pb-12">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => navigate('/admin/managers')} className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Managers</span>
        </Button>
        <Button onClick={() => navigate(`/admin/managers/${manager.id}/edit`)} className="flex items-center gap-2">
          <Edit className="w-4 h-4" />
          <span>Edit Manager</span>
        </Button>
      </div>

      <PageHeader title={manager.fullName} subtitle={`@${manager.username} • Operational Manager Account`} />

      {/* Grid: Profile & Warehouse Access */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card title="Manager Profile" className="md:col-span-1">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
              <div className="p-3 rounded-2xl bg-gray-100 border border-gray-600 text-gray-700">
                <UserCheck className="w-8 h-8" />
              </div>
              <div>
                <span className="font-bold text-gray-900 block text-base">{manager.fullName}</span>
                <span className="text-xs text-gray-500 font-mono">@{manager.username}</span>
              </div>
            </div>

            <div className="flex flex-col gap-3 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-gray-500 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-gray-700" />
                  Role
                </span>
                <Badge variant="warning">{manager.role}</Badge>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-500 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-gray-900" />
                  Status
                </span>
                <Badge variant={manager.status === 'ACTIVE' ? 'success' : 'danger'}>{manager.status}</Badge>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                <span className="text-gray-500 flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-[#666666]" />
                  Email
                </span>
                <span className="text-gray-800 font-mono">{manager.email}</span>
              </div>

              {manager.phone && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 flex items-center gap-1.5">
                    <Phone className="w-4 h-4 text-[#666666]" />
                    Phone
                  </span>
                  <span className="text-gray-800">{manager.phone}</span>
                </div>
              )}

              <div className="flex justify-between items-center">
                <span className="text-gray-500 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  Created
                </span>
                <span className="text-gray-600 font-mono">{manager.createdAt}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Warehouse Access Card */}
        <Card title="Assigned Warehouse Access" className="md:col-span-2">
          <p className="text-xs text-gray-500 mb-4">
            This manager is authorized to access and operate on the following warehouse locations:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {manager.assignedWarehouses && manager.assignedWarehouses.length > 0 ? (
              manager.assignedWarehouses.map((w) => (
                <div
                  key={w.warehouseId}
                  className="p-4 rounded-xl bg-[#F7F8FA] border border-gray-200 flex items-start gap-3"
                >
                  <div className="p-2.5 rounded-lg bg-[#F5F5F5] border border-[#E5E5E5] text-[#666666] shrink-0">
                    <WarehouseIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-sm text-gray-900 block">{w.warehouseName}</span>
                    <span className="text-xs text-[#666666] mt-0.5 block font-mono">ID: WAREHOUSE-{w.warehouseId}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 rounded-xl bg-[#F7F8FA] border border-gray-200 text-xs text-gray-400 italic">
                No warehouses currently assigned.
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Permissions Matrix Card */}
      <Card title="Effective Operational Permissions">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-200 text-gray-500 uppercase font-semibold">
                <th className="py-2.5 px-3">Module</th>
                <th className="py-2.5 px-3">Scope Description</th>
                <th className="py-2.5 px-3 text-center">View</th>
                <th className="py-2.5 px-3 text-center">Create</th>
                <th className="py-2.5 px-3 text-center">Edit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100/60">
              {permissions.map((p) => (
                <tr key={p.module} className="hover:bg-white/50">
                  <td className="py-3 px-3 font-bold text-gray-800">{p.module}</td>
                  <td className="py-3 px-3 text-gray-500">{p.desc}</td>
                  <td className="py-3 px-3 text-center">
                    {p.view ? (
                      <CheckCircle2 className="w-4 h-4 text-gray-900 mx-auto" />
                    ) : (
                      <XCircle className="w-4 h-4 text-slate-600 mx-auto" />
                    )}
                  </td>
                  <td className="py-3 px-3 text-center">
                    {p.create ? (
                      <CheckCircle2 className="w-4 h-4 text-gray-900 mx-auto" />
                    ) : (
                      <XCircle className="w-4 h-4 text-slate-600 mx-auto" />
                    )}
                  </td>
                  <td className="py-3 px-3 text-center">
                    {p.edit ? (
                      <CheckCircle2 className="w-4 h-4 text-gray-900 mx-auto" />
                    ) : (
                      <XCircle className="w-4 h-4 text-slate-600 mx-auto" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Manager Activity / Audit History */}
      <Card title="Recent Manager Activity & Audit History">
        {activity.length === 0 ? (
          <div className="p-6 text-center text-xs text-gray-400 flex flex-col items-center gap-2">
            <History className="w-6 h-6 text-slate-600" />
            <span>No logged audit activity recorded for this manager account yet.</span>
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-gray-100">
            {activity.map((act) => (
              <div key={act.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-[#666666]">{act.action}</span>
                  <span className="text-gray-600 ml-2">{act.details}</span>
                </div>
                <span className="text-gray-400 font-mono">{act.createdAt}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
