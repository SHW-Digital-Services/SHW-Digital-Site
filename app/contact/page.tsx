import PageShell from "../PageShell";

export default function ContactPage() {
  return <PageShell eyebrow="Contact" title="Let’s make something move." intro="Tell us what you are trying to change, build, or understand. I will come back with a thoughtful next step."><div style={{ border: "1px solid #6D28D9", borderRadius: 22, background: "#1A1038AA", padding: "clamp(24px, 5vw, 56px)", maxWidth: 700 }}><p style={{ color: "#BCA7DA", lineHeight: 1.7 }}>Ready when you are.</p><a href="mailto:scott@shwdigitalservices.site" style={{ color: "#F5EFFF", fontSize: "clamp(1.7rem, 5vw, 3.4rem)", textDecoration: "none" }}>scott@shwdigitalservices.site ↗</a></div></PageShell>;
}