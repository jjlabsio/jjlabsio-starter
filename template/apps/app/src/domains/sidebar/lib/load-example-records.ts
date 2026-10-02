import type {
  DataTableQuery,
  DataTableResult,
} from "@repo/ui/components/data-table";
import type { ExampleRecord } from "./example-records";

export function tableQueryParams(query: DataTableQuery) {
  const params = new URLSearchParams({
    pageIndex: String(query.pagination.pageIndex),
    pageSize: String(query.pagination.pageSize),
    search: query.globalFilter,
  });
  const sort = query.sorting[0];
  if (sort) {
    params.set("sort", sort.id);
    params.set("direction", sort.desc ? "desc" : "asc");
  }
  for (const filter of query.columnFilters)
    for (const value of filter.value as string[])
      params.append(filter.id, value);
  return params;
}
export async function loadExampleRecords(
  query: DataTableQuery,
  signal: AbortSignal,
): Promise<DataTableResult<ExampleRecord>> {
  const params = tableQueryParams(query);
  const response = await fetch(`/api/examples/records?${params}`, {
    signal,
    cache: "no-store",
  });
  if (!response.ok)
    throw new Error(
      response.status === 401
        ? "Your session expired. Sign in again."
        : "Could not load records. Try again.",
    );
  return response.json();
}
