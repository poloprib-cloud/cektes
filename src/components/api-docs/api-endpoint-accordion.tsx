import { CheckCircle2, CircleAlert } from "lucide-react";

import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import type { ApiEndpointDoc, ApiErrorExampleDoc, ApiStatusCodeDoc } from "@/lib/api-docs/types";

import { ApiCodeBlock } from "./api-code-block";
import { ApiMethodBadge } from "./api-method-badge";
import { ApiParamsTable } from "./api-params-table";

export function ApiEndpointAccordion({ endpoint, value }: { endpoint: ApiEndpointDoc; value: string }) {
  return (
    <div id={endpoint.id} className="scroll-mt-24">
      <AccordionItem value={value} className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <AccordionTrigger className="px-4 py-4 hover:no-underline sm:px-5">
          <div className="flex w-full flex-col gap-3 text-left xl:flex-row xl:items-start xl:justify-between">
            <div className="min-w-0 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <ApiMethodBadge method={endpoint.method} />
                <code className="max-w-full break-all rounded-md bg-muted px-2.5 py-1 font-mono text-xs text-foreground sm:text-sm">
                  {endpoint.path}
                </code>
              </div>
              <div className="space-y-1">
                <div className="text-base font-semibold text-foreground">{endpoint.summary}</div>
                <div className="text-sm leading-6 text-muted-foreground">{endpoint.description}</div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 xl:justify-end">
              {endpoint.auth.map((item: string) => (
                <Badge key={item} variant="outline" className="rounded-md px-2 py-1 text-[11px]">
                  {item}
                </Badge>
              ))}
            </div>
          </div>
        </AccordionTrigger>

        <AccordionContent className="border-t border-border bg-muted/20 px-4 py-4 sm:px-5 sm:py-5">
          <div className="space-y-5">
            <section className="space-y-3">
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Request</div>
              <div className="space-y-3 rounded-xl border border-border bg-background p-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium text-foreground">Full path</div>
                  <ApiCodeBlock code={endpoint.fullPath ?? endpoint.path} className="rounded-xl" />
                </div>

                <div className="grid gap-3 2xl:grid-cols-2">
                  <ApiParamsTable title="Header" params={endpoint.headers} />
                  <ApiParamsTable title="Path parameter" params={endpoint.pathParams} />
                  <ApiParamsTable title="Query parameter" params={endpoint.queryParams} />
                  <ApiParamsTable title="Request body" params={endpoint.bodyFields} />
                </div>

                {endpoint.notes?.length ? (
                  <div className="space-y-2 rounded-xl border border-border bg-muted/30 p-4">
                    <div className="text-sm font-medium text-foreground">Catatan implementasi</div>
                    <ul className="space-y-2 text-sm leading-6 text-muted-foreground">
                      {endpoint.notes.map((note: string) => (
                        <li key={note}>{note}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {endpoint.requestExample ? (
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-foreground">Contoh request</div>
                    <ApiCodeBlock code={endpoint.requestExample.content} className="rounded-xl" />
                  </div>
                ) : null}
              </div>
            </section>

            <section className="space-y-3">
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Response</div>
              <div className="space-y-3 rounded-xl border border-border bg-background p-4">
                {endpoint.statusCodes?.length ? (
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-foreground">Status code</div>
                    <div className="grid gap-2 md:grid-cols-2">
                      {endpoint.statusCodes.map((item: ApiStatusCodeDoc) => (
                        <div key={`${endpoint.id}-${item.code}`} className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm">
                          <div className="font-semibold text-foreground">{item.code}</div>
                          <div className="mt-1 text-muted-foreground">{item.description}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                {endpoint.successExample ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      Contoh response sukses
                    </div>
                    <ApiCodeBlock code={endpoint.successExample.content} className="rounded-xl" />
                  </div>
                ) : null}

                {endpoint.errorExamples?.length ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <CircleAlert className="h-4 w-4 text-primary" />
                      Contoh response error
                    </div>
                    <div className="grid gap-3 2xl:grid-cols-2">
                      {endpoint.errorExamples.map((error: ApiErrorExampleDoc) => (
                        <div key={`${endpoint.id}-${error.title}`} className="space-y-2 rounded-xl border border-border bg-muted/30 p-4">
                          <div className="flex items-center justify-between gap-3">
                            <div className="text-sm font-medium text-foreground">{error.title}</div>
                            <Badge variant="outline" className="rounded-md px-2 py-1 text-[11px]">
                              {error.status}
                            </Badge>
                          </div>
                          <ApiCodeBlock code={error.content} className="rounded-xl" />
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </section>
          </div>
        </AccordionContent>
      </AccordionItem>
    </div>
  );
}