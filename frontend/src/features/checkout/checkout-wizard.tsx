"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Copy, Upload, Clock, CheckCircle, MessageCircle } from "lucide-react";
import { PaymentMethodImage } from "@/components/payments/payment-method-image";
import { PaymentMethodShowcase } from "@/components/payments/payment-method-showcase";
import { PAYMENT_METHODS } from "@/lib/payment-methods";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";
const EXPIRE_MS_LEGACY = 35 * 60 * 1000;
const LS_KEY = "gf_order_v2";
const WA_NUMBER = "213779012833";

/* ── Full countries list ────────────────────────────────────────────────── */
const COUNTRIES = [
  "الجزائر","المغرب","تونس","مصر","ليبيا","السودان","موريتانيا","الصومال","جيبوتي","جزر القمر","إريتريا",
  "السعودية","الإمارات","الكويت","قطر","البحرين","عمان","اليمن","العراق","الأردن","لبنان","سوريا","فلسطين",
  "تركيا","إيران","أفغانستان","باكستان","بنغلاديش","الهند","سريلانكا","نيبال",
  "إندونيسيا","ماليزيا","الفلبين","سنغافورة","تايلاند","فيتنام","الصين","اليابان","كوريا الجنوبية","تايوان","هونغ كونغ",
  "فرنسا","ألمانيا","المملكة المتحدة","إيطاليا","إسبانيا","هولندا","بلجيكا","سويسرا","النمسا","البرتغال","السويد","النرويج","الدانمارك","فنلندا","بولندا","رومانيا","أوكرانيا","روسيا","اليونان","التشيك","المجر","صربيا",
  "الولايات المتحدة","كندا","المكسيك","البرازيل","الأرجنتين","كولومبيا","تشيلي","بيرو","فنزويلا","الأوروغواي",
  "نيجيريا","كينيا","إثيوبيا","غانا","السنغال","كوت ديفوار","الكاميرون","تنزانيا","أوغندا","زيمبابوي","المغرب",
  "جنوب أفريقيا","مدغشقر","موزمبيق","زامبيا","مالي","بوركينا فاسو","النيجر","تشاد",
  "أستراليا","نيوزيلندا",
  "دولة أخرى",
];

/* ── Saved state ────────────────────────────────────────────────────────── */
type SavedState = {
  step: number;
  orderId: string | null;
  product: { name: string; price: number };
  customer: Customer;
  method: string | null;
  startedAt: number | null;
  expiresAt: string | null;
  done: boolean;
};

type Customer = {
  name: string;
  email: string;
  whatsapp: string;
  country: string;
  telegram: string;
  notes: string;
};

const EMPTY_CUSTOMER: Customer = { name: "", email: "", whatsapp: "", country: "", telegram: "", notes: "" };

function load(): SavedState | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as SavedState) : null;
  } catch { return null; }
}
function save(s: SavedState) { localStorage.setItem(LS_KEY, JSON.stringify(s)); }
function clear() { localStorage.removeItem(LS_KEY); }

/* ── Copy button ────────────────────────────────────────────────────────── */
function CopyBtn({ value, label }: { value: string; label?: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(value); setOk(true); setTimeout(() => setOk(false), 2000); }}
      className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${ok ? "bg-lime-500/20 text-lime-400" : "bg-white/8 text-white/50 hover:bg-white/15 hover:text-white"}`}
    >
      {ok ? <Check size={12} /> : <Copy size={12} />}
      {label ?? (ok ? "تم النسخ!" : "نسخ")}
    </button>
  );
}

/* ── Timer ──────────────────────────────────────────────────────────────── */
function Timer({
  expiresAt,
  startedAt,
  onExpire,
}: {
  expiresAt: string | null;
  startedAt: number | null;
  onExpire: () => void;
}) {
  const [left, setLeft] = useState(0);
  const totalMs = expiresAt
    ? new Date(expiresAt).getTime() - (startedAt ?? 0)
    : EXPIRE_MS_LEGACY;

  useEffect(() => {
    const deadline = expiresAt
      ? new Date(expiresAt).getTime()
      : (startedAt ?? 0) + EXPIRE_MS_LEGACY;

    const tick = () => {
      const ms = Math.max(0, deadline - Date.now());
      setLeft(ms);
      if (ms === 0) onExpire();
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiresAt, startedAt, onExpire]);

  const h   = Math.floor(left / 3600000);
  const min = Math.floor((left % 3600000) / 60000);
  const sec = Math.floor((left % 60000) / 1000);
  const pct = totalMs > 0 ? (left / totalMs) * 100 : 0;
  const urgent = left < 5 * 60000;

  const timeStr = h > 0
    ? `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`
    : `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;

  return (
    <div className={`flex items-center gap-2 rounded-2xl border px-4 py-2.5 ${urgent ? "border-red-500/30 bg-red-500/8" : "border-white/10 bg-white/5"}`}>
      <Clock size={15} className={urgent ? "text-red-400" : "text-purple-400"} />
      <span className={`text-sm font-black tabular-nums ${urgent ? "text-red-400" : "text-white"}`}>{timeStr}</span>
      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-white/10">
        <div className={`h-full rounded-full transition-all ${urgent ? "bg-red-400" : "bg-purple-500"}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   WHATSAPP PAYMENT STEP 3
═══════════════════════════════════════════════════════════════════════════ */
function WhatsAppPaymentStep({
  orderId,
  expiresAt,
  startedAt,
  productPrice,
  onExpire,
  onDone,
  onReset,
  apiUrl,
}: {
  orderId: string;
  expiresAt: string | null;
  startedAt: number | null;
  productPrice: number;
  onExpire: () => void;
  onDone: () => void;
  onReset: () => void;
  apiUrl: string;
}) {
  const shortId = "#" + orderId.slice(0, 8).toUpperCase();
  const waMsg   = encodeURIComponent(`مرحبا، رقم طلبي هو: ${shortId} — المنتج: ${productPrice}$`);
  const waLink  = `https://wa.me/${WA_NUMBER}?text=${waMsg}`;

  const [proof, setProof]   = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [err, setErr]       = useState("");

  const submitProof = async () => {
    if (!proof) return;
    setUploading(true);
    setErr("");
    try {
      const fd = new FormData();
      fd.append("file", proof);
      const res = await fetch(`${apiUrl}/api/v1/store-orders/${orderId}/proof`, { method: "POST", body: fd });
      if (!res.ok) throw new Error();
      onDone();
    } catch {
      setErr("فشل رفع الإثبات، حاول مرة أخرى");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="glass-panel rounded-3xl p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-black text-white">الدفع عبر واتساب</h2>
        <Timer expiresAt={expiresAt} startedAt={startedAt} onExpire={onExpire} />
      </div>

      {/* Order number */}
      <div className="rounded-2xl border-2 border-green-500/40 bg-green-500/8 p-5 text-center space-y-3">
        <p className="text-xs text-white/45 font-semibold">رقم طلبك</p>
        <div className="flex items-center justify-center gap-3">
          <code className="text-3xl font-black text-green-400 tracking-widest">{shortId}</code>
        </div>
        <CopyBtn value={shortId} label="نسخ رقم الطلب" />
        <p className="text-[11px] text-white/35">احتفظ بهذا الرقم — ستحتاجه في التواصل مع الوكيل</p>
      </div>

      {/* WhatsApp button */}
      <div className="rounded-2xl border border-white/8 bg-white/3 p-5 space-y-4">
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-3 rounded-2xl bg-[#25D366] hover:bg-[#20ba58] active:scale-[0.98] px-6 py-4 text-white font-black text-base transition-all shadow-[0_0_20px_#25D36640]"
        >
          <MessageCircle size={22} />
          تواصل مع الوكيل عبر واتساب
        </a>

        <div className="rounded-xl bg-white/4 px-4 py-3 text-sm text-white/65 leading-relaxed text-center">
          تواصل مع الوكيل، ثم انسخ رقم الطلب وأرسله إليه. بعد ذلك سنتواصل معك ونزودك بطريقة الدفع المتاحة في بلدك.
        </div>
      </div>

      {/* Proof upload */}
      <div className="space-y-2">
        <p className="text-sm font-black text-white/80">رفع إثبات الدفع</p>
        <p className="text-xs text-white/40">بعد إتمام الدفع مع الوكيل، ارفع صورة الإيصال هنا</p>
        <label className="block cursor-pointer">
          <div className={`flex min-h-28 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed transition-colors ${proof ? "border-lime-500/50 bg-lime-500/6" : "border-white/15 bg-white/3 hover:bg-white/6"}`}>
            {proof ? (
              <>
                <Check size={22} className="text-lime-400" />
                <p className="text-sm font-semibold text-lime-400">{proof.name}</p>
                <p className="text-xs text-white/35">اضغط لتغيير الملف</p>
              </>
            ) : (
              <>
                <Upload size={22} className="text-white/30" />
                <p className="text-sm text-white/55">اسحب الصورة أو الإيصال هنا</p>
                <p className="text-xs text-white/30">JPG · PNG · PDF</p>
              </>
            )}
            <input type="file" accept="image/*,.pdf" className="sr-only" onChange={(e) => setProof(e.target.files?.[0] ?? null)} />
          </div>
        </label>
      </div>

      {err && <p className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-400">{err}</p>}

      <button
        onClick={submitProof}
        disabled={!proof || uploading}
        className="neon-button w-full rounded-2xl py-4 font-black text-black disabled:opacity-50"
      >
        {uploading ? "جارٍ الرفع..." : "تم الدفع — رفع الإثبات ✓"}
      </button>

      <button
        onClick={onReset}
        className="w-full rounded-2xl py-2.5 text-sm text-white/30 hover:text-white/60"
      >
        ← بدء من جديد
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN WIZARD
═══════════════════════════════════════════════════════════════════════════ */
export function CheckoutWizard({
  product,
  defaultMethod,
}: {
  product?: { name: string; price: number };
  defaultMethod?: string | null;
}) {
  const defaultProduct = product ?? { name: "Claude Pro", price: 19 };

  const [step,      setStep]      = useState(1);
  const [orderId,   setOrderId]   = useState<string | null>(null);
  const [customer,  setCustomer]  = useState<Customer>(EMPTY_CUSTOMER);
  const [method,    setMethod]    = useState<string | null>(defaultMethod ?? null);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [proof,     setProof]     = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [done,      setDone]      = useState(false);
  const [err,       setErr]       = useState("");
  const [expired,   setExpired]   = useState(false);

  /* Restore from localStorage + pre-fill logged-in user */
  useEffect(() => {
    const s = load();
    if (s) {
      setStep(s.step); setOrderId(s.orderId); setCustomer(s.customer);
      setMethod(s.method); setStartedAt(s.startedAt); setDone(s.done);
      setExpiresAt(s.expiresAt ?? null);

      const deadline = s.expiresAt
        ? new Date(s.expiresAt).getTime()
        : (s.startedAt ?? 0) + EXPIRE_MS_LEGACY;
      if (s.startedAt && deadline < Date.now()) setExpired(true);
    }

    const token = localStorage.getItem("gf_token");
    if (!token) return;
    void fetch(`${API_URL}/api/v1/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then((user: { full_name?: string | null; username?: string | null; email?: string } | null) => {
        if (!user) return;
        setCustomer(prev => ({
          ...prev,
          name:  prev.name  || (user.full_name ?? user.username ?? ""),
          email: prev.email || (user.email ?? ""),
        }));
      })
      .catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const persist = useCallback((patch: Partial<SavedState>) => {
    const prev = load() ?? { step: 1, orderId: null, product: defaultProduct, customer: EMPTY_CUSTOMER, method: null, startedAt: null, expiresAt: null, done: false };
    save({ ...prev, ...patch });
  }, [defaultProduct]);

  /* ── Submit step 1+2: create order ──────────────────────────────────── */
  const submitCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    if (!customer.name || !customer.email || !customer.whatsapp || !customer.country) {
      setErr("يرجى تعبئة الحقول الإلزامية"); return;
    }
    if (!method) { setErr("يرجى اختيار طريقة الدفع"); return; }

    try {
      const res = await fetch(`${API_URL}/api/v1/store-orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: customer.name, customer_email: customer.email,
          customer_whatsapp: customer.whatsapp, customer_country: customer.country,
          customer_telegram: customer.telegram, customer_notes: customer.notes,
          product_name: defaultProduct.name, product_price: defaultProduct.price,
          payment_method: method,
        }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json() as { id: string; expires_at: string | null };
      const ts = Date.now();
      setOrderId(data.id);
      setStartedAt(ts);
      setExpiresAt(data.expires_at ?? null);
      setStep(3);
      persist({ step: 3, orderId: data.id, customer, method, startedAt: ts, expiresAt: data.expires_at ?? null });
    } catch {
      setErr("فشل إنشاء الطلب، حاول مرة أخرى");
    }
  };

  /* ── Submit standard proof upload ───────────────────────────────────── */
  const submitProof = async () => {
    if (!proof || !orderId) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", proof);
      const res = await fetch(`${API_URL}/api/v1/store-orders/${orderId}/proof`, { method: "POST", body: fd });
      if (!res.ok) throw new Error();
      setDone(true);
      persist({ done: true });
    } catch {
      setErr("فشل رفع الإثبات، حاول مرة أخرى");
    } finally {
      setUploading(false);
    }
  };

  const handleReset = () => {
    clear(); setStep(1); setOrderId(null); setStartedAt(null); setExpiresAt(null); setMethod(null);
  };

  const selectedMethod = PAYMENT_METHODS.find((m) => m.id === method);
  const isWhatsApp     = method === "whatsapp";

  /* ── DONE screen ───────────────────────────────────────────────────── */
  if (done) {
    return (
      <div className="flex flex-col items-center py-16 text-center">
        <div className="mb-5 grid size-20 place-items-center rounded-3xl bg-lime-400/15">
          <CheckCircle size={44} className="text-lime-400" />
        </div>
        <h2 className="text-2xl font-black text-white">تم استلام طلبك!</h2>
        <p className="mt-3 max-w-sm text-white/55">
          {isWhatsApp
            ? "سيتحقق الوكيل من إثبات الدفع ويتواصل معك قريباً."
            : "سيتم مراجعة إثبات الدفع وتفعيل طلبك خلال دقائق."}
        </p>
        {orderId && (
          <p className="mt-4 rounded-xl bg-white/5 px-4 py-2 font-mono text-sm text-purple-400">
            #{orderId.slice(0, 8).toUpperCase()}
          </p>
        )}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a href="/dashboard" className="neon-button rounded-2xl px-7 py-3.5 font-black text-black">
            متابعة الطلب في حسابي ←
          </a>
          <button
            onClick={() => { clear(); window.location.href = "/"; }}
            className="rounded-2xl border border-white/15 bg-white/5 px-7 py-3.5 font-black text-white hover:bg-white/10 transition-colors"
          >
            العودة للرئيسية
          </button>
        </div>
        <div className="mt-8 w-full max-w-5xl px-2">
          <PaymentMethodShowcase />
        </div>
      </div>
    );
  }

  /* ── EXPIRED screen ───────────────────────────────────────────────── */
  if (expired) {
    return (
      <div className="flex flex-col items-center py-16 text-center">
        <div className="mb-5 grid size-20 place-items-center rounded-3xl bg-red-500/15 text-5xl">⏰</div>
        <h2 className="text-2xl font-black text-white">انتهت مدة الدفع</h2>
        <p className="mt-3 text-white/55">
          {isWhatsApp ? "انتهت مدة 6 ساعات المخصصة لإتمام الدفع" : "انتهت مدة 35 دقيقة المخصصة لإتمام الدفع"}
        </p>
        <button
          onClick={() => { clear(); setExpired(false); setStep(1); setOrderId(null); setStartedAt(null); setExpiresAt(null); }}
          className="neon-button mt-8 rounded-2xl px-10 py-3.5 font-black text-black"
        >
          إنشاء طلب جديد
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      {/* Progress steps */}
      <div className="mb-8 flex items-center justify-center gap-3">
        {[
          { n: 1, label: "بيانات العميل" },
          { n: 2, label: "طريقة الدفع" },
          { n: 3, label: "إتمام الدفع" },
        ].map(({ n, label }, i) => (
          <div key={n} className="flex items-center gap-3">
            <div className={`flex items-center gap-2 rounded-2xl px-3 py-1.5 text-xs font-bold transition-all ${step >= n ? "bg-purple-600 text-white" : "bg-white/8 text-white/40"}`}>
              <span className="grid size-5 place-items-center rounded-full bg-white/15 text-xs">{n}</span>
              {label}
            </div>
            {i < 2 && <div className={`h-px w-8 ${step > n ? "bg-purple-500" : "bg-white/10"}`} />}
          </div>
        ))}
      </div>

      {/* Product summary */}
      <div className="mb-5 flex items-center justify-between rounded-2xl border border-white/8 bg-white/4 px-5 py-3">
        <div>
          <p className="text-xs text-white/45">المنتج المختار</p>
          <p className="font-black text-white">{defaultProduct.name}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-black text-white">{defaultProduct.price}$</p>
          <p className="text-xs text-white/35">/سنوياً</p>
        </div>
      </div>

      {/* ── Steps 1 + 2: Customer info + Method ──────────────────────── */}
      {step <= 2 && (
        <form onSubmit={submitCustomer} className="glass-panel rounded-3xl p-6">
          <h2 className="mb-5 text-lg font-black text-white">بيانات العميل</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Name */}
            <label className="grid gap-1.5 text-xs font-semibold text-white/60">
              الاسم الكامل *
              <input type="text" value={customer.name} onChange={e => setCustomer(p => ({ ...p, name: e.target.value }))}
                placeholder="أحمد محمد" className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/25 focus:border-purple-500/50" />
            </label>
            {/* Email */}
            <label className="grid gap-1.5 text-xs font-semibold text-white/60">
              البريد الإلكتروني *
              <input type="email" value={customer.email} onChange={e => setCustomer(p => ({ ...p, email: e.target.value }))}
                placeholder="you@email.com" className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/25 focus:border-purple-500/50" />
            </label>
            {/* WhatsApp */}
            <label className="grid gap-1.5 text-xs font-semibold text-white/60">
              رقم WhatsApp *
              <input type="tel" value={customer.whatsapp} onChange={e => setCustomer(p => ({ ...p, whatsapp: e.target.value }))}
                placeholder="+213 5XX XXX XXX" className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/25 focus:border-purple-500/50" />
            </label>
            {/* Country — always a dropdown */}
            <label className="grid gap-1.5 text-xs font-semibold text-white/60">
              الدولة *
              <select
                value={customer.country}
                onChange={e => setCustomer(p => ({ ...p, country: e.target.value }))}
                className="rounded-xl border border-white/10 bg-[#0d0b14] px-3 py-2.5 text-sm text-white outline-none focus:border-purple-500/50 appearance-none cursor-pointer"
              >
                <option value="" disabled>اختر دولتك...</option>
                {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>
            {/* Telegram */}
            <label className="grid gap-1.5 text-xs font-semibold text-white/60">
              Telegram (اختياري)
              <input type="text" value={customer.telegram} onChange={e => setCustomer(p => ({ ...p, telegram: e.target.value }))}
                placeholder="@username" className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/25 focus:border-purple-500/50" />
            </label>
            {/* Notes */}
            <label className="grid gap-1.5 text-xs font-semibold text-white/60 sm:col-span-2">
              ملاحظات إضافية
              <textarea rows={2} value={customer.notes} onChange={e => setCustomer(p => ({ ...p, notes: e.target.value }))}
                placeholder="أي تفاصيل إضافية..."
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/25 focus:border-purple-500/50 resize-none" />
            </label>
          </div>

          {/* Payment methods */}
          <h2 className="mb-4 mt-7 text-lg font-black text-white">طريقة الدفع</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {/* WhatsApp payment card — special */}
            <button
              type="button"
              onClick={() => { setMethod("whatsapp"); setStep(2); }}
              className="flex min-h-24 items-center gap-3 rounded-2xl border p-3 text-right transition-all hover:scale-[1.02] sm:col-span-2 lg:col-span-1"
              style={{
                borderColor: method === "whatsapp" ? "#25D366" : "rgba(37,211,102,0.30)",
                background: method === "whatsapp" ? "rgba(37,211,102,0.18)" : "rgba(37,211,102,0.06)",
                boxShadow: method === "whatsapp" ? "0 0 20px #25D36635" : "none",
              }}
            >
              <span className="grid h-14 w-24 shrink-0 place-items-center rounded-xl bg-black/18 text-3xl">
                💬
              </span>
              <div className="flex-1">
                <p className="text-sm font-black" style={{ color: method === "whatsapp" ? "#25D366" : "#fff" }}>
                  الدفع عبر واتساب
                </p>
                <p className="text-[11px] text-white/40 mt-0.5">تواصل مع الوكيل + ادفع بأي وسيلة</p>
              </div>
              {method === "whatsapp" && <Check size={14} className="mr-auto shrink-0 text-lime-400" />}
            </button>

            {/* Standard payment methods */}
            {PAYMENT_METHODS.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => { setMethod(m.id); setStep(2); }}
                className="flex min-h-24 items-center gap-3 rounded-2xl border p-3 text-right transition-all hover:scale-[1.02]"
                style={{
                  borderColor: method === m.id ? m.color : "rgba(255,255,255,0.10)",
                  background: method === m.id ? m.bg : "rgba(255,255,255,0.03)",
                  boxShadow: method === m.id ? `0 0 18px ${m.color}30` : "none",
                }}
              >
                <span className="grid h-14 w-24 shrink-0 place-items-center rounded-xl bg-black/18">
                  <PaymentMethodImage method={m} />
                </span>
                <div>
                  <p className="text-sm font-black" style={{ color: method === m.id ? m.color : "#fff" }}>{m.label}</p>
                </div>
                {method === m.id && <Check size={14} className="mr-auto shrink-0 text-lime-400" />}
              </button>
            ))}
          </div>

          {err && <p className="mt-4 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-400">{err}</p>}

          <button type="submit" className="neon-button mt-6 w-full rounded-2xl py-4 font-black text-black">
            التالي: إتمام الدفع →
          </button>
        </form>
      )}

      {/* ── Step 3 WhatsApp ─────────────────────────────────────────────── */}
      {step === 3 && isWhatsApp && orderId && (
        <WhatsAppPaymentStep
          orderId={orderId}
          expiresAt={expiresAt}
          startedAt={startedAt}
          productPrice={defaultProduct.price}
          onExpire={() => setExpired(true)}
          onDone={() => { setDone(true); persist({ done: true }); }}
          onReset={handleReset}
          apiUrl={API_URL}
        />
      )}

      {/* ── Step 3 Standard payment ─────────────────────────────────────── */}
      {step === 3 && !isWhatsApp && selectedMethod && startedAt && (
        <div className="glass-panel rounded-3xl p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-black text-white">إتمام الدفع</h2>
            <Timer expiresAt={expiresAt} startedAt={startedAt} onExpire={() => setExpired(true)} />
          </div>

          <div className="mb-5 rounded-2xl border px-4 py-3" style={{ borderColor: selectedMethod.border, background: selectedMethod.bg }}>
            <p className="mb-1 text-xs text-white/45">طريقة الدفع</p>
            <p className="font-black" style={{ color: selectedMethod.color }}>{selectedMethod.label}</p>
          </div>

          {/* Payment fields */}
          <div className="mb-5 grid gap-3">
            {selectedMethod.fields.map((f) => (
              <div key={f.label} className="rounded-2xl border border-white/8 bg-white/4 px-4 py-3">
                <p className="mb-1 text-xs text-white/45">{f.label}</p>
                <div className="flex items-center justify-between gap-2">
                  <code className="break-all text-sm font-bold text-white">{f.value}</code>
                  <CopyBtn value={f.value} />
                </div>
              </div>
            ))}
            <div className="rounded-2xl border border-purple-500/20 bg-purple-500/8 px-4 py-3">
              <p className="mb-1 text-xs text-white/45">المبلغ المطلوب</p>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xl font-black text-white">{defaultProduct.price}$</span>
                <CopyBtn value={String(defaultProduct.price)} />
              </div>
            </div>
          </div>

          {/* Steps */}
          <div className="mb-5">
            <p className="mb-2 text-xs font-bold text-white/50">خطوات الدفع</p>
            <ol className="grid gap-2">
              {selectedMethod.steps.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-white/70">
                  <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-purple-600/30 text-xs font-bold text-purple-400">{i + 1}</span>
                  {s}
                </li>
              ))}
            </ol>
          </div>

          {/* Proof upload */}
          <label className="block cursor-pointer">
            <p className="mb-2 text-sm font-bold text-white/75">رفع إثبات الدفع *</p>
            <div className={`flex min-h-28 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed transition-colors ${proof ? "border-lime-500/50 bg-lime-500/6" : "border-white/15 bg-white/3 hover:bg-white/6"}`}>
              {proof ? (
                <><Check size={22} className="text-lime-400" /><p className="text-sm font-semibold text-lime-400">{proof.name}</p><p className="text-xs text-white/35">اضغط لتغيير الملف</p></>
              ) : (
                <><Upload size={22} className="text-white/30" /><p className="text-sm text-white/55">اسحب الصورة هنا أو اضغط للرفع</p><p className="text-xs text-white/30">JPG · PNG · PDF</p></>
              )}
              <input type="file" accept="image/*,.pdf" className="sr-only" onChange={(e) => setProof(e.target.files?.[0] ?? null)} />
            </div>
          </label>

          {err && <p className="mt-4 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-400">{err}</p>}

          <button onClick={submitProof} disabled={!proof || uploading} className="neon-button mt-5 w-full rounded-2xl py-4 font-black text-black disabled:opacity-50">
            {uploading ? "جارٍ الرفع..." : "تم الدفع ✓"}
          </button>

          <PaymentMethodShowcase />

          <button onClick={handleReset} className="mt-3 w-full rounded-2xl py-2.5 text-sm text-white/35 hover:text-white/60">
            ← بدء من جديد
          </button>
        </div>
      )}
    </div>
  );
}
