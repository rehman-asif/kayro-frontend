import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { CartItem } from '../types';
import { getProductById } from '../data/products';

const CART_KEY = 'tpc_cart';

interface CartContextValue {
  items: CartItem[];
  count: number;
  total: number;
  addToCart: (productId: string, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

function loadCart(): CartItem[] {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || '[]') as CartItem[];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(loadCart);

  const persist = useCallback((cart: CartItem[]) => {
    setItems(cart);
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, []);

  const addToCart = useCallback((productId: string, quantity = 1) => {
    const product = getProductById(productId);
    if (!product || product.comingSoon) return;

    const cart = loadCart();
    const existing = cart.find((item) => item.id === productId);

    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        category: product.category,
        quantity,
      });
    }
    persist(cart);
  }, [persist]);

  const removeFromCart = useCallback((productId: string) => {
    persist(loadCart().filter((item) => item.id !== productId));
  }, [persist]);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    const cart = loadCart();
    const item = cart.find((i) => i.id === productId);
    if (item) {
      item.quantity = Math.max(1, quantity);
      persist(cart);
    }
  }, [persist]);

  const clearCart = useCallback(() => {
    localStorage.removeItem(CART_KEY);
    setItems([]);
  }, []);

  const count = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);
  const total = useMemo(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items]);

  const value = useMemo(
    () => ({ items, count, total, addToCart, removeFromCart, updateQuantity, clearCart }),
    [items, count, total, addToCart, removeFromCart, updateQuantity, clearCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
