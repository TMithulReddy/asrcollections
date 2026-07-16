"use client";

import { Download } from "lucide-react";

export interface ExportOrder {
  order_ref: string;
  customerName: string;
  customerPhone: string;
  itemsSummary: string;
  total: number;
  status: string;
  date: string;
}

interface OrderExportButtonProps {
  orders: ExportOrder[];
}

export default function OrderExportButton({ orders }: OrderExportButtonProps) {
  const handleExport = async () => {
    if (orders.length === 0) {
      alert("No orders to export in this view.");
      return;
    }

    const { default: jsPDF } = await import("jspdf");
    const { default: autoTable } = await import("jspdf-autotable");
    const doc = new jsPDF();

    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    // brand.plum approx RGB
    doc.setTextColor(74, 43, 62);
    doc.text("ASR Collections — Order Export", 14, 22);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    const dateStr = new Date().toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    doc.text(`Generated on: ${dateStr}`, 14, 30);
    doc.text(`Total Records: ${orders.length}`, 14, 35);

    const tableColumn = ["Order Ref", "Customer", "Phone", "Items", "Total (INR)", "Status", "Date"];
    const tableRows = orders.map((o) => [
      o.order_ref,
      o.customerName,
      o.customerPhone,
      o.itemsSummary,
      o.total.toLocaleString("en-IN"),
      o.status.charAt(0).toUpperCase() + o.status.slice(1),
      o.date,
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      theme: "striped",
      headStyles: {
        fillColor: [74, 43, 62],
        textColor: 255,
        fontStyle: "bold",
      },
      styles: {
        fontSize: 8,
        cellPadding: 3,
      },
      columnStyles: {
        3: { cellWidth: 50 },
      },
    });

    const filename = `asr-orders-${new Date().toISOString().split("T")[0]}.pdf`;
    doc.save(filename);
  };

  return (
    <button
      onClick={handleExport}
      className="flex items-center px-4 py-2 bg-brand-white text-brand-plum border border-brand-rose/40 rounded-md hover:bg-brand-blush/50 transition-colors text-sm font-medium shadow-sm"
    >
      <Download className="w-4 h-4 mr-2" />
      Export to PDF
    </button>
  );
}
