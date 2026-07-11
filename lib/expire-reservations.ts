import { supabase } from "@/lib/supabase";

/**
 * Expire a single stale reservation: sets status back to "available"
 * if the product is currently "reserved" and reserved_until is in the past.
 *
 * @returns true if the reservation was actually released, false otherwise
 */
export async function expireStaleReservation(
  productId: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from("products")
    .update({ status: "available", reserved_until: null })
    .eq("id", productId)
    .eq("status", "reserved")
    .lt("reserved_until", new Date().toISOString())
    .select("id");

  if (error) {
    console.error("expireStaleReservation failed:", error);
    return false;
  }

  return (data?.length ?? 0) > 0;
}

/**
 * Expire ALL stale reservations across every product. Call this at
 * page-load time on browsing pages (homepage, /sarees, /category/[slug])
 * so that badges reflect the true current status without a cron job.
 */
export async function expireAllStaleReservations(): Promise<void> {
  const { error } = await supabase
    .from("products")
    .update({ status: "available", reserved_until: null })
    .eq("status", "reserved")
    .lt("reserved_until", new Date().toISOString());

  if (error) {
    console.error("expireAllStaleReservations failed:", error);
  }
}
