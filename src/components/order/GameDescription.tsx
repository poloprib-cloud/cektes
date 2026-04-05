"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText } from "lucide-react";
import parse from "html-react-parser";

interface GameDescriptionProps {
  isLoading: boolean;
  description?: string;
}

export default function GameDescription({ isLoading, description }: GameDescriptionProps) {
  return (
    <section className="scroll-mt-20 md:scroll-mt-[7.5rem]" id="5">
      <Accordion type="single" collapsible>
        <AccordionItem value="desc" className="rounded-xl border bg-muted/50 shadow-sm">
          <AccordionTrigger className="px-4 py-2 text-left text-sm font-semibold text-card-foreground hover:no-underline">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              Deskripsi
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 py-2 text-sm">
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ) : description ? (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                {parse(description)}
              </div>
            ) : (
              <div className="italic text-muted-foreground">Tidak ada deskripsi.</div>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </section>
  );
}