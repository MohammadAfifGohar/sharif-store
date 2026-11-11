import type { Metadata } from "next";

import { CheckoutForm } from "./components/checkout-form";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Enter your delivery details and pay online or with Cash on Delivery.",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return (
    <main className="flex-1 bg-[#fffdfb]">
      <div className="mx-auto w-full max-w-[1100px] px-4 py-10 sm:px-6 sm:py-14 lg:px-10">
        <p className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.24em] text-[#e80071] sm:text-xs">
          <span className="h-px w-9 bg-[#ff4d9b]" />
          Secure checkout
        </p>
        <h1 className="mt-4 font-heading text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">
          Checkout
        </h1>

        <CheckoutForm />
      </div>
    </main>
  );
}
