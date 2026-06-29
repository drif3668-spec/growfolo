"use client";
import { createContext, useCallback, useContext, useEffect, useState } from "react";

export type NotifType = "order" | "payment" | "status" | "discount" | "cart" | "info";

export interface GfNotification {
  id:          string;
  orderId?:    string;
  title:       string;
  description: string;
  createdAt:   string;
  read:        boolean;
  type:        NotifType;
}

interface NotifCtx {
  notifications:   GfNotification[];
  addNotification: (n: Omit<GfNotification, "id" | "createdAt" | "read">) => void;
  markAllRead:     () => void;
  markRead:        (id: string) => void;
  unreadCount:     number;
}

const Ctx = createContext<NotifCtx | null>(null);

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<GfNotification[]>([]);

  useEffect(() => {
    try { const s = localStorage.getItem("gf_notifications"); if (s) setNotifications(JSON.parse(s)); } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem("gf_notifications", JSON.stringify(notifications));
  }, [notifications]);

  const addNotification = useCallback((n: Omit<GfNotification, "id" | "createdAt" | "read">) => {
    setNotifications(prev => [
      { ...n, id: Math.random().toString(36).slice(2, 10), createdAt: new Date().toISOString(), read: false },
      ...prev,
    ]);
  }, []);

  const markAllRead = useCallback(() =>
    setNotifications(prev => prev.map(n => ({ ...n, read: true }))), []);

  const markRead = useCallback((id: string) =>
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n)), []);

  return (
    <Ctx.Provider value={{
      notifications,
      addNotification,
      markAllRead,
      markRead,
      unreadCount: notifications.filter(n => !n.read).length,
    }}>
      {children}
    </Ctx.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useNotifications outside provider");
  return ctx;
}
