/**
 * Calculates the effective discount price for a product,
 * considering manual discount_price on the product row first,
 * then falling back to any applicable active promotion.
 */

export interface Promotion {
  id: string;
  name: string;
  discount_percent: number;
  category_id: string | null;
  product_ids: string[] | null;
  start_date: string | null;
  end_date: string | null;
  active: boolean;
}

export interface ProductForPricing {
  id: string;
  price: number;
  discount_price: number | null;
  category_id: string | null;
}

/**
 * Returns true when a promotion is currently in effect:
 * - active must be true
 * - current date must be >= start_date (if set)
 * - current date must be <= end_date (if set)
 */
function isPromotionCurrentlyActive(promo: Promotion): boolean {
  if (!promo.active) return false;

  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  if (promo.start_date && today < promo.start_date) return false;
  if (promo.end_date && today > promo.end_date) return false;

  return true;
}

/**
 * Given a product and a list of promotions, returns the effective
 * discounted price (or undefined if no discount applies).
 *
 * Priority:
 * 1. If the product already has a manually-set discount_price, use that.
 * 2. Otherwise, find the best applicable active promotion
 *    (category-wide matching the product's category_id, or
 *     "all products" promotions where category_id is null).
 *    Apply: price - (price * discount_percent / 100), rounded to 2 decimals.
 * 3. If nothing applies, return undefined.
 */
export function getEffectivePrice(
  product: ProductForPricing,
  promotions: Promotion[]
): number | undefined {
  // Priority 1: manual discount_price on the product row
  if (product.discount_price !== null && product.discount_price !== undefined) {
    return product.discount_price;
  }

  // Priority 2: find best matching active promotion
  const applicablePromotions = promotions.filter((promo) => {
    if (!isPromotionCurrentlyActive(promo)) return false;

    // Promotion with specific products
    if (promo.product_ids && promo.product_ids.length > 0) {
      return promo.product_ids.includes(product.id);
    }

    // Promotion with a specific category_id applies if it matches the product's category
    if (promo.category_id) {
      return promo.category_id === product.category_id;
    }

    // Promotion with null category_id and null/empty product_ids applies to ALL products
    return true;
  });

  if (applicablePromotions.length === 0) return undefined;

  // Pick the highest discount percent (best deal for the customer)
  const bestPromo = applicablePromotions.reduce((best, current) =>
    current.discount_percent > best.discount_percent ? current : best
  );

  const discounted = product.price - (product.price * bestPromo.discount_percent) / 100;
  return Math.round(discounted * 100) / 100;
}
