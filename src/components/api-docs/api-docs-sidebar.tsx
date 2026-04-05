import type { ReactNode } from "react";
import Link from "next/link";
import { Menu, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { ApiEndpointDoc, ApiEndpointGroup } from "@/lib/api-docs/types";

import { ApiMethodBadge } from "./api-method-badge";

type ApiDocsNavigationProps = {
  groups: ApiEndpointGroup[];
  query: string;
  onQueryChange: (value: string) => void;
  endpointCount: number;
  totalEndpointCount: number;
};

function SectionLink({
  href,
  className,
  children,
  withSheetClose = false,
}: {
  href: string;
  className: string;
  children: ReactNode;
  withSheetClose?: boolean;
}) {
  const link = (
    <Link href={href} className={className}>
      {children}
    </Link>
  );

  if (!withSheetClose) {
    return link;
  }

  return <SheetClose asChild>{link}</SheetClose>;
}

function NavigationLinks({
  groups,
  withSheetClose = false,
}: {
  groups: ApiEndpointGroup[];
  withSheetClose?: boolean;
}) {
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <SectionLink href="#api-reference" className="block rounded-lg px-3 py-2 text-sm text-foreground hover:bg-muted/50" withSheetClose={withSheetClose}>
          Ringkasan
        </SectionLink>
        <SectionLink href="#authentication" className="block rounded-lg px-3 py-2 text-sm text-foreground hover:bg-muted/50" withSheetClose={withSheetClose}>
          Autentikasi
        </SectionLink>
        <SectionLink href="#endpoints" className="block rounded-lg px-3 py-2 text-sm text-foreground hover:bg-muted/50" withSheetClose={withSheetClose}>
          Endpoint publik
        </SectionLink>
      </div>

      <div className="space-y-4">
        {groups.map((group: ApiEndpointGroup) => (
          <div key={group.id} className="space-y-2">
            <SectionLink
              href={`#${group.id}`}
              className="block rounded-lg bg-muted/40 px-3 py-2 text-sm font-medium text-foreground hover:bg-muted/60"
              withSheetClose={withSheetClose}
            >
              {group.title}
            </SectionLink>

            <div className="space-y-1 pl-2">
              {group.endpoints.map((endpoint: ApiEndpointDoc) => (
                <SectionLink
                  key={endpoint.id}
                  href={`#${endpoint.id}`}
                  className="flex items-start gap-2 rounded-lg px-2 py-2 text-xs text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                  withSheetClose={withSheetClose}
                >
                  <ApiMethodBadge method={endpoint.method} className="mt-0.5 px-1.5 py-0.5 text-[10px]" />
                  <span className="line-clamp-2 break-all">{endpoint.path}</span>
                </SectionLink>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ApiDocsSidebar({
  groups,
  query,
  onQueryChange,
  endpointCount,
  totalEndpointCount,
}: ApiDocsNavigationProps) {
  return (
    <aside className="sticky top-24 hidden h-[calc(100vh-7rem)] w-[300px] shrink-0 xl:block">
      <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="border-b border-border p-4">
          <div className="space-y-1">
            <div className="text-sm font-semibold text-foreground">Navigasi endpoint</div>
            <div className="text-xs text-muted-foreground">
              Menampilkan {endpointCount} dari {totalEndpointCount} endpoint publik.
            </div>
          </div>

          <div className="relative mt-4">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder="Cari endpoint"
              className="h-10 rounded-xl border-border pl-10"
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-4">
            <NavigationLinks groups={groups} />
          </div>
        </ScrollArea>
      </div>
    </aside>
  );
}

export function ApiDocsMobileNavigation({
  groups,
  query,
  onQueryChange,
  endpointCount,
  totalEndpointCount,
}: ApiDocsNavigationProps) {
  return (
    <div className="space-y-3 xl:hidden">
      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-foreground">Endpoint publik</div>
            <div className="mt-1 text-xs leading-5 text-muted-foreground">
              Menampilkan {endpointCount} dari {totalEndpointCount} endpoint publik.
            </div>
          </div>

          <Sheet>
            <SheetTrigger asChild>
              <Button type="button" variant="outline" size="sm" className="gap-2 rounded-lg">
                <Menu className="h-4 w-4" />
                Daftar
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[88vw] max-w-sm p-0">
              <SheetHeader className="border-b border-border px-5 py-4">
                <SheetTitle>Daftar endpoint</SheetTitle>
                <SheetDescription>Navigasi cepat ke endpoint publik yang tersedia pada halaman ini.</SheetDescription>
              </SheetHeader>
              <ScrollArea className="h-[calc(100vh-5.5rem)]">
                <div className="p-4">
                  <NavigationLinks groups={groups} withSheetClose />
                </div>
              </ScrollArea>
            </SheetContent>
          </Sheet>
        </div>

        <div className="relative mt-4">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Cari endpoint"
            className="h-10 rounded-xl border-border pl-10"
          />
        </div>
      </div>
    </div>
  );
}