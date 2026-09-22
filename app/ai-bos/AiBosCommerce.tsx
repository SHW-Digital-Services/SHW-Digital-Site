"use client";

import { Check, Download, Mail, ShoppingBag } from "lucide-react";
import { useMemo, useState } from "react";
import styles from "./ai-bos.module.css";

type Resource = {
  title: string;
  price: string;
  description: string;
};

type Product = {
  title: string;
  price: string;
  description: string;
  badge: string;
};

const freeResources: Resource[] = [
  {
    title: "AI-BOS Free Prompt Pack",
    price: "FREE",
    description: "Ready-to-use strategy, marketing, operations and automation prompts for business owners.",
  },
  {
    title: "Startup Validation Checklist",
    price: "FREE",
    description: "A practical validation checklist for checking offer, market, customer and launch readiness.",
  },
  {
    title: "Business Health Scorecard",
    price: "FREE",
    description: "Score the strength of your business model, operations, leadership and growth systems.",
  },
];

const products: Product[] = [
  {
    title: "AI-BOS Marketing Audit Workbook",
    price: "£14.99",
    description: "Review positioning, messaging, channels, content and conversion opportunities with a structured audit.",
    badge: "Marketing",
  },
  {
    title: "AI-BOS AI Readiness Assessment Workbook",
    price: "£19",
    description: "Assess process maturity, data readiness, Microsoft 365 foundations and automation opportunities.",
    badge: "AI readiness",
  },
];

export default function AiBosCommerce() {
  const [email, setEmail] = useState("");
  const [resource, setResource] = useState(freeResources[0].title);
  const [downloadQueued, setDownloadQueued] = useState(false);
  const [cart, setCart] = useState<string[]>([]);

  const cartSummary = useMemo(() => {
    if (cart.length === 0) {
      return "No workbook selected";
    }

    return `${cart.length} workbook${cart.length === 1 ? "" : "s"} selected`;
  }, [cart.length]);

  function handleDownload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setDownloadQueued(true);
  }

  function toggleProduct(title: string) {
    setCart((current) =>
      current.includes(title) ? current.filter((item) => item !== title) : [...current, title],
    );
  }

  return (
    <>
      <section className={styles.section} id="free-resources" aria-labelledby="free-resources-title">
        <div className={styles.sectionHeader}>
          <span className={styles.eyebrow}>Free resources</span>
          <h2 id="free-resources-title">Start with practical AI-BOS tools.</h2>
          <p>
            Capture a useful operating asset before you buy. Each download is designed to help you make a clearer
            business decision within the same day.
          </p>
        </div>

        <div className={styles.resourceGrid}>
          {freeResources.map((item) => (
            <article className={styles.productCard} key={item.title}>
              <div className={styles.productIcon}>
                <Download size={22} aria-hidden="true" />
              </div>
              <p className={styles.productBadge}>{item.price}</p>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>

        <form className={styles.captureForm} onSubmit={handleDownload}>
          <label>
            <span>Email address</span>
            <input
              required
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </label>
          <label>
            <span>Resource</span>
            <select value={resource} onChange={(event) => setResource(event.target.value)}>
              {freeResources.map((item) => (
                <option key={item.title} value={item.title}>
                  {item.title}
                </option>
              ))}
            </select>
          </label>
          <button className={styles.primaryButton} type="submit">
            <Mail size={18} aria-hidden="true" />
            Download Free
          </button>
        </form>

        <p className={styles.formStatus} role="status" aria-live="polite">
          {downloadQueued
            ? `${resource} is ready to connect to an email delivery workflow for ${email}.`
            : "Email capture is required before download."}
        </p>
      </section>

      <section className={styles.section} id="workbooks" aria-labelledby="workbooks-title">
        <div className={styles.sectionHeader}>
          <span className={styles.eyebrow}>Workbook collection</span>
          <h2 id="workbooks-title">Buy focused operating workbooks.</h2>
          <p>
            Premium workbook products give entrepreneurs, consultants and leaders a structured way to diagnose,
            prioritise and improve the business.
          </p>
        </div>

        <div className={styles.storeGrid}>
          {products.map((product) => {
            const selected = cart.includes(product.title);

            return (
              <article className={styles.productCard} key={product.title}>
                <p className={styles.productBadge}>{product.badge}</p>
                <h3>{product.title}</h3>
                <p>{product.description}</p>
                <div className={styles.priceRow}>
                  <strong>{product.price}</strong>
                  <button
                    className={selected ? styles.secondaryButtonActive : styles.secondaryButton}
                    type="button"
                    onClick={() => toggleProduct(product.title)}
                    aria-pressed={selected}
                  >
                    {selected ? <Check size={18} aria-hidden="true" /> : <ShoppingBag size={18} aria-hidden="true" />}
                    {selected ? "Selected" : "Add"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>

        <div className={styles.checkoutPanel} aria-label="Basket summary">
          <div>
            <span className={styles.eyebrow}>Basket</span>
            <p>{cartSummary}</p>
          </div>
          <a className={styles.primaryButton} href="mailto:hello@shwdigitalservices.site?subject=AI-BOS%20workbook%20order">
            Request Checkout
          </a>
        </div>
      </section>
    </>
  );
}
