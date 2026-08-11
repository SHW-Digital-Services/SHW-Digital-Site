import Link from "next/link";
import { notFound } from "next/navigation";
import PageShell from "../../../PageShell";
import { getAllCategorySlugs, getCategoryPageData } from "@/lib/obsidian";

type RelatedDocument = {
  category?: string;
  slug: string;
  title: string;
};

function textFromHtml(value = "") {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function generateStaticParams() {
  return getAllCategorySlugs().filter(({ category }) => category !== "index");
}

export default async function HelpCentreCategoryPage({ params }: PageProps<"/help-centre/category/[category]">) {
  const { category } = await params;
  const categoryData = await getCategoryPageData(category);
  const articles = categoryData.relatedDocuments as RelatedDocument[];

  if (!categoryData.aboutDocument && !articles.length) {
    notFound();
  }

  const intro = textFromHtml(categoryData.aboutDocument?.contentHtml) || "Choose an article in this category.";

  return (
    <PageShell eyebrow="Help Centre" title={categoryData.categoryName} intro={intro}>
      <Link href="/help-centre" style={{ color: "#FDE68A", display: "inline-block", marginBottom: 28, textDecoration: "none" }}>Back to Help Centre</Link>
      {articles.length ? (
        <div style={{ display: "grid", gap: 14, maxWidth: 860 }}>
          {articles.map((article) => (
            <Link key={article.slug} href={`/help-centre/${article.slug}`} style={{ alignItems: "center", background: "rgba(26, 16, 56, 0.68)", border: "1px solid rgba(234, 179, 8, 0.42)", borderRadius: 14, color: "#F5EFFF", display: "flex", justifyContent: "space-between", gap: 18, padding: "20px 22px", textDecoration: "none" }}>
              <span style={{ fontSize: 21, fontWeight: 700 }}>{article.title}</span>
              <span style={{ color: "#FDE68A", flex: "0 0 auto", fontSize: 14, fontWeight: 700 }}>Read</span>
            </Link>
          ))}
        </div>
      ) : (
        <p style={{ color: "#BCA7DA", lineHeight: 1.75 }}>No articles are published in this category yet.</p>
      )}
    </PageShell>
  );
}
