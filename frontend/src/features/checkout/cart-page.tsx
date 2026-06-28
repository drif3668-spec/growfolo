"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Minus, Plus, Trash2, ShoppingBag, ChevronDown, Globe } from "lucide-react";

const CURRENCIES = [
  { code: "USD", flag: "🇺🇸", name: "دولار أمريكي" },
  { code: "EUR", flag: "🇪🇺", name: "يورو" },
  { code: "GBP", flag: "🇬🇧", name: "جنيه إسترليني" },
  { code: "DZD", flag: "🇩🇿", name: "دينار جزائري" },
  { code: "EGP", flag: "🇪🇬", name: "جنيه مصري" },
  { code: "SAR", flag: "🇸🇦", name: "ريال سعودي" },
  { code: "AED", flag: "🇦🇪", name: "درهم إماراتي" },
  { code: "MAD", flag: "🇲🇦", name: "درهم مغربي" },
  { code: "TND", flag: "🇹🇳", name: "دينار تونسي" },
  { code: "TRY", flag: "🇹🇷", name: "ليرة تركية" },
  { code: "JPY", flag: "🇯🇵", name: "ين ياباني" },
  { code: "CAD", flag: "🇨🇦", name: "دولار كندي" },
  { code: "AUD", flag: "🇦🇺", name: "دولار أسترالي" },
  { code: "CHF", flag: "🇨🇭", name: "فرنك سويسري" },
  { code: "CNY", flag: "🇨🇳", name: "يوان صيني" },
  { code: "INR", flag: "🇮🇳", name: "روبية هندية" },
  { code: "BRL", flag: "🇧🇷", name: "ريال برازيلي" },
  { code: "RUB", flag: "🇷🇺", name: "روبل روسي" },
  { code: "KWD", flag: "🇰🇼", name: "دينار كويتي" },
  { code: "QAR", flag: "🇶🇦", name: "ريال قطري" },
  { code: "OMR", flag: "🇴🇲", name: "ريال عُماني" },
  { code: "JOD", flag: "🇯🇴", name: "دينار أردني" },
  { code: "LYD", flag: "🇱🇾", name: "دينار ليبي" },
  { code: "MXN", flag: "🇲🇽", name: "بيزو مكسيكي" },
  { code: "NGN", flag: "🇳🇬", name: "نيرة نيجيرية" },
  { code: "ZAR", flag: "🇿🇦", name: "راند جنوب أفريقي" },
  { code: "PKR", flag: "🇵🇰", name: "روبية باكستانية" },
  { code: "BDT", flag: "🇧🇩", name: "تاكا بنغلاديشي" },
];

const MOCK_CART = [
  { id: "p1", name: "ChatGPT Plus", subtitle: "اشتراك شهري", price: 5.99, qty: 1, color: "from-emerald-400 to-teal-600", logo: "◎" },
  { id: "p2", name: "Netflix Premium", subtitle: "اشتراك شهري", price: 4.99, qty: 1, color: "from-red-800 to-red-600", logo: "▶" },
  { id: "p3", name: "Canva Pro", subtitle: "اشتراك شهري", price: 2.99, qty: 2, color: "from-cyan-400 to-blue-700", logo: "Cv" },
];

type CartItem = typeof MOCK_CART[0];

export function CartPage() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>(MOCK_CART);
  const [currency, setCurrency] = useState(CURRENCIES[0]);
  const [rates, setRates] = useState<Record<string, number>>({ USD: 1 });
  const [ratesLoading, setRatesLoading] = useState(false);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setRatesLoading(true);
    fetch("https://api.exchangerate-api.com/v4/latest/USD")
      .then((r) => r.json())
      .then((data) => setRates(data.rates ?? { USD: 1 }))
      .catch(() => {})
      .finally(() => setRatesLoading(false));
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setCurrencyOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const toLocal = (usd: number) => (usd * (rates[currency.code] ?? 1)).toFixed(2);

  const changeQty = (id: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((item) => (item.id === id ? { ...item, qty: item.qty + delta } : item))
        .filter((item) => item.qty > 0)
    );
  };

  const removeItem = (id: string) => setItems((prev) => prev.filter((i) => i.id !== id));

  const subtotalUSD = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const filteredCurrencies = CURRENCIES.filter(
    (c) =>
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.name.includes(search)
  );

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <ShoppingBag size={64} className="text-white/20 mb-5" />
        <h2 className="text-2xl font-black text-white">السلة فارغة</h2>
        <p className="mt-2 text-white/50">أضف منتجات للمتابعة</p>
        <Link href="/" className="neon-button mt-6 inline-block rounded-2xl px-8 py-3 font-bold text-black">
          تصفح المنتجات
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      {/* Items list */}
      <div className="glass-panel rounded-3xl p-5">
        <h2 className="mb-4 text-lg font-black text-white">منتجاتك ({items.length})</h2>
        <div className="grid gap-3">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-4 rounded-2xl border border-white/6 bg-white/3 p-4">
              <div className={`grid size-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${item.color} text-lg font-black text-white shadow-[0_0_18px_rgba(168,85,247,0.35)]`}>
                {item.logo}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-white truncate">{item.name}</h3>
                <p className="text-xs text-white/45">{item.subtitle}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => changeQty(item.id, -1)}
                  className="grid size-7 place-items-center rounded-lg bg-white/8 text-white hover:bg-white/15"
                >
                  <Minus size={13} />
                </button>
                <span className="w-6 text-center text-sm font-bold text-white">{item.qty}</span>
                <button
                  onClick={() => changeQty(item.id, 1)}
                  className="grid size-7 place-items-center rounded-lg bg-white/8 text-white hover:bg-white/15"
                >
                  <Plus size={13} />
                </button>
              </div>
              <div className="text-right">
                <p className="font-black text-white">
                  {toLocal(item.price * item.qty)} {currency.code}
                </p>
                <p className="text-xs text-white/35 line-through">
                  {toLocal(item.price * item.qty * 1.4)} {currency.code}
                </p>
              </div>
              <button
                onClick={() => removeItem(item.id)}
                className="grid size-8 place-items-center rounded-xl text-red-400/60 hover:bg-red-500/10 hover:text-red-400"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Summary + Currency */}
      <div className="flex flex-col gap-4">
        {/* Currency Selector */}
        <div className="glass-panel rounded-3xl p-5" ref={dropdownRef}>
          <div className="mb-3 flex items-center gap-2">
            <Globe size={16} className="text-purple-400" />
            <span className="text-sm font-bold text-white">عملة الدفع</span>
            {ratesLoading && <span className="text-xs text-white/40">جارٍ التحديث...</span>}
          </div>
          <button
            onClick={() => setCurrencyOpen((p) => !p)}
            className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white hover:bg-white/8 transition-colors"
          >
            <span className="flex items-center gap-2">
              <span className="text-lg">{currency.flag}</span>
              <span className="font-bold">{currency.code}</span>
              <span className="text-white/50">— {currency.name}</span>
            </span>
            <ChevronDown
              size={16}
              className={`text-white/50 transition-transform ${currencyOpen ? "rotate-180" : ""}`}
            />
          </button>

          {currencyOpen && (
            <div className="mt-2 overflow-hidden rounded-2xl border border-white/10 bg-[#0d0b18]">
              <div className="border-b border-white/8 p-2">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-xl bg-white/5 px-3 py-2 text-xs text-white outline-none placeholder:text-white/35"
                  placeholder="ابحث عن عملة..."
                  autoFocus
                />
              </div>
              <div className="max-h-52 overflow-y-auto">
                {filteredCurrencies.map((c) => (
                  <button
                    key={c.code}
                    onClick={() => {
                      setCurrency(c);
                      setCurrencyOpen(false);
                      setSearch("");
                    }}
                    className={`flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-white/6 ${
                      currency.code === c.code ? "bg-purple-600/15 text-purple-300" : "text-white/75"
                    }`}
                  >
                    <span className="text-base">{c.flag}</span>
                    <span className="font-bold w-10">{c.code}</span>
                    <span className="text-white/50">{c.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="glass-panel rounded-3xl p-5">
          <h2 className="mb-4 text-lg font-black text-white">ملخص الطلب</h2>
          <div className="grid gap-2.5 text-sm">
            <div className="flex justify-between text-white/65">
              <span>المجموع الجزئي</span>
              <span>{toLocal(subtotalUSD)} {currency.code}</span>
            </div>
            <div className="flex justify-between text-white/65">
              <span>الخصم</span>
              <span className="text-lime-400">-{toLocal(subtotalUSD * 0.3)} {currency.code}</span>
            </div>
            <div className="flex justify-between text-white/65">
              <span>التوصيل</span>
              <span className="text-lime-400">مجاني</span>
            </div>
            <div className="mt-2 border-t border-white/10 pt-2.5 flex justify-between text-base font-black text-white">
              <span>الإجمالي</span>
              <span>{toLocal(subtotalUSD * 0.7)} {currency.code}</span>
            </div>
          </div>

          <button
            onClick={() => router.push("/checkout/payment")}
            className="neon-button mt-5 w-full rounded-2xl py-4 font-black text-black text-base"
          >
            إتمام الطلب →
          </button>

          <p className="mt-3 text-center text-xs text-white/30">
            دفع آمن ومشفر بالكامل 🔒
          </p>
        </div>
      </div>
    </div>
  );
}
