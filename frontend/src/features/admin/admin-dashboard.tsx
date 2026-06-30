"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  MessageCircle, Package, ReceiptText, Send, ShieldCheck,
  Users, CheckCircle, RefreshCw, Eye, Clock, ExternalLink,
  ImageIcon, Plus, Trash2, ArrowUp, ArrowDown, ToggleLeft, ToggleRight, Pencil, X,
  Gift, Tag, Percent, Copy, Truck, BookOpen, Star,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

/* ── Types ─────────────────────────────────────────────────────────────── */
type ChatSession = { id: string; name: string; email: string; whatsapp: string; is_resolved: boolean; created_at: string; last_message: string | null };
type ChatMessage = { id: string; content: string; is_admin: boolean; created_at: string; session_id?: string };
type Order = {
  id: string; customer_name: string; customer_email: string; customer_whatsapp: string | null;
  customer_country: string | null; customer_telegram: string | null; customer_notes: string | null;
  product_name: string; product_price: number; payment_method: string | null;
  payment_proof_url: string | null; payment_proof_urls?: string[]; payment_parts_count?: number; payment_total_paid?: number;
  status: string; admin_notes: string | null;
  tracking_stage: number; tracking_notes: string | null;
  created_at: string; expires_at: string | null;
};

type DiscountCode = {
  id: number; code: string; percent: number; order_id: string | null;
  description: string | null; expires_at: string | null;
  max_uses: number; used_count: number; is_active: boolean; created_at: string;
};

type DiscountForm = {
  code: string; percent: number; order_id: string; description: string;
  expires_at: string; max_uses: number;
};

const EMPTY_DC: DiscountForm = { code: "", percent: 35, order_id: "", description: "", expires_at: "", max_uses: 1 };

type NavSection = "orders" | "products" | "banners" | "chat" | "settings" | "discounts" | "blog";

type BlogPost = {
  id: string; slug: string; title: string; excerpt: string; content: string;
  author: string; category: string; tags: string[]; published: boolean;
  featured: boolean; views: number; created_at: string;
};
type BlogForm = {
  title: string; slug: string; excerpt: string; content: string;
  author: string; category: string; tags: string; published: boolean; featured: boolean;
};
const EMPTY_BLOG: BlogForm = {
  title: "", slug: "", excerpt: "", content: "", author: "فريق Growfolo",
  category: "news", tags: "", published: false, featured: false,
};
const BLOG_CATS = [
  { id: "ai", label: "الذكاء الاصطناعي" }, { id: "services", label: "الخدمات" },
  { id: "companies", label: "الشركات العالمية" }, { id: "tutorials", label: "الشروحات" },
  { id: "news", label: "الأخبار" },
];

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

function getProofUrls(order: Order): string[] {
  if (Array.isArray(order.payment_proof_urls) && order.payment_proof_urls.length > 0) {
    return order.payment_proof_urls;
  }
  if (!order.payment_proof_url) return [];
  try {
    const parsed = JSON.parse(order.payment_proof_url);
    if (Array.isArray(parsed)) return parsed.filter(Boolean).map(String);
  } catch {}
  return [order.payment_proof_url];
}

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
  const [trackingStage, setTrackingStage] = useState(1);
  const [trackingNote, setTrackingNote] = useState("");
  const [updatingTracking, setUpdatingTracking] = useState(false);

  /* ── Discounts state ────────────────────────────────────────────────── */
  const [discounts, setDiscounts] = useState<DiscountCode[]>([]);
  const [discountsLoading, setDiscountsLoading] = useState(false);
  const [dcForm, setDcForm] = useState<DiscountForm>(EMPTY_DC);
  const [dcSaving, setDcSaving] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  /* ── Chat state ─────────────────────────────────────────────────────── */
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSession, setActiveSession] = useState<ChatSession | null>(null);
  const activeSessionRef = useRef<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [reply, setReply] = useState("");
  const chatPollRef     = useRef<ReturnType<typeof setInterval> | null>(null);
  const sessionsPollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const chatLastTsRef   = useRef<string | null>(null);
  const chatKnownIds    = useRef<Set<string>>(new Set());
  const activeSidRef    = useRef<string | null>(null);
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

  /* ── Load discounts ───────────────────────────────────────────────── */
  const loadDiscounts = useCallback(async () => {
    setDiscountsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/v1/discounts`);
      if (res.ok) setDiscounts(await res.json());
    } catch {} finally { setDiscountsLoading(false); }
  }, []);

  useEffect(() => { if (nav === "discounts") loadDiscounts(); }, [nav, loadDiscounts]);

  async function saveDiscount() {
    setDcSaving(true);
    try {
      const body = {
        code: dcForm.code.trim() || undefined,
        percent: dcForm.percent,
        order_id: dcForm.order_id.trim() || undefined,
        description: dcForm.description.trim() || undefined,
        expires_at: dcForm.expires_at || undefined,
        max_uses: dcForm.max_uses,
      };
      const res = await fetch(`${API_URL}/api/v1/discounts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) { setDcForm(EMPTY_DC); await loadDiscounts(); }
      else { const err = await res.json(); alert(err.detail ?? "خطأ"); }
    } catch {} finally { setDcSaving(false); }
  }

  async function deleteDiscount(id: number) {
    if (!confirm("حذف الكود؟")) return;
    await fetch(`${API_URL}/api/v1/discounts/${id}`, { method: "DELETE" });
    setDiscounts((p) => p.filter((d) => d.id !== id));
  }

  async function toggleDiscount(id: number) {
    const res = await fetch(`${API_URL}/api/v1/discounts/${id}/toggle`, { method: "PATCH" });
    if (res.ok) { const updated: DiscountCode = await res.json(); setDiscounts((p) => p.map((d) => d.id === id ? updated : d)); }
  }

  function copyCode(id: number, code: string) {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedId(id); setTimeout(() => setCopiedId(null), 2000);
    });
  }

  /* ── Update tracking ──────────────────────────────────────────────── */
  const updateTracking = async (orderId: string) => {
    setUpdatingTracking(true);
    try {
      const res = await fetch(`${API_URL}/api/v1/store-orders/${orderId}/tracking`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tracking_stage: trackingStage, tracking_notes: trackingNote || null }),
      });
      if (res.ok) {
        const updated: Order = await res.json();
        setOrders((p) => p.map((o) => o.id === orderId ? updated : o));
        setSelectedOrder(updated);
      }
    } catch {} finally { setUpdatingTracking(false); }
  };

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

  // Poll session list every 10 s so new incoming chats appear without refresh
  useEffect(() => {
    if (nav !== "chat") {
      if (sessionsPollRef.current) { clearInterval(sessionsPollRef.current); sessionsPollRef.current = null; }
      return;
    }
    sessionsPollRef.current = setInterval(() => { void loadSessions(); }, 10_000);
    return () => { if (sessionsPollRef.current) { clearInterval(sessionsPollRef.current); sessionsPollRef.current = null; } };
  }, [nav, loadSessions]);

  // Stop all chat polling when leaving chat section
  useEffect(() => {
    if (nav !== "chat") {
      if (chatPollRef.current) { clearInterval(chatPollRef.current); chatPollRef.current = null; }
    }
  }, [nav]);

  const openSession = useCallback(async (session: ChatSession) => {
    // Stop previous session poll
    if (chatPollRef.current) { clearInterval(chatPollRef.current); chatPollRef.current = null; }

    setActiveSession(session);
    setMessages([]);
    chatKnownIds.current = new Set();
    chatLastTsRef.current = null;
    activeSidRef.current = session.id;

    try {
      const res = await fetch(`${API_URL}/api/v1/chat/sessions/${session.id}/messages`);
      if (res.ok) {
        const msgs: ChatMessage[] = await res.json();
        setMessages(msgs);
        msgs.forEach(m => chatKnownIds.current.add(m.id));
        chatLastTsRef.current = msgs.length > 0 ? msgs[msgs.length - 1].created_at : null;
      }
    } catch {}

    // Start polling this session for new messages every 3 s
    const sid = session.id;
    chatPollRef.current = setInterval(async () => {
      if (activeSidRef.current !== sid) return;
      try {
        const since = chatLastTsRef.current;
        const url = since
          ? `${API_URL}/api/v1/chat/sessions/${sid}/messages?since=${encodeURIComponent(since)}`
          : `${API_URL}/api/v1/chat/sessions/${sid}/messages`;
        const r = await fetch(url);
        if (!r.ok) return;
        const msgs: ChatMessage[] = await r.json();
        if (msgs.length === 0) return;
        chatLastTsRef.current = msgs[msgs.length - 1].created_at;
        const newMsgs = msgs.filter(m => !chatKnownIds.current.has(m.id));
        if (newMsgs.length > 0) {
          newMsgs.forEach(m => chatKnownIds.current.add(m.id));
          // Update session list last_message for client messages
          const clientMsgs = newMsgs.filter(m => !m.is_admin);
          if (clientMsgs.length > 0) {
            setSessions(p => p.map(s => s.id === sid ? { ...s, last_message: clientMsgs[clientMsgs.length - 1].content } : s));
          }
          setMessages(p => [...p, ...newMsgs]);
        }
      } catch {}
    }, 3_000);
  }, []);

  const sendReply = useCallback(async () => {
    if (!reply.trim() || !activeSession) return;
    const content = reply.trim();
    setReply("");
    try {
      const res = await fetch(`${API_URL}/api/v1/chat/sessions/${activeSession.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, is_admin: true }),
      });
      if (res.ok) {
        const msg: ChatMessage = await res.json();
        chatKnownIds.current.add(msg.id);
        chatLastTsRef.current = msg.created_at;
        setMessages(p => [...p, msg]);
        setSessions(p => p.map(s => s.id === activeSession.id ? { ...s, last_message: content } : s));
      }
    } catch {}
  }, [reply, activeSession]);

  const resolveSession = async (id: string) => {
    await fetch(`${API_URL}/api/v1/chat/sessions/${id}/resolve`, { method: "PATCH" });
    setSessions((p) => p.map((s) => (s.id === id ? { ...s, is_resolved: true } : s)));
    if (activeSession?.id === id) setActiveSession((p) => p ? { ...p, is_resolved: true } : p);
  };

  const fmt = (iso: string) => { try { return new Date(iso).toLocaleString("ar-DZ", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }); } catch { return ""; } };

  /* ── Blog state ────────────────────────────────────────────────────── */
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [blogLoading, setBlogLoading] = useState(false);
  const [blogForm, setBlogForm] = useState<BlogForm>(EMPTY_BLOG);
  const [editingBlogId, setEditingBlogId] = useState<string | null>(null);
  const [showBlogForm, setShowBlogForm] = useState(false);
  const [blogSaving, setBlogSaving] = useState(false);

  const loadBlogPosts = useCallback(async () => {
    setBlogLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/v1/blog/admin/all`);
      if (res.ok) setBlogPosts(await res.json());
    } catch {} finally { setBlogLoading(false); }
  }, []);

  useEffect(() => { if (nav === "blog") loadBlogPosts(); }, [nav, loadBlogPosts]);

  function openBlogAdd() {
    setEditingBlogId(null); setBlogForm(EMPTY_BLOG); setShowBlogForm(true);
  }
  function openBlogEdit(p: BlogPost) {
    setEditingBlogId(p.id);
    setBlogForm({ title: p.title, slug: p.slug, excerpt: p.excerpt, content: p.content, author: p.author, category: p.category, tags: p.tags.join(", "), published: p.published, featured: p.featured });
    setShowBlogForm(true);
  }

  async function saveBlogPost() {
    if (!blogForm.title.trim()) { alert("عنوان المقال مطلوب"); return; }
    setBlogSaving(true);
    const body = {
      title: blogForm.title, slug: blogForm.slug.trim() || undefined,
      excerpt: blogForm.excerpt, content: blogForm.content,
      author: blogForm.author, category: blogForm.category,
      tags: blogForm.tags.split(",").map(t => t.trim()).filter(Boolean),
      published: blogForm.published, featured: blogForm.featured,
    };
    try {
      const url = editingBlogId ? `${API_URL}/api/v1/blog/${editingBlogId}` : `${API_URL}/api/v1/blog`;
      const method = editingBlogId ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (res.ok) { setShowBlogForm(false); await loadBlogPosts(); }
      else { const err = await res.json(); alert(err.detail ?? "خطأ في الحفظ"); }
    } catch {} finally { setBlogSaving(false); }
  }

  async function deleteBlogPost(id: string) {
    if (!confirm("حذف هذا المقال نهائياً؟")) return;
    await fetch(`${API_URL}/api/v1/blog/${id}`, { method: "DELETE" });
    setBlogPosts(p => p.filter(b => b.id !== id));
    if (editingBlogId === id) { setShowBlogForm(false); setEditingBlogId(null); }
  }

  async function toggleBlogPublish(id: string) {
    const res = await fetch(`${API_URL}/api/v1/blog/${id}/toggle`, { method: "PATCH" });
    if (res.ok) { const u: BlogPost = await res.json(); setBlogPosts(p => p.map(b => b.id === id ? u : b)); }
  }

  async function toggleBlogFeatured(id: string) {
    const res = await fetch(`${API_URL}/api/v1/blog/${id}/featured`, { method: "PATCH" });
    if (res.ok) { const u: BlogPost = await res.json(); setBlogPosts(p => p.map(b => b.id === id ? u : b)); }
  }

  /* ── Sidebar nav items ─────────────────────────────────────────────── */
  const NAV = [
    { id: "orders" as NavSection, label: "الطلبات", icon: ReceiptText, badge: orders.filter((o) => o.status === "processing").length },
    { id: "banners" as NavSection, label: "البانرات", icon: ImageIcon, badge: 0 },
    { id: "products" as NavSection, label: "المنتجات", icon: Package, badge: 0 },
    { id: "chat" as NavSection, label: "الشات المباشر", icon: MessageCircle, badge: sessions.filter((s) => !s.is_resolved).length },
    { id: "discounts" as NavSection, label: "أكواد الخصم", icon: Gift, badge: 0 },
    { id: "blog" as NavSection, label: "المدونة", icon: BookOpen, badge: blogPosts.filter(p => !p.published).length },
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
                    const proofUrls = getProofUrls(order);
                    return (
                      <button
                        key={order.id}
                        onClick={() => { setSelectedOrder(order); setTrackingStage(order.tracking_stage || 1); setTrackingNote(""); }}
                        className={`flex w-full items-center gap-3 border-b border-white/5 px-5 py-4 text-right transition-colors hover:bg-white/4 ${selectedOrder?.id === order.id ? "bg-purple-600/10" : ""}`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-black text-white truncate">{order.customer_name}</span>
                            <span className={`shrink-0 rounded-xl px-2 py-0.5 text-[10px] font-bold ${s.bg} ${s.color}`}>{s.label}</span>
                            {order.payment_method === "whatsapp" && (
                              <span className="shrink-0 rounded-xl px-2 py-0.5 text-[10px] font-black bg-[#25D366]/15 text-[#25D366]">💬 واتساب</span>
                            )}
                          </div>
                          <p className="mt-0.5 truncate text-xs text-white/40">{order.product_name} · {order.customer_email}</p>
                          <p className="text-[10px] text-white/25 mt-0.5">{fmt(order.created_at)} {order.customer_country ? `· ${order.customer_country}` : ""}</p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="font-black text-white">{order.product_price}$</p>
                          {proofUrls.length > 0 && <span className="text-[10px] text-lime-400">{proofUrls.length} وصل مرفوع ✓</span>}
                        </div>
                        <Eye size={14} className="shrink-0 text-white/25" />
                      </button>
                    );
                  })}
                </div>

                {/* Detail panel */}
                {selectedOrder ? (() => {
                  const proofUrls = getProofUrls(selectedOrder);
                  return (
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
                        { l: "عدد الدفعات", v: `${proofUrls.length || selectedOrder.payment_parts_count || 0}` },
                        { l: "إجمالي المدفوع", v: `${selectedOrder.payment_total_paid ?? selectedOrder.product_price}$` },
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

                    {/* Proof links */}
                    {proofUrls.length > 0 && (
                      <div className="mb-4 grid gap-2">
                        <p className="text-xs font-black text-white/45">إيصالات الدفع ({proofUrls.length})</p>
                        {proofUrls.map((url, index) => (
                          <a
                            key={`${url}-${index}`}
                            href={`${API_URL}${url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 rounded-2xl border border-lime-500/25 bg-lime-500/8 px-4 py-3 text-sm font-semibold text-lime-400 hover:bg-lime-500/15"
                          >
                            <ExternalLink size={14} /> عرض إيصال الدفع {index + 1}
                          </a>
                        ))}
                      </div>
                    )}

                    {/* ── Tracking stage ────────────────────────────── */}
                    <div className="mb-4 rounded-2xl border border-purple-500/20 bg-purple-500/5 p-4">
                      <div className="mb-3 flex items-center gap-2 text-xs font-black text-purple-300">
                        <Truck size={14} /> مرحلة تتبع الطلب
                      </div>
                      <div className="mb-2 flex gap-1.5">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <button
                            key={n}
                            onClick={() => setTrackingStage(n)}
                            className="flex-1 rounded-xl py-2 text-xs font-black transition-all"
                            style={{
                              background: trackingStage === n
                                ? (n === 5 ? "rgba(200,230,0,0.3)" : "rgba(168,85,247,0.4)")
                                : (selectedOrder.tracking_stage >= n ? "rgba(168,85,247,0.15)" : "rgba(255,255,255,0.05)"),
                              color: trackingStage === n
                                ? (n === 5 ? "#c8e600" : "#c084fc")
                                : (selectedOrder.tracking_stage >= n ? "rgba(192,132,252,0.7)" : "rgba(255,255,255,0.25)"),
                              border: `1px solid ${trackingStage === n ? "rgba(168,85,247,0.5)" : "rgba(255,255,255,0.06)"}`,
                            }}
                          >
                            {n}
                          </button>
                        ))}
                      </div>
                      <div className="mb-2 text-[10px] text-center text-white/35">
                        الحالية: المرحلة {selectedOrder.tracking_stage} ← المختارة: {trackingStage}
                      </div>
                      <textarea
                        rows={2}
                        value={trackingNote}
                        onChange={(e) => setTrackingNote(e.target.value)}
                        placeholder="ملاحظة للمتابعة (اختياري)..."
                        className="mb-2 w-full resize-none rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none placeholder:text-white/25 focus:border-purple-500/40"
                      />
                      <button
                        onClick={() => updateTracking(selectedOrder.id)}
                        disabled={updatingTracking}
                        className="w-full rounded-xl py-2 text-xs font-black transition-all disabled:opacity-50"
                        style={{ background: "linear-gradient(135deg, rgba(168,85,247,0.5), rgba(99,102,241,0.5))", border: "1px solid rgba(168,85,247,0.3)" }}
                      >
                        {updatingTracking ? "جارٍ التحديث..." : "تحديث مرحلة التتبع"}
                      </button>
                      {selectedOrder.tracking_notes && (
                        <div className="mt-2 rounded-xl bg-white/4 px-3 py-2 text-[10px] text-white/45">
                          📝 {selectedOrder.tracking_notes}
                        </div>
                      )}
                    </div>

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
                  );
                })() : (
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
                          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void sendReply(); } }}
                          className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none placeholder:text-white/35 focus:border-purple-500/50"
                          placeholder="اكتب ردك..." autoFocus
                        />
                        <button onClick={() => void sendReply()} disabled={!reply.trim()} className="grid size-10 shrink-0 place-items-center rounded-2xl bg-purple-600 text-white disabled:opacity-40">
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

          {nav === "products" && <ProductsAdmin />}
          {nav === "settings" && (
            <div className="py-12 text-center text-white/30">قسم الإعدادات — قريباً</div>
          )}

          {/* ── BLOG ─────────────────────────────────────────────────── */}
          {nav === "blog" && (
            <>
              {/* Blog form modal */}
              {showBlogForm && (
                <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur">
                  <div className="my-8 w-full max-w-2xl rounded-3xl border border-white/10 bg-[#0d0b14] p-6">
                    <div className="mb-5 flex items-center justify-between">
                      <h3 className="font-black text-white">{editingBlogId ? "تعديل المقال" : "مقال جديد"}</h3>
                      <button onClick={() => setShowBlogForm(false)} className="grid size-8 place-items-center rounded-xl bg-white/8 text-white/60 hover:bg-white/15"><X size={16} /></button>
                    </div>
                    <div className="grid gap-3 text-sm">
                      {/* Title */}
                      <label className="grid gap-1.5 font-semibold text-white/55">
                        العنوان <span className="text-red-400">*</span>
                        <input value={blogForm.title} onChange={e => {
                          const t = e.target.value;
                          setBlogForm(p => ({ ...p, title: t, slug: p.slug || t.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").slice(0, 80) }));
                        }}
                          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-white outline-none focus:border-lime-500/50" placeholder="عنوان المقال..." />
                      </label>
                      {/* Slug */}
                      <label className="grid gap-1.5 font-semibold text-white/55">
                        الـ Slug (رابط المقال)
                        <input value={blogForm.slug} onChange={e => setBlogForm(p => ({ ...p, slug: e.target.value }))}
                          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 font-mono text-sm text-white outline-none focus:border-lime-500/50" placeholder="auto-generated-if-empty" />
                      </label>
                      {/* Category + Author */}
                      <div className="grid gap-3 sm:grid-cols-2">
                        <label className="grid gap-1.5 font-semibold text-white/55">
                          التصنيف
                          <select value={blogForm.category} onChange={e => setBlogForm(p => ({ ...p, category: e.target.value }))}
                            className="rounded-xl border border-white/10 bg-[#0d0b14] px-3 py-2.5 text-white outline-none focus:border-lime-500/50">
                            {BLOG_CATS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                          </select>
                        </label>
                        <label className="grid gap-1.5 font-semibold text-white/55">
                          الكاتب
                          <input value={blogForm.author} onChange={e => setBlogForm(p => ({ ...p, author: e.target.value }))}
                            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-white outline-none focus:border-lime-500/50" />
                        </label>
                      </div>
                      {/* Excerpt */}
                      <label className="grid gap-1.5 font-semibold text-white/55">
                        المقتطف (وصف قصير)
                        <textarea rows={2} value={blogForm.excerpt} onChange={e => setBlogForm(p => ({ ...p, excerpt: e.target.value }))}
                          className="resize-none rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-white outline-none focus:border-lime-500/50" placeholder="وصف مختصر للمقال..." />
                      </label>
                      {/* Content */}
                      <label className="grid gap-1.5 font-semibold text-white/55">
                        محتوى المقال (HTML مسموح)
                        <textarea rows={12} value={blogForm.content} onChange={e => setBlogForm(p => ({ ...p, content: e.target.value }))}
                          className="resize-y rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 font-mono text-xs text-white outline-none focus:border-lime-500/50" placeholder="<h2>عنوان...</h2><p>محتوى المقال هنا...</p>" />
                      </label>
                      {/* Tags */}
                      <label className="grid gap-1.5 font-semibold text-white/55">
                        الوسوم (مفصولة بفاصلة)
                        <input value={blogForm.tags} onChange={e => setBlogForm(p => ({ ...p, tags: e.target.value }))}
                          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-white outline-none focus:border-lime-500/50" placeholder="ذكاء اصطناعي, Claude, GPT" />
                      </label>
                      {/* Toggles */}
                      <div className="flex gap-4">
                        <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-white/55">
                          <button type="button" onClick={() => setBlogForm(p => ({ ...p, published: !p.published }))}>
                            {blogForm.published ? <ToggleRight size={26} className="text-lime-400" /> : <ToggleLeft size={26} className="text-white/30" />}
                          </button>
                          منشور
                        </label>
                        <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-white/55">
                          <button type="button" onClick={() => setBlogForm(p => ({ ...p, featured: !p.featured }))}>
                            {blogForm.featured ? <Star size={20} className="text-yellow-400 fill-yellow-400" /> : <Star size={20} className="text-white/25" />}
                          </button>
                          مميز
                        </label>
                      </div>
                      {/* Save */}
                      <button onClick={saveBlogPost} disabled={blogSaving}
                        className="mt-2 neon-button w-full rounded-2xl py-3.5 font-black text-black disabled:opacity-50">
                        {blogSaving ? "جارٍ الحفظ..." : editingBlogId ? "حفظ التعديلات" : "نشر المقال"}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Header */}
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-black">إدارة المدونة</h2>
                <div className="flex gap-2">
                  <button onClick={loadBlogPosts} className="flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2 text-sm text-white/60 hover:bg-white/10 hover:text-white">
                    <RefreshCw size={14} className={blogLoading ? "animate-spin" : ""} /> تحديث
                  </button>
                  <a href="/blog" target="_blank" className="flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2 text-sm text-white/60 hover:bg-white/10 hover:text-white">
                    <Eye size={14} /> معاينة
                  </a>
                  <button onClick={openBlogAdd} className="neon-button flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold text-black">
                    <Plus size={16} /> مقال جديد
                  </button>
                </div>
              </div>

              {/* Stats */}
              <div className="mb-5 grid gap-3 sm:grid-cols-4">
                {[
                  { label: "إجمالي المقالات", val: blogPosts.length, color: "text-white" },
                  { label: "منشورة", val: blogPosts.filter(p => p.published).length, color: "text-lime-400" },
                  { label: "مسودة", val: blogPosts.filter(p => !p.published).length, color: "text-yellow-400" },
                  { label: "مميزة", val: blogPosts.filter(p => p.featured).length, color: "text-purple-400" },
                ].map(({ label, val, color }) => (
                  <div key={label} className="rounded-2xl border border-white/8 bg-[#0d0b14] p-4">
                    <p className="text-xs text-white/40">{label}</p>
                    <p className={`mt-1 text-2xl font-black ${color}`}>{val}</p>
                  </div>
                ))}
              </div>

              {/* Posts list */}
              {blogPosts.length === 0 && !blogLoading && (
                <div className="rounded-3xl border border-dashed border-white/10 py-16 text-center text-sm text-white/30">
                  لا توجد مقالات — اضغط "مقال جديد" للبدء
                </div>
              )}
              <div className="grid gap-3">
                {blogPosts.map(post => {
                  const catConf = BLOG_CATS.find(c => c.id === post.category);
                  return (
                    <div key={post.id} className="flex flex-wrap items-start gap-4 rounded-3xl border border-white/8 bg-white/3 p-4">
                      {/* Status badges */}
                      <div className="flex flex-col gap-1.5">
                        <span className={`rounded-xl px-2 py-1 text-[10px] font-black ${post.published ? "bg-lime-500/15 text-lime-400" : "bg-yellow-500/15 text-yellow-400"}`}>
                          {post.published ? "● منشور" : "○ مسودة"}
                        </span>
                        {post.featured && <span className="rounded-xl bg-yellow-400/15 px-2 py-1 text-[10px] font-black text-yellow-400">★ مميز</span>}
                      </div>
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-black text-white">{post.title}</p>
                          {catConf && <span className="rounded-lg bg-white/8 px-2 py-0.5 text-[10px] text-white/50">{catConf.label}</span>}
                        </div>
                        <p className="mt-1 truncate text-xs text-white/40">{post.excerpt}</p>
                        <div className="mt-1.5 flex flex-wrap gap-x-4 text-[10px] text-white/30">
                          <span>{post.author}</span>
                          <span>{new Date(post.created_at).toLocaleDateString("ar")}</span>
                          <span className="flex items-center gap-0.5"><Eye size={10} /> {post.views}</span>
                          <span className="font-mono text-white/20">/blog/{post.slug}</span>
                        </div>
                      </div>
                      {/* Actions */}
                      <div className="flex shrink-0 gap-2">
                        <button onClick={() => toggleBlogFeatured(post.id)} className="grid size-8 place-items-center rounded-xl bg-white/8 hover:bg-yellow-500/15" title="تمييز">
                          <Star size={13} className={post.featured ? "fill-yellow-400 text-yellow-400" : "text-white/40"} />
                        </button>
                        <button onClick={() => openBlogEdit(post)} className="grid size-8 place-items-center rounded-xl bg-purple-500/15 text-purple-400 hover:bg-purple-500/25" title="تعديل">
                          <Pencil size={13} />
                        </button>
                        <button onClick={() => toggleBlogPublish(post.id)} className="grid size-8 place-items-center rounded-xl bg-white/8 text-white/50 hover:bg-white/15" title={post.published ? "إلغاء النشر" : "نشر"}>
                          {post.published ? <ToggleRight size={13} className="text-lime-400" /> : <ToggleLeft size={13} />}
                        </button>
                        <button onClick={() => deleteBlogPost(post.id)} className="grid size-8 place-items-center rounded-xl bg-red-500/12 text-red-400 hover:bg-red-500/22" title="حذف">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* ── DISCOUNTS ────────────────────────────────────────── */}
          {nav === "discounts" && (
            <>
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-black">أكواد الخصم</h2>
                <button onClick={loadDiscounts} className="flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2 text-sm text-white/60 hover:bg-white/10 hover:text-white">
                  <RefreshCw size={14} className={discountsLoading ? "animate-spin" : ""} /> تحديث
                </button>
              </div>

              {/* Stats */}
              <div className="mb-5 grid gap-3 sm:grid-cols-4">
                {[
                  { label: "إجمالي الأكواد", val: discounts.length, color: "text-white" },
                  { label: "مفعّلة", val: discounts.filter((d) => d.is_active).length, color: "text-lime-400" },
                  { label: "مستخدمة كلياً", val: discounts.filter((d) => d.used_count >= d.max_uses).length, color: "text-orange-400" },
                  { label: "مرتبطة بطلبات", val: discounts.filter((d) => d.order_id).length, color: "text-purple-400" },
                ].map(({ label, val, color }) => (
                  <div key={label} className="rounded-2xl border border-white/8 bg-[#0d0b14] p-4">
                    <p className="text-xs text-white/40">{label}</p>
                    <p className={`mt-1 text-2xl font-black ${color}`}>{val}</p>
                  </div>
                ))}
              </div>

              {/* Create form */}
              <div className="mb-6 rounded-3xl border border-lime-500/15 bg-lime-500/4 p-5">
                <div className="mb-4 flex items-center gap-2 text-sm font-black text-lime-400">
                  <Plus size={16} /> إنشاء كود خصم جديد
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <label className="grid gap-1 text-xs font-semibold text-white/50">
                    الكود (فارغ = توليد تلقائي)
                    <input
                      value={dcForm.code}
                      onChange={(e) => setDcForm((p) => ({ ...p, code: e.target.value.toUpperCase() }))}
                      placeholder="GF-SUMMER35"
                      className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-white/20 focus:border-lime-500/40"
                    />
                  </label>
                  <label className="grid gap-1 text-xs font-semibold text-white/50">
                    نسبة الخصم %
                    <input
                      type="number" min={1} max={100}
                      value={dcForm.percent}
                      onChange={(e) => setDcForm((p) => ({ ...p, percent: Number(e.target.value) }))}
                      className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-lime-500/40"
                    />
                  </label>
                  <label className="grid gap-1 text-xs font-semibold text-white/50">
                    الحد الأقصى للاستخدام
                    <input
                      type="number" min={1}
                      value={dcForm.max_uses}
                      onChange={(e) => setDcForm((p) => ({ ...p, max_uses: Number(e.target.value) }))}
                      className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-lime-500/40"
                    />
                  </label>
                  <label className="grid gap-1 text-xs font-semibold text-white/50">
                    رقم الطلب (اختياري)
                    <input
                      value={dcForm.order_id}
                      onChange={(e) => setDcForm((p) => ({ ...p, order_id: e.target.value }))}
                      placeholder="UUID الطلب"
                      className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none placeholder:text-white/20 focus:border-lime-500/40 font-mono"
                    />
                  </label>
                  <label className="grid gap-1 text-xs font-semibold text-white/50">
                    تاريخ الانتهاء (اختياري)
                    <input
                      type="datetime-local"
                      value={dcForm.expires_at}
                      onChange={(e) => setDcForm((p) => ({ ...p, expires_at: e.target.value }))}
                      className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-lime-500/40"
                    />
                  </label>
                  <label className="grid gap-1 text-xs font-semibold text-white/50">
                    وصف (اختياري)
                    <input
                      value={dcForm.description}
                      onChange={(e) => setDcForm((p) => ({ ...p, description: e.target.value }))}
                      placeholder="مثال: هدية المرحلة 5"
                      className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-white/20 focus:border-lime-500/40"
                    />
                  </label>
                </div>
                <button
                  onClick={saveDiscount} disabled={dcSaving}
                  className="mt-4 neon-button flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-black text-black disabled:opacity-50"
                >
                  {dcSaving ? <RefreshCw size={14} className="animate-spin" /> : <Plus size={14} />}
                  {dcSaving ? "جارٍ الإنشاء..." : "إنشاء الكود"}
                </button>
              </div>

              {/* List */}
              {discounts.length === 0 && !discountsLoading && (
                <div className="rounded-3xl border border-dashed border-white/10 py-16 text-center text-sm text-white/30">
                  لا توجد أكواد — أنشئ أول كود الآن
                </div>
              )}
              <div className="grid gap-3">
                {discounts.map((dc) => (
                  <div
                    key={dc.id}
                    className={`flex flex-wrap items-center gap-4 rounded-3xl border p-4 ${dc.is_active ? "border-white/10 bg-white/3" : "border-white/5 bg-white/1 opacity-50"}`}
                  >
                    {/* Code badge */}
                    <div className="flex items-center gap-2">
                      <div
                        className="flex items-center gap-2 rounded-2xl px-4 py-2.5"
                        style={{
                          background: dc.is_active ? "rgba(200,230,0,0.1)" : "rgba(255,255,255,0.05)",
                          border: `1px solid ${dc.is_active ? "rgba(200,230,0,0.25)" : "rgba(255,255,255,0.08)"}`,
                        }}
                      >
                        <Tag size={13} className={dc.is_active ? "text-lime-400" : "text-white/30"} />
                        <span className={`font-mono text-sm font-black tracking-widest ${dc.is_active ? "text-lime-400" : "text-white/40"}`}>
                          {dc.code}
                        </span>
                      </div>
                      <button
                        onClick={() => copyCode(dc.id, dc.code)}
                        className="grid size-8 place-items-center rounded-xl bg-white/6 text-white/40 hover:bg-white/12"
                      >
                        {copiedId === dc.id ? <CheckCircle size={13} className="text-lime-400" /> : <Copy size={13} />}
                      </button>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                        <span className="font-black text-white"><Percent size={11} className="inline mb-0.5" /> {dc.percent}%</span>
                        <span className="text-white/40">الاستخدام: {dc.used_count}/{dc.max_uses}</span>
                        {dc.order_id && <span className="font-mono text-white/35 text-[10px] truncate max-w-[120px]">📦 {dc.order_id.slice(0, 12)}...</span>}
                        {dc.expires_at && <span className="text-white/35">ينتهي: {new Date(dc.expires_at).toLocaleDateString("ar-DZ")}</span>}
                        {dc.description && <span className="text-white/50 italic">{dc.description}</span>}
                      </div>
                      <div className="mt-0.5 flex items-center gap-3">
                        <span className={`text-[10px] font-bold ${dc.is_active ? "text-lime-400" : "text-white/30"}`}>
                          {dc.is_active ? "● مفعّل" : "○ معطّل"}
                        </span>
                        {dc.used_count >= dc.max_uses && <span className="text-[10px] text-orange-400">✦ استُنفد</span>}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleDiscount(dc.id)}
                        className="rounded-xl bg-white/8 px-3 py-1.5 text-xs text-white/60 hover:bg-white/15 hover:text-white"
                      >
                        {dc.is_active ? <ToggleRight size={15} className="text-lime-400" /> : <ToggleLeft size={15} />}
                      </button>
                      <button
                        onClick={() => deleteDiscount(dc.id)}
                        className="grid size-8 place-items-center rounded-xl bg-red-500/12 text-red-400 hover:bg-red-500/22"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   PRODUCTS ADMIN
══════════════════════════════════════════════════════════════════════════ */
interface AdminProduct {
  id: string; name: string; slug: string; subtitle: string; logo: string;
  description: string; full_description: string | null;
  usage_details: string | null; requirements: string | null; benefits: string | null;
  price: number; old_price: number; discount: string; buyers: string;
  image_url: string | null; accent_color: string; logo_color: string;
  category: string; badge: string | null; rating: number; reviews_count: number;
  partners: string[]; features: string[]; specs: { label: string; value: string }[];
  faq: { question: string; answer: string }[];
  is_published: boolean; sort_order: number; created_at: string;
}

type ProdForm = {
  name: string; slug: string; subtitle: string; logo: string;
  description: string; full_description: string; usage_details: string;
  requirements: string; benefits: string; price: string; old_price: string;
  discount: string; buyers: string; accent_color: string; logo_color: string;
  category: string; badge: string; rating: string; reviews_count: string;
  partners_json: string; features_json: string; specs_json: string; faq_json: string;
  is_published: boolean; sort_order: string;
};

const EMPTY_PROD: ProdForm = {
  name: "", slug: "", subtitle: "", logo: "📦",
  description: "", full_description: "", usage_details: "",
  requirements: "", benefits: "", price: "", old_price: "",
  discount: "", buyers: "", accent_color: "#a855f7",
  logo_color: "from-purple-500 to-purple-900",
  category: "AI", badge: "", rating: "4.9", reviews_count: "0",
  partners_json: "", features_json: "", specs_json: "", faq_json: "",
  is_published: true, sort_order: "0",
};

function prodToForm(p: AdminProduct): ProdForm {
  return {
    name: p.name, slug: p.slug, subtitle: p.subtitle, logo: p.logo,
    description: p.description,
    full_description: p.full_description ?? "",
    usage_details: p.usage_details ?? "",
    requirements: p.requirements ?? "",
    benefits: p.benefits ?? "",
    price: String(p.price), old_price: String(p.old_price),
    discount: p.discount, buyers: p.buyers,
    accent_color: p.accent_color, logo_color: p.logo_color,
    category: p.category, badge: p.badge ?? "",
    rating: String(p.rating), reviews_count: String(p.reviews_count),
    partners_json: p.partners.join(", "),
    features_json: p.features.join("\n"),
    specs_json: p.specs.map((s) => `${s.label}: ${s.value}`).join("\n"),
    faq_json: p.faq.map((f) => `س: ${f.question}\nج: ${f.answer}`).join("\n---\n"),
    is_published: p.is_published, sort_order: String(p.sort_order),
  };
}

function buildPayload(f: ProdForm) {
  const features = f.features_json.split("\n").map((l) => l.trim()).filter(Boolean);
  const specs = f.specs_json.split("\n").map((l) => {
    const idx = l.indexOf(":");
    if (idx < 0) return null;
    return { label: l.slice(0, idx).trim(), value: l.slice(idx + 1).trim() };
  }).filter(Boolean);
  const faq = f.faq_json.split("---").map((block) => {
    const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
    const q = lines.find((l) => l.startsWith("س:"))?.replace(/^س:\s*/, "") ?? "";
    const a = lines.find((l) => l.startsWith("ج:"))?.replace(/^ج:\s*/, "") ?? "";
    return q ? { question: q, answer: a } : null;
  }).filter(Boolean);
  const partners = f.partners_json.split(",").map((s) => s.trim()).filter(Boolean);

  return {
    name: f.name, slug: f.slug, subtitle: f.subtitle, logo: f.logo,
    description: f.description,
    full_description: f.full_description || null,
    usage_details: f.usage_details || null,
    requirements: f.requirements || null,
    benefits: f.benefits || null,
    price: parseFloat(f.price) || 0,
    old_price: parseFloat(f.old_price) || 0,
    discount: f.discount, buyers: f.buyers,
    accent_color: f.accent_color, logo_color: f.logo_color,
    category: f.category, badge: f.badge || null,
    rating: parseFloat(f.rating) || 4.9,
    reviews_count: parseInt(f.reviews_count) || 0,
    partners_json: JSON.stringify(partners),
    features_json: JSON.stringify(features),
    specs_json: JSON.stringify(specs),
    faq_json: JSON.stringify(faq),
    is_published: f.is_published,
    sort_order: parseInt(f.sort_order) || 0,
  };
}

function ProductsAdmin() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<AdminProduct | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<ProdForm>(EMPTY_PROD);
  const [saving, setSaving] = useState(false);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function load() {
    setLoading(true);
    fetch(`${API_URL}/api/v1/products/all`)
      .then((r) => r.json())
      .then((d) => setProducts(Array.isArray(d) ? d : []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  function startEdit(p: AdminProduct) {
    setEditing(p);
    setForm(prodToForm(p));
    setCreating(false);
  }

  function startCreate() {
    setEditing(null);
    setForm(EMPTY_PROD);
    setCreating(true);
  }

  function closeModal() { setEditing(null); setCreating(false); }

  function setF(key: keyof ProdForm, val: string | boolean) {
    setForm((prev) => ({ ...prev, [key]: val }));
  }

  async function save() {
    setSaving(true);
    try {
      const payload = buildPayload(form);
      if (creating) {
        await fetch(`${API_URL}/api/v1/products`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else if (editing) {
        await fetch(`${API_URL}/api/v1/products/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      closeModal();
      load();
    } catch {
      alert("حدث خطأ أثناء الحفظ");
    } finally {
      setSaving(false);
    }
  }

  async function togglePublish(id: string) {
    await fetch(`${API_URL}/api/v1/products/${id}/toggle`, { method: "PATCH" });
    load();
  }

  async function deleteProduct(id: string) {
    if (!confirm("هل أنت متأكد من حذف هذا المنتج؟")) return;
    await fetch(`${API_URL}/api/v1/products/${id}`, { method: "DELETE" });
    load();
  }

  async function uploadImage(productId: string, file: File) {
    setUploadingId(productId);
    const fd = new FormData();
    fd.append("file", file);
    await fetch(`${API_URL}/api/v1/products/${productId}/image`, { method: "POST", body: fd });
    setUploadingId(null);
    load();
  }

  const isOpen = editing !== null || creating;

  return (
    <>
      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur">
          <div className="my-8 w-full max-w-2xl rounded-3xl border border-white/10 bg-[#0d0b14] p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-black text-white">{creating ? "منتج جديد" : "تعديل المنتج"}</h2>
              <button onClick={closeModal} className="grid size-8 place-items-center rounded-xl bg-white/8 text-white/60 hover:bg-white/15">
                <X size={16} />
              </button>
            </div>

            <div className="grid gap-4" dir="rtl">
              {/* Row 1: name + slug */}
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-bold text-white/50">الاسم *</span>
                  <input value={form.name} onChange={(e) => setF("name", e.target.value)}
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-purple-500/50" />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-bold text-white/50">Slug *</span>
                  <input value={form.slug} onChange={(e) => setF("slug", e.target.value)}
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-purple-500/50" dir="ltr" />
                </label>
              </div>

              {/* Row 2: subtitle + logo */}
              <div className="grid gap-3 sm:grid-cols-[1fr_120px]">
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-bold text-white/50">العنوان الفرعي</span>
                  <input value={form.subtitle} onChange={(e) => setF("subtitle", e.target.value)}
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-purple-500/50" />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-bold text-white/50">اللوغو (emoji)</span>
                  <input value={form.logo} onChange={(e) => setF("logo", e.target.value)}
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-purple-500/50 text-center text-xl" />
                </label>
              </div>

              {/* Row 3: price + old_price + discount + buyers */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-bold text-white/50">السعر $ *</span>
                  <input type="number" value={form.price} onChange={(e) => setF("price", e.target.value)}
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-purple-500/50" dir="ltr" />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-bold text-white/50">السعر القديم</span>
                  <input type="number" value={form.old_price} onChange={(e) => setF("old_price", e.target.value)}
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-purple-500/50" dir="ltr" />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-bold text-white/50">الخصم (نص)</span>
                  <input value={form.discount} onChange={(e) => setF("discount", e.target.value)} placeholder="-70%"
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-purple-500/50" dir="ltr" />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-bold text-white/50">المشترين</span>
                  <input value={form.buyers} onChange={(e) => setF("buyers", e.target.value)} placeholder="18K"
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-purple-500/50" dir="ltr" />
                </label>
              </div>

              {/* Row 4: accent_color + category + badge */}
              <div className="grid gap-3 sm:grid-cols-3">
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-bold text-white/50">لون التمييز (hex)</span>
                  <div className="flex items-center gap-2">
                    <input type="color" value={form.accent_color} onChange={(e) => setF("accent_color", e.target.value)}
                      className="size-9 shrink-0 cursor-pointer rounded-lg border border-white/10 bg-transparent p-0.5" />
                    <input value={form.accent_color} onChange={(e) => setF("accent_color", e.target.value)}
                      className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-xs text-white outline-none" dir="ltr" />
                  </div>
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-bold text-white/50">التصنيف</span>
                  <select value={form.category} onChange={(e) => setF("category", e.target.value)}
                    className="rounded-xl border border-white/10 bg-[#0d0b14] px-3 py-2.5 text-sm text-white outline-none focus:border-purple-500/50">
                    <option value="AI">ذكاء اصطناعي</option>
                    <option value="Entertainment">ترفيه</option>
                    <option value="Content">محتوى</option>
                    <option value="Gaming">ألعاب</option>
                  </select>
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-bold text-white/50">الشارة (badge)</span>
                  <input value={form.badge} onChange={(e) => setF("badge", e.target.value)} placeholder="LIFETIME DEAL"
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-purple-500/50" />
                </label>
              </div>

              {/* Row 5: rating + reviews + sort_order + published */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-bold text-white/50">التقييم</span>
                  <input type="number" step="0.1" max="5" value={form.rating} onChange={(e) => setF("rating", e.target.value)}
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none" dir="ltr" />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-bold text-white/50">عدد التقييمات</span>
                  <input type="number" value={form.reviews_count} onChange={(e) => setF("reviews_count", e.target.value)}
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none" dir="ltr" />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-bold text-white/50">الترتيب</span>
                  <input type="number" value={form.sort_order} onChange={(e) => setF("sort_order", e.target.value)}
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none" dir="ltr" />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-bold text-white/50">منشور</span>
                  <button
                    type="button"
                    onClick={() => setF("is_published", !form.is_published)}
                    className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-bold transition-colors ${
                      form.is_published ? "border-green-500/30 bg-green-500/10 text-green-400" : "border-white/10 bg-white/5 text-white/40"
                    }`}
                  >
                    {form.is_published ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                    {form.is_published ? "نعم" : "لا"}
                  </button>
                </label>
              </div>

              {/* Description */}
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-bold text-white/50">الوصف القصير</span>
                <textarea value={form.description} onChange={(e) => setF("description", e.target.value)} rows={2}
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-purple-500/50 resize-none" />
              </label>

              {/* Partners */}
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-bold text-white/50">الشركاء (فاصلة بين كل شريك)</span>
                <input value={form.partners_json} onChange={(e) => setF("partners_json", e.target.value)} placeholder="Anthropic, OpenRouter"
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-purple-500/50" dir="ltr" />
              </label>

              {/* Features */}
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-bold text-white/50">المميزات (سطر لكل ميزة)</span>
                <textarea value={form.features_json} onChange={(e) => setF("features_json", e.target.value)} rows={4}
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-purple-500/50 resize-none"
                  placeholder={"ميزة 1\nميزة 2\nميزة 3"} />
              </label>

              {/* Specs */}
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-bold text-white/50">المواصفات (كل سطر: الاسم: القيمة)</span>
                <textarea value={form.specs_json} onChange={(e) => setF("specs_json", e.target.value)} rows={3}
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-purple-500/50 resize-none"
                  placeholder={"Context Window: 1,000,000\nStorage: 2 TB\nAccess: Lifetime"} dir="ltr" />
              </label>

              {/* FAQ */}
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-bold text-white/50">الأسئلة الشائعة (افصل بينها بـ ---)</span>
                <textarea value={form.faq_json} onChange={(e) => setF("faq_json", e.target.value)} rows={4}
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-purple-500/50 resize-none"
                  placeholder={"س: السؤال الأول\nج: الجواب الأول\n---\nس: السؤال الثاني\nج: الجواب الثاني"} />
              </label>

              {/* Full description */}
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-bold text-white/50">الوصف الكامل (اختياري)</span>
                <textarea value={form.full_description} onChange={(e) => setF("full_description", e.target.value)} rows={3}
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-purple-500/50 resize-none" />
              </label>

              {/* Usage details + requirements */}
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-bold text-white/50">طريقة الاستخدام</span>
                  <textarea value={form.usage_details} onChange={(e) => setF("usage_details", e.target.value)} rows={2}
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-purple-500/50 resize-none" />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-bold text-white/50">المتطلبات</span>
                  <textarea value={form.requirements} onChange={(e) => setF("requirements", e.target.value)} rows={2}
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-purple-500/50 resize-none" />
                </label>
              </div>

              {/* Benefits */}
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-bold text-white/50">لماذا تختاره؟</span>
                <textarea value={form.benefits} onChange={(e) => setF("benefits", e.target.value)} rows={2}
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-purple-500/50 resize-none" />
              </label>

              <div className="flex justify-end gap-3 pt-2">
                <button onClick={closeModal} className="rounded-xl border border-white/10 px-5 py-2.5 text-sm font-bold text-white/60 hover:bg-white/5">
                  إلغاء
                </button>
                <button onClick={save} disabled={saving}
                  className="rounded-xl bg-purple-600 px-6 py-2.5 text-sm font-black text-white hover:bg-purple-500 disabled:opacity-50">
                  {saving ? "جاري الحفظ…" : "حفظ"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hidden file input for image upload */}
      <input ref={fileRef} type="file" accept="image/*" className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f && uploadingId) uploadImage(uploadingId, f);
          e.target.value = "";
        }} />

      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-black text-white">إدارة المنتجات</h2>
        <button onClick={startCreate}
          className="flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2 text-sm font-bold text-white hover:bg-purple-500">
          <Plus size={15} /> منتج جديد
        </button>
      </div>

      {loading ? (
        <div className="grid gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl bg-white/5" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="py-16 text-center text-white/30">لا توجد منتجات</div>
      ) : (
        <div className="grid gap-3">
          {products.map((p) => (
            <div key={p.id}
              className={`flex items-center gap-4 rounded-2xl border p-4 transition-all ${
                p.is_published ? "border-white/8 bg-[#0d0b14]" : "border-white/5 bg-[#0d0b14]/50 opacity-60"
              }`}
            >
              {/* Logo */}
              <div
                className="grid size-12 shrink-0 place-items-center rounded-xl text-2xl"
                style={{ background: `${p.accent_color}20`, border: `1px solid ${p.accent_color}30` }}
              >
                {p.logo}
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate font-bold text-white">{p.name}</p>
                  {!p.is_published && (
                    <span className="rounded-md bg-white/8 px-1.5 py-0.5 text-[10px] font-bold text-white/40">مخفي</span>
                  )}
                  {p.badge && (
                    <span className="rounded-md px-1.5 py-0.5 text-[10px] font-black text-black" style={{ background: p.accent_color }}>
                      {p.badge}
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-white/40">{p.category} · ${p.price} · {p.reviews_count} تقييم</p>
              </div>

              {/* Actions */}
              <div className="flex shrink-0 items-center gap-2">
                {/* View */}
                <a href={`/products/${p.id}`} target="_blank"
                  className="grid size-8 place-items-center rounded-xl bg-white/8 text-white/50 hover:bg-white/15 hover:text-white"
                  title="عرض الصفحة">
                  <Eye size={13} />
                </a>

                {/* Upload image */}
                <button
                  onClick={() => { setUploadingId(p.id); fileRef.current?.click(); }}
                  className="grid size-8 place-items-center rounded-xl bg-white/8 text-white/50 hover:bg-white/15 hover:text-white"
                  title="رفع صورة"
                >
                  {uploadingId === p.id ? <RefreshCw size={13} className="animate-spin" /> : <ImageIcon size={13} />}
                </button>

                {/* Toggle published */}
                <button onClick={() => togglePublish(p.id)}
                  className={`grid size-8 place-items-center rounded-xl transition-colors ${
                    p.is_published ? "bg-green-500/15 text-green-400 hover:bg-red-500/15 hover:text-red-400" : "bg-white/8 text-white/40 hover:bg-green-500/15 hover:text-green-400"
                  }`}
                  title={p.is_published ? "إخفاء" : "نشر"}
                >
                  {p.is_published ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                </button>

                {/* Edit */}
                <button onClick={() => startEdit(p)}
                  className="grid size-8 place-items-center rounded-xl bg-purple-500/12 text-purple-400 hover:bg-purple-500/22"
                  title="تعديل">
                  <Pencil size={13} />
                </button>

                {/* Delete */}
                <button onClick={() => deleteProduct(p.id)}
                  className="grid size-8 place-items-center rounded-xl bg-red-500/12 text-red-400 hover:bg-red-500/22"
                  title="حذف">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
