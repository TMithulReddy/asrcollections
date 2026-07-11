import { supabase } from "@/lib/supabase";

/**
 * Expire a single stale reservation: sets status back to "available"
 * if the product is currently "reserved" and reserved_until is in the past.
 * Uses the expire_reservation RPC to bypass RLS on the products table.
 *
 * @returns true if the reservation was actually released, false otherwise
 */
export async function expireStaleReservation(
  productId: string
): Promise<boolean> {
  const { data, error } = await supabase.rpc("expire_reservation", {
    p_product_id: productId,
  });

  if (error) {
    console.error("expireStaleReservation failed:", error);
    return false;
  }

  return data === true;
}

/**
 * Expire ALL stale reservations across every product. Call this at
 * page-load time on browsing pages (homepage, /sarees, /category/[slug])
 * so that badges reflect the true current status without a cron job.
 * Uses the expire_all_reservations RPC to bypass RLS on the products table.
 */
export async function expireAllStaleReservations(): Promise<void> {
  const { error } = await supabase.rpc("expire_all_reservations");

  if (error) {
    console.error("expireAllStaleReservations failed:", error);
  }
}
