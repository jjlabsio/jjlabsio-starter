import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  DataTable,
  DataTableToolbar,
  DataTableFilter,
  DataTablePagination,
  DataTableText,
  useDataTable,
  type DataTableColumn,
} from "@repo/ui/components/data-table";

type Item = {
  id: string;
  name: string;
  count: number;
  status: string;
  created: Date;
};
const data: Item[] = [
  {
    id: "a",
    name: "Northstar",
    count: 1002,
    status: "Active",
    created: new Date("2026-09-20"),
  },
  {
    id: "b",
    name: "Acme",
    count: 42,
    status: "Paused",
    created: new Date("2026-09-02"),
  },
  {
    id: "c",
    name: "Orbit",
    count: 7,
    status: "Active",
    created: new Date("2026-09-09"),
  },
];
const columns: DataTableColumn<Item>[] = [
  {
    accessorKey: "name",
    header: "Name",
    enableSorting: true,
    sortFn: "alphanumeric",
    meta: { layout: "content" },
  },
  {
    accessorKey: "count",
    header: "Count",
    enableSorting: true,
    sortFn: "basic",
    enableGlobalFilter: false,
    meta: { numeric: true },
  },
  {
    accessorKey: "status",
    header: "Status",
    filterFn: "oneOf",
    sortFn: "alphanumeric",
    meta: { layout: "compact" },
  },
  {
    accessorKey: "created",
    header: "Created",
    enableSorting: true,
    meta: { layout: "date", align: "right" },
    sortFn: "datetime",
    enableGlobalFilter: false,
    cell: ({ row }) => row.original.created.toISOString(),
  },
];
type InitialState = Parameters<typeof useDataTable<Item>>[0]["initialState"];
function Fixture({ initialState }: { initialState?: InitialState }) {
  const table = useDataTable({
    processing: "client",
    data,
    columns,
    getRowId: (row) => row.id,
    initialState,
  });
  return createElement(
    "div",
    null,
    createElement(DataTableToolbar<Item>, {
      table,
      searchLabel: "Search items",
    }),
    createElement(DataTable<Item>, {
      table,
      label: "items",
      selectable: true,
      rowLabel: (row) => row.name,
    }),
  );
}
const render = (initialState?: InitialState) =>
  renderToStaticMarkup(createElement(Fixture, { initialState }));
const body = (html: string) =>
  html.match(/<tbody[^>]*>([\s\S]*?)<\/tbody>/)![1]!;

describe("shared data table", () => {
  it("uses the same caption style and marks whole-cell sorting in every header", () => {
    const html = render();
    const headers = html.match(/<thead[^>]*>([\s\S]*?)<\/thead>/)![1]!;
    const cells = headers.match(/<th\b[\s\S]*?<\/th>/g)!;
    expect(cells).toHaveLength(columns.length + 1);
    for (const cell of cells) expect(cell).toContain("type-ui-caption");
    for (const cell of [cells[1]!, cells[2]!, cells[4]!]) {
      expect(cell).toContain('data-sortable="true"');
      expect(cell).toMatch(/ui-table-sort[^"]*type-ui-caption/);
      expect(cell).not.toContain("type-ui-body-medium");
    }
    expect(cells[2]).toContain('data-align="right"');
    expect(cells[3]).toContain('data-sortable="false"');
    expect(cells[3]).not.toContain("<button");
    expect(cells[3]).not.toContain("aria-sort");
  });
  it("uses column layout tokens and shares the numeric heading and value alignment", () => {
    const html = render();
    expect(html).toContain("ui-data-table");
    expect(html).toContain("<colgroup>");
    expect(html).toContain("width:var(--table-column-compact)");
    expect(html).toContain("width:var(--table-column-numeric)");
    expect(html).toContain("width:var(--table-column-date)");
    expect(html).toContain("var(--table-column-content)");
    expect(html).toContain("ui-table-header-label");
    expect(body(html)).toMatch(
      /<td[^>]*data-align="right"[^>]*data-sortable="true"/,
    );
  });
  it("preserves the largest content minimum when multiple flexible columns share space", () => {
    function WidthFixture() {
      const table = useDataTable({
        processing: "client",
        data,
        columns: [
          { accessorKey: "name", header: "Name", meta: { width: 400 } },
          { accessorKey: "status", header: "Status", meta: { width: 100 } },
          { accessorKey: "count", header: "Count", meta: { numeric: true } },
        ],
      });
      return createElement(DataTable<Item>, { table, label: "items" });
    }
    const html = renderToStaticMarkup(createElement(WidthFixture));
    expect(html).toContain(
      "calc(max(400px, 100px) + max(400px, 100px) + var(--table-column-numeric))",
    );
  });
  it("keeps an editable name constrained while exposing its full label", () => {
    const name = "International Business Software Solutions";
    const html = renderToStaticMarkup(
      createElement(DataTableText, {
        primary: name,
        onClick: () => {},
        trailing: "You",
      }),
    );
    expect(html).toContain("ui-table-text-action");
    expect(html).toContain(`title="${name}"`);
    expect(html).toContain(`<span class="truncate">${name}</span>`);
    expect(html).toContain("You");
  });
  it("sorts raw numbers rather than formatted strings and exposes direction", () => {
    const html = render({ sorting: [{ id: "count", desc: false }] });
    const rows = body(html);
    expect(rows.indexOf("Orbit")).toBeLessThan(rows.indexOf("Acme"));
    expect(rows.indexOf("Acme")).toBeLessThan(rows.indexOf("Northstar"));
    expect(html).toContain('aria-sort="ascending"');
  });
  it("uses outlined paired chevrons and marks the active sorting direction", () => {
    for (const direction of [undefined, "asc", "desc"] as const) {
      const html = render({
        sorting: direction ? [{ id: "count", desc: direction === "desc" }] : [],
      });
      const header = html
        .match(/<th\b[\s\S]*?<\/th>/g)!
        .find((cell) => cell.includes("Sort by Count"))!;
      const icons = header.match(
        /<svg[^>]*data-slot="chevron-icon"[\s\S]*?<\/svg>/g,
      )!;
      expect(icons).toHaveLength(2);
      expect(header).not.toContain('data-slot="caret-icon"');
      for (const icon of icons) {
        expect(icon).toContain('fill="none"');
        expect(icon).toContain('viewBox="0 6 24 12"');
        expect(icon).toContain('stroke-width="1.5"');
      }
      expect(icons[0]).toContain(`data-active="${direction === "asc"}"`);
      expect(icons[1]).toContain(`data-active="${direction === "desc"}"`);
    }
  });
  it("restricts hover emphasis to unsorted headers so the active direction stays visible", () => {
    const css = readFileSync(
      new URL(
        "../../../../../../packages/ui/src/styles/globals.css",
        import.meta.url,
      ),
      "utf8",
    );
    expect(css).toContain(
      '[data-slot="table-head"][aria-sort="none"] .ui-table-sort:is(:hover, :focus-visible) .ui-table-sort-direction',
    );
    expect(css).not.toMatch(/^\.ui-table-sort:is\(:hover, :focus-visible\) /m);
  });
  it("sorts raw dates", () => {
    const rows = body(render({ sorting: [{ id: "created", desc: false }] }));
    expect(rows.indexOf("Acme")).toBeLessThan(rows.indexOf("Orbit"));
    expect(rows.indexOf("Orbit")).toBeLessThan(rows.indexOf("Northstar"));
  });
  it("combines search and column filters", () => {
    const html = render({
      globalFilter: "orbit",
      columnFilters: [{ id: "status", value: ["Active"] }],
    });
    expect(body(html)).toContain("Orbit");
    expect(body(html)).not.toContain("Acme");
    expect(body(html)).not.toContain("Northstar");
    expect(html).toContain("Reset filters");
  });
  it("uses OR within a multiple-value filter", () => {
    const rows = body(
      render({
        columnFilters: [{ id: "status", value: ["Active", "Paused"] }],
      }),
    );
    for (const item of data) expect(rows).toContain(item.name);
  });
  it("renders indeterminate selection with a visible indicator", () => {
    const html = render({ rowSelection: { a: true } });
    expect(html).toContain('aria-checked="mixed"');
    expect(html).toContain('data-state="selected"');
    expect(html).toContain('data-slot="checkbox-indicator"');
  });
  it("shows a check rather than a mixed state when all displayed rows are selected", () => {
    const html = render({ rowSelection: { a: true, b: true, c: true } });
    expect(html).not.toContain('aria-checked="mixed"');
    expect(html).toMatch(
      /aria-label="Select all items on this page"[^>]*aria-checked="true"|aria-checked="true"[^>]*aria-label="Select all items on this page"/,
    );
  });
  it("does not mark unselected filtered rows mixed because hidden rows are selected", () => {
    const html = render({ rowSelection: { a: true }, globalFilter: "Acme" });
    expect(html).not.toContain('aria-checked="mixed"');
    expect(html).toMatch(
      /aria-label="Select all items on this page"[^>]*aria-checked="false"|aria-checked="false"[^>]*aria-label="Select all items on this page"/,
    );
  });
  it("marks the filtered result checked when every visible row is selected", () => {
    const html = render({
      rowSelection: { a: true },
      globalFilter: "Northstar",
    });
    expect(html).not.toContain('aria-checked="mixed"');
    expect(html).toMatch(
      /aria-label="Select all items on this page"[^>]*aria-checked="true"|aria-checked="true"[^>]*aria-label="Select all items on this page"/,
    );
  });
  it("puts the empty state inside the table and disables select all", () => {
    const html = render({ globalFilter: "no-such-record" });
    expect(body(html)).toContain("No results match these filters.");
    expect(html).toMatch(
      /aria-label="Select all items on this page"[^>]*disabled|disabled[^>]*aria-label="Select all items on this page"/,
    );
  });
});

function ServerFixture({
  initialState,
  rowCount = data.length,
}: {
  initialState?: InitialState;
  rowCount?: number;
}) {
  const table = useDataTable({
    data: rowCount ? data : [],
    columns,
    rowCount,
    getRowId: (row) => row.id,
    state: {
      globalFilter: "",
      columnFilters: [],
      sorting: [],
      pagination: { pageIndex: 0, pageSize: 20 },
      ...initialState,
    },
    onGlobalFilterChange: () => {},
    onColumnFiltersChange: () => {},
    onSortingChange: () => {},
    onPaginationChange: () => {},
    isLoading: false,
    error: null,
    onReload: () => {},
  });
  return createElement(
    "div",
    null,
    createElement(DataTableFilter<Item>, {
      table,
      columnId: "status",
      label: "Status",
      options: [
        { value: "Active", label: "Active" },
        { value: "Paused", label: "Paused" },
      ],
    }),
    createElement(DataTable<Item>, { table, label: "items", selectable: true }),
    createElement(DataTablePagination<Item>, { table, label: "items" }),
  );
}
const renderServer = (initialState?: InitialState, rowCount?: number) =>
  renderToStaticMarkup(
    createElement(ServerFixture, { initialState, rowCount }),
  );

describe("server table defaults", () => {
  it("shows loading rather than a false zero count before the server response", () => {
    function LoadingFixture() {
      const table = useDataTable({
        columns,
        getRowId: (row: Item) => row.id,
        loadRows: async () => ({ rows: data, rowCount: data.length }),
      });
      return createElement(
        "div",
        null,
        createElement(DataTable<Item>, {
          table,
          label: "items",
          selectable: true,
        }),
        createElement(DataTablePagination<Item>, { table, label: "items" }),
      );
    }
    const html = renderToStaticMarkup(createElement(LoadingFixture));
    expect(html).toContain("Loading items…");
    expect(html).not.toContain(">0 items<");
    expect(html).toContain('aria-busy="true"');
  });
  it("does not filter or sort already processed server rows", () => {
    const rows = body(
      renderServer({
        globalFilter: "absent",
        sorting: [{ id: "count", desc: false }],
      }),
    );
    expect(rows).toContain("Northstar");
    expect(rows).toContain("Acme");
    expect(rows.indexOf("Northstar")).toBeLessThan(rows.indexOf("Acme"));
  });
  it("keeps the filter name and shows a neutral count for every applied filter", () => {
    const empty = renderServer();
    const single = renderServer({
      columnFilters: [{ id: "status", value: ["Active"] }],
    });
    const multiple = renderServer({
      columnFilters: [{ id: "status", value: ["Active", "Paused"] }],
    });
    expect(empty).toContain('aria-label="Status"');
    expect(empty).toContain('data-filter-active="false"');
    expect(empty).not.toContain('data-variant="count"');
    for (const [html, count] of [
      [single, 1],
      [multiple, 2],
    ] as const) {
      expect(html).toContain('data-filter-active="true"');
      expect(html).toMatch(/>Status<\/span><span[^>]*data-variant="count"/);
      expect(html).toMatch(
        new RegExp(`data-variant="count"[^>]*>${count}</span>`),
      );
      expect(html).toContain("bg-accent");
      expect(html).toContain("data-[filter-active=true]:bg-muted");
    }
    expect(single).toContain('aria-label="Status: 1 selected (Active)"');
    expect(multiple).toContain(
      'aria-label="Status: 2 selected (Active, Paused)"',
    );
  });
  it("keeps the count but hides navigation for a single page or empty result", () => {
    expect(renderServer()).toContain("3 items");
    expect(renderServer()).not.toContain('aria-label="Next page"');
    expect(renderServer(undefined, 0)).not.toContain('aria-label="Next page"');
  });
  it("uses total server count and default page size of 20", () => {
    const html = renderServer(undefined, 63);
    expect(html).toContain("1–20 of 63");
    expect(html).toContain('aria-label="Page 4"');
    expect(html).toContain('aria-current="page"');
    expect(
      renderServer({ pagination: { pageIndex: 3, pageSize: 20 } }, 63),
    ).toContain("61–63 of 63");
  });
  it("does not slice an already paginated server response again", () => {
    expect(
      body(renderServer({ pagination: { pageIndex: 1, pageSize: 20 } }, 63)),
    ).toContain("Northstar");
  });
});
