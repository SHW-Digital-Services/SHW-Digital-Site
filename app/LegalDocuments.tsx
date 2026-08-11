"use client";

import { useState } from "react";
import Link from "next/link";

type Document = { id: string; title: string; summary: string; content: React.ReactNode };
const copy = { color: "#C7B7DD", lineHeight: 1.78, maxWidth: 820 };
const heading = { color: "#F5EFFF", fontSize: 20, margin: "32px 0 10px" };

function Clause({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return <section><h3 style={heading}>{number}. {title}</h3><div style={copy}>{children}</div></section>;
}

const documents: Document[] = [
  {
    id: "privacy",
    title: "Privacy Notice",
    summary: "How SHW Digital Services handles personal information.",
    content: <>
      <Clause number="1" title="Who SHW Digital Services is"><p>SHW Digital Services is the data controller for personal information processed through this website and in connection with the services. Business address is 72 Arthur Millwood Court, Rodney Street, Salford, Greater Manchester, M3 5HS, United Kingdom. Contact: <a href="mailto:scott@shwdigitalservices.site" style={{ color: "#D8B4FE" }}>scott@shwdigitalservices.site</a>.</p></Clause>
      <Clause number="2" title="Information SHW Digital Services collects"><p>SHW Digital Services may collect your name, business address, contact details, account information, payment and transaction information, booking details, service requirements, task details, communications, and attachments relating to a task. SHW Digital Services may also collect technical information such as IP address, browser type, device information, and website usage data.</p></Clause>
      <Clause number="3" title="How SHW Digital Services receives information"><p>Information may be provided through contact forms, account registration, bookings, purchases, email, Microsoft Forms, meetings, support conversations, or documents supplied during a project. SHW Digital Services may also receive limited information from payment, hosting, analytics, webinar, and communications providers.</p></Clause>
      <Clause number="4" title="Why SHW Digital Services uses information"><p>SHW Digital Services use information to respond to enquiries, create and administer accounts, prepare proposals, deliver and maintain services, host meetings and webinars, manage bookings, process payments, provide support, communicate service updates, protect systems, improve the website, send requested marketing, and meet legal and accounting obligations.</p></Clause>
      <Clause number="5" title="Lawful bases"><p>Depending on the activity, SHW Digital Services relies on performance of a contract, steps requested before entering a contract, legal obligation, legitimate interests, or consent. Marketing communications and non-essential analytics or embedded content should only be used with consent where required. SHW Digital Services will not use a different purpose in a way that is incompatible with the purpose explained when information was collected.</p></Clause>
      <Clause number="6" title="Service providers"><p>SHW Digital Services may use Vercel for hosting, Zoho Mail for business email, Bitrix CRM, Mailchimp, Google Analytics, Stripe, Supabase, YouTube, Microsoft Forms, Zoom, Google Meet, GoToWebinar, Microsoft Teams, and carefully selected contractors. These organisations may process information on behalf of SHW Digital Services or as independent providers under their own terms.</p></Clause>
      <Clause number="7" title="International processing"><p>Some providers process information outside the United Kingdom. SHW Digital Services will take appropriate steps for restricted transfers, such as relying on an adequacy decision or using appropriate contractual safeguards where required. Provider locations and safeguards should be reviewed whenever a new service is added.</p></Clause>
      <Clause number="8" title="Retention"><p>SHW Digital Services intends to retain business, service, contract, and financial records for six years, unless a different period is required by law or justified by the circumstances. Enquiry information, attachments, account data, and support records should be deleted or reviewed when no longer needed. Marketing data is retained until consent is withdrawn or the person unsubscribes.</p></Clause>
      <Clause number="9" title="Your rights"><p>Subject to legal exceptions, you may ask for access, correction, deletion, restriction, portability, or objection to processing. You may withdraw consent at any time where consent is the lawful basis. You can unsubscribe from marketing using the link in a message or by contacting SHW Digital Services.</p></Clause>
      <Clause number="10" title="Security and complaints"><p>SHW Digital Services uses reasonable technical and organisational measures to protect information, but no online service can guarantee absolute security. Please report suspected misuse or a data concern to the contact email above. You may also complain to the UK Information Commissioner’s Office.</p></Clause>
      <Clause number="11" title="Changes"><p>SHW Digital Services may update this notice when the services, providers, or data practices change. The latest version will be published on this page with its review date.</p></Clause>
    </>,
  },
  {
    id: "cookies",
    title: "Cookie Policy",
    summary: "Cookies, analytics, marketing, and embeds.",
    content: <>
      <Clause number="1" title="What cookies are"><p>Cookies are small files or similar technologies stored on or accessed from a device. They can remember essential settings, measure usage, support communications, or enable content supplied by another organisation.</p></Clause>
      <Clause number="2" title="Categories used by SHW Digital Services"><p>Strictly necessary technologies support core website operation. Analytics technologies, including Google Analytics, help SHW Digital Services understand how visitors use the site. Marketing technologies, including Mailchimp-related tracking where enabled, support communications. Embedded services may include YouTube, Microsoft Forms, Zoom, Google Meet, GoToWebinar, and Microsoft Teams.</p></Clause>
      <Clause number="3" title="Consent"><p>Non-essential analytics, marketing, and embedded content should not load until the visitor makes an appropriate choice. The cookie banner provides equal options to accept all non-essential categories or reject them. The choice can be changed through “Cookie settings”.</p></Clause>
      <Clause number="4" title="Third-party services"><p>When a visitor chooses to load third-party content, the relevant provider may receive technical information and may set its own cookies. Each provider has its own privacy and cookie terms. SHW Digital Services does not currently use Google Maps, live chat widgets, or social media embeds.</p></Clause>
      <Clause number="5" title="Cookie inventory"><p>The final production version of this policy should include the name, provider, purpose, category, and retention period for every cookie actually set by the website and its integrations. The inventory must be checked after installing analytics, payment, booking, webinar, or marketing tools.</p></Clause>
      <Clause number="6" title="Browser controls"><p>Most browsers allow cookies to be blocked or deleted. Blocking strictly necessary technologies may affect site functionality. Browser controls do not always replace the consent choices required for non-essential technologies.</p></Clause>
      <Clause number="7" title="Updates"><p>SHW Digital Services will update this policy when the cookie inventory or third-party integrations change.</p></Clause>
    </>,
  },
  {
    id: "terms",
    title: "Website Terms",
    summary: "Rules for using the website and services.",
    content: <>
      <Clause number="1" title="About these terms"><p>These terms apply to use of the SHW Digital Services website and to services supplied by SHW Digital Services unless a separate written service agreement replaces or supplements them. SHW Digital Services provides meeting and webinar hosting, automation scripts, website development, website maintenance, and Active Directory setup and maintenance.</p></Clause>
      <Clause number="2" title="Eligibility and accounts"><p>Users must be at least 18 years old. You must provide accurate information, protect account credentials, and promptly tell SHW Digital Services about unauthorised account use. You must not use the website to break the law, infringe rights, distribute malware, or interfere with another user’s access.</p></Clause>
      <Clause number="3" title="Forming a service contract"><p>A service contract is formed when SHW Digital Services and the client agree the service scope, price, timetable, deliverables, access requirements, and any special terms. Online and digital delivery methods may include email, secure portals, cloud services, meetings, webinars, or account access.</p></Clause>
      <Clause number="4" title="Client responsibilities"><p>The client must provide accurate instructions, lawful access, licences, permissions, content, backups, and timely decisions. The client is responsible for confirming that supplied data, attachments, software, and configurations may lawfully be used. Delays caused by missing access or information may affect delivery dates.</p></Clause>
      <Clause number="5" title="Performance standard"><p>SHW Digital Services will perform services with reasonable skill and care and to the best standard reasonably expected of the person carrying out the work. Unless expressly promised in writing, SHW Digital Services does not guarantee a particular commercial result, uninterrupted availability, compatibility with every system, or that a third-party platform will remain unchanged.</p></Clause>
      <Clause number="6" title="Payment and digital delivery"><p>Prices, payment timing, taxes, and any recurring charges will be shown before a purchase or agreed in the service contract. Delivery is online and digital. The contract closes when the agreed service and deliverables are complete and SHW Digital Services and the client agree that the service is closed.</p></Clause>
      <Clause number="7" title="Cancellation and refunds"><p>Clients should give at least 24 hours’ notice before the service start time. The proposed cancellation charge is 25% of the agreed price when cancellation occurs within 24 hours before the start time, and 50% where the agreed start time has passed. SHW Digital Services does not offer voluntary refunds except where agreed in writing or required by law. These terms do not exclude mandatory consumer rights, statutory cancellation rights, or remedies that cannot lawfully be excluded.</p></Clause>
      <Clause number="8" title="Intellectual property"><p>Each party keeps ownership of materials it supplied. Unless a service agreement says otherwise, SHW Digital Services retains ownership of its pre-existing tools, templates, scripts, methods, and know-how. The client receives the agreed rights to use final deliverables after applicable payment has been made. Third-party software remains subject to its own licence.</p></Clause>
      <Clause number="9" title="Confidentiality and data"><p>Each party should protect confidential information received from the other. Where SHW Digital Services processes personal data on the client’s instructions, the parties may need a separate data-processing agreement. Clients must not send sensitive information to AI or third-party tools unless that use has been agreed and safeguarded.</p></Clause>
      <Clause number="10" title="Suspension and termination"><p>SHW Digital Services may suspend access or terminate a service where there is non-payment, unlawful use, a security risk, or a serious breach that is not remedied within a reasonable period. The client remains responsible for agreed charges incurred before termination and for returning or securing its own data.</p></Clause>
      <Clause number="11" title="Liability"><p>Nothing in these terms limits liability that cannot legally be limited, including liability for fraud or death or personal injury caused by negligence. Any remaining liability limits, exclusions, and consumer protections should be set in the relevant service agreement after legal review.</p></Clause>
      <Clause number="12" title="Law and jurisdiction"><p>These terms are governed by the law of England and Wales. The courts of England and Wales will have jurisdiction, subject to any mandatory rights a customer may have in the country where they live.</p></Clause>
    </>,
  },
  {
    id: "ai",
    title: "AI Use Disclosure",
    summary: "How AI may assist SHW Digital Services’s work.",
    content: <>
      <Clause number="1" title="Assisted use"><p>SHW Digital Services may use artificial intelligence tools to assist with research, drafting, coding, analysis, administration, testing, or other service activities. AI is an assistance tool and does not replace professional judgement, human review, or the client’s agreed requirements.</p></Clause>
      <Clause number="2" title="Human review"><p>SHW Digital Services will use reasonable care to review AI-assisted work before delivery. Clients should identify important accuracy, security, compliance, accessibility, or confidentiality requirements at the start of a project.</p></Clause>
      <Clause number="3" title="Client information"><p>Clients should not provide confidential, sensitive, regulated, or personal information to an AI tool unless SHW Digital Services has confirmed the tool, purpose, retention settings, and safeguards. SHW Digital Services will not knowingly use client information to train a public AI model without agreement.</p></Clause>
      <Clause number="4" title="Third-party terms"><p>AI output may be incomplete, inaccurate, biased, or similar to material produced for others. Third-party AI tools may have their own terms and privacy practices. Where AI use is material to a deliverable, the applicable service agreement should describe it.</p></Clause>
    </>,
  },
  {
    id: "accessibility",
    title: "Accessibility Statement",
    summary: "SHW Digital Services’s accessibility commitment.",
    content: <>
      <Clause number="1" title="SHW Digital Services commitment"><p>SHW Digital Services aims to make this website usable by as many people as possible. SHW Digital Services intends to work towards the Web Content Accessibility Guidelines (WCAG) 2.2 Level AA as a practical target for the website.</p></Clause>
      <Clause number="2" title="Current approach"><p>SHW Digital Services aim to provide readable contrast, keyboard-accessible controls, meaningful link labels, responsive layouts, and alternatives for important information. The interactive crystal remains a visual enhancement; the legal and service content is provided as standard text.</p></Clause>
      <Clause number="3" title="Known limitations"><p>Third-party content such as YouTube, Microsoft Forms, Zoom, Google Meet, GoToWebinar, and Microsoft Teams may have accessibility features and limitations controlled by those providers. SHW Digital Services cannot guarantee the accessibility of content hosted or delivered entirely by a third party.</p></Clause>
      <Clause number="4" title="Report a problem"><p>If you encounter a barrier, contact <a href="mailto:scott@shwdigitalservices.site" style={{ color: "#D8B4FE" }}>scott@shwdigitalservices.site</a> with the page, problem, and assistive technology used where relevant. SHW Digital Services will consider the report and seek a reasonable improvement or alternative route to the information.</p></Clause>
    </>,
  },
];

export default function LegalDocuments() {
  const [selected, setSelected] = useState("privacy");
  const current = documents.find((document) => document.id === selected) ?? documents[0];

  return (
    <main style={{ minHeight: "100vh", background: "radial-gradient(circle at 50% 0%, #24124D, #120824 52%, #070411)", color: "#F5EFFF", fontFamily: "Arial, Helvetica, sans-serif", padding: "28px 4vw 70px" }}>
      <nav style={{ maxWidth: 1240, margin: "0 auto 36px" }}><Link href="/" style={{ color: "#D8B4FE", textDecoration: "none" }}>← Return to the crystal</Link></nav>
      <div style={{ maxWidth: 1240, margin: "0 auto", display: "grid", gridTemplateColumns: "minmax(190px, 260px) minmax(0, 1fr)", gap: 28, alignItems: "start" }}>
        <aside style={{ position: "sticky", top: 24, border: "1px solid #3B2169", borderRadius: 18, background: "rgba(18, 8, 36, 0.82)", padding: 14 }}>
          <p style={{ color: "#C084FC", fontSize: 12, fontWeight: 700, letterSpacing: "0.16em", margin: "8px 10px 18px", textTransform: "uppercase" }}>Legal documents</p>
          {documents.map((document) => <button key={document.id} type="button" onClick={() => setSelected(document.id)} style={{ background: selected === document.id ? "linear-gradient(90deg, #6D28D9, #3B2169)" : "transparent", border: 0, borderRadius: 10, color: selected === document.id ? "#FFFFFF" : "#D8B4FE", cursor: "pointer", display: "block", fontSize: 15, padding: "13px 12px", textAlign: "left", width: "100%" }}>{document.title}</button>)}
        </aside>
        <article style={{ border: "1px solid #3B2169", borderRadius: 22, background: "rgba(14, 7, 32, 0.78)", minHeight: "75vh", padding: "clamp(26px, 5vw, 68px)" }}>
          <p style={{ color: "#C084FC", fontSize: 12, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase" }}>Draft for review</p>
          <h1 style={{ fontSize: "clamp(2.4rem, 6vw, 5.5rem)", lineHeight: 0.98, margin: "18px 0 12px" }}>{current.title}</h1>
          <p style={{ color: "#D8B4FE", fontSize: 18, lineHeight: 1.6, margin: "0 0 34px" }}>{current.summary}</p>
          <div style={{ height: 1, background: "linear-gradient(90deg, #C084FC, transparent)", marginBottom: 30 }} />
          {current.content}
          <p style={{ borderTop: "1px solid #3B2169", color: "#8E7CA8", fontSize: 12, lineHeight: 1.6, marginTop: 48, paddingTop: 20 }}>Draft last reviewed 11 August 2026. These documents are not legal advice and should be reviewed against SHW Digital Services’s actual systems, contracts, providers, and target markets before publication.</p>
        </article>
      </div>
      <style>{`@media (max-width: 760px) { aside { position: static !important; } }`}</style>
    </main>
  );
}