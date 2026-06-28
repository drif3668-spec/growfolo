import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { products } from "@/lib/mock-data";

export function ProductGrid() {
  return (
    <section className="border-t border-ink/10 bg-white px-6 py-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-semibold text-ink">Products</h2>
            <p className="mt-2 text-ink/65">Curated products ready for catalog and checkout integration.</p>
          </div>
          <Link href="/checkout" className="inline-flex items-center gap-2 rounded-md bg-ink px-4 py-2 text-sm font-medium text-white">
            Checkout <ArrowRight size={16} />
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <article key={product.id} className="rounded-lg border border-ink/10 p-5">
              <div className="mb-5 aspect-[4/3] rounded-md bg-mint" />
              <h3 className="text-lg font-semibold text-ink">{product.name}</h3>
              <p className="mt-2 text-sm leading-6 text-ink/65">{product.description}</p>
              <p className="mt-4 font-semibold text-leaf">${product.price}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

