"use client";

import * as React from "react";
import { IconDots, IconWorld } from "@tabler/icons-react";
import { PageContainer } from "@/domains/sidebar/components/page-container";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@repo/ui/components/card";
import {
  DataTable,
  DataTableToolbar,
  DataTableFilter,
  DataTableText,
  DataTablePagination,
  useDataTable,
  type DataTableColumn,
} from "@repo/ui/components/data-table";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@repo/ui/components/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@repo/ui/components/dialog";
import type { ExampleRecord } from "@/domains/sidebar/lib/example-records";
import { loadExampleRecords } from "@/domains/sidebar/lib/load-example-records";

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
const options = (values: string[]) =>
  values.map((value) => ({ label: value, value }));

export default function TablesPage() {
  const [detail, setDetail] = React.useState<ExampleRecord | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [message, setMessage] = React.useState("");
  const [failed, setFailed] = React.useState(false);
  const columns = React.useMemo<DataTableColumn<ExampleRecord>[]>(
    () => [
      {
        id: "name",
        accessorFn: (row) => `${row.name} ${row.domain}`,
        header: "Name",
        enableSorting: true,
        sortFn: "alphanumeric",
        meta: { layout: "content", wrap: true },
        cell: ({ row }) => (
          <DataTableText
            primary={row.original.name}
            secondary={row.original.domain}
            icon={<IconWorld aria-hidden="true" />}
          />
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        enableSorting: true,
        meta: { layout: "compact" },
        filterFn: "oneOf",
        sortFn: "alphanumeric",
        cell: ({ row }) => (
          <Badge variant="status">{row.original.status}</Badge>
        ),
      },
      {
        accessorKey: "category",
        header: "Category",
        enableSorting: true,
        meta: { layout: "compact" },
        filterFn: "oneOf",
        sortFn: "alphanumeric",
      },
      {
        accessorKey: "entries",
        header: "Entries",
        enableSorting: true,
        sortFn: "basic",
        enableGlobalFilter: false,
        meta: { numeric: true },
      },
      {
        id: "created",
        accessorFn: (row) => new Date(row.created),
        header: "Created",
        enableSorting: true,
        sortFn: "datetime",
        enableGlobalFilter: false,
        meta: { layout: "date", align: "right", text: "secondary" },
        cell: ({ row }) => formatDate(row.original.created),
      },
      {
        id: "actions",
        header: "",
        enableSorting: false,
        meta: { layout: "actions" },
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Actions for ${row.original.name}`}
                />
              }
            >
              <IconDots aria-hidden="true" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setDetail(row.original)}>
                View details
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [],
  );
  const table = useDataTable({
    loadRows: loadExampleRecords,
    columns,
    getRowId: (row) => row.id,
  });
  const selected = table.getSelectedRowModel().rows;

  return (
    <PageContainer title="Tables">
      <Card variant="panel" className="min-w-0">
        <CardHeader>
          <CardTitle>All records</CardTitle>
        </CardHeader>
        <CardContent padding="none">
          <DataTableToolbar table={table} searchLabel="Search records">
            <DataTableFilter
              table={table}
              columnId="status"
              label="Status"
              options={options(["Active", "Paused", "Archived"])}
            />
            <DataTableFilter
              table={table}
              columnId="category"
              label="Category"
              options={options(["Product", "Marketing"])}
            />
          </DataTableToolbar>
          <DataTable
            table={table}
            label="records"
            selectable
            rowLabel={(row) => row.name}
            minWidth={860}
          />
          <DataTablePagination table={table} label="records">
            <Button
              variant="outline"
              size="sm"
              disabled={!selected.length || saving || table.isLoading}
              onClick={async () => {
                setSaving(true);
                setFailed(false);
                try {
                  const response = await fetch("/api/examples/records", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      ids: selected.map((row) => row.id),
                    }),
                  });
                  if (!response.ok)
                    throw new Error("Could not archive records. Try again.");
                  setMessage(
                    `${selected.length} example records archived for this browser session.`,
                  );
                  table.reload();
                } catch (error) {
                  setFailed(true);
                  setMessage(
                    error instanceof Error
                      ? error.message
                      : "Could not archive records.",
                  );
                } finally {
                  setSaving(false);
                }
              }}
            >
              {saving
                ? "Archiving…"
                : selected.length
                  ? `Archive ${selected.length} selected`
                  : "Archive selected"}
            </Button>
            <Button
              variant="reset"
              size="sm"
              disabled={!Object.values(table.state.rowSelection).some(Boolean)}
              onClick={() => table.resetRowSelection(true)}
            >
              Clear selection
            </Button>
            <Button
              variant="reset"
              size="sm"
              disabled={!table.state.sorting.length}
              onClick={() => table.resetSorting(true)}
            >
              Reset sort
            </Button>
          </DataTablePagination>
        </CardContent>
      </Card>
      {message && (
        <p
          role={failed ? "alert" : "status"}
          className="type-ui-body text-muted-foreground"
        >
          {message}
        </p>
      )}
      <Dialog
        open={Boolean(detail)}
        onOpenChange={(open) => {
          if (!open) setDetail(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{detail?.name}</DialogTitle>
            <DialogDescription>{detail?.domain}</DialogDescription>
          </DialogHeader>
          {detail && (
            <dl className="ui-settings-details">
              <div>
                <dt>Status</dt>
                <dd>{detail.status}</dd>
              </div>
              <div>
                <dt>Category</dt>
                <dd>{detail.category}</dd>
              </div>
              <div>
                <dt>Entries</dt>
                <dd>{detail.entries.toLocaleString("en-US")}</dd>
              </div>
              <div>
                <dt>Created</dt>
                <dd>{formatDate(detail.created)}</dd>
              </div>
            </dl>
          )}
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
