import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable, Column } from '../../components/common/DataTable';
import { Badge } from '../../components/common/Badge';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { adminApi, AdminUser } from '../../api/adminApi';
import { User, Mail, Search, Filter, ShieldCheck, Power, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';

export const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // Role change modal
  const [roleModalUser, setRoleModalUser] = useState<AdminUser | null>(null);
  const [selectedRole, setSelectedRole] = useState<'ADMIN' | 'MANAGER' | 'CUSTOMER'>('CUSTOMER');
  const [isSavingRole, setIsSavingRole] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.getUsers();
      setUsers(data);
    } catch (err: any) {
      console.error('Failed to load system users:', err);
      setError(err.message || 'Failed to fetch platform users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (user: AdminUser) => {
    const nextStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await adminApi.updateUserStatus(user.id, nextStatus);
      setToastMsg(`User ${user.username} status set to ${nextStatus}.`);
      fetchUsers();
      setTimeout(() => setToastMsg(null), 3000);
    } catch (err: any) {
      console.error('Failed to update user status:', err);
      setError('Failed to update user status.');
    }
  };

  const handleDeleteUser = async (user: AdminUser) => {
    if (!window.confirm(`Are you sure you want to delete user @${user.username}?`)) return;
    try {
      await adminApi.deleteUser(user.id);
      setToastMsg(`User @${user.username} deleted.`);
      fetchUsers();
      setTimeout(() => setToastMsg(null), 3000);
    } catch (err: any) {
      console.error('Failed to delete user:', err);
      setError('Failed to delete user account.');
    }
  };

  const handleRoleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleModalUser) return;
    setIsSavingRole(true);
    try {
      await adminApi.updateUserRole(roleModalUser.id, selectedRole);
      setToastMsg(`Updated role for @${roleModalUser.username} to ${selectedRole}.`);
      setRoleModalUser(null);
      fetchUsers();
      setTimeout(() => setToastMsg(null), 3000);
    } catch (err: any) {
      console.error('Failed to update user role:', err);
      setError('Failed to update user role.');
    } finally {
      setIsSavingRole(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, roleFilter]);

  const filteredUsers = users.filter((u) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      (u.fullName && u.fullName.toLowerCase().includes(term)) ||
      u.username.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term);

    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const startIndex = (currentPage - 1) * pageSize;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + pageSize);

  const columns: Column<AdminUser>[] = [
    {
      header: 'User Account',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#F5F5F5] border border-[#E5E5E5] text-[#666666]">
            <User className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-gray-900 text-sm block">
              {row.fullName || row.username}
            </span>
            <span className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
              <Mail className="w-3 h-3 text-gray-400" />
              {row.email}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: 'Assigned Role',
      cell: (row) => {
        const variant =
          row.role === 'ADMIN'
            ? 'purple'
            : row.role === 'MANAGER'
            ? 'warning'
            : 'info';
        return <Badge variant={variant}>{row.role}</Badge>;
      },
    },
    {
      header: 'Status',
      cell: (row) => (
        <Badge variant={row.status === 'ACTIVE' ? 'success' : 'danger'}>{row.status}</Badge>
      ),
    },
    {
      header: 'Actions',
      cell: (row) => (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setRoleModalUser(row);
              setSelectedRole(row.role as 'ADMIN' | 'MANAGER' | 'CUSTOMER');
            }}
            title="Change Role"
          >
            <ShieldCheck className="w-4 h-4 text-gray-500 hover:text-gray-700" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleToggleStatus(row)}
            title={row.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
          >
            <Power
              className={`w-4 h-4 ${
                row.status === 'ACTIVE'
                  ? 'text-gray-500 hover:text-gray-900'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            />
          </Button>
          {row.username !== 'admin' && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleDeleteUser(row)}
              title="Delete Account"
            >
              <Trash2 className="w-4 h-4 text-gray-500 hover:text-gray-900" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6 text-left max-w-7xl mx-auto pb-12">
      <PageHeader
        title="Platform Users"
        subtitle="Manage all registered StockFlow user accounts, role allocations, and security privileges."
      />

      {toastMsg && (
        <div className="p-4 rounded-xl bg-gray-100 border border-gray-800 text-gray-900 text-sm flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-gray-100 border border-gray-800 text-gray-900 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter and Search Toolbar */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#F7F8FA] border border-gray-200 rounded-xl pl-10 pr-4 py-2 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:border-[#D4D4D4] transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-xs text-gray-500 font-medium">Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-[#F7F8FA] border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-[#D4D4D4]"
            >
              <option value="ALL">All Roles</option>
              <option value="ADMIN">ADMIN</option>
              <option value="MANAGER">MANAGER</option>
              <option value="CUSTOMER">CUSTOMER</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Users Table */}
      <Card title={`System Users (${filteredUsers.length})`}>
        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm animate-pulse">
            Fetching platform users from Gateway...
          </div>
        ) : (
          <DataTable columns={columns} data={paginatedUsers} keyExtractor={(item) => item.id.toString()} pagination={{ currentPage, totalItems: filteredUsers.length, pageSize, onPageChange: setCurrentPage }} />
        )}
      </Card>

      {/* Change Role Modal */}
      {roleModalUser && (
        <Modal
          isOpen={!!roleModalUser}
          onClose={() => setRoleModalUser(null)}
          title={`Change Role for ${roleModalUser.username}`}
        >
          <form onSubmit={handleRoleSave} className="flex flex-col gap-4 text-left">
            <p className="text-xs text-gray-500">
              Select the system access level for user <strong className="text-gray-800">@{roleModalUser.username}</strong>:
            </p>

            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">Select Role *</label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as any)}
                className="w-full bg-[#F7F8FA] border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-[#D4D4D4]"
              >
                <option value="CUSTOMER">CUSTOMER - Storefront & Order Placement</option>
                <option value="MANAGER">MANAGER - Operational Warehouse Management</option>
                <option value="ADMIN">ADMIN - Full Enterprise Administration</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-200">
              <Button type="button" variant="outline" onClick={() => setRoleModalUser(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSavingRole}>
                {isSavingRole ? 'Saving...' : 'Update Role'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
