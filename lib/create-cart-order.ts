import { supabase } from "@/lib/supabase";
import { insertOrderWithRetry } from "@/lib/order-ref";
import { releaseReservedProducts, rollbackOrder } from "@/lib/order-rollback";
import { expireStaleReservation } from "@/lib/expire-reservations";

export interface CartCheckoutItem {
  productId: string;
  quantity: number;
}

interface CartCheckoutInput {
  customerName: string;
  customerPhone: string;
  items: CartCheckoutItem[];
}

export interface CartCheckoutLineItem {
  name: string;
  quantity: number;
  unitPrice: number;
}

export interface CartCheckoutResult {
  orderRef: string;
  totalAmount: number;
  lineItems: CartCheckoutLineItem[];
}

export async function createCartOrder(
  input: CartCheckoutInput
): Promise<CartCheckoutResult> {
  if (input.items.length === 0) {
    throw new Error("Cart is empty");
  }

  let customerId: string | null = null;
  let orderId: string | null = null;
  const reservedProductIds: string[] = [];

  try {
    const slugs = input.items.map((item) => item.productId);

    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("id, slug, name, price, discount_price, status")
      .in("slug", slugs);

    if (productsError || !products) {
      throw productsError ?? new Error("Failed to load products");
    }

    // Expire stale reservations for all products in the cart
    for (const product of products) {
      await expireStaleReservation(product.id);
    }

    // Re-fetch products after potential expiry to get fresh statuses
    const { data: freshProducts, error: freshError } = await supabase
      .from("products")
      .select("id, slug, name, price, discount_price, status")
      .in("slug", slugs);

    if (freshError || !freshProducts) {
      throw freshError ?? new Error("Failed to reload products");
    }

    const productBySlug = new Map(freshProducts.map((product) => [product.slug, product]));
    const lineItems: CartCheckoutLineItem[] = [];
    let totalAmount = 0;

    for (const cartItem of input.items) {
      const product = productBySlug.get(cartItem.productId);

      if (!product) {
        throw new Error(`Product not found: ${cartItem.productId}`);
      }

      if (product.status !== "available") {
        throw new Error(`Product is not available: ${product.name}`);
      }

      const unitPrice = product.discount_price ?? product.price;
      totalAmount += unitPrice * cartItem.quantity;

      lineItems.push({
        name: product.name,
        quantity: cartItem.quantity,
        unitPrice,
      });
    }

    const { data: customer, error: customerError } = await supabase
      .from("customers")
      .insert({
        name: input.customerName,
        phone: input.customerPhone,
      })
      .select("id")
      .single();

    if (customerError || !customer) {
      throw customerError ?? new Error("Failed to create customer");
    }

    customerId = customer.id;

    const order = await insertOrderWithRetry({
      customerId: customer.id,
      totalAmount,
    });
    orderId = order.orderId;

    const orderItemsPayload = input.items.map((cartItem) => {
      const product = productBySlug.get(cartItem.productId)!;
      const unitPrice = product.discount_price ?? product.price;

      return {
        order_id: orderId!,
        product_id: product.id,
        product_name_snapshot: product.name,
        price_snapshot: unitPrice,
        quantity: cartItem.quantity,
      };
    });

    const { error: orderItemsError } = await supabase
      .from("order_items")
      .insert(orderItemsPayload);

    if (orderItemsError) {
      throw orderItemsError;
    }

    const uniqueProductIds = Array.from(
      new Set(input.items.map((item) => productBySlug.get(item.productId)!.id))
    );

    for (const productId of uniqueProductIds) {
      const { data: reserved, error: reserveError } = await supabase.rpc(
        "reserve_product",
        { p_product_id: productId, p_hours: 4 }
      );

      if (reserveError || reserved !== true) {
        throw reserveError ?? new Error("One or more products could not be reserved");
      }

      reservedProductIds.push(productId);
    }

    return {
      orderRef: order.orderRef,
      totalAmount,
      lineItems,
    };
  } catch (error) {
    console.error("Cart checkout failed:", error);
    await releaseReservedProducts(reservedProductIds);
    await rollbackOrder({ customerId, orderId });
    throw error;
  }
}
