import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { useEffect, useState } from "react";

export interface CartItem {
  id: string; // productId
  name: string;
  slug: string;
  price: number;
  originalPrice?: number | null;
  image: string;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (product: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, quantity = 1) => {
        if (!product || !product.id) return;
        const qty = Math.max(1, Number(quantity) || 1);
        set((state) => {
          const currentItems = Array.isArray(state.items) ? state.items.filter(Boolean) : [];
          const existingIndex = currentItems.findIndex((item) => item?.id === product.id);
          if (existingIndex > -1) {
            const updatedItems = [...currentItems];
            updatedItems[existingIndex] = {
              ...updatedItems[existingIndex],
              quantity: (Number(updatedItems[existingIndex].quantity) || 0) + qty,
            };
            return { items: updatedItems };
          }
          return {
            items: [...currentItems, { ...product, quantity: qty }],
          };
        });
      },

      removeItem: (productId: string) => {
        set((state) => ({
          items: (Array.isArray(state.items) ? state.items : []).filter((item) => item && item.id !== productId),
        }));
      },

      updateQuantity: (productId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set((state) => ({
          items: (Array.isArray(state.items) ? state.items : []).map((item) =>
            item && item.id === productId ? { ...item, quantity } : item
          ).filter(Boolean),
        }));
      },

      clearCart: () => {
        set({ items: [] });
      },

      getTotalItems: () => {
        const list = Array.isArray(get().items) ? get().items : [];
        return list.reduce((total, item) => total + (Number(item?.quantity) || 0), 0);
      },

      getTotalPrice: () => {
        const list = Array.isArray(get().items) ? get().items : [];
        return list.reduce((total, item) => total + (Number(item?.price) || 0) * (Number(item?.quantity) || 1), 0);
      },
    }),
    {
      name: "caotri_cart_storage",
      storage: createJSONStorage(() =>
        typeof window !== "undefined"
          ? window.localStorage
          : {
              getItem: () => null,
              setItem: () => {},
              removeItem: () => {},
            }
      ),
    }
  )
);

/**
 * Custom hook to safely read cart items after client hydration to avoid hydration mismatch
 */
export function useCartHydrated() {
  const [isHydrated, setIsHydrated] = useState(false);
  const cart = useCartStore();

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const safeItems = Array.isArray(cart.items)
    ? cart.items.filter((item): item is CartItem => !!(item && item.id))
    : [];

  return {
    ...cart,
    items: safeItems,
    isHydrated,
    totalItems: isHydrated ? (typeof cart.getTotalItems === "function" ? cart.getTotalItems() : 0) : 0,
    totalPrice: isHydrated ? (typeof cart.getTotalPrice === "function" ? cart.getTotalPrice() : 0) : 0,
  };
}
