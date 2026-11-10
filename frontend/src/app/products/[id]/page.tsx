import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata, Route } from "next";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { ProductCard } from "@/components/store/product-card";
import { AddToCartButton } from "@/components/store/add-to-cart-button";
import { productCover } from "@/lib/product-media";
import { getProduct, getProducts, serverApiBase } from "@/lib/server-api";

export const revalidate = 300;

type Params = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  try {
    const res = await fetch(`${serverApiBase()}/api/v1/products/${encodeURIComponent(id)}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return { title: "المنتج غير موجود" };
    const p = (await res.json()) as { name: string; description?: string };
    return {
      title: p.name,
      description: (p.description ?? "").slice(0, 155) || undefined,
      openGraph: { title: p.name, type: "website" },
    };
  } catch {
    return { title: "المنتج" };
  }
}

function asText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export default async function ProductPage({ params }: { params: Params }) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();

  const all = await getProducts();
  const related = all.filter((p) => p.id !== product.id && p.category === product.category).slice(0, 4);

  const price = Number(product.price);
  const oldPrice = Number(product.old_price ?? 0);
  const hasDiscount = oldPrice > price && price > 0;
  const percent = hasDiscount ? Math.round((1 - price / oldPrice) * 100) : 0;
  const accent = product.accent_color?.startsWith("#") ? product.accent_color : "#10B981";

  const features = (product.features ?? []).map(asText).filter(Boolean);
  const specs = (product.specs ?? []).filter((s) => s?.label && s?.value);
  const faq = (product.faq ?? []).filter((f) => f?.question && f?.answer);

  const checkoutHref =
    `/checkout?product=${encodeURIComponent(product.name)}&price=${price}` +
    `&id=${encodeURIComponent(product.id)}`;

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <nav aria-label="مسار التنقل" className="mb-6 text-xs text-[var(--gf-text-muted)]">
          <Link href="/" className="hover:text-[var(--gf-brand)]">الرئيسية</Link>
          <span className="mx-2">/</span>
          <Link href="/products" className="hover:text-[var(--gf-brand)]">المتجر</Link>
          <span className="mx-2">/</span>
          <span className="text-[var(--gf-text)]">{product.name}</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Media */}
          <div
            className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-[var(--gf-radius-lg)] border border-[var(--gf-line)]"
            style={{
              background: `radial-gradient(120% 120% at 20% 0%, ${accent}33, transparent 55%), linear-gradient(160deg, ${accent}22, #0b1220 70%)`,
            }}
          >
            {productCover(product.slug, product.image_url) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={productCover(product.slug, product.image_url) as string}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <span
                className="grid h-24 w-24 place-items-center rounded-3xl text-4xl font-black text-[var(--gf-text)] shadow-xl"
                style={{ background: `linear-gradient(135deg, ${accent}, ${accent}77)` }}
                aria-hidden="true"
              >
                {product.name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join("")}
              </span>
            )}
          </div>

          {/* Buy box */}
          <div>
            <div className="flex flex-wrap items-center gap-2">
              {product.category && (
                <span className="rounded-full border border-[var(--gf-line)] px-3 py-1 text-xs font-semibold text-[var(--gf-text-muted)]">
                  {product.category}
                </span>
              )}
              {product.badge && (
                <span className="rounded-full bg-[var(--gf-brand-soft)] px-3 py-1 text-xs font-bold text-[var(--gf-brand)]">
                  {product.badge}
                </span>
              )}
            </div>

            <h1 className="mt-3 text-3xl font-black leading-tight text-[var(--gf-text)]">
              {product.name}
            </h1>
            {product.subtitle && (
              <p className="mt-2 text-sm text-[var(--gf-text-muted)]">{product.subtitle}</p>
            )}

            {Number(product.rating) > 0 && (
              <p className="mt-3 text-sm text-amber-300">
                ★ {Number(product.rating).toFixed(1)}
                {Number(product.reviews_count) > 0 && (
                  <span className="ms-2 text-[var(--gf-text-muted)]">
                    ({product.reviews_count} تقييم)
                  </span>
                )}
              </p>
            )}

            <div className="mt-6 flex items-end gap-3">
              <span className="text-3xl font-black text-[var(--gf-text)]">{price.toFixed(2)} $</span>
              {hasDiscount && (
                <>
                  <span className="text-base font-semibold text-[var(--gf-text-muted)] line-through">
                    {oldPrice.toFixed(2)} $
                  </span>
                  <span className="rounded-full bg-[var(--gf-danger)] px-2 py-0.5 text-xs font-bold text-[var(--gf-text)]">
                    −{percent}%
                  </span>
                </>
              )}
            </div>
            <p className="mt-1 text-xs text-[var(--gf-text-muted)]">
              السعر النهائي يُحسب من الكتالوج عند تأكيد الطلب.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href={checkoutHref as Route}
                className="flex h-12 flex-1 items-center justify-center rounded-[var(--gf-radius-sm)] bg-[var(--gf-brand)] px-6 text-sm font-bold text-[#052e1c] transition hover:bg-[var(--gf-brand-strong)] hover:text-white"
              >
                اشترِ الآن
              </Link>
              <AddToCartButton
                id={product.id}
                name={product.name}
                price={price}
                logo={product.logo ?? "◆"}
                color={accent}
              />
            </div>

            <ul className="mt-6 grid gap-2 text-sm text-[var(--gf-text-muted)]">
              <li>• تُحدَّث حالة الطلب خطوة بخطوة من صفحة التتبّع.</li>
              <li>• الدفع عبر إحدى الطرق المفعّلة، ثم ترفع إثبات الدفع.</li>
              <li>• راجع سياسة الاسترجاع قبل الشراء.</li>
            </ul>
          </div>
        </div>

        {/* Details */}
        <div className="mt-14 grid gap-10 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-10">
            {(product.full_description || product.description) && (
              <section aria-labelledby="desc-title">
                <h2 id="desc-title" className="mb-3 text-xl font-black text-[var(--gf-text)]">الوصف</h2>
                <p className="whitespace-pre-line text-sm leading-8 text-[var(--gf-text-muted)]">
                  {product.full_description || product.description}
                </p>
              </section>
            )}

            {features.length > 0 && (
              <section aria-labelledby="feat-title">
                <h2 id="feat-title" className="mb-3 text-xl font-black text-[var(--gf-text)]">المميزات</h2>
                <ul className="grid gap-2 sm:grid-cols-2">
                  {features.map((f, i) => (
                    <li
                      key={`${f}-${i}`}
                      className="rounded-[var(--gf-radius-sm)] border border-[var(--gf-line)] bg-[var(--gf-surface)] px-4 py-3 text-sm text-[var(--gf-text)]"
                    >
                      {f}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {(product.requirements || product.usage_details || product.benefits) && (
              <section aria-labelledby="req-title">
                <h2 id="req-title" className="mb-3 text-xl font-black text-[var(--gf-text)]">
                  شروط التفعيل
                </h2>
                <div className="space-y-3 rounded-[var(--gf-radius)] border border-[var(--gf-line)] bg-[var(--gf-surface)] p-5 text-sm leading-7 text-[var(--gf-text-muted)]">
                  {product.requirements && <p><strong className="text-[var(--gf-text)]">المتطلبات: </strong>{product.requirements}</p>}
                  {product.usage_details && <p><strong className="text-[var(--gf-text)]">طريقة الاستخدام: </strong>{product.usage_details}</p>}
                  {product.benefits && <p><strong className="text-[var(--gf-text)]">ملاحظات: </strong>{product.benefits}</p>}
                </div>
              </section>
            )}

            {faq.length > 0 && (
              <section aria-labelledby="faq-title">
                <h2 id="faq-title" className="mb-3 text-xl font-black text-[var(--gf-text)]">الأسئلة الشائعة</h2>
                <div className="space-y-3">
                  {faq.map((f, i) => (
                    <details
                      key={`${f.question}-${i}`}
                      className="rounded-[var(--gf-radius)] border border-[var(--gf-line)] bg-[var(--gf-surface)] p-5"
                    >
                      <summary className="cursor-pointer list-none text-sm font-bold text-[var(--gf-text)]">
                        {f.question}
                      </summary>
                      <p className="mt-3 text-sm leading-7 text-[var(--gf-text-muted)]">{f.answer}</p>
                    </details>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Specs */}
          <aside>
            {specs.length > 0 && (
              <div className="rounded-[var(--gf-radius)] border border-[var(--gf-line)] bg-[var(--gf-surface)] p-5">
                <h2 className="mb-4 text-base font-black text-[var(--gf-text)]">المواصفات</h2>
                <dl className="space-y-3">
                  {specs.map((s, i) => (
                    <div key={`${s.label}-${i}`} className="flex items-center justify-between gap-3 border-b border-[var(--gf-line)] pb-2 last:border-0">
                      <dt className="text-xs text-[var(--gf-text-muted)]">{s.label}</dt>
                      <dd className="text-sm font-bold text-[var(--gf-text)]">{s.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </aside>
        </div>

        {related.length > 0 && (
          <section className="mt-16" aria-labelledby="related-title">
            <h2 id="related-title" className="mb-6 text-xl font-black text-[var(--gf-text)]">
              منتجات مشابهة
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
