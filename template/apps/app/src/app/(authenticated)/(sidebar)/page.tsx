"use client";

import * as React from "react";
import {
  IconCalendar,
  IconDots,
  IconDownload,
  IconWorld,
} from "@tabler/icons-react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import {
  ChartAreaInteractive,
  sources,
} from "@/domains/sidebar/components/chart-area-interactive";
import { PageContainer } from "@/domains/sidebar/components/page-container";
import { SectionCards } from "@/domains/sidebar/components/section-cards";
import { Badge } from "@repo/ui/components/badge";
import { Avatar, AvatarFallback } from "@repo/ui/components/avatar";
import { Button } from "@repo/ui/components/button";
import { ButtonGroup } from "@repo/ui/components/button-group";
import { DateRangePicker } from "@repo/ui/components/date-range-picker";
import {
  FilterSelect,
  FilterSelectList,
  FilterMenu,
} from "@repo/ui/components/filter-select";
import { dateRangeDays, type DateRangeValue } from "@repo/ui/lib/date-range";
import {
  dateKey,
  overviewPeriod,
  overviewPresets,
  overviewRanges,
  readOverviewRange,
  selectedOverviewDays,
} from "@/domains/sidebar/lib/overview-data";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@repo/ui/components/chart";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import {
  DataTable,
  DataTableText,
  DataTablePagination,
  useDataTable,
  type DataTableColumn,
} from "@repo/ui/components/data-table";
import { tableQueryParams } from "@/domains/sidebar/lib/load-example-records";
import type { DataTableQuery } from "@repo/ui/components/data-table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui/components/tooltip";
import { downloadCsv } from "@/domains/sidebar/lib/download-csv";

const impactConfig = {
  visibility: { label: "Workspace visibility", color: "var(--chart-4)" },
  usedAsSource: { label: "Used as source", color: "var(--chart-4)" },
} satisfies ChartConfig;

const totalSourceVisibility = sources.reduce(
  (total, source) => total + source.visibility,
  0,
);

const topPages = [
  { name: "Home", path: "/", visits: "12,420" },
  { name: "Features", path: "/features", visits: "8,641" },
  { name: "Pricing", path: "/pricing", visits: "5,804" },
  { name: "About", path: "/about", visits: "3,218" },
  { name: "Contact", path: "/contact", visits: "1,337" },
];

type SourceRow = (typeof sources)[number] & { visitors: number };
const sourceColumns: DataTableColumn<SourceRow>[] = [
  {
    id: "rank",
    header: "#",
    enableSorting: false,
    meta: { layout: "compact", width: 40, text: "secondary" },
    cell: ({ row }) => row.index + 1,
  },
  {
    accessorKey: "name",
    header: "Source",
    enableSorting: false,
    meta: { layout: "content", width: 180 },
    cell: ({ row }) => (
      <DataTableText
        primary={row.original.name}
        icon={
          <row.original.icon color={row.original.color} aria-hidden="true" />
        }
      />
    ),
  },
  {
    accessorKey: "visibility",
    header: "Visibility",
    enableSorting: true,
    sortFn: "basic",
    meta: { numeric: true },
    cell: ({ row }) => `${row.original.visibility}%`,
  },
  {
    accessorKey: "visitors",
    header: "Visitors",
    enableSorting: true,
    sortFn: "basic",
    meta: { numeric: true },
    cell: ({ row }) => row.original.visitors.toLocaleString("en-US"),
  },
];

export default function MainPage() {
  const [dateRange, setDateRange] = React.useState<DateRangeValue>(
    overviewRanges["2d"],
  );
  const period = overviewPeriod(dateRange);
  const days = selectedOverviewDays(dateRange);
  const sourceImpact = days.map(({ day, visibility, usedAsSource }) => ({
    day,
    visibility,
    usedAsSource,
  }));
  const visibilityScale =
    days.reduce((sum, day) => sum + day.scale, 0) / days.length;
  const periodVisitors = days.reduce((sum, day) => sum + day.visitors, 0);
  const [selectedSources, setSelectedSources] = React.useState<string[]>(
    sources.map((source) => source.name),
  );
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setDateRange(readOverviewRange(params));
    const savedSources = params.get("sources");
    if (savedSources !== null) {
      const names = savedSources
        .split(",")
        .filter((name) => sources.some((source) => source.name === name));
      setSelectedSources(names);
    }
  }, []);
  const updateFilters = (nextSources: string[], nextRange: DateRangeValue) => {
    setSelectedSources(nextSources);
    setDateRange(nextRange);
    const url = new URL(window.location.href);
    const nextPeriod = overviewPeriod(nextRange);
    url.searchParams.delete("from");
    url.searchParams.delete("to");
    if (nextPeriod === "2d") url.searchParams.delete("period");
    else if (nextPeriod === "7d") url.searchParams.set("period", nextPeriod);
    else {
      url.searchParams.delete("period");
      url.searchParams.set("from", dateKey(nextRange.from));
      url.searchParams.set("to", dateKey(nextRange.to));
    }
    if (nextSources.length === sources.length)
      url.searchParams.delete("sources");
    else url.searchParams.set("sources", nextSources.join(","));
    window.history.replaceState(window.history.state, "", url);
  };
  const allSources = selectedSources.length === sources.length;
  const visibleSources = sources.filter((source) =>
    selectedSources.includes(source.name),
  );
  const resetFilters = () => {
    updateFilters(
      sources.map((source) => source.name),
      overviewRanges["2d"],
    );
  };
  const sourceVisibilityForPeriod = (sourceVisibility: number) =>
    Math.round(sourceVisibility * visibilityScale);
  const visibility = visibleSources.length
    ? Math.round(
        visibleSources.reduce(
          (total, source) =>
            total + sourceVisibilityForPeriod(source.visibility),
          0,
        ) / visibleSources.length,
      )
    : 0;
  const visitorsForSource = (sourceVisibility: number) =>
    Math.round((periodVisitors * sourceVisibility) / totalSourceVisibility);
  const visibleVisitors = visibleSources.reduce(
    (total, source) => total + visitorsForSource(source.visibility),
    0,
  );
  const loadSources = React.useCallback(
    async (query: DataTableQuery, signal: AbortSignal) => {
      const params = tableQueryParams(query);
      params.set("from", dateKey(dateRange.from));
      params.set("to", dateKey(dateRange.to));
      if (selectedSources.length)
        selectedSources.forEach((name) => params.append("source", name));
      else params.set("source", "");
      const response = await fetch(`/api/examples/sources?${params}`, {
        signal,
        cache: "no-store",
      });
      if (!response.ok) throw new Error("Could not load sources. Try again.");
      const result: {
        rows: { name: string; visibility: number; visitors: number }[];
        rowCount: number;
      } = await response.json();
      return {
        ...result,
        rows: result.rows.map((row) => ({
          ...sources.find((source) => source.name === row.name)!,
          ...row,
        })),
      };
    },
    [dateRange, selectedSources],
  );
  const sourceTable = useDataTable({
    loadRows: loadSources,
    queryKey: JSON.stringify([
      dateKey(dateRange.from),
      dateKey(dateRange.to),
      selectedSources,
    ]),
    columns: sourceColumns,
    getRowId: (row) => row.name,
  });
  const metrics = [
    {
      label: "Visibility",
      value: `${visibility}%`,
      change: "+7.7%",
      description:
        "Share of example traffic attributed to the selected sources.",
    },
    {
      label: "Visitors",
      value: visibleVisitors.toLocaleString(),
      change: "+12.4%",
      description: "Example visitors from the selected sources in this period.",
    },
    {
      label: "Engagement",
      value: "57",
      change: "+7.2",
      description: "Example engagement score.",
    },
    {
      label: "Position",
      value: "#2.2",
      change: "+2.2",
      changeTone: "negative" as const,
      description: "Average ranking position; a higher number is worse.",
    },
    {
      label: "Conversion",
      value: "8%",
      description: "Example conversion rate.",
    },
  ];

  return (
    <PageContainer
      title="Overview"
      spacing="dashboard"
      summaryTargetId="overview-metrics"
      stickySummary={
        <div className="ui-sticky-summary">
          <div className="ui-sticky-summary-identity">
            <Avatar size="xs" aria-hidden="true">
              <AvatarFallback>W</AvatarFallback>
            </Avatar>
            <span>Workspace</span>
          </div>
          <SectionCards metrics={metrics} variant="summary" />
        </div>
      }
      toolbar={
        <div
          className="flex flex-wrap items-center gap-2"
          aria-label="Overview filters"
        >
          <FilterSelect
            mode="multiple"
            label="Sources"
            allLabel="All sources"
            emptyLabel="No sources"
            icon={<IconWorld aria-hidden="true" />}
            value={selectedSources}
            defaultValue={sources.map((source) => source.name)}
            options={sources.map((source) => ({
              value: source.name,
              label: source.name,
              group: "Traffic sources",
            }))}
            onValueChange={(next) => updateFilters(next, dateRange)}
            searchable
            reset={false}
          />
          <DateRangePicker
            value={dateRange}
            onValueChange={(range) => updateFilters(selectedSources, range)}
            presets={overviewPresets}
            minDate={overviewRanges["7d"].from}
            maxDate={overviewRanges["7d"].to}
            label={`${dateRangeDays(dateRange)} days`}
          />
          <FilterMenu
            activeCount={Number(!allSources) + Number(period !== "2d")}
            onReset={resetFilters}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel>Filter by</DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <IconWorld aria-hidden="true" />
                Source
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent variant="filter">
                <FilterSelectList
                  mode="multiple"
                  label="Sources"
                  allLabel="All sources"
                  value={selectedSources}
                  defaultValue={sources.map((source) => source.name)}
                  options={sources.map((source) => ({
                    value: source.name,
                    label: source.name,
                    group: "Traffic sources",
                  }))}
                  onValueChange={(next) => updateFilters(next, dateRange)}
                  searchable
                />
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <IconCalendar aria-hidden="true" />
                Period
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent variant="filter">
                <FilterSelectList
                  label="Period"
                  value={period}
                  defaultValue="2d"
                  options={[
                    { value: "2d", label: "2 days" },
                    { value: "7d", label: "7 days" },
                  ]}
                  onValueChange={(value) => {
                    if (value === "2d" || value === "7d")
                      updateFilters(selectedSources, overviewRanges[value]);
                  }}
                />
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </FilterMenu>
          <Badge variant="outline" className="ml-auto">
            Example data
          </Badge>
        </div>
      }
    >
      <div id="overview-metrics">
        <SectionCards metrics={metrics} />
      </div>

      <section
        id="overview-analysis"
        className="ui-section-stack"
        aria-labelledby="performance-heading"
      >
        <h2 id="performance-heading" className="sr-only">
          Performance
        </h2>
        <div className="ui-panel-pair">
          <ChartAreaInteractive
            dateRange={dateRange}
            selectedSources={selectedSources}
          />
          <Card variant="panel" className="min-w-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-1">
                Top sources
                <Tooltip>
                  <TooltipTrigger
                    variant="info"
                    aria-label="About top sources"
                  />
                  <TooltipContent>
                    Example traffic sources ranked by visibility.
                  </TooltipContent>
                </Tooltip>
              </CardTitle>
              <CardAction>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  aria-label="Download top sources CSV"
                  disabled={visibleSources.length === 0}
                  onClick={() =>
                    downloadCsv(
                      "top-sources.csv",
                      visibleSources.map((source) => ({
                        source: source.name,
                        visibility: sourceVisibilityForPeriod(
                          source.visibility,
                        ),
                        visitors: visitorsForSource(source.visibility),
                      })),
                    )
                  }
                >
                  <IconDownload aria-hidden="true" />
                </Button>
              </CardAction>
            </CardHeader>
            <CardContent className="p-0">
              <DataTable
                table={sourceTable}
                label="Top sources"
                emptyMessage="No sources match these filters."
              />
              <DataTablePagination table={sourceTable} label="sources" />
            </CardContent>
          </Card>
        </div>
        <Card variant="panel" id="source-impact">
          <CardHeader>
            <CardTitle className="flex items-center gap-1">
              Source impact
              <Tooltip>
                <TooltipTrigger
                  variant="info"
                  aria-label="About source impact"
                />
                <TooltipContent>
                  Example visibility and source usage over time.
                </TooltipContent>
              </Tooltip>
            </CardTitle>
            <CardAction className="flex items-center gap-2">
              <Badge variant="outline">Visibility</Badge>
              <ButtonGroup variant="segmented" aria-label="Impact period">
                <Button
                  variant="segment"
                  size="xs"
                  aria-pressed={period === "2d"}
                  onClick={() =>
                    updateFilters(selectedSources, overviewRanges["2d"])
                  }
                >
                  D
                </Button>
                <Button
                  variant="segment"
                  size="xs"
                  aria-pressed={period === "7d"}
                  onClick={() =>
                    updateFilters(selectedSources, overviewRanges["7d"])
                  }
                >
                  W
                </Button>
              </ButtonGroup>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      aria-label="Source impact actions"
                    />
                  }
                >
                  <IconDots aria-hidden="true" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() =>
                      downloadCsv("source-impact.csv", sourceImpact)
                    }
                  >
                    <IconDownload aria-hidden="true" /> Download CSV
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardAction>
          </CardHeader>
          <CardContent padding="chart">
            <p className="pr-8 text-right type-ui-caption text-muted-foreground">
              Used as source
            </p>
            <ChartContainer
              config={impactConfig}
              variant="panel"
            >
              <LineChart
                data={sourceImpact}
                margin={{ top: 0, right: 8, left: 0, bottom: 0 }}
              >
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="day" tickLine={false} axisLine={false} />
                <YAxis
                  yAxisId="visibility"
                  tickLine={false}
                  axisLine={false}
                  width={44}
                  domain={[7, 10]}
                  ticks={[7, 8, 9, 10]}
                  tickFormatter={(value: number) => `${value}%`}
                />
                <YAxis
                  yAxisId="source"
                  orientation="right"
                  tickLine={false}
                  axisLine={false}
                  width={38}
                  domain={[6, 12]}
                  ticks={[6, 8, 10, 12]}
                  tickFormatter={(value: number) => `${value}%`}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      labelFormatter={(_label, payload) =>
                        payload[0]?.payload?.day
                      }
                      valueFormatter={(value) => `${value}%`}
                      indicatorForItem={(name) =>
                        name === "usedAsSource" ? "dashed" : "line"
                      }
                    />
                  }
                />
                <Line
                  yAxisId="visibility"
                  dataKey="visibility"
                  type="monotone"
                  stroke="var(--color-visibility)"
                  isAnimationActive={false}
                  dot={false}
                  activeDot={{ r: 3 }}
                />
                <Line
                  yAxisId="source"
                  dataKey="usedAsSource"
                  type="monotone"
                  stroke="var(--color-usedAsSource)"
                  strokeDasharray="4 4"
                  isAnimationActive={false}
                  dot={false}
                  activeDot={{ r: 3 }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
          <div className="ui-chart-panel-footer">
            <span className="flex items-center gap-1.5">
              <Avatar size="xs" aria-hidden="true">
                <AvatarFallback>W</AvatarFallback>
              </Avatar>
              Workspace
            </span>
            <span>2/2 metrics</span>
          </div>
        </Card>

        <Card variant="panel" id="top-pages">
          <CardHeader>
            <CardTitle>Top pages</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ul>
              {topPages.map((page) => (
                <li
                  key={page.path}
                  className="ui-list-row"
                  data-layout="details"
                >
                  <IconWorld
                    className="size-4 shrink-0 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="ui-list-primary">{page.name}</p>
                    <p className="ui-list-secondary">{page.path}</p>
                  </div>
                  <span data-slot="row-meta" className="tabular-nums">
                    {page.visits}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>
    </PageContainer>
  );
}
