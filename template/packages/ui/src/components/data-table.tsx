"use client";

import * as React from "react";
import {
  columnFilteringFeature,
  globalFilteringFeature,
  rowSelectionFeature,
  rowSortingFeature,
  rowPaginationFeature,
  createPaginatedRowModel,
  createFilteredRowModel,
  createSortedRowModel,
  filterFn_includesString,
  sortFn_alphanumeric,
  sortFn_basic,
  sortFn_datetime,
  tableFeatures,
  useTable,
  type ColumnDef,
  type RowData,
  type TableOptions,
  type PaginationState,
  type SortingState,
  type ColumnFiltersState,
  type RowSelectionState,
  type Updater,
} from "@tanstack/react-table";
import { IconSearch } from "@tabler/icons-react";
import { Button } from "@repo/ui/components/button";
import { FilterSelect } from "@repo/ui/components/filter-select";
import { CaretIcon } from "@repo/ui/components/caret-icon";
import { Checkbox } from "@repo/ui/components/checkbox";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@repo/ui/components/input-group";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationEllipsis,
} from "@repo/ui/components/pagination";

type DataTableMeta = {
  align?: "left" | "right" | "center";
  layout?: "content" | "compact" | "numeric" | "date" | "actions";
  width?: number;
  text?: "primary" | "secondary";
  wrap?: boolean;
  numeric?: boolean;
};

const dataTableFeatures = tableFeatures({
  columnFilteringFeature,
  globalFilteringFeature,
  rowSelectionFeature,
  rowSortingFeature,
  rowPaginationFeature,
  filteredRowModel: createFilteredRowModel(),
  sortedRowModel: createSortedRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  filterFns: {
    includesString: filterFn_includesString,
    oneOf: (row, columnId, values: string[]) =>
      !values.length || values.includes(String(row.getValue(columnId))),
  },
  sortFns: {
    alphanumeric: sortFn_alphanumeric,
    basic: sortFn_basic,
    datetime: sortFn_datetime,
  },
  columnMeta: {} as DataTableMeta,
});

type DataTableColumn<T extends RowData> = ColumnDef<
  typeof dataTableFeatures,
  T
>;
type TableInstance<T extends RowData> = ReturnType<
  typeof useTable<typeof dataTableFeatures, T>
>;
type DataTableInstance<T extends RowData> = TableInstance<T> & {
  isLoading: boolean;
  error: string | null;
  reload: () => void;
};
type DataTableQuery = {
  pagination: PaginationState;
  sorting: SortingState;
  columnFilters: ColumnFiltersState;
  globalFilter: string;
};
type DataTableResult<T> = { rows: T[]; rowCount: number };
type TableConfiguration<T extends RowData> = Omit<
  TableOptions<typeof dataTableFeatures, T>,
  "features" | "data"
>;
type DataTableLoader<T> = (
  query: DataTableQuery,
  signal: AbortSignal,
) => Promise<DataTableResult<T>>;
type ExternalServerOptions<T extends RowData> = Required<
  Pick<
    TableConfiguration<T>,
    | "onGlobalFilterChange"
    | "onColumnFiltersChange"
    | "onSortingChange"
    | "onPaginationChange"
  >
> & {
  processing?: "server";
  loadRows?: never;
  data: T[];
  rowCount: number;
  state: NonNullable<TableConfiguration<T>["state"]> & DataTableQuery;
  isLoading: boolean;
  error: string | null;
  onReload: () => void;
};
type DataTableOptions<T extends RowData> = TableConfiguration<T> & {
  queryKey?: string;
  isLoading?: boolean;
  error?: string | null;
  onReload?: () => void;
} & (
    | { processing: "client"; data: T[]; loadRows?: never }
    | (Required<Pick<TableConfiguration<T>, "getRowId">> &
        (
          | {
              processing?: "server";
              loadRows: DataTableLoader<T>;
              data?: never;
              rowCount?: never;
            }
          | ExternalServerOptions<T>
        ))
  );
const emptyRows: never[] = [];
const update = <T,>(updater: Updater<T>, previous: T): T =>
  typeof updater === "function"
    ? (updater as (value: T) => T)(previous)
    : updater;

function useDataTable<T extends RowData>(
  options: DataTableOptions<T>,
): DataTableInstance<T> {
  const {
    processing = "server",
    loadRows,
    queryKey = "",
    isLoading: externalLoading = false,
    error: externalError = null,
    onReload,
    ...tableOptions
  } = options;
  const server = processing === "server";
  if (server && typeof options.getRowId !== "function")
    throw new Error("Server tables require getRowId with a stable record ID.");
  if (!server && loadRows)
    throw new Error(
      'loadRows requires server processing; use data with processing="client".',
    );
  if (server && !loadRows) {
    const queryFields = [
      "globalFilter",
      "columnFilters",
      "sorting",
      "pagination",
    ] as const;
    const callbacks = [
      "onGlobalFilterChange",
      "onColumnFiltersChange",
      "onSortingChange",
      "onPaginationChange",
      "onReload",
    ] as const;
    if (
      !Array.isArray(options.data) ||
      !Number.isSafeInteger(options.rowCount) ||
      options.rowCount! < 0 ||
      queryFields.some((field) => options.state?.[field] === undefined) ||
      callbacks.some((field) => typeof options[field] !== "function") ||
      typeof options.isLoading !== "boolean" ||
      options.error === undefined
    )
      throw new Error(
        "Server tables require loadRows, or controlled data, rowCount, query state, change callbacks, isLoading, error and onReload.",
      );
  }
  for (const [field, callback] of [
    ["globalFilter", "onGlobalFilterChange"],
    ["columnFilters", "onColumnFiltersChange"],
    ["sorting", "onSortingChange"],
    ["pagination", "onPaginationChange"],
    ["rowSelection", "onRowSelectionChange"],
  ] as const) {
    if (options.state?.[field] !== undefined && !options[callback])
      throw new Error(`Controlled ${field} requires ${callback}.`);
  }
  const [globalFilter, setGlobalFilter] = React.useState<string>(
    String(options.initialState?.globalFilter ?? ""),
  );
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    options.initialState?.columnFilters ?? [],
  );
  const [sorting, setSorting] = React.useState<SortingState>(
    options.initialState?.sorting ?? [],
  );
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
    ...options.initialState?.pagination,
  });
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>(
    options.initialState?.rowSelection ?? {},
  );
  const [revision, setRevision] = React.useState(0);
  const query: DataTableQuery = {
    globalFilter: String(options.state?.globalFilter ?? globalFilter ?? ""),
    columnFilters: options.state?.columnFilters ?? columnFilters,
    sorting: options.state?.sorting ?? sorting,
    pagination: options.state?.pagination ?? pagination,
  };
  const requestKey = JSON.stringify([queryKey, query, revision]);
  const [result, setResult] = React.useState<{
    key: string;
    response?: DataTableResult<T>;
    error?: string;
  }>();
  const loader = React.useRef(loadRows);
  loader.current = loadRows;
  const hasLoader = server && Boolean(loadRows);
  const pending = hasLoader ? result?.key !== requestKey : externalLoading;
  const response = result?.key === requestKey ? result.response : undefined;
  const error = hasLoader
    ? result?.key === requestKey
      ? (result.error ?? null)
      : null
    : externalError;
  const clearSelection = () => {
    if (options.onRowSelectionChange) options.onRowSelectionChange({});
    else setRowSelection({});
  };
  const resetPage = () => {
    const next = { ...query.pagination, pageIndex: 0 };
    if (options.onPaginationChange) options.onPaginationChange(next);
    else setPagination(next);
    clearSelection();
  };
  React.useEffect(() => {
    if (!hasLoader) return;
    const controller = new AbortController();
    const [, requestQuery] = JSON.parse(requestKey) as [
      string,
      DataTableQuery,
      number,
    ];
    const fetchRows = loader.current!;
    void (async () => {
      try {
        const response = await fetchRows(requestQuery, controller.signal);
        if (
          !Array.isArray(response.rows) ||
          !Number.isSafeInteger(response.rowCount) ||
          response.rowCount < response.rows.length
        )
          throw new Error(
            "Invalid table response: expected rows and a non-negative total rowCount.",
          );
        if (!controller.signal.aborted)
          setResult({ key: requestKey, response });
      } catch (error: unknown) {
        if (!controller.signal.aborted)
          setResult({
            key: requestKey,
            error:
              error instanceof Error
                ? error.message
                : "Could not load this table.",
          });
      }
    })();
    return () => controller.abort();
  }, [requestKey, hasLoader]);
  const table = useTable({
    enableMultiSort: false,
    sortDescFirst: false,
    globalFilterFn: "includesString",
    ...tableOptions,
    defaultColumn: { enableSorting: false, ...options.defaultColumn },
    data: hasLoader
      ? (response?.rows ?? emptyRows)
      : (options.data ?? emptyRows),
    rowCount: hasLoader
      ? (response?.rowCount ?? result?.response?.rowCount ?? 0)
      : options.rowCount,
    manualFiltering: server,
    manualSorting: server,
    manualPagination: server,
    autoResetPageIndex: false,
    state: {
      ...options.state,
      ...query,
      rowSelection: options.state?.rowSelection ?? rowSelection,
    },
    onGlobalFilterChange: (updater) => {
      if (options.onGlobalFilterChange) options.onGlobalFilterChange(updater);
      else setGlobalFilter((current) => String(update(updater, current) ?? ""));
      resetPage();
    },
    onColumnFiltersChange: (updater) => {
      if (options.onColumnFiltersChange) options.onColumnFiltersChange(updater);
      else setColumnFilters((current) => update(updater, current));
      resetPage();
    },
    onSortingChange: (updater) => {
      if (options.onSortingChange) options.onSortingChange(updater);
      else setSorting((current) => update(updater, current));
      resetPage();
    },
    onPaginationChange: (updater) => {
      if (options.onPaginationChange) options.onPaginationChange(updater);
      else setPagination((current) => update(updater, current));
      clearSelection();
    },
    onRowSelectionChange: options.onRowSelectionChange ?? setRowSelection,
    features: dataTableFeatures,
  });
  const previousQueryKey = React.useRef(queryKey);
  React.useEffect(() => {
    if (previousQueryKey.current === queryKey) return;
    previousQueryKey.current = queryKey;
    table.firstPage();
    table.resetRowSelection(true);
  }, [queryKey, table]);
  const pageCount = table.getPageCount();
  React.useEffect(() => {
    const lastPage = Math.max(0, pageCount - 1);
    if (!pending && !error && query.pagination.pageIndex > lastPage)
      table.setPageIndex(lastPage);
  }, [table, pending, error, pageCount, query.pagination.pageIndex]);
  return Object.assign(table, {
    isLoading: pending,
    error,
    reload: () => {
      clearSelection();
      if (hasLoader) setRevision((value) => value + 1);
      else onReload?.();
    },
  });
}

function DataTable<T extends RowData>({
  table,
  label,
  minWidth,
  selectable = false,
  rowClickable = false,
  onRowClick,
  rowLabel,
  emptyMessage = "No results match these filters.",
  loading = table.isLoading,
}: {
  table: DataTableInstance<T>;
  label: string;
  minWidth?: number;
  selectable?: boolean;
  rowClickable?: boolean;
  onRowClick?: (row: T) => void;
  rowLabel?: (row: T) => string;
  emptyMessage?: React.ReactNode;
  loading?: boolean;
}) {
  const rows = table.getRowModel().rows;
  const groups = table.getHeaderGroups();
  const columns = table.getAllLeafColumns();
  const columnLayout = (meta?: DataTableMeta) =>
    meta?.layout ?? (meta?.numeric ? "numeric" : "content");
  const columnWidth = (meta?: DataTableMeta) =>
    meta?.width !== undefined
      ? `${meta.width}px`
      : `var(--table-column-${columnLayout(meta)})`;
  const contentWidths = columns
    .filter((column) => columnLayout(column.columnDef.meta) === "content")
    .map((column) => columnWidth(column.columnDef.meta));
  const contentMinimum = `max(${contentWidths.join(", ") || "0px"})`;
  const minimumWidth = `calc(${
    [
      ...(selectable ? ["var(--table-column-selection)"] : []),
      ...columns.map((column) =>
        columnLayout(column.columnDef.meta) === "content"
          ? contentMinimum
          : columnWidth(column.columnDef.meta),
      ),
    ].join(" + ") || "0px"
  })`;
  const selectableRows = selectable
    ? rows.filter((row) => row.getCanSelect())
    : [];
  const selectedCount = selectableRows.filter((row) =>
    row.getIsSelected(),
  ).length;
  const allSelected =
    selectableRows.length > 0 && selectedCount === selectableRows.length;
  return (
    <Table
      className="ui-data-table"
      aria-label={label}
      aria-busy={loading}
      style={{
        minWidth:
          minWidth === undefined
            ? minimumWidth
            : `max(${minWidth}px, ${minimumWidth})`,
      }}
      containerProps={{
        tabIndex: 0,
        role: "region",
        "aria-label": `${label} scroll area`,
      }}
    >
      <colgroup>
        {selectable && <col className="ui-table-selection" />}
        {columns.map((column) => (
          <col
            key={column.id}
            style={{
              width:
                columnLayout(column.columnDef.meta) === "content"
                  ? undefined
                  : columnWidth(column.columnDef.meta),
            }}
          />
        ))}
      </colgroup>
      <TableHeader>
        {groups.map((group, index) => (
          <TableRow key={group.id}>
            {selectable && index === 0 && (
              <TableHead className="ui-table-selection" rowSpan={groups.length}>
                <Checkbox
                  aria-label={`Select all ${label} on this page`}
                  checked={allSelected}
                  indeterminate={selectedCount > 0 && !allSelected}
                  disabled={!selectableRows.length || loading}
                  onCheckedChange={(checked) =>
                    selectableRows.forEach((row) => row.toggleSelected(checked))
                  }
                />
              </TableHead>
            )}
            {group.headers.map((header) => {
              const meta = header.column.columnDef.meta;
              const sorted = header.column.getIsSorted();
              const sortable =
                !header.isPlaceholder && header.column.getCanSort();
              return (
                <TableHead
                  key={header.id}
                  colSpan={header.colSpan}
                  data-sortable={sortable}
                  data-align={meta?.align ?? (meta?.numeric ? "right" : "left")}
                  aria-sort={
                    sortable
                      ? sorted === "asc"
                        ? "ascending"
                        : sorted === "desc"
                          ? "descending"
                          : "none"
                      : undefined
                  }
                >
                  {header.isPlaceholder ? null : sortable ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ui-table-sort type-ui-caption"
                      disabled={loading}
                      onClick={header.column.getToggleSortingHandler()}
                      aria-label={`Sort by ${typeof header.column.columnDef.header === "string" ? header.column.columnDef.header : header.column.id}`}
                    >
                      <span className="ui-table-header-label">
                        <table.FlexRender header={header} />
                      </span>
                      <span
                        className="ui-table-sort-direction"
                        aria-hidden="true"
                      >
                        <CaretIcon
                          variant="chevron"
                          direction="up"
                          viewBox="0 6 24 12"
                          strokeWidth={1.5}
                          data-active={sorted === "asc"}
                        />
                        <CaretIcon
                          variant="chevron"
                          viewBox="0 6 24 12"
                          strokeWidth={1.5}
                          data-active={sorted === "desc"}
                        />
                      </span>
                    </Button>
                  ) : (
                    <table.FlexRender header={header} />
                  )}
                </TableHead>
              );
            })}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {loading || table.error || !rows.length ? (
          <TableRow>
            <TableCell
              colSpan={table.getAllLeafColumns().length + Number(selectable)}
              className="ui-table-empty"
            >
              <span role={!loading && table.error ? "alert" : "status"}>
                {loading ? "Loading…" : (table.error ?? emptyMessage)}
              </span>
              {!loading && table.error && (
                <Button variant="outline" size="sm" onClick={table.reload}>
                  Retry
                </Button>
              )}
            </TableCell>
          </TableRow>
        ) : (
          rows.map((row) => {
            const clickable =
              rowClickable &&
              (selectable ? row.getCanSelect() : Boolean(onRowClick));
            const activate = () =>
              selectable ? row.toggleSelected() : onRowClick?.(row.original);
            const isControl = (target: EventTarget) =>
              target instanceof Element &&
              Boolean(
                target.closest(
                  'a,button,input,select,textarea,label,[role="button"],[role="checkbox"],[role="switch"],[role="link"],[contenteditable]:not([contenteditable="false"]),[data-row-click-ignore]',
                ),
              );
            return (
              <TableRow
                key={row.id}
                tabIndex={clickable ? 0 : undefined}
                className={
                  clickable
                    ? "cursor-pointer focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
                    : undefined
                }
                onClick={
                  clickable
                    ? (event) => {
                        if (
                          event.defaultPrevented ||
                          isControl(event.target) ||
                          window.getSelection()?.toString()
                        )
                          return;
                        activate();
                      }
                    : undefined
                }
                onKeyDown={
                  clickable
                    ? (event) => {
                        if (
                          event.target !== event.currentTarget ||
                          event.defaultPrevented ||
                          (event.key !== "Enter" && event.key !== " ")
                        )
                          return;
                        event.preventDefault();
                        activate();
                      }
                    : undefined
                }
                data-state={
                  selectable && row.getIsSelected() ? "selected" : undefined
                }
              >
                {selectable && (
                  <TableCell className="ui-table-selection">
                    <Checkbox
                      aria-label={`Select ${rowLabel?.(row.original) ?? row.id}`}
                      checked={row.getIsSelected()}
                      disabled={!row.getCanSelect()}
                      onCheckedChange={(checked) => row.toggleSelected(checked)}
                    />
                  </TableCell>
                )}
                {row.getAllCells().map((cell) => {
                  const meta = cell.column.columnDef.meta;
                  return (
                    <TableCell
                      key={cell.id}
                      data-align={
                        meta?.align ?? (meta?.numeric ? "right" : "left")
                      }
                      data-text={meta?.text}
                      data-wrap={meta?.wrap}
                      data-numeric={meta?.numeric}
                      data-sortable={cell.column.getCanSort()}
                    >
                      <table.FlexRender cell={cell} />
                    </TableCell>
                  );
                })}
              </TableRow>
            );
          })
        )}
      </TableBody>
    </Table>
  );
}

function DataTableToolbar<T extends RowData>({
  table,
  searchLabel,
  children,
}: {
  table: DataTableInstance<T>;
  searchLabel: string;
  children?: React.ReactNode;
}) {
  const query = String(table.state.globalFilter ?? "");
  const filtered = Boolean(query || table.state.columnFilters.length);
  return (
    <div className="ui-table-toolbar">
      <InputGroup className="ui-table-search">
        <InputGroupAddon>
          <IconSearch aria-hidden="true" />
        </InputGroupAddon>
        <InputGroupInput
          aria-label={searchLabel}
          placeholder="Search"
          value={query}
          onChange={(event) =>
            table.setGlobalFilter(event.target.value.trimStart())
          }
          onClear={() => table.setGlobalFilter("")}
        />
      </InputGroup>
      <div className="ui-table-toolbar-actions">
        {children}
        {filtered && (
          <Button
            variant="reset"
            size="sm"
            onClick={() => {
              table.setGlobalFilter("");
              table.resetColumnFilters(true);
            }}
          >
            Reset filters
          </Button>
        )}
      </div>
    </div>
  );
}

function DataTableFilter<T extends RowData>({
  table,
  columnId,
  label,
  options,
  allLabel = label,
}: {
  table: DataTableInstance<T>;
  columnId: string;
  label: string;
  options: { label: string; value: string }[];
  allLabel?: string;
}) {
  const column = table.getColumn(columnId);
  if (!column) throw new Error(`Unknown table filter column: ${columnId}`);
  const values = (column.getFilterValue() ?? []) as string[];
  return (
    <FilterSelect
      mode="multiple"
      label={label}
      placeholder={allLabel}
      value={values}
      onValueChange={(next) =>
        column.setFilterValue(next.length ? next : undefined)
      }
      options={options}
      summary="compact"
      reset={false}
    />
  );
}

function DataTablePagination<T extends RowData>({
  table,
  label = "items",
  children,
}: {
  table: DataTableInstance<T>;
  label?: string;
  children?: React.ReactNode;
}) {
  const count = table.getRowCount();
  const pages = table.getPageCount();
  const { pageIndex, pageSize } = table.state.pagination;
  const selected = table
    .getRowModel()
    .rows.filter((row) => row.getIsSelected()).length;
  const indexes = [
    ...new Set([0, pageIndex - 1, pageIndex, pageIndex + 1, pages - 1]),
  ]
    .filter((index) => index >= 0 && index < pages)
    .sort((a, b) => a - b);
  return (
    <div className="ui-table-pagination">
      {pages > 1 && (
        <Pagination
          aria-label={`${label} pages`}
          className="ui-table-pagination-nav"
        >
          <PaginationContent>
            <PaginationItem>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Previous page"
                disabled={table.isLoading || !table.getCanPreviousPage()}
                onClick={table.previousPage}
              >
                <CaretIcon variant="chevron" direction="left" />
              </Button>
            </PaginationItem>
            {indexes.map((index, at) => (
              <React.Fragment key={index}>
                {at > 0 && index > indexes[at - 1]! + 1 && (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                )}
                <PaginationItem>
                  <Button
                    variant={index === pageIndex ? "outline" : "ghost"}
                    size="icon-sm"
                    aria-label={`Page ${index + 1}`}
                    aria-current={index === pageIndex ? "page" : undefined}
                    disabled={table.isLoading}
                    onClick={() => table.setPageIndex(index)}
                  >
                    {index + 1}
                  </Button>
                </PaginationItem>
              </React.Fragment>
            ))}
            <PaginationItem>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Next page"
                disabled={table.isLoading || !table.getCanNextPage()}
                onClick={table.nextPage}
              >
                <CaretIcon variant="chevron" direction="right" />
              </Button>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
      <span role="status" className="ui-table-pagination-count">
        {table.isLoading
          ? `Loading ${label}…`
          : table.error
            ? "Results unavailable"
            : `${pages > 1 ? `${pageIndex * pageSize + 1}–${Math.min((pageIndex + 1) * pageSize, count)} of ${count}` : count} ${label}`}
        {selected > 0 ? ` · ${selected} selected` : ""}
      </span>
      {children && (
        <div className="ui-table-pagination-actions">{children}</div>
      )}
    </div>
  );
}

function DataTableText({
  primary,
  secondary,
  icon,
  onClick,
  trailing,
}: {
  primary: React.ReactNode;
  secondary?: React.ReactNode;
  icon?: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  trailing?: React.ReactNode;
}) {
  return (
    <div className="ui-table-text">
      {icon && <span className="ui-table-text-icon">{icon}</span>}
      <div className="min-w-0 flex-1">
        <div className="ui-table-text-primary">
          {onClick ? (
            <Button
              variant="ghost"
              size="sm"
              className="ui-table-text-action"
              onClick={onClick}
              title={typeof primary === "string" ? primary : undefined}
            >
              <span className="truncate">{primary}</span>
            </Button>
          ) : (
            <div className="min-w-0 type-ui-body-medium">{primary}</div>
          )}
          {trailing && <span className="shrink-0">{trailing}</span>}
        </div>
        {secondary && (
          <div className="type-ui-caption text-muted-foreground">
            {secondary}
          </div>
        )}
      </div>
    </div>
  );
}

export {
  DataTable,
  DataTableToolbar,
  DataTableFilter,
  DataTableText,
  DataTablePagination,
  useDataTable,
  dataTableFeatures,
};
export type {
  DataTableColumn,
  DataTableInstance,
  DataTableQuery,
  DataTableResult,
  DataTableOptions,
};
