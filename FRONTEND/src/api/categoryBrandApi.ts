import { apiClient } from './axios';
import { CategoryItem, CategoryCreateDTO, BrandItem, BrandCreateDTO } from '../types/categoryBrand';

export const categoryBrandApi = {
  getCategories: async (search?: string): Promise<CategoryItem[]> => {
    const response = await apiClient.get<CategoryItem[]>('/api/products/categories', {
      params: { search: search || undefined },
    });
    return response.data;
  },

  createCategory: async (dto: CategoryCreateDTO): Promise<CategoryItem> => {
    const response = await apiClient.post<CategoryItem>('/api/products/categories', dto);
    return response.data;
  },

  updateCategory: async (id: number, dto: CategoryCreateDTO): Promise<CategoryItem> => {
    const response = await apiClient.put<CategoryItem>(`/api/products/categories/${id}`, dto);
    return response.data;
  },

  getBrands: async (search?: string): Promise<BrandItem[]> => {
    const response = await apiClient.get<BrandItem[]>('/api/products/brands', {
      params: { search: search || undefined },
    });
    return response.data;
  },

  createBrand: async (dto: BrandCreateDTO): Promise<BrandItem> => {
    const response = await apiClient.post<BrandItem>('/api/products/brands', dto);
    return response.data;
  },

  updateBrand: async (id: number, dto: BrandCreateDTO): Promise<BrandItem> => {
    const response = await apiClient.put<BrandItem>(`/api/products/brands/${id}`, dto);
    return response.data;
  },
};
