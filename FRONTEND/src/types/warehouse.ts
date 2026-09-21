export interface Warehouse {
  id: number;
  name: string;
  code?: string;
  location?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  totalCapacity?: number;
  occupiedCapacity?: number;
  capacity?: number;
  status?: string;
  createdAt?: string;
}

export interface WarehouseCreateDTO {
  name: string;
  code?: string;
  location?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  totalCapacity?: number;
  capacity?: number;
}
