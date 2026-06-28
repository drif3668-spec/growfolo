import { CheckoutForm } from "@/features/checkout/checkout-form";
import { SiteHeader } from "@/components/layout/site-header";

export default function CheckoutPage() {
  return (
    <main>
      <SiteHeader />
      <section className="mx-auto max-w-5xl px-6 py-10">
        <h1 className="text-3xl font-semibold text-ink">Checkout</h1>
        <CheckoutForm />
      </section>
    </main>
  );
}

