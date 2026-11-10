import Link from "next/link";
import type { Route } from "next";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { ProductCard } from "@/components/store/product-card";
import { getProducts, groupByCategory } from "@/lib/server-api";

export const revalidate = 300;

export const metadata = {
  title: "المتجر",
  description: "كل الاشتراكات والأدوات الرقمية المتاحة في Growfolo مع الأسعار والتصنيفات.",
};

const SORTS = [
  { key: "featured", label: "المميزة" },
  { key: "price-asc", label: "الأرخص" },
  { key: "price-desc", label: "الأغلى" },
  { key: "rating", label: "الأعلى تقييماً" },
] as const;

type SearchParams = Promise<{ q?: string; category?: string; sort?: string }>;

function buildHref(params: { q?: string; category?: string; sort?: string }) {
  const sp = new URLSearchParams();
  if (params.q) sp.set("q", params.q);
  if (params.category) sp.set("category", params.category);
  if (params.sort && params.sort !== "featured") sp.set("sort", params.sort);
  const s = sp.toString();
  return s ? `/products?${s}` : "/products";
}

export default async function ProductsPage({ searchParams }: { searchParams: SearchParams }) {
  const { q = "", category = "", sort = "featured" } = await searchParams;
  const all = await getProducts();
  const categories = groupByCategory(all);

  const needle = q.trim().toLowerCase();
  let items = all.filter((p) => {
    const matchCategory = !category || (p.category ?? "") === category;
    const matchQuery =
      !needle ||
      p.name.toLowerCase().includes(needle) ||
      (p.subtitle ?? "").toLowerCase().includes(needle) ||
      (p.description ?? "").toLowerCase().includes(needle);
    return matchCategory && matchQuery;
  });

  if (sort === "price-asc") items = [...items].sort((a, b) => Number(a.price) - Number(b.price));
  else if (sort === "price-desc") items = [...items].sort((a, b) => Number(b.price) - Number(a.price));
  else if (sort === "rating")
    items = [...items].sort((a, b) => Number(b.rating ?? 0) - Number(a.rating ?? 0));

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <nav aria-label="مسار التنقل" className="mb-4 text-xs text-[var(--gf-text-muted)]">
          <Link href="/" className="hover:text-[var(--gf-brand)]">
            الرئيسية
          </Link>
          <span className="mx-2">/</span>
          <span className="text-[var(--gf-text)]">المتجر</span>
        </nav>

        <h1 className="text-3xl font-black text-[var(--gf-text)]">المتجر</h1>
        <p className="mt-2 text-sm text-[var(--gf-text-muted)]">
          {items.length} منتجاً متاحاً — الأسعار تُحسب من الكتالوج عند إتمام الطلب.
        </p>

        {/* Filters work without JavaScript: a plain GET form. */}
        <form method="get" className="mt-6 flex flex-col gap-3 sm:flex-row">
          <div className="flex-1">
            <label htmlFor="q" className="sr-only">
              البحث
            </label>
            <input
              id="q"
              name="q"
              defaultValue={q}
              placeholder="ابحث عن اسم الأداة أو الاشتراك…"
              className="h-11 w-full rounded-[var(--gf-radius-sm)] border border-[var(--gf-line-strong)] bg-[var(--gf-surface)] px-3 text-sm text-[var(--gf-text)] placeholder:text-[var(--gf-text-muted)]"
            />
          </div>
          {category && <input type="hidden" name="category" value={category} />}
          <label htmlFor="sort" className="sr-only">
            الترتيب
          </label>
          <select
            id="sort"
            name="sort"
            defaultValue={sort}
            className="h-11 rounded-[var(--gf-radius-sm)] border border-[var(--gf-line-strong)] bg-[var(--gf-surface)] px-3 text-sm text-[var(--gf-text)]"
          >
            {SORTS.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="h-11 rounded-[var(--gf-radius-sm)] bg-[var(--gf-brand)] px-6 text-sm font-bold text-[#052e1c] transition hover:bg-[var(--gf-brand-strong)] hover:text-white"
          >
            تطبيق
          </button>
        </form>

        {categories.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2">
            <Link
              href={buildHref({ q, sort }) as Route}
              className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition ${
                category
                  ? "border-[var(--gf-line)] text-[var(--gf-text-muted)] hover:border-[var(--gf-brand)]"
                  : "border-[var(--gf-brand)] bg-[var(--gf-brand-soft)] text-[var(--gf-brand)]"
              }`}
            >
              كل التصنيفات
            </Link>
            {categories.map((c) => (
              <Link
                key={c.name}
                href={buildHref({ q, sort, category: c.name }) as Route}
                className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition ${
                  category === c.name
                    ? "border-[var(--gf-brand)] bg-[var(--gf-brand-soft)] text-[var(--gf-brand)]"
                    : "border-[var(--gf-line)] text-[var(--gf-text-muted)] hover:border-[var(--gf-brand)]"
                }`}
              >
                {c.name}
                <span className="ms-2 text-xs opacity-60">{c.count}</span>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-8">
          {items.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {items.map((p, i) => (
                <ProductCard key={p.id} product={p} priority={i < 4} />
              ))}
            </div>
          ) : (
            <div className="rounded-[var(--gf-radius)] border border-[var(--gf-line)] bg-[var(--gf-surface)] p-8 text-center">
              <p className="text-sm font-bold text-[var(--gf-text)]">لا توجد نتائج مطابقة</p>
              <p className="mt-1 text-sm text-[var(--gf-text-muted)]">
                جرّب كلمة بحث أقصر أو أزل فلتر التصنيف.
              </p>
              <Link
                href="/products"
                className="mt-4 inline-block text-sm font-bold text-[var(--gf-brand)]"
              >
                إعادة تعيين الفلاتر
              </Link>
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
