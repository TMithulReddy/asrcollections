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
