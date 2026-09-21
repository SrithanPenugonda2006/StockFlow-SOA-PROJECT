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
  physicalQuantity?: number;
  actualQuantity?: number;
  reason?: string;
  performedBy?: string;
}

export interface LowStockItem {
  id: number;
  productId: number;
  warehouseId: number;
  warehouseName?: string;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  threshold?: number;
  status?: 'HEALTHY' | 'LOW_STOCK' | 'CRITICAL' | 'OUT_OF_STOCK';
}

export type TransactionType =
  | 'SALE'
  | 'RESTOCK'
  | 'RESERVATION'
  | 'RELEASE'
  | 'RECONCILIATION'
  | 'ADJUSTMENT'
  | 'DISPATCH'
  | 'TRANSFER_IN'
  | 'TRANSFER_OUT'
  | 'CONFIRMATION';

export interface InventoryTransaction {
  id: number;
  productId: number;
  warehouseId: number;
  transactionType: TransactionType;
  quantity: number;
  quantityChange?: number;
  previousQuantity: number;
  newQuantity: number;
  reason?: string;
  referenceId?: string;
  performedBy?: string;
  timestamp: string;
  createdAt?: string;
}

export interface StockTransfer {
  id: number;
  transferNumber: string;
  sourceWarehouseId: number;
  sourceWarehouseName?: string;
  destinationWarehouseId: number;
  destinationWarehouseName?: string;
  productId: number;
  productName?: string;
  quantity: number;
  status: 'REQUESTED' | 'APPROVED' | 'DISPATCHED' | 'RECEIVED' | 'REJECTED' | 'CANCELLED';
  requestedBy?: string;
  approvedBy?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StockTransferRequest {
  sourceWarehouseId: number;
  destinationWarehouseId: number;
  productId: number;
  quantity: number;
  notes?: string;
}

export interface Supplier {
  id: number;
  name: string;
  code: string;
  contactName?: string;
  email?: string;
  phone?: string;
  address?: string;
  status: 'ACTIVE' | 'INACTIVE';
  rating?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface PurchaseOrderItem {
  id?: number;
  productId: number;
  productName?: string;
  quantity: number;
  receivedQuantity?: number;
  unitCost: number;
}

export interface PurchaseOrder {
  id: number;
  poNumber: string;
  supplierId: number;
  supplierName?: string;
  warehouseId: number;
  warehouseName?: string;
  totalAmount: number;
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'SENT' | 'PARTIALLY_RECEIVED' | 'FULLY_RECEIVED' | 'CANCELLED';
  createdBy?: string;
  expectedDeliveryDate?: string;
  items: PurchaseOrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface SmartInventory {
  productId: number;
  productName?: string;
  sku?: string;
  currentStock: number;
  avgDailyDemand: number;
  leadTimeDays: number;
  safetyStock: number;
  reorderPoint: number;
  recommendedReorderQty: number;
  isReorderNeeded: boolean;
  isOverstock: boolean;
  isDeadStock: boolean;
  inventoryValue?: number;
}
