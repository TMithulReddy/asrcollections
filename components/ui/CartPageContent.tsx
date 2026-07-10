"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import CartCheckoutButton from "@/components/ui/CartCheckoutButton";
import { useCart } from "@/lib/cart-context";
import { getImageUrl } from "@/lib/cloudinary";

function formatPrice(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

const IMAGE_WIDTH = 96;
const IMAGE_HEIGHT = 128;

export default function CartPageContent() {
  const { items, removeItem, updateQuantity, cartTotal } = useCart();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center">
        <h1 className="font-heading text-2xl text-brand-plum">Your cart</h1>
        <p className="mt-4 text-brand-rose">Your cart is empty</p>
        <Link
          href="/category"
          className="mt-6 inline-block text-sm font-medium text-brand-mauve underline-offset-2 hover:underline"
        >
          Browse sarees
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="font-heading text-2xl text-brand-plum sm:text-3xl">
        Your cart
      </h1>

      <ul className="mt-8 divide-y divide-brand-blushDark border-y border-brand-blushDark">
        {items.map((item) => {
          const unitPrice = item.discountPrice ?? item.price;
          const lineTotal = unitPrice * item.quantity;

          return (
            <li
              key={item.productId}
              className="flex gap-4 py-5 sm:items-center sm:gap-6"
            >
              <div className="shrink-0 overflow-hidden rounded-lg bg-brand-blushDark">
                <Image
                  src={getImageUrl(item.image, IMAGE_WIDTH)}
                  alt={item.name}
                  width={IMAGE_WIDTH}
                  height={IMAGE_HEIGHT}
                  className="h-auto w-20 object-cover sm:w-24"
                />
              </div>

              <div className="min-w-0 flex-1">
                <h2 className="text-sm font-medium text-brand-plum sm:text-base">
                  {item.name}
                </h2>

                <div className="mt-1 flex flex-wrap items-baseline gap-2">
                  {item.discountPrice !== undefined ? (
                    <>
                      <span className="text-sm text-brand-rose line-through">
                        {formatPrice(item.price)}
                      </span>
                      <span className="text-sm font-bold text-brand-plum">
                        {formatPrice(item.discountPrice)}
                      </span>
                    </>
                  ) : (
                    <span className="text-sm font-bold text-brand-plum">
                      {formatPrice(item.price)}
                    </span>
                  )}
                </div>

                <div className="mt-3 flex items-center gap-3">
                  <div className="flex items-center rounded-lg border border-brand-blushDark">
                    <button
                      type="button"
                      aria-label="Decrease quantity"
                      onClick={() =>
                        updateQuantity(item.productId, item.quantity - 1)
                      }
                      disabled={item.quantity <= 1}
                      className="p-2 text-brand-plum disabled:opacity-40"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="min-w-8 text-center text-sm text-brand-plum">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      aria-label="Increase quantity"
                      onClick={() =>
                        updateQuantity(item.productId, item.quantity + 1)
                      }
                      className="p-2 text-brand-plum"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>

                  <button
                    type="button"
                    aria-label="Remove item"
                    onClick={() => removeItem(item.productId)}
                    className="p-2 text-brand-rose"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <p className="shrink-0 text-sm font-bold text-brand-plum sm:text-base">
                {formatPrice(lineTotal)}
              </p>
            </li>
          );
        })}
      </ul>

      <div className="mt-8 flex flex-col items-end gap-4">
        <div className="flex w-full max-w-xs items-center justify-between text-brand-plum">
          <span className="text-sm">Subtotal</span>
          <span className="text-lg font-bold">{formatPrice(cartTotal)}</span>
        </div>

        <CartCheckoutButton />
      </div>
    </div>
  );
}
