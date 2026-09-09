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
        const qty = Math.max(1, quantity);
        set((state) => {
          const existingIndex = state.items.findIndex((item) => item.id === product.id);
          if (existingIndex > -1) {
            const updatedItems = [...state.items];
            updatedItems[existingIndex] = {
              ...updatedItems[existingIndex],
              quantity: updatedItems[existingIndex].quantity + qty,
            };
            return { items: updatedItems };
          }
          return {
            items: [...state.items, { ...product, quantity: qty }],
          };
        });
      },

      removeItem: (productId: string) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== productId),
        }));
      },

      updateQuantity: (productId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set((state) => ({
          items: state.items.map((item) =>
            item.id === productId ? { ...item, quantity } : item
          ),
        }));
      },

      clearCart: () => {
        set({ items: [] });
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getTotalPrice: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
      },
    }),
    {
      name: "caotri_cart_storage",
      storage: createJSONStorage(() => localStorage),
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

  return {
    ...cart,
    isHydrated,
    totalItems: isHydrated ? cart.getTotalItems() : 0,
    totalPrice: isHydrated ? cart.getTotalPrice() : 0,
  };
}
