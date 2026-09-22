"use client";

import SignatureCapture from "../SignatureCapture";
import { type ContractForPdf } from "@/lib/contracts/pdf";
import { signShwContract } from "./actions";
import styles from "./admin.module.css";

export default function ShwSignatureForm({ contract, signerName }: { contract: ContractForPdf; signerName: string }) {
  const signature = contract.contract_signatures?.find((entry) => entry.role === "shw");

  return (
    <form action={signShwContract} className={styles.signatureForm}>
      <input name="contractId" type="hidden" value={contract.id} />
      <SignatureCapture
        actionLabel={signature ? "Update SHW signature" : "Sign as SHW"}
        buttonClassName={styles.secondaryButton}
        canvasClassName={styles.signaturePad}
        existingSignature={signature?.signature_data_url}
        labelClassName={styles.field}
        signerNameDefault={signature?.signer_name ?? signerName}
      />
    </form>
  );
}
