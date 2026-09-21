export interface BatchItem {
  id: number;
  batchNumber: string;
  serialNumber?: string;
  productId: number;
  productName?: string;
  warehouseId: number;
  warehouseName?: string;
  quantity: number;
  mfgDate?: string;
  expiryDate?: string;
  status: 'VALID' | 'EXPIRING_SOON' | 'EXPIRED' | 'QUARANTINED' | 'DEPLETED';
  createdAt?: string;
  updatedAt?: string;
}
