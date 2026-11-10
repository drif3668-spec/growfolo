import { SiteHeader } from "@/components/layout/site-header";
import { CheckoutWizard } from "@/features/checkout/checkout-wizard";
import { CheckoutEntry } from "@/features/checkout/checkout-entry";

export const metadata = { title: "إتمام الطلب" };

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ product?: string; price?: string; method?: string; id?: string }>;
}) {
  const params = await searchParams;
  const product =
    params.product && params.price
      ? {
          id: params.id ? decodeURIComponent(params.id) : undefined,
          name: decodeURIComponent(params.product),
          price: parseFloat(params.price),
        }
      : undefined;
  const defaultMethod = params.method ?? null;

  return (
    <main className="min-h-screen bg-[var(--gf-bg)]">
      <SiteHeader />
      <div className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="mb-8 text-3xl font-black text-[var(--gf-text)]">إتمام الطلب</h1>
        {product ? (
          <CheckoutWizard product={product} defaultMethod={defaultMethod} />
        ) : (
          <CheckoutEntry />
        )}
      </div>
    </main>
  );
}
