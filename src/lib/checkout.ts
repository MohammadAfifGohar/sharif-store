import { z } from "zod";

/** WooCommerce's state codes for India (woocommerce/i18n/states.php). */
export const INDIAN_STATES = [
  { code: "AN", name: "Andaman and Nicobar Islands" },
  { code: "AP", name: "Andhra Pradesh" },
  { code: "AR", name: "Arunachal Pradesh" },
  { code: "AS", name: "Assam" },
  { code: "BR", name: "Bihar" },
  { code: "CH", name: "Chandigarh" },
  { code: "CT", name: "Chhattisgarh" },
  { code: "DH", name: "Dadra and Nagar Haveli and Daman and Diu" },
  { code: "DL", name: "Delhi" },
  { code: "GA", name: "Goa" },
  { code: "GJ", name: "Gujarat" },
  { code: "HP", name: "Himachal Pradesh" },
  { code: "HR", name: "Haryana" },
  { code: "JH", name: "Jharkhand" },
  { code: "JK", name: "Jammu and Kashmir" },
  { code: "KA", name: "Karnataka" },
  { code: "KL", name: "Kerala" },
  { code: "LA", name: "Ladakh" },
  { code: "LD", name: "Lakshadweep" },
  { code: "MH", name: "Maharashtra" },
  { code: "ML", name: "Meghalaya" },
  { code: "MN", name: "Manipur" },
  { code: "MP", name: "Madhya Pradesh" },
  { code: "MZ", name: "Mizoram" },
  { code: "NL", name: "Nagaland" },
  { code: "OD", name: "Odisha" },
  { code: "PB", name: "Punjab" },
  { code: "PY", name: "Puducherry" },
  { code: "RJ", name: "Rajasthan" },
  { code: "SK", name: "Sikkim" },
  { code: "TS", name: "Telangana" },
  { code: "TN", name: "Tamil Nadu" },
  { code: "TR", name: "Tripura" },
  { code: "UP", name: "Uttar Pradesh" },
  { code: "UK", name: "Uttarakhand" },
  { code: "WB", name: "West Bengal" },
] as const;

const stateCodes = INDIAN_STATES.map((state) => state.code) as [
  string,
  ...string[],
];

const requiredText = (label: string, max: number) =>
  z
    .string()
    .trim()
    .min(1, `Enter your ${label}.`)
    .max(max, `Your ${label} is too long.`);

export const checkoutCustomerSchema = z.object({
  firstName: requiredText("first name", 60),
  lastName: requiredText("last name", 60),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email("Enter a valid email address.").max(254, "Enter a valid email address.")),
  phone: z
    .string()
    .transform((value) => value.replace(/[\s-]/g, "").replace(/^(\+91|0)/, ""))
    .pipe(z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number.")),
  address1: requiredText("address", 200),
  address2: z.string().trim().max(200).optional().default(""),
  city: requiredText("city", 80),
  state: z.enum(stateCodes, "Choose your state."),
  postcode: z.string().trim().regex(/^[1-9]\d{5}$/, "Enter a valid 6-digit PIN code."),
  note: z.string().trim().max(500).optional().default(""),
});

export const checkoutItemSchema = z.object({
  productId: z.number().int().positive(),
  variationId: z.number().int().positive().nullable(),
  quantity: z.number().int().min(1).max(99),
});

export const PAYMENT_METHODS = ["razorpay", "cod"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

/** Extra charge (₹) added to Cash on Delivery orders. */
export const COD_FEE = 70;
export const COD_FEE_LABEL = "Cash on Delivery charges";

export const checkoutRequestSchema = z
  .object({
    paymentMethod: z.enum(PAYMENT_METHODS, "Choose a payment method."),
    customer: checkoutCustomerSchema,
    items: z
      .array(checkoutItemSchema)
      .min(1, "Your bag is empty.")
      .max(50, "Too many items in one order."),
  })
  .strict();

export type CheckoutCustomer = z.infer<typeof checkoutCustomerSchema>;
export type CheckoutRequest = z.infer<typeof checkoutRequestSchema>;

/** `/api/checkout` response for a Cash on Delivery order: it's already placed. */
export type CodOrderResult = { kind: "cod"; redirectUrl: string };

/** `/api/checkout` response for online payment: what Razorpay Checkout needs to open. */
export type CheckoutSession = {
  kind: "razorpay";
  keyId: string;
  razorpayOrderId: string;
  amount: number;
  currency: string;
  wcOrderId: number;
  orderKey: string;
};

export const paymentVerificationSchema = z
  .object({
    wcOrderId: z.number().int().positive(),
    orderKey: z.string().min(1).max(64),
    razorpayOrderId: z.string().min(1).max(64),
    razorpayPaymentId: z.string().min(1).max(64),
    razorpaySignature: z.string().regex(/^[a-f0-9]{64}$/i),
  })
  .strict();

export type PaymentVerification = z.infer<typeof paymentVerificationSchema>;

export function getOrderConfirmationPath(wcOrderId: number, orderKey: string) {
  const params = new URLSearchParams({ order: String(wcOrderId), key: orderKey });
  return `/order-confirmation?${params.toString()}`;
}

/** WooCommerce returns totals as decimal strings ("1297.00"); Razorpay wants paise. */
export function toMinorUnits(amount: string) {
  const value = Number(amount);
  return Number.isFinite(value) ? Math.round(value * 100) : NaN;
}
