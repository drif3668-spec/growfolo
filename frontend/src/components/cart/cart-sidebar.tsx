"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { X, Minus, Plus, Trash2, ShoppingCart, Clock, ChevronDown, Search, Tag, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { useCart } from "@/context/cart-context";
import { useCurrency, type Currency } from "@/context/currency-context";
import { useNotifications } from "@/context/notifications-context";
import { PaymentMethodImage } from "@/components/payments/payment-method-image";
import { PAYMENT_METHODS } from "@/lib/payment-methods";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending_proof: { label: "بانتظار إثبات الدفع", color: "text-yellow-400 bg-yellow-400/10" },
  processing: { label: "قيد المراجعة", color: "text-orange-400 bg-orange-400/10" },
  confirmed: { label: "تم تأكيد الدفع", color: "text-cyan-400 bg-cyan-400/10" },
  activated: { label: "مكتمل ✓", color: "text-green-400 bg-green-400/10" },
  rejected: { label: "مرفوض", color: "text-red-400 bg-red-400/10" },
  expired: { label: "منتهي الوقت", color: "text-gray-400 bg-gray-400/10" },
};

interface Order {
  id: string;
  product_name: string;
  product_price: number;
  created_at: string;
  status: string;
}

export function CartSidebar() {
  const { items, removeItem, updateQty, clear, totalUSD, sidebarOpen, closeSidebar } = useCart();
  const { currencies, selected, setSelected, convert } = useCurrency();
  const { addNotification } = useNotifications();

  const [tab, setTab] = useState<"cart" | "orders">("cart");
  const [payMethod, setPayMethod] = useState("usdt");
  const [currencySearch, setCurrencySearch] = useState("");
  const [currencyDropOpen, setCurrencyDropOpen] = useState(false);
  const currencyDropRef = useRef<HTMLDivElement>(null);

  // Discount code state
  const [dcInput, setDcInput] = useState("");
  const [dcLoading, setDcLoading] = useState(false);
  const [dcError, setDcError] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<{ code: string; percent: number } | null>(null);
  const [displayTotal, setDisplayTotal] = useState(0);
  const [priceAnimating, setPriceAnimating] = useState(false);
  const animFrameRef = useRef<number | null>(null);

  // Orders tab state
  const [email, setEmail] = useState("");
  const [savedEmail, setSavedEmail] = useState<string | null>(null);
  const [emailInput, setEmailInput] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Restore saved payment method and email on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("gf_pay_method");
      if (saved) setPayMethod(saved);
      const savedMail = localStorage.getItem("gf_my_email");
      if (savedMail) setSavedEmail(savedMail);
    } catch {}
  }, []);

  // Persist payment method
  useEffect(() => {
    try { localStorage.setItem("gf_pay_method", payMethod); } catch {}
  }, [payMethod]);

  // Discount derived values
  const discountAmount  = appliedDiscount ? totalUSD * (appliedDiscount.percent / 100) : 0;
  const discountedTotal = totalUSD - discountAmount;

  // Animate displayTotal whenever discountedTotal changes
  useEffect(() => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    const from     = displayTotal || totalUSD;
    const to       = discountedTotal;
    if (Math.abs(from - to) < 0.001) { setDisplayTotal(to); return; }
    const duration = 900;
    const start    = performance.now();
    setPriceAnimating(true);
    function tick(now: number) {
      const t = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      setDisplayTotal(from + (to - from) * ease);
      if (t < 1) animFrameRef.current = requestAnimationFrame(tick);
      else { setPriceAnimating(false); setDisplayTotal(to); }
    }
    animFrameRef.current = requestAnimationFrame(tick);
    return () => { if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [discountedTotal]);

  // Apply discount code
  const applyDiscount = useCallback(async () => {
    const code = dcInput.trim().toUpperCase();
    if (!code) return;
    setDcLoading(true);
    setDcError("");
    try {
      const res = await fetch(`${API_URL}/api/v1/discounts/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      if (res.ok) {
        const dc = await res.json() as { code: string; percent: number };
        setAppliedDiscount({ code: dc.code, percent: dc.percent });
        setDcInput("");
        addNotification({ title: "تم تطبيق كود الخصم", description: `كود "${dc.code}" — خصم ${dc.percent}% على إجمالي سلتك`, type: "discount" });
      } else {
        const err = await res.json() as { detail?: string };
        setDcError(err.detail ?? "الكود غير صالح");
        setAppliedDiscount(null);
      }
    } catch { setDcError("خطأ في الاتصال، حاول مجدداً"); }
    finally { setDcLoading(false); }
  }, [dcInput]);

  function removeDiscount() {
    setAppliedDiscount(null);
    setDcError("");
    setDcInput("");
  }

  // Close currency dropdown when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (currencyDropRef.current && !currencyDropRef.current.contains(e.target as Node)) {
        setCurrencyDropOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Poll orders every 15s when on orders tab and email saved
  useEffect(() => {
    if (tab !== "orders" || !savedEmail) return;
    let active = true;

    async function fetchOrders() {
      setOrdersLoading(true);
      try {
        const res = await fetch(`${API_URL}/api/v1/store-orders/customer/${encodeURIComponent(savedEmail!)}`);
        if (res.ok && active) setOrders(await res.json());
      } catch {}
      if (active) setOrdersLoading(false);
    }

    fetchOrders();
    const interval = setInterval(fetchOrders, 15000);
    return () => { active = false; clearInterval(interval); };
  }, [tab, savedEmail]);

  function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!emailInput.trim()) return;
    const trimmed = emailInput.trim();
    setSavedEmail(trimmed);
    try { localStorage.setItem("gf_my_email", trimmed); } catch {}
  }

  function handleCheckout() {
    const checkoutData = {
      items,
      total: discountedTotal,
      originalTotal: totalUSD,
      discountCode: appliedDiscount?.code ?? null,
      discountPercent: appliedDiscount?.percent ?? null,
      currency: selected.code,
      paymentMethod: payMethod,
    };
    try { localStorage.setItem("gf_checkout_data", JSON.stringify(checkoutData)); } catch {}
    window.location.href = payMethod === "whatsapp" ? "/checkout?method=whatsapp" : "/checkout/pay";
  }

  const filteredCurrencies = currencies.filter(c =>
    c.code.toLowerCase().includes(currencySearch.toLowerCase()) ||
    c.name.includes(currencySearch)
  );

  return (
    <>
      {/* Overlay */}
      <div
        onClick={closeSidebar}
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${sidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
      />

      {/* Sidebar — slides from left */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[340px] max-w-full flex-col bg-[#09080f] shadow-[0_0_60px_rgba(168,85,247,0.3)] transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/8 px-5 py-4 shrink-0">
          <button
            onClick={closeSidebar}
            className="grid size-9 place-items-center rounded-2xl bg-white/6 text-white/60 hover:bg-white/12 hover:text-white"
            aria-label="إغلاق"
          >
            <X size={18} />
          </button>
          <div className="pixel-logo text-xl font-black">
            <span className="text-purple-500">GROW</span>
            <span className="text-lime-400">FOLO</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/8 shrink-0">
          <button
            onClick={() => setTab("cart")}
            className={`flex flex-1 items-center justify-center gap-2 py-3 text-sm font-bold transition-colors ${tab === "cart" ? "border-b-2 border-purple-500 text-purple-400" : "text-white/50 hover:text-white"}`}
          >
            <ShoppingCart size={16} />
            سلتي
          </button>
          <button
            onClick={() => setTab("orders")}
            className={`flex flex-1 items-center justify-center gap-2 py-3 text-sm font-bold transition-colors ${tab === "orders" ? "border-b-2 border-purple-500 text-purple-400" : "text-white/50 hover:text-white"}`}
          >
            <Clock size={16} />
            معاملاتي
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-1 flex-col overflow-y-auto">
          {tab === "cart" ? (
            <div className="flex flex-1 flex-col p-4 gap-4">
              {/* Cart items */}
              {items.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center py-10">
                  <ShoppingCart size={48} className="text-white/20" />
                  <p className="text-white/40 text-sm">السلة فارغة</p>
                  <p className="text-white/25 text-xs">أضف منتجات لتبدأ التسوق</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {items.map(item => (
                    <div key={item.id} className="flex items-center gap-3 rounded-2xl bg-white/5 p-3">
                      <div className={`grid size-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${item.color} text-xl font-black`}>
                        {item.logo}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-bold text-white">{item.name}</p>
                        <p className="text-xs text-purple-400">{convert(item.price)} {selected.code}</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => updateQty(item.id, -1)}
                          className="grid size-7 place-items-center rounded-lg bg-white/10 text-white hover:bg-white/20"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-5 text-center text-sm font-bold text-white">{item.qty}</span>
                        <button
                          onClick={() => updateQty(item.id, 1)}
                          className="grid size-7 place-items-center rounded-lg bg-white/10 text-white hover:bg-white/20"
                        >
                          <Plus size={12} />
                        </button>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="grid size-7 place-items-center rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/35 mr-1"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {items.length > 1 && (
                    <button onClick={clear} className="text-xs text-white/30 hover:text-red-400 text-left transition-colors">
                      مسح السلة
                    </button>
                  )}
                </div>
              )}

              {/* Separator */}
              <div className="border-t border-white/8" />

              {/* Currency selector */}
              <div>
                <p className="mb-2 text-xs font-bold text-white/50 uppercase tracking-wider">العملة</p>
                <div className="relative" ref={currencyDropRef}>
                  <button
                    onClick={() => setCurrencyDropOpen(v => !v)}
                    className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white hover:bg-white/10"
                  >
                    <span>{selected.flag} {selected.code} — {selected.name}</span>
                    <ChevronDown size={14} className={`transition-transform ${currencyDropOpen ? "rotate-180" : ""}`} />
                  </button>
                  {currencyDropOpen && (
                    <div className="absolute left-0 right-0 top-full mt-1 z-10 rounded-xl border border-white/10 bg-[#12101a] shadow-xl">
                      <div className="flex items-center gap-2 border-b border-white/8 px-3 py-2">
                        <Search size={14} className="text-white/40" />
                        <input
                          value={currencySearch}
                          onChange={e => setCurrencySearch(e.target.value)}
                          placeholder="بحث..."
                          className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/30"
                          autoFocus
                        />
                      </div>
                      <div className="max-h-48 overflow-y-auto py-1">
                        {filteredCurrencies.map(c => (
                          <button
                            key={c.code}
                            onClick={() => { setSelected(c); setCurrencyDropOpen(false); setCurrencySearch(""); }}
                            className={`flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-white/8 ${selected.code === c.code ? "text-purple-400" : "text-white/80"}`}
                          >
                            <span>{c.flag}</span>
                            <span className="font-mono font-bold">{c.code}</span>
                            <span className="text-white/50">{c.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment method */}
              <div>
                <p className="mb-2 text-xs font-bold text-white/50 uppercase tracking-wider">طريقة الدفع</p>
                <div className="grid grid-cols-2 gap-2">
                  {/* WhatsApp payment */}
                  <button
                    onClick={() => setPayMethod("whatsapp")}
                    className={`flex min-h-20 items-center gap-2 rounded-xl border px-2.5 py-2 text-xs font-bold transition-all col-span-2 ${payMethod === "whatsapp" ? "border-[#25D366] bg-[#25D366]/15 text-[#25D366]" : "border-[#25D366]/30 bg-[#25D366]/5 text-white/70 hover:bg-[#25D366]/10"}`}
                  >
                    <span className="grid h-10 w-14 shrink-0 place-items-center text-2xl">💬</span>
                    <div className="text-right">
                      <p className="font-black">الدفع عبر واتساب</p>
                      <p className="text-[10px] text-white/40 font-normal mt-0.5">تواصل مع الوكيل + ادفع بأي وسيلة</p>
                    </div>
                  </button>
                  {/* Standard methods */}
                  {PAYMENT_METHODS.map(m => (
                    <button
                      key={m.id}
                      onClick={() => setPayMethod(m.id)}
                      className={`flex min-h-20 items-center gap-2 rounded-xl border px-2.5 py-2 text-xs font-bold transition-all ${payMethod === m.id ? "border-purple-500 bg-purple-500/15 text-white" : "border-white/10 bg-white/5 text-white/60 hover:bg-white/10"}`}
                    >
                      <span className="grid h-10 w-16 shrink-0 place-items-center">
                        <PaymentMethodImage method={m} />
                      </span>
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Discount code */}
              <div className="rounded-2xl border border-white/8 bg-white/3 p-3">
                <p className="mb-2.5 flex items-center gap-1.5 text-xs font-black text-white/50">
                  <Tag size={12} /> كود الخصم
                </p>

                {appliedDiscount ? (
                  /* Applied state */
                  <div
                    className="rounded-xl px-3 py-2.5"
                    style={{
                      background: "rgba(200,230,0,0.07)",
                      border: "1px solid rgba(200,230,0,0.25)",
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={14} className="text-lime-400 shrink-0" />
                        <span className="font-mono text-sm font-black text-lime-400">{appliedDiscount.code}</span>
                        <span
                          className="rounded-full px-2 py-0.5 text-[10px] font-black"
                          style={{ background: "rgba(200,230,0,0.15)", color: "#c8e600" }}
                        >
                          خصم {appliedDiscount.percent}%
                        </span>
                      </div>
                      <button
                        onClick={removeDiscount}
                        className="grid size-6 place-items-center rounded-lg bg-white/8 text-white/40 hover:bg-red-500/20 hover:text-red-400 transition-colors"
                        title="إلغاء الكود"
                      >
                        <X size={12} />
                      </button>
                    </div>
                    <p className="mt-1 text-[11px] text-lime-400/70">✅ تم تطبيق كود الخصم بنجاح</p>
                  </div>
                ) : (
                  /* Input state */
                  <div className="flex gap-2">
                    <input
                      value={dcInput}
                      onChange={(e) => { setDcInput(e.target.value.toUpperCase()); setDcError(""); }}
                      onKeyDown={(e) => e.key === "Enter" && applyDiscount()}
                      placeholder="أدخل الكود هنا..."
                      className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-white/25 focus:border-purple-500/50 font-mono tracking-wider"
                    />
                    <button
                      onClick={applyDiscount}
                      disabled={dcLoading || !dcInput.trim()}
                      className="shrink-0 rounded-xl px-3 py-2 text-xs font-black text-black transition-all hover:opacity-90 active:scale-95 disabled:opacity-40"
                      style={{ background: "linear-gradient(135deg, #c8e600, #a3bd00)" }}
                    >
                      {dcLoading ? <Loader2 size={14} className="animate-spin" /> : "تطبيق"}
                    </button>
                  </div>
                )}

                {dcError && (
                  <div className="mt-2 flex items-center gap-1.5 rounded-xl border border-red-500/20 bg-red-500/8 px-3 py-2 text-xs text-red-400">
                    <XCircle size={12} className="shrink-0" />
                    {dcError}
                  </div>
                )}
              </div>

              {/* Total and checkout */}
              <div className="mt-auto">
                <div
                  className="rounded-2xl p-4 mb-3 transition-all duration-300"
                  style={{
                    background: appliedDiscount ? "rgba(200,230,0,0.06)" : "rgba(255,255,255,0.05)",
                    border: appliedDiscount ? "1px solid rgba(200,230,0,0.2)" : "1px solid transparent",
                  }}
                >
                  {appliedDiscount && (
                    <>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs text-white/40">المجموع الأصلي</span>
                        <span className="text-sm text-white/35 line-through">
                          {convert(totalUSD)} {selected.code}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold" style={{ color: "#c8e600" }}>
                          خصم {appliedDiscount.percent}%
                        </span>
                        <span className="text-sm font-bold" style={{ color: "#c8e600" }}>
                          − {convert(discountAmount)} {selected.code}
                        </span>
                      </div>
                      <div className="mb-2 h-px bg-white/10" />
                    </>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/60">
                      {appliedDiscount ? "الإجمالي بعد الخصم" : "المجموع"}
                    </span>
                    <span
                      className={`text-xl font-black transition-all ${priceAnimating ? "scale-105" : "scale-100"}`}
                      style={{ color: appliedDiscount ? "#c8e600" : "white" }}
                    >
                      {convert(displayTotal || discountedTotal)} {selected.code}
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleCheckout}
                  disabled={items.length === 0}
                  className="neon-button w-full rounded-2xl py-4 font-black text-black disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  متابعة الدفع ←
                </button>
              </div>
            </div>
          ) : (
            /* Orders tab */
            <div className="flex flex-1 flex-col p-4 gap-4">
              {!savedEmail ? (
                <div className="flex flex-1 flex-col items-center justify-center gap-4">
                  <Clock size={40} className="text-purple-400/60" />
                  <p className="text-center text-sm text-white/60">أدخل بريدك الإلكتروني لتتبع طلباتك</p>
                  <form onSubmit={handleEmailSubmit} className="w-full flex flex-col gap-3">
                    <input
                      type="email"
                      value={emailInput}
                      onChange={e => setEmailInput(e.target.value)}
                      placeholder="بريدك الإلكتروني"
                      required
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-purple-500"
                    />
                    <button type="submit" className="neon-button w-full rounded-xl py-3 font-bold text-black">
                      تتبع طلباتي
                    </button>
                  </form>
                </div>
              ) : (
                <div className="flex flex-1 flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-white/40">{savedEmail}</p>
                    <button
                      onClick={() => { setSavedEmail(null); setOrders([]); try { localStorage.removeItem("gf_my_email"); } catch {} }}
                      className="text-xs text-red-400/70 hover:text-red-400"
                    >
                      تغيير
                    </button>
                  </div>
                  {ordersLoading && orders.length === 0 ? (
                    <div className="flex flex-1 items-center justify-center">
                      <div className="size-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="flex flex-1 flex-col items-center justify-center gap-3 py-10">
                      <Clock size={40} className="text-white/20" />
                      <p className="text-sm text-white/40">لا توجد طلبات بعد</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {orders.map(order => {
                        const s = STATUS_MAP[order.status] ?? { label: order.status, color: "text-white/60 bg-white/10" };
                        return (
                          <div key={order.id} className="rounded-2xl bg-white/5 p-4 border border-white/8">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <p className="text-sm font-bold text-white">{order.product_name}</p>
                              <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-bold ${s.color}`}>
                                {s.label}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-xs text-white/50">
                              <span>{order.product_price.toFixed(2)} USD</span>
                              <span>{new Date(order.created_at).toLocaleDateString("ar")}</span>
                            </div>
                          </div>
                        );
                      })}
                      {ordersLoading && (
                        <div className="flex justify-center py-2">
                          <div className="size-5 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
