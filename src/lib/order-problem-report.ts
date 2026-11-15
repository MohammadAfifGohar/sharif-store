import { getWhatsAppChatUrl } from "@/lib/whatsapp-order";

/** Matches the 48-hour window in the Terms (Returns, exchanges & refunds). */
export const PROBLEM_REPORT_WINDOW_HOURS = 48;

type ReportableOrder = {
  number: string;
  status: string;
  date_completed_gmt?: string | null;
  line_items: Array<{ name: string; quantity: number }>;
};

/**
 * When the customer can no longer report a problem with this order, or null
 * if the order isn't delivered yet. The store marks an order Completed once
 * it is delivered, so the window runs from WooCommerce's completion time.
 */
export function getProblemReportDeadline(order: ReportableOrder): Date | null {
  if (order.status !== "completed" || !order.date_completed_gmt) return null;

  const raw = order.date_completed_gmt;
  const completedAt = new Date(/[zZ]|[+-]\d\d:?\d\d$/.test(raw) ? raw : `${raw}Z`);
  if (Number.isNaN(completedAt.getTime())) return null;

  return new Date(
    completedAt.getTime() + PROBLEM_REPORT_WINDOW_HOURS * 60 * 60 * 1000,
  );
}

/** The deadline while the report window is still open, otherwise null. */
export function getOpenProblemReportDeadline(
  order: ReportableOrder,
  now: Date = new Date(),
): Date | null {
  const deadline = getProblemReportDeadline(order);
  return deadline && now.getTime() < deadline.getTime() ? deadline : null;
}

/** WhatsApp link pre-filled with the order number, items and what to send. */
export function getProblemReportWhatsAppUrl(order: ReportableOrder) {
  const message = [
    `Hello The Sharif Store, I want to report a problem with order #${order.number}.`,
    "",
    "*Items:*",
    ...order.line_items.map((item) => `- ${item.name} × ${item.quantity}`),
    "",
    "*Problem* (damaged / wrong item / expired / missing):",
    "",
    "",
    "I am sending photos and the unboxing video below.",
  ].join("\n");

  return getWhatsAppChatUrl(message);
}
