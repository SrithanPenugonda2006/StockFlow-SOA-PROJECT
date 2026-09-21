export interface Inventory {
  id: number;
  productId: number;
  warehouseId: number;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  version: number;
}

export interface InventoryCreateDTO {
  productId: number;
  warehouseId: number;
  quantity: number;
}

export interface StockReservationRequest {
  productId: number;
  warehouseId?: number;
  quantity: number;
}

export interface ReconciliationRequest {
  productId: number;
  warehouseId: number;
  actualQuantity: number;
  reason: string;
  performedBy?: string;
}

export interface LowStockItem {
  id: number;
  productId: number;
  warehouseId: number;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  threshold?: number;
  status?: 'HEALTHY' | 'LOW_STOCK' | 'CRITICAL' | 'OUT_OF_STOCK';
}

export type TransactionType =
  | 'RESTOCK'
  | 'RESERVATION'
  | 'CONFIRMATION'
  | 'RELEASE'
  | 'RECONCILIATION'
  | 'ADJUSTMENT';

export interface InventoryTransaction {
  id: number;
  productId: number;
  warehouseId: number;
  transactionType: TransactionType;
  quantityChange: number;
  reason: string;
  performedBy?: string;
  createdAt: string;
}
