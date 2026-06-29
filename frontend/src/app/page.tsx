"use client";
import type { LucideIcon } from "lucide-react";
import {
  Brain, Code2, Eye, Gamepad2, Headphones, Mail, Medal,
  PenTool, Play, ShieldCheck, ShoppingBag, ShoppingCart, Star,
  Users, Wrench, Zap, BadgeCheck, Globe, Rocket
} from "lucide-react";
import { HeroScene } from "@/components/three/hero-scene";
import { SiteHeader } from "@/components/layout/site-header";
import { PaymentMethodImage } from "@/components/payments/payment-method-image";
import { PAYMENT_METHODS } from "@/lib/payment-methods";
import { ReviewsCarousel } from "@/components/sections/reviews-carousel";
import { BannerCarousel } from "@/components/sections/banner-carousel";
import { AdsShowcase } from "@/components/sections/ads-showcase";
import { AdsSectionSlider } from "@/components/sections/ads-section-slider";
import { useCart } from "@/context/cart-context";
import { PRODUCTS } from "@/data/products";

const features = [
  { title: "تسليم فوري", text: "تسليم الخدمة بسرعة 1 دقيقة", icon: Zap },
  { title: "ضمان كامل", text: "ضمان الاسترجاع الحق حتى 35 يوم", icon: ShieldCheck },
  { title: "دعم 24/7", text: "فريق دعم على مدار الساعة", icon: Headphones },
  { title: "أسعار مميزة", text: "أفضل الأسعار في السوق", icon: Medal },
];

const categories = [
  { title: "الذكاء الاصطناعي", icon: Brain },
  { title: "الأدوات الرقمية", icon: Wrench },
  { title: "الترفيه والمشاهدة", icon: Play },
  { title: "الإبداع والتصميم", icon: PenTool },
  { title: "البرامج والتطبيقات", icon: Code2 },
  { title: "الألعاب والبطاقات", icon: Gamepad2 },
];

const products = PRODUCTS.map(p => ({
  id: p.id, name: p.name, logo: p.logo, discount: p.discount,
  price: `$${p.price}`, price_num: p.price, oldPrice: `$${p.oldPrice}`,
  buyers: p.buyers, color: p.color, rating: p.rating,
}));

const AI_PACKAGE_IDS = ["claude-pro-yearly", "claude-max-5x-yearly", "claude-max-20x-yearly"];
const latestProducts = products.filter((p) => !AI_PACKAGE_IDS.includes(p.id));
const aiPackageProducts = products.filter((p) => AI_PACKAGE_IDS.includes(p.id));

const globalStats = [
  { value: "+250,000", label: "عميل سعيد", icon: Users },
  { value: "4.98 ⭐", label: "تقييم العملاء", icon: Star },
  { value: "+650,000", label: "طلب مكتمل", icon: Rocket },
  { value: "+90", label: "دولة حول العالم", icon: Globe },
];

const BRANDS = [
  { name: "ChatGPT", emoji: "🤖" },
  { name: "Claude", emoji: "✳" },
  { name: "Gemini", emoji: "♊" },
  { name: "Perplexity", emoji: "🔵" },
  { name: "Midjourney", emoji: "🎨" },
  { name: "Cursor", emoji: "⚡" },
  { name: "GitHub Copilot", emoji: "🐙" },
  { name: "Canva", emoji: "🖌" },
  { name: "Netflix", emoji: "▶" },
  { name: "Spotify", emoji: "🎵" },
  { name: "Adobe", emoji: "🅰" },
  { name: "ElevenLabs", emoji: "🔊" },
];

function AddToCartBtn({ product }: { product: { id: string; name: string; price_num: number; logo: string; color: string } }) {
  const { addItem } = useCart();
  return (
    <button
      onClick={() => addItem({ id: product.id, name: product.name, price: product.price_num, logo: product.logo, color: product.color })}
      className="grid size-9 place-items-center rounded-xl bg-purple-700 text-white shadow-[0_0_18px_rgba(168,85,247,0.6)] hover:scale-110 transition-transform"
      aria-label="إضافة للسلة"
    >
      <ShoppingCart size={17} />
    </button>
  );
}

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#050508] text-white">
      <SiteHeader />
      <BannerCarousel />
      <AdsShowcase />
      <div className="mx-auto max-w-7xl px-4 pb-10">
        <HeroSection />
        <FeatureStrip />
        <CategoriesSection />
        <ProductsSection />
        <AiPackagesSection />
        <StatsSection />
        <ReviewsCarousel />
        <TrustSection />
        <BrandsStrip />
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
            تصفح المنتجات <ShoppingBag size={20} />
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
      {features.map((f) => <IconBlock key={f.title} {...f} />)}
    </section>
  );
}

function CategoriesSection() {
  return (
    <section className="py-10">
      <SectionTitle title="تصفح الأقسام" />
      <div className="relative mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
        {categories.map((c) => (
          <article key={c.title} className="glass-panel group grid min-h-40 place-items-center rounded-3xl p-5 text-center">
            <c.icon className="mb-5 size-14 text-purple-400 drop-shadow-[0_0_12px_rgba(168,85,247,0.75)] group-hover:text-lime-400" />
            <h3 className="font-bold text-white">{c.title}</h3>
          </article>
        ))}
      </div>
    </section>
  );
}

function ProductsSection() {
  return (
    <section id="products" className="pb-10">
      <SectionTitle title="أحدث المنتجات 🔥" />
      <div className="relative mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
        {latestProducts.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
    </section>
  );
}

function AiPackagesSection() {
  return (
    <section className="pb-10">
      <SectionTitle title="قسم الذكاء الاصطناعي" />
      <div className="relative mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {aiPackageProducts.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
    </section>
  );
}

function ProductCard({ product: p }: { product: (typeof products)[number] }) {
  return (
    <article className="glass-panel relative overflow-hidden rounded-3xl p-4">
      <span className="absolute right-3 top-3 rounded-full bg-purple-600 px-2.5 py-1 text-xs font-bold text-white">{p.discount}</span>
      <div className={`mx-auto mt-6 grid size-24 place-items-center rounded-3xl bg-gradient-to-br ${p.color} text-3xl font-black shadow-[0_0_28px_rgba(168,85,247,0.45)]`}>
        {p.logo}
      </div>
      <h3 className="mt-5 text-center text-sm font-bold text-white">{p.name}</h3>
      <p className="mt-2 text-center text-xs leading-5 text-white/70">اشتراك رسمي<br />تسليم فوري</p>
      <div className="mt-4 flex items-end justify-between gap-2">
        <span className="text-2xl font-black text-white">{p.price}</span>
        <span className="text-sm text-white/40 line-through">{p.oldPrice}</span>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <span className="flex items-center gap-1 text-xs text-yellow-400">
          <Star size={14} fill="currentColor" /> {p.rating} ({p.buyers})
        </span>
        <div className="flex items-center gap-1.5">
          <a href={`/products/${p.id}`} className="grid size-9 place-items-center rounded-xl border border-white/10 bg-white/5 text-white hover:bg-white/12 transition-colors" aria-label="تفاصيل">
            <Eye size={15} />
          </a>
          <AddToCartBtn product={p} />
        </div>
      </div>
    </article>
  );
}

function StatsSection() {
  return (
    <section className="glass-panel grid gap-5 rounded-3xl p-6 md:grid-cols-4">
      {globalStats.map((s) => (
        <div key={s.label} className="flex items-center gap-4">
          <div className="grid size-14 shrink-0 place-items-center rounded-2xl border border-purple-500/20 bg-purple-500/10">
            <s.icon className="size-8 text-lime-400 drop-shadow-[0_0_12px_rgba(132,204,22,0.75)]" />
          </div>
          <div>
            <strong className="block text-2xl text-white">{s.value}</strong>
            <span className="text-sm text-white/60">{s.label}</span>
          </div>
        </div>
      ))}
    </section>
  );
}

function TrustSection() {
  return (
    <section className="my-10 text-center">
      <h2 className="text-4xl font-black text-white md:text-5xl">
        يثق بنا <span className="neon-text">آلاف العملاء</span> حول العالم.
      </h2>
      <p className="mt-4 text-white/55">خدمة سريعة · اشتراكات أصلية · دعم 24/7</p>
      <a href="/checkout" className="neon-button mt-8 inline-flex items-center gap-3 rounded-2xl px-10 py-4 font-black text-black text-lg">
        ابدأ الآن ←
      </a>
      <AdsSectionSlider />
      <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-white/40">
        {["ضمان استرجاع الأموال حتى 30 يوم", "تفعيل فوري خلال دقائق", "دعم على مدار الساعة 24/7", "دفع 100% آمن · حماية بياناتك", "اشتراكات أصلية 100% بدون مشاركة"].map((t) => (
          <span key={t} className="flex items-center gap-1.5">
            <BadgeCheck size={15} className="text-lime-400" /> {t}
          </span>
        ))}
      </div>
    </section>
  );
}

function BrandsStrip() {
  return (
    <section className="glass-panel overflow-hidden rounded-3xl py-5">
      <div className="flex animate-none items-center gap-8 overflow-x-auto px-6 pb-2 [scrollbar-width:none]">
        {BRANDS.map((b) => (
          <div key={b.name} className="flex shrink-0 flex-col items-center gap-2">
            <div className="grid size-12 place-items-center rounded-2xl bg-white/8 text-2xl">{b.emoji}</div>
            <span className="text-xs text-white/50">{b.name}</span>
          </div>
        ))}
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
        </div>
        <FooterColumn title="روابط سريعة" links={["المدونة", "الصفحة التعريفية", "سياسة الخصوصية", "الاستبدال والاسترجاع"]} />
        <FooterColumn title="خدمة العملاء" links={["تواصل معنا", "الأسئلة الشائعة", "تتبع الطلب", "شروط الخدمة"]} />
        <div>
          <h3 className="mb-4 font-black">طرق الدفع</h3>
          <div className="grid max-w-64 grid-cols-2 gap-2">
            {PAYMENT_METHODS.map((method) => (
              <span key={method.id} className="grid min-h-12 place-items-center rounded-lg border border-white/10 bg-white/5 px-2 py-1.5">
                <PaymentMethodImage method={method} />
              </span>
            ))}
          </div>
        </div>
      </div>
      <p className="mt-8 text-center text-xs text-white/35">جميع الحقوق محفوظة GrowFolo © 2026</p>
      <div className="mx-auto mt-6 flex max-w-md flex-col items-center gap-4">
        <img
          src="/app-badges/google-play.png"
          alt="Get it on Google Play"
          className="h-auto w-full max-w-[260px] object-contain sm:max-w-[300px]"
          loading="lazy"
          draggable={false}
        />
        <img
          src="/app-badges/app-store.png"
          alt="Download on the App Store"
          className="h-auto w-full max-w-[260px] object-contain sm:max-w-[300px]"
          loading="lazy"
          draggable={false}
        />
      </div>
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
        {links.map((l) => <li key={l}>{l}</li>)}
      </ul>
    </div>
  );
}
