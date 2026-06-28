import { SiteHeader } from "@/components/layout/site-header";
import { CartPage } from "@/features/checkout/cart-page";

export default function CheckoutPage() {
  return (
    <main className="min-h-screen bg-[#050508]">
      <SiteHeader />
      <div className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="mb-6 text-3xl font-black text-white">سلة التسوق</h1>
        <CartPage />
      </div>
    </main>
  );
}
