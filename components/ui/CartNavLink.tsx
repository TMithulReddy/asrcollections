"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart-context";

export default function CartNavLink() {
  const { itemCount } = useCart();

  return (
    <Link
      href="/cart"
      aria-label={`Cart${itemCount > 0 ? `, ${itemCount} items` : ""}`}
      className="relative p-1"
    >
      <ShoppingBag className="h-5 w-5" strokeWidth={1.75} />
      {itemCount > 0 && (
        <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-mauve px-1 text-[10px] font-medium text-brand-white">
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      )}
    </Link>
  );
}
