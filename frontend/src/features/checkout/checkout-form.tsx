"use client";

import { motion } from "framer-motion";
import { Upload } from "lucide-react";

export function CheckoutForm() {
  return (
    <motion.form
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-8 grid gap-5 rounded-lg border border-ink/10 bg-white p-6 shadow-soft"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium text-ink">
          Full name
          <input className="rounded-md border border-ink/15 px-3 py-2" name="customerName" />
        </label>
        <label className="grid gap-2 text-sm font-medium text-ink">
          Email
          <input className="rounded-md border border-ink/15 px-3 py-2" name="email" type="email" />
        </label>
      </div>
      <label className="grid gap-2 text-sm font-medium text-ink">
        Payment proof
        <span className="flex min-h-36 cursor-pointer flex-col items-center justify-center gap-3 rounded-md border border-dashed border-ink/25 bg-cloud p-6 text-ink/65">
          <Upload size={24} />
          Upload receipt or transfer screenshot
          <input className="sr-only" type="file" name="paymentProof" accept="image/*,.pdf" />
        </span>
      </label>
      <button className="w-fit rounded-md bg-leaf px-5 py-2.5 font-medium text-white" type="submit">
        Place order
      </button>
    </motion.form>
  );
}

