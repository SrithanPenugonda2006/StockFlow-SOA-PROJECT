import { apiClient } from './axios';
import { Product, ProductCreateDTO, ProductQueryParams } from '../types/product';
import { PageResponse } from '../types/common';

export const productApi = {
  getProducts: async (params?: ProductQueryParams): Promise<PageResponse<Product>> => {
    const response = await apiClient.get<PageResponse<Product>>('/api/products', {
      params: {
        page: params?.page || 0,
        size: params?.size || 10,
        name: params?.name || undefined,
        category: params?.category || undefined,
      },
    });
    return response.data;
  },

  getProductById: async (id: number): Promise<Product> => {
    const response = await apiClient.get<Product>(`/api/products/${id}`);
    return response.data;
  },

  getProductBySku: async (sku: string): Promise<Product> => {
    const response = await apiClient.get<Product>(`/api/products/sku/${sku}`);
    return response.data;
  },

  createProduct: async (productData: ProductCreateDTO): Promise<Product> => {
    const response = await apiClient.post<Product>('/api/products', productData);
    return response.data;
  },

  updateProduct: async (id: number, productData: ProductCreateDTO): Promise<Product> => {
    const response = await apiClient.put<Product>(`/api/products/${id}`, productData);
    return response.data;
  },

  deleteProduct: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/products/${id}`);
  },
};
