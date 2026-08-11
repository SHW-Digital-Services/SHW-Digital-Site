"use client";

import { Archive, FileDown } from "lucide-react";
import { createContractPdf, fileSafe, type ContractForPdf } from "@/lib/contracts/pdf";
import styles from "./admin.module.css";

export type ContractForDownload = ContractForPdf;

function crc32(data: Uint8Array) {
  let crc = -1;
  for (const byte of data) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }
  return (crc ^ -1) >>> 0;
}

function writeUint16(bytes: number[], value: number) {
  bytes.push(value & 255, (value >>> 8) & 255);
}

function writeUint32(bytes: number[], value: number) {
  bytes.push(value & 255, (value >>> 8) & 255, (value >>> 16) & 255, (value >>> 24) & 255);
}

function blobPart(data: Uint8Array) {
  return data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer;
}

function createZip(files: { data: Uint8Array; name: string }[]) {
  const encoder = new TextEncoder();
  const localParts: Uint8Array[] = [];
  const centralParts: Uint8Array[] = [];
  let offset = 0;

  for (const file of files) {
    const name = encoder.encode(file.name);
    const checksum = crc32(file.data);
    const localHeader: number[] = [];

    writeUint32(localHeader, 0x04034b50);
    writeUint16(localHeader, 20);
    writeUint16(localHeader, 0);
    writeUint16(localHeader, 0);
    writeUint16(localHeader, 0);
    writeUint16(localHeader, 0);
    writeUint32(localHeader, checksum);
    writeUint32(localHeader, file.data.length);
    writeUint32(localHeader, file.data.length);
    writeUint16(localHeader, name.length);
    writeUint16(localHeader, 0);

    const local = new Uint8Array([...localHeader, ...name, ...file.data]);
    localParts.push(local);

    const centralHeader: number[] = [];
    writeUint32(centralHeader, 0x02014b50);
    writeUint16(centralHeader, 20);
    writeUint16(centralHeader, 20);
    writeUint16(centralHeader, 0);
    writeUint16(centralHeader, 0);
    writeUint16(centralHeader, 0);
    writeUint16(centralHeader, 0);
    writeUint32(centralHeader, checksum);
    writeUint32(centralHeader, file.data.length);
    writeUint32(centralHeader, file.data.length);
    writeUint16(centralHeader, name.length);
    writeUint16(centralHeader, 0);
    writeUint16(centralHeader, 0);
    writeUint16(centralHeader, 0);
    writeUint16(centralHeader, 0);
    writeUint32(centralHeader, 0);
    writeUint32(centralHeader, offset);
    centralParts.push(new Uint8Array([...centralHeader, ...name]));

    offset += local.length;
  }

  const centralSize = centralParts.reduce((total, part) => total + part.length, 0);
  const end: number[] = [];
  writeUint32(end, 0x06054b50);
  writeUint16(end, 0);
  writeUint16(end, 0);
  writeUint16(end, files.length);
  writeUint16(end, files.length);
  writeUint32(end, centralSize);
  writeUint32(end, offset);
  writeUint16(end, 0);

  return new Blob([...localParts.map(blobPart), ...centralParts.map(blobPart), blobPart(new Uint8Array(end))], { type: "application/zip" });
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function ContractPdfButton({ contract }: { contract: ContractForDownload }) {
  return (
    <button
      className={styles.iconButton}
      onClick={() => createContractPdf(contract).save(`shw-contract-${contract.id}-${fileSafe(contract.client_name)}.pdf`)}
      type="button"
      title="Download contract PDF"
      aria-label="Download contract PDF"
    >
      <FileDown size={17} aria-hidden="true" />
    </button>
  );
}

export function ClientContractsZipButton({ clientName, contracts }: { clientName: string; contracts: ContractForDownload[] }) {
  return (
    <button
      className={styles.secondaryButton}
      onClick={() => {
        const files = contracts.map((contract) => ({
          data: new Uint8Array(createContractPdf(contract).output("arraybuffer")),
          name: `shw-contract-${contract.id}-${fileSafe(contract.service_type)}.pdf`,
        }));
        downloadBlob(createZip(files), `shw-contracts-${fileSafe(clientName)}.zip`);
      }}
      type="button"
      title="Download all client contracts as a ZIP"
    >
      <Archive size={17} aria-hidden="true" />
      Download ZIP
    </button>
  );
}
