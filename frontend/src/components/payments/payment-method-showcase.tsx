import { PAYMENT_METHODS } from "@/lib/payment-methods";
import { PaymentMethodImage } from "@/components/payments/payment-method-image";

export function PaymentMethodShowcase() {
  return (
    <div className="payment-showcase mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      {PAYMENT_METHODS.map((method, index) => (
        <article
          key={method.id}
          className="payment-3d-card group relative min-h-40 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.045] p-4"
          style={{ animationDelay: `${index * 110}ms` }}
        >
          <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-br from-white/12 via-transparent to-purple-500/10 opacity-70" />
          <div className="pointer-events-none absolute -left-8 -top-10 size-24 rounded-full blur-2xl" style={{ backgroundColor: `${method.color}40` }} />
          <div className="relative flex h-full flex-col items-center justify-center gap-3">
            <PaymentMethodImage method={method} size="large" />
            <span className="text-center text-xs font-black text-white/80">{method.label}</span>
          </div>
        </article>
      ))}
    </div>
  );
}
