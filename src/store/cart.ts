"use client";

import { create } from "zustand";

import type { CartLine } from "@/lib/order";

type CartState = {
  lines: CartLine[];
  addItem: (line: CartLine) => void;
  removeItem: (id: string) => void;
  setQuantity: (id: string, quantity: number) => void;
  clear: () => void;
};

export const useCartStore = create<CartState>((set) => ({
  lines: [],
  addItem: (lineToAdd) =>
    set((state) => {
      const existing = state.lines.find((line) => line.id === lineToAdd.id);
      if (existing) {
        return {
          lines: state.lines.map((line) => (line.id === lineToAdd.id ? { ...line, quantity: line.quantity + lineToAdd.quantity } : line)),
        };
      }

      return { lines: [...state.lines, lineToAdd] };
    }),
  removeItem: (id) => set((state) => ({ lines: state.lines.filter((line) => line.id !== id) })),
  setQuantity: (id, quantity) =>
    set((state) => ({
      lines: quantity <= 0 ? state.lines.filter((line) => line.id !== id) : state.lines.map((line) => (line.id === id ? { ...line, quantity } : line)),
    })),
  clear: () => set({ lines: [] }),
}));
