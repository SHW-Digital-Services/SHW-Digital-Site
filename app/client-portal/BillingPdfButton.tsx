"use client";

import { FileDown } from "lucide-react";
import { jsPDF } from "jspdf";
import styles from "./portal.module.css";

type PaymentForPdf = {
  amount: number;
  due_date: string | null;
  id: number;
  paid_at: string | null;
  payment_status: string;
  payment_type: string;
};

function currency(value: number) {
  return new Intl.NumberFormat("en-GB", { currency: "GBP", style: "currency" }).format(value);
}

function dateValue(value: string | null) {
  if (!value) return "TBA";
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(new Date(value));
}

export default function BillingPdfButton({ clientEmail, payment }: { clientEmail: string; payment: PaymentForPdf }) {
  return (
    <button
      className={styles.secondaryButton}
      onClick={() => {
        const doc = new jsPDF({ unit: "pt", format: "a4" });
        doc.setFont("helvetica", "bold");
        doc.setFontSize(20);
        doc.text("SHW Digital Services", 56, 64);
        doc.setFontSize(15);
        doc.text(`Billing record ${payment.id}`, 56, 98);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        doc.text(`Client: ${clientEmail}`, 56, 140);
        doc.text(`Type: ${payment.payment_type}`, 56, 162);
        doc.text(`Amount: ${currency(payment.amount)}`, 56, 184);
        doc.text(`Status: ${payment.payment_status}`, 56, 206);
        doc.text(`Due: ${dateValue(payment.due_date)}`, 56, 228);
        doc.text(`Paid: ${dateValue(payment.paid_at)}`, 56, 250);
        doc.setFontSize(9);
        doc.setTextColor(90);
        doc.text("Generated from the SHW Digital Services Client Portal.", 56, 790);
        doc.save(`shw-billing-${payment.id}.pdf`);
      }}
      type="button"
    >
      <FileDown size={17} aria-hidden="true" />
      Download PDF
    </button>
  );
}
