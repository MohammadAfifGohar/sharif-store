import { WHATSAPP_NUMBER } from "@/lib/site-config";

type WhatsAppOrderDetails = {
  productName: string;
  price: string;
  productUrl: string;
};

export function getWhatsAppOrderUrl({
  productName,
  price,
  productUrl,
}: WhatsAppOrderDetails) {
  const message = [
    "Hello The Sharif Store! I would like to order this product:",
    "",
    `*Product:* ${productName}`,
    `*Price:* ${price}`,
    `*Product link:* ${productUrl}`,
    "",
    "Please share its availability and delivery details.",
  ].join("\n");

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

type WhatsAppBagOrderItem = {
  name: string;
  quantity: number;
  unitPriceDisplay: string;
  productUrl: string;
};

export function getWhatsAppBagOrderUrl(
  items: WhatsAppBagOrderItem[],
  subtotalDisplay: string,
) {
  const itemLines = items.flatMap((item, index) => [
    `${index + 1}. *${item.name}*`,
    `   Qty: ${item.quantity} x ${item.unitPriceDisplay}`,
    `   ${item.productUrl}`,
  ]);

  const message = [
    "Hello The Sharif Store! I would like to order these products:",
    "",
    ...itemLines,
    "",
    `*Total:* ${subtotalDisplay}`,
    "",
    "Please share their availability and delivery details.",
  ].join("\n");

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
