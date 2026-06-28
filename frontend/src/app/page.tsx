import type { LucideIcon } from "lucide-react";
import {
  Brain,
  Code2,
  Cuboid,
  Gamepad2,
  Headphones,
  Mail,
  Medal,
  PenTool,
  Play,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Star,
  Users,
  Wrench,
  Zap
} from "lucide-react";
import { HeroScene } from "@/components/three/hero-scene";
import { SiteHeader } from "@/components/layout/site-header";

const features = [
  { title: "تسليم فوري", text: "تسليم الخدمة بسرعة 1 دقيقة", icon: Zap },
  { title: "ضمان كامل", text: "ضمان الاسترجاع الحق حتى 35 يوم", icon: ShieldCheck },
  { title: "دعم 24/7", text: "فريق دعم على مدار الساعة", icon: Headphones },
  { title: "أسعار مميزة", text: "أفضل الأسعار في السوق", icon: Medal }
];

const categories = [
  { title: "الذكاء الاصطناعي", icon: Brain },
  { title: "الأدوات الرقمية", icon: Wrench },
  { title: "الترفيه والمشاهدة", icon: Play },
  { title: "الإبداع والتصميم", icon: PenTool },
  { title: "البرامج والتطبيقات", icon: Code2 },
  { title: "الألعاب والبطاقات", icon: Gamepad2 }
];

const products = [
  { name: "ChatGPT Plus", logo: "◎", discount: "-40%", price: "$5.99", oldPrice: "$9.99", buyers: "12K", color: "from-emerald-400 to-teal-600" },
  { name: "Adobe Creative Cloud", logo: "∞", discount: "-35%", price: "$34.99", oldPrice: "$53.99", buyers: "8K", color: "from-pink-500 via-orange-400 to-cyan-400" },
  { name: "Netflix Premium", logo: "▶", discount: "-50%", price: "$4.99", oldPrice: "$9.99", buyers: "15K", color: "from-red-800 to-red-600" },
  { name: "Canva Pro", logo: "Canva", discount: "-40%", price: "$2.99", oldPrice: "$4.99", buyers: "6K", color: "from-cyan-400 to-blue-700" },
  { name: "Claude Pro", logo: "✳", discount: "-30%", price: "$19,00", oldPrice: "$29.90", buyers: "18K", color: "from-purple-500 to-fuchsia-700" }
];

const stats = [
  { value: "+369,784", label: "عميل سعيد", icon: Users },
  { value: "5/5", label: "تقييم العملاء", icon: Star },
  { value: "+10,000", label: "منتج رقمي", icon: Cuboid },
  { value: "+99,9%", label: "معدل رضا العملاء", icon: ShieldCheck }
];

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#050508] text-white">
      <SiteHeader />
      <div className="mx-auto max-w-7xl px-4 pb-10">
        <HeroSection />
        <FeatureStrip />
        <CategoriesSection />
        <ProductsSection />
        <StatsStrip />
        <NewsletterSection />
        <Footer />
      </div>
    </main>
  );
}

function HeroSection() {
  return (
    <section className="grid min-h-[520px] items-center gap-8 py-8 md:grid-cols-[1.02fr_0.98fr] md:py-12">
      <div className="order-2 md:order-none md:col-start-2 md:row-start-1">
        <HeroScene />
      </div>
      <div className="order-1 text-right md:order-none md:col-start-1 md:row-start-1">
        <h1 className="text-5xl font-black leading-[1.25] text-white md:text-7xl">
          كل ما تحتاجه في
          <span className="neon-text mt-1 block">مكان واحد</span>
        </h1>
        <p className="mt-5 max-w-xl text-lg leading-9 text-white/70">
          اشتراكات أصلية، أدوات ذكية. خدمات رقمية بأسعار تنافسية وخدمة موثوقة
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <a href="#products" className="neon-button inline-flex items-center gap-3 rounded-2xl px-7 py-4 font-bold text-black">
            تصفح المنتجات
            <ShoppingBag size={20} />
          </a>
          <a href="#about" className="inline-flex items-center gap-3 rounded-2xl border border-white/15 bg-black/45 px-7 py-4 font-bold text-white shadow-[0_0_24px_rgba(168,85,247,0.16)]">
            تعرف علينا
            <span className="grid size-7 place-items-center rounded-full border border-white/30"><Play size={14} fill="white" /></span>
          </a>
        </div>
      </div>
    </section>
  );
}

function FeatureStrip() {
  return (
    <section className="glass-panel grid gap-4 rounded-3xl p-5 md:grid-cols-4">
      {features.map((feature) => (
        <IconBlock key={feature.title} {...feature} />
      ))}
    </section>
  );
}

function CategoriesSection() {
  return (
    <section className="py-10">
      <SectionTitle title="تصفح الأقسام" />
      <div className="relative mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
        {categories.map((category) => (
          <article key={category.title} className="glass-panel group grid min-h-40 place-items-center rounded-3xl p-5 text-center">
            <category.icon className="mb-5 size-14 text-purple-400 drop-shadow-[0_0_12px_rgba(168,85,247,0.75)] group-hover:text-lime-400" />
            <h3 className="font-bold text-white">{category.title}</h3>
          </article>
        ))}
        <button className="absolute -left-3 top-1/2 hidden size-11 -translate-y-1/2 place-items-center rounded-full border border-white/10 bg-white/5 text-3xl text-white lg:grid">›</button>
      </div>
    </section>
  );
}

function ProductsSection() {
  return (
    <section id="products" className="pb-10">
      <SectionTitle title="أحدث المنتجات 🔥" />
      <div className="relative mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
        {products.map((product) => (
          <article key={product.name} className="glass-panel relative overflow-hidden rounded-3xl p-4">
            <span className="absolute right-3 top-3 rounded-full bg-purple-600 px-2.5 py-1 text-xs font-bold text-white">{product.discount}</span>
            <div className={`mx-auto mt-6 grid size-24 place-items-center rounded-3xl bg-gradient-to-br ${product.color} text-3xl font-black shadow-[0_0_28px_rgba(168,85,247,0.45)]`}>
              {product.logo}
            </div>
            <h3 className="mt-5 text-center text-sm font-bold text-white">{product.name}</h3>
            <p className="mt-2 text-center text-xs leading-5 text-white/70">اشتراك رسمي<br />تسليم فوري</p>
            <div className="mt-4 flex items-end justify-between gap-2">
              <span className="text-2xl font-black text-white">{product.price}</span>
              <span className="text-sm text-white/40 line-through">{product.oldPrice}</span>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <span className="flex items-center gap-1 text-xs text-yellow-400"><Star size={14} fill="currentColor" /> 4.9 ({product.buyers})</span>
              <button className="grid size-9 place-items-center rounded-xl bg-purple-700 text-white shadow-[0_0_18px_rgba(168,85,247,0.6)]" aria-label="إضافة للسلة">
                <ShoppingCart size={17} />
              </button>
            </div>
          </article>
        ))}
        <button className="absolute -right-3 top-1/2 hidden size-11 -translate-y-1/2 place-items-center rounded-full border border-white/10 bg-white/5 text-3xl text-white lg:grid">‹</button>
        <button className="absolute -left-3 top-1/2 hidden size-11 -translate-y-1/2 place-items-center rounded-full border border-white/10 bg-white/5 text-3xl text-white lg:grid">›</button>
      </div>
    </section>
  );
}

function StatsStrip() {
  return (
    <section className="glass-panel grid gap-5 rounded-3xl p-6 md:grid-cols-[repeat(4,1fr)_1.35fr]">
      {stats.map((stat) => (
        <div key={stat.label} className="flex items-center gap-4">
          <stat.icon className="size-11 text-lime-400 drop-shadow-[0_0_12px_rgba(132,204,22,0.75)]" />
          <div>
            <strong className="block text-2xl">{stat.value}</strong>
            <span className="text-sm text-white/70">{stat.label}</span>
          </div>
        </div>
      ))}
      <div className="flex items-center gap-4 border-white/10 md:border-r md:pr-5">
        <div className="grid size-16 place-items-center rounded-2xl bg-white text-3xl font-black text-purple-600">A</div>
        <div className="text-sm leading-7 text-white/75">موثّق في منصة الأعمال<br />Saudi Business Center</div>
      </div>
    </section>
  );
}

function NewsletterSection() {
  return (
    <section className="glass-panel my-8 grid items-center gap-5 rounded-3xl p-6 md:grid-cols-[1fr_1.1fr_auto]">
      <div>
        <h2 className="text-2xl font-black">كن أول من يعرف!</h2>
        <p className="mt-2 text-sm text-white/65">اشترك بنشرتنا البريدية ليصلك كل جديد</p>
      </div>
      <label className="flex min-h-14 items-center gap-3 rounded-2xl border border-white/10 bg-black/45 px-4 text-white/55">
        <Mail size={21} className="text-purple-400" />
        <input className="w-full bg-transparent outline-none placeholder:text-white/45" placeholder="ادخل بريدك الإلكتروني" type="email" />
      </label>
      <button className="neon-button min-h-14 rounded-2xl px-9 font-black text-black">اشترك الآن</button>
    </section>
  );
}

function Footer() {
  return (
    <footer id="about" className="border-t border-purple-500/15 py-8">
      <div className="grid gap-8 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <div className="pixel-logo text-3xl font-black">
            <span className="text-purple-500">GROW</span><span className="text-lime-400">FOLO</span>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-8 text-white/65">
            متجر رقمي يقدم لك أفضل الخدمات والاشتراكات الأصلية، كل ما تحتاج لتجربة رقمية متكاملة ومتميزة
          </p>
          <div className="mt-5 flex gap-2">
            {["f", "▶", "♪", "X", "◎"].map((item) => (
              <span key={item} className="grid size-9 place-items-center rounded-full bg-white/8 text-sm text-white">{item}</span>
            ))}
          </div>
        </div>
        <FooterColumn title="روابط سريعة" links={["المدونة", "الصفحة التعريفية", "سياسة الخصوصية", "الاستبدال والاسترجاع"]} />
        <FooterColumn title="خدمة العملاء" links={["تواصل معنا", "الأسئلة الشائعة", "تتبع الطلب", "شروط الخدمة"]} />
        <div>
          <h3 className="mb-4 font-black">طرق الدفع</h3>
          <div className="grid max-w-48 grid-cols-2 gap-3">
            {["Pay", "VISA", "VISA", "Mastercard"].map((item, index) => (
              <span key={`${item}-${index}`} className="rounded-lg bg-white px-3 py-2 text-center text-sm font-black text-black">{item}</span>
            ))}
          </div>
        </div>
      </div>
      <p className="mt-8 text-center text-xs text-white/35">جميع الحقوق محفوظة GrowFolo © 2026</p>
    </footer>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <h2 className="text-2xl font-black text-white md:text-3xl">{title}</h2>
      <button className="rounded-2xl bg-white/5 px-5 py-2 text-sm font-bold text-white">عرض الكل</button>
    </div>
  );
}

function IconBlock({ title, text, icon: Icon }: { title: string; text: string; icon: LucideIcon }) {
  return (
    <article className="flex items-center gap-4 border-white/10 md:border-l md:pl-4 last:border-l-0">
      <div className="grid size-16 shrink-0 place-items-center rounded-2xl border border-purple-500/25 bg-purple-500/10">
        <Icon className="size-9 text-purple-400 drop-shadow-[0_0_12px_rgba(168,85,247,0.8)]" />
      </div>
      <div>
        <h3 className="font-black text-white">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-white/65">{text}</p>
      </div>
    </article>
  );
}

function FooterColumn({ title, links }: { title: string; links: string[] }) {
  return (
    <div>
      <h3 className="mb-4 font-black">{title}</h3>
      <ul className="grid gap-3 text-sm text-white/62">
        {links.map((link) => (
          <li key={link}>{link}</li>
        ))}
      </ul>
    </div>
  );
}
