"use client";

import { useCallback, useEffect } from "react";
import {
  X, LogIn, UserPlus, ShoppingBag, ShoppingCart,
  Heart, MessageCircle, Shield, HelpCircle, Bell,
} from "lucide-react";
import { useNotifications } from "@/context/notifications-context";
import { useFavorites } from "@/context/favorites-context";

interface SidebarMenuProps {
  open: boolean;
  onClose: () => void;
}

export function SidebarMenu({ open, onClose }: SidebarMenuProps) {
  const { unreadCount } = useNotifications();
  const { count: favCount } = useFavorites();

  const handleEscape = useCallback(
    (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); },
    [onClose]
  );

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [open, handleEscape]);

  const NAV_ITEMS = [
    { href: "/login",    label: "تسجيل الدخول",    icon: LogIn,          highlight: false, badge: 0 },
    { href: "/register", label: "إنشاء حساب جديد", icon: UserPlus,       highlight: true,  badge: 0 },
    { href: "/orders",   label: "الطلبات",          icon: ShoppingBag,    highlight: false, badge: 0 },
    { href: "/checkout", label: "السلة",            icon: ShoppingCart,   highlight: false, badge: 0 },
    { href: "/wishlist", label: "المفضلة",          icon: Heart,          highlight: false, badge: favCount },
    { href: "/notifications", label: "الإشعارات",  icon: Bell,           highlight: false, badge: unreadCount },
    { href: "/contact",  label: "تواصل معنا",       icon: MessageCircle,  highlight: false, badge: 0 },
    { href: "/privacy",  label: "سياسة الخصوصية",  icon: Shield,         highlight: false, badge: 0 },
    { href: "/faq",      label: "الأسئلة الشائعة",  icon: HelpCircle,     highlight: false, badge: 0 },
  ];

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Drawer */}
      <aside
        className={`fixed inset-y-0 right-0 z-50 flex w-[300px] flex-col bg-[#09080f] shadow-[0_0_60px_rgba(168,85,247,0.3)] transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between border-b border-white/8 px-5 py-4">
          <div className="pixel-logo text-2xl font-black">
            <span className="text-purple-500">GROW</span>
            <span className="text-lime-400">FOLO</span>
          </div>
          <button
            onClick={onClose}
            className="grid size-9 place-items-center rounded-2xl bg-white/6 text-white/60 hover:bg-white/12 hover:text-white"
            aria-label="إغلاق القائمة"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-semibold transition-colors ${
                item.highlight
                  ? "bg-purple-600/20 text-purple-300 hover:bg-purple-600/35"
                  : "text-white/75 hover:bg-white/6 hover:text-white"
              }`}
            >
              <item.icon size={18} className={item.highlight ? "text-purple-400" : "text-white/50"} />
              <span className="flex-1">{item.label}</span>
              {item.badge > 0 && (
                <span
                  className="grid min-w-5 place-items-center rounded-full px-1.5 py-0.5 text-[10px] font-black"
                  style={{
                    background: item.href === "/notifications"
                      ? "rgba(168,85,247,0.9)"
                      : "rgba(250,204,21,0.9)",
                    color: item.href === "/notifications" ? "white" : "black",
                  }}
                >
                  {item.badge > 99 ? "99+" : item.badge}
                </span>
              )}
            </a>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-white/8 px-5 py-4">
          <p className="text-center text-xs text-white/30">جميع الحقوق محفوظة © Growfolo 2026</p>
        </div>
      </aside>
    </>
  );
}
