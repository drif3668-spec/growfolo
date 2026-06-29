"use client";

import { useRef, useState } from "react";
import { ArrowRight, CheckCircle2, Clock, Copy, Gift, Loader2, Package, Search, Send, Star, Truck } from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

/* ── Tracking stages ─────────────────────────────────────────────────── */
const STAGES = [
  { id: 1, label: "قيد المعالجة",          icon: Clock,    color: "#a855f7" },
  { id: 2, label: "يتم المراجعة",           icon: Search,   color: "#6366f1" },
  { id: 3, label: "جارٍ البحث عن الوكيل",  icon: Package,  color: "#3b82f6" },
  { id: 4, label: "تم تأكيد الطلب",         icon: CheckCircle2, color: "#10b981" },
  { id: 5, label: "تم إرسال الطلب",         icon: Truck,    color: "#c8e600" },
];

type TrackingData = {
  id: string; product_name: string; status: string;
  tracking_stage: number; tracking_notes: string | null; created_at: string;
};

type DiscountData = { code: string; percent: number; expires_at: string | null };

/* ── Confetti particle ───────────────────────────────────────────────── */
function Confetti({ active }: { active: boolean }) {
  if (!active) return null;
  const particles = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 1.5,
    dur: 1.5 + Math.random() * 2,
    color: ["#c8e600", "#a855f7", "#3b82f6", "#f59e0b", "#ec4899", "#10b981"][Math.floor(Math.random() * 6)],
    size: 6 + Math.random() * 10,
    rotate: Math.random() * 360,
  }));
  return (
    <div className="pointer-events-none fixed inset-0 z-[300] overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute top-0 rounded-sm opacity-0"
          style={{
            left: `${p.x}%`,
            width: p.size, height: p.size * 0.6,
            background: p.color,
            transform: `rotate(${p.rotate}deg)`,
            animation: `confetti-fall ${p.dur}s ease-in ${p.delay}s forwards`,
          }}
        />
      ))}
      <style>{`
        @keyframes confetti-fall {
          0%  { transform: translateY(-20px) rotate(0deg);   opacity: 1; }
          100%{ transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   Page
════════════════════════════════════════════════════════════════════════ */
export default function TrackOrderPage() {
  const [orderId, setOrderId]     = useState("");
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [data, setData]           = useState<TrackingData | null>(null);
  const [discount, setDiscount]   = useState<DiscountData | null>(null);
  const [confetti, setConfetti]   = useState(false);
  const [copied, setCopied]       = useState(false);
  const [discountErr, setDiscountErr] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function trackOrder() {
    const id = orderId.trim();
    if (!id) { inputRef.current?.focus(); return; }
    setLoading(true); setError(""); setData(null); setDiscount(null);
    try {
      const r = await fetch(`${API_URL}/api/v1/store-orders/track/${id}`);
      if (!r.ok) { setError("لم يتم العثور على الطلب. تحقق من رقم الطلب وحاول مجدداً."); return; }
      const result: TrackingData = await r.json();
      setData(result);
      if (result.tracking_stage >= 5) {
        setConfetti(true);
        setTimeout(() => setConfetti(false), 5000);
        fetchDiscount(id);
      }
    } catch { setError("خطأ في الاتصال. تحقق من الإنترنت وحاول مجدداً."); }
    finally { setLoading(false); }
  }

  async function fetchDiscount(id: string) {
    setDiscountErr("");
    try {
      const r = await fetch(`${API_URL}/api/v1/discounts/for-order/${id}`);
      if (r.ok) setDiscount(await r.json());
      else setDiscountErr("سيتم إضافة كود الخصم قريباً من قِبل الفريق.");
    } catch { setDiscountErr("تعذّر تحميل كود الخصم."); }
  }

  function copyCode() {
    if (!discount) return;
    navigator.clipboard.writeText(discount.code).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 2000);
    });
  }

  const stage = data?.tracking_stage ?? 0;

  return (
    <main className="min-h-screen bg-[#050508] text-white" dir="rtl">
      <SiteHeader />
      <Confetti active={confetti} />

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pb-10 pt-14">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/3 top-0 size-[600px] -translate-x-1/2 rounded-full bg-purple-600/12 blur-[140px]" />
          <div className="absolute right-1/4 top-24 size-[400px] rounded-full bg-lime-400/7 blur-[100px]" />
        </div>

        <div className="relative mx-auto max-w-2xl px-4 text-center">
          <a href="/" className="mb-8 inline-flex items-center gap-2 text-sm text-white/40 hover:text-white transition-colors">
            <ArrowRight size={15} /> العودة للرئيسية
          </a>

          {/* 3D icon */}
          <div className="mx-auto mb-6 grid size-24 place-items-center rounded-3xl"
            style={{
              background: "linear-gradient(135deg, rgba(168,85,247,0.3), rgba(59,130,246,0.2))",
              border: "1px solid rgba(168,85,247,0.3)",
              boxShadow: "0 0 0 1px rgba(168,85,247,0.1), 0 0 60px rgba(168,85,247,0.25), 0 20px 60px rgba(0,0,0,0.5)",
              transform: "perspective(600px) rotateX(8deg)",
            }}>
            <Truck size={42} className="text-purple-400 drop-shadow-[0_0_20px_rgba(168,85,247,0.8)]" />
          </div>

          <h1 className="text-4xl font-black text-white md:text-5xl">
            تتبع{" "}
            <span className="bg-gradient-to-l from-lime-400 to-purple-400 bg-clip-text text-transparent">
              طلبك
            </span>
          </h1>
          <p className="mt-3 text-sm text-white/50">أدخل رقم الطلب الخاص بك لمتابعة حالته لحظةً بلحظة</p>
        </div>
      </section>

      {/* ── Search bar ────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-xl px-4 pb-8">
        <div
          className="flex items-center gap-2 rounded-2xl p-2"
          style={{
            background: "linear-gradient(135deg, rgba(14,10,26,0.98), rgba(8,6,18,0.99))",
            border: "1px solid rgba(168,85,247,0.25)",
            boxShadow: "0 0 40px rgba(168,85,247,0.15), 0 20px 50px rgba(0,0,0,0.5)",
          }}
        >
          <input
            ref={inputRef}
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && trackOrder()}
            placeholder="ادخل رقم الطلب..."
            className="flex-1 bg-transparent px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/25"
          />
          <button
            onClick={trackOrder}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-black text-black transition-all hover:opacity-90 active:scale-[.98] disabled:opacity-60"
            style={{ background: "linear-gradient(135deg, #c8e600, #a3bd00)", boxShadow: "0 4px 18px rgba(200,230,0,0.4)" }}
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
            تتبع الطلب
          </button>
        </div>

        {error && (
          <div className="mt-3 rounded-2xl border border-red-500/20 bg-red-500/8 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}
      </div>

      {/* ── Result ────────────────────────────────────────────────────── */}
      {data && (
        <div className="mx-auto max-w-2xl space-y-6 px-4 pb-20">

          {/* Order card */}
          <div
            className="rounded-3xl p-6"
            style={{
              background: "linear-gradient(135deg, rgba(14,10,26,0.97), rgba(8,6,18,0.98))",
              border: "1px solid rgba(168,85,247,0.2)",
              boxShadow: "0 0 60px rgba(168,85,247,0.12), 0 25px 60px rgba(0,0,0,0.6)",
              transform: "perspective(1000px) rotateX(1.5deg)",
            }}
          >
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <p className="text-xs text-white/40">رقم الطلب</p>
                <p className="mt-0.5 font-mono text-xs text-white/60">{data.id}</p>
                <p className="mt-2 font-black text-white">{data.product_name}</p>
              </div>
              <div
                className="shrink-0 rounded-xl px-3 py-1.5 text-xs font-bold"
                style={{
                  background: stage >= 5 ? "rgba(200,230,0,0.15)" : "rgba(168,85,247,0.15)",
                  color: stage >= 5 ? "#c8e600" : "#a855f7",
                  border: `1px solid ${stage >= 5 ? "rgba(200,230,0,0.3)" : "rgba(168,85,247,0.3)"}`,
                }}
              >
                {stage >= 5 ? "✅ مكتمل" : "🔄 جارٍ التنفيذ"}
              </div>
            </div>

            {data.tracking_notes && (
              <div className="mb-5 rounded-2xl border border-white/8 bg-white/4 px-4 py-3 text-sm leading-7 text-white/70">
                📝 {data.tracking_notes}
              </div>
            )}

            {/* ── Timeline ─────────────────────────────────────────── */}
            <div className="relative">
              {/* Connector line */}
              <div className="absolute right-[19px] top-8 h-[calc(100%-48px)] w-0.5 bg-white/8" />
              <div
                className="absolute right-[19px] top-8 w-0.5 transition-all duration-1000"
                style={{
                  height: `${Math.min(((stage - 1) / 4) * 100, 100)}%`,
                  background: "linear-gradient(to bottom, #a855f7, #c8e600)",
                }}
              />

              <div className="grid gap-4">
                {STAGES.map((s) => {
                  const done    = stage > s.id;
                  const current = stage === s.id;
                  const Icon    = s.icon;
                  return (
                    <div key={s.id} className="relative flex items-start gap-4">
                      {/* Step bubble */}
                      <div
                        className="relative z-10 grid size-10 shrink-0 place-items-center rounded-full transition-all duration-500"
                        style={{
                          background: done
                            ? "linear-gradient(135deg, #22c55e, #16a34a)"
                            : current
                              ? `linear-gradient(135deg, ${s.color}cc, ${s.color}88)`
                              : "rgba(255,255,255,0.06)",
                          border: current
                            ? `2px solid ${s.color}`
                            : done
                              ? "2px solid #22c55e"
                              : "2px solid rgba(255,255,255,0.1)",
                          boxShadow: current ? `0 0 20px ${s.color}55` : "none",
                        }}
                      >
                        {done ? (
                          <CheckCircle2 size={18} className="text-white" />
                        ) : current ? (
                          <Icon size={18} style={{ color: s.color }} className={current ? "animate-pulse" : ""} />
                        ) : (
                          <Icon size={18} className="text-white/20" />
                        )}
                      </div>

                      {/* Label */}
                      <div className="flex-1 pb-1 pt-1.5">
                        <p
                          className="font-bold transition-colors"
                          style={{
                            color: done ? "#22c55e" : current ? s.color : "rgba(255,255,255,0.35)",
                          }}
                        >
                          {s.label}
                          {done && " ✓"}
                          {current && (
                            <span className="mr-2 animate-pulse text-xs font-normal opacity-70">
                              (الحالة الحالية)
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── Celebration (stage 5) ──────────────────────────────── */}
          {stage >= 5 && (
            <div
              className="overflow-hidden rounded-3xl p-6 text-center"
              style={{
                background: "linear-gradient(135deg, rgba(200,230,0,0.08), rgba(168,85,247,0.08))",
                border: "1px solid rgba(200,230,0,0.25)",
                boxShadow: "0 0 60px rgba(200,230,0,0.12)",
              }}
            >
              <div className="text-5xl">🎉</div>
              <h2 className="mt-3 text-2xl font-black text-white">مبروك!</h2>
              <p className="mt-2 text-sm text-white/60">تم إرسال طلبك بنجاح. شكراً لثقتك بـ Growfolo!</p>

              {/* Discount code */}
              {discount ? (
                <div className="mt-5">
                  <p className="mb-3 text-sm text-white/50">
                    🎁 هدية منّا إليك — كود خصم
                    <span className="font-black text-lime-400"> {discount.percent}%</span>
                  </p>
                  <div
                    className="inline-flex items-center gap-3 rounded-2xl px-5 py-3"
                    style={{
                      background: "rgba(200,230,0,0.1)",
                      border: "1px solid rgba(200,230,0,0.3)",
                    }}
                  >
                    <span className="font-mono text-lg font-black tracking-widest text-lime-400">
                      {discount.code}
                    </span>
                    <button
                      onClick={copyCode}
                      className="grid size-8 place-items-center rounded-xl bg-lime-400/20 text-lime-400 transition-all hover:bg-lime-400/30"
                    >
                      {copied ? <Star size={15} className="fill-lime-400" /> : <Copy size={15} />}
                    </button>
                  </div>
                  {copied && <p className="mt-2 text-xs text-lime-400">✓ تم النسخ!</p>}
                  {discount.expires_at && (
                    <p className="mt-2 text-xs text-white/35">
                      صالح حتى: {new Date(discount.expires_at).toLocaleDateString("ar-DZ")}
                    </p>
                  )}
                </div>
              ) : (
                <div className="mt-4">
                  {discountErr
                    ? <p className="text-xs text-white/40">{discountErr}</p>
                    : <p className="flex items-center justify-center gap-2 text-xs text-white/40"><Loader2 size={12} className="animate-spin" /> جارٍ تحميل كود الخصم...</p>
                  }
                </div>
              )}

              <a href="/"
                className="mt-5 inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-black text-black transition-all hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #c8e600, #a3bd00)" }}>
                <Gift size={16} /> تسوّق مجدداً
              </a>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
