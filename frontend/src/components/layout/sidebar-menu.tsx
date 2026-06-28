"use client";

import { useCallback, useEffect } from "react";
import {
  X,
  LogIn,
  UserPlus,
  ShoppingBag,
  ShoppingCart,
  Heart,
  MessageCircle,
  Shield,
  HelpCircle,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/login", label: "تسجيل الدخول", icon: LogIn, highlight: false },
  { href: "/register", label: "إنشاء حساب جديد", icon: UserPlus, highlight: true },
  { href: "/orders", label: "الطلبات", icon: ShoppingBag, highlight: false },
  { href: "/checkout", label: "السلة", icon: ShoppingCart, highlight: false },
  { href: "/wishlist", label: "المفضلة", icon: Heart, highlight: false },
  { href: "/contact", label: "تواصل معنا", icon: MessageCircle, highlight: false },
  { href: "/privacy", label: "سياسة الخصوصية", icon: Shield, highlight: false },
  { href: "/faq", label: "الأسئلة الشائعة", icon: HelpCircle, highlight: false },
];

interface SidebarMenuProps {
  open: boolean;
  onClose: () => void;
}

export function SidebarMenu({ open, onClose }: SidebarMenuProps) {
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
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

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Drawer — slides from the right (visually, RTL) */}
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
              {item.label}
            </a>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-white/8 px-5 py-4">
          <p className="text-xs text-white/30 text-center">جميع الحقوق محفوظة © Growfolo 2026</p>
        </div>
      </aside>
    </>
  );
}
