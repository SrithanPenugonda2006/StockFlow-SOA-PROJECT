export type OrderStatus = 'CONFIRMED' | 'FAILED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface OrderItemRequest {
  productId: number;
  quantity: number;
}

export interface CreateOrderRequest {
  customerId: string;
  idempotencyKey?: string;
  items: OrderItemRequest[];
}

export interface OrderItemResponse {
  id: number;
  productId: number;
  quantity: number;
  price: number;
}

export interface Order {
  id: number;
  customerId: string;
  status: OrderStatus;
  totalAmount: number;
  items: OrderItemResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  productId: number;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  maxAvailable?: number;
}
