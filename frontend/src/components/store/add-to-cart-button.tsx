"use client";

import { useState } from "react";
import { useCart } from "@/context/cart-context";

export function AddToCartButton({
  id,
  name,
  price,
  logo,
  color,
}: {
  id: string;
  name: string;
  price: number;
  logo: string;
  color: string;
}) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  return (
    <button
      type="button"
      onClick={() => {
        addItem({ id, name, price, logo, color });
        setAdded(true);
        setTimeout(() => setAdded(false), 1800);
      }}
      className="h-12 flex-1 rounded-[var(--gf-radius-sm)] border border-[var(--gf-line-strong)] px-6 text-sm font-bold text-[var(--gf-text)] transition hover:border-[var(--gf-brand)] hover:text-[var(--gf-brand)]"
    >
      {added ? "أُضيف إلى السلة ✓" : "أضف إلى السلة"}
    </button>
  );
}
