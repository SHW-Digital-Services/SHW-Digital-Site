import Link from "next/link";
import BrandLogo from "./BrandLogo";

type PageShellProps = {
  eyebrow: string;
  title: string;
  intro: string;
  children: React.ReactNode;
};

export default function PageShell({ eyebrow, title, intro, children }: PageShellProps) {
  return (
    <main className="page-shell">
      <nav className="page-shell-nav">
        <BrandLogo />
        <Link href="/" className="page-shell-return">Return to the crystal</Link>
      </nav>
      <section className="page-shell-content">
        <p className="page-shell-eyebrow">{eyebrow}</p>
        <h1 className="page-shell-title">{title}</h1>
        <p className="page-shell-intro">{intro}</p>
        <div className="page-shell-rule" />
        {children}
      </section>
    </main>
  );
}
