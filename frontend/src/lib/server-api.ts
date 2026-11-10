/**
 * Server-side data access.
 *
 * Server components cannot use relative URLs, so the base must be absolute.
 * On Vercel the public domain is used; locally the FastAPI dev server.
 */

export const PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export function serverApiBase(): string {
  if (PUBLIC_API_URL.startsWith("http")) return PUBLIC_API_URL;
  return process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.growol.store";
}

export type Product = {
  id: string;
  name: string;
  slug: string;
  subtitle?: string | null;
  logo?: string | null;
  description?: string | null;
  full_description?: string | null;
  price: number;
  old_price?: number | null;
  discount?: string | null;
  stock?: number | null;
  image_url?: string | null;
  accent_color?: string | null;
  category?: string | null;
  badge?: string | null;
  rating?: number | null;
  reviews_count?: number | null;
  is_published?: boolean;
};

export type Banner = {
  id: number;
  image_url: string;
  title?: string | null;
  description?: string | null;
  button_text?: string | null;
  link_url?: string | null;
};

async function getJson<T>(path: string, revalidate = 300): Promise<T | null> {
  try {
    const res = await fetch(`${serverApiBase()}${path}`, {
      next: { revalidate },
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function getProducts(): Promise<Product[]> {
  const data = await getJson<Product[]>("/api/v1/products");
  return Array.isArray(data) ? data : [];
}

export type ProductDetail = Product & {
  partners?: unknown[];
  features?: unknown[];
  specs?: { label?: string; value?: string }[];
  faq?: { question?: string; answer?: string }[];
  usage_details?: string | null;
  requirements?: string | null;
  benefits?: string | null;
};

export async function getProduct(id: string): Promise<ProductDetail | null> {
  return getJson<ProductDetail>(`/api/v1/products/${encodeURIComponent(id)}`);
}

export async function getBanners(): Promise<Banner[]> {
  const data = await getJson<Banner[]>("/api/v1/banners");
  return Array.isArray(data) ? data : [];
}

/** Group products by category, preserving a stable display order. */
export function groupByCategory(products: Product[]): { name: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const p of products) {
    const key = (p.category ?? "").trim();
    if (!key) continue;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "ar"));
}
