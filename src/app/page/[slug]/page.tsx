import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";

import { ContentLayout } from "@/components/panel/content-layout";

type CustomPagePayload = {
  success?: boolean;
  page?: {
    id: number;
    title: string;
    slug: string;
    content: string;
    updated_at?: string | null;
  };
};

type SettingsPayload = {
  success?: boolean;
  data?: Record<string, any>;
};

type PageProps = {
  params: Promise<{ slug: string }>;
};

const getSiteUrl = () => process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3100";

async function fetchCustomPage(slug: string): Promise<CustomPagePayload | null> {
  const siteUrl = getSiteUrl();
  const res = await fetch(`${siteUrl}/api/page/${encodeURIComponent(slug)}`, { cache: "no-store" });
  if (!res.ok) return null;
  return (await res.json().catch(() => null)) as CustomPagePayload | null;
}

async function fetchSettings(): Promise<SettingsPayload | null> {
  const siteUrl = getSiteUrl();
  const res = await fetch(`${siteUrl}/api/settings`, { next: { revalidate: 3600 } });
  if (!res.ok) return null;
  return (await res.json().catch(() => null)) as SettingsPayload | null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  const [pagePayload, settingsPayload] = await Promise.all([
    fetchCustomPage(slug),
    fetchSettings()
  ]);
  
  const page = pagePayload?.page;

  if (!page) {
    return {};
  }

  const siteTitle = settingsPayload?.data?.["general.title"] || "";
  const globalDesc = settingsPayload?.data?.["seo.description"] || "";

  return {
    title: siteTitle ? `${page.title} | ${siteTitle}` : page.title,
    description: globalDesc || undefined,
  };
}

export default async function CustomPage({ params }: PageProps) {
  const { slug } = await params;

  const payload = await fetchCustomPage(slug);
  const page = payload?.page;

  if (!page) {
    notFound();
  }

  return (
    <ContentLayout title={page.title}>
      <div className="max-w-4xl mx-auto space-y-8 py-6">
        <nav className="text-sm text-muted-foreground flex gap-2 items-center">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <span>/</span>
          <span className="font-medium text-foreground">{page.title}</span>
        </nav>

        <header className="space-y-2 border-b pb-6">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl text-foreground">
            {page.title}
          </h1>
          {page.updated_at && (
            <p className="text-xs text-muted-foreground italic">
              Terakhir diperbarui: {new Date(page.updated_at).toLocaleDateString("id-ID", { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
              })}
            </p>
          )}
        </header>

        <article
          className="prose prose-slate dark:prose-invert max-w-none 
          prose-headings:scroll-mt-20 prose-headings:font-bold
          prose-a:text-primary hover:prose-a:underline
          prose-img:rounded-2xl prose-img:shadow-lg
          break-words"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      </div>
    </ContentLayout>
  );
}
