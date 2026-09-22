import Image from "next/image";
import Link from "next/link";

type BrandLogoProps = {
  href?: string;
  size?: "nav" | "hero";
  tone?: "dark" | "light";
};

export default function BrandLogo({ href = "/", size = "nav", tone = "light" }: BrandLogoProps) {
  return (
    <Link
      href={href}
      aria-label="SHW Digital Services home"
      className={`brand-logo brand-logo-${size}`}
      style={{
        alignItems: "center",
        display: "inline-flex",
        filter: tone === "light" ? "drop-shadow(0 0 18px rgba(192, 132, 252, 0.45))" : "none",
        textDecoration: "none",
      }}
    >
      <Image
        src="/logo/logo.png"
        alt="SHW Digital Services"
        width={680}
        height={220}
        priority={size === "hero"}
        style={{
          display: "block",
          height: "auto",
          objectFit: "contain",
          width: "100%",
        }}
      />
    </Link>
  );
}
