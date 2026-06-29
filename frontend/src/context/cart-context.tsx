"use client";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

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
  toast: string | null;
}

const Ctx = createContext<CartCtx | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    try { const s = localStorage.getItem("gf_cart"); if (s) setItems(JSON.parse(s)); } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem("gf_cart", JSON.stringify(items));
  }, [items]);

  const showToast = useCallback((name: string) => {
    setToast(name);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3200);
  }, []);

  const addItem = useCallback((item: Omit<CartItem, "qty">) => {
    setItems(p => {
      const ex = p.find(i => i.id === item.id);
      if (ex) return p.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i);
      return [...p, { ...item, qty: 1 }];
    });
    showToast(item.name);
    setSidebarOpen(true);
  }, [showToast]);

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
      toast,
    }}>
      {children}

      {/* Global cart toast */}
      <div
        className={`fixed bottom-24 left-6 z-[200] flex items-center gap-3 rounded-2xl border border-lime-500/30 bg-[#0a0f0a]/95 px-4 py-3 shadow-[0_0_40px_rgba(132,204,22,0.25)] backdrop-blur-xl transition-all duration-500 ${
          toast ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0 pointer-events-none"
        }`}
        style={{ minWidth: 240 }}
      >
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-lime-500/20 text-xl text-lime-400">
          ✓
        </span>
        <div>
          <p className="text-xs font-bold text-lime-400">تمت الإضافة للسلة</p>
          <p className="mt-0.5 text-xs text-white/70">{toast}</p>
        </div>
      </div>
    </Ctx.Provider>
  );
}

export function useCart() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCart must be inside CartProvider");
  return ctx;
}
