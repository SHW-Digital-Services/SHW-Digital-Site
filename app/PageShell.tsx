import Link from "next/link";

type PageShellProps = {
  eyebrow: string;
  title: string;
  intro: string;
  children: React.ReactNode;
};

export default function PageShell({ eyebrow, title, intro, children }: PageShellProps) {
  return (
    <main style={{ minHeight: "100vh", background: "radial-gradient(circle at 50% 0%, #24124D, #120824 52%, #070411)", color: "#F5EFFF", fontFamily: "Arial, Helvetica, sans-serif", padding: "32px 7vw 72px" }}>
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: 1120, margin: "0 auto 100px" }}>
        <Link href="/" style={{ color: "#F5EFFF", fontSize: 18, fontWeight: 700, letterSpacing: "0.16em", textDecoration: "none" }}>SHW Digital Services</Link>
        <Link href="/" style={{ color: "#D8B4FE", textDecoration: "none" }}>← Return to the crystal</Link>
      </nav>
      <section style={{ maxWidth: 1120, margin: "0 auto" }}>
        <p style={{ color: "#C084FC", fontSize: 13, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase" }}>{eyebrow}</p>
        <h1 style={{ fontSize: "clamp(3rem, 9vw, 7rem)", lineHeight: 0.95, margin: "18px 0 26px", maxWidth: 900 }}>{title}</h1>
        <p style={{ color: "#D8B4FE", fontSize: "clamp(1.1rem, 2vw, 1.45rem)", lineHeight: 1.6, maxWidth: 720 }}>{intro}</p>
        <div style={{ height: 1, background: "linear-gradient(90deg, #C084FC, transparent)", margin: "64px 0" }} />
        {children}
      </section>
    </main>
  );
}