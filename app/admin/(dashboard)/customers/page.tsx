import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import CustomersSearchBox from "@/components/admin/CustomersSearchBox";

export const dynamic = "force-dynamic";

interface CustomersPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function AdminCustomersPage({ searchParams }: CustomersPageProps) {
  const supabase = createClient();
  const searchParamValue = typeof searchParams.search === "string" ? searchParams.search.trim().toLowerCase() : "";

  // 1. Fetch all customers
  const { data: customersData, error: customersError } = await supabase
    .from("customers")
    .select("id, name, phone, created_at")
    .order("created_at", { ascending: false });

  // 2. Fetch all orders (just the fields we need to aggregate)
  const { data: ordersData, error: ordersError } = await supabase
    .from("orders")
    .select("customer_id, status, total_amount, created_at");

  if (customersError || ordersError) {
    console.error("Error fetching customers/orders:", customersError || ordersError);
  }

  // 3. Aggregate orders by customer
  const orderStats = new Map<string, { totalOrders: number; confirmedValue: number; lastOrderDate: string | null }>();
  
  if (ordersData) {
    for (const order of ordersData) {
      if (!order.customer_id) continue;
      
      const stats = orderStats.get(order.customer_id) || { totalOrders: 0, confirmedValue: 0, lastOrderDate: null };
      
      stats.totalOrders++;
      
      if (order.status === "confirmed") {
        stats.confirmedValue += Number(order.total_amount) || 0;
      }
      
      if (order.created_at) {
        if (!stats.lastOrderDate || new Date(order.created_at) > new Date(stats.lastOrderDate)) {
          stats.lastOrderDate = order.created_at;
        }
      }
      
      orderStats.set(order.customer_id, stats);
    }
  }

  // 4. Combine and filter
  let displayCustomers = (customersData || []).map((customer) => {
    const stats = orderStats.get(customer.id) || { totalOrders: 0, confirmedValue: 0, lastOrderDate: null };
    return {
      ...customer,
      totalOrders: stats.totalOrders,
      confirmedValue: stats.confirmedValue,
      lastOrderDate: stats.lastOrderDate,
    };
  });

  if (searchParamValue) {
    displayCustomers = displayCustomers.filter(
      (c) => 
        (c.name && c.name.toLowerCase().includes(searchParamValue)) || 
        (c.phone && c.phone.toLowerCase().includes(searchParamValue))
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-heading text-brand-plum mb-6">Customers</h1>

      <div className="flex justify-between items-center mb-6">
        <CustomersSearchBox initialValue={searchParamValue} />
      </div>

      <div className="bg-brand-white rounded-lg border border-brand-rose/20 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-brand-blush/30 border-b border-brand-rose/20 text-brand-plum text-sm font-medium">
              <th className="px-5 py-4">Name</th>
              <th className="px-5 py-4">Phone</th>
              <th className="px-5 py-4">Total Orders</th>
              <th className="px-5 py-4">Confirmed Value</th>
              <th className="px-5 py-4">Last Order</th>
              <th className="px-5 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-rose/10">
            {displayCustomers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-brand-plum/60">
                  No customers found.
                </td>
              </tr>
            ) : (
              displayCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-brand-blush/10 transition-colors">
                  <td className="px-5 py-4 font-medium text-brand-plum text-sm">
                    {customer.name || "—"}
                  </td>
                  <td className="px-5 py-4 text-sm text-brand-plum/80">
                    {customer.phone || "—"}
                  </td>
                  <td className="px-5 py-4 text-sm text-brand-plum/80">
                    {customer.totalOrders}
                  </td>
                  <td className="px-5 py-4 text-sm text-brand-plum/80">
                    ₹{customer.confirmedValue.toLocaleString("en-IN")}
                  </td>
                  <td className="px-5 py-4 text-sm text-brand-plum/60">
                    {customer.lastOrderDate
                      ? new Date(customer.lastOrderDate).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : "—"}
                  </td>
                  <td className="px-5 py-4 flex justify-end">
                    <Link
                      href={`/admin/customers/${customer.id}`}
                      className="text-brand-plum font-medium text-sm hover:underline"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      </div>
    </div>
  );
}
