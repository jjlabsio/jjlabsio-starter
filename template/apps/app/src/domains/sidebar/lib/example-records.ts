import type {
  DataTableQuery,
  DataTableResult,
} from "@repo/ui/components/data-table";

export type ExampleRecord = {
  id: string;
  name: string;
  domain: string;
  status: string;
  category: string;
  entries: number;
  created: string;
};
const names = [
  "Northstar",
  "Acme",
  "Orbit",
  "Canvas",
  "Waypoint",
  "Clarity",
  "Forma",
  "Outline",
  "Brightside",
  "Gather",
  "Fieldwork",
  "Daylight",
];
export const exampleRecords: ExampleRecord[] = Array.from(
  { length: 63 },
  (_, index) => ({
    id: `record-${index}`,
    name: `${names[index % names.length]}${index < names.length ? "" : ` ${Math.floor(index / names.length) + 1}`}`,
    domain: `${names[index % names.length]!.toLowerCase()}${index < names.length ? "" : `-${index}`}.example`,
    status: ["Active", "Paused", "Archived"][index % 3]!,
    category: ["Product", "Marketing"][index % 2]!,
    entries:
      [605, 42, 413, 98, 1002, 221, 7, 186, 384, 68, 269, 129][index % 12]! +
      Math.floor(index / 12) * 10,
    created: `2026-09-${String(((index * 7) % 28) + 1).padStart(2, "0")}T12:00:00Z`,
  }),
);
const filters: Record<string, string[]> = {
  status: ["Active", "Paused", "Archived"],
  category: ["Product", "Marketing"],
};
const sortable = ["name", "status", "category", "entries", "created"];

export function parseRecordQuery(
  params: URLSearchParams,
  sortColumns = sortable,
  filterOptions = filters,
): DataTableQuery {
  const pageIndex = Number(params.get("pageIndex") ?? 0);
  const pageSize = Number(params.get("pageSize") ?? 20);
  const globalFilter = params.get("search") ?? "";
  const sort = params.get("sort");
  const direction = params.get("direction") ?? "asc";
  if (
    !Number.isSafeInteger(pageIndex) ||
    pageIndex < 0 ||
    !Number.isSafeInteger(pageSize) ||
    pageSize < 1 ||
    pageSize > 100 ||
    globalFilter.length > 200 ||
    (sort && !sortColumns.includes(sort)) ||
    !["asc", "desc"].includes(direction)
  )
    throw new Error("Invalid table query.");
  const columnFilters = Object.entries(filterOptions).flatMap(
    ([id, allowed]) => {
      const values = [...new Set(params.getAll(id))];
      if (values.some((value) => !allowed.includes(value)))
        throw new Error("Invalid filter value.");
      return values.length ? [{ id, value: values }] : [];
    },
  );
  return {
    pagination: { pageIndex, pageSize },
    globalFilter,
    columnFilters,
    sorting: sort ? [{ id: sort, desc: direction === "desc" }] : [],
  };
}

/** Replace the fixture filter/sort/slice with a scoped Prisma query and matching count. */
export function queryExampleRecords(
  query: DataTableQuery,
  archived: string[] = [],
): DataTableResult<ExampleRecord> {
  const search = query.globalFilter.trim().toLowerCase();
  const archivedIds = new Set(archived);
  const rows = exampleRecords
    .map((row) =>
      archivedIds.has(row.id) ? { ...row, status: "Archived" } : row,
    )
    .filter(
      (row) =>
        (!search ||
          `${row.name} ${row.domain}`.toLowerCase().includes(search)) &&
        query.columnFilters.every(({ id, value }) =>
          (value as string[]).includes(row[id as "status" | "category"]),
        ),
    );
  const sort = query.sorting[0];
  if (sort)
    rows.sort((a, b) => {
      const left = a[sort.id as keyof ExampleRecord];
      const right = b[sort.id as keyof ExampleRecord];
      const difference =
        typeof left === "number" && typeof right === "number"
          ? left - right
          : String(left).localeCompare(String(right), "en", { numeric: true });
      return (
        (sort.desc ? -difference : difference) ||
        a.id.localeCompare(b.id, "en", { numeric: true })
      );
    });
  const start = query.pagination.pageIndex * query.pagination.pageSize;
  return {
    rows: rows.slice(start, start + query.pagination.pageSize),
    rowCount: rows.length,
  };
}
