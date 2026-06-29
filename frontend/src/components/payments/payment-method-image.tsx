import type { PaymentMethod } from "@/lib/payment-methods";

export function PaymentMethodImage({
  method,
  size = "compact",
}: {
  method: Pick<PaymentMethod, "label" | "image">;
  size?: "compact" | "large";
}) {
  return (
    <img
      src={method.image}
      alt={method.label}
      className={size === "large" ? "h-24 w-full object-contain sm:h-28" : "h-10 w-20 object-contain"}
      loading="lazy"
      draggable={false}
    />
  );
}

