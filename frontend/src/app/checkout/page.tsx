import { SiteHeader } from "@/components/layout/site-header";
import { CheckoutWizard } from "@/features/checkout/checkout-wizard";

export default function CheckoutPage() {
  return (
    <main className="min-h-screen bg-[#050508]">
      <SiteHeader />
      <div className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="mb-8 text-3xl font-black text-white">إتمام الطلب</h1>
        <CheckoutWizard />
      </div>
    </main>
  );
}
