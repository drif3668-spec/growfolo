"use client";

import { useEffect, useRef, useState } from "react";
import { Copy, Check, Upload, CheckCircle } from "lucide-react";
import { PaymentMethodImage } from "@/components/payments/payment-method-image";
import { PaymentMethodShowcase } from "@/components/payments/payment-method-showcase";
import { PAYMENT_METHOD_MAP } from "@/lib/payment-methods";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const TIMER_MINUTES = 45;
const FLEXY_PHONE = "0654103330";
const FLEXY_MAX_PAYMENT_USD = 15;
const FLEXY_MAX_RECEIPTS = 4;
const FLEXY_EXCHANGE_RATE_DZD = 250;

const PAYMENT_INFO: Record<string, Array<{ label: string; value: string }>> = {
  usdt: [
    { label: "الشبكة", value: "TRC20 (TRON)" },
    { label: "عنوان المحفظة", value: "TPQJS1aNK6QiXvfC9yKtS41f47awYAuv7T" },
  ],
  bnb: [
    { label: "الشبكة", value: "BEP20 (BSC)" },
    { label: "عنوان المحفظة", value: "0xe69071c0e58142e89fa239910436a35e18fe3c5d" },
  ],
  redotpay: [
    { label: "Payment ID", value: "1293340175" },
  ],
  baridimob: [
    { label: "رقم CCP", value: "0023456789 — مفتاح: 14" },
    { label: "الاسم", value: "Growfolo Store" },
  ],
  mobilis: [
    { label: "رقم Mobilis", value: FLEXY_PHONE },
  ],
  vodafone: [
    { label: "رقم Vodafone Cash", value: "0100 123 4567" },
  ],
  instapay: [
    { label: "معرف InstaPay", value: "growfolo@instapay" },
  ],
};

const PAYMENT_LABELS: Record<string, string> = {
  usdt: "USDT TRC20",
  bnb: "BNB BEP20",
  redotpay: "RedotPay",
  baridimob: "BaridiMob",
  mobilis: "Flexy Mobilis",
  vodafone: "Vodafone Cash",
  instapay: "InstaPay",
};

const STEPS = ["معلومات العميل", "الدفع", "تأكيد"];

interface CheckoutData {
  items: Array<{ id: string; name: string; price: number; qty: number; logo: string; color: string }>;
  total: number;
  currency: string;
  paymentMethod: string;
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }

  return (
    <button
      onClick={handleCopy}
      className="ml-2 shrink-0 grid size-8 place-items-center rounded-lg bg-white/10 text-white/60 hover:bg-purple-500/30 hover:text-purple-300 transition-all"
      aria-label="نسخ"
    >
      {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
    </button>
  );
}

export default function PayPage() {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null);
  const [payMethod, setPayMethod] = useState("usdt");
  const [timeLeft, setTimeLeft] = useState(TIMER_MINUTES * 60);
  const [expired, setExpired] = useState(false);
  const [orderId] = useState(() => `ord_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`);
  const [instaPayCode] = useState<string>(() => {
    const key = "gf_instapay_order_code";
    try {
      const saved = localStorage.getItem(key);
      if (saved) return saved;
      const code = "IP-" + Array.from({ length: 6 }, () => "0123456789ABCDEFGHJKMNPQRSTVWXYZ"[Math.floor(Math.random() * 32)]).join("");
      localStorage.setItem(key, code);
      return code;
    } catch {
      return "IP-" + Array.from({ length: 6 }, () => "0123456789ABCDEFGHJKMNPQRSTVWXYZ"[Math.floor(Math.random() * 32)]).join("");
    }
  });

  // Form fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [country, setCountry] = useState("");
  const [notes, setNotes] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [flexyProofFiles, setFlexyProofFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [success, setSuccess] = useState(false);

  // Load checkout data on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem("gf_checkout_data");
      if (raw) {
        const data: CheckoutData = JSON.parse(raw);
        setCheckoutData(data);
        if (data.paymentMethod && PAYMENT_METHOD_MAP[data.paymentMethod]) setPayMethod(data.paymentMethod);
      }
      const savedEmail = localStorage.getItem("gf_my_email");
      if (savedEmail) setEmail(savedEmail);
    } catch {}
  }, []);

  // Timer
  useEffect(() => {
    const storageKey = `gf_pay_start_${orderId}`;
    let startTime: number;
    try {
      const saved = localStorage.getItem(storageKey);
      startTime = saved ? parseInt(saved) : Date.now();
      if (!saved) localStorage.setItem(storageKey, String(startTime));
    } catch {
      startTime = Date.now();
    }

    const interval = setInterval(() => {
      const remaining = TIMER_MINUTES * 60 * 1000 - (Date.now() - startTime);
      if (remaining <= 0) {
        setExpired(true);
        setTimeLeft(0);
        clearInterval(interval);
      } else {
        setTimeLeft(Math.ceil(remaining / 1000));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [orderId]);

  // 3D tilt
  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const maxAngle = 8;
    setTilt({
      x: (-dy / (rect.height / 2)) * maxAngle,
      y: (dx / (rect.width / 2)) * maxAngle,
    });
  }

  function handleMouseLeave() {
    setTilt({ x: 0, y: 0 });
  }

  function formatTime(secs: number) {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const isMobilis = payMethod === "mobilis";
    const proofsToUpload = isMobilis ? flexyProofFiles : (proofFile ? [proofFile] : []);
    if (proofsToUpload.length === 0) { setSubmitError("يرجى رفع إثبات الدفع"); return; }
    if (isMobilis && proofsToUpload.length > FLEXY_MAX_RECEIPTS) {
      setSubmitError("يمكنك رفع 4 إيصالات Flexy Mobilis كحد أقصى");
      return;
    }
    setSubmitting(true);
    setSubmitError("");

    try {
      // 1. Create order
      const productName = checkoutData?.items?.map(i => i.name).join(", ") ?? "منتج";
      const productPrice = checkoutData?.total ?? 0;

      const orderRes = await fetch(`${API_URL}/api/v1/store-orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: fullName,
          customer_email: email,
          customer_whatsapp: whatsapp,
          customer_country: country,
          customer_notes: payMethod === "instapay"
            ? `[رمز الطلب: ${instaPayCode}]${notes ? " | " + notes : ""}`
            : (notes || null),
          product_name: productName,
          product_price: productPrice,
          payment_method: payMethod,
        }),
      });

      if (!orderRes.ok) {
        const err = await orderRes.json().catch(() => ({}));
        throw new Error(err.detail ?? "فشل إنشاء الطلب");
      }

      const order = await orderRes.json();

      // 2. Upload proof
      const form = new FormData();
      proofsToUpload.forEach((proof) => form.append(isMobilis ? "files" : "file", proof));
      const proofRes = await fetch(`${API_URL}/api/v1/store-orders/${order.id}/proof`, {
        method: "POST",
        body: form,
      });

      if (!proofRes.ok) throw new Error("فشل رفع الإثبات");

      // 3. Save email
      try { localStorage.setItem("gf_my_email", email); } catch {}

      setSuccess(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "حدث خطأ، حاول مجدداً");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
        <div className="relative z-10 text-center max-w-md">
          <div className="mx-auto mb-6 grid size-24 place-items-center rounded-full bg-green-500/20 border border-green-500/40">
            <CheckCircle size={48} className="text-green-400" />
          </div>
          <h1 className="text-3xl font-black text-white mb-3">تم إرسال الطلب!</h1>
          <p className="text-white/60 mb-2">سيتم مراجعة إثبات دفعك وتفعيل طلبك خلال دقائق.</p>
          <p className="text-white/40 text-sm mb-8">تحقق من بريدك الإلكتروني للتأكيد</p>
          <a href="/" className="neon-button inline-block rounded-2xl px-8 py-4 font-black text-black">
            العودة للمتجر
          </a>
          <PaymentMethodShowcase />
        </div>
      </div>
    );
  }

  const selectedMethod = PAYMENT_METHOD_MAP[payMethod] ?? PAYMENT_METHOD_MAP.usdt;
  const isMobilis = payMethod === "mobilis";
  const flexyTotal = checkoutData?.total ?? 0;
  const flexySuggestedParts = Math.max(1, Math.ceil(flexyTotal / FLEXY_MAX_PAYMENT_USD));
  const flexyDzdTotal = flexyTotal * FLEXY_EXCHANGE_RATE_DZD;

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-black text-white" dir="rtl">
      {/* Animated orbs */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-30px) scale(1.05); }
        }
        @keyframes float2 {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(20px) scale(0.95); }
        }
        .orb { position: fixed; border-radius: 50%; filter: blur(80px); pointer-events: none; z-index: 0; }
        .orb-1 { width: 500px; height: 500px; background: radial-gradient(circle, rgba(168,85,247,0.25) 0%, transparent 70%); top: -100px; right: -100px; animation: float 8s ease-in-out infinite; }
        .orb-2 { width: 400px; height: 400px; background: radial-gradient(circle, rgba(6,182,212,0.2) 0%, transparent 70%); bottom: -80px; left: -80px; animation: float2 10s ease-in-out infinite; }
        .orb-3 { width: 300px; height: 300px; background: radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%); top: 40%; left: 50%; transform: translateX(-50%); animation: float 12s ease-in-out infinite 2s; }
        .glass-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.09); backdrop-filter: blur(20px); border-radius: 24px; }
        @keyframes floatWA { 0%, 100% { transform: translateY(0px) scale(1); box-shadow: 0 8px 25px rgba(251,191,36,0.4); } 50% { transform: translateY(-6px) scale(1.03); box-shadow: 0 18px 40px rgba(251,191,36,0.6); } }
        .wa-float { animation: floatWA 2.2s ease-in-out infinite; display: block; }
      `}</style>

      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <div className="relative z-10 mx-auto max-w-2xl px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <a href="/" className="pixel-logo text-2xl font-black">
            <span className="text-purple-500">GROW</span><span className="text-lime-400">FOLO</span>
          </a>
          <h1 className="text-lg font-bold text-white/80">إتمام الدفع</h1>
        </div>

        {/* Progress steps */}
        <div className="mb-8 flex items-center justify-center gap-0">
          {STEPS.map((step, i) => (
            <div key={step} className="flex items-center">
              <div className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold ${i === 0 ? "bg-green-500/20 text-green-400" : i === 1 ? "bg-purple-500/20 text-purple-400 ring-2 ring-purple-500/50" : "text-white/30"}`}>
                <span className={`grid size-6 place-items-center rounded-full text-xs font-black ${i === 0 ? "bg-green-500 text-black" : i === 1 ? "bg-purple-500 text-white" : "bg-white/10 text-white/40"}`}>
                  {i === 0 ? "✓" : i + 1}
                </span>
                {step}
              </div>
              {i < STEPS.length - 1 && (
                <div className="mx-1 h-px w-8 bg-white/10" />
              )}
            </div>
          ))}
        </div>

        {/* Timer */}
        <div className="glass-card mb-6 p-6 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-cyan-500/5" />
          <p className="mb-2 text-sm text-white/50">الوقت المتبقي لإتمام الدفع</p>
          <div className={`text-6xl font-black tracking-tight ${expired ? "text-red-400" : timeLeft < 300 ? "text-orange-400" : "text-purple-400"}`}
            style={{ textShadow: expired ? "0 0 30px rgba(239,68,68,0.7)" : timeLeft < 300 ? "0 0 30px rgba(251,146,60,0.7)" : "0 0 30px rgba(168,85,247,0.7)" }}>
            {formatTime(timeLeft)}
          </div>
          <p className="mt-2 text-xs text-white/30">دقيقة : ثانية</p>
        </div>

        {/* Expired overlay */}
        {expired && (
          <div className="mb-6 rounded-2xl bg-red-500/10 border border-red-500/30 p-6 text-center">
            <p className="text-xl font-black text-red-400 mb-3">انتهت المهلة</p>
            <p className="text-sm text-white/50 mb-4">انتهت مهلة الدفع. يرجى إنشاء طلب جديد.</p>
            <a href="/" className="inline-block rounded-2xl bg-red-500/20 border border-red-500/40 px-6 py-3 text-sm font-bold text-red-300 hover:bg-red-500/30 transition-colors">
              طلب جديد
            </a>
          </div>
        )}

        {/* Payment details card with 3D tilt */}
        <div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="glass-card mb-6 p-6"
          style={{
            transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
            transition: tilt.x === 0 && tilt.y === 0 ? "transform 0.5s ease" : "transform 0.1s ease",
          }}
        >
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-purple-500/8 via-transparent to-cyan-500/8 pointer-events-none" />
          <div className="relative mb-5 flex flex-col items-center gap-3 rounded-2xl border border-white/8 bg-black/20 p-4 text-center sm:flex-row sm:text-right">
            <div className="grid h-24 w-44 place-items-center rounded-2xl bg-white/[0.03]">
              <PaymentMethodImage method={selectedMethod} size="large" />
            </div>
            <div>
              <p className="text-xs text-white/40">طريقة الدفع المختارة</p>
              <h2 className="text-base font-black text-white">تفاصيل الدفع — {selectedMethod.label}</h2>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            {payMethod === "instapay" ? (
              <div className="flex flex-col items-center gap-4 py-2">
                <p className="text-xs font-bold uppercase tracking-widest text-white/45">رمز طلبك عبر InstaPay</p>
                <div className="w-full rounded-2xl border border-yellow-400/40 bg-yellow-400/8 p-5 text-center">
                  <p className="mb-2 text-[10px] text-white/35">رمز طلبك الخاص — احتفظ به</p>
                  <code className="text-3xl font-black tracking-widest text-yellow-300 select-all">{instaPayCode}</code>
                  <div className="mt-3 flex items-center justify-center gap-2">
                    <CopyButton value={instaPayCode} />
                    <span className="text-xs text-white/50">نسخ رمز الطلب</span>
                  </div>
                </div>
                <a
                  href={`https://wa.me/213779012833?text=${encodeURIComponent(`مرحباً، أريد إتمام الدفع عبر InstaPay. رمز طلبي: ${instaPayCode}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="wa-float w-full rounded-2xl py-4 text-center text-base font-black text-black"
                  style={{ background: "linear-gradient(135deg, #fbbf24, #f59e0b)" }}
                >
                  💬 تواصل عبر واتساب لإتمام الدفع
                </a>
                <p className="text-center text-xs leading-7 text-white/40">أرسل رمز طلبك عبر واتساب، وستصلك تعليمات الدفع. بعد إتمام الدفع، ارجع هنا وارفع إيصالك.</p>
              </div>
            ) : (
              selectedMethod.fields.map(field => (
                <div key={field.label} className="rounded-xl bg-white/5 p-3">
                  <p className="mb-1 text-xs text-white/40">{field.label}</p>
                  <div className="flex items-center justify-between gap-2">
                    <code className="flex-1 break-all text-sm font-mono text-cyan-300">{field.value}</code>
                    <CopyButton value={field.value} />
                  </div>
                </div>
              ))
            )}
          </div>
          {isMobilis && (
            <div className="relative mt-5 grid gap-4">
              <div className="rounded-2xl border border-lime-500/30 bg-lime-500/10 p-4">
                <p className="text-sm font-black text-lime-300">تنبيه مهم قبل الدفع</p>
                <p className="mt-2 text-sm leading-7 text-white/70">
                  تنبيه: لا يمكنك إرسال أكثر من 15 دولارًا في العملية الواحدة عبر Flexy Mobilis. إذا كانت قيمة طلبك أكبر، يرجى تقسيم المبلغ إلى عدة عمليات، ثم رفع جميع إيصالات الدفع لإكمال الطلب.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
                  <p className="text-xs text-white/40">سعر الصرف الحالي</p>
                  <p className="mt-1 text-sm font-black text-white">250 دينار جزائري = 1 دولار أمريكي</p>
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
                  <p className="text-xs text-white/40">حد العملية الواحدة</p>
                  <p className="mt-1 text-sm font-black text-lime-300">15$ كحد أقصى</p>
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
                  <p className="text-xs text-white/40">عدد الدفعات المقترح</p>
                  <p className="mt-1 text-sm font-black text-purple-300">{Math.min(flexySuggestedParts, FLEXY_MAX_RECEIPTS)} دفعة</p>
                </div>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                <p className="text-xs text-white/40">القيمة التقريبية بالدينار</p>
                <p className="mt-1 text-2xl font-black text-white">{flexyDzdTotal.toLocaleString("fr-DZ")} DZD</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-[1.2fr_0.8fr_0.8fr]">
                {[
                  { src: "/payment-guides/flexy/mobilis-number.jpg", alt: "رقم Flexy Mobilis الجديد" },
                  { src: "/payment-guides/flexy/mobilis-receipt-1.jpg", alt: "مثال إيصال Flexy Mobilis" },
                  { src: "/payment-guides/flexy/mobilis-receipt-2.jpg", alt: "مثال إيصال Flexy Mobilis آخر" },
                ].map((image) => (
                  <div key={image.src} className="overflow-hidden rounded-2xl border border-lime-500/20 bg-black/35">
                    <img src={image.src} alt={image.alt} className="h-44 w-full object-cover object-center sm:h-52" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Amount to send */}
        {checkoutData && (
          <div className="glass-card mb-6 p-5 text-center">
            <p className="text-sm text-white/50 mb-1">المبلغ المطلوب إرساله</p>
            <div className="text-4xl font-black text-white"
              style={{ textShadow: "0 0 20px rgba(168,85,247,0.6)" }}>
              {checkoutData.total.toFixed(2)} USD
            </div>
            {checkoutData.currency !== "USD" && (
              <p className="mt-1 text-xs text-white/30">({checkoutData.currency})</p>
            )}
          </div>
        )}

        {/* Customer form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="glass-card p-6">
            <h2 className="mb-4 text-base font-black text-white">معلومات العميل</h2>

            {checkoutData && checkoutData.items.length > 0 && (
              <div className="mb-4 rounded-xl bg-purple-500/10 border border-purple-500/20 p-3">
                <p className="text-xs text-white/40 mb-1">المنتج</p>
                <p className="text-sm font-bold text-white">{checkoutData.items.map(i => i.name).join(", ")}</p>
              </div>
            )}

            <div className="grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-bold text-white/50">الاسم الكامل *</span>
                  <input
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    required
                    placeholder="محمد علي"
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-purple-500 transition-colors"
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-bold text-white/50">البريد الإلكتروني *</span>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    placeholder="you@email.com"
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-purple-500 transition-colors"
                  />
                </label>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-bold text-white/50">واتساب *</span>
                  <input
                    value={whatsapp}
                    onChange={e => setWhatsapp(e.target.value)}
                    required
                    placeholder="+213 123 456 789"
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-purple-500 transition-colors"
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-bold text-white/50">الدولة *</span>
                  <input
                    value={country}
                    onChange={e => setCountry(e.target.value)}
                    required
                    placeholder="الجزائر"
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-purple-500 transition-colors"
                  />
                </label>
              </div>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-bold text-white/50">ملاحظات (اختياري)</span>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={2}
                  placeholder="أي معلومات إضافية..."
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-purple-500 transition-colors resize-none"
                />
              </label>
            </div>
          </div>

          {/* Proof upload */}
          <div className="glass-card p-6">
            <h2 className="mb-4 text-base font-black text-white">إثبات الدفع</h2>
            {isMobilis ? (
              <div className="grid gap-3">
                <p className="rounded-2xl border border-lime-500/20 bg-lime-500/8 px-4 py-3 text-sm leading-7 text-white/70">
                  يمكنك رفع حتى 4 إيصالات Flexy Mobilis. ارفع كل إيصال بعد كل عملية تحويل منفصلة.
                </p>
                <label
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={e => {
                    e.preventDefault();
                    setDragOver(false);
                    const incoming = Array.from(e.dataTransfer.files).slice(0, FLEXY_MAX_RECEIPTS - flexyProofFiles.length);
                    setFlexyProofFiles((prev) => [...prev, ...incoming].slice(0, FLEXY_MAX_RECEIPTS));
                  }}
                  className={`flex min-h-32 cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-6 text-center transition-all ${dragOver ? "border-purple-500 bg-purple-500/10" : flexyProofFiles.length ? "border-green-500/50 bg-green-500/5" : "border-white/15 bg-white/3 hover:border-white/30"}`}
                >
                  <Upload size={28} className="text-white/40" />
                  <p className="text-sm font-bold text-white/60">اضغط أو اسحب إيصال Flexy Mobilis</p>
                  <p className="text-xs text-white/30">تم رفع {flexyProofFiles.length} من {FLEXY_MAX_RECEIPTS}</p>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    className="sr-only"
                    multiple
                    onChange={e => {
                      const incoming = Array.from(e.target.files ?? []).slice(0, FLEXY_MAX_RECEIPTS - flexyProofFiles.length);
                      setFlexyProofFiles((prev) => [...prev, ...incoming].slice(0, FLEXY_MAX_RECEIPTS));
                      e.currentTarget.value = "";
                    }}
                  />
                </label>
                {flexyProofFiles.length > 0 && (
                  <div className="grid gap-2">
                    {flexyProofFiles.map((file, index) => (
                      <div key={`${file.name}-${index}`} className="flex items-center justify-between gap-3 rounded-xl border border-white/8 bg-white/5 px-3 py-2">
                        <span className="truncate text-sm font-semibold text-lime-400">إيصال {index + 1}: {file.name}</span>
                        <button
                          type="button"
                          onClick={() => setFlexyProofFiles((prev) => prev.filter((_, i) => i !== index))}
                          className="rounded-lg bg-red-500/10 px-2 py-1 text-xs font-bold text-red-300 hover:bg-red-500/20"
                        >
                          حذف
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <label
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) setProofFile(f); }}
                className={`flex min-h-36 cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-6 text-center transition-all ${dragOver ? "border-purple-500 bg-purple-500/10" : proofFile ? "border-green-500/50 bg-green-500/5" : "border-white/15 bg-white/3 hover:border-white/30"}`}
              >
                {proofFile ? (
                  <>
                    <Check size={28} className="text-green-400" />
                    <p className="text-sm font-bold text-green-400">{proofFile.name}</p>
                    <p className="text-xs text-white/40">انقر لتغيير الملف</p>
                  </>
                ) : (
                  <>
                    <Upload size={28} className="text-white/40" />
                    <p className="text-sm font-bold text-white/60">اسحب وأفلت إثبات الدفع هنا</p>
                    <p className="text-xs text-white/30">أو انقر للاختيار · صورة أو PDF</p>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*,.pdf"
                  className="sr-only"
                  onChange={e => { const f = e.target.files?.[0]; if (f) setProofFile(f); }}
                />
              </label>
            )}
          </div>

          {submitError && (
            <div className="rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-400">
              {submitError}
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={submitting || expired || (isMobilis ? flexyProofFiles.length === 0 : !proofFile)}
            className="neon-button w-full rounded-2xl py-5 text-lg font-black text-black disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ boxShadow: "0 0 40px rgba(168,85,247,0.5)" }}
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-3">
                <span className="size-5 rounded-full border-2 border-black border-t-transparent animate-spin" />
                جاري الإرسال...
              </span>
            ) : "تم الدفع ✓"}
          </button>
          <PaymentMethodShowcase />
        </form>
      </div>
    </div>
  );
}
