"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Route } from "next";

type CartLine = { id: string; name: string; price: number; qty: number };

/**
 * Entry point when the visitor arrives from the cart rather than a product page.
 *
 * The order model stores exactly one product per order, so instead of silently
 * dropping lines we let the customer pick which subscription to pay for now.
 */
export function CheckoutEntry() {
  const [lines, setLines] = useState<CartLine[] | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("gf_cart");
      const parsed = raw ? (JSON.parse(raw) as CartLine[]) : [];
      setLines(Array.isArray(parsed) ? parsed : []);
    } catch {
      setLines([]);
    }
  }, []);

  if (lines === null) {
    return <p className="text-sm text-[var(--gf-text-muted)]">جارٍ تحميل سلتك…</p>;
  }

  if (lines.length === 0) {
    return (
      <div className="rounded-[var(--gf-radius)] border border-[var(--gf-line)] bg-[var(--gf-surface)] p-8 text-center">
        <p className="text-sm font-bold text-[var(--gf-text)]">سلتك فارغة</p>
        <p className="mt-1 text-sm text-[var(--gf-text-muted)]">
          اختر منتجاً من المتجر لبدء الطلب.
        </p>
        <Link
          href="/products"
          className="mt-4 inline-block rounded-[var(--gf-radius-sm)] bg-[var(--gf-brand)] px-5 py-2.5 text-sm font-bold text-[#052e1c]"
        >
          تصفّح المتجر
        </Link>
      </div>
    );
  }

  if (lines.length === 1) {
    const item = lines[0];
    const href =
      `/checkout?product=${encodeURIComponent(item.name)}&price=${item.price}` +
      `&id=${encodeURIComponent(item.id)}`;
    return (
      <div className="rounded-[var(--gf-radius)] border border-[var(--gf-line)] bg-[var(--gf-surface)] p-6">
        <p className="text-sm text-[var(--gf-text-muted)]">سلة تحتوي منتجاً واحداً</p>
        <p className="mt-2 text-lg font-black text-[var(--gf-text)]">{item.name}</p>
        <Link
          href={href as Route}
          className="mt-5 block rounded-[var(--gf-radius-sm)] bg-[var(--gf-brand)] px-5 py-3 text-center text-sm font-bold text-[#052e1c]"
        >
          متابعة إلى بيانات الطلب
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-[var(--gf-text-muted)]">
        كل طلب يُخصّص لمنتج واحد. اختر الاشتراك الذي تريد دفعه الآن — بقية المنتجات تبقى في سلتك.
      </p>
      <ul className="space-y-2">
        {lines.map((item) => (
          <li key={item.id}>
            <Link
              href={
                (`/checkout?product=${encodeURIComponent(item.name)}&price=${item.price}` +
                  `&id=${encodeURIComponent(item.id)}`) as Route
              }
              className="flex items-center justify-between gap-3 rounded-[var(--gf-radius-sm)] border border-[var(--gf-line)] bg-[var(--gf-surface)] px-4 py-3 transition hover:border-[var(--gf-brand)]"
            >
              <span className="text-sm font-bold text-[var(--gf-text)]">
                {item.name}
                {item.qty > 1 && (
                  <span className="ms-2 text-xs text-[var(--gf-text-muted)]">×{item.qty}</span>
                )}
              </span>
              <span className="text-sm font-black text-[var(--gf-brand)]">
                {Number(item.price).toFixed(2)} $
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
