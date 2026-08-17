"use client";

import { Download, Eye } from "lucide-react";
import SignatureCapture from "../SignatureCapture";
import { createContractPdf, fileSafe, type ContractForPdf } from "@/lib/contracts/pdf";
import { signClientContract } from "./actions";
import styles from "./portal.module.css";

function signatureStatus(contract: ContractForPdf, role: "client" | "shw") {
  return contract.contract_signatures?.find((signature) => signature.role === role);
}

export default function ClientContractTools({ contract, signerName }: { contract: ContractForPdf; signerName: string }) {
  const clientSignature = signatureStatus(contract, "client");
  const shwSignature = signatureStatus(contract, "shw");

  const viewPdf = () => {
    try {
      const url = URL.createObjectURL(createContractPdf(contract).output("blob"));
      window.open(url, "_blank", "noopener,noreferrer");
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
      window.alert("Contract PDF opened.");
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "The contract PDF could not be opened.");
    }
  };

  const downloadPdf = () => {
    try {
      createContractPdf(contract).save(`shw-contract-${contract.id}-${fileSafe(contract.client_name)}.pdf`);
      window.alert("Contract PDF downloaded.");
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "The contract PDF could not be downloaded.");
    }
  };

  return (
    <div className={styles.contractTools}>
      <div className={styles.buttonRow}>
        <button className={styles.secondaryButton} onClick={viewPdf} type="button">
          <Eye size={17} aria-hidden="true" />
          View PDF
        </button>
        <button className={styles.secondaryButton} onClick={downloadPdf} type="button">
          <Download size={17} aria-hidden="true" />
          Download PDF
        </button>
      </div>
      <div className={styles.signatureGrid}>
        <span className={clientSignature ? styles.signedBadge : styles.pendingBadge}>{clientSignature ? "Client signed" : "Client signature required"}</span>
        <span className={shwSignature ? styles.signedBadge : styles.pendingBadge}>{shwSignature ? "SHW signed" : "Awaiting SHW signature"}</span>
      </div>
      <form action={signClientContract} className={styles.signatureForm}>
        <input name="contractId" type="hidden" value={contract.id} />
        <SignatureCapture
          actionLabel={clientSignature ? "Update signature" : "Sign contract"}
          buttonClassName={styles.secondaryButton}
          canvasClassName={styles.signaturePad}
          existingSignature={clientSignature?.signature_data_url}
          labelClassName={styles.field}
          signerNameDefault={clientSignature?.signer_name ?? signerName}
        />
      </form>
    </div>
  );
}