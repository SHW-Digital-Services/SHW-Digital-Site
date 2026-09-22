import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Bot,
  BrainCircuit,
  BriefcaseBusiness,
  ChartNoAxesCombined,
  CheckCircle2,
  Cpu,
  Crown,
  FileChartColumnIncreasing,
  Layers3,
  LineChart,
  Megaphone,
  Rocket,
  ShieldCheck,
  UsersRound,
  Workflow,
} from "lucide-react";
import AiBosCommerce from "./AiBosCommerce";
import styles from "./ai-bos.module.css";

const operatingSystemAreas = [
  { title: "Startup Validation", icon: Rocket },
  { title: "Product Development", icon: Layers3 },
  { title: "SaaS & Growth", icon: ChartNoAxesCombined },
  { title: "Marketing", icon: Megaphone },
  { title: "Sales", icon: LineChart },
  { title: "Operations", icon: Workflow },
  { title: "Leadership", icon: Crown },
  { title: "AI & Automation", icon: BrainCircuit },
  { title: "Microsoft 365 Business", icon: BriefcaseBusiness },
  { title: "Consulting", icon: UsersRound },
];

const proofPoints = [
  "Premium business workbooks",
  "Consultancy-grade operating system",
  "Built for founders, consultants and leaders",
];

export const metadata: Metadata = {
  metadataBase: new URL("https://ai-bos.shwdigitalservices.site"),
  title: "AI-BOS | AI Business Operating System",
  description:
    "AI-BOS is the AI-powered business operating system for entrepreneurs, consultants and business leaders.",
  alternates: {
    canonical: "https://ai-bos.shwdigitalservices.site",
  },
  openGraph: {
    title: "AI-BOS | AI Business Operating System",
    description:
      "Build smarter, scale faster and operate better with the complete AI-BOS ecosystem.",
    url: "https://ai-bos.shwdigitalservices.site",
    siteName: "AI-BOS",
    type: "website",
  },
};

export default function AiBosPage() {
  return (
    <main className={styles.page}>
      <header className={styles.nav} aria-label="AI-BOS navigation">
        <Link className={styles.brand} href="/ai-bos" aria-label="AI-BOS home">
          <span className={styles.brandMark}>AI</span>
          <span>
            <strong>AI-BOS</strong>
            <small>AI Business Operating System</small>
          </span>
        </Link>
        <nav>
          <a href="#system">System</a>
          <a href="#free-resources">Resources</a>
          <a href="#workbooks">Products</a>
        </nav>
      </header>

      <section className={styles.hero} aria-labelledby="hero-title">
        <div className={styles.heroContent}>
          <p className={styles.owner}>Scott Harvey-Whittle</p>
          <h1 id="hero-title">Build Smarter. Scale Faster. Operate Better.</h1>
          <p className={styles.subheadline}>
            The AI-Powered Business Operating System for Entrepreneurs, Consultants and Business Leaders.
          </p>
          <div className={styles.heroActions}>
            <a className={styles.primaryButton} href="#free-resources">
              Get Started
              <ArrowRight size={18} aria-hidden="true" />
            </a>
            <a className={styles.ghostButton} href="#workbooks">
              Browse Products
            </a>
          </div>
          <ul className={styles.proofList} aria-label="AI-BOS trust signals">
            {proofPoints.map((item) => (
              <li key={item}>
                <CheckCircle2 size={18} aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.heroVisual} aria-label="AI automation and business operating system illustration">
          <div className={styles.visualTopline}>
            <span>Operating layer</span>
            <strong>Live</strong>
          </div>
          <div className={styles.commandCentre}>
            <div className={styles.aiCore}>
              <Bot size={34} aria-hidden="true" />
              <span>AI-BOS</span>
            </div>
            <div className={styles.metricStrip}>
              <span>Validate</span>
              <span>Launch</span>
              <span>Scale</span>
            </div>
          </div>
          <div className={styles.automationGrid} aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>
          <div className={styles.visualCards}>
            <div>
              <Cpu size={20} aria-hidden="true" />
              Automation map
            </div>
            <div>
              <FileChartColumnIncreasing size={20} aria-hidden="true" />
              Growth dashboard
            </div>
            <div>
              <ShieldCheck size={20} aria-hidden="true" />
              Decision controls
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section} id="system" aria-labelledby="system-title">
        <div className={styles.sectionHeader}>
          <span className={styles.eyebrow}>What is AI-BOS?</span>
          <h2 id="system-title">A complete business operating system for sharper decisions.</h2>
          <p>
            AI-BOS brings together practical business workbooks, AI-enabled thinking frameworks and consulting
            workflows across the full operating model of a modern business.
          </p>
        </div>

        <div className={styles.areaGrid}>
          {operatingSystemAreas.map(({ title, icon: Icon }) => (
            <article className={styles.areaCard} key={title}>
              <Icon size={24} aria-hidden="true" />
              <h3>{title}</h3>
            </article>
          ))}
        </div>
      </section>

      <AiBosCommerce />

      <section className={styles.finalCta} aria-labelledby="final-cta-title">
        <span className={styles.eyebrow}>Complete ecosystem</span>
        <h2 id="final-cta-title">Build the operating rhythm your business has been missing.</h2>
        <p>
          Start with a free resource, move into focused workbooks, then use AI-BOS as the foundation for consulting,
          automation and Microsoft 365 business improvement.
        </p>
        <a className={styles.primaryButton} href="#free-resources">
          Get Started
        </a>
      </section>
    </main>
  );
}
