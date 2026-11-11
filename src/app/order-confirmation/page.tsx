import type { Metadata } from "next";
import Link from "next/link";
import { CircleCheckIcon, ClockIcon, CircleXIcon } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { getOrder, isOrderPaid, type WooOrder } from "@/lib/woocommerce-orders";
import { WHATSAPP_NUMBER } from "@/lib/site-config";
import { formatMoneyAmount } from "@/lib/woocommerce";

export const metadata: Metadata = {
  title: "Order confirmation",
  robots: { index: false, follow: false },
};

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

/** Loads the order only when the secret order key matches, so IDs can't be enumerated. */
async function loadOrder(orderParam: unknown, keyParam: unknown) {
  const orderId = Number(orderParam);
  if (!Number.isInteger(orderId) || orderId <= 0 || typeof keyParam !== "string") {
    return null;
  }

  try {
    const order = await getOrder(orderId);
    return order.order_key === keyParam ? order : null;
  } catch {
    return null;
  }
}

function getStatusView(order: WooOrder) {
  if (order.payment_method === "cod" && isOrderPaid(order)) {
    return {
      Icon: CircleCheckIcon,
      iconClass: "text-emerald-600",
      title: "Thank you! Your order is placed.",
      body: `Please keep ${formatMoneyAmount(Number(order.total), order.currency)} ready to pay in cash when your order is delivered. A confirmation has been sent to your email.`,
    };
  }
  if (isOrderPaid(order)) {
    return {
      Icon: CircleCheckIcon,
      iconClass: "text-emerald-600",
      title: "Thank you! Your order is confirmed.",
      body: "We've received your payment and will start preparing your order. A confirmation has been sent to your email.",
    };
  }
  if (order.status === "pending") {
    return {
      Icon: ClockIcon,
      iconClass: "text-amber-500",
      title: "We're confirming your payment",
      body: "This usually takes a moment. If money was debited, your order will be confirmed automatically — please don't pay again.",
    };
  }
  return {
    Icon: CircleXIcon,
    iconClass: "text-destructive",
    title: "This order was not completed",
    body: "No payment was recorded for this order. If money was debited, contact us and we'll sort it out.",
  };
}

export default async function OrderConfirmationPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const order = await loadOrder(params.order, params.key);

  const whatsAppUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    order ? `Hello Sharif Store, I have a question about order #${order.number}.` : "Hello Sharif Store, I have a question about my order.",
  )}`;

  if (!order) {
    return (
      <main className="flex-1 bg-[#fffdfb]">
        <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
          <h1 className="font-heading text-3xl font-semibold">Order not found</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            We couldn&apos;t find this order. If you&apos;ve just paid, message us and we&apos;ll help.
          </p>
          <a href={whatsAppUrl} target="_blank" rel="noopener noreferrer" className={`${buttonVariants({ size: "lg" })} mt-6`}>
            Contact us on WhatsApp
          </a>
        </div>
      </main>
    );
  }

  const { Icon, iconClass, title, body } = getStatusView(order);
  const shipping = order.shipping;

  return (
    <main className="flex-1 bg-[#fffdfb]">
      <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6 sm:py-20">
        <Icon className={`size-12 ${iconClass}`} />
        <h1 className="mt-5 font-heading text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">
          {title}
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">{body}</p>

        <section className="mt-10 rounded-2xl border border-border bg-muted/20 p-5 sm:p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-heading text-lg font-semibold">Order #{order.number}</h2>
            <span className="text-xs text-muted-foreground">
              {new Date(order.date_created).toLocaleDateString("en-IN", { dateStyle: "medium" })}
            </span>
          </div>

          <ul className="mt-4 flex flex-col gap-3 text-sm">
            {order.line_items.map((line) => (
              <li key={line.id} className="flex justify-between gap-4">
                <span className="min-w-0">
                  {line.name} <span className="text-muted-foreground">× {line.quantity}</span>
                </span>
                <span className="font-medium">
                  {formatMoneyAmount(Number(line.total), order.currency)}
                </span>
              </li>
            ))}
          </ul>

          {order.fee_lines.map((fee) => (
            <div key={fee.id} className="mt-3 flex justify-between text-sm">
              <span>{fee.name}</span>
              <span>{formatMoneyAmount(Number(fee.total), order.currency)}</span>
            </div>
          ))}

          {Number(order.shipping_total) > 0 ? (
            <div className="mt-3 flex justify-between text-sm">
              <span>Shipping</span>
              <span>{formatMoneyAmount(Number(order.shipping_total), order.currency)}</span>
            </div>
          ) : null}

          <div className="mt-4 flex justify-between border-t border-border/70 pt-4 font-semibold">
            <span>Total</span>
            <span>{formatMoneyAmount(Number(order.total), order.currency)}</span>
          </div>

          <div className="mt-6 text-sm">
            <p className="font-semibold">Delivering to</p>
            <p className="mt-1 leading-6 text-muted-foreground">
              {shipping.first_name} {shipping.last_name}
              <br />
              {[shipping.address_1, shipping.address_2].filter(Boolean).join(", ")}
              <br />
              {shipping.city}, {shipping.state} {shipping.postcode}
            </p>
          </div>
        </section>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/" className={buttonVariants({ size: "lg" })}>
            Continue shopping
          </Link>
          <a href={whatsAppUrl} target="_blank" rel="noopener noreferrer" className={buttonVariants({ size: "lg", variant: "outline" })}>
            Questions? WhatsApp us
          </a>
        </div>
      </div>
    </main>
  );
}
