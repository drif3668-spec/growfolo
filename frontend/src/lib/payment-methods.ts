export type PaymentMethod = {
  id: string;
  label: string;
  image: string;
  color: string;
  bg: string;
  border: string;
  description: string;
  fields: { label: string; value: string }[];
  steps: string[];
};

export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: "usdt",
    label: "USDT TRC20",
    image: "/payment-methods/usdt.png",
    color: "#26a17b",
    bg: "rgba(38,161,123,0.12)",
    border: "rgba(38,161,123,0.35)",
    description: "تحويل USDT عبر شبكة TRON",
    fields: [
      { label: "الشبكة", value: "TRC20 (TRON)" },
      { label: "عنوان المحفظة", value: "TXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX" },
    ],
    steps: ["افتح محفظتك (Trust Wallet / Binance)", "أرسل USDT على شبكة TRC20 فقط", "انسخ hash المعاملة وأرسل الوصل"],
  },
  {
    id: "bnb",
    label: "BNB BEP20",
    image: "/payment-methods/bnb.png",
    color: "#f3ba2f",
    bg: "rgba(243,186,47,0.10)",
    border: "rgba(243,186,47,0.30)",
    description: "تحويل BNB عبر Binance Smart Chain",
    fields: [
      { label: "الشبكة", value: "BEP20 (BSC)" },
      { label: "عنوان المحفظة", value: "0xXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX" },
    ],
    steps: ["افتح محفظتك (Trust Wallet / MetaMask)", "أرسل BNB على شبكة BSC فقط", "أرسل hash المعاملة"],
  },
  {
    id: "baridimob",
    label: "BaridiMob",
    image: "/payment-methods/baridimob.png",
    color: "#f5c518",
    bg: "rgba(245,197,24,0.10)",
    border: "rgba(245,197,24,0.28)",
    description: "تحويل عبر تطبيق BaridiMob",
    fields: [
      { label: "رقم CCP", value: "00123456789 — مفتاح: 12" },
      { label: "الاسم", value: "Growfolo Store" },
    ],
    steps: ["افتح تطبيق BaridiMob", "اختر تحويل CCP وأدخل الرقم والمفتاح", "أرسل صورة التأكيد"],
  },
  {
    id: "mobilis",
    label: "Flexy Mobilis",
    image: "/payment-methods/mobilis.png",
    color: "#22c55e",
    bg: "rgba(34,197,94,0.10)",
    border: "rgba(34,197,94,0.28)",
    description: "دفع عبر Flexy Mobilis",
    fields: [{ label: "رقم Mobilis", value: "07XXXXXXXX" }],
    steps: ["اشتر رصيد Flexy من نقطة البيع", "أرسل الرصيد على الرقم أعلاه", "أرسل إثبات الإرسال"],
  },
  {
    id: "instapay",
    label: "InstaPay",
    image: "/payment-methods/instapay.png",
    color: "#a855f7",
    bg: "rgba(168,85,247,0.10)",
    border: "rgba(168,85,247,0.28)",
    description: "تحويل فوري عبر InstaPay",
    fields: [{ label: "معرف InstaPay", value: "growfolo@instapay" }],
    steps: ["افتح تطبيق InstaPay", "ابحث عن المعرف أعلاه وأدخل المبلغ", "أرسل صورة الإيصال"],
  },
];

export const PAYMENT_METHOD_MAP = Object.fromEntries(PAYMENT_METHODS.map((method) => [method.id, method])) as Record<string, PaymentMethod>;

