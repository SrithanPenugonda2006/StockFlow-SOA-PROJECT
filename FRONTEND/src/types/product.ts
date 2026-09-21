export interface Product {
  id: number;
  name: string;
  productName?: string;
  description?: string;
  sku: string;
  skuCode?: string;
  barcode?: string;
  category: string;
  brand?: string;
  unitCost?: number;
  price: number;
  sellingPrice?: number;
  initialStock?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductCreateDTO {
  sku: string;
  skuCode?: string;
  barcode?: string;
  name: string;
  productName?: string;
  category: string;
  brand?: string;
  unitCost?: number;
  price: number;
  sellingPrice?: number;
  initialStock?: number;
  description?: string;
}

export interface ProductQueryParams {
  page?: number;
  size?: number;
  name?: string;
  category?: string;
}
