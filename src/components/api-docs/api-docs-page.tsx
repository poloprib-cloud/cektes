"use client";

import { useMemo, useState } from "react";

import { ContentLayout } from "@/components/panel/content-layout";
import { Accordion } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { apiAuthSchemes, apiDocsMeta, apiEndpointGroups } from "@/lib/api-docs";
import type { ApiAuthScheme, ApiEndpointDoc, ApiEndpointGroup, ApiParamDoc } from "@/lib/api-docs/types";

import { ApiCodeBlock } from "./api-code-block";
import { ApiDocsMobileNavigation, ApiDocsSidebar } from "./api-docs-sidebar";
import { ApiEndpointAccordion } from "./api-endpoint-accordion";

function buildSearchIndex(endpoint: ApiEndpointDoc) {
  return [
    endpoint.method,
    endpoint.path,
    endpoint.summary,
    endpoint.description,
    endpoint.auth.join(" "),
    endpoint.headers?.map((item: ApiParamDoc) => `${item.name} ${item.description}`).join(" ") ?? "",
    endpoint.pathParams?.map((item: ApiParamDoc) => `${item.name} ${item.description}`).join(" ") ?? "",
    endpoint.queryParams?.map((item: ApiParamDoc) => `${item.name} ${item.description}`).join(" ") ?? "",
    endpoint.bodyFields?.map((item: ApiParamDoc) => `${item.name} ${item.description}`).join(" ") ?? "",
    endpoint.notes?.join(" ") ?? "",
  ]
    .join(" ")
    .toLowerCase();
}

export function ApiDocsPage() {
  const [query, setQuery] = useState("");

  const filteredGroups = useMemo(() => {
    const keyword = query.trim().toLowerCase();

    if (!keyword) {
      return apiEndpointGroups;
    }

    return apiEndpointGroups
      .map((group: ApiEndpointGroup) => ({
        ...group,
        endpoints: group.endpoints.filter((endpoint: ApiEndpointDoc) => buildSearchIndex(endpoint).includes(keyword)),
      }))
      .filter((group: ApiEndpointGroup) => group.endpoints.length > 0);
  }, [query]);

  const totalEndpointCount = apiEndpointGroups.reduce(
    (total: number, group: ApiEndpointGroup) => total + group.endpoints.length,
    0
  );
  const visibleEndpointCount = filteredGroups.reduce(
    (total: number, group: ApiEndpointGroup) => total + group.endpoints.length,
    0
  );

  return (
    <ContentLayout title="API Reference">
      <div className="mx-auto w-full max-w-[1480px]">
        <ApiDocsMobileNavigation
          groups={filteredGroups}
          query={query}
          onQueryChange={setQuery}
          endpointCount={visibleEndpointCount}
          totalEndpointCount={totalEndpointCount}
        />

        <div className="mt-4 flex gap-6 xl:mt-0">
          <ApiDocsSidebar
            groups={filteredGroups}
            query={query}
            onQueryChange={setQuery}
            endpointCount={visibleEndpointCount}
            totalEndpointCount={totalEndpointCount}
          />

          <div className="min-w-0 flex-1 space-y-6">
            <section
              id="api-reference"
              className="scroll-mt-24 overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
            >
              <div className="space-y-3 px-5 py-5 sm:px-6 sm:py-6">
                <Badge variant="outline" className="w-fit rounded-md px-2 py-1 font-mono text-[11px] uppercase tracking-wide">
                  {apiDocsMeta.title}
                </Badge>
                <div className="space-y-2">
                  <h1 className="text-2xl font-semibold tracking-tight text-foreground">Dokumentasi endpoint publik</h1>
                  <p className="max-w-4xl text-sm leading-6 text-muted-foreground">{apiDocsMeta.description}</p>
                  <p className="text-xs leading-5 text-muted-foreground">
                    Menampilkan {visibleEndpointCount} dari {totalEndpointCount} endpoint publik.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 border-t border-border px-5 py-5 sm:px-6 sm:py-6 lg:grid-cols-[minmax(0,1fr)_320px]">
                <div className="space-y-2">
                  <div className="text-sm font-medium text-foreground">Base URL</div>
                  <ApiCodeBlock code={apiDocsMeta.publicApiBaseUrl} className="rounded-xl" />
                </div>
                <div className="rounded-xl border border-border bg-background p-4">
                  <div className="text-sm font-medium text-foreground">Cakupan dokumentasi</div>
                  <ul className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
                    {apiDocsMeta.usageNotes.map((item: string) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            <section
              id="authentication"
              className="scroll-mt-24 overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
            >
              <div className="space-y-1 border-b border-border px-5 py-5 sm:px-6 sm:py-6">
                <h2 className="text-lg font-semibold tracking-tight text-foreground">Autentikasi</h2>
                <p className="text-sm leading-6 text-muted-foreground">
                  Semua endpoint pada halaman ini menggunakan header yang sama.
                </p>
              </div>

              <div className="grid gap-4 px-5 py-5 sm:px-6 sm:py-6 lg:grid-cols-[minmax(0,1fr)_320px]">
                {apiAuthSchemes.map((scheme: ApiAuthScheme) => (
                  <div key={scheme.title} className="rounded-xl border border-border bg-background p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="text-sm font-medium text-foreground">{scheme.title}</div>
                      <Badge variant="outline" className="rounded-md px-2 py-1 text-[11px]">
                        {scheme.badge}
                      </Badge>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{scheme.description}</p>
                    <div className="mt-3">
                      <ApiCodeBlock code={scheme.headers} className="rounded-xl" />
                    </div>
                  </div>
                ))}

                <div className="rounded-xl border border-border bg-background p-4">
                  <div className="text-sm font-medium text-foreground">Alur dasar</div>
                  <ol className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
                    <li>1. Ambil daftar game melalui /api/games.</li>
                    <li>2. Gunakan slug game untuk membuka detail game atau halaman order.</li>
                    <li>3. Buat order melalui /api/order.</li>
                    <li>4. Tampilkan invoice dan pantau status pembayaran melalui endpoint invoice.</li>
                  </ol>
                </div>
              </div>
            </section>

            <section id="endpoints" className="scroll-mt-24 space-y-6">
              {filteredGroups.length ? (
                filteredGroups.map((group: ApiEndpointGroup) => (
                  <section key={group.id} id={group.id} className="scroll-mt-24 space-y-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-xl font-semibold tracking-tight text-foreground">{group.title}</h2>
                        <Badge variant="outline" className="rounded-md px-2 py-1 text-[11px]">
                          {group.endpoints.length} endpoint
                        </Badge>
                      </div>
                      <p className="text-sm leading-6 text-muted-foreground">{group.description}</p>
                    </div>

                    <Accordion type="single" collapsible className="space-y-3">
                      {group.endpoints.map((endpoint: ApiEndpointDoc) => (
                        <ApiEndpointAccordion key={endpoint.id} endpoint={endpoint} value={endpoint.id} />
                      ))}
                    </Accordion>
                  </section>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-10 text-center">
                  <div className="text-base font-medium text-foreground">Endpoint tidak ditemukan</div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Ubah kata kunci pencarian untuk menampilkan endpoint publik yang tersedia.
                  </p>
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </ContentLayout>
  );
}