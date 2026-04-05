import type { ApiParamDoc } from "@/lib/api-docs/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function ApiParamsTable({
  title,
  params,
}: {
  title: string;
  params?: ApiParamDoc[];
}) {
  if (!params?.length) {
    return null;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-background">
      <div className="border-b border-border px-4 py-3 text-sm font-medium text-foreground">{title}</div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="whitespace-nowrap">Nama</TableHead>
              <TableHead className="whitespace-nowrap">Tipe</TableHead>
              <TableHead className="whitespace-nowrap">Wajib</TableHead>
              <TableHead>Deskripsi</TableHead>
              <TableHead className="whitespace-nowrap">Contoh</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {params.map((param) => (
              <TableRow key={`${title}-${param.name}`}>
                <TableCell className="max-w-[180px] break-all font-mono text-xs font-medium text-foreground">
                  {param.name}
                </TableCell>
                <TableCell className="whitespace-nowrap text-xs text-muted-foreground">{param.type}</TableCell>
                <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                  {param.required ? "Ya" : "Tidak"}
                </TableCell>
                <TableCell className="min-w-[240px] text-sm text-muted-foreground">{param.description}</TableCell>
                <TableCell className="max-w-[220px] break-all text-xs text-muted-foreground">
                  {param.example ?? "-"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}