import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PackageIcon } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { getSessionUser } from "@/lib/auth-session";
import { getOrderConfirmationPath } from "@/lib/checkout";
import { formatMoneyAmount } from "@/lib/woocommerce";
import { listOrdersForUser, type WooOrder } from "@/lib/woocommerce-orders";
import { cn } from "@/lib/utils";

import { LogoutButton } from "./components/logout-button";

export const metadata: Metadata = {
  title: "My account",
  robots: { index: false, follow: false },
};

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  pending: { label: "Awaiting payment", className: "bg-amber-100 text-amber-800" },
  processing: { label: "Confirmed", className: "bg-sky-100 text-sky-800" },
  "on-hold": { label: "On hold", className: "bg-amber-100 text-amber-800" },
  completed: { label: "Delivered", className: "bg-emerald-100 text-emerald-800" },
  cancelled: { label: "Cancelled", className: "bg-muted text-muted-foreground" },
  refunded: { label: "Refunded", className: "bg-muted text-muted-foreground" },
  failed: { label: "Payment failed", className: "bg-destructive/10 text-destructive" },
};

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

async function loadOrders(user: Parameters<typeof listOrdersForUser>[0]) {
  try {
    return { orders: await listOrdersForUser(user), failed: false };
  } catch (cause) {
    console.error("[account] could not load orders", cause);
    return { orders: [] as WooOrder[], failed: true };
  }
}

export default async function AccountPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/account");

  const { orders, failed } = await loadOrders(user);
  const identity = user.phone ? `+91 ${user.phone}` : user.email;

  return (
    <main className="flex-1 bg-[#fffdfb]">
      <div className="mx-auto w-full max-w-[900px] px-4 py-10 sm:px-6 sm:py-14">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.24em] text-[#e80071] sm:text-xs">
              <span className="h-px w-9 bg-[#ff4d9b]" />
              My account
            </p>
            <h1 className="mt-4 font-heading text-4xl font-semibold tracking-[-0.03em]">
              {user.name ? `Hi, ${user.name.split(" ")[0]}` : "My orders"}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Logged in as {identity}
            </p>
          </div>
          <LogoutButton />
        </div>

        <h2 className="mt-10 font-heading text-xl font-semibold">Your orders</h2>

        {failed ? (
          <p className="mt-4 rounded-xl border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
            We couldn&apos;t load your orders right now. Please try again in a
            moment.
          </p>
        ) : orders.length === 0 ? (
          <div className="mt-4 flex flex-col items-start gap-4 rounded-xl border border-border bg-muted/20 p-6">
            <PackageIcon className="size-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              No orders yet. Orders you place with this{" "}
              {user.phone ? "mobile number" : "email"} will show up here.
            </p>
            <Link href="/" className={cn(buttonVariants(), "h-10 px-4")}>
              Start shopping
            </Link>
          </div>
        ) : (
          <ul className="mt-4 flex flex-col gap-3">
            {orders.map((order) => {
              const status = STATUS_LABELS[order.status] ?? {
                label: order.status,
                className: "bg-muted text-muted-foreground",
              };
              const itemCount = order.line_items.reduce(
                (sum, item) => sum + item.quantity,
                0,
              );

              return (
                <li key={order.id}>
                  <Link
                    href={getOrderConfirmationPath(order.id, order.order_key)}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-background p-4 transition-colors hover:border-foreground/30 sm:p-5"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold">Order #{order.number}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {dateFormatter.format(new Date(order.date_created))} ·{" "}
                        {itemCount} {itemCount === 1 ? "item" : "items"}
                      </p>
                      <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
                        {order.line_items.map((item) => item.name).join(", ")}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="font-semibold">
                        {formatMoneyAmount(Number(order.total), order.currency)}
                      </span>
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-0.5 text-xs font-semibold",
                          status.className,
                        )}
                      >
                        {status.label}
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </main>
  );
}
