"use client";

import { useState } from "react";
import {
  ArrowRight, Bell, BellRing, CheckCheck, Search, ShoppingCart,
  Tag, Info, CreditCard, Package, Truck, Star,
} from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";
import { useNotifications, type GfNotification, type NotifType } from "@/context/notifications-context";

/* ── Type config ────────────────────────────────────────────────────── */
const TYPE_CONFIG: Record<NotifType, { icon: React.ComponentType<{ size?: number; className?: string }>, color: string, bg: string }> = {
  order:    { icon: Package,      color: "#a855f7", bg: "rgba(168,85,247,0.12)" },
  payment:  { icon: CreditCard,   color: "#10b981", bg: "rgba(16,185,129,0.12)" },
  status:   { icon: Truck,        color: "#3b82f6", bg: "rgba(59,130,246,0.12)" },
  discount: { icon: Tag,          color: "#c8e600", bg: "rgba(200,230,0,0.10)"  },
  cart:     { icon: ShoppingCart, color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
  info:     { icon: Star,         color: "#ec4899", bg: "rgba(236,72,153,0.12)" },
};

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60)  return "الآن";
  const m = Math.floor(s / 60);
  if (m < 60)  return `منذ ${m} دقيقة`;
  const h = Math.floor(m / 60);
  if (h < 24)  return `منذ ${h} ساعة`;
  const d = Math.floor(h / 24);
  return `منذ ${d} يوم`;
}

function NotifCard({ notif, onRead }: { notif: GfNotification; onRead: () => void }) {
  const cfg = TYPE_CONFIG[notif.type];
  const Icon = cfg.icon;
  return (
    <div
      onClick={onRead}
      className="group relative flex cursor-pointer gap-3 rounded-2xl border p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
      style={{
        background: notif.read ? "rgba(255,255,255,0.025)" : cfg.bg,
        border: notif.read ? "1px solid rgba(255,255,255,0.07)" : `1px solid ${cfg.color}33`,
        boxShadow: notif.read ? "none" : `0 0 20px ${cfg.color}10`,
      }}
    >
      {/* Unread dot */}
      {!notif.read && (
        <span
          className="absolute left-3 top-3 size-2 rounded-full"
          style={{ background: cfg.color, boxShadow: `0 0 6px ${cfg.color}` }}
        />
      )}

      {/* Icon */}
      <div
        className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-xl"
        style={{ background: cfg.bg, border: `1px solid ${cfg.color}33` }}
      >
        <Icon size={17} style={{ color: cfg.color }} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p
            className="text-sm font-bold leading-5"
            style={{ color: notif.read ? "rgba(255,255,255,0.6)" : "white" }}
          >
            {notif.title}
          </p>
          <span className="shrink-0 text-[10px] text-white/35">{relativeTime(notif.createdAt)}</span>
        </div>
        <p className="mt-1 text-xs leading-5 text-white/50">{notif.description}</p>
        {notif.orderId && (
          <span className="mt-1.5 inline-flex items-center gap-1 rounded-lg bg-white/5 px-2 py-0.5 font-mono text-[10px] text-white/40">
            # {notif.orderId}
          </span>
        )}
        <div className="mt-2 flex items-center gap-2">
          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-bold"
            style={{
              background: notif.read ? "rgba(255,255,255,0.06)" : `${cfg.color}20`,
              color: notif.read ? "rgba(255,255,255,0.35)" : cfg.color,
            }}
          >
            {notif.read ? "مقروء" : "جديد ●"}
          </span>
          <span className="text-[10px] text-white/25">
            {new Date(notif.createdAt).toLocaleString("ar-DZ", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   Page
════════════════════════════════════════════════════════════════════════ */
export default function NotificationsPage() {
  const { notifications, markAllRead, markRead, unreadCount } = useNotifications();
  const [search, setSearch] = useState("");

  const filtered = search.trim()
    ? notifications.filter(n => n.orderId?.toLowerCase().includes(search.toLowerCase()) ||
        n.title.includes(search) || n.description.includes(search))
    : notifications;

  return (
    <main className="min-h-screen bg-[#050508] text-white" dir="rtl">
      <SiteHeader />

      {/* Glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute right-1/4 top-10 size-[450px] rounded-full bg-purple-600/10 blur-[130px]" />
        <div className="absolute left-1/3 top-44 size-[300px] rounded-full bg-blue-500/7 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-2xl px-4 pb-24 pt-12">
        {/* Back */}
        <a href="/" className="mb-10 inline-flex items-center gap-2 text-sm text-white/40 transition-colors hover:text-white">
          <ArrowRight size={15} /> العودة للرئيسية
        </a>

        {/* Hero */}
        <div className="mb-10 flex items-start gap-4">
          <div
            className="grid size-16 shrink-0 place-items-center rounded-[20px]"
            style={{
              background: "linear-gradient(135deg, rgba(168,85,247,0.25), rgba(59,130,246,0.2))",
              border: "1px solid rgba(168,85,247,0.3)",
              boxShadow: "0 0 40px rgba(168,85,247,0.2)",
              transform: "perspective(400px) rotateX(6deg)",
            }}
          >
            {unreadCount > 0
              ? <BellRing size={28} className="text-purple-400 drop-shadow-[0_0_12px_rgba(168,85,247,0.7)]" style={{ animation: "ring 1.5s ease-in-out infinite" }} />
              : <Bell size={28} className="text-purple-400" />
            }
          </div>
          <div>
            <h1 className="text-3xl font-black md:text-4xl">
              <span className="bg-gradient-to-l from-purple-400 to-blue-400 bg-clip-text text-transparent">
                الإشعارات
              </span>
            </h1>
            <p className="mt-1 text-sm text-white/45">
              {unreadCount > 0 ? `${unreadCount} إشعار غير مقروء` : "جميع الإشعارات مقروءة"} · {notifications.length} إجمالاً
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/35" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="بحث برقم المعاملة أو الكلمات..."
              className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pr-9 pl-4 text-sm text-white outline-none placeholder:text-white/25 focus:border-purple-500/50"
            />
          </div>
          {/* Mark all read */}
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="flex shrink-0 items-center gap-2 rounded-xl border border-purple-500/25 bg-purple-500/10 px-4 py-2.5 text-sm font-bold text-purple-300 transition-colors hover:bg-purple-500/20"
            >
              <CheckCheck size={15} /> قراءة الكل
            </button>
          )}
        </div>

        {/* Stats strip */}
        {notifications.length > 0 && !search && (
          <div className="mb-5 grid grid-cols-3 gap-2">
            {[
              { label: "إجمالي",    val: notifications.length, color: "text-white" },
              { label: "غير مقروء", val: unreadCount,          color: "text-purple-400" },
              { label: "مقروء",     val: notifications.length - unreadCount, color: "text-white/50" },
            ].map(({ label, val, color }) => (
              <div key={label} className="rounded-2xl border border-white/8 bg-white/3 p-3 text-center">
                <p className={`text-xl font-black ${color}`}>{val}</p>
                <p className="text-[10px] text-white/40">{label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Empty */}
        {notifications.length === 0 && (
          <div className="flex flex-col items-center gap-4 py-20 text-center">
            <div className="grid size-20 place-items-center rounded-3xl border border-white/8 bg-white/3">
              <Bell size={32} className="text-white/20" />
            </div>
            <p className="font-bold text-white/40">لا توجد إشعارات بعد</p>
            <p className="text-sm text-white/25">ستظهر هنا إشعارات طلباتك ونشاط حسابك</p>
          </div>
        )}

        {/* No results */}
        {notifications.length > 0 && filtered.length === 0 && (
          <div className="py-12 text-center text-sm text-white/35">
            لا توجد نتائج لـ &quot;{search}&quot;
          </div>
        )}

        {/* List */}
        {filtered.length > 0 && (
          <div className="flex flex-col gap-2.5">
            {filtered.map((n) => (
              <NotifCard
                key={n.id}
                notif={n}
                onRead={() => !n.read && markRead(n.id)}
              />
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes ring {
          0%, 100% { transform: rotate(0deg); }
          10%, 30%  { transform: rotate(-12deg); }
          20%, 40%  { transform: rotate(12deg); }
          50%       { transform: rotate(0deg); }
        }
      `}</style>
    </main>
  );
}
