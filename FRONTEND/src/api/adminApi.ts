import { apiClient } from './axios';

export interface AdminUser {
  id: number;
  fullName: string;
  username: string;
  email: string;
  phone?: string;
  role: string;
  status: 'ACTIVE' | 'INACTIVE';
  organizationId: number;
}

export interface AssignedWarehouse {
  warehouseId: number;
  warehouseName: string;
}

export interface Manager {
  id: number;
  fullName: string;
  username: string;
  email: string;
  phone?: string;
  role: string;
  status: 'ACTIVE' | 'INACTIVE';
  organizationId: number;
  assignedWarehouses: AssignedWarehouse[];
  mustChangePassword?: boolean;
  message?: string;
  createdAt: string;
}

export interface ManagerCreateData {
  fullName: string;
  email: string;
  phone?: string;
  username: string;
  password?: string;
  role?: string;
  status?: string;
  warehouseIds: number[];
}

export interface ManagerUpdateData {
  fullName: string;
  email: string;
  phone?: string;
  role?: string;
  status?: string;
  warehouseIds: number[];
}

export interface Organization {
  id: number;
  name: string;
  code: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt?: string;
  updatedAt?: string;
}

export interface UserInvitation {
  id: number;
  email: string;
  role: string;
  status: string;
  invitedBy: string;
  token: string;
  mustChangePassword?: boolean;
  message?: string;
  createdAt: string;
}

export interface AdminAuditLog {
  id: number;
  actorUsername: string;
  action: string;
  resourceType: string;
  resourceId: string;
  details: string;
  mustChangePassword?: boolean;
  message?: string;
  createdAt: string;
}

export interface SystemSetting {
  settingKey: string;
  settingValue: string;
  updatedAt: string;
}

export interface AdminOverviewStats {
  totalUsers: number;
  totalAdminUsers: number;
  totalManagerUsers: number;
  totalCustomerUsers: number;
  totalOrganizations: number;
  totalAuditLogs: number;
}

export const adminApi = {
  // Managers
  getManagers: async (): Promise<Manager[]> => {
    const response = await apiClient.get<Manager[]>('/api/admin/managers');
    return response.data;
  },

  getManagerById: async (id: number): Promise<Manager> => {
    const response = await apiClient.get<Manager>(`/api/admin/managers/${id}`);
    return response.data;
  },

  createManager: async (data: ManagerCreateData): Promise<Manager> => {
    const response = await apiClient.post<Manager>('/api/admin/managers', data);
    return response.data;
  },

  updateManager: async (id: number, data: ManagerUpdateData): Promise<Manager> => {
    const response = await apiClient.put<Manager>(`/api/admin/managers/${id}`, data);
    return response.data;
  },

  updateManagerStatus: async (id: number, status: string): Promise<Manager> => {
    const response = await apiClient.patch<Manager>(`/api/admin/managers/${id}/status`, { status });
    return response.data;
  },

  resetManagerPassword: async (id: number, newPassword: string): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>(`/api/admin/managers/${id}/reset-password`, { newPassword });
    return response.data;
  },

  getManagerActivity: async (id: number): Promise<AdminAuditLog[]> => {
    const response = await apiClient.get<AdminAuditLog[]>(`/api/admin/managers/${id}/activity`);
    return response.data;
  },

  // Users
  getUsers: async (): Promise<AdminUser[]> => {
    const response = await apiClient.get<AdminUser[]>('/api/admin/users');
    return response.data;
  },

  getUserById: async (id: number): Promise<AdminUser> => {
    const response = await apiClient.get<AdminUser>(`/api/admin/users/${id}`);
    return response.data;
  },

  updateUserRole: async (id: number, role: string): Promise<AdminUser> => {
    const response = await apiClient.put<AdminUser>(`/api/admin/users/${id}/role`, { role });
    return response.data;
  },

  updateUserStatus: async (id: number, status: string): Promise<AdminUser> => {
    const response = await apiClient.patch<AdminUser>(`/api/admin/users/${id}/status`, { status });
    return response.data;
  },

  deleteUser: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/admin/users/${id}`);
  },

  // Organizations
  getOrganizations: async (): Promise<Organization[]> => {
    const response = await apiClient.get<Organization[]>('/api/admin/organizations');
    return response.data;
  },

  getOrganizationById: async (id: number): Promise<Organization> => {
    const response = await apiClient.get<Organization>(`/api/admin/organizations/${id}`);
    return response.data;
  },

  getOrganizationUsers: async (id: number): Promise<AdminUser[]> => {
    const response = await apiClient.get<AdminUser[]>(`/api/admin/organizations/${id}/users`);
    return response.data;
  },

  createOrganization: async (data: { name: string; code: string; status?: string }): Promise<Organization> => {
    const response = await apiClient.post<Organization>('/api/admin/organizations', data);
    return response.data;
  },

  updateOrganization: async (id: number, data: { name: string; code: string; status?: string }): Promise<Organization> => {
    const response = await apiClient.put<Organization>(`/api/admin/organizations/${id}`, data);
    return response.data;
  },

  updateOrganizationStatus: async (id: number, status: string): Promise<Organization> => {
    const response = await apiClient.patch<Organization>(`/api/admin/organizations/${id}/status`, { status });
    return response.data;
  },

  deleteOrganization: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/admin/organizations/${id}`);
  },

  // Invitations
  getInvitations: async (): Promise<UserInvitation[]> => {
    const response = await apiClient.get<UserInvitation[]>('/api/admin/invitations');
    return response.data;
  },

  createInvitation: async (data: { email: string; role: string }): Promise<UserInvitation> => {
    const response = await apiClient.post<UserInvitation>('/api/admin/invitations', data);
    return response.data;
  },

  // Audit Logs
  getAuditLogs: async (): Promise<AdminAuditLog[]> => {
    const response = await apiClient.get<AdminAuditLog[]>('/api/admin/audit-logs');
    return response.data;
  },

  // Settings
  getSettings: async (): Promise<SystemSetting[]> => {
    const response = await apiClient.get<SystemSetting[]>('/api/admin/settings');
    return response.data;
  },

  updateSetting: async (key: string, value: string): Promise<SystemSetting> => {
    const response = await apiClient.put<SystemSetting>('/api/admin/settings', { key, value });
    return response.data;
  },

  // Analytics & Reports
  getOverviewStats: async (): Promise<AdminOverviewStats> => {
    const response = await apiClient.get<AdminOverviewStats>('/api/admin/analytics/overview');
    return response.data;
  },

  downloadReport: async (reportType: string): Promise<void> => {
    const response = await apiClient.get(`/api/admin/analytics/reports/export`, {
      params: { reportType },
      responseType: 'blob',
    });
    const blob = new Blob([response.data], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${reportType}-report.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};
