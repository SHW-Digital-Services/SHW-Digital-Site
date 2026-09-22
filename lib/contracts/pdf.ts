import { jsPDF } from "jspdf";

export type ContractSignature = {
  role: "client" | "shw";
  signer_email: string | null;
  signer_name: string;
  signature_data_url: string;
  signed_at: string;
};

export type ContractForPdf = {
  client_business: string | null;
  client_email: string | null;
  client_name: string;
  contract_payload: {
    deliverables?: string;
    paymentTerms?: string;
    producedBy?: string;
    scope?: string;
    timeline?: string;
  };
  contract_signatures?: ContractSignature[];
  contract_value: number | null;
  deposit_percent: number;
  id: number;
  service_type: string;
  status: string;
};

function currency(value: number | null) {
  if (value === null) return "To be agreed";
  return new Intl.NumberFormat("en-GB", { currency: "GBP", style: "currency" }).format(value);
}

export function fileSafe(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "client";
}

export function createContractPdf(contract: ContractForPdf) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const left = 56;
  const pageBottom = 760;
  let y = 64;

  const ensureSpace = (height: number) => {
    if (y + height <= pageBottom) return;
    doc.addPage();
    y = 64;
  };

  const writeHeading = (text: string) => {
    ensureSpace(46);
    doc.setTextColor(20);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text(text, left, y);
    y += 20;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
  };

  const writeBody = (text: string) => {
    const lines = doc.splitTextToSize(text || "To be confirmed.", 480);
    ensureSpace(lines.length * 13 + 20);
    doc.text(lines, left, y);
    y += lines.length * 13 + 18;
  };

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("SHW Digital Services", left, y);
  y += 28;
  doc.setFontSize(15);
  doc.text(`Contract ${contract.id}: ${contract.service_type}`, left, y);
  y += 34;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  writeBody(
    [
      `Client: ${contract.client_name}`,
      contract.client_business ? `Business: ${contract.client_business}` : "",
      contract.client_email ? `Email: ${contract.client_email}` : "",
      `Value: ${currency(contract.contract_value)}`,
      `Deposit: ${contract.deposit_percent}%`,
      `Status: ${contract.status}`,
    ]
      .filter(Boolean)
      .join("\n"),
  );

  writeHeading("Scope");
  writeBody(contract.contract_payload.scope || "");
  writeHeading("Deliverables");
  writeBody(contract.contract_payload.deliverables || "");
  writeHeading("Timeline");
  writeBody(contract.contract_payload.timeline || "");
  writeHeading("Payment Terms");
  writeBody(contract.contract_payload.paymentTerms || "");

  writeHeading("Signatures");
  const signatures = contract.contract_signatures ?? [];
  const signatureRows = [
    { label: "Client", signature: signatures.find((signature) => signature.role === "client") },
    { label: "SHW Digital Services", signature: signatures.find((signature) => signature.role === "shw") },
  ];

  for (const row of signatureRows) {
    ensureSpace(112);
    doc.setDrawColor(170);
    doc.roundedRect(left, y, 480, 84, 5, 5);
    doc.setTextColor(20);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(row.label, left + 14, y + 20);

    if (row.signature) {
      try {
        doc.addImage(row.signature.signature_data_url, "PNG", left + 14, y + 28, 150, 34);
      } catch {
        doc.setFont("helvetica", "normal");
        doc.text("Signature image could not be embedded.", left + 14, y + 44);
      }
      doc.setFont("helvetica", "normal");
      doc.text(`Signed by ${row.signature.signer_name}`, left + 190, y + 42);
      doc.text(`Date ${new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(new Date(row.signature.signed_at))}`, left + 190, y + 58);
    } else {
      doc.setFont("helvetica", "normal");
      doc.text("Awaiting signature.", left + 14, y + 48);
    }
    y += 102;
  }

  doc.setFontSize(9);
  doc.setTextColor(90);
  doc.text("Produced by SHW Digital Services Contract Centre.", left, 790);
  return doc;
}
