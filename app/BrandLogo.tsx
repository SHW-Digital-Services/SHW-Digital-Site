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
        width={560}
        height={180}
        priority={size === "hero"}
        style={{
          display: "block",
          height: "auto",
          maxHeight: size === "hero" ? 220 : 72,
          objectFit: "contain",
          width: size === "hero" ? "clamp(320px, 42vw, 680px)" : "clamp(150px, 18vw, 230px)",
        }}
      />
    </Link>
  );
}

