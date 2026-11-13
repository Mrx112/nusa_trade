"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { getProduct } from "@/lib/data/products";

export type CartItem = {
  slug: string;
  quantity: number;
  variants: Record<string, string>;
  note: string;
};

export type SubmittedRfq = {
  id: string;
  createdAt: string;
  company: string;
  contactName: string;
  email: string;
  destination: string;
  neededBy: string;
  paymentPreference: string;
  estimatedTotal: number;
  items: { slug: string; name: string; quantity: number; unit: string; unitPrice: number; subtotal: number; supplierSlug: string; category: string }[];
  status: "terkirim";
};

export const MAX_COMPARE = 4;

type PersistedState = {
  cart: CartItem[];
  compare: string[];
  wishlist: string[];
  history: SubmittedRfq[];
};

type Actions = {
  addToCart: (item: Omit<CartItem, "note"> & { note?: string }) => void;
  updateCartItem: (slug: string, patch: Partial<Omit<CartItem, "slug">>) => void;
  removeFromCart: (slug: string) => void;
  clearCart: () => void;
  toggleCompare: (slug: string) => boolean;
  removeCompare: (slug: string) => void;
  clearCompare: () => void;
  toggleWishlist: (slug: string) => boolean;
  addHistory: (rfq: SubmittedRfq) => void;
  clearHistory: () => void;
};

export const useAppStore = create<PersistedState & Actions>()(
  persist(
    (set, get) => ({
      cart: [],
      compare: [],
      wishlist: [],
      history: [],
      addToCart: ({ slug, quantity, variants, note = "" }) => {
        const product = getProduct(slug);
        if (!product) return;
        set((state) => {
          const existing = state.cart.find((item) => item.slug === slug);
          if (existing) {
            return {
              cart: state.cart.map((item) =>
                item.slug === slug ? { ...item, quantity: item.quantity + quantity, variants: { ...item.variants, ...variants } } : item,
              ),
            };
          }
          return { cart: [...state.cart, { slug, quantity: Math.max(quantity, product.moq), variants, note }] };
        });
      },
      updateCartItem: (slug, patch) =>
        set((state) => ({ cart: state.cart.map((item) => (item.slug === slug ? { ...item, ...patch } : item)) })),
      removeFromCart: (slug) => set((state) => ({ cart: state.cart.filter((item) => item.slug !== slug) })),
      clearCart: () => set({ cart: [] }),
      toggleCompare: (slug) => {
        const { compare } = get();
        if (compare.includes(slug)) {
          set({ compare: compare.filter((entry) => entry !== slug) });
          return false;
        }
        if (compare.length >= MAX_COMPARE) return false;
        set({ compare: [...compare, slug] });
        return true;
      },
      removeCompare: (slug) => set((state) => ({ compare: state.compare.filter((entry) => entry !== slug) })),
      clearCompare: () => set({ compare: [] }),
      toggleWishlist: (slug) => {
        const { wishlist } = get();
        const saved = wishlist.includes(slug);
        set({ wishlist: saved ? wishlist.filter((entry) => entry !== slug) : [...wishlist, slug] });
        return !saved;
      },
      addHistory: (rfq) => set((state) => ({ history: [rfq, ...state.history] })),
      clearHistory: () => set({ history: [] }),
    }),
    {
      name: "nusatrade-store-v2",
      version: 2,
      storage: createJSONStorage(() => localStorage),
      partialize: ({ cart, compare, wishlist, history }) => ({ cart, compare, wishlist, history }),
      merge: (persisted, current) => {
        const state = (persisted ?? {}) as Partial<PersistedState>;
        const valid = (slug: unknown) => typeof slug === "string" && Boolean(getProduct(slug));
        return {
          ...current,
          cart: Array.isArray(state.cart) ? state.cart.filter((item) => valid(item?.slug) && Number.isInteger(item.quantity) && item.quantity > 0) : [],
          compare: Array.isArray(state.compare) ? state.compare.filter(valid).slice(0, MAX_COMPARE) : [],
          wishlist: Array.isArray(state.wishlist) ? state.wishlist.filter(valid) : [],
          history: Array.isArray(state.history) ? state.history : [],
        };
      },
    },
  ),
);

/* ---------- UI state (tidak disimpan) ---------- */

export type Toast = { id: number; title: string; description?: string; tone?: "success" | "info" | "error" };

type UiState = {
  drawerOpen: boolean;
  commandOpen: boolean;
  toasts: Toast[];
  setDrawer: (open: boolean) => void;
  setCommand: (open: boolean) => void;
  toast: (toast: Omit<Toast, "id">) => void;
  dismissToast: (id: number) => void;
};

let toastId = 0;

export const useUi = create<UiState>()((set) => ({
  drawerOpen: false,
  commandOpen: false,
  toasts: [],
  setDrawer: (drawerOpen) => set({ drawerOpen }),
  setCommand: (commandOpen) => set({ commandOpen }),
  toast: (toast) => {
    const id = ++toastId;
    set((state) => ({ toasts: [...state.toasts.slice(-2), { id, tone: "success", ...toast }] }));
    setTimeout(() => set((state) => ({ toasts: state.toasts.filter((entry) => entry.id !== id) })), 3600);
  },
  dismissToast: (id) => set((state) => ({ toasts: state.toasts.filter((entry) => entry.id !== id) })),
}));
