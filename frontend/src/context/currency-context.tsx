"use client";
import { createContext, useContext, useEffect, useState } from "react";

export type Currency = { code: string; flag: string; name: string };

export const CURRENCIES: Currency[] = [
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
  { code: "KWD", flag: "🇰🇼", name: "دينار كويتي" },
  { code: "QAR", flag: "🇶🇦", name: "ريال قطري" },
  { code: "OMR", flag: "🇴🇲", name: "ريال عُماني" },
  { code: "JOD", flag: "🇯🇴", name: "دينار أردني" },
  { code: "LYD", flag: "🇱🇾", name: "دينار ليبي" },
  { code: "MXN", flag: "🇲🇽", name: "بيزو مكسيكي" },
  { code: "NGN", flag: "🇳🇬", name: "نيرة نيجيرية" },
  { code: "ZAR", flag: "🇿🇦", name: "راند جنوب أفريقي" },
  { code: "PKR", flag: "🇵🇰", name: "روبية باكستانية" },
  { code: "RUB", flag: "🇷🇺", name: "روبل روسي" },
  { code: "BDT", flag: "🇧🇩", name: "تاكا بنغلاديشي" },
];

interface CurrencyCtx {
  currencies: Currency[];
  selected: Currency;
  setSelected: (c: Currency) => void;
  rates: Record<string, number>;
  convert: (usd: number) => string;
  loading: boolean;
}

const Ctx = createContext<CurrencyCtx | null>(null);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [selected, setSelectedState] = useState<Currency>(CURRENCIES[0]);
  const [rates, setRates] = useState<Record<string, number>>({ USD: 1 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("gf_currency");
      if (saved) { const c = CURRENCIES.find(x => x.code === saved); if (c) setSelectedState(c); }
    } catch {}
    setLoading(true);
    fetch("https://api.exchangerate-api.com/v4/latest/USD")
      .then(r => r.json())
      .then(d => setRates(d.rates ?? { USD: 1 }))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const setSelected = (c: Currency) => {
    setSelectedState(c);
    localStorage.setItem("gf_currency", c.code);
  };

  const convert = (usd: number) => {
    const rate = rates[selected.code] ?? 1;
    return (usd * rate).toFixed(2);
  };

  return (
    <Ctx.Provider value={{ currencies: CURRENCIES, selected, setSelected, rates, convert, loading }}>
      {children}
    </Ctx.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCurrency must be inside CurrencyProvider");
  return ctx;
}
