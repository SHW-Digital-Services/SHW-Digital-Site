import Link from "next/link";
import PageShell from "../PageShell";
import { getAllKbDocuments } from "@/lib/obsidian";

type KbDocument = {
  category: string;
  categorySlug: string;
  content: string;
  data?: {
    isCategoryHome?: boolean;
  };
  slug: string;
  title: string;
};

function excerpt(value: string) {
  return value
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\[\[([^\]|]+\|)?([^\]]+)\]\]/g, "$2")
    .replace(/\s+/g, " ")
    .trim();
}

function groupByCategory(documents: KbDocument[]) {
  return documents.reduce<Record<string, KbDocument[]>>((groups, document) => {
    const category = document.category || "General";
    groups[category] = groups[category] ?? [];
    groups[category].push(document);
    return groups;
  }, {});
}

export default function HelpCentrePage() {
  const documents = (getAllKbDocuments() as KbDocument[])
    .filter((document) => !document.data?.isCategoryHome)
    .sort((a, b) => a.title.localeCompare(b.title));
  const groupedDocuments = groupByCategory(documents);

  return (
    <PageShell eyebrow="Help Centre" title="Guidance from the knowledge base." intro="Client-facing answers and service notes from the SHW Digital Services Obsidian vault.">
      {documents.length ? (
        <div style={{ display: "grid", gap: 34 }}>
          {Object.entries(groupedDocuments).map(([category, items]) => (
            <section key={category}>
              <h2 style={{ color: "#FDE68A", fontSize: "clamp(1.5rem, 3vw, 2.5rem)", margin: "0 0 18px" }}>{category}</h2>
              <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
                {items.map((item) => (
                  <Link key={item.slug} href={`/help-centre/${item.slug}`} style={{ background: "rgba(26, 16, 56, 0.68)", border: "1px solid rgba(234, 179, 8, 0.48)", borderRadius: 18, color: "#F5EFFF", display: "block", padding: 24, textDecoration: "none" }}>
                    <p style={{ color: "#FDE68A", fontSize: 12, fontWeight: 700, letterSpacing: "0.14em", margin: "0 0 8px", textTransform: "uppercase" }}>{category}</p>
                    <h3 style={{ fontSize: 24, margin: "0 0 10px" }}>{item.title}</h3>
                    <p style={{ color: "#BCA7DA", lineHeight: 1.7, margin: 0 }}>{excerpt(item.content)}</p>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <p style={{ color: "#BCA7DA", lineHeight: 1.75 }}>Knowledge base articles will appear here once published notes are added to the Obsidian vault.</p>
      )}
    </PageShell>
  );
}
