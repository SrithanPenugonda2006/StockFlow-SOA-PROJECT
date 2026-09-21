import { apiClient } from './axios';
import {
  Inventory,
  InventoryCreateDTO,
  LowStockItem,
  ReconciliationRequest,
  StockReservationRequest,
  InventoryTransaction,
  StockTransfer,
  StockTransferRequest,
  Supplier,
  PurchaseOrder,
  SmartInventory,
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

  stockOut: async (productId: number, warehouseId: number, quantity: number, reason?: string): Promise<Inventory> => {
    const response = await apiClient.post<Inventory>('/api/inventory/stock-out', null, {
      params: { productId, warehouseId, quantity, reason },
    });
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
    size: number = 5
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

  // Stock Transfers
  createTransfer: async (request: StockTransferRequest): Promise<StockTransfer> => {
    const response = await apiClient.post<StockTransfer>('/api/inventory/transfers', request);
    return response.data;
  },

  getTransfers: async (): Promise<StockTransfer[]> => {
    const response = await apiClient.get<StockTransfer[]>('/api/inventory/transfers');
    return response.data;
  },

  approveTransfer: async (id: number): Promise<StockTransfer> => {
    const response = await apiClient.put<StockTransfer>(`/api/inventory/transfers/${id}/approve`);
    return response.data;
  },

  dispatchTransfer: async (id: number): Promise<StockTransfer> => {
    const response = await apiClient.put<StockTransfer>(`/api/inventory/transfers/${id}/dispatch`);
    return response.data;
  },

  receiveTransfer: async (id: number): Promise<StockTransfer> => {
    const response = await apiClient.put<StockTransfer>(`/api/inventory/transfers/${id}/receive`);
    return response.data;
  },

  // Suppliers & Procurement
  createSupplier: async (data: Partial<Supplier>): Promise<Supplier> => {
    const response = await apiClient.post<Supplier>('/api/inventory/suppliers', data);
    return response.data;
  },

  getSuppliers: async (): Promise<Supplier[]> => {
    const response = await apiClient.get<Supplier[]>('/api/inventory/suppliers');
    return response.data;
  },

  createPurchaseOrder: async (data: Partial<PurchaseOrder>): Promise<PurchaseOrder> => {
    const response = await apiClient.post<PurchaseOrder>('/api/inventory/purchase-orders', data);
    return response.data;
  },

  getPurchaseOrders: async (): Promise<PurchaseOrder[]> => {
    const response = await apiClient.get<PurchaseOrder[]>('/api/inventory/purchase-orders');
    return response.data;
  },

  // Smart Inventory Analytics
  getSmartInventory: async (): Promise<SmartInventory[]> => {
    const response = await apiClient.get<SmartInventory[]>('/api/inventory/analytics/smart-inventory');
    return response.data;
  },
};

export const batchApi = {
  getBatches: async (search?: string): Promise<any[]> => {
    const response = await apiClient.get<any[]>('/api/inventory/batches', {
      params: { search: search || undefined },
    });
    return response.data;
  },
};
