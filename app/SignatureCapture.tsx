"use client";

import Image from "next/image";
import { ChangeEvent, PointerEvent, useRef, useState } from "react";
import { Eraser, PenLine, Upload } from "lucide-react";

type SignatureCaptureProps = {
  actionLabel: string;
  buttonClassName: string;
  canvasClassName: string;
  existingSignature?: string | null;
  hiddenName?: string;
  labelClassName?: string;
  nameInputName?: string;
  signerNameDefault?: string;
};

export default function SignatureCapture({
  actionLabel,
  buttonClassName,
  canvasClassName,
  existingSignature,
  hiddenName = "signatureDataUrl",
  labelClassName,
  nameInputName = "signerName",
  signerNameDefault = "",
}: SignatureCaptureProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  const [signatureDataUrl, setSignatureDataUrl] = useState(existingSignature ?? "");

  const canvasPoint = (event: PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * canvas.width,
      y: ((event.clientY - rect.top) / rect.height) * canvas.height,
    };
  };

  const startDrawing = (event: PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    event.currentTarget.setPointerCapture(event.pointerId);
    drawingRef.current = true;
    const { x, y } = canvasPoint(event);
    context.strokeStyle = "#17201c";
    context.lineWidth = 3;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.beginPath();
    context.moveTo(x, y);
  };

  const draw = (event: PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    const { x, y } = canvasPoint(event);
    context.lineTo(x, y);
    context.stroke();
    setSignatureDataUrl(canvas.toDataURL("image/png"));
  };

  const stopDrawing = (event: PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    event.currentTarget.releasePointerCapture(event.pointerId);
    const canvas = canvasRef.current;
    if (canvas) setSignatureDataUrl(canvas.toDataURL("image/png"));
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    context.clearRect(0, 0, canvas.width, canvas.height);
    setSignatureDataUrl("");
    window.alert("Signature cleared.");
  };

  const upload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) {
      window.alert("Choose an image file for the signature.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setSignatureDataUrl(reader.result);
        window.alert("Signature uploaded.");
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <>
      <label className={labelClassName}>
        <span>Signer name</span>
        <input name={nameInputName} defaultValue={signerNameDefault} required />
      </label>
      <input name={hiddenName} type="hidden" value={signatureDataUrl} />
      <canvas
        aria-label="Draw signature"
        className={canvasClassName}
        height={140}
        onPointerCancel={stopDrawing}
        onPointerDown={startDrawing}
        onPointerMove={draw}
        onPointerUp={stopDrawing}
        ref={canvasRef}
        width={520}
      />
      {signatureDataUrl ? <Image alt="Signature preview" className={canvasClassName} height={140} src={signatureDataUrl} unoptimized width={520} /> : null}
      <div>
        <label className={buttonClassName}>
          <Upload size={17} aria-hidden="true" />
          Upload signature
          <input accept="image/*" hidden onChange={upload} type="file" />
        </label>
        <button className={buttonClassName} onClick={clear} type="button">
          <Eraser size={17} aria-hidden="true" />
          Clear
        </button>
        <button className={buttonClassName} disabled={!signatureDataUrl} type="submit">
          <PenLine size={17} aria-hidden="true" />
          {actionLabel}
        </button>
      </div>
    </>
  );
}


