"use client";
import { createContext, useCallback, useContext, useEffect, useState } from "react";

export type CartItem = { id: string; name: string; price: number; qty: number; logo: string; color: string };

interface CartCtx {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "qty">) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, delta: number) => void;
  clear: () => void;
  count: number;
  totalUSD: number;
  sidebarOpen: boolean;
  openSidebar: () => void;
  closeSidebar: () => void;
}

const Ctx = createContext<CartCtx | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    try { const s = localStorage.getItem("gf_cart"); if (s) setItems(JSON.parse(s)); } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem("gf_cart", JSON.stringify(items));
  }, [items]);

  const addItem = useCallback((item: Omit<CartItem, "qty">) => {
    setItems(p => {
      const ex = p.find(i => i.id === item.id);
      if (ex) return p.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i);
      return [...p, { ...item, qty: 1 }];
    });
    setSidebarOpen(true);
  }, []);

  const removeItem = useCallback((id: string) => setItems(p => p.filter(i => i.id !== id)), []);
  const updateQty = useCallback((id: string, delta: number) => {
    setItems(p => p.map(i => i.id === id ? { ...i, qty: Math.max(0, i.qty + delta) } : i).filter(i => i.qty > 0));
  }, []);
  const clear = useCallback(() => setItems([]), []);

  return (
    <Ctx.Provider value={{
      items, addItem, removeItem, updateQty, clear,
      count: items.reduce((s, i) => s + i.qty, 0),
      totalUSD: items.reduce((s, i) => s + i.price * i.qty, 0),
      sidebarOpen, openSidebar: () => setSidebarOpen(true), closeSidebar: () => setSidebarOpen(false),
    }}>
      {children}
    </Ctx.Provider>
  );
}

export function useCart() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCart must be inside CartProvider");
  return ctx;
}
