export interface CategoryItem {
  id: number;
  name: string;
  description?: string;
  productCount: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CategoryCreateDTO {
  name: string;
  description?: string;
}

export interface BrandItem {
  id: number;
  name: string;
  country?: string;
  status: 'ACTIVE' | 'INACTIVE';
  description?: string;
  productCount: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface BrandCreateDTO {
  name: string;
  country?: string;
  status?: 'ACTIVE' | 'INACTIVE';
  description?: string;
}
