import request from '@/utils/request';
import { Order, OrderStatus, PaginatedResponse, Shipping } from '@/types';

export interface CreateOrderData {
  cartIds: string[];
  shippingName: string;
  shippingPhone: string;
  shippingAddress: string;
  couponId?: string;
  remark?: string;
}

export interface OrderQuery {
  page?: number;
  pageSize?: number;
  status?: OrderStatus;
}

export const orderApi = {
  createOrder: (data: CreateOrderData) => request.post<Order>('/orders', data),
  getOrderList: (params?: OrderQuery) => request.get<PaginatedResponse<Order>>('/orders', { params }),
  getOrderDetail: (id: string) => request.get<Order>(`/orders/${id}`),
  cancelOrder: (id: string) => request.post(`/orders/${id}/cancel`),
  confirmOrder: (id: string) => request.post(`/orders/${id}/confirm`),
  mockPay: (id: string, success: boolean = true) => 
    request.post(`/orders/${id}/mock-pay`, { success }),
  getShipping: (orderId: string) => request.get<Shipping>(`/orders/${orderId}/shipping`),
};
