"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/customers", label: "Customers" },
  { href: "/admin/promotions", label: "Promotions" },
  { href: "/admin/banners", label: "Banners" },
];

export default function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex-1 px-4 py-4 space-y-2">
      {navLinks.map((link) => {
        const isActive = pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`block px-4 py-2 rounded-md transition-colors ${
              isActive
                ? "bg-brand-mauve text-brand-white font-medium"
                : "text-brand-blush hover:bg-brand-mauve/50"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
