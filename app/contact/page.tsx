import PageShell from "../PageShell";

const formUrl = "https://forms.cloud.microsoft/e/PKY85jebPQ";

export default function ContactPage() {
  return (
    <PageShell
      eyebrow="Contact"
      title="Let’s make something move."
      intro="Tell us what you are trying to change, build, or understand. I will come back with a thoughtful next step."
    >
      <div style={{ border: "1px solid #6D28D9", borderRadius: 22, background: "#1A1038AA", padding: "clamp(18px, 4vw, 32px)", maxWidth: 900 }}>
        <iframe
          src={formUrl}
          title="SHW Digital Services enquiry form"
          width="100%"
          height="760"
          style={{ border: 0, display: "block", minHeight: "70vh", width: "100%" }}
        />
        <p style={{ color: "#BCA7DA", fontSize: 14, lineHeight: 1.6, margin: "18px 0 0" }}>
          If the form does not load, <a href={formUrl} style={{ color: "#FDE68A" }}>open it in a new tab</a>.
        </p>
      </div>
    </PageShell>
  );
}