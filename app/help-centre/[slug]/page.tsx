import Link from "next/link";
import { notFound } from "next/navigation";
import PageShell from "../../PageShell";
import { getAllKbSlugs, getKbData } from "@/lib/obsidian";

type KbArticle = {
  category?: string;
  contentHtml: string;
  title: string;
};

export function generateStaticParams() {
  return getAllKbSlugs();
}

export default async function HelpCentreArticlePage({ params }: PageProps<"/help-centre/[slug]">) {
  const { slug } = await params;
  let article: KbArticle;

  try {
    article = await getKbData(slug);
  } catch {
    notFound();
  }

  return (
    <PageShell eyebrow={article.category || "Help Centre"} title={article.title} intro="Knowledge base guidance from SHW Digital Services.">
      <Link href="/help-centre" style={{ color: "#FDE68A", display: "inline-block", marginBottom: 28, textDecoration: "none" }}>Back to Help Centre</Link>
      <article className="kb-article" dangerouslySetInnerHTML={{ __html: article.contentHtml }} />
    </PageShell>
  );
}
