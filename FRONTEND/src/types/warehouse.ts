export interface Warehouse {
  id: number;
  name: string;
  location: string;
  capacity?: number;
  createdAt?: string;
}

export interface WarehouseCreateDTO {
  name: string;
  location: string;
  capacity?: number;
}
