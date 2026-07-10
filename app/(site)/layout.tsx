import Link from "next/link";
import { Heart, Search } from "lucide-react";
import CartNavLink from "@/components/ui/CartNavLink";
import { CartProvider } from "@/lib/cart-context";

const footerLinks = [
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/shipping-policy", label: "Shipping Policy" },
  { href: "/return-policy", label: "Return Policy" },
];

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b border-brand-blushDark bg-brand-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link
            href="/"
            className="font-heading text-xl text-brand-plum"
          >
            ASR Collections
          </Link>

          <nav className="flex items-center gap-5 text-brand-plum sm:gap-6">
            <button type="button" aria-label="Search" className="p-1">
              <Search className="h-5 w-5" strokeWidth={1.75} />
            </button>
            <button type="button" aria-label="Wishlist" className="p-1">
              <Heart className="h-5 w-5" strokeWidth={1.75} />
            </button>
            <CartNavLink />
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="bg-brand-plum text-brand-blush">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <p className="font-heading text-lg">ASR Collections</p>

          <ul className="mt-6 flex flex-col gap-3 text-sm sm:flex-row sm:flex-wrap sm:gap-x-8 sm:gap-y-3">
            {footerLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="transition-opacity hover:opacity-80"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <p className="mt-8 border-t border-brand-rose/30 pt-6 text-xs text-brand-blush/60">
            © {new Date().getFullYear()} ASR Collections. All rights reserved.
          </p>
        </div>
      </footer>
      </div>
    </CartProvider>
  );
}
