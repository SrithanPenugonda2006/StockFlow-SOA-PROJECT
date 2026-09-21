export interface Product {
  id: number;
  name: string;
  description: string;
  sku: string;
  price: number;
  category: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductCreateDTO {
  name: string;
  description: string;
  sku: string;
  price: number;
  category: string;
}

export interface ProductQueryParams {
  page?: number;
  size?: number;
  name?: string;
  category?: string;
}
