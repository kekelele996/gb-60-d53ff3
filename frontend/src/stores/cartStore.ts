import { create } from 'zustand';
import { Cart } from '@/types';
import { cartApi } from '@/api/cart';

interface CartState {
  cartItems: Cart[];
  loading: boolean;
  fetchCart: () => Promise<void>;
  addToCart: (productId: string, quantity: number) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  toggleSelect: (id: string, selected: boolean) => Promise<void>;
  toggleSelectAll: (selected: boolean) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  clearCart: () => Promise<void>;
  getSelectedItems: () => Cart[];
  getSelectedTotal: () => { totalPrice: number; totalCount: number };
}

export const useCartStore = create<CartState>((set, get) => ({
  cartItems: [],
  loading: false,

  fetchCart: async () => {
    set({ loading: true });
    try {
      const res = await cartApi.getCart();
      set({ cartItems: res.data || [] });
    } finally {
      set({ loading: false });
    }
  },

  addToCart: async (productId: string, quantity: number) => {
    const res = await cartApi.addToCart({ productId, quantity });
    set((state) => ({ cartItems: [...state.cartItems, res.data] }));
  },

  updateQuantity: async (id: string, quantity: number) => {
    const res = await cartApi.updateCartItem(id, { quantity });
    set((state) => ({
      cartItems: state.cartItems.map((item) => (item.id === id ? res.data : item)),
    }));
  },

  toggleSelect: async (id: string, selected: boolean) => {
    const res = await cartApi.updateCartItem(id, { selected });
    set((state) => ({
      cartItems: state.cartItems.map((item) => (item.id === id ? res.data : item)),
    }));
  },

  toggleSelectAll: async (selected: boolean) => {
    await cartApi.selectAll(selected);
    set((state) => ({
      cartItems: state.cartItems.map((item) => ({ ...item, selected })),
    }));
  },

  removeItem: async (id: string) => {
    await cartApi.removeFromCart(id);
    set((state) => ({
      cartItems: state.cartItems.filter((item) => item.id !== id),
    }));
  },

  clearCart: async () => {
    await cartApi.clearCart();
    set({ cartItems: [] });
  },

  getSelectedItems: () => get().cartItems.filter((item) => item.selected),

  getSelectedTotal: () => {
    const selected = get().cartItems.filter((item) => item.selected);
    return {
      totalPrice: selected.reduce((sum, item) => {
        const price = item.product?.price || 0;
        return sum + price * item.quantity;
      }, 0),
      totalCount: selected.reduce((sum, item) => sum + item.quantity, 0),
    };
  },
}));
