"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Copy, Check, Upload, ExternalLink } from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";
import { PaymentMethodImage } from "@/components/payments/payment-method-image";

const FLEXY_PHONE = "0654103330";

type Method = {
  id: string;
  label: string;
  logo: string;
  color: string;
  bg: string;
  description: string;
};

const METHODS: Method[] = [
  {
    id: "instapay",
    label: "InstaPay",
    logo: "/payment-methods/instapay.png",
    color: "text-blue-400",
    bg: "from-blue-900/30 to-blue-800/10 border-blue-500/20",
    description: "تحويل فوري عبر InstaPay",
  },
  {
    id: "baridimob",
    label: "BaridiMob",
    logo: "/payment-methods/baridimob.png",
    color: "text-yellow-400",
    bg: "from-yellow-900/30 to-yellow-800/10 border-yellow-500/20",
    description: "تحويل عبر تطبيق BaridiMob",
  },
  {
    id: "flexy",
    label: "Flexy Mobilis",
    logo: "/payment-methods/mobilis.png",
    color: "text-green-400",
    bg: "from-green-900/30 to-green-800/10 border-green-500/20",
    description: "دفع عبر Flexy Mobilis",
  },
  {
    id: "usdt",
    label: "USDT (TRC20)",
    logo: "/payment-methods/usdt.png",
    color: "text-emerald-400",
    bg: "from-emerald-900/30 to-emerald-800/10 border-emerald-500/20",
    description: "تحويل USDT عبر شبكة TRON",
  },
  {
    id: "bnb",
    label: "BNB (BEP20)",
    logo: "/payment-methods/bnb.png",
    color: "text-yellow-300",
    bg: "from-yellow-900/30 to-yellow-800/10 border-yellow-400/20",
    description: "تحويل BNB عبر Binance Smart Chain",
  },
  {
    id: "redotpay",
    label: "RedotPay",
    logo: "/payment-methods/redotpay.jpg",
    color: "text-red-400",
    bg: "from-red-900/30 to-red-800/10 border-red-500/20",
    description: "دفع عبر Payment ID",
  },
];

const PAYMENT_DETAILS: Record<string, { fields: { label: string; value: string }[]; steps: string[] }> = {
  vodafone: {
    fields: [{ label: "رقم Vodafone Cash", value: "01XXXXXXXXX" }],
    steps: ["افتح تطبيق Vodafone Cash", "اختر تحويل أموال", "أدخل الرقم أعلاه والمبلغ", "أرسل لقطة الشاشة"],
  },
  instapay: {
    fields: [{ label: "معرف InstaPay", value: "growfolo@instapay" }],
    steps: ["افتح تطبيق InstaPay", "ابحث عن المعرف أعلاه", "أدخل المبلغ وأتم التحويل", "أرسل صورة الإيصال"],
  },
  baridimob: {
    fields: [
      { label: "رقم CCP", value: "00123456789 — مفتاح: 12" },
      { label: "الاسم", value: "Growfolo Store" },
    ],
    steps: ["افتح تطبيق BaridiMob", "اختر تحويل CCP", "أدخل رقم الحساب والمفتاح", "أرسل صورة التأكيد"],
  },
  flexy: {
    fields: [{ label: "رقم الهاتف", value: `${FLEXY_PHONE} (Mobilis)` }],
    steps: [
      "لا ترسل أكثر من 15$ في العملية الواحدة",
      "قسّم المبلغ إلى عدة عمليات إذا كان طلبك أكبر من 15$",
      "ارفع كل إيصالات الدفع لإكمال مراجعة الطلب",
    ],
  },
  usdt: {
    fields: [
      { label: "الشبكة", value: "TRC20 (TRON)" },
      { label: "عنوان المحفظة", value: "TPQJS1aNK6QiXvfC9yKtS41f47awYAuv7T" },
    ],
    steps: ["افتح محفظتك (Trust Wallet, Binance…)", "أرسل USDT على الشبكة TRC20 فقط", "أرسل hash المعاملة"],
  },
  bnb: {
    fields: [
      { label: "الشبكة", value: "BEP20 (BSC)" },
      { label: "عنوان المحفظة", value: "0xe69071c0e58142e89fa239910436a35e18fe3c5d" },
    ],
    steps: ["افتح محفظتك (Trust Wallet, MetaMask…)", "أرسل BNB على شبكة BSC فقط", "أرسل hash المعاملة"],
  },
  redotpay: {
    fields: [{ label: "Payment ID", value: "1293340175" }],
    steps: ["افتح RedotPay", "أرسل المبلغ إلى Payment ID أعلاه", "أرسل صورة إثبات الدفع"],
  },
};

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button
      onClick={copy}
      className={`grid size-7 shrink-0 place-items-center rounded-lg transition-colors ${
        copied ? "bg-lime-500/20 text-lime-400" : "bg-white/8 text-white/50 hover:bg-white/15 hover:text-white"
      }`}
    >
      {copied ? <Check size={13} /> : <Copy size={13} />}
    </button>
  );
}

export default function PaymentPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const [proof, setProof] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
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
  const [bariDiMobCode] = useState<string>(() => {
    const key = "gf_baridimob_order_code";
    try {
      const saved = localStorage.getItem(key);
      if (saved) return saved;
      const code = "BD-" + Array.from({ length: 6 }, () => "0123456789ABCDEFGHJKMNPQRSTVWXYZ"[Math.floor(Math.random() * 32)]).join("");
      localStorage.setItem(key, code);
      return code;
    } catch {
      return "BD-" + Array.from({ length: 6 }, () => "0123456789ABCDEFGHJKMNPQRSTVWXYZ"[Math.floor(Math.random() * 32)]).join("");
    }
  });

  const handleConfirm = async () => {
    if (!proof) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1500));
    setDone(true);
    setSubmitting(false);
  };

  if (done) {
    return (
      <main className="min-h-screen bg-[#050508]">
        <SiteHeader />
        <div className="mx-auto flex max-w-lg flex-col items-center justify-center py-24 text-center">
          <div className="mb-5 grid size-20 place-items-center rounded-3xl bg-lime-400/15 text-lime-400">
            <Check size={40} />
          </div>
          <h1 className="text-3xl font-black text-white">تم استلام طلبك!</h1>
          <p className="mt-3 text-white/55">
            سيتم مراجعة إثبات الدفع وتفعيل طلبك خلال دقائق.
          </p>
          <Link href="/" className="neon-button mt-8 inline-block rounded-2xl px-10 py-3.5 font-black text-black">
            العودة للرئيسية
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050508]">
      <style>{`
        @keyframes floatWA { 0%, 100% { transform: translateY(0px) scale(1); } 50% { transform: translateY(-6px) scale(1.03); } }
        .wa-float { animation: floatWA 2.2s ease-in-out infinite; display: block; }
      `}</style>
      <SiteHeader />
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-6 flex items-center gap-3">
          <button onClick={() => router.back()} className="grid size-9 place-items-center rounded-2xl bg-white/6 text-white hover:bg-white/12">
            <ArrowRight size={18} />
          </button>
          <h1 className="text-2xl font-black text-white">اختر طريقة الدفع</h1>
        </div>

        {/* Methods Grid */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {METHODS.map((m) => (
            <button
              key={m.id}
              onClick={() => setSelected(selected === m.id ? null : m.id)}
              className={`flex flex-col items-start gap-2 rounded-2xl border bg-gradient-to-br p-5 text-right transition-all ${m.bg} ${
                selected === m.id ? "ring-2 ring-purple-500 scale-[1.02]" : "hover:scale-[1.01]"
              }`}
            >
              <span className="grid h-14 w-full place-items-center">
                <PaymentMethodImage method={{ label: m.label, image: m.logo }} />
              </span>
              <span className={`text-base font-black ${m.color}`}>{m.label}</span>
              <span className="text-xs text-white/50">{m.description}</span>
            </button>
          ))}
        </div>

        {/* Payment Details */}
        {selected && (
          <div className="glass-panel mt-6 rounded-3xl p-6">
            <h2 className="mb-4 text-lg font-black text-white">
              تفاصيل الدفع — {METHODS.find((m) => m.id === selected)?.label}
            </h2>

            {/* Fields */}
            {(selected === "instapay" || selected === "baridimob") ? (() => {
              const isInsta = selected === "instapay";
              const orderCode = isInsta ? instaPayCode : bariDiMobCode;
              const methodLabel = isInsta ? "InstaPay" : "BaridiMob";
              return (
              <div className="mb-5 flex flex-col items-center gap-4">
                <p className="text-xs font-bold uppercase tracking-widest text-white/45">رمز طلبك عبر {methodLabel}</p>
                <div className="w-full rounded-2xl border border-yellow-400/40 bg-yellow-400/8 p-5 text-center">
                  <p className="mb-2 text-[10px] text-white/35">رمز طلبك الخاص — احتفظ به</p>
                  <code className="text-3xl font-black tracking-widest text-yellow-300 select-all">{orderCode}</code>
                  <div className="mt-3 flex items-center justify-center gap-2">
                    <CopyButton value={orderCode} />
                    <span className="text-xs text-white/50">نسخ رمز الطلب</span>
                  </div>
                </div>
                <a
                  href={`https://wa.me/213779012833?text=${encodeURIComponent(`مرحباً، أريد إتمام الدفع عبر ${methodLabel}. رمز طلبي: ${orderCode}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="wa-float w-full rounded-2xl py-4 text-center text-base font-black text-black"
                  style={{ background: "linear-gradient(135deg, #fbbf24, #f59e0b)", boxShadow: "0 8px 25px rgba(251,191,36,0.45)" }}
                >
                  💬 تواصل عبر واتساب لإتمام الدفع
                </a>
                <p className="text-center text-xs leading-7 text-white/40">أرسل رمز طلبك عبر واتساب، وستصلك تعليمات الدفع. بعد إتمام الدفع، ارجع هنا وارفع إيصالك.</p>
              </div>
              );
            })() : (
              <div className="mb-5 grid gap-3">
                {PAYMENT_DETAILS[selected].fields.map((f) => (
                  <div key={f.label} className="rounded-2xl border border-white/8 bg-white/4 px-4 py-3">
                    <p className="mb-1 text-xs text-white/45">{f.label}</p>
                    <div className="flex items-center justify-between gap-2">
                      <code className="text-sm font-bold text-white break-all">{f.value}</code>
                      <CopyButton value={f.value} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Steps */}
            <div className="mb-5">
              <p className="mb-2 text-xs font-bold text-white/55">خطوات الدفع</p>
              <ol className="grid gap-1.5">
                {PAYMENT_DETAILS[selected].steps.map((step, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-white/70">
                    <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-purple-600/30 text-xs font-bold text-purple-400">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>

            {selected === "flexy" && (
              <div className="mb-5 grid gap-3">
                <div className="rounded-2xl border border-lime-500/30 bg-lime-500/10 px-4 py-3">
                  <p className="text-sm font-black text-lime-300">تنبيه Flexy Mobilis</p>
                  <p className="mt-2 text-sm leading-7 text-white/70">
                    تنبيه: لا يمكنك إرسال أكثر من 15 دولارًا في العملية الواحدة عبر Flexy Mobilis. إذا كانت قيمة طلبك أكبر، يرجى تقسيم المبلغ إلى عدة عمليات، ثم رفع جميع إيصالات الدفع لإكمال الطلب.
                  </p>
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/4 px-4 py-3">
                  <p className="text-xs text-white/45">سعر الصرف الحالي</p>
                  <p className="mt-1 text-sm font-black text-white">250 دينار جزائري = 1 دولار أمريكي</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    { src: "/payment-guides/flexy/mobilis-number.jpg", alt: "رقم Flexy Mobilis" },
                    { src: "/payment-guides/flexy/mobilis-receipt-1.jpg", alt: "مثال إيصال Flexy" },
                    { src: "/payment-guides/flexy/mobilis-receipt-2.jpg", alt: "مثال إيصال Flexy" },
                  ].map((image) => (
                    <div key={image.src} className="overflow-hidden rounded-2xl border border-lime-500/20 bg-black/35">
                      <img src={image.src} alt={image.alt} className="h-36 w-full object-cover object-center" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Proof Upload */}
            <label className="block cursor-pointer">
              <p className="mb-2 text-sm font-bold text-white/75">رفع إثبات الدفع</p>
              <div className={`flex min-h-28 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed transition-colors ${
                proof ? "border-lime-500/50 bg-lime-500/6" : "border-white/15 bg-white/3 hover:bg-white/6"
              }`}>
                {proof ? (
                  <>
                    <Check size={24} className="text-lime-400" />
                    <p className="text-sm text-lime-400 font-semibold">{proof.name}</p>
                    <p className="text-xs text-white/35">اضغط لتغيير الملف</p>
                  </>
                ) : (
                  <>
                    <Upload size={24} className="text-white/30" />
                    <p className="text-sm text-white/55">اسحب الصورة هنا أو اضغط للرفع</p>
                    <p className="text-xs text-white/30">JPG، PNG، PDF</p>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*,.pdf"
                  className="sr-only"
                  onChange={(e) => setProof(e.target.files?.[0] ?? null)}
                />
              </div>
            </label>

            <button
              onClick={handleConfirm}
              disabled={!proof || submitting}
              className="neon-button mt-5 w-full rounded-2xl py-4 font-black text-black disabled:opacity-50"
            >
              {submitting ? "جارٍ التأكيد..." : "تأكيد الدفع →"}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
