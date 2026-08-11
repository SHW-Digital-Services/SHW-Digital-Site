import PageShell from "../PageShell";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type KnowledgeBaseItem = {
  id: number;
  category: string;
  content: string;
  title: string;
};

export default async function AboutPage() {
  let knowledgeBase: KnowledgeBaseItem[] = [];

  if (hasSupabaseEnv()) {
    const supabase = await createClient();
    const { data } = await supabase.from("knowledge_base").select("id, category, title, content").eq("published", true).order("updated_at", { ascending: false });
    knowledgeBase = (data ?? []) as KnowledgeBaseItem[];
  }

  return (
    <PageShell eyebrow="About SHW Digital Services" title="A digital consultancy for businesses." intro="SHW Digital Services helps businesses make confident decisions about technology, systems, and digital growth. Every contract is approached holistically and tailored to the client, because no business, challenge, or service requirement is the same.">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 22 }}>
        <article style={{ border: "1px solid #6D28D9", borderRadius: 18, background: "#1A1038AA", padding: 28 }}>
          <h2>One client. One approach.</h2>
          <p style={{ color: "#BCA7DA", lineHeight: 1.8 }}>I take time to understand how the business operates, where friction appears, and what success needs to look like. The resulting plan is shaped around the client rather than forced into a standard package.</p>
        </article>
        <article style={{ border: "1px solid #6D28D9", borderRadius: 18, background: "#1A1038AA", padding: 28 }}>
          <h2>Holistic by design.</h2>
          <p style={{ color: "#BCA7DA", lineHeight: 1.8 }}>Technology, people, process, security, and long-term maintenance all connect. I consider the wider picture so that a website, automation script, meeting platform, or Active Directory environment supports the business as a whole.</p>
        </article>
        <article style={{ border: "1px solid #6D28D9", borderRadius: 18, background: "#1A1038AA", padding: 28 }}>
          <h2>Direct expertise.</h2>
          <p style={{ color: "#BCA7DA", lineHeight: 1.8 }}>As a sole trader, I remain directly involved throughout the contract. Clients receive one consistent point of contact, clear communication, and solutions developed with care from first conversation to completion.</p>
        </article>
      </div>

      <section style={{ marginTop: 58 }}>
        <p style={{ color: "#C084FC", fontSize: 13, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase" }}>Knowledge base</p>
        <h2 style={{ fontSize: "clamp(2rem, 5vw, 3.8rem)", lineHeight: 1, margin: "12px 0 24px" }}>Practical guidance for clients.</h2>
        {knowledgeBase.length ? (
          <div style={{ display: "grid", gap: 18 }}>
            {knowledgeBase.map((item) => (
              <article key={item.id} style={{ background: "rgba(26, 16, 56, 0.68)", border: "1px solid #6D28D9", borderRadius: 18, padding: 24 }}>
                <p style={{ color: "#D8B4FE", fontSize: 12, fontWeight: 700, letterSpacing: "0.14em", margin: "0 0 8px", textTransform: "uppercase" }}>{item.category}</p>
                <h3 style={{ fontSize: 24, margin: "0 0 10px" }}>{item.title}</h3>
                <p style={{ color: "#BCA7DA", lineHeight: 1.75, margin: 0, whiteSpace: "pre-wrap" }}>{item.content}</p>
              </article>
            ))}
          </div>
        ) : (
          <p style={{ color: "#BCA7DA", lineHeight: 1.75 }}>Knowledge base articles will appear here once they are published from the admin panel.</p>
        )}
      </section>

      <div style={{ borderLeft: "2px solid #C084FC", marginTop: 52, padding: "8px 0 8px 24px" }}>
        <p style={{ color: "#E9D5FF", fontSize: 22, lineHeight: 1.5, margin: 0 }}>“The right digital solution is the one that fits the business it is built for.”</p>
      </div>
    </PageShell>
  );
}
