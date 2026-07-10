export function buildWhatsAppUrl(phoneNumber: string, message: string): string {
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${phoneNumber}?text=${encoded}`;
}

export function buildBuyNowMessage({
  productName,
  price,
  productPageUrl,
  orderRef,
  customerName,
  customerPhone,
}: {
  productName: string;
  price: number;
  productPageUrl: string;
  orderRef: string;
  customerName: string;
  customerPhone: string;
}): string {
  return `Hi, I'd like to order: ${productName} — Rs ${price}. Link: ${productPageUrl}. Order Ref: ${orderRef}. Name: ${customerName}, Phone: ${customerPhone}.`;
}

export function buildCartCheckoutMessage({
  lineItems,
  totalAmount,
  orderRef,
  customerName,
  customerPhone,
}: {
  lineItems: { name: string; quantity: number; unitPrice: number }[];
  totalAmount: number;
  orderRef: string;
  customerName: string;
  customerPhone: string;
}): string {
  const itemLines = lineItems
    .map(
      (item) =>
        `- ${item.name} x${item.quantity} — Rs ${item.unitPrice * item.quantity}`
    )
    .join("\n");

  return `Hi, I'd like to order:\n${itemLines}\nTotal: Rs ${totalAmount}\nOrder Ref: ${orderRef}\nName: ${customerName}, Phone: ${customerPhone}.`;
}
