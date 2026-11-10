import Link from "next/link";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { ProductCard } from "@/components/store/product-card";
import { NewsletterForm } from "@/components/home/newsletter-form";
import { getProducts, groupByCategory } from "@/lib/server-api";

export const revalidate = 300;

const steps = [
  { n: "1", t: "اختر الاشتراك", d: "تصفّح الكتالوج واختر الأداة أو الاشتراك المناسب." },
  { n: "2", t: "أكمل الطلب", d: "أدخل بريدك وطريقة الدفع، وسيظهر لك السعر النهائي قبل التأكيد." },
  { n: "3", t: "أرسل الإثبات", d: "ارفع صورة إثبات الدفع من صفحة الطلب." },
  { n: "4", t: "استلم التفعيل", d: "نتحقق من الدفع ونفعّل حسابك، وتتابع الحالة من لوحة العميل." },
];

const guarantees = [
  { title: "سعر واضح قبل الدفع", body: "السعر يُحسب من كتالوج المتجر، ويظهر كاملاً في صفحة المراجعة." },
  { title: "تتبّع بدون حساب", body: "تستطيع متابعة طلبك برقم الطلب دون إنشاء حساب." },
  { title: "دعم عربي مباشر", body: "فريق الدعم يجيبك داخل الموقع أو على واتساب." },
  { title: "ضمان موثّق", body: "سياسة الاستبدال والاسترجاع مكتوبة وواضحة قبل الشراء." },
];

const faqs = [
  {
    q: "كيف يتم التفعيل بعد الدفع؟",
    a: "بعد رفع إثبات الدفع يتحقق فريقنا من العملية، ثم تُحدَّث حالة الطلب إلى مفعّل وتصلك بيانات التفعيل على بريدك.",
  },
  {
    q: "هل أحتاج إلى حساب للشراء؟",
    a: "لا. يمكنك إتمام الطلب ببريدك الإلكتروني، ويمكنك إنشاء حساب لاحقاً لمتابعة كل طلباتك في مكان واحد.",
  },
  {
    q: "ما طرق الدفع المتاحة؟",
    a: "طرق الدفع المعروضة في صفحة إتمام الطلب هي الطرق المفعّلة فعلياً في المتجر في تلك اللحظة، ولا نعرض أي وسيلة غير متاحة.",
  },
  {
    q: "ماذا لو لم يعمل الاشتراك؟",
    a: "راجع سياسة الاسترجاع، أو تواصل مع الدعم من نفس صفحة الطلب مع رقم العملية وسنعالج الحالة.",
  },
];

export default async function HomePage() {
  const products = await getProducts();
  const categories = groupByCategory(products);
  const featured = products.slice(0, 8);
  const onSale = products
    .filter((p) => typeof p.old_price === "number" && Number(p.old_price) > Number(p.price))
    .slice(0, 4);

  return (
    <>
      <SiteHeader />

      <main>
        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden border-b border-[var(--gf-line)]">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(60% 80% at 80% 0%, rgba(16,185,129,.18), transparent 60%), radial-gradient(50% 70% at 10% 10%, rgba(56,189,248,.12), transparent 60%)",
            }}
          />
          <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-16 md:grid-cols-2 md:items-center md:py-24">
            <div>
              <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--gf-line-strong)] bg-white/5 px-3 py-1 text-xs font-semibold text-[var(--gf-text-muted)]">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--gf-brand)]" />
                تفعيل بعد التحقق · دعم عربي
              </p>
              <h1 className="text-4xl font-black leading-[1.15] text-[var(--gf-text)] md:text-5xl">
                اشتراكات وأدوات رقمية
                <span className="text-[var(--gf-brand)]"> بسعر واضح </span>
                وتفعيل مضمون
              </h1>
              <p className="mt-5 max-w-lg text-base leading-8 text-[var(--gf-text-muted)]">
                اختر من كتالوج محدّث، ادفع بالطريقة التي تناسبك، وارفع إثبات الدفع.
                نحن نتحقق ونفعّل، وتتابع كل خطوة من صفحة الطلب.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/products"
                  className="rounded-[var(--gf-radius-sm)] bg-[var(--gf-brand)] px-6 py-3 text-sm font-bold text-[#052e1c] transition hover:bg-[var(--gf-brand-strong)] hover:text-white"
                >
                  تصفّح المتجر
                </Link>
                <Link
                  href="/track-order"
                  className="rounded-[var(--gf-radius-sm)] border border-[var(--gf-line-strong)] px-6 py-3 text-sm font-bold text-[var(--gf-text)] transition hover:border-[var(--gf-brand)] hover:text-[var(--gf-brand)]"
                >
                  تتبّع طلبك
                </Link>
              </div>
              <dl className="mt-10 grid max-w-md grid-cols-3 gap-4 border-t border-[var(--gf-line)] pt-6">
                <div>
                  <dt className="text-xs text-[var(--gf-text-muted)]">منتجات متاحة</dt>
                  <dd className="text-xl font-black text-[var(--gf-text)]">{products.length}</dd>
                </div>
                <div>
                  <dt className="text-xs text-[var(--gf-text-muted)]">تصنيفات</dt>
                  <dd className="text-xl font-black text-[var(--gf-text)]">{categories.length}</dd>
                </div>
                <div>
                  <dt className="text-xs text-[var(--gf-text-muted)]">تتبّع</dt>
                  <dd className="text-xl font-black text-[var(--gf-text)]">بدون حساب</dd>
                </div>
              </dl>
            </div>

            <div className="relative">
              <div className="rounded-[var(--gf-radius-lg)] border border-[var(--gf-line)] bg-[var(--gf-surface)] p-5 shadow-[var(--gf-shadow-lg)]">
                <p className="mb-4 text-xs font-bold text-[var(--gf-text-muted)]">الأكثر طلباً</p>
                <div className="grid gap-3">
                  {featured.slice(0, 3).map((p) => (
                    <Link
                      key={p.id}
                      href={`/products/${p.id}`}
                      className="flex items-center justify-between gap-3 rounded-[var(--gf-radius-sm)] border border-[var(--gf-line)] bg-[var(--gf-bg)] p-3 transition hover:border-[var(--gf-brand)]"
                    >
                      <span className="line-clamp-1 text-sm font-bold text-[var(--gf-text)]">
                        {p.name}
                      </span>
                      <span className="shrink-0 text-sm font-black text-[var(--gf-brand)]">
                        {Number(p.price).toFixed(2)} $
                      </span>
                    </Link>
                  ))}
                  {featured.length === 0 && (
                    <p className="text-sm text-[var(--gf-text-muted)]">
                      لا توجد منتجات منشورة حالياً.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Categories ───────────────────────────────────────────────── */}
        {categories.length > 0 && (
          <section className="mx-auto max-w-6xl px-4 py-14" aria-labelledby="categories-title">
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <h2 id="categories-title" className="text-2xl font-black text-[var(--gf-text)]">
                  تصفّح حسب التصنيف
                </h2>
                <p className="mt-1 text-sm text-[var(--gf-text-muted)]">
                  كل تصنيف يعرض عدد المنتجات المتاحة فيه.
                </p>
              </div>
              <Link href="/products" className="text-sm font-bold text-[var(--gf-brand)]">
                عرض الكل
              </Link>
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <Link
                  key={c.name}
                  href="/products"
                  className="rounded-full border border-[var(--gf-line)] bg-[var(--gf-surface)] px-4 py-2 text-sm font-semibold text-[var(--gf-text)] transition hover:border-[var(--gf-brand)] hover:text-[var(--gf-brand)]"
                >
                  {c.name}
                  <span className="ms-2 text-xs text-[var(--gf-text-muted)]">{c.count}</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ── Featured ─────────────────────────────────────────────────── */}
        <section className="mx-auto max-w-6xl px-4 pb-14" aria-labelledby="featured-title">
          <div className="mb-6 flex items-end justify-between gap-4">
            <h2 id="featured-title" className="text-2xl font-black text-[var(--gf-text)]">
              منتجات مختارة
            </h2>
            <Link href="/products" className="text-sm font-bold text-[var(--gf-brand)]">
              كل المنتجات
            </Link>
          </div>
          {featured.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {featured.map((p, i) => (
                <ProductCard key={p.id} product={p} priority={i < 2} />
              ))}
            </div>
          ) : (
            <p className="rounded-[var(--gf-radius)] border border-[var(--gf-line)] bg-[var(--gf-surface)] p-6 text-sm text-[var(--gf-text-muted)]">
              الكتالوج قيد التحديث. عد قريباً.
            </p>
          )}
        </section>

        {/* ── Offers ───────────────────────────────────────────────────── */}
        {onSale.length > 0 && (
          <section className="mx-auto max-w-6xl px-4 pb-14" aria-labelledby="offers-title">
            <h2 id="offers-title" className="mb-6 text-2xl font-black text-[var(--gf-text)]">
              عروض سارية
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {onSale.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}

        {/* ── How it works ─────────────────────────────────────────────── */}
        <section className="border-y border-[var(--gf-line)] bg-[var(--gf-surface)]" aria-labelledby="steps-title">
          <div className="mx-auto max-w-6xl px-4 py-14">
            <h2 id="steps-title" className="mb-8 text-2xl font-black text-[var(--gf-text)]">
              كيف تشتري من Growfolo؟
            </h2>
            <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((s) => (
                <li
                  key={s.n}
                  className="rounded-[var(--gf-radius)] border border-[var(--gf-line)] bg-[var(--gf-bg)] p-5"
                >
                  <span className="mb-3 grid h-9 w-9 place-items-center rounded-full bg-[var(--gf-brand-soft)] text-sm font-black text-[var(--gf-brand)]">
                    {s.n}
                  </span>
                  <h3 className="text-base font-bold text-[var(--gf-text)]">{s.t}</h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--gf-text-muted)]">{s.d}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ── Guarantees ───────────────────────────────────────────────── */}
        <section className="mx-auto max-w-6xl px-4 py-14" aria-labelledby="why-title">
          <h2 id="why-title" className="mb-8 text-2xl font-black text-[var(--gf-text)]">
            لماذا Growfolo؟
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {guarantees.map((g) => (
              <div
                key={g.title}
                className="rounded-[var(--gf-radius)] border border-[var(--gf-line)] bg-[var(--gf-surface)] p-6"
              >
                <h3 className="text-base font-bold text-[var(--gf-text)]">{g.title}</h3>
                <p className="mt-2 text-sm leading-7 text-[var(--gf-text-muted)]">{g.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── FAQ ──────────────────────────────────────────────────────── */}
        <section className="mx-auto max-w-3xl px-4 pb-14" aria-labelledby="faq-title">
          <h2 id="faq-title" className="mb-6 text-2xl font-black text-[var(--gf-text)]">
            أسئلة شائعة
          </h2>
          <div className="space-y-3">
            {faqs.map((f) => (
              <details
                key={f.q}
                className="group rounded-[var(--gf-radius)] border border-[var(--gf-line)] bg-[var(--gf-surface)] p-5"
              >
                <summary className="cursor-pointer list-none text-sm font-bold text-[var(--gf-text)] marker:hidden">
                  <span className="flex items-center justify-between gap-3">
                    {f.q}
                    <span
                      aria-hidden="true"
                      className="text-[var(--gf-brand)] transition group-open:rotate-45"
                    >
                      +
                    </span>
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-7 text-[var(--gf-text-muted)]">{f.a}</p>
              </details>
            ))}
          </div>
          <Link
            href="/faq"
            className="mt-5 inline-block text-sm font-bold text-[var(--gf-brand)]"
          >
            كل الأسئلة الشائعة
          </Link>
        </section>

        {/* ── Newsletter ───────────────────────────────────────────────── */}
        <section className="border-t border-[var(--gf-line)] bg-[var(--gf-surface)]">
          <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 py-14 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-black text-[var(--gf-text)]">العروض الجديدة أولاً</h2>
              <p className="mt-1 text-sm text-[var(--gf-text-muted)]">
                رسالة واحدة عند نزول عرض جديد. لا رسائل مزعجة.
              </p>
            </div>
            <NewsletterForm />
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
