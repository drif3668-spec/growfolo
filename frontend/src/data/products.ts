export type Product = {
  id: string;
  name: string;
  subtitle: string;
  logo: string;
  price: number;
  oldPrice: number;
  discount: string;
  buyers: string;
  color: string;          // Tailwind gradient classes
  accentColor: string;    // hex for dynamic CSS
  description: string;
  features: string[];
  specs: { label: string; value: string }[];
  badge?: string;
  category: string;
  rating: number;
  reviews: number;
  partners?: string[];
};

export const PRODUCTS: Product[] = [
  {
    id: "claude-opus-48-lifetime",
    name: "Claude Opus 4.8",
    subtitle: "Lifetime Cloud Access",
    logo: "✳",
    price: 150,
    oldPrice: 499,
    discount: "-70%",
    buyers: "18K",
    color: "from-green-600 via-emerald-700 to-green-900",
    accentColor: "#22c55e",
    description:
      "امتلك أقوى بيئة برمجة سحابية مدى الحياة. ادفع مرة واحدة واستخدم Claude Opus 4.8 للأبد بدون رسوم شهرية.",
    features: [
      "أحدث نموذج Claude Opus 4.8 من Anthropic",
      "1,000,000 Context Window",
      "2 TB مساحة سحابية خاصة",
      "ربط عبر API KEY خاص",
      "بيئة برمجة متكاملة داخل VS Code",
      "دعم إضافة Continue بالكامل",
      "سرعة واستقرار لا مثيل لهما",
      "تحديثات مستمرة مجانية للأبد",
    ],
    specs: [
      { label: "Context Window", value: "1,000,000" },
      { label: "Cloud Storage", value: "2 TB" },
      { label: "API Access", value: "Private KEY" },
      { label: "Performance", value: "Ultra Fast" },
      { label: "Privacy", value: "100% Private" },
      { label: "Access", value: "Lifetime ∞" },
    ],
    badge: "LIFETIME DEAL",
    category: "AI",
    rating: 4.9,
    reviews: 234,
    partners: ["Anthropic", "OpenRouter"],
  },
  {
    id: "chatgpt-plus",
    name: "ChatGPT Plus",
    subtitle: "GPT-4o Monthly Access",
    logo: "◎",
    price: 5.99,
    oldPrice: 9.99,
    discount: "-40%",
    buyers: "12K",
    color: "from-emerald-400 to-teal-600",
    accentColor: "#10b981",
    description:
      "اشترك في ChatGPT Plus واستمتع بوصول كامل لنموذج GPT-4o مع سرعة أعلى وإمكانيات حصرية.",
    features: [
      "وصول كامل لنموذج GPT-4o",
      "سرعة استجابة أعلى بـ 3x",
      "إنشاء الصور بـ DALL-E 3",
      "تحميل الملفات والتحليل",
      "بحث ذكي على الإنترنت",
      "تشغيل الكود Python",
      "إنشاء GPTs مخصصة",
    ],
    specs: [
      { label: "النموذج", value: "GPT-4o" },
      { label: "الرسائل", value: "غير محدودة" },
      { label: "إنشاء صور", value: "DALL-E 3" },
      { label: "البحث", value: "ويب + ملفات" },
    ],
    badge: "الأكثر مبيعاً",
    category: "AI",
    rating: 4.8,
    reviews: 1240,
  },
  {
    id: "cursor-pro",
    name: "Cursor Pro",
    subtitle: "AI-Powered Code Editor",
    logo: "⚡",
    price: 8.99,
    oldPrice: 19.99,
    discount: "-55%",
    buyers: "6K",
    color: "from-blue-500 to-violet-700",
    accentColor: "#6366f1",
    description:
      "محرر الكود الذكي الذي يفهم مشروعك بالكامل ويكتب الكود معك في الوقت الفعلي.",
    features: [
      "مساعد AI متكامل في المحرر",
      "فهم كامل لسياق المشروع",
      "إكمال تلقائي ذكي متعدد الأسطر",
      "تصحيح الأخطاء بالذكاء الاصطناعي",
      "دعم جميع لغات البرمجة",
      "تكامل كامل مع Git",
      "دعم Claude + GPT-4 + Gemini",
    ],
    specs: [
      { label: "نماذج AI", value: "Claude/GPT/Gemini" },
      { label: "اللغات", value: "جميع اللغات" },
      { label: "التكامل", value: "VS Code مشابه" },
      { label: "الخصوصية", value: "100% محلي" },
    ],
    badge: "🔥 HOT",
    category: "Dev Tools",
    rating: 4.9,
    reviews: 892,
  },
  {
    id: "adobe-creative-cloud",
    name: "Adobe Creative",
    subtitle: "All Apps Suite",
    logo: "∞",
    price: 34.99,
    oldPrice: 53.99,
    discount: "-35%",
    buyers: "8K",
    color: "from-pink-500 via-orange-400 to-cyan-400",
    accentColor: "#f97316",
    description:
      "احصل على أكثر من 20 تطبيقاً إبداعياً من Adobe بسعر واحد. Photoshop وIllustrator وPremiere Pro وأكثر.",
    features: [
      "+20 تطبيق إبداعي من Adobe",
      "Photoshop + Illustrator + Premiere",
      "100GB مساحة سحابية Adobe",
      "Adobe Fonts - مئات الخطوط",
      "Adobe Stock - صور ومقاطع مجانية",
      "Firefly AI Generative Fill",
      "تحديثات مستمرة تلقائية",
    ],
    specs: [
      { label: "التطبيقات", value: "+20 تطبيق" },
      { label: "التخزين", value: "100 GB Cloud" },
      { label: "Fonts", value: "Adobe Fonts" },
      { label: "AI", value: "Firefly Gen AI" },
    ],
    badge: "-35%",
    category: "Creative",
    rating: 4.7,
    reviews: 567,
  },
  {
    id: "netflix-premium",
    name: "Netflix Premium",
    subtitle: "4K Ultra HD Streaming",
    logo: "▶",
    price: 4.99,
    oldPrice: 9.99,
    discount: "-50%",
    buyers: "15K",
    color: "from-red-900 via-red-700 to-red-600",
    accentColor: "#ef4444",
    description:
      "استمتع بآلاف الأفلام والمسلسلات بجودة 4K Ultra HD على أي جهاز وفي أي مكان.",
    features: [
      "جودة 4K Ultra HD + HDR",
      "صوت Dolby Atmos محيطي",
      "4 شاشات في نفس الوقت",
      "تنزيل للمشاهدة بدون إنترنت",
      "+10,000 فيلم ومسلسل",
      "محتوى Netflix Originals حصري",
      "يعمل على جميع الأجهزة",
    ],
    specs: [
      { label: "الجودة", value: "4K Ultra HD" },
      { label: "الشاشات", value: "4 متزامنة" },
      { label: "التنزيل", value: "نعم، أوفلاين" },
      { label: "الأجهزة", value: "جميع الأجهزة" },
    ],
    badge: "-50%",
    category: "Entertainment",
    rating: 4.8,
    reviews: 3421,
  },
];
