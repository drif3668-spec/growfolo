/**
 * Product artwork resolution.
 *
 * Uploaded images live under /uploads, which the serverless target does not
 * serve. Until object storage is wired, artwork is resolved in this order:
 *   1. an existing photo already shipped with the project
 *   2. original Growfolo artwork in /public/products
 *   3. the gradient tile fallback
 */

/** Real photographs already present in the repository. */
const PHOTOS: Record<string, string> = {
  "claude-opus-48-lifetime": "/important-info/claude-cloud-lifetime.jpg",
  "chatgpt-plus": "/newsletter-strip/chatgpt.jpg",
  "claude-pro-yearly": "/exclusive-offers/claude-pro.jpg",
  "claude-max-5x-yearly": "/exclusive-offers/claude-max-5x.jpg",
  "claude-max-20x-yearly": "/exclusive-offers/claude-max-20x.jpg",
};

/** Original covers drawn for entries that have no photograph yet. */
const COVERS: Record<string, string> = {
  "claude-opus-48-lifetime": "/products/claude-opus-48-lifetime.svg",
  "chatgpt-plus": "/products/chatgpt-plus.svg",
  "cursor-pro": "/products/cursor-pro.svg",
  "claude-pro-yearly": "/products/claude-pro-yearly.svg",
  "claude-max-5x-yearly": "/products/claude-max-5x-yearly.svg",
  "claude-max-20x-yearly": "/products/claude-max-20x-yearly.svg",
};

export function productPhoto(slug?: string | null): string | null {
  return (slug && PHOTOS[slug]) || null;
}

export function productCover(slug?: string | null, imageUrl?: string | null): string | null {
  if (slug && PHOTOS[slug]) return PHOTOS[slug];
  if (slug && COVERS[slug]) return COVERS[slug];
  if (imageUrl && !imageUrl.startsWith("/uploads/")) return imageUrl;
  return null;
}
