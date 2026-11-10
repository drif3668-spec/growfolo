import Link from "next/link";
import type { Product } from "@/lib/server-api";
import { productCover } from "@/lib/product-media";

/**
 * Storefront product card. Renders without client JavaScript.
 */

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0] ?? "").join("");
}

export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const accent = product.accent_color && product.accent_color.startsWith("#")
    ? product.accent_color
    : "#7C3AED";

  const cover = productCover(product.slug, product.image_url);

  const hasDiscount =
    typeof product.old_price === "number" &&
    product.old_price > Number(product.price) &&
    Number(product.price) > 0;

  const percent = hasDiscount
    ? Math.round((1 - Number(product.price) / Number(product.old_price)) * 100)
    : 0;

  return (
    <Link
      href={`/products/${product.id}`}
      className="gf-card group relative flex flex-col overflow-hidden rounded-[var(--gf-radius)] border border-[var(--gf-line)] bg-[var(--gf-surface)]"
    >
      <div
        className="relative aspect-[16/10] overflow-hidden"
        style={{ background: `linear-gradient(160deg, ${accent}22, #0f172a 85%)` }}
      >
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover}
            alt={product.name}
            loading={priority ? "eager" : "lazy"}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="grid h-full w-full place-items-center">
            <span
              className="grid h-16 w-16 place-items-center rounded-2xl text-2xl font-black text-white shadow-lg"
              style={{ background: `linear-gradient(135deg, ${accent}, ${accent}77)` }}
              aria-hidden="true"
            >
              {initials(product.name)}
            </span>
          </div>
        )}

        {percent > 0 && (
          <span className="absolute start-3 top-3 rounded-full bg-[var(--gf-danger)] px-2.5 py-1 text-[11px] font-bold text-white shadow">
            −{percent}%
          </span>
        )}

        {product.badge && (
          <span className="absolute end-3 top-3 rounded-full border border-white/25 bg-black/45 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur">
            {product.badge}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 text-[15px] font-bold leading-6 text-[var(--gf-text)]">
            {product.name}
          </h3>
          {typeof product.rating === "number" && product.rating > 0 && (
            <span className="shrink-0 rounded-md bg-amber-50 px-1.5 py-0.5 text-[11px] font-bold text-amber-600">
              ★ {Number(product.rating).toFixed(1)}
            </span>
          )}
        </div>

        {product.subtitle && (
          <p className="line-clamp-1 text-xs text-[var(--gf-text-muted)]">{product.subtitle}</p>
        )}

        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-black text-[var(--gf-text)]">
              {Number(product.price).toFixed(2)} $
            </span>
            {hasDiscount && (
              <span className="text-xs font-semibold text-[var(--gf-text-muted)] line-through">
                {Number(product.old_price).toFixed(2)} $
              </span>
            )}
          </div>
          <span className="rounded-full bg-[var(--gf-brand-soft)] px-3 py-1 text-[11px] font-bold text-[var(--gf-brand)] transition group-hover:bg-[var(--gf-brand)] group-hover:text-white">
            التفاصيل
          </span>
        </div>
      </div>
    </Link>
  );
}
