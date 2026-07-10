"use client";

import Button from "@/components/ui/Button";
import { useCart } from "@/lib/cart-context";

interface AddToCartButtonProps {
  productId: string;
  name: string;
  price: number;
  discountPrice?: number;
  image: string;
  disabled?: boolean;
}

export default function AddToCartButton({
  productId,
  name,
  price,
  discountPrice,
  image,
  disabled = false,
}: AddToCartButtonProps) {
  const { addItem } = useCart();

  return (
    <Button
      variant="primary"
      disabled={disabled}
      onClick={() =>
        addItem({ productId, name, price, discountPrice, image })
      }
    >
      Add to cart
    </Button>
  );
}
