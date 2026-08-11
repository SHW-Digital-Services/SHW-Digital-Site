import Link from "next/link";
import PageShell from "../PageShell";
import { getAllKbDocuments, getCategoryPageData } from "@/lib/obsidian";

type KbDocument = {
  category: string;
  categorySlug: string;
  data?: {
    isCategoryHome?: boolean;
  };
};

type CategoryCard = {
  articleCount: number;
  description: string;
  name: string;
  slug: string;
};

function textFromHtml(value = "") {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export default async function HelpCentrePage() {
  const documents = (getAllKbDocuments() as KbDocument[]).filter((document) => document.categorySlug && document.categorySlug !== "index");
  const categorySlugs = Array.from(new Set(documents.map((document) => document.categorySlug))).sort();
  const categories = (await Promise.all(
    categorySlugs.map(async (slug): Promise<CategoryCard> => {
      const categoryData = await getCategoryPageData(slug);
      const articleCount = categoryData.relatedDocuments.length;
      const description = textFromHtml(categoryData.aboutDocument?.contentHtml).slice(0, 180);

      return {
        articleCount,
        description: description || `${articleCount} ${articleCount === 1 ? "article" : "articles"} available in this category.`,
        name: categoryData.categoryName,
        slug,
      };
    })
  )).filter((category) => category.articleCount > 0 || category.description);

  return (
    <PageShell eyebrow="Help Centre" title="What do you need help with?" intro="Browse the SHW Digital Services knowledge base by category. These articles are published from the Obsidian vault.">
      {categories.length ? (
        <div style={{ display: "grid", gap: 18, gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
          {categories.map((category) => (
            <Link key={category.slug} href={`/help-centre/category/${category.slug}`} style={{ background: "rgba(26, 16, 56, 0.72)", border: "1px solid rgba(234, 179, 8, 0.5)", borderRadius: 18, color: "#F5EFFF", display: "grid", minHeight: 210, padding: 26, textDecoration: "none" }}>
              <p style={{ color: "#FDE68A", fontSize: 12, fontWeight: 700, letterSpacing: "0.14em", margin: "0 0 10px", textTransform: "uppercase" }}>{category.articleCount} {category.articleCount === 1 ? "article" : "articles"}</p>
              <h2 style={{ fontSize: "clamp(1.6rem, 3vw, 2.35rem)", lineHeight: 1.05, margin: "0 0 14px" }}>{category.name}</h2>
              <p style={{ alignSelf: "end", color: "#BCA7DA", lineHeight: 1.65, margin: 0 }}>{category.description}</p>
            </Link>
          ))}
        </div>
      ) : (
        <p style={{ color: "#BCA7DA", lineHeight: 1.75 }}>Knowledge base categories will appear here once published notes are added to the Obsidian vault.</p>
      )}
    </PageShell>
  );
}
