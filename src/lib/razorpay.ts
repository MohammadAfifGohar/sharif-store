import "server-only";

const RAZORPAY_API = "https://api.razorpay.com/v1";
const REQUEST_TIMEOUT_MS = 15_000;

export type RazorpayConfig = { keyId: string; keySecret: string };

/** Same Key ID / Secret configured in the WooCommerce Razorpay plugin. */
export function getRazorpayConfig(): RazorpayConfig | null {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  return keyId && keySecret ? { keyId, keySecret } : null;
}

export type RazorpayOrder = {
  id: string;
  amount: number;
  currency: string;
  status: string;
};

export async function createRazorpayOrder(
  config: RazorpayConfig,
  input: {
    amount: number;
    currency: string;
    wcOrderId: number;
    wcOrderNumber: string;
  },
): Promise<RazorpayOrder> {
  const response = await fetch(`${RAZORPAY_API}/orders`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${config.keyId}:${config.keySecret}`).toString("base64")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: input.amount,
      currency: input.currency,
      receipt: `wc_${input.wcOrderId}`,
      payment_capture: 1,
      notes: {
        woocommerce_order_id: String(input.wcOrderId),
        woocommerce_order_number: input.wcOrderNumber,
      },
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Razorpay order creation failed (${response.status}): ${detail}`);
  }

  return (await response.json()) as RazorpayOrder;
}
