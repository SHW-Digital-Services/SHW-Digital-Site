"use client";

import { useEffect, useState } from "react";

const services = [
  { number: "01", name: "Meeting & webinar hosting", description: "Professional online meetings and webinars with calm technical support before, during, and after the session.", price: "From £40 per session", addOns: [["Small meeting support", "From £40"], ["Webinar hosting support", "From £75"], ["Technical rehearsal", "£25"], ["Branded registration setup", "£25"], ["Recording and basic replay prep", "£40"]] },
  { number: "02", name: "Automation scripts", description: "Practical scripts that remove repetitive work, connect systems, and give time back to the people running the business.", price: "From £150 per script", addOns: [["Simple task script", "From £150"], ["Multi-step workflow script", "From £225"], ["System integration", "From £50"], ["Documentation and handover", "£35"], ["Monthly support", "From £30"]] },
  { number: "03", name: "Website development & maintenance", description: "Tailored website builds, ongoing updates, monitoring, and practical improvements shaped around the business and its audience.", price: "From £150 for a single page site", addOns: [["Single page starter site", "From £150"], ["Landing page", "From £200"], ["Brochure website", "From £350"], ["Multi-page business site", "From £500"], ["Booking or enquiry site", "From £650"], ["Additional page", "From £75"], ["Ongoing maintenance", "From £35 per month"], ["Analytics and basic SEO setup", "From £75"]] },
  { number: "04", name: "Active Directory setup & maintenance", description: "Structured user, device, access, and policy management for organisations that need a dependable Microsoft environment.", price: "From £200 per setup", addOns: [["Starter setup", "From £200"], ["New user setup", "£15 per user"], ["Device or access policy setup", "From £75"], ["Policy and permissions review", "From £95"], ["Ongoing administration", "From £90 per month"]] },
];

export default function ServicesCatalogue() {
  const [selected, setSelected] = useState<(typeof services)[number] | null>(null);

  useEffect(() => {
    function close(event: KeyboardEvent) {
      if (event.key === "Escape") setSelected(null);
    }
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);

  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 20 }}>
        {services.map((service) => (
          <button key={service.name} type="button" onClick={() => setSelected(service)} style={{ background: "#1A1038AA", border: "1px solid #6D28D9", borderRadius: 18, color: "#F5EFFF", cursor: "pointer", minHeight: 270, padding: 26, textAlign: "left", transition: "transform 160ms ease, border-color 160ms ease" }}>
            <span style={{ color: "#C084FC", fontSize: 13, letterSpacing: "0.14em" }}>{service.number}</span>
            <h2 style={{ fontSize: 22, lineHeight: 1.15, margin: "48px 0 12px" }}>{service.name}</h2>
            <p style={{ color: "#BCA7DA", lineHeight: 1.6, margin: 0 }}>{service.description}</p>
            <p style={{ color: "#E9D5FF", fontSize: 13, margin: "22px 0 0" }}>View pricing →</p>
          </button>
        ))}
      </div>

      {selected && (
        <div role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelected(null); }} style={{ alignItems: "center", background: "rgba(7, 4, 17, 0.82)", display: "flex", inset: 0, justifyContent: "center", padding: 20, position: "fixed", zIndex: 250 }}>
          <section role="dialog" aria-modal="true" aria-labelledby="service-dialog-title" style={{ background: "linear-gradient(145deg, #24124D, #120824)", border: "1px solid #A855F7", borderRadius: 22, boxShadow: "0 0 60px rgba(139, 92, 246, 0.4)", maxHeight: "90vh", maxWidth: 650, overflowY: "auto", padding: "clamp(26px, 5vw, 48px)", position: "relative", width: "100%" }}>
            <button type="button" aria-label="Close pricing" onClick={() => setSelected(null)} style={{ background: "transparent", border: 0, color: "#D8B4FE", cursor: "pointer", fontSize: 28, lineHeight: 1, padding: 4, position: "absolute", right: 20, top: 18 }}>×</button>
            <p style={{ color: "#C084FC", fontSize: 13, letterSpacing: "0.18em", margin: 0, textTransform: "uppercase" }}>SHW Digital Services · {selected.number}</p>
            <h2 id="service-dialog-title" style={{ fontSize: "clamp(2rem, 5vw, 3.2rem)", lineHeight: 1, margin: "18px 36px 16px 0" }}>{selected.name}</h2>
            <p style={{ color: "#D8B4FE", lineHeight: 1.7 }}>{selected.description}</p>
            <div style={{ border: "1px solid #6D28D9", borderRadius: 14, margin: "28px 0", padding: 20 }}><p style={{ color: "#BCA7DA", fontSize: 13, margin: "0 0 7px" }}>Indicative starting price</p><strong style={{ color: "#F5EFFF", fontSize: 25 }}>{selected.price}</strong></div>
            <h3 style={{ fontSize: 18, margin: "28px 0 12px" }}>Optional add-ons</h3>
            <div style={{ display: "grid", gap: 8 }}>{selected.addOns.map(([name, price]) => <div key={name} style={{ borderBottom: "1px solid #3B2169", display: "flex", justifyContent: "space-between", padding: "11px 0" }}><span style={{ color: "#C7B7DD" }}>{name}</span><span style={{ color: "#E9D5FF" }}>{price}</span></div>)}</div>
            <p style={{ color: "#8E7CA8", fontSize: 12, lineHeight: 1.6, marginTop: 24 }}>Prices are indicative starting points. I will confirm the final scope, price, delivery, and any tailored requirements before work begins.</p>
            <a href={`mailto:scott@shwdigitalservices.site?subject=${encodeURIComponent(`Order enquiry: ${selected.name}`)}`} style={{ background: "#A855F7", borderRadius: 999, color: "#FFFFFF", display: "inline-block", fontWeight: 700, marginTop: 14, padding: "13px 20px", textDecoration: "none" }}>Make an enquiry →</a>
          </section>
        </div>
      )}
    </>
  );
}