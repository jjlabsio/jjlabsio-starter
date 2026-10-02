// @vitest-environment jsdom
import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  DataTable,
  DataTablePagination,
  useDataTable,
  type DataTableColumn,
  type DataTableInstance,
  type DataTableOptions,
  type DataTableQuery,
  type DataTableResult,
} from "@repo/ui/components/data-table";

type Item = { id: string; name: string; status: string };

it("행 클릭은 선택과 상세 동작을 구분하고 내부 버튼은 중복 실행하지 않는다", async () => {
  const action = vi.fn();
  const buttonAction = vi.fn();
  function ClickFixture({ selectable = false, enabled = true }) {
    const instance = useDataTable({ processing: "client", data: items.slice(0, 1), getRowId, columns: [
      { accessorKey: "name", header: "Name" },
      { id: "action", header: "Action", cell: () => createElement("button", { onClick: buttonAction }, "Open") },
    ] });
    table = instance;
    return createElement(DataTable<Item>, { table: instance, label: "items", selectable, rowClickable: enabled, onRowClick: action });
  }
  await act(async () => { root.render(createElement(ClickFixture)); });
  const row = () => container.querySelector("tbody tr") as HTMLTableRowElement;
  await act(async () => { row().click(); });
  expect(action).toHaveBeenCalledTimes(1);
  await act(async () => { (row().querySelector("button") as HTMLButtonElement).click(); });
  expect(buttonAction).toHaveBeenCalledTimes(1);
  expect(action).toHaveBeenCalledTimes(1);
  await act(async () => { row().dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true })); });
  expect(action).toHaveBeenCalledTimes(2);
  await act(async () => { root.render(createElement(ClickFixture, { selectable: true })); });
  await act(async () => { row().click(); });
  expect(table.getSelectedRowModel().rows).toHaveLength(1);
  expect(action).toHaveBeenCalledTimes(2);
  await act(async () => { (row().querySelector('[role="checkbox"]') as HTMLElement).click(); });
  expect(table.getSelectedRowModel().rows).toHaveLength(0);
  await act(async () => { root.render(createElement(ClickFixture, { enabled: false })); });
  await act(async () => { row().click(); });
  expect(action).toHaveBeenCalledTimes(2);
  expect(row().hasAttribute("tabindex")).toBe(false);
});
const columns: DataTableColumn<Item>[] = [
  {
    accessorKey: "name",
    header: "Name",
    enableSorting: true,
    sortFn: "alphanumeric",
  },
  { accessorKey: "status", header: "Status", filterFn: "oneOf" },
];
const items: Item[] = Array.from({ length: 63 }, (_, index) => ({
  id: `item-${index}`,
  name: `Item ${index}`,
  status: index % 2 ? "Paused" : "Active",
}));
const getRowId = (row: Item) => row.id;
let root: Root;
let container: HTMLDivElement;
let table: DataTableInstance<Item>;

function Fixture({ options }: { options: DataTableOptions<Item> }) {
  table = useDataTable(options);
  return createElement(
    "div",
    null,
    createElement(DataTable<Item>, { table, label: "items", selectable: true }),
    createElement(DataTablePagination<Item>, { table, label: "items" }),
  );
}
async function mount(options: DataTableOptions<Item>) {
  await act(async () => {
    root.render(createElement(Fixture, { options }));
  });
}
function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}
const actEnvironment = globalThis as typeof globalThis & {
  IS_REACT_ACT_ENVIRONMENT: boolean;
};
beforeEach(() => {
  actEnvironment.IS_REACT_ACT_ENVIRONMENT = true;
  // jsdom 26 lacks PointerEvent; Base UI redispatches checkbox clicks with it.
  vi.stubGlobal("PointerEvent", MouseEvent);
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
});
afterEach(async () => {
  await act(async () => {
    root.unmount();
  });
  container.remove();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  actEnvironment.IS_REACT_ACT_ENVIRONMENT = false;
});

describe("shared table server interactions", () => {
  it("rejects incomplete server configuration instead of silently disabling data processing", () => {
    // @ts-expect-error 서버 조회 연결이 없는 구성은 타입 검사에서도 거부.
    const invalid: DataTableOptions<Item> = { data: items, columns, getRowId };
    expect(() =>
      renderToStaticMarkup(createElement(Fixture, { options: invalid })),
    ).toThrow("Server tables require loadRows");
    // @ts-expect-error 서버 테이블에는 안정된 행 ID 지정 필수.
    const missingId: DataTableOptions<Item> = {
      columns,
      loadRows: async () => ({ rows: [], rowCount: 0 }),
    };
    expect(() =>
      renderToStaticMarkup(createElement(Fixture, { options: missingId })),
    ).toThrow("stable record ID");
  });

  it("aborts superseded requests, ignores late results and aborts on unmount", async () => {
    const requests: {
      query: DataTableQuery;
      signal: AbortSignal;
      response: ReturnType<typeof deferred<DataTableResult<Item>>>;
    }[] = [];
    const loadRows = vi.fn((query: DataTableQuery, signal: AbortSignal) => {
      const response = deferred<DataTableResult<Item>>();
      requests.push({ query, signal, response });
      return response.promise;
    });
    await mount({ columns, getRowId, loadRows });
    expect(container.textContent).toContain("Loading items…");
    expect(container.textContent).not.toContain("0 items");
    await act(async () => {
      table.setGlobalFilter("first");
    });
    await act(async () => {
      table.setGlobalFilter("latest");
    });
    expect(requests).toHaveLength(3);
    expect(requests[0]!.signal.aborted).toBe(true);
    expect(requests[1]!.signal.aborted).toBe(true);
    expect(requests[2]!.query.globalFilter).toBe("latest");
    await act(async () => {
      requests[2]!.response.resolve({
        rows: [{ id: "latest", name: "Latest result", status: "Active" }],
        rowCount: 1,
      });
    });
    await act(async () => {
      requests[1]!.response.resolve({
        rows: [{ id: "stale", name: "Stale result", status: "Active" }],
        rowCount: 999,
      });
    });
    expect(container.textContent).toContain("Latest result");
    expect(container.textContent).not.toContain("Stale result");
    expect(table.getRowCount()).toBe(1);
    await act(async () => {
      root.unmount();
    });
    expect(requests[2]!.signal.aborted).toBe(true);
  });

  it("recovers from errors through the actual Retry button and rejects invalid totals", async () => {
    const loadRows = vi
      .fn()
      .mockRejectedValueOnce(new Error("Network unavailable"))
      .mockResolvedValueOnce({ rows: items.slice(0, 1), rowCount: 1 });
    await mount({ columns, getRowId, loadRows });
    expect(container.querySelector('[role="alert"]')?.textContent).toBe(
      "Network unavailable",
    );
    const retry = [...container.querySelectorAll("button")].find(
      (button) => button.textContent === "Retry",
    )!;
    await act(async () => {
      retry.click();
    });
    expect(loadRows).toHaveBeenCalledTimes(2);
    expect(container.querySelector('[role="alert"]')).toBeNull();
    expect(container.textContent).toContain("Item 0");
    loadRows.mockResolvedValueOnce({ rows: [], rowCount: -1 });
    await act(async () => {
      table.reload();
    });
    expect(table.error).toContain("Invalid table response");
  });

  it("handles synchronously thrown loader errors without crashing the mounted table", async () => {
    await mount({
      columns,
      getRowId,
      loadRows: () => {
        throw new Error("Invalid request");
      },
    });
    expect(table.error).toBe("Invalid request");
    expect(container.textContent).toContain("Retry");
  });

  it("connects externally owned loading, errors and retry to the common UI", async () => {
    const onReload = vi.fn();
    const options: DataTableOptions<Item> = {
      columns,
      getRowId,
      data: items.slice(0, 20),
      rowCount: 63,
      state: {
        globalFilter: "",
        columnFilters: [],
        sorting: [],
        pagination: { pageIndex: 0, pageSize: 20 },
      },
      onGlobalFilterChange: vi.fn(),
      onColumnFiltersChange: vi.fn(),
      onSortingChange: vi.fn(),
      onPaginationChange: vi.fn(),
      isLoading: true,
      error: null,
      onReload,
    };
    await mount(options);
    expect(container.textContent).toContain("Loading items…");
    expect(container.textContent).not.toContain("1–20 of 63");
    expect(
      container.querySelector<HTMLButtonElement>('[aria-label="Next page"]')!
        .disabled,
    ).toBe(true);
    await mount({ ...options, error: "Previous error" });
    expect(container.querySelector('[role="alert"]')).toBeNull();
    expect(
      [...container.querySelectorAll("button")].some(
        (button) => button.textContent === "Retry",
      ),
    ).toBe(false);
    await mount({
      ...options,
      isLoading: false,
      error: "External query failed",
    });
    const retry = [...container.querySelectorAll("button")].find(
      (button) => button.textContent === "Retry",
    )!;
    await act(async () => {
      retry.click();
    });
    expect(onReload).toHaveBeenCalledOnce();
    await mount({ ...options, isLoading: false });
    expect(container.textContent).toContain("1–20 of 63");
    expect(container.querySelector('[role="alert"]')).toBeNull();
  });

  it("resets query changes, clears page selection and preserves the viewed position on page-size changes", async () => {
    const loadRows = vi.fn(async (query: DataTableQuery) => ({
      rows: items.slice(
        query.pagination.pageIndex * query.pagination.pageSize,
        (query.pagination.pageIndex + 1) * query.pagination.pageSize,
      ),
      rowCount: items.length,
    }));
    await mount({ columns, getRowId, loadRows });
    const selectAll = container.querySelector<HTMLButtonElement>(
      '[aria-label="Select all items on this page"]',
    )!;
    await act(async () => {
      selectAll.click();
    });
    expect(Object.keys(table.state.rowSelection)).toHaveLength(20);
    const next = container.querySelector<HTMLButtonElement>(
      '[aria-label="Next page"]',
    )!;
    await act(async () => {
      next.click();
    });
    expect(table.state.pagination.pageIndex).toBe(1);
    expect(table.state.rowSelection).toEqual({});
    expect(container.textContent).toContain("21–40 of 63");
    await act(async () => {
      table.setPageIndex(2);
    });
    await act(async () => {
      table.setPageSize(10);
    });
    expect(table.state.pagination).toEqual({ pageIndex: 4, pageSize: 10 });
    expect(container.textContent).toContain("41–50 of 63");
    for (const change of [
      () => table.setGlobalFilter("example"),
      () => table.setColumnFilters([{ id: "status", value: ["Active"] }]),
      () => table.setSorting([{ id: "name", desc: false }]),
    ]) {
      await act(async () => {
        table.setPageIndex(2);
        table.getRowModel().rows[0]!.toggleSelected(true);
      });
      await act(async () => {
        change();
      });
      expect(table.state.pagination.pageIndex).toBe(0);
      expect(table.state.rowSelection).toEqual({});
    }
    expect(loadRows.mock.calls.at(-1)![0]).toMatchObject({
      globalFilter: "example",
      columnFilters: [{ id: "status", value: ["Active"] }],
      sorting: [{ id: "name", desc: false }],
    });
  });

  it("resets an external query scope and clamps the page after the total shrinks", async () => {
    let count = 63;
    const loadRows = vi.fn(async (query: DataTableQuery) => ({
      rows: items.slice(
        query.pagination.pageIndex * 20,
        Math.min(count, (query.pagination.pageIndex + 1) * 20),
      ),
      rowCount: count,
    }));
    const options = { columns, getRowId, loadRows, queryKey: "workspace-a" };
    await mount(options);
    await act(async () => {
      table.setPageIndex(3);
    });
    count = 1;
    await act(async () => {
      table.reload();
    });
    expect(table.state.pagination.pageIndex).toBe(0);
    expect(container.textContent).toContain("1 items");
    count = 63;
    await act(async () => {
      table.reload();
      table.setPageIndex(2);
    });
    await mount({ ...options, queryKey: "workspace-b" });
    expect(table.state.pagination.pageIndex).toBe(0);
    expect(table.state.rowSelection).toEqual({});
  });
});
