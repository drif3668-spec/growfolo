"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  MessageCircle, Package, ReceiptText, Send, ShieldCheck,
  Users, CheckCircle, RefreshCw, Eye, Clock, ExternalLink,
  ImageIcon, Plus, Trash2, ArrowUp, ArrowDown, ToggleLeft, ToggleRight, Pencil, X,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const WS_URL = API_URL.replace(/^http/, "ws");

/* ── Types ─────────────────────────────────────────────────────────────── */
type ChatSession = { id: string; name: string; email: string; whatsapp: string; is_resolved: boolean; created_at: string; last_message: string | null };
type ChatMessage = { id: string; content: string; is_admin: boolean; created_at: string; session_id?: string };
type Order = {
  id: string; customer_name: string; customer_email: string; customer_whatsapp: string | null;
  customer_country: string | null; customer_telegram: string | null; customer_notes: string | null;
  product_name: string; product_price: number; payment_method: string | null;
  payment_proof_url: string | null; status: string; admin_notes: string | null;
  created_at: string; expires_at: string | null;
};

type NavSection = "orders" | "products" | "banners" | "chat" | "settings";

type BannerSlide = {
  id: number; image_url: string; title: string | null; description: string | null;
  button_text: string; link_url: string; sort_order: number; is_active: boolean;
  alt_text: string | null; start_date: string | null; end_date: string | null; created_at: string;
};

type BannerForm = {
  title: string; description: string; button_text: string; link_url: string;
  sort_order: number; is_active: boolean; alt_text: string;
  start_date: string; end_date: string; imageFile: File | null;
};

const EMPTY_FORM: BannerForm = {
  title: "", description: "", button_text: "مشاهدة الإعلان", link_url: "/",
  sort_order: 0, is_active: true, alt_text: "", start_date: "", end_date: "", imageFile: null,
};

/* ── Status config ─────────────────────────────────────────────────────── */
const STATUS: Record<string, { label: string; color: string; bg: string }> = {
  new:           { label: "جديد",              color: "text-blue-400",   bg: "bg-blue-500/15" },
  pending_proof: { label: "بانتظار الدفع",     color: "text-yellow-400", bg: "bg-yellow-500/15" },
  processing:    { label: "قيد المعالجة",      color: "text-orange-400", bg: "bg-orange-500/15" },
  confirmed:     { label: "تأكيد الدفع",       color: "text-cyan-400",   bg: "bg-cyan-500/15" },
  activated:     { label: "تم التفعيل ✓",      color: "text-lime-400",   bg: "bg-lime-500/15" },
  rejected:      { label: "مرفوض",             color: "text-red-400",    bg: "bg-red-500/15" },
  expired:       { label: "منتهي الوقت",       color: "text-white/40",   bg: "bg-white/8" },
};

/* ════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════════════════════════════ */
export function AdminDashboard() {
  const [nav, setNav] = useState<NavSection>("orders");

  /* ── Banners state ─────────────────────────────────────────────────── */
  const [slides, setSlides] = useState<BannerSlide[]>([]);
  const [slidesLoading, setSlidesLoading] = useState(false);
  const [bannerForm, setBannerForm] = useState<BannerForm>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [bannerSaving, setBannerSaving] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const loadSlides = useCallback(async () => {
    setSlidesLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/v1/banners/admin/all`);
      if (res.ok) setSlides(await res.json());
    } catch {} finally { setSlidesLoading(false); }
  }, []);

  useEffect(() => { if (nav === "banners") loadSlides(); }, [nav, loadSlides]);

  function openAddForm() {
    setEditingId(null);
    setBannerForm(EMPTY_FORM);
    setShowForm(true);
  }

  function openEditForm(s: BannerSlide) {
    setEditingId(s.id);
    setBannerForm({
      title: s.title ?? "", description: s.description ?? "",
      button_text: s.button_text, link_url: s.link_url,
      sort_order: s.sort_order, is_active: s.is_active,
      alt_text: s.alt_text ?? "", start_date: s.start_date?.slice(0, 16) ?? "",
      end_date: s.end_date?.slice(0, 16) ?? "", imageFile: null,
    });
    setShowForm(true);
  }

  async function saveBanner() {
    if (!editingId && !bannerForm.imageFile) { alert("اختر صورة"); return; }
    setBannerSaving(true);
    const fd = new FormData();
    if (bannerForm.imageFile) fd.append("image", bannerForm.imageFile);
    fd.append("title", bannerForm.title);
    fd.append("description", bannerForm.description);
    fd.append("button_text", bannerForm.button_text);
    fd.append("link_url", bannerForm.link_url);
    fd.append("sort_order", String(bannerForm.sort_order));
    fd.append("is_active", String(bannerForm.is_active));
    fd.append("alt_text", bannerForm.alt_text);
    fd.append("start_date", bannerForm.start_date);
    fd.append("end_date", bannerForm.end_date);
    try {
      const url = editingId ? `${API_URL}/api/v1/banners/${editingId}` : `${API_URL}/api/v1/banners`;
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, { method, body: fd });
      if (res.ok) {
        setShowForm(false);
        await loadSlides();
      }
    } catch {} finally { setBannerSaving(false); }
  }

  async function deleteBanner(id: number) {
    if (!confirm("حذف هذه الشريحة؟")) return;
    await fetch(`${API_URL}/api/v1/banners/${id}`, { method: "DELETE" });
    setSlides((p) => p.filter((s) => s.id !== id));
  }

  async function toggleBanner(id: number) {
    const res = await fetch(`${API_URL}/api/v1/banners/${id}/toggle`, { method: "PATCH" });
    if (res.ok) { const updated: BannerSlide = await res.json(); setSlides((p) => p.map((s) => s.id === id ? updated : s)); }
  }

  async function moveSlide(id: number, dir: "up" | "down") {
    const idx = slides.findIndex((s) => s.id === id);
    const swap = dir === "up" ? idx - 1 : idx + 1;
    if (swap < 0 || swap >= slides.length) return;
    const a = slides[idx], b = slides[swap];
    await Promise.all([
      fetch(`${API_URL}/api/v1/banners/${a.id}/order?sort_order=${b.sort_order}`, { method: "PATCH" }),
      fetch(`${API_URL}/api/v1/banners/${b.id}/order?sort_order=${a.sort_order}`, { method: "PATCH" }),
    ]);
    await loadSlides();
  }

  /* ── Orders state ──────────────────────────────────────────────────── */
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusNote, setStatusNote] = useState("");
  const [updating, setUpdating] = useState(false);

  /* ── Chat state ─────────────────────────────────────────────────────── */
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSession, setActiveSession] = useState<ChatSession | null>(null);
  const activeSessionRef = useRef<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [reply, setReply] = useState("");
  const wsRef = useRef<WebSocket | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => { activeSessionRef.current = activeSession; }, [activeSession]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  /* ── Load orders ───────────────────────────────────────────────────── */
  const loadOrders = useCallback(async () => {
    setOrdersLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/v1/store-orders`);
      if (res.ok) setOrders(await res.json());
    } catch {} finally { setOrdersLoading(false); }
  }, []);

  useEffect(() => { if (nav === "orders") loadOrders(); }, [nav, loadOrders]);

  /* ── Update order status ───────────────────────────────────────────── */
  const updateStatus = async (orderId: string, status: string) => {
    setUpdating(true);
    try {
      const res = await fetch(`${API_URL}/api/v1/store-orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, admin_notes: statusNote || null }),
      });
      if (res.ok) {
        const updated: Order = await res.json();
        setOrders((p) => p.map((o) => (o.id === orderId ? updated : o)));
        setSelectedOrder(updated);
        setStatusNote("");
      }
    } catch {} finally { setUpdating(false); }
  };

  /* ── Chat sessions ─────────────────────────────────────────────────── */
  const loadSessions = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/v1/chat/sessions`);
      if (res.ok) setSessions(await res.json());
    } catch {}
  }, []);

  useEffect(() => { if (nav === "chat") loadSessions(); }, [nav, loadSessions]);

  useEffect(() => {
    if (nav !== "chat") return;
    const ws = new WebSocket(`${WS_URL}/api/v1/chat/admin/ws`);
    ws.onmessage = (e) => {
      try {
        const msg: ChatMessage = JSON.parse(e.data as string);
        setMessages((p) => activeSessionRef.current?.id === msg.session_id ? [...p, msg] : p);
        setSessions((p) => p.map((s) => s.id === msg.session_id ? { ...s, last_message: msg.content } : s));
      } catch {}
    };
    wsRef.current = ws;
    return () => ws.close();
  }, [nav]);

  const openSession = useCallback(async (session: ChatSession) => {
    setActiveSession(session);
    setMessages([]);
    try {
      const res = await fetch(`${API_URL}/api/v1/chat/sessions/${session.id}/messages`);
      if (res.ok) setMessages(await res.json());
    } catch {}
  }, []);

  const sendReply = useCallback(() => {
    if (!reply.trim() || !activeSession || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    wsRef.current.send(JSON.stringify({ session_id: activeSession.id, content: reply.trim() }));
    setMessages((p) => [...p, { id: crypto.randomUUID(), content: reply.trim(), is_admin: true, created_at: new Date().toISOString() }]);
    setReply("");
  }, [reply, activeSession]);

  const resolveSession = async (id: string) => {
    await fetch(`${API_URL}/api/v1/chat/sessions/${id}/resolve`, { method: "PATCH" });
    setSessions((p) => p.map((s) => (s.id === id ? { ...s, is_resolved: true } : s)));
    if (activeSession?.id === id) setActiveSession((p) => p ? { ...p, is_resolved: true } : p);
  };

  const fmt = (iso: string) => { try { return new Date(iso).toLocaleString("ar-DZ", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }); } catch { return ""; } };

  /* ── Sidebar nav items ─────────────────────────────────────────────── */
  const NAV = [
    { id: "orders" as NavSection, label: "الطلبات", icon: ReceiptText, badge: orders.filter((o) => o.status === "processing").length },
    { id: "banners" as NavSection, label: "البانرات", icon: ImageIcon, badge: 0 },
    { id: "products" as NavSection, label: "المنتجات", icon: Package, badge: 0 },
    { id: "chat" as NavSection, label: "الشات المباشر", icon: MessageCircle, badge: sessions.filter((s) => !s.is_resolved).length },
    { id: "settings" as NavSection, label: "الإعدادات", icon: ShieldCheck, badge: 0 },
  ];

  return (
    <main className="flex min-h-screen bg-[#0d0b14] text-white">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 right-0 w-64 border-l border-white/8 bg-[#09080f] p-5">
        <div className="pixel-logo mb-8 text-2xl font-black">
          <span className="text-purple-500">GROW</span><span className="text-lime-400">FOLO</span>
          <span className="mt-0.5 block text-xs font-normal text-white/40">لوحة التحكم</span>
        </div>
        <nav className="grid gap-1 text-sm">
          {NAV.map(({ id, label, icon: Icon, badge }) => (
            <button key={id} onClick={() => setNav(id)}
              className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-right font-semibold transition-colors ${nav === id ? "bg-purple-600/20 text-purple-300" : "text-white/60 hover:bg-white/5 hover:text-white"}`}
            >
              <Icon size={17} /> {label}
              {badge > 0 && <span className="mr-auto grid size-5 place-items-center rounded-full bg-purple-600 text-[10px] font-bold">{badge}</span>}
            </button>
          ))}
        </nav>
      </aside>

      {/* Content */}
      <div className="flex-1 pr-64">
        <div className="mx-auto max-w-5xl p-8">

          {/* ── ORDERS ──────────────────────────────────────────────── */}
          {nav === "orders" && (
            <>
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-black">إدارة الطلبات</h2>
                <button onClick={loadOrders} className="flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2 text-sm text-white/60 hover:bg-white/10 hover:text-white">
                  <RefreshCw size={14} className={ordersLoading ? "animate-spin" : ""} /> تحديث
                </button>
              </div>

              {/* Stats row */}
              <div className="mb-6 grid gap-4 md:grid-cols-4">
                {[
                  { label: "الكل", val: orders.length, color: "text-white" },
                  { label: "قيد المعالجة", val: orders.filter((o) => o.status === "processing").length, color: "text-orange-400" },
                  { label: "مفعّل", val: orders.filter((o) => o.status === "activated").length, color: "text-lime-400" },
                  { label: "مرفوض", val: orders.filter((o) => o.status === "rejected").length, color: "text-red-400" },
                ].map(({ label, val, color }) => (
                  <div key={label} className="rounded-2xl border border-white/8 bg-[#0d0b14] p-4">
                    <p className="text-xs text-white/45">{label}</p>
                    <p className={`mt-1 text-3xl font-black ${color}`}>{val}</p>
                  </div>
                ))}
              </div>

              {/* Orders table + detail panel */}
              <div className="grid gap-5 lg:grid-cols-[1fr_380px]">
                {/* Table */}
                <div className="rounded-3xl border border-white/8 bg-[#0d0b14] overflow-hidden">
                  <div className="border-b border-white/8 px-5 py-4 text-sm font-black text-white/70">
                    {orders.length} طلب
                  </div>
                  {orders.length === 0 && !ordersLoading && (
                    <div className="py-12 text-center text-sm text-white/30">لا توجد طلبات بعد</div>
                  )}
                  {orders.map((order) => {
                    const s = STATUS[order.status] ?? STATUS.new;
                    return (
                      <button
                        key={order.id}
                        onClick={() => setSelectedOrder(order)}
                        className={`flex w-full items-center gap-3 border-b border-white/5 px-5 py-4 text-right transition-colors hover:bg-white/4 ${selectedOrder?.id === order.id ? "bg-purple-600/10" : ""}`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-black text-white truncate">{order.customer_name}</span>
                            <span className={`shrink-0 rounded-xl px-2 py-0.5 text-[10px] font-bold ${s.bg} ${s.color}`}>{s.label}</span>
                          </div>
                          <p className="mt-0.5 truncate text-xs text-white/40">{order.product_name} · {order.customer_email}</p>
                          <p className="text-[10px] text-white/25 mt-0.5">{fmt(order.created_at)}</p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="font-black text-white">{order.product_price}$</p>
                          {order.payment_proof_url && <span className="text-[10px] text-lime-400">وصل مرفوع ✓</span>}
                        </div>
                        <Eye size={14} className="shrink-0 text-white/25" />
                      </button>
                    );
                  })}
                </div>

                {/* Detail panel */}
                {selectedOrder ? (
                  <div className="rounded-3xl border border-white/8 bg-[#0d0b14] p-5 overflow-y-auto" style={{ maxHeight: 600 }}>
                    <div className="mb-4 flex items-start justify-between gap-2">
                      <div>
                        <p className="font-mono text-xs text-white/35">#{selectedOrder.id.slice(0, 8).toUpperCase()}</p>
                        <h3 className="font-black text-white">{selectedOrder.customer_name}</h3>
                      </div>
                      <span className={`rounded-xl px-2.5 py-1 text-xs font-bold ${STATUS[selectedOrder.status]?.bg ?? "bg-white/8"} ${STATUS[selectedOrder.status]?.color ?? "text-white"}`}>
                        {STATUS[selectedOrder.status]?.label ?? selectedOrder.status}
                      </span>
                    </div>

                    {/* Customer info */}
                    <div className="mb-4 grid gap-2 rounded-2xl border border-white/8 bg-white/3 p-4 text-sm">
                      {[
                        { l: "المنتج", v: selectedOrder.product_name },
                        { l: "السعر", v: `${selectedOrder.product_price}$` },
                        { l: "طريقة الدفع", v: selectedOrder.payment_method ?? "—" },
                        { l: "البريد", v: selectedOrder.customer_email },
                        { l: "WhatsApp", v: selectedOrder.customer_whatsapp ?? "—" },
                        { l: "الدولة", v: selectedOrder.customer_country ?? "—" },
                        { l: "Telegram", v: selectedOrder.customer_telegram ?? "—" },
                      ].map(({ l, v }) => (
                        <div key={l} className="flex justify-between gap-2">
                          <span className="text-white/45">{l}</span>
                          <span className="font-semibold text-white text-left truncate max-w-[60%]">{v}</span>
                        </div>
                      ))}
                      {selectedOrder.customer_notes && (
                        <div className="mt-1 rounded-xl bg-white/5 px-3 py-2 text-xs text-white/55">
                          {selectedOrder.customer_notes}
                        </div>
                      )}
                    </div>

                    {/* Proof link */}
                    {selectedOrder.payment_proof_url && (
                      <a
                        href={`${API_URL}${selectedOrder.payment_proof_url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mb-4 flex items-center gap-2 rounded-2xl border border-lime-500/25 bg-lime-500/8 px-4 py-3 text-sm font-semibold text-lime-400 hover:bg-lime-500/15"
                      >
                        <ExternalLink size={14} /> عرض إثبات الدفع
                      </a>
                    )}

                    {/* Admin notes */}
                    <label className="mb-3 grid gap-1.5 text-xs font-semibold text-white/55">
                      ملاحظات الأدمن (تُرسل في الإيميل)
                      <textarea
                        rows={3}
                        value={statusNote}
                        onChange={(e) => setStatusNote(e.target.value)}
                        placeholder="مثال: تم تفعيل حسابك على البريد الإلكتروني..."
                        className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/25 focus:border-purple-500/50 resize-none"
                      />
                    </label>

                    {/* Status buttons */}
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { s: "processing", label: "قيد المعالجة", cls: "border-orange-500/30 text-orange-400 hover:bg-orange-500/10" },
                        { s: "confirmed",  label: "تأكيد الدفع",  cls: "border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10" },
                        { s: "activated",  label: "✓ تفعيل + إيميل", cls: "border-lime-500/40 text-lime-400 hover:bg-lime-500/15 font-black" },
                        { s: "rejected",   label: "✗ رفض + إيميل",  cls: "border-red-500/30 text-red-400 hover:bg-red-500/10" },
                      ].map(({ s, label, cls }) => (
                        <button
                          key={s}
                          onClick={() => updateStatus(selectedOrder.id, s)}
                          disabled={updating || selectedOrder.status === s}
                          className={`rounded-xl border px-3 py-2.5 text-xs font-semibold transition-colors disabled:opacity-40 ${cls}`}
                        >
                          {updating ? "..." : label}
                        </button>
                      ))}
                    </div>

                    {selectedOrder.admin_notes && (
                      <div className="mt-3 rounded-xl bg-white/4 px-3 py-2 text-xs text-white/45">
                        آخر ملاحظة: {selectedOrder.admin_notes}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center rounded-3xl border border-white/8 bg-[#0d0b14] text-sm text-white/25" style={{ minHeight: 200 }}>
                    اختر طلباً لعرض التفاصيل
                  </div>
                )}
              </div>
            </>
          )}

          {/* ── BANNERS ──────────────────────────────────────────────── */}
          {nav === "banners" && (
            <>
              {/* Modal Form */}
              {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur">
                  <div className="w-full max-w-lg overflow-y-auto rounded-3xl border border-white/10 bg-[#0d0b14] p-6" style={{ maxHeight: "90vh" }}>
                    <div className="mb-5 flex items-center justify-between">
                      <h3 className="font-black text-white">{editingId ? "تعديل الشريحة" : "إضافة شريحة جديدة"}</h3>
                      <button onClick={() => setShowForm(false)} className="grid size-8 place-items-center rounded-xl bg-white/8 text-white/60 hover:bg-white/15"><X size={16} /></button>
                    </div>
                    <div className="grid gap-3 text-sm">
                      {/* Image */}
                      <label className="grid gap-1.5 font-semibold text-white/55">
                        الصورة {!editingId && <span className="text-red-400">*</span>}
                        <div
                          onClick={() => imageInputRef.current?.click()}
                          className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border border-dashed border-white/15 bg-white/3 py-5 text-center hover:bg-white/6"
                        >
                          {bannerForm.imageFile ? (
                            <span className="text-xs text-lime-400">{bannerForm.imageFile.name}</span>
                          ) : (
                            <>
                              <ImageIcon size={28} className="text-white/25" />
                              <span className="text-xs text-white/40">انقر لاختيار صورة (WebP / JPG / PNG)</span>
                              <span className="text-[10px] text-white/25">الأفضل: 1920×640 بكسل · أقل من 250KB</span>
                            </>
                          )}
                        </div>
                        <input ref={imageInputRef} type="file" accept="image/*" className="hidden"
                          onChange={(e) => { const f = e.target.files?.[0]; if (f) setBannerForm((p) => ({ ...p, imageFile: f })); }} />
                      </label>
                      {/* Title */}
                      <label className="grid gap-1.5 font-semibold text-white/55">
                        العنوان (اختياري)
                        <input value={bannerForm.title} onChange={(e) => setBannerForm((p) => ({ ...p, title: e.target.value }))}
                          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-white outline-none focus:border-purple-500/50" placeholder="مثال: عروض الصيف 🔥" />
                      </label>
                      {/* Description */}
                      <label className="grid gap-1.5 font-semibold text-white/55">
                        وصف قصير (اختياري)
                        <input value={bannerForm.description} onChange={(e) => setBannerForm((p) => ({ ...p, description: e.target.value }))}
                          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-white outline-none focus:border-purple-500/50" placeholder="وصف العرض أو المنتج" />
                      </label>
                      {/* Button text + link */}
                      <div className="grid gap-3 sm:grid-cols-2">
                        <label className="grid gap-1.5 font-semibold text-white/55">
                          نص الزر
                          <input value={bannerForm.button_text} onChange={(e) => setBannerForm((p) => ({ ...p, button_text: e.target.value }))}
                            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-white outline-none focus:border-purple-500/50" />
                        </label>
                        <label className="grid gap-1.5 font-semibold text-white/55">
                          رابط الوجهة
                          <input value={bannerForm.link_url} onChange={(e) => setBannerForm((p) => ({ ...p, link_url: e.target.value }))}
                            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-white outline-none focus:border-purple-500/50" placeholder="/checkout" />
                        </label>
                      </div>
                      {/* Alt + Order */}
                      <div className="grid gap-3 sm:grid-cols-2">
                        <label className="grid gap-1.5 font-semibold text-white/55">
                          نص Alt (للسيو)
                          <input value={bannerForm.alt_text} onChange={(e) => setBannerForm((p) => ({ ...p, alt_text: e.target.value }))}
                            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-white outline-none focus:border-purple-500/50" />
                        </label>
                        <label className="grid gap-1.5 font-semibold text-white/55">
                          الترتيب
                          <input type="number" value={bannerForm.sort_order} onChange={(e) => setBannerForm((p) => ({ ...p, sort_order: Number(e.target.value) }))}
                            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-white outline-none focus:border-purple-500/50" />
                        </label>
                      </div>
                      {/* Dates */}
                      <div className="grid gap-3 sm:grid-cols-2">
                        <label className="grid gap-1.5 font-semibold text-white/55">
                          تاريخ البدء (اختياري)
                          <input type="datetime-local" value={bannerForm.start_date} onChange={(e) => setBannerForm((p) => ({ ...p, start_date: e.target.value }))}
                            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-white outline-none focus:border-purple-500/50" />
                        </label>
                        <label className="grid gap-1.5 font-semibold text-white/55">
                          تاريخ الانتهاء (اختياري)
                          <input type="datetime-local" value={bannerForm.end_date} onChange={(e) => setBannerForm((p) => ({ ...p, end_date: e.target.value }))}
                            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-white outline-none focus:border-purple-500/50" />
                        </label>
                      </div>
                      {/* Active toggle */}
                      <label className="flex cursor-pointer items-center gap-3">
                        <span className="text-sm font-semibold text-white/55">مفعّلة</span>
                        <button type="button" onClick={() => setBannerForm((p) => ({ ...p, is_active: !p.is_active }))}>
                          {bannerForm.is_active ? <ToggleRight size={28} className="text-lime-400" /> : <ToggleLeft size={28} className="text-white/30" />}
                        </button>
                      </label>
                      {/* Save */}
                      <button onClick={saveBanner} disabled={bannerSaving}
                        className="mt-2 neon-button w-full rounded-2xl py-3.5 font-black text-black disabled:opacity-50">
                        {bannerSaving ? "جاري الحفظ..." : editingId ? "حفظ التعديلات" : "إضافة الشريحة"}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Header */}
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-black">إدارة البانرات الإعلانية</h2>
                <div className="flex gap-2">
                  <button onClick={loadSlides} className="flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2 text-sm text-white/60 hover:bg-white/10 hover:text-white">
                    <RefreshCw size={14} className={slidesLoading ? "animate-spin" : ""} /> تحديث
                  </button>
                  <button onClick={openAddForm} className="neon-button flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold text-black">
                    <Plus size={16} /> إضافة بانر
                  </button>
                </div>
              </div>

              {/* Stats */}
              <div className="mb-5 grid gap-3 sm:grid-cols-3">
                {[
                  { label: "إجمالي الشرائح", val: slides.length, color: "text-white" },
                  { label: "مفعّلة", val: slides.filter((s) => s.is_active).length, color: "text-lime-400" },
                  { label: "معطّلة", val: slides.filter((s) => !s.is_active).length, color: "text-white/40" },
                ].map(({ label, val, color }) => (
                  <div key={label} className="rounded-2xl border border-white/8 bg-[#0d0b14] p-4">
                    <p className="text-xs text-white/40">{label}</p>
                    <p className={`mt-1 text-2xl font-black ${color}`}>{val}</p>
                  </div>
                ))}
              </div>

              {/* Slides list */}
              <div className="grid gap-4">
                {slides.length === 0 && !slidesLoading && (
                  <div className="rounded-3xl border border-dashed border-white/10 py-16 text-center text-sm text-white/30">
                    لا توجد شرائح — اضغط "إضافة بانر" للبدء
                  </div>
                )}
                {slides.map((slide, idx) => (
                  <div key={slide.id} className={`flex gap-4 rounded-3xl border p-4 ${slide.is_active ? "border-white/10 bg-white/3" : "border-white/5 bg-white/1.5 opacity-60"}`}>
                    {/* Thumbnail */}
                    <div className="relative h-20 w-36 shrink-0 overflow-hidden rounded-2xl bg-white/5">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={`${API_URL}${slide.image_url}`} alt={slide.alt_text ?? ""} className="h-full w-full object-cover" loading="lazy" />
                    </div>
                    {/* Info */}
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <div className="flex items-start gap-2">
                        <span className="flex-1 truncate font-bold text-white">{slide.title || <span className="text-white/30 italic">بدون عنوان</span>}</span>
                        <span className={`shrink-0 rounded-xl px-2 py-0.5 text-[10px] font-bold ${slide.is_active ? "bg-lime-500/15 text-lime-400" : "bg-white/8 text-white/40"}`}>
                          {slide.is_active ? "مفعّل" : "معطّل"}
                        </span>
                      </div>
                      {slide.description && <p className="truncate text-xs text-white/45">{slide.description}</p>}
                      <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-[10px] text-white/30">
                        <span>زر: {slide.button_text}</span>
                        <span>رابط: {slide.link_url}</span>
                        <span>ترتيب: {slide.sort_order}</span>
                      </div>
                    </div>
                    {/* Actions */}
                    <div className="flex shrink-0 flex-col gap-1.5">
                      <button onClick={() => openEditForm(slide)} className="grid size-8 place-items-center rounded-xl bg-purple-500/15 text-purple-400 hover:bg-purple-500/25" title="تعديل"><Pencil size={13} /></button>
                      <button onClick={() => toggleBanner(slide.id)} className="grid size-8 place-items-center rounded-xl bg-white/8 text-white/50 hover:bg-white/15" title="تفعيل/تعطيل">
                        {slide.is_active ? <ToggleRight size={13} className="text-lime-400" /> : <ToggleLeft size={13} />}
                      </button>
                      <button onClick={() => moveSlide(slide.id, "up")} disabled={idx === 0} className="grid size-8 place-items-center rounded-xl bg-white/8 text-white/50 hover:bg-white/15 disabled:opacity-25" title="أعلى"><ArrowUp size={13} /></button>
                      <button onClick={() => moveSlide(slide.id, "down")} disabled={idx === slides.length - 1} className="grid size-8 place-items-center rounded-xl bg-white/8 text-white/50 hover:bg-white/15 disabled:opacity-25" title="أسفل"><ArrowDown size={13} /></button>
                      <button onClick={() => deleteBanner(slide.id)} className="grid size-8 place-items-center rounded-xl bg-red-500/15 text-red-400 hover:bg-red-500/25" title="حذف"><Trash2 size={13} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ── CHAT ─────────────────────────────────────────────────── */}
          {nav === "chat" && (
            <>
              <h2 className="mb-6 text-2xl font-black">الشات المباشر</h2>
              <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
                <div className="flex flex-col gap-2">
                  <button onClick={loadSessions} className="mb-1 rounded-xl bg-white/5 px-3 py-1.5 text-xs text-white/50 hover:bg-white/8 text-right">
                    تحديث ↻
                  </button>
                  {sessions.length === 0 && <div className="rounded-2xl border border-white/8 p-5 text-center text-sm text-white/40">لا توجد محادثات</div>}
                  {sessions.map((s) => (
                    <button key={s.id} onClick={() => openSession(s)}
                      className={`flex flex-col gap-1 rounded-2xl border p-4 text-right transition-colors ${activeSession?.id === s.id ? "border-purple-500/40 bg-purple-600/10" : "border-white/8 bg-white/3 hover:bg-white/6"}`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-sm font-bold text-white">{s.name}</span>
                        {s.is_resolved ? <CheckCircle size={13} className="shrink-0 text-lime-400" /> : <span className="size-2 shrink-0 rounded-full bg-purple-400" />}
                      </div>
                      <span className="truncate text-xs text-white/40">{s.email}</span>
                      {s.last_message && <span className="truncate text-xs text-white/55">{s.last_message}</span>}
                    </button>
                  ))}
                </div>

                {activeSession ? (
                  <div className="flex flex-col overflow-hidden rounded-3xl border border-white/8 bg-[#0d0b14]">
                    <div className="flex items-center justify-between gap-3 border-b border-white/8 px-5 py-4">
                      <div>
                        <h3 className="font-black">{activeSession.name}</h3>
                        <p className="text-xs text-white/45">{activeSession.email} · {activeSession.whatsapp}</p>
                      </div>
                      {!activeSession.is_resolved && (
                        <button onClick={() => resolveSession(activeSession.id)} className="flex items-center gap-1.5 rounded-xl bg-lime-500/15 px-3 py-1.5 text-xs font-bold text-lime-400 hover:bg-lime-500/25">
                          <CheckCircle size={13} /> إغلاق
                        </button>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-5" style={{ maxHeight: 380 }}>
                      {messages.map((m) => (
                        <div key={m.id} className={`flex ${m.is_admin ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm leading-6 ${m.is_admin ? "rounded-tl-sm bg-purple-600/80" : "rounded-tr-sm bg-white/8"}`}>
                            {m.content}
                          </div>
                        </div>
                      ))}
                      <div ref={bottomRef} />
                    </div>
                    {!activeSession.is_resolved && (
                      <div className="flex gap-2 border-t border-white/8 p-4">
                        <input value={reply} onChange={(e) => setReply(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendReply(); } }}
                          className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none placeholder:text-white/35 focus:border-purple-500/50"
                          placeholder="اكتب ردك..." autoFocus
                        />
                        <button onClick={sendReply} disabled={!reply.trim()} className="grid size-10 shrink-0 place-items-center rounded-2xl bg-purple-600 text-white disabled:opacity-40">
                          <Send size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center rounded-3xl border border-white/8 text-sm text-white/25" style={{ minHeight: 300 }}>
                    اختر محادثة للبدء
                  </div>
                )}
              </div>
            </>
          )}

          {nav === "products" && (
            <div className="py-12 text-center text-white/30">قسم المنتجات — قريباً</div>
          )}
          {nav === "settings" && (
            <div className="py-12 text-center text-white/30">قسم الإعدادات — قريباً</div>
          )}
        </div>
      </div>
    </main>
  );
}
