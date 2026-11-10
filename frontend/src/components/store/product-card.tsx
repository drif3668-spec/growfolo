import Link from "next/link";
import type { Product } from "@/lib/server-api";

/**
 * Storefront product card.
 *
 * Renders without client JavaScript. When a product has no usable image we
 * draw a deterministic gradient tile from its accent colour instead of
 * requesting a broken /uploads/ URL.
 */

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0] ?? "").join("");
}

function hasUsableImage(url?: string | null): url is string {
  if (!url) return false;
  if (url.startsWith("/uploads/")) return false; // not served on the serverless target
  return url.startsWith("http") || url.startsWith("data:");
}

export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const accent = product.accent_color && product.accent_color.startsWith("#")
    ? product.accent_color
    : "#10B981";

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
      className="group relative flex flex-col overflow-hidden rounded-[var(--gf-radius)] border border-[var(--gf-line)] bg-[var(--gf-surface)] transition duration-200 hover:-translate-y-0.5 hover:border-[var(--gf-line-strong)] hover:shadow-[var(--gf-shadow)] focus-visible:-translate-y-0.5"
    >
      <div
        className="relative flex aspect-[16/10] items-center justify-center overflow-hidden"
        style={{
          background: `radial-gradient(120% 120% at 20% 0%, ${accent}33 0%, transparent 55%), linear-gradient(160deg, ${accent}22, #0b1220 70%)`,
        }}
      >
        {hasUsableImage(product.image_url) ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image_url}
            alt={product.name}
            loading={priority ? "eager" : "lazy"}
            className="h-full w-full object-cover"
          />
        ) : (
          <span
            className="grid h-16 w-16 place-items-center rounded-2xl text-2xl font-black text-[var(--gf-text)] shadow-lg"
            style={{ background: `linear-gradient(135deg, ${accent}, ${accent}77)` }}
            aria-hidden="true"
          >
            {initials(product.name)}
          </span>
        )}

        {percent > 0 && (
          <span className="absolute start-3 top-3 rounded-full bg-[var(--gf-danger)] px-2.5 py-1 text-[11px] font-bold text-[var(--gf-text)] shadow">
            −{percent}%
          </span>
        )}

        {product.badge && (
          <span className="absolute end-3 top-3 rounded-full border border-[var(--gf-line-strong)] bg-black/45 px-2.5 py-1 text-[11px] font-bold text-[var(--gf-text)] backdrop-blur">
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
            <span className="shrink-0 rounded-md bg-[var(--gf-surface-2)] px-1.5 py-0.5 text-[11px] font-bold text-amber-300">
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
          <span className="rounded-full bg-[var(--gf-brand-soft)] px-3 py-1 text-[11px] font-bold text-[var(--gf-brand)] transition group-hover:bg-[var(--gf-brand)] group-hover:text-[#052e1c]">
            التفاصيل
          </span>
        </div>
      </div>
    </Link>
  );
}
