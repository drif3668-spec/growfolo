/**
 * Product artwork resolution.
 *
 * Uploaded images live under /uploads, which the serverless target does not
 * serve. Until object storage is wired, each catalogue entry uses original
 * artwork shipped in /public/products.
 */

const COVERS: Record<string, string> = {
  "claude-opus-48-lifetime": "/products/claude-opus-48-lifetime.svg",
  "chatgpt-plus": "/products/chatgpt-plus.svg",
  "cursor-pro": "/products/cursor-pro.svg",
  "claude-pro-yearly": "/products/claude-pro-yearly.svg",
  "claude-max-5x-yearly": "/products/claude-max-5x-yearly.svg",
  "claude-max-20x-yearly": "/products/claude-max-20x-yearly.svg",
};

export function productCover(slug?: string | null, imageUrl?: string | null): string | null {
  if (slug && COVERS[slug]) return COVERS[slug];
  if (imageUrl && !imageUrl.startsWith("/uploads/")) return imageUrl;
  return null;
}
