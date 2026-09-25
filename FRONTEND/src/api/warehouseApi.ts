import { apiClient } from './axios';
import { Warehouse, WarehouseCreateDTO } from '../types/warehouse';

export const warehouseApi = {
  getWarehouses: async (): Promise<Warehouse[]> => {
    const response = await apiClient.get<Warehouse[]>('/api/inventory/warehouses');
    return response.data;
  },

  getWarehouseById: async (id: number): Promise<Warehouse> => {
    const response = await apiClient.get<Warehouse>(`/api/inventory/warehouses/${id}`);
    return response.data;
  },

  getWarehouse: async (id: number): Promise<Warehouse> => {
    const response = await apiClient.get<Warehouse>(`/api/inventory/warehouses/${id}`);
    return response.data;
  },

  createWarehouse: async (warehouseData: WarehouseCreateDTO): Promise<Warehouse> => {
    const response = await apiClient.post<Warehouse>('/api/inventory/warehouses', warehouseData);
    return response.data;
  },

  updateWarehouse: async (id: number, warehouseData: WarehouseCreateDTO): Promise<Warehouse> => {
    const response = await apiClient.put<Warehouse>(`/api/inventory/warehouses/${id}`, warehouseData);
    return response.data;
  },

  deleteWarehouse: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/inventory/warehouses/${id}`);
  },
};
