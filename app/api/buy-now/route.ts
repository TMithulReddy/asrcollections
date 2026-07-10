import { NextResponse } from "next/server";
import { createBuyNowOrder } from "@/lib/create-buy-now-order";

interface BuyNowRequestBody {
  productSlug?: string;
  name?: string;
  phone?: string;
}

function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as BuyNowRequestBody;
    const productSlug = body.productSlug?.trim();
    const name = body.name?.trim();
    const phone = body.phone ? normalizePhone(body.phone) : "";

    if (!productSlug) {
      return NextResponse.json(
        { error: "Product is required." },
        { status: 400 }
      );
    }

    if (!name) {
      return NextResponse.json(
        { error: "Name is required." },
        { status: 400 }
      );
    }

    if (phone.length < 10) {
      return NextResponse.json(
        { error: "Phone must be at least 10 digits." },
        { status: 400 }
      );
    }

    const result = await createBuyNowOrder({
      productSlug,
      customerName: name,
      customerPhone: phone,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("POST /api/buy-now failed:", error);
    return NextResponse.json(
      { error: "Something went wrong, please try again." },
      { status: 500 }
    );
  }
}
