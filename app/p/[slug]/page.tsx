import { notFound } from "next/navigation";

import { ResumeRenderer } from "@/components/ResumeRenderer";
import { getDb } from "@/lib/mongodb";
import { serializePortfolio } from "@/lib/portfolio";
import type { PortfolioDoc } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function PublicPortfolioPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const db = await getDb();
  const portfolio = await db.collection<PortfolioDoc>("portfolios").findOne({ slug, status: "published" });

  if (!portfolio) notFound();
  const resume = serializePortfolio(portfolio);

  return (
    <main className="preview-page">
      <ResumeRenderer
        sections={resume.sections}
        styleSettings={resume.styleSettings}
        templateId={resume.templateId}
        title={resume.title}
      />
    </main>
  );
}

