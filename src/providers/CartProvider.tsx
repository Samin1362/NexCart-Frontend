'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import api from '@/lib/api';
import { useAuth } from './AuthProvider';
import { ICart } from '@/types';

interface CartContextType {
  cart: ICart | null;
  loading: boolean;
  itemCount: number;
  fetchCart: () => Promise<void>;
  addItem: (productId: string, quantity?: number) => Promise<void>;
  updateItem: (productId: string, quantity: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export default function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [cart, setCart] = useState<ICart | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!user) {
      setCart(null);
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.get('/cart');
      setCart(data.data);
    } catch {
      setCart(null);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addItem = async (productId: string, quantity = 1) => {
    const { data } = await api.post('/cart/add', { productId, quantity });
    setCart(data.data);
  };

  const updateItem = async (productId: string, quantity: number) => {
    const { data } = await api.patch('/cart/update', { productId, quantity });
    setCart(data.data);
  };

  const removeItem = async (productId: string) => {
    const { data } = await api.delete(`/cart/remove/${productId}`);
    setCart(data.data);
  };

  const clearCart = async () => {
    await api.delete('/cart/clear');
    setCart(null);
  };

  const itemCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
    <CartContext.Provider
      value={{ cart, loading, itemCount, fetchCart, addItem, updateItem, removeItem, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
