"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Home, User, Package, ShoppingBag, ShoppingCart, Heart,
  Bell, MessageCircle, Settings, LogOut, Menu, X, Camera,
  Eye, EyeOff, CheckCircle, AlertCircle, ChevronRight,
  Shield, Edit3, Save, Star, Clock, Copy, Upload,
} from "lucide-react";
import { useCart } from "@/context/cart-context";
import { useFavorites } from "@/context/favorites-context";
import { useNotifications } from "@/context/notifications-context";
import { PRODUCTS } from "@/data/products";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

type Section =
  | "home" | "account" | "orders" | "purchases" | "transactions"
  | "products" | "cart" | "favorites" | "notifications"
  | "support" | "settings";

interface UserData {
  id: string;
  email: string;
  username: string | null;
  full_name: string | null;
  is_admin: boolean;
  is_verified: boolean;
  is_active: boolean;
  profile_picture: string | null;
  created_at: string | null;
}

interface OrderData {
  id: string;
  product_name: string;
  product_price: number;
  status: string;
  payment_method: string | null;
  tracking_stage: number;
  tracking_notes: string | null;
  created_at: string | null;
  expires_at?: string | null;
  payment_proof_url?: string | null;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(user: UserData) {
  const name = user.full_name ?? user.username ?? user.email;
  return name.slice(0, 2).toUpperCase();
}

function authHeaders() {
  const token = typeof window !== "undefined" ? localStorage.getItem("gf_token") : null;
  return { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) };
}

function statusLabel(s: string) {
  const map: Record<string, { label: string; color: string }> = {
    new:            { label: "جديد",            color: "text-blue-400 bg-blue-500/15 border-blue-500/30" },
    pending_proof:  { label: "انتظار الدفع",    color: "text-yellow-400 bg-yellow-500/15 border-yellow-500/30" },
    processing:     { label: "قيد المعالجة",   color: "text-orange-400 bg-orange-500/15 border-orange-500/30" },
    confirmed:      { label: "مؤكّد",           color: "text-cyan-400 bg-cyan-500/15 border-cyan-500/30" },
    activated:      { label: "مفعّل ✓",        color: "text-lime-400 bg-lime-500/15 border-lime-500/30" },
    rejected:       { label: "مرفوض",           color: "text-red-400 bg-red-500/15 border-red-500/30" },
    expired:        { label: "منتهي",           color: "text-white/40 bg-white/5 border-white/10" },
  };
  return map[s] ?? { label: s, color: "text-white/50 bg-white/5 border-white/10" };
}

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("ar-SA", { year: "numeric", month: "short", day: "numeric" });
}

// ── Avatar component ─────────────────────────────────────────────────────────

function Avatar({ user, size = 48 }: { user: UserData; size?: number }) {
  if (user.profile_picture) {
    return (
      <img
        src={user.profile_picture}
        alt="avatar"
        style={{ width: size, height: size }}
        className="rounded-full object-cover border-2 border-purple-500/40"
      />
    );
  }
  return (
    <div
      style={{ width: size, height: size, fontSize: size * 0.36 }}
      className="flex items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-blue-600 font-black text-white border-2 border-purple-500/40"
    >
      {getInitials(user)}
    </div>
  );
}

// ── Sidebar nav items ─────────────────────────────────────────────────────────

const NAV_ITEMS: { section: Section; label: string; icon: React.ReactNode }[] = [
  { section: "home",          label: "الرئيسية",   icon: <Home size={18} /> },
  { section: "account",       label: "حسابي",       icon: <User size={18} /> },
  { section: "orders",        label: "طلباتي",      icon: <Package size={18} /> },
  { section: "purchases",     label: "مشترياتي",    icon: <ShoppingBag size={18} /> },
  { section: "transactions",  label: "معاملاتي",    icon: <MessageCircle size={18} /> },
  { section: "products",      label: "المنتجات",    icon: <Star size={18} /> },
  { section: "cart",          label: "السلة",       icon: <ShoppingCart size={18} /> },
  { section: "favorites",     label: "المفضلة",     icon: <Heart size={18} /> },
  { section: "notifications", label: "الإشعارات",   icon: <Bell size={18} /> },
  { section: "support",       label: "الدعم",       icon: <MessageCircle size={18} /> },
  { section: "settings",      label: "الإعدادات",   icon: <Settings size={18} /> },
];

// ═══════════════════════════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════════════════════════

export function CustomerDashboard() {
  const router   = useRouter();
  const cartCtx  = useCart();
  const favCtx   = useFavorites();
  const notifCtx = useNotifications();

  const [user,    setUser]    = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [section, setSection] = useState<Section>("home");
  const [sidebar, setSidebar] = useState(false);

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem("gf_token");
    if (!token) { router.replace("/login"); return; }
    try {
      const res = await fetch(`${API_URL}/api/v1/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) { localStorage.removeItem("gf_token"); router.replace("/login"); return; }
      const data = await res.json() as UserData;
      setUser(data);
    } catch { /* offline — keep last state */ }
    finally { setLoading(false); }
  }, [router]);

  useEffect(() => { void loadUser(); }, [loadUser]);

  const handleLogout = () => {
    localStorage.removeItem("gf_token");
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-3">
          <div className="pixel-logo text-3xl font-black">
            <span className="text-purple-500">GROW</span><span className="text-lime-400">FOLO</span>
          </div>
          <p className="animate-pulse text-sm text-white/40">جارٍ التحميل…</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const navigate = (s: Section) => { setSection(s); setSidebar(false); };

  return (
    <div className="flex min-h-screen bg-black/20 relative" dir="rtl">

      {/* Mobile overlay */}
      {sidebar && (
        <div className="fixed inset-0 z-30 bg-black/60 lg:hidden" onClick={() => setSidebar(false)} />
      )}

      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside className={`
        fixed top-0 right-0 z-40 h-full w-72 flex flex-col
        glass-panel border-l border-white/8 overflow-y-auto
        transition-transform duration-300
        ${sidebar ? "translate-x-0" : "translate-x-full"}
        lg:translate-x-0 lg:static lg:z-auto
      `}>
        {/* Sidebar header */}
        <div className="border-b border-white/8 p-5">
          <div className="flex items-center justify-between mb-4">
            <a href="/" className="pixel-logo text-xl font-black">
              <span className="text-purple-500">GROW</span><span className="text-lime-400">FOLO</span>
            </a>
            <button onClick={() => setSidebar(false)} className="text-white/40 hover:text-white lg:hidden">
              <X size={20} />
            </button>
          </div>
          <div className="flex items-center gap-3">
            <Avatar user={user} size={44} />
            <div className="min-w-0">
              <p className="truncate font-bold text-white text-sm">{user.full_name ?? user.username ?? "مستخدم"}</p>
              <p className="truncate text-xs text-white/40">{user.email}</p>
              {user.is_verified ? (
                <span className="mt-0.5 inline-flex items-center gap-1 rounded-full bg-lime-500/15 border border-lime-500/30 px-2 py-0.5 text-[10px] font-bold text-lime-400">
                  <CheckCircle size={9} /> موثّق
                </span>
              ) : (
                <span className="mt-0.5 inline-flex items-center gap-1 rounded-full bg-yellow-500/15 border border-yellow-500/30 px-2 py-0.5 text-[10px] font-bold text-yellow-400">
                  <AlertCircle size={9} /> غير موثّق
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5">
          {NAV_ITEMS.map(({ section: s, label, icon }) => {
            const badge =
              s === "cart"          ? (cartCtx.count > 0        ? cartCtx.count        : null)
              : s === "favorites"   ? (favCtx.count > 0         ? favCtx.count         : null)
              : s === "notifications" ? (notifCtx.unreadCount > 0 ? notifCtx.unreadCount : null)
              : null;
            return (
              <button
                key={s}
                onClick={() => navigate(s)}
                className={`
                  flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-all
                  ${section === s
                    ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                  }
                `}
              >
                <span className={section === s ? "text-purple-400" : "text-white/40"}>{icon}</span>
                <span className="flex-1 text-right">{label}</span>
                {badge !== null && (
                  <span className="grid min-w-5 place-items-center rounded-full bg-purple-500 px-1.5 text-[10px] font-black text-white">
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="border-t border-white/8 p-3">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut size={18} />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-white/8 bg-black/40 backdrop-blur-xl px-5 py-4">
          <button onClick={() => setSidebar(true)} className="text-white/60 hover:text-white lg:hidden">
            <Menu size={22} />
          </button>
          <h1 className="flex-1 text-base font-black text-white">
            {NAV_ITEMS.find(n => n.section === section)?.label ?? "لوحة التحكم"}
          </h1>
          <div className="flex items-center gap-3">
            <a
              href="/"
              className="hidden sm:flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/60 hover:text-white transition-all"
            >
              ← المتجر
            </a>
            <button onClick={() => navigate("notifications")} className="relative text-white/50 hover:text-white">
              <Bell size={20} />
              {notifCtx.unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 grid min-w-4 place-items-center rounded-full bg-purple-500 text-[9px] font-black text-white">
                  {notifCtx.unreadCount}
                </span>
              )}
            </button>
            <button onClick={() => navigate("account")}>
              <Avatar user={user} size={34} />
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-5 lg:p-7 max-w-4xl w-full mx-auto">
          {section === "home"          && <HomeSection user={user} onNavigate={navigate} />}
          {section === "account"       && <AccountSection user={user} onRefresh={loadUser} />}
          {section === "orders"        && <OrdersSection user={user} purchased={false} />}
          {section === "purchases"     && <OrdersSection user={user} purchased={true} />}
          {section === "transactions"  && <TransactionsSection user={user} />}
          {section === "products"      && <ProductsSection />}
          {section === "cart"          && <CartSection />}
          {section === "favorites"     && <FavoritesSection />}
          {section === "notifications" && <NotificationsSection />}
          {section === "support"       && <SupportSection user={user} />}
          {section === "settings"      && <SettingsSection user={user} onRefresh={loadUser} />}
        </main>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Section: Home
// ═══════════════════════════════════════════════════════════════════════════════

function HomeSection({ user, onNavigate }: { user: UserData; onNavigate: (s: Section) => void }) {
  const { count: cartCount } = useCart();
  const { count: favCount }  = useFavorites();

  const stats = [
    { label: "عناصر في السلة",  value: cartCount,                      icon: <ShoppingCart size={20} />, action: "cart" as Section,     color: "from-purple-600 to-blue-600" },
    { label: "المفضلة",          value: favCount,                       icon: <Heart size={20} />,        action: "favorites" as Section, color: "from-pink-600 to-rose-600" },
    { label: "نوع الحساب",       value: user.is_admin ? "مدير" : "عميل", icon: <Shield size={20} />,    action: null,                   color: "from-lime-600 to-emerald-600" },
  ];

  const quickLinks = [
    { label: "طلباتي",    icon: <Package size={22} />,       section: "orders" as Section,   desc: "تتبع حالة طلباتك" },
    { label: "المنتجات",  icon: <Star size={22} />,          section: "products" as Section, desc: "تصفح الاشتراكات المتاحة" },
    { label: "الإعدادات", icon: <Settings size={22} />,      section: "settings" as Section, desc: "الملف الشخصي وكلمة المرور" },
    { label: "الدعم",     icon: <MessageCircle size={22} />, section: "support" as Section,  desc: "تواصل مع فريقنا" },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="glass-panel rounded-3xl p-6 bg-gradient-to-l from-purple-900/20 to-transparent border-purple-500/20">
        <div className="flex items-center gap-4">
          <Avatar user={user} size={56} />
          <div>
            <p className="text-white/50 text-sm">مرحباً بعودتك،</p>
            <h2 className="text-xl font-black text-white">{user.full_name ?? user.username ?? "عميلنا"}</h2>
            <p className="text-white/40 text-xs mt-0.5">عضو منذ {formatDate(user.created_at)}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {stats.map(({ label, value, icon, action, color }) => (
          <button
            key={label}
            onClick={() => action && onNavigate(action)}
            className={`glass-panel rounded-2xl p-4 text-center space-y-1.5 hover:border-white/20 transition-all ${action ? "cursor-pointer" : "cursor-default"}`}
          >
            <div className={`mx-auto grid size-10 place-items-center rounded-xl bg-gradient-to-br ${color} text-white`}>
              {icon}
            </div>
            <p className="text-lg font-black text-white">{value}</p>
            <p className="text-xs text-white/45 leading-tight">{label}</p>
          </button>
        ))}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-3">
        {quickLinks.map(({ label, icon, section, desc }) => (
          <button
            key={section}
            onClick={() => onNavigate(section)}
            className="glass-panel rounded-2xl p-5 text-right hover:border-purple-500/40 hover:bg-purple-500/5 transition-all group space-y-2"
          >
            <div className="text-purple-400 group-hover:text-purple-300 transition-colors">{icon}</div>
            <p className="font-black text-white text-sm">{label}</p>
            <p className="text-xs text-white/35">{desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Section: Account
// ═══════════════════════════════════════════════════════════════════════════════

function AccountSection({ user, onRefresh }: { user: UserData; onRefresh: () => Promise<void> }) {
  const [editing,  setEditing]  = useState(false);
  const [fullName, setFullName] = useState(user.full_name ?? "");
  const [username, setUsername] = useState(user.username ?? "");
  const [saving,   setSaving]   = useState(false);
  const [msg,      setMsg]      = useState<{ ok: boolean; text: string } | null>(null);

  const handleSave = async () => {
    setSaving(true); setMsg(null);
    try {
      const res = await fetch(`${API_URL}/api/v1/auth/me`, {
        method: "PUT", headers: authHeaders(),
        body: JSON.stringify({ full_name: fullName, username: username || null }),
      });
      const d = await res.json() as { detail?: string };
      if (!res.ok) { setMsg({ ok: false, text: d.detail ?? "حدث خطأ" }); return; }
      setMsg({ ok: true, text: "تم حفظ التغييرات بنجاح" });
      setEditing(false);
      await onRefresh();
    } catch { setMsg({ ok: false, text: "تعذر الاتصال بالخادم" }); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-black text-white">معلومات الحساب</h2>
        {!editing ? (
          <button onClick={() => setEditing(true)}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white/70 hover:text-white hover:border-white/20 transition-all">
            <Edit3 size={13} /> تعديل
          </button>
        ) : (
          <div className="flex gap-2">
            <button onClick={() => { setEditing(false); setMsg(null); }}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/50 hover:text-white transition-colors">
              إلغاء
            </button>
            <button onClick={() => void handleSave()} disabled={saving}
              className="flex items-center gap-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 px-4 py-1.5 text-xs font-black text-white disabled:opacity-60 transition-colors">
              <Save size={12} /> {saving ? "حفظ…" : "حفظ"}
            </button>
          </div>
        )}
      </div>

      {msg && (
        <div className={`flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm ${
          msg.ok ? "bg-lime-500/10 border-lime-500/30 text-lime-400" : "bg-red-500/10 border-red-500/20 text-red-400"
        }`}>
          {msg.ok ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
          {msg.text}
        </div>
      )}

      <div className="glass-panel rounded-3xl overflow-hidden divide-y divide-white/6">
        {[
          { label: "الاسم الكامل",         value: editing ? (
            <input value={fullName} onChange={e => setFullName(e.target.value)}
              className="bg-white/5 border border-white/15 rounded-xl px-3 py-1.5 text-sm text-white outline-none focus:border-purple-500/50 w-full" />
          ) : (user.full_name ?? "—") },
          { label: "اسم المستخدم",          value: editing ? (
            <input value={username} onChange={e => setUsername(e.target.value)} dir="ltr"
              className="bg-white/5 border border-white/15 rounded-xl px-3 py-1.5 text-sm text-white outline-none focus:border-purple-500/50 w-full" />
          ) : (user.username ?? "—") },
          { label: "البريد الإلكتروني",     value: <span dir="ltr" className="text-white/70">{user.email}</span> },
          { label: "نوع الحساب",            value: user.is_admin ? "مدير" : "عميل" },
          { label: "حالة التوثيق",          value: user.is_verified
            ? <span className="inline-flex items-center gap-1 text-lime-400"><CheckCircle size={13} /> موثّق</span>
            : <span className="inline-flex items-center gap-1 text-yellow-400"><AlertCircle size={13} /> غير موثّق</span>
          },
          { label: "تاريخ التسجيل",         value: formatDate(user.created_at) },
        ].map(({ label, value }) => (
          <div key={label} className="flex items-center gap-4 px-5 py-4">
            <span className="w-36 shrink-0 text-sm text-white/45">{label}</span>
            <span className="flex-1 text-sm font-semibold text-white">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Section: Orders
// ═══════════════════════════════════════════════════════════════════════════════

function OrdersSection({ user: _user, purchased }: { user: UserData; purchased: boolean }) {
  const [orders,  setOrders]  = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  useEffect(() => {
    const token = localStorage.getItem("gf_token");
    if (!token) { setError("يجب تسجيل الدخول"); setLoading(false); return; }
    fetch(`${API_URL}/api/v1/auth/me/orders`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then((d: OrderData[]) => setOrders(Array.isArray(d) ? d : []))
      .catch(() => setError("تعذر تحميل الطلبات"))
      .finally(() => setLoading(false));
  }, []);

  const displayed = purchased ? orders.filter(o => o.status === "activated") : orders;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-black text-white">{purchased ? "مشترياتي المفعّلة" : "جميع طلباتي"}</h2>

      {loading && <p className="animate-pulse text-sm text-white/40 py-8 text-center">جارٍ التحميل…</p>}
      {error   && <p className="text-sm text-red-400 py-4 text-center">{error}</p>}

      {!loading && !error && displayed.length === 0 && (
        <div className="glass-panel rounded-3xl p-12 text-center space-y-3">
          <Package size={40} className="mx-auto text-white/20" />
          <p className="text-white/40 text-sm">
            {purchased ? "لا توجد مشتريات مفعّلة بعد" : "لم تقم بأي طلب حتى الآن"}
          </p>
          <a href="/#products" className="neon-button inline-block px-5 py-2.5 rounded-2xl text-sm font-black text-black mt-2">
            تصفح المنتجات
          </a>
        </div>
      )}

      {displayed.map(order => {
        const st = statusLabel(order.status);
        return (
          <div key={order.id} className="glass-panel rounded-2xl p-5 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-black text-white truncate">{order.product_name || "منتج Growfolo"}</p>
                <p className="text-xs text-white/40 mt-0.5">{formatDate(order.created_at)}</p>
              </div>
              <span className={`shrink-0 inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-bold ${st.color}`}>
                {st.label}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/40 font-mono text-xs">#{order.id.slice(0, 8).toUpperCase()}</span>
              <span className="font-black text-lime-400">${order.product_price.toFixed(2)}</span>
            </div>
            {order.tracking_notes && (
              <p className="rounded-xl bg-white/5 border border-white/8 px-3 py-2 text-xs text-white/50">
                {order.tracking_notes}
              </p>
            )}
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map(n => (
                <div key={n} className={`flex-1 h-1.5 rounded-full transition-all ${n <= order.tracking_stage ? "bg-purple-500" : "bg-white/10"}`} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Section: Transactions (WhatsApp payment orders)
// ═══════════════════════════════════════════════════════════════════════════════

const WA_NUMBER = "213779012833";

function WaCountdown({ expiresAt }: { expiresAt: string | null }) {
  const [left, setLeft] = useState(0);

  useEffect(() => {
    if (!expiresAt) { setLeft(0); return; }
    const deadline = new Date(expiresAt).getTime();
    const tick = () => setLeft(Math.max(0, deadline - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  if (!expiresAt || left === 0) {
    return <span className="text-xs text-white/30">انتهت المدة</span>;
  }

  const h   = Math.floor(left / 3600000);
  const min = Math.floor((left % 3600000) / 60000);
  const sec = Math.floor((left % 60000) / 1000);
  const urgent = left < 30 * 60000;

  return (
    <span className={`flex items-center gap-1 text-xs font-black tabular-nums ${urgent ? "text-red-400" : "text-purple-300"}`}>
      <Clock size={11} />
      {h > 0 ? `${h}س ${String(min).padStart(2,"0")}د` : `${String(min).padStart(2,"0")}:${String(sec).padStart(2,"0")}`}
    </span>
  );
}

function TransactionsSection({ user }: { user: UserData }) {
  const [orders, setOrders]     = useState<OrderData[]>([]);
  const [loading, setLoading]   = useState(true);
  const [proof, setProof]       = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedId, setUploadedId] = useState<string | null>(null);
  const [copyOk, setCopyOk]     = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("gf_token");
    if (!token) return;
    fetch(`${API_URL}/api/v1/auth/me/orders`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : [])
      .then((data: OrderData[]) => {
        setOrders(data.filter(o => o.payment_method === "whatsapp"));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user.email]);

  const copyId = (id: string) => {
    const short = "#" + id.slice(0, 8).toUpperCase();
    navigator.clipboard.writeText(short);
    setCopyOk(id);
    setTimeout(() => setCopyOk(null), 2000);
  };

  const uploadProof = async (orderId: string) => {
    if (!proof) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", proof);
      const res = await fetch(`${API_URL}/api/v1/store-orders/${orderId}/proof`, { method: "POST", body: fd });
      if (res.ok) { setUploadedId(orderId); setProof(null); }
    } catch {} finally { setUploading(false); }
  };

  if (loading) {
    return <div className="py-12 text-center text-sm text-white/30 animate-pulse">جارٍ التحميل...</div>;
  }

  if (orders.length === 0) {
    return (
      <div className="glass-panel rounded-3xl p-12 text-center space-y-4">
        <div className="text-4xl">💬</div>
        <p className="font-black text-white">لا توجد معاملات عبر واتساب</p>
        <p className="text-sm text-white/45">عند اختيار "الدفع عبر واتساب" في صفحة الدفع، ستظهر طلباتك هنا مع العداد التنازلي.</p>
        <a href="/" className="neon-button inline-block px-6 py-2.5 rounded-2xl text-sm font-black text-black mt-1">
          تسوق الآن
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-black text-white">معاملاتي عبر واتساب</h2>
        <span className="rounded-xl bg-green-500/15 px-3 py-1 text-xs font-black text-green-400">{orders.length} معاملة</span>
      </div>

      {orders.map((order) => {
        const shortId  = "#" + order.id.slice(0, 8).toUpperCase();
        const waMsg    = encodeURIComponent(`مرحبا، رقم طلبي هو: ${shortId} — المنتج: ${order.product_name} — ${order.product_price}$`);
        const waLink   = `https://wa.me/${WA_NUMBER}?text=${waMsg}`;
        const st       = statusLabel(order.status);
        const hasProof = order.status !== "pending_proof" && order.status !== "new";
        const isActive = order.status === "activated";
        const exAt     = order.expires_at ?? null;

        return (
          <div key={order.id} className="glass-panel rounded-2xl p-5 space-y-4 border border-green-500/15">
            {/* Header row */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">💬</span>
                  <code className="font-black text-white text-sm">{shortId}</code>
                  <span className={`rounded-xl border px-2 py-0.5 text-[10px] font-black ${st.color}`}>{st.label}</span>
                </div>
                <p className="text-xs text-white/45">{order.product_name} · {order.product_price}$</p>
              </div>
              {!isActive && <WaCountdown expiresAt={exAt} />}
              {isActive && <CheckCircle size={18} className="text-lime-400 shrink-0" />}
            </div>

            {/* Actions */}
            {!isActive && (
              <div className="grid gap-2 sm:grid-cols-2">
                {/* Copy order id */}
                <button
                  onClick={() => copyId(order.id)}
                  className={`flex items-center justify-center gap-2 rounded-xl border py-2.5 text-xs font-black transition-all ${copyOk === order.id ? "border-lime-500/40 bg-lime-500/10 text-lime-400" : "border-white/10 bg-white/4 text-white/60 hover:text-white hover:bg-white/8"}`}
                >
                  {copyOk === order.id ? <><CheckCircle size={13} /> تم النسخ!</> : <><Copy size={13} /> نسخ رقم الطلب</>}
                </button>
                {/* WhatsApp link */}
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-xl bg-[#25D366]/20 border border-[#25D366]/30 hover:bg-[#25D366]/30 py-2.5 text-xs font-black text-[#25D366] transition-all"
                >
                  <MessageCircle size={13} />
                  تواصل مع الوكيل
                </a>
              </div>
            )}

            {/* Proof upload — if still pending */}
            {!hasProof && !isActive && uploadedId !== order.id && (
              <div className="space-y-2">
                <p className="text-xs font-bold text-white/55">رفع إثبات الدفع</p>
                <label className="block cursor-pointer">
                  <div className={`flex items-center justify-center gap-2 rounded-xl border border-dashed py-3 text-xs transition-colors ${proof ? "border-lime-500/40 bg-lime-500/6 text-lime-400" : "border-white/15 bg-white/3 hover:bg-white/6 text-white/40"}`}>
                    {proof ? <><CheckCircle size={14} /> {proof.name} — اضغط لتغييره</> : <><Upload size={14} /> ارفع إثبات الدفع (JPG · PNG · PDF)</>}
                    <input type="file" accept="image/*,.pdf" className="sr-only" onChange={e => setProof(e.target.files?.[0] ?? null)} />
                  </div>
                </label>
                {proof && (
                  <button
                    onClick={() => uploadProof(order.id)}
                    disabled={uploading}
                    className="neon-button w-full rounded-xl py-2.5 text-xs font-black text-black disabled:opacity-50"
                  >
                    {uploading ? "جارٍ الرفع..." : "إرسال الإثبات ✓"}
                  </button>
                )}
              </div>
            )}

            {/* Proof uploaded confirmation */}
            {(hasProof || uploadedId === order.id) && !isActive && (
              <div className="flex items-center gap-2 rounded-xl bg-lime-500/8 border border-lime-500/20 px-3 py-2 text-xs text-lime-400">
                <CheckCircle size={13} /> إثبات الدفع مرفوع — قيد المراجعة
              </div>
            )}

            {/* Activated */}
            {isActive && (
              <div className="rounded-xl bg-lime-500/10 border border-lime-500/20 px-3 py-2 text-xs text-lime-400 text-center font-black">
                ✓ تم التفعيل — يمكنك استخدام الخدمة الآن
              </div>
            )}

            {/* Timestamp */}
            <p className="text-[10px] text-white/25">{formatDate(order.created_at)}</p>
          </div>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Section: Products  (info-only — buying happens in the main store)
// ═══════════════════════════════════════════════════════════════════════════════

function ProductsSection() {
  return (
    <div className="space-y-5">
      {/* CTA banner */}
      <div className="glass-panel rounded-3xl p-6 bg-gradient-to-l from-purple-900/20 to-transparent border-purple-500/20 text-center space-y-3">
        <div className="text-4xl">🛍️</div>
        <h2 className="text-lg font-black text-white">تصفح المتجر للشراء</h2>
        <p className="text-sm text-white/55 max-w-sm mx-auto">
          عمليات الشراء تتم من المتجر الرئيسي. بعد إتمام أي طلب سيظهر تلقائياً في "طلباتي".
        </p>
        <a
          href="/"
          className="neon-button inline-flex items-center gap-2 px-7 py-3 rounded-2xl font-black text-black text-sm"
        >
          <ShoppingBag size={16} />
          الذهاب إلى المتجر
        </a>
      </div>

      {/* Products preview — info only, no buy buttons */}
      <h3 className="font-black text-white/70 text-sm">نظرة عامة على المنتجات</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        {PRODUCTS.map(p => (
          <a
            key={p.id}
            href="/"
            className="glass-panel rounded-2xl p-4 space-y-2 hover:border-white/20 transition-all group"
            style={{ borderColor: `${p.accentColor}22` }}
          >
            <div className="flex items-center gap-3">
              <div
                className="grid size-10 shrink-0 place-items-center rounded-xl text-lg font-black"
                style={{ background: `${p.accentColor}22`, border: `1px solid ${p.accentColor}33` }}
              >
                {p.logo}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-black text-white text-sm truncate group-hover:text-purple-300 transition-colors">
                  {p.name}
                </p>
                <p className="text-xs text-white/35 truncate">{p.subtitle}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-black text-sm" style={{ color: p.accentColor }}>${p.price}</p>
                <p className="text-[10px] text-white/30 line-through">${p.oldPrice}</p>
              </div>
            </div>
          </a>
        ))}
      </div>

      <p className="text-center text-xs text-white/30 pt-1">
        اضغط على أي منتج للانتقال إلى المتجر
      </p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Section: Cart
// ═══════════════════════════════════════════════════════════════════════════════

function CartSection() {
  const { items, removeItem, updateQty, totalUSD, clear, count } = useCart();

  if (count === 0) {
    return (
      <div className="glass-panel rounded-3xl p-12 text-center space-y-3">
        <ShoppingCart size={40} className="mx-auto text-white/20" />
        <p className="text-white/40 text-sm">سلة التسوق فارغة</p>
        <a href="/" className="neon-button inline-block px-5 py-2.5 rounded-2xl text-sm font-black text-black mt-2">
          تصفح المنتجات
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-black text-white">سلة التسوق ({count})</h2>
        <button onClick={clear} className="text-xs text-red-400 hover:text-red-300">مسح الكل</button>
      </div>
      <div className="space-y-3">
        {items.map(item => (
          <div key={item.id} className="glass-panel rounded-2xl p-4 flex items-center gap-4">
            <div className="grid size-10 shrink-0 place-items-center rounded-xl text-white font-black text-sm"
              style={{ background: item.color }}>
              {typeof item.logo === "string" && item.logo.length <= 2 ? item.logo : "G"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-white text-sm truncate">{item.name}</p>
              <p className="text-xs text-lime-400 font-black">${item.price}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={() => updateQty(item.id, -1)}
                className="grid size-7 place-items-center rounded-lg bg-white/5 hover:bg-white/10 text-white/70 font-black">−</button>
              <span className="w-5 text-center text-sm font-black text-white">{item.qty}</span>
              <button onClick={() => updateQty(item.id, 1)}
                className="grid size-7 place-items-center rounded-lg bg-white/5 hover:bg-white/10 text-white/70 font-black">+</button>
            </div>
            <button onClick={() => removeItem(item.id)} className="text-white/30 hover:text-red-400">
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
      <div className="glass-panel rounded-2xl p-4 flex items-center justify-between">
        <span className="text-white/60 text-sm">الإجمالي</span>
        <span className="text-xl font-black text-lime-400">${totalUSD.toFixed(2)}</span>
      </div>
      <a href="/checkout" className="neon-button block w-full py-3.5 rounded-2xl text-center font-black text-black">
        إتمام الشراء ←
      </a>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Section: Favorites
// ═══════════════════════════════════════════════════════════════════════════════

function FavoritesSection() {
  const { favorites, toggleFavorite } = useFavorites();
  const { addItem, openSidebar }      = useCart();

  if (favorites.length === 0) {
    return (
      <div className="glass-panel rounded-3xl p-12 text-center space-y-3">
        <Heart size={40} className="mx-auto text-white/20" />
        <p className="text-white/40 text-sm">لا توجد منتجات مفضلة بعد</p>
        <a href="/" className="neon-button inline-block px-5 py-2.5 rounded-2xl text-sm font-black text-black mt-2">
          تصفح المنتجات
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-black text-white">المفضلة ({favorites.length})</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {favorites.map(item => (
          <div key={item.id} className="glass-panel rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-xl text-white font-black text-sm"
                  style={{ background: item.color }}>
                  {typeof item.logo === "string" && item.logo.length <= 2 ? item.logo : "G"}
                </div>
                <div>
                  <p className="font-bold text-white text-sm">{item.name}</p>
                  <p className="text-xs text-lime-400 font-black">${item.price}</p>
                </div>
              </div>
              <button onClick={() => toggleFavorite(item)} className="text-red-400 hover:text-red-300">
                <Heart size={16} fill="currentColor" />
              </button>
            </div>
            <button
              onClick={() => {
                addItem({ id: item.id, name: item.name, price: item.price, logo: item.logo, color: item.color });
                openSidebar();
              }}
              className="w-full rounded-xl bg-purple-600/20 hover:bg-purple-600/40 border border-purple-500/30 py-2 text-xs font-black text-purple-300 transition-colors"
            >
              أضف للسلة
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Section: Notifications
// ═══════════════════════════════════════════════════════════════════════════════

function NotificationsSection() {
  const { notifications, markAllRead, markRead } = useNotifications();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-black text-white">الإشعارات</h2>
        {notifications.some(n => !n.read) && (
          <button onClick={markAllRead} className="text-xs text-purple-400 hover:text-purple-300">
            تعيين الكل كمقروء
          </button>
        )}
      </div>
      {notifications.length === 0 && (
        <div className="glass-panel rounded-3xl p-12 text-center">
          <Bell size={40} className="mx-auto text-white/20 mb-3" />
          <p className="text-white/40 text-sm">لا توجد إشعارات</p>
        </div>
      )}
      <div className="space-y-2">
        {notifications.map(n => (
          <button key={n.id} onClick={() => markRead(n.id)}
            className={`w-full glass-panel rounded-2xl p-4 text-right hover:border-white/20 transition-all ${!n.read ? "border-purple-500/30 bg-purple-500/5" : ""}`}>
            <div className="flex items-start gap-3">
              <Bell size={16} className={n.read ? "text-white/30 mt-0.5" : "text-purple-400 mt-0.5"} />
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-bold ${n.read ? "text-white/60" : "text-white"}`}>{n.title}</p>
                <p className="text-xs text-white/40 mt-0.5">{n.description}</p>
                <p className="text-xs text-white/25 mt-1">{formatDate(n.createdAt)}</p>
              </div>
              {!n.read && <div className="size-2 shrink-0 rounded-full bg-purple-500 mt-1.5" />}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Section: Support
// ═══════════════════════════════════════════════════════════════════════════════

function SupportSection({ user }: { user: UserData }) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-black text-white">الدعم والمساعدة</h2>
      <div className="glass-panel rounded-3xl p-6 space-y-4 bg-gradient-to-l from-purple-900/10 to-transparent">
        <div className="flex items-center gap-4">
          <div className="grid size-14 place-items-center rounded-2xl bg-purple-500/20 border border-purple-500/30">
            <MessageCircle size={26} className="text-purple-400" />
          </div>
          <div>
            <h3 className="font-black text-white">تواصل مع فريق الدعم</h3>
            <p className="text-sm text-white/50 mt-0.5">متوفرون للمساعدة في أي مشكلة</p>
          </div>
        </div>
        <p className="text-sm text-white/60 leading-relaxed">
          يمكنك التواصل معنا عبر الدردشة المباشرة في أسفل الشاشة. سيتم ربط محادثتك بحسابك تلقائياً.
        </p>
        <div className="glass-panel rounded-2xl p-4 space-y-1">
          <p className="text-xs text-white/40 font-semibold">بيانات حسابك في الدردشة</p>
          <p className="text-sm text-white">{user.full_name ?? user.username ?? "—"}</p>
          <p className="text-xs text-white/50" dir="ltr">{user.email}</p>
        </div>
        <button
          onClick={() => {
            const btn = document.querySelector<HTMLButtonElement>("[data-chat-trigger]");
            if (btn) btn.click();
            else window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
          }}
          className="neon-button flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 font-black text-black"
        >
          <MessageCircle size={18} />
          فتح الدردشة المباشرة
        </button>
      </div>
      <div className="glass-panel rounded-2xl p-4 flex items-center gap-3 text-sm text-white/60">
        <Clock size={16} className="text-purple-400 shrink-0" />
        وقت الاستجابة المتوقع: أقل من ساعة في أوقات العمل
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Section: Settings
// ═══════════════════════════════════════════════════════════════════════════════

function SettingsSection({ user, onRefresh }: { user: UserData; onRefresh: () => Promise<void> }) {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-black text-white">إعدادات الحساب</h2>
      <AvatarUpload user={user} onRefresh={onRefresh} />
      <PasswordChangeForm />
    </div>
  );
}

// ── Avatar upload ─────────────────────────────────────────────────────────────

function AvatarUpload({ user, onRefresh }: { user: UserData; onRefresh: () => Promise<void> }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [msg,    setMsg]    = useState<{ ok: boolean; text: string } | null>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { setMsg({ ok: false, text: "يجب أن يكون ملف صورة" }); return; }

    setSaving(true); setMsg(null);
    try {
      const base64 = await compressImage(file, 200, 0.75);
      if (base64.length > 270_000) { setMsg({ ok: false, text: "الصورة كبيرة جداً" }); return; }

      const res = await fetch(`${API_URL}/api/v1/auth/me/avatar`, {
        method: "PUT", headers: authHeaders(),
        body: JSON.stringify({ picture: base64 }),
      });
      const d = await res.json() as { detail?: string };
      if (!res.ok) { setMsg({ ok: false, text: d.detail ?? "حدث خطأ" }); return; }
      setMsg({ ok: true, text: "تم تحديث الصورة" });
      await onRefresh();
    } catch { setMsg({ ok: false, text: "تعذر رفع الصورة" }); }
    finally { setSaving(false); if (fileRef.current) fileRef.current.value = ""; }
  };

  return (
    <div className="glass-panel rounded-3xl p-5 space-y-4">
      <h3 className="font-black text-white">صورة الملف الشخصي</h3>
      <div className="flex items-center gap-5">
        <Avatar user={user} size={68} />
        <div className="space-y-1.5">
          <p className="text-sm text-white/60">صورة واضحة لوجهك أو شعارك الشخصي</p>
          <p className="text-xs text-white/35">PNG / JPG — تُضغط تلقائياً إلى 200×200px</p>
        </div>
      </div>
      {msg && (
        <div className={`flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm ${
          msg.ok ? "bg-lime-500/10 border-lime-500/30 text-lime-400" : "bg-red-500/10 border-red-500/20 text-red-400"
        }`}>
          {msg.ok ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
          {msg.text}
        </div>
      )}
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => void handleFile(e)} />
      <button onClick={() => fileRef.current?.click()} disabled={saving}
        className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 px-5 py-2.5 text-sm font-semibold text-white/70 hover:text-white disabled:opacity-60 transition-all">
        <Camera size={16} />
        {saving ? "جارٍ الرفع…" : "تغيير الصورة"}
      </button>
    </div>
  );
}

async function compressImage(file: File, maxPx: number, quality: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, maxPx / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width  = Math.round(img.width  * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = reject;
    img.src = url;
  });
}

// ── Password change form ──────────────────────────────────────────────────────

function PasswordChangeForm() {
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [msg,     setMsg]     = useState<{ ok: boolean; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPass !== confirm) { setMsg({ ok: false, text: "كلمتا المرور غير متطابقتين" }); return; }
    if (newPass.length < 9)  { setMsg({ ok: false, text: "كلمة المرور الجديدة يجب أن تكون 9 أحرف على الأقل" }); return; }
    setSaving(true); setMsg(null);
    try {
      const res = await fetch(`${API_URL}/api/v1/auth/me/password`, {
        method: "PUT", headers: authHeaders(),
        body: JSON.stringify({ old_password: oldPass, new_password: newPass }),
      });
      const d = await res.json() as { detail?: string };
      if (!res.ok) { setMsg({ ok: false, text: d.detail ?? "حدث خطأ" }); return; }
      setMsg({ ok: true, text: "تم تغيير كلمة المرور بنجاح، تم إرسال إشعار لبريدك" });
      setOldPass(""); setNewPass(""); setConfirm("");
    } catch { setMsg({ ok: false, text: "تعذر الاتصال بالخادم" }); }
    finally { setSaving(false); }
  };

  return (
    <div className="glass-panel rounded-3xl p-5 space-y-4">
      <h3 className="font-black text-white">تغيير كلمة المرور</h3>
      <form onSubmit={e => void handleSubmit(e)} className="space-y-4">
        {/* Old password */}
        <label className="grid gap-1.5 text-xs font-semibold text-white/60">
          كلمة المرور الحالية
          <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-3 focus-within:border-purple-500/50 transition-colors">
            <input type={showOld ? "text" : "password"} value={oldPass} onChange={e => setOldPass(e.target.value)} required
              placeholder="••••••••••"
              className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/30" />
            <button type="button" onClick={() => setShowOld(p => !p)} className="text-white/30 hover:text-white/70">
              {showOld ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </label>

        {/* New password */}
        <label className="grid gap-1.5 text-xs font-semibold text-white/60">
          كلمة المرور الجديدة
          <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-3 focus-within:border-purple-500/50 transition-colors">
            <input type={showNew ? "text" : "password"} value={newPass} onChange={e => setNewPass(e.target.value)} required
              placeholder="9 أحرف على الأقل"
              className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/30" />
            <button type="button" onClick={() => setShowNew(p => !p)} className="text-white/30 hover:text-white/70">
              {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </label>

        {/* Confirm */}
        <label className="grid gap-1.5 text-xs font-semibold text-white/60">
          تأكيد كلمة المرور الجديدة
          <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required
            placeholder="أعد كتابة كلمة المرور الجديدة"
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-purple-500/50 transition-colors" />
        </label>

        {msg && (
          <div className={`flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm ${
            msg.ok ? "bg-lime-500/10 border-lime-500/30 text-lime-400" : "bg-red-500/10 border-red-500/20 text-red-400"
          }`}>
            {msg.ok ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
            {msg.text}
          </div>
        )}

        <button type="submit" disabled={saving}
          className="neon-button w-full rounded-2xl py-3 font-black text-black disabled:opacity-60">
          {saving ? "جارٍ الحفظ…" : "تغيير كلمة المرور"}
        </button>
      </form>
      <div className="flex items-center gap-2 text-xs text-white/35 border-t border-white/8 pt-3">
        <ChevronRight size={12} />
        <span>نسيت كلمة المرور الحالية؟</span>
        <a href="/forgot-password" className="text-purple-400 hover:text-purple-300">استعادة عبر البريد</a>
      </div>
    </div>
  );
}
