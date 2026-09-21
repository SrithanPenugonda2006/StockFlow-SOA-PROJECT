import { apiClient } from './axios';
import {
  Inventory,
  InventoryCreateDTO,
  LowStockItem,
  ReconciliationRequest,
  StockReservationRequest,
  InventoryTransaction,
} from '../types/inventory';
import { PageResponse } from '../types/common';

export const inventoryApi = {
  addInventory: async (dto: InventoryCreateDTO): Promise<Inventory> => {
    const response = await apiClient.post<Inventory>('/api/inventory', dto);
    return response.data;
  },

  updateInventory: async (id: number, dto: InventoryCreateDTO): Promise<Inventory> => {
    const response = await apiClient.put<Inventory>(`/api/inventory/${id}`, dto);
    return response.data;
  },

  getInventoryById: async (id: number): Promise<Inventory> => {
    const response = await apiClient.get<Inventory>(`/api/inventory/${id}`);
    return response.data;
  },

  getInventoryByProduct: async (productId: number): Promise<Inventory[]> => {
    const response = await apiClient.get<Inventory[]>(`/api/inventory/product/${productId}`);
    return response.data;
  },

  getInventoryByWarehouse: async (warehouseId: number): Promise<Inventory[]> => {
    const response = await apiClient.get<Inventory[]>(`/api/inventory/warehouse/${warehouseId}`);
    return response.data;
  },

  reserveStock: async (request: StockReservationRequest): Promise<Inventory> => {
    const response = await apiClient.post<Inventory>('/api/inventory/reserve', request);
    return response.data;
  },

  releaseStock: async (request: StockReservationRequest): Promise<Inventory> => {
    const response = await apiClient.post<Inventory>('/api/inventory/release', request);
    return response.data;
  },

  confirmReservation: async (request: StockReservationRequest): Promise<Inventory> => {
    const response = await apiClient.post<Inventory>('/api/inventory/confirm', request);
    return response.data;
  },

  reconcileInventory: async (request: ReconciliationRequest): Promise<Inventory> => {
    const response = await apiClient.post<Inventory>('/api/inventory/reconcile', request);
    return response.data;
  },

  getLowStockInventory: async (): Promise<LowStockItem[]> => {
    const response = await apiClient.get<LowStockItem[]>('/api/inventory/low-stock');
    return response.data;
  },

  getTransactionHistory: async (
    productId?: number,
    warehouseId?: number,
    page: number = 0,
    size: number = 10
  ): Promise<PageResponse<InventoryTransaction>> => {
    const response = await apiClient.get<PageResponse<InventoryTransaction>>('/api/inventory/transactions', {
      params: {
        productId: productId || undefined,
        warehouseId: warehouseId || undefined,
        page,
        size,
      },
    });
    return response.data;
  },
};
