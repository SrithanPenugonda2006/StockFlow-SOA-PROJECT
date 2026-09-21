import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { DataTable, Column } from '../../components/common/DataTable';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { adminApi, Manager } from '../../api/adminApi';
import { warehouseApi } from '../../api/warehouseApi';
import { Warehouse } from '../../types/warehouse';
import {
  UserCheck,
  UserPlus,
  Search,
  Filter,
  Mail,
  Phone,
  Warehouse as WarehouseIcon,
  Eye,
  Edit,
  Power,
  KeyRound,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

export const ManagersListPage: React.FC = () => {
  const navigate = useNavigate();

  const [managers, setManagers] = useState<Manager[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [warehouseFilter, setWarehouseFilter] = useState<string>('ALL');

  // Password reset modal state
  const [resetModalManager, setResetModalManager] = useState<Manager | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetError, setResetError] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [mgrList, whList] = await Promise.all([
        adminApi.getManagers(),
        warehouseApi.getWarehouses().catch(() => [
          { id: 1, name: 'Hyderabad Central Hub', location: 'Hyderabad' },
          { id: 2, name: 'Bengaluru Logistics Park', location: 'Bengaluru' },
        ]),
      ]);
      setManagers(mgrList);
      setWarehouses(whList);
    } catch (err: any) {
      console.error('Failed to load managers:', err);
      setError(err.message || 'Failed to fetch managers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleStatus = async (mgr: Manager) => {
    const nextStatus = mgr.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await adminApi.updateManagerStatus(mgr.id, nextStatus);
      setToastMsg(`Manager status updated to ${nextStatus}.`);
      loadData();
      setTimeout(() => setToastMsg(null), 3000);
    } catch (err: any) {
      console.error('Failed to update status:', err);
      setError('Failed to update manager status.');
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);

    if (!resetModalManager) return;
    if (newPassword.length < 6) {
      setResetError('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setResetError('Passwords do not match.');
      return;
    }

    setIsResetting(true);
    try {
      await adminApi.resetManagerPassword(resetModalManager.id, newPassword);
      setToastMsg(`Password reset successfully for ${resetModalManager.username}.`);
      setResetModalManager(null);
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setToastMsg(null), 3000);
    } catch (err: any) {
      console.error('Failed to reset password:', err);
      setResetError(err.response?.data?.message || err.message || 'Failed to reset password.');
    } finally {
      setIsResetting(false);
    }
  };

  const filteredManagers = managers.filter((m) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      m.fullName.toLowerCase().includes(term) ||
      m.username.toLowerCase().includes(term) ||
      m.email.toLowerCase().includes(term);

    const matchesStatus = statusFilter === 'ALL' || m.status === statusFilter;

    const matchesWarehouse =
      warehouseFilter === 'ALL' ||
      m.assignedWarehouses?.some((w) => w.warehouseId.toString() === warehouseFilter);

    return matchesSearch && matchesStatus && matchesWarehouse;
  });

  const columns: Column<Manager>[] = [
    {
      header: 'Manager Identity',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-slate-100 text-sm block">{row.fullName}</span>
            <span className="text-xs text-slate-400 font-mono">@{row.username}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Contact Info',
      cell: (row) => (
        <div>
          <span className="text-xs text-slate-200 flex items-center gap-1">
            <Mail className="w-3.5 h-3.5 text-slate-400" />
            {row.email}
          </span>
          {row.phone && (
            <span className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
              <Phone className="w-3.5 h-3.5 text-slate-500" />
              {row.phone}
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'Assigned Warehouses',
      cell: (row) => (
        <div className="flex flex-wrap gap-1 max-w-xs">
          {row.assignedWarehouses && row.assignedWarehouses.length > 0 ? (
            row.assignedWarehouses.map((w) => (
              <span
                key={w.warehouseId}
                className="px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[11px] font-medium flex items-center gap-1"
              >
                <WarehouseIcon className="w-3 h-3 text-indigo-400" />
                {w.warehouseName}
              </span>
            ))
          ) : (
            <span className="text-xs text-slate-500 italic">No Warehouses</span>
          )}
        </div>
      ),
    },
    {
      header: 'Role',
      cell: (row) => <Badge variant="warning">{row.role}</Badge>,
    },
    {
      header: 'Status',
      cell: (row) => (
        <Badge variant={row.status === 'ACTIVE' ? 'success' : 'danger'}>{row.status}</Badge>
      ),
    },
    {
      header: 'Created Date',
      cell: (row) => <span className="text-xs text-slate-400 font-mono">{row.createdAt}</span>,
    },
    {
      header: "Actions",
      cell: (row) => (
        <div className="flex items-center gap-1.5">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => navigate(`/admin/managers/${row.id}`)}
            title="View Details"
          >
            <Eye className="w-4 h-4 text-slate-400 hover:text-indigo-400" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => navigate(`/admin/managers/${row.id}/edit`)}
            title="Edit Manager"
          >
            <Edit className="w-4 h-4 text-slate-400 hover:text-amber-400" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setResetModalManager(row)}
            title="Reset Password"
          >
            <KeyRound className="w-4 h-4 text-slate-400 hover:text-purple-400" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleToggleStatus(row)}
            title={row.status === "ACTIVE" ? "Deactivate Account" : "Activate Account"}
          >
            <Power
              className={`w-4 h-4 ${
                row.status === "ACTIVE"
                  ? "text-slate-400 hover:text-rose-400"
                  : "text-slate-400 hover:text-emerald-400"
              }`}
            />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6 text-left max-w-7xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="All Managers"
          subtitle="Enterprise operational manager directory, role assignments, and warehouse permissions."
        />
        <Button onClick={() => navigate('/admin/managers/add')} className="shrink-0 flex items-center gap-2">
          <UserPlus className="w-4 h-4" />
          <span>Add Manager</span>
        </Button>
      </div>

      {toastMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter and Search Toolbar */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-3 justify-between items-center">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search managers by name, email, username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <span className="text-xs text-slate-400 font-medium">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <WarehouseIcon className="w-4 h-4 text-slate-400" />
              <span className="text-xs text-slate-400 font-medium">Warehouse:</span>
              <select
                value={warehouseFilter}
                onChange={(e) => setWarehouseFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="ALL">All Warehouses</option>
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id.toString()}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Managers Table */}
      <Card title={`Operational Managers (${filteredManagers.length})`}>
        {loading ? (
          <div className="p-8 text-center text-slate-500 text-sm animate-pulse">
            Loading managers from StockFlow Gateway...
          </div>
        ) : (
          <DataTable columns={columns} data={filteredManagers} keyExtractor={(item) => item.id.toString()} />
        )}
      </Card>

      {/* Reset Password Modal */}
      {resetModalManager && (
        <Modal
          isOpen={!!resetModalManager}
          onClose={() => setResetModalManager(null)}
          title={`Reset Password for ${resetModalManager.fullName}`}
        >
          <form onSubmit={handleResetPasswordSubmit} className="flex flex-col gap-4 text-left">
            <p className="text-xs text-slate-400">
              Enter a new secure password for <strong className="text-slate-200">@{resetModalManager.username}</strong>.
            </p>

            {resetError && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                {resetError}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">New Password *</label>
              <input
                type="password"
                required
                placeholder="At least 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Confirm New Password *</label>
              <input
                type="password"
                required
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <Button type="button" variant="outline" onClick={() => setResetModalManager(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isResetting}>
                {isResetting ? 'Resetting...' : 'Reset Password'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
