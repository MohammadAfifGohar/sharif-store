"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LoaderCircleIcon,
  LockIcon,
  PackageCheckIcon,
  ShoppingBagIcon,
} from "lucide-react";

import { useBag } from "@/components/bag-provider";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  checkoutCustomerSchema,
  INDIAN_STATES,
  type CheckoutCustomer,
  type CheckoutSession,
  type CodOrderResult,
  type PaymentMethod,
} from "@/lib/checkout";
import { absoluteUrl, SITE_NAME } from "@/lib/site-config";
import { formatMoneyAmount } from "@/lib/woocommerce";
import { cn } from "@/lib/utils";

import { loadRazorpay, openRazorpay } from "./razorpay-script";

type Status = "idle" | "starting" | "paying" | "verifying" | "done";

const inputClassName = "h-12 rounded-sm focus-visible:ring-1!";

const PAYMENT_OPTIONS: Array<{
  value: PaymentMethod;
  label: string;
  description: string;
}> = [
  {
    value: "razorpay",
    label: "Pay online",
    description: "UPI, cards, net banking & wallets via Razorpay",
  },
  {
    value: "cod",
    label: "Cash on Delivery",
    description: "Pay in cash when your order arrives",
  },
];

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await response.json().catch(() => ({}))) as T & { message?: string };

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong. Please try again.");
  }

  return data;
}

export function CheckoutForm() {
  const router = useRouter();
  const { items, subtotal, totalCount, clear } = useBag();
  const [status, setStatus] = useState<Status>("idle");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("razorpay");
  const [errorMessage, setErrorMessage] = useState("");
  // Reuse the pending order if the customer closes the payment window and
  // retries without changing their bag or details.
  const [session, setSession] = useState<{
    fingerprint: string;
    value: CheckoutSession;
  } | null>(null);

  const currencyCode = items[0]?.currencyCode ?? "INR";
  const busy = status !== "idle";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");

    const data = Object.fromEntries(new FormData(event.currentTarget));
    const parsed = checkoutCustomerSchema.safeParse(data);
    if (!parsed.success) {
      setErrorMessage(parsed.error.issues[0]?.message ?? "Check your details.");
      return;
    }

    const customer = parsed.data;
    const orderItems = items.map((item) => ({
      productId: item.productId,
      variationId: item.variationId,
      quantity: item.quantity,
    }));
    if (paymentMethod === "cod") {
      try {
        setStatus("starting");
        const { redirectUrl } = await postJson<CodOrderResult>("/api/checkout", {
          paymentMethod: "cod",
          customer,
          items: orderItems,
        });
        setStatus("done");
        clear();
        router.replace(redirectUrl);
      } catch (error) {
        setStatus("idle");
        setErrorMessage(error instanceof Error ? error.message : "Order could not be placed.");
      }
      return;
    }

    const fingerprint = JSON.stringify({ customer, orderItems });

    try {
      setStatus("starting");

      const [checkout] = await Promise.all([
        session?.fingerprint === fingerprint
          ? Promise.resolve(session.value)
          : postJson<CheckoutSession>("/api/checkout", {
              paymentMethod: "razorpay",
              customer,
              items: orderItems,
            }),
        loadRazorpay(),
      ]);
      setSession({ fingerprint, value: checkout });

      setStatus("paying");
      openPaymentWindow(checkout, customer);
    } catch (error) {
      setStatus("idle");
      setErrorMessage(error instanceof Error ? error.message : "Payment could not start.");
    }
  }

  function openPaymentWindow(checkout: CheckoutSession, customer: CheckoutCustomer) {
    openRazorpay(
      {
        key: checkout.keyId,
        order_id: checkout.razorpayOrderId,
        amount: checkout.amount,
        currency: checkout.currency,
        name: SITE_NAME,
        description: `Order #${checkout.wcOrderId}`,
        image: absoluteUrl("/sharif-store-logo-transparent.png"),
        prefill: {
          name: `${customer.firstName} ${customer.lastName}`,
          email: customer.email,
          contact: `+91${customer.phone}`,
        },
        notes: { woocommerce_order_id: String(checkout.wcOrderId) },
        theme: { color: "#e80071" },
        modal: {
          confirm_close: true,
          ondismiss: () => {
            setStatus((current) => (current === "paying" ? "idle" : current));
            setErrorMessage("Payment was cancelled. You can try again.");
          },
        },
        handler: async (response) => {
          setStatus("verifying");
          setErrorMessage("");
          try {
            const { redirectUrl } = await postJson<{ redirectUrl: string }>(
              "/api/checkout/verify",
              {
                wcOrderId: checkout.wcOrderId,
                orderKey: checkout.orderKey,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              },
            );
            setStatus("done");
            clear();
            router.replace(redirectUrl);
          } catch (error) {
            setStatus("idle");
            setSession(null);
            setErrorMessage(
              error instanceof Error ? error.message : "Payment could not be verified.",
            );
          }
        },
      },
      (message) => setErrorMessage(message),
    );
  }

  if (status === "done" || status === "verifying") {
    return (
      <div className="mt-10 flex items-center gap-3 rounded-2xl border border-border bg-muted/20 p-6 text-sm">
        <LoaderCircleIcon className="size-5 animate-spin" />
        {status === "verifying"
          ? "Confirming your payment — please don't close this page."
          : "Taking you to your order…"}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mt-10 flex flex-col items-center gap-4 rounded-2xl border border-border bg-muted/20 px-6 py-14 text-center">
        <ShoppingBagIcon className="size-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Your bag is empty.</p>
        <Link href="/" className={buttonVariants({ size: "lg" })}>
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-14"
    >
      <FieldSet disabled={busy}>
        <FieldLegend className="font-heading text-xl font-semibold">
          Delivery details
        </FieldLegend>
        <FieldGroup className="grid gap-5 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="firstName">First name</FieldLabel>
            <Input id="firstName" name="firstName" autoComplete="given-name" maxLength={60} required className={inputClassName} />
          </Field>
          <Field>
            <FieldLabel htmlFor="lastName">Last name</FieldLabel>
            <Input id="lastName" name="lastName" autoComplete="family-name" maxLength={60} required className={inputClassName} />
          </Field>
          <Field>
            <FieldLabel htmlFor="phone">Mobile number</FieldLabel>
            <Input id="phone" name="phone" type="tel" inputMode="tel" autoComplete="tel-national" placeholder="10-digit mobile" maxLength={14} required className={inputClassName} />
          </Field>
          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input id="email" name="email" type="email" autoComplete="email" maxLength={254} required className={inputClassName} />
          </Field>
          <Field className="sm:col-span-2">
            <FieldLabel htmlFor="address1">Address</FieldLabel>
            <Input id="address1" name="address1" autoComplete="address-line1" placeholder="House no., building, street" maxLength={200} required className={inputClassName} />
          </Field>
          <Field className="sm:col-span-2">
            <FieldLabel htmlFor="address2">Landmark / area (optional)</FieldLabel>
            <Input id="address2" name="address2" autoComplete="address-line2" maxLength={200} className={inputClassName} />
          </Field>
          <Field>
            <FieldLabel htmlFor="city">City</FieldLabel>
            <Input id="city" name="city" autoComplete="address-level2" maxLength={80} required className={inputClassName} />
          </Field>
          <Field>
            <FieldLabel htmlFor="postcode">PIN code</FieldLabel>
            <Input id="postcode" name="postcode" inputMode="numeric" autoComplete="postal-code" pattern="[1-9][0-9]{5}" maxLength={6} required className={inputClassName} />
          </Field>
          <Field className="sm:col-span-2">
            <FieldLabel htmlFor="state">State</FieldLabel>
            <select
              id="state"
              name="state"
              autoComplete="address-level1"
              required
              defaultValue="MH"
              className={cn(
                inputClassName,
                "w-full border border-input bg-transparent px-2.5 text-base outline-none focus-visible:border-ring focus-visible:ring-ring/50 md:text-sm",
              )}
            >
              {INDIAN_STATES.map((state) => (
                <option key={state.code} value={state.code}>
                  {state.name}
                </option>
              ))}
            </select>
          </Field>
          <Field className="sm:col-span-2">
            <FieldLabel htmlFor="note">Order note (optional)</FieldLabel>
            <Textarea id="note" name="note" rows={3} maxLength={500} placeholder="Gift message, delivery instructions…" className="rounded-sm focus-visible:ring-1!" />
          </Field>
        </FieldGroup>
      </FieldSet>

      <aside className="h-fit rounded-2xl border border-border bg-muted/20 p-5 sm:p-6 lg:sticky lg:top-28">
        <h2 className="font-heading text-xl font-semibold">
          Order summary
          <span className="ml-2 text-sm font-normal text-muted-foreground">
            ({totalCount} item{totalCount === 1 ? "" : "s"})
          </span>
        </h2>

        <ul className="mt-5 flex flex-col gap-4">
          {items.map((item) => (
            <li key={`${item.productId}-${item.variationId ?? "base"}`} className="flex gap-3">
              <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-muted">
                {item.image ? (
                  <Image src={item.image.src} alt={item.image.alt} fill sizes="56px" className="object-cover" />
                ) : null}
              </div>
              <div className="min-w-0 flex-1 text-sm">
                <p className="truncate font-semibold capitalize">{item.name}</p>
                {item.variationLabel ? (
                  <p className="truncate text-xs text-muted-foreground">{item.variationLabel}</p>
                ) : null}
                <p className="text-xs text-muted-foreground">Qty {item.quantity}</p>
              </div>
              <span className="text-sm font-semibold">
                {formatMoneyAmount(item.unitPrice * item.quantity, item.currencyCode)}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-5 flex items-center justify-between border-t border-border/70 pt-4 font-semibold">
          <span>Total</span>
          <span>{formatMoneyAmount(subtotal, currencyCode)}</span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          The final amount is confirmed in the payment window.
        </p>

        <fieldset className="mt-6" disabled={busy}>
          <legend className="text-sm font-semibold">Payment method</legend>
          <div className="mt-3 flex flex-col gap-2">
            {PAYMENT_OPTIONS.map((option) => (
              <label
                key={option.value}
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-lg border bg-background p-3 text-sm transition-colors",
                  paymentMethod === option.value
                    ? "border-[#e80071] ring-1 ring-[#e80071]"
                    : "border-border hover:border-foreground/30",
                )}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value={option.value}
                  checked={paymentMethod === option.value}
                  onChange={() => {
                    setPaymentMethod(option.value);
                    setErrorMessage("");
                  }}
                  className="mt-0.5 accent-[#e80071]"
                />
                <span>
                  <span className="block font-semibold">{option.label}</span>
                  <span className="block text-xs text-muted-foreground">
                    {option.description}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <Button type="submit" size="lg" className="mt-5 w-full" disabled={busy}>
          {busy ? (
            <LoaderCircleIcon data-icon="inline-start" className="animate-spin" />
          ) : paymentMethod === "cod" ? (
            <PackageCheckIcon data-icon="inline-start" />
          ) : (
            <LockIcon data-icon="inline-start" />
          )}
          {paymentMethod === "cod"
            ? busy
              ? "Placing order…"
              : "Place order"
            : busy
              ? "Opening payment…"
              : "Pay securely"}
        </Button>

        <p
          role="alert"
          aria-live="assertive"
          className="mt-3 text-sm font-medium text-destructive empty:hidden"
        >
          {errorMessage}
        </p>
      </aside>
    </form>
  );
}
