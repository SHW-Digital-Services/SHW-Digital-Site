import PageShell from "../PageShell";

export default function ProcessPage() {
  const steps = [
    ["01", "Enquiry", "The client makes contact with SHW Digital Services and shares the initial requirement."],
    ["02", "Initial consultation", "I discuss the business need, clarify the desired outcome, and identify any practical constraints."],
    ["03", "Price agreement and contracts signed", "The scope, price, responsibilities, and contract terms are agreed before work begins."],
    ["04", "Deposit paid by client", "The client pays a 25% deposit to secure the work and confirm the contract start."],
    ["05", "Service carried out", "SHW Digital Services completes the agreed service in line with the approved scope."],
    ["06", "Final consultation", "Delivery is reviewed, client approval is confirmed, the remaining balance is paid, and both sides agree whether the contract can close."],
    ["07", "Contract closure", "The contract is closed once the agreed service has been delivered, approved, and settled."],
  ];

  return (
    <PageShell
      eyebrow="SHW Digital Services client journey"
      title="From enquiry to contract closure."
      intro="A clear client journey so expectations, payment, delivery, approval, and closure are agreed at the right points."
    >
      <div style={{ display: "grid", gap: 18 }}>
        {steps.map(([number, title, copy]) => (
          <article
            key={number}
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(48px, 70px) minmax(170px, 260px) minmax(240px, 1fr)",
              gap: 24,
              alignItems: "baseline",
              borderBottom: "1px solid #3B2169",
              padding: "22px 0",
            }}
          >
            <span style={{ color: "#C084FC", fontSize: 14 }}>{number}</span>
            <h2 style={{ margin: 0 }}>{title}</h2>
            <p style={{ color: "#BCA7DA", lineHeight: 1.6, margin: 0 }}>{copy}</p>
          </article>
        ))}
      </div>
    </PageShell>
  );
}