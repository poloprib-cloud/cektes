import { Badge } from "@/components/ui/badge";
import { HttpMethod } from "@/lib/api-docs";
import { cn } from "@/lib/utils";

const styles: Record<HttpMethod, string> = {
  GET: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  POST: "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  PUT: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  PATCH: "border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-300",
  DELETE: "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300",
};

export function ApiMethodBadge({ method, className }: { method: HttpMethod; className?: string }) {
  return (
    <Badge
      className={cn(
        "rounded-md border px-2 py-1 font-mono text-[11px] font-semibold uppercase tracking-wide hover:bg-transparent",
        styles[method],
        className
      )}
    >
      {method}
    </Badge>
  );
}