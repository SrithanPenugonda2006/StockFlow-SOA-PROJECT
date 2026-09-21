import { apiClient } from './axios';
import { CreateOrderRequest, Order, OrderStatus } from '../types/order';
import { PageResponse } from '../types/common';

export const orderApi = {
  createOrder: async (request: CreateOrderRequest): Promise<Order> => {
    const response = await apiClient.post<Order>('/api/orders', request);
    return response.data;
  },

  getOrders: async (page: number = 0, size: number = 5): Promise<PageResponse<Order>> => {
    const response = await apiClient.get<PageResponse<Order>>('/api/orders', {
      params: { page, size },
    });
    return response.data;
  },

  getOrderById: async (id: number): Promise<Order> => {
    const response = await apiClient.get<Order>(`/api/orders/${id}`);
    return response.data;
  },

  getOrdersByCustomer: async (
    customerId: string,
    page: number = 0,
    size: number = 5
  ): Promise<PageResponse<Order>> => {
    const response = await apiClient.get<PageResponse<Order>>(`/api/orders/customer/${customerId}`, {
      params: { page, size },
    });
    return response.data;
  },

  updateOrderStatus: async (id: number, status: OrderStatus): Promise<Order> => {
    const response = await apiClient.patch<Order>(`/api/orders/${id}/status`, { status });
    return response.data;
  },
};
