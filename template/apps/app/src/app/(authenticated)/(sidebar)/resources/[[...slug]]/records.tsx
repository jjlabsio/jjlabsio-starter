"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  DataTable,
  DataTableToolbar,
  DataTablePagination,
  useDataTable,
  type DataTableColumn,
} from "@repo/ui/components/data-table";
import { Badge } from "@repo/ui/components/badge";
type ResourceRow = {
  id: string;
  name: string;
  description: string;
  status: string;
  detail: string;
  href: string;
};
const columns: DataTableColumn<ResourceRow>[] = [
  {
    accessorKey: "name",
    header: "Name",
    meta: { layout: "content", wrap: true },
    cell: ({ row }) => (
      <div>
        <Link
          className="type-ui-body-medium hover:underline focus-visible:underline"
          href={row.original.href}
        >
          {row.original.name}
        </Link>
        <p className="type-ui-caption text-muted-foreground">
          {row.original.description}
        </p>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    meta: { layout: "compact" },
    cell: ({ row }) => <Badge variant="status">{row.original.status}</Badge>,
  },
  { accessorKey: "detail", header: "Details", meta: { layout: "content" } },
];
// Small fixed fixtures are fully loaded; production lists use loadRows.
export function ResourceRecords({
  rows,
  label,
}: {
  rows: ResourceRow[];
  label: string;
}) {
  const router = useRouter();
  const table = useDataTable({
    processing: "client",
    data: rows,
    columns,
    getRowId: (row) => row.id,
  });
  return (
    <>
      <DataTableToolbar table={table} searchLabel={`Search ${label}`} />
      <DataTable
        table={table}
        label={label}
        minWidth={560}
        rowClickable
        onRowClick={(row) => router.push(row.href)}
      />
      <DataTablePagination table={table} label={label} />
    </>
  );
}
