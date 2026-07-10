import { NextResponse } from "next/server";
import { normalizePhone } from "@/lib/checkout-validation";
import { createCartOrder } from "@/lib/create-cart-order";

interface CartCheckoutRequestBody {
  name?: string;
  phone?: string;
  items?: { productId?: string; quantity?: number }[];
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CartCheckoutRequestBody;
    const name = body.name?.trim();
    const phone = body.phone ? normalizePhone(body.phone) : "";
    const items =
      body.items
        ?.filter((item) => item.productId && item.quantity && item.quantity > 0)
        .map((item) => ({
          productId: item.productId!.trim(),
          quantity: item.quantity!,
        })) ?? [];

    if (!name) {
      return NextResponse.json({ error: "Name is required." }, { status: 400 });
    }

    if (phone.length < 10) {
      return NextResponse.json(
        { error: "Phone must be at least 10 digits." },
        { status: 400 }
      );
    }

    if (items.length === 0) {
      return NextResponse.json({ error: "Cart is empty." }, { status: 400 });
    }

    const result = await createCartOrder({
      customerName: name,
      customerPhone: phone,
      items,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("POST /api/cart-checkout failed:", error);
    return NextResponse.json(
      { error: "Something went wrong, please try again." },
      { status: 500 }
    );
  }
}
