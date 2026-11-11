import type { Metadata } from "next";
import { MessageCircleIcon } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { SITE_NAME, WHATSAPP_NUMBER } from "@/lib/site-config";
import { cn } from "@/lib/utils";

const LAST_UPDATED = "11 November 2026";
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
  "Hello Sharif Store, I have a question about an order.",
)}`;

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description:
    "Ordering, payment, delivery, return and exchange terms for shopping with Sharif Store.",
  alternates: { canonical: "/terms-conditions" },
};

const sections = [
  {
    id: "about",
    title: "About these terms",
    points: [
      `These terms apply to all orders placed with ${SITE_NAME} (Sharif Gift Center, Old Sarafa, Lohiya Maidan, Deglur, Maharashtra 431717) through this website, WhatsApp or phone.`,
      "By placing an order you agree to these terms. We may update them from time to time; the version on this page at the time of your order applies.",
    ],
  },
  {
    id: "orders",
    title: "Orders",
    points: [
      "You can place an order in two ways: online through checkout on this website, or by sending us the product details on WhatsApp.",
      "Online orders are confirmed once your payment is successful, or straight away when you choose Cash on Delivery. You will see an order confirmation page and receive a confirmation email with your order number.",
      "WhatsApp orders are confirmed only after we reply with the final price, availability and delivery details.",
      "We may decline or cancel an order if a product is out of stock, the price was listed incorrectly, or the delivery address cannot be served. Any amount already paid for a cancelled order is refunded in full.",
      "You can cancel an order free of charge before it is packed or dispatched by messaging us on WhatsApp with your order number.",
    ],
  },
  {
    id: "pricing",
    title: "Prices & product information",
    points: [
      "All prices are in Indian Rupees (₹). For online orders, the final amount, including any delivery charges, is shown in the payment window before you pay. For WhatsApp orders, delivery charges, if any, are shared with you before the order is confirmed.",
      "We try to show products as accurately as possible, but colours, packaging and sizes may vary slightly from the photos.",
    ],
  },
  {
    id: "payment",
    title: "Payment",
    points: [
      "At checkout on this website you can pay online or choose Cash on Delivery (COD).",
      "Online payments are processed securely by Razorpay using UPI, debit/credit cards, net banking or wallets. Payment details are handled by Razorpay; we do not see or store your card or bank details.",
      "If money is debited but your order is not confirmed, please do not pay again. Message us on WhatsApp — the payment is either confirmed against your order or refunded automatically by Razorpay.",
      "For COD orders, please keep the exact order amount ready in cash at the time of delivery. We may contact you to confirm a COD order before dispatch, and may cancel COD orders that cannot be confirmed or are repeatedly refused at delivery.",
      "For WhatsApp orders we accept UPI / online bank transfer and COD. Please pay only to the details shared by us on our official WhatsApp number and send the payment screenshot for confirmation.",
    ],
  },
  {
    id: "delivery",
    title: "Delivery",
    points: [
      "We offer local delivery in and around Deglur, and courier delivery across India.",
      "Local orders are usually delivered within 1–2 days. Courier orders usually arrive within 3–8 working days depending on your location. These are estimates and delays by the courier are outside our control.",
      "Please make sure the address, PIN code and phone number you enter at checkout or share with us are correct. Orders returned because of a wrong address or an unanswered delivery may need to be re-shipped at extra cost.",
    ],
  },
  {
    id: "returns",
    title: "Returns, exchanges & refunds",
    points: [
      "We accept returns only for items that arrive damaged, defective, wrong or expired. We do not accept returns or exchanges for any other reason, including change of mind.",
      "To raise a request, message us on WhatsApp within 48 hours of delivery with clear photos and an unboxing video. The video must be continuous, start from the sealed parcel and clearly show the issue. Requests without an unboxing video cannot be accepted.",
      "Once we verify the issue, we will replace the item or issue a full refund. If we need the item back, we will tell you how to send it; items that have been used or are not in their original packaging will not be accepted.",
      "Approved refunds for online orders are made to the original payment method (UPI, card, bank or wallet) through Razorpay within 5–7 working days. Refunds for COD and WhatsApp orders are made to your UPI / bank account within 5–7 working days.",
    ],
  },
  {
    id: "reviews",
    title: "Reviews",
    points: [
      "Reviews you submit on this website may be shown publicly. Please do not include personal details. We may remove reviews that are abusive, misleading or unrelated to the product.",
    ],
  },
  {
    id: "law",
    title: "Governing law",
    points: [
      "These terms are governed by the laws of India. Any dispute is subject to the jurisdiction of the courts in Nanded district, Maharashtra.",
    ],
  },
] as const;

export default function TermsPage() {
  return (
    <main className="flex-1 bg-[#fffdfb]">
      <section className="bg-[#2b1020] text-white">
        <div className="mx-auto w-full max-w-[1440px] px-4 py-14 sm:px-6 sm:py-20 lg:px-10">
          <p className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.24em] text-[#ff9fc9] sm:text-xs">
            <span className="h-px w-9 bg-[#ff4d9b]" />
            Shopping with us
          </p>
          <h1 className="mt-6 max-w-3xl font-heading text-5xl font-semibold leading-[0.95] tracking-[-0.045em] sm:text-7xl">
            Terms &amp; Conditions
          </h1>
          <p className="mt-6 text-sm text-white/60">
            Last updated: {LAST_UPDATED}
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1440px] gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-16 lg:px-10 lg:pb-24">
        <nav aria-label="On this page" className="hidden lg:block">
          <div className="sticky top-28">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#e80071]">
              On this page
            </p>
            <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
              {sections.map((section) => (
                <li key={section.id}>
                  <a href={`#${section.id}`} className="hover:text-foreground">
                    {section.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        <div className="max-w-3xl">
          {sections.map((section) => (
            <section
              key={section.id}
              id={section.id}
              className="scroll-mt-28 border-b border-[#2b1020]/10 py-8 first:pt-0 last:border-b-0"
            >
              <h2 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
                {section.title}
              </h2>
              <ul className="mt-4 list-disc space-y-3 pl-5 leading-7 text-muted-foreground marker:text-[#e80071]">
                {section.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </section>
          ))}

          <div className="mt-6 rounded-lg bg-[#fff7ec] p-6 sm:p-8">
            <h2 className="font-heading text-2xl font-semibold tracking-tight">
              Questions about an order?
            </h2>
            <p className="mt-2 leading-7 text-muted-foreground">
              Message us on WhatsApp and our team will help you out.
            </p>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noreferrer"
              className={cn(
                buttonVariants({ size: "lg" }),
                "mt-6 h-12 rounded-full bg-[#25D366] px-6 text-white hover:bg-[#20bd5a]",
              )}
            >
              <MessageCircleIcon aria-hidden="true" />
              WhatsApp us
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
