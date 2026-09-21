import React from 'react';
import { OrderStatus } from '../../types/order';
import { Badge } from '../common/Badge';

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

export const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({ status }) => {
  switch (status) {
    case 'CONFIRMED':
      return <Badge variant="info">CONFIRMED</Badge>;
    case 'SHIPPED':
      return <Badge variant="warning">SHIPPED</Badge>;
    case 'DELIVERED':
      return <Badge variant="success">DELIVERED</Badge>;
    case 'FAILED':
    case 'CANCELLED':
      return <Badge variant="danger">{status}</Badge>;
    default:
      return <Badge variant="neutral">{status}</Badge>;
  }
};
