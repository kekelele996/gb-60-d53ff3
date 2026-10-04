import request from '@/utils/request';
import { Cart } from '@/types';

export interface AddCartData {
  productId: string;
  quantity: number;
}

export const cartApi = {
  getCart: () => request.get<Cart[]>('/cart'),
  addToCart: (data: AddCartData) => request.post<Cart>('/cart', data),
  updateCartItem: (id: string, data: { quantity?: number; selected?: boolean }) => 
    request.patch<Cart>(`/cart/${id}`, data),
  removeFromCart: (id: string) => request.delete(`/cart/${id}`),
  clearCart: () => request.delete('/cart'),
  selectAll: (selected: boolean) => request.post('/cart/select-all', { selected }),
};
