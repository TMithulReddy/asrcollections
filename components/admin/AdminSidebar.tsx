"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import SidebarNav from "@/components/admin/SidebarNav";

export default function AdminSidebar({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  // Close on escape key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // Prevent scroll when panel is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden flex-shrink-0 flex items-center justify-between p-4 bg-brand-plum border-b border-brand-rose/20 z-20 relative">
        <Link href="/admin/dashboard" className="text-xl font-heading text-brand-white">
          ASR Admin
        </Link>
        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
          className="p-1 text-brand-white"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Backdrop */}
      {open && (
        <div
          aria-hidden="true"
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 w-56 bg-brand-plum border-r border-brand-rose/20 flex flex-col shadow-xl",
          "transform transition-transform duration-300 ease-in-out md:static md:translate-x-0 md:shadow-none",
          open ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        <div className="p-6 pb-4 hidden md:block">
          <Link href="/admin/dashboard" className="text-xl font-heading text-brand-white">
            ASR Admin
          </Link>
        </div>
        
        <div className="px-4 pb-4 border-b border-brand-blush/20 mb-4 mt-4 md:mt-0 flex flex-col gap-4">
          <div className="flex md:hidden justify-end">
            <button
              onClick={() => setOpen(false)}
              className="p-1 text-brand-white"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <Link 
            href="/" 
            className="flex items-center w-full px-4 py-2 text-brand-blush border border-brand-blush/20 hover:bg-brand-mauve/20 rounded-md transition-colors text-sm"
          >
            ← Back to Store
          </Link>
        </div>
        
        <div onClick={() => setOpen(false)}>
          <SidebarNav />
        </div>

        <div className="p-4 border-t border-brand-blush/20 mt-auto md:mt-0">
          {children}
        </div>
      </aside>
    </>
  );
}
