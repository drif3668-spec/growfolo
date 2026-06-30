import { SiteHeader } from "@/components/layout/site-header";
import { CheckoutWizard } from "@/features/checkout/checkout-wizard";

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ product?: string; price?: string; method?: string }>;
}) {
  const params = await searchParams;
  const product =
    params.product && params.price
      ? { name: decodeURIComponent(params.product), price: parseFloat(params.price) }
      : undefined;
  const defaultMethod = params.method ?? null;

  return (
    <main className="min-h-screen bg-[#050508]">
      <SiteHeader />
      <div className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="mb-8 text-3xl font-black text-white">إتمام الطلب</h1>
        <CheckoutWizard product={product} defaultMethod={defaultMethod} />
      </div>
    </main>
  );
}
