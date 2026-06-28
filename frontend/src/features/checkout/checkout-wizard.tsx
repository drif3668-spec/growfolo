"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Copy, Upload, ArrowRight, Clock, CheckCircle } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const EXPIRE_MS = 35 * 60 * 1000;
const LS_KEY = "gf_order_v2";

/* ── Payment method data ────────────────────────────────────────────────── */
const METHODS = [
  {
    id: "usdt",
    label: "USDT TRC20",
    icon: "₮",
    color: "#26a17b",
    bg: "rgba(38,161,123,0.12)",
    border: "rgba(38,161,123,0.35)",
    fields: [{ label: "الشبكة", value: "TRC20 (TRON)" }, { label: "عنوان المحفظة", value: "TXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX" }],
    steps: ["افتح محفظتك (Trust Wallet / Binance)", "أرسل USDT على شبكة TRC20 فقط", "انسخ hash المعاملة وأرسل الوصل"],
  },
  {
    id: "bnb",
    label: "BNB BEP20",
    icon: "◈",
    color: "#f3ba2f",
    bg: "rgba(243,186,47,0.10)",
    border: "rgba(243,186,47,0.30)",
    fields: [{ label: "الشبكة", value: "BEP20 (BSC)" }, { label: "عنوان المحفظة", value: "0xXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX" }],
    steps: ["افتح محفظتك (Trust Wallet / MetaMask)", "أرسل BNB على شبكة BSC فقط", "أرسل hash المعاملة"],
  },
  {
    id: "baridimob",
    label: "BaridiMob",
    icon: "🏦",
    color: "#f5c518",
    bg: "rgba(245,197,24,0.10)",
    border: "rgba(245,197,24,0.28)",
    fields: [{ label: "رقم CCP", value: "00123456789 — مفتاح: 12" }, { label: "الاسم", value: "Growfolo Store" }],
    steps: ["افتح تطبيق BaridiMob", "اختر تحويل CCP وأدخل الرقم والمفتاح", "أرسل صورة التأكيد"],
  },
  {
    id: "mobilis",
    label: "Flexy Mobilis",
    icon: "📲",
    color: "#22c55e",
    bg: "rgba(34,197,94,0.10)",
    border: "rgba(34,197,94,0.28)",
    fields: [{ label: "رقم Mobilis", value: "07XXXXXXXX" }],
    steps: ["اشتر رصيد Flexy من نقطة البيع", "أرسل الرصيد على الرقم أعلاه", "أرسل إثبات الإرسال"],
  },
  {
    id: "vodafone",
    label: "Vodafone Cash",
    icon: "📱",
    color: "#ef4444",
    bg: "rgba(239,68,68,0.10)",
    border: "rgba(239,68,68,0.28)",
    fields: [{ label: "رقم Vodafone Cash", value: "01XXXXXXXXX" }],
    steps: ["افتح تطبيق Vodafone Cash", "اختر تحويل أموال وأدخل الرقم والمبلغ", "أرسل لقطة الشاشة"],
  },
  {
    id: "instapay",
    label: "InstaPay",
    icon: "⚡",
    color: "#a855f7",
    bg: "rgba(168,85,247,0.10)",
    border: "rgba(168,85,247,0.28)",
    fields: [{ label: "معرف InstaPay", value: "growfolo@instapay" }],
    steps: ["افتح تطبيق InstaPay", "ابحث عن المعرف أعلاه وأدخل المبلغ", "أرسل صورة الإيصال"],
  },
];

/* ── Saved state shape ──────────────────────────────────────────────────── */
type SavedState = {
  step: number;
  orderId: string | null;
  product: { name: string; price: number };
  customer: Customer;
  method: string | null;
  startedAt: number | null;
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
function save(s: SavedState) {
  localStorage.setItem(LS_KEY, JSON.stringify(s));
}
function clear() { localStorage.removeItem(LS_KEY); }

/* ── Copy button ────────────────────────────────────────────────────────── */
function CopyBtn({ value }: { value: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(value); setOk(true); setTimeout(() => setOk(false), 2000); }}
      className={`grid size-7 shrink-0 place-items-center rounded-lg transition-colors ${ok ? "bg-lime-500/20 text-lime-400" : "bg-white/8 text-white/40 hover:bg-white/15 hover:text-white"}`}
    >
      {ok ? <Check size={12} /> : <Copy size={12} />}
    </button>
  );
}

/* ── Timer ──────────────────────────────────────────────────────────────── */
function Timer({ startedAt, onExpire }: { startedAt: number; onExpire: () => void }) {
  const [left, setLeft] = useState(0);
  useEffect(() => {
    const tick = () => {
      const ms = Math.max(0, startedAt + EXPIRE_MS - Date.now());
      setLeft(ms);
      if (ms === 0) onExpire();
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [startedAt, onExpire]);

  const min = Math.floor(left / 60000);
  const sec = Math.floor((left % 60000) / 1000);
  const pct = (left / EXPIRE_MS) * 100;
  const urgent = left < 5 * 60000;

  return (
    <div className={`flex items-center gap-2 rounded-2xl border px-4 py-2.5 ${urgent ? "border-red-500/30 bg-red-500/8" : "border-white/10 bg-white/5"}`}>
      <Clock size={15} className={urgent ? "text-red-400" : "text-purple-400"} />
      <span className={`text-sm font-black tabular-nums ${urgent ? "text-red-400" : "text-white"}`}>
        {String(min).padStart(2, "0")}:{String(sec).padStart(2, "0")}
      </span>
      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-white/10">
        <div
          className={`h-full rounded-full transition-all ${urgent ? "bg-red-400" : "bg-purple-500"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   MAIN WIZARD
══════════════════════════════════════════════════════════════════════════ */
export function CheckoutWizard({ product }: { product?: { name: string; price: number } }) {
  const defaultProduct = product ?? { name: "Claude Pro", price: 19 };

  const [step, setStep] = useState(1);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [customer, setCustomer] = useState<Customer>(EMPTY_CUSTOMER);
  const [method, setMethod] = useState<string | null>(null);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [proof, setProof] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState("");
  const [expired, setExpired] = useState(false);

  /* Restore from localStorage */
  useEffect(() => {
    const s = load();
    if (!s) return;
    setStep(s.step);
    setOrderId(s.orderId);
    setCustomer(s.customer);
    setMethod(s.method);
    setStartedAt(s.startedAt);
    setDone(s.done);
    if (s.startedAt && s.startedAt + EXPIRE_MS < Date.now()) setExpired(true);
  }, []);

  const persist = useCallback((patch: Partial<SavedState>) => {
    const prev = load() ?? { step: 1, orderId: null, product: defaultProduct, customer: EMPTY_CUSTOMER, method: null, startedAt: null, done: false };
    save({ ...prev, ...patch });
  }, [defaultProduct]);

  /* ── Step 1 submit: create order ─────────────────────────────────────── */
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
        body: JSON.stringify({ ...customer, product_name: defaultProduct.name, product_price: defaultProduct.price, payment_method: method }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json() as { id: string };
      const ts = Date.now();
      setOrderId(data.id);
      setStartedAt(ts);
      setStep(3);
      persist({ step: 3, orderId: data.id, customer, method, startedAt: ts });
    } catch {
      setErr("فشل إنشاء الطلب، حاول مرة أخرى");
    }
  };

  /* ── Step 3 submit: upload proof ─────────────────────────────────────── */
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

  const selectedMethod = METHODS.find((m) => m.id === method);

  /* ── DONE screen ──────────────────────────────────────────────────────── */
  if (done) {
    return (
      <div className="flex flex-col items-center py-16 text-center">
        <div className="mb-5 grid size-20 place-items-center rounded-3xl bg-lime-400/15">
          <CheckCircle size={44} className="text-lime-400" />
        </div>
        <h2 className="text-2xl font-black text-white">تم استلام طلبك!</h2>
        <p className="mt-3 max-w-sm text-white/55">
          سيتم مراجعة إثبات الدفع وتفعيل طلبك خلال دقائق. تحقق من بريدك الإلكتروني.
        </p>
        {orderId && <p className="mt-4 rounded-xl bg-white/5 px-4 py-2 font-mono text-sm text-purple-400">#{orderId.slice(0, 8).toUpperCase()}</p>}
        <button
          onClick={() => { clear(); window.location.href = "/"; }}
          className="neon-button mt-8 rounded-2xl px-10 py-3.5 font-black text-black"
        >
          العودة للرئيسية
        </button>
      </div>
    );
  }

  /* ── EXPIRED screen ───────────────────────────────────────────────────── */
  if (expired) {
    return (
      <div className="flex flex-col items-center py-16 text-center">
        <div className="mb-5 grid size-20 place-items-center rounded-3xl bg-red-500/15 text-5xl">⏰</div>
        <h2 className="text-2xl font-black text-white">انتهت مدة الدفع</h2>
        <p className="mt-3 text-white/55">انتهت مدة 35 دقيقة المخصصة لإتمام الدفع</p>
        <button onClick={() => { clear(); setExpired(false); setStep(1); setOrderId(null); setStartedAt(null); }} className="neon-button mt-8 rounded-2xl px-10 py-3.5 font-black text-black">
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
            <div className={`flex items-center gap-2 rounded-2xl px-3 py-1.5 text-xs font-bold transition-all ${
              step >= n ? "bg-purple-600 text-white" : "bg-white/8 text-white/40"
            }`}>
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

      {/* ── Step 1 + 2: Customer + Method ─────────────────────────────── */}
      {step <= 2 && (
        <form onSubmit={submitCustomer} className="glass-panel rounded-3xl p-6">
          <h2 className="mb-5 text-lg font-black text-white">بيانات العميل</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {(
              [
                { key: "name" as const, label: "الاسم الكامل *", placeholder: "أحمد محمد", type: "text" as const },
                { key: "email" as const, label: "البريد الإلكتروني *", placeholder: "you@email.com", type: "email" as const },
                { key: "whatsapp" as const, label: "رقم WhatsApp *", placeholder: "+213 5XX XXX XXX", type: "tel" as const },
                { key: "country" as const, label: "الدولة *", placeholder: "الجزائر / مصر / السعودية...", type: "text" as const },
                { key: "telegram" as const, label: "Telegram (اختياري)", placeholder: "@username", type: "text" as const },
              ] as const
            ).map(({ key, label, placeholder, type }) => (
              <label key={key} className="grid gap-1.5 text-xs font-semibold text-white/60">
                {label}
                <input
                  type={type ?? "text"}
                  value={customer[key]}
                  onChange={(e) => setCustomer((p) => ({ ...p, [key]: e.target.value }))}
                  placeholder={placeholder}
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/25 focus:border-purple-500/50"
                />
              </label>
            ))}
            <label className="grid gap-1.5 text-xs font-semibold text-white/60 sm:col-span-2">
              ملاحظات إضافية
              <textarea
                rows={2}
                value={customer.notes}
                onChange={(e) => setCustomer((p) => ({ ...p, notes: e.target.value }))}
                placeholder="أي تفاصيل إضافية..."
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/25 focus:border-purple-500/50 resize-none"
              />
            </label>
          </div>

          <h2 className="mb-4 mt-7 text-lg font-black text-white">طريقة الدفع</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {METHODS.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => { setMethod(m.id); setStep(2); }}
                className="flex items-center gap-3 rounded-2xl border p-4 text-right transition-all hover:scale-[1.02]"
                style={{
                  borderColor: method === m.id ? m.color : "rgba(255,255,255,0.10)",
                  background: method === m.id ? m.bg : "rgba(255,255,255,0.03)",
                  boxShadow: method === m.id ? `0 0 18px ${m.color}30` : "none",
                }}
              >
                <span className="text-2xl">{m.icon}</span>
                <div>
                  <p className="text-sm font-black" style={{ color: method === m.id ? m.color : "#fff" }}>{m.label}</p>
                </div>
                {method === m.id && <Check size={14} className="mr-auto shrink-0 text-lime-400" />}
              </button>
            ))}
          </div>

          {err && <p className="mt-4 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-400">{err}</p>}

          <button
            type="submit"
            className="neon-button mt-6 w-full rounded-2xl py-4 font-black text-black"
          >
            التالي: إتمام الدفع →
          </button>
        </form>
      )}

      {/* ── Step 3: Payment + Timer ────────────────────────────────────── */}
      {step === 3 && selectedMethod && startedAt && (
        <div className="glass-panel rounded-3xl p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-black text-white">إتمام الدفع</h2>
            <Timer startedAt={startedAt} onExpire={() => setExpired(true)} />
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
            {uploading ? "جارٍ الرفع..." : "تأكيد الدفع →"}
          </button>

          <button onClick={() => { clear(); setStep(1); setOrderId(null); setStartedAt(null); setMethod(null); }} className="mt-3 w-full rounded-2xl py-2.5 text-sm text-white/35 hover:text-white/60">
            ← بدء من جديد
          </button>
        </div>
      )}
    </div>
  );
}
