"use client";

import * as React from "react";
import {
  IconChartBar,
  IconChartLine,
  IconDots,
  IconDownload,
  IconLink,
  IconMail,
  IconSearch,
  IconSpeakerphone,
  IconUsers,
  IconWorld,
} from "@tabler/icons-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@repo/ui/components/button";
import { ButtonGroup } from "@repo/ui/components/button-group";
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
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui/components/tooltip";
import { downloadCsv } from "@/domains/sidebar/lib/download-csv";
import {
  selectedOverviewDays,
  overviewSources,
} from "@/domains/sidebar/lib/overview-data";
import type { DateRangeValue } from "@repo/ui/lib/date-range";
const sourceIcons = [
  IconWorld,
  IconSearch,
  IconLink,
  IconUsers,
  IconMail,
  IconSpeakerphone,
  IconDots,
];
export const sources = overviewSources.map((source, index) => ({
  ...source,
  icon: sourceIcons[index]!,
}));

const chartConfig = {
  visibility: { label: "Visibility", color: "var(--chart-1)" },
} satisfies ChartConfig;

const lineConfig = Object.fromEntries(
  sources.map((source) => [
    source.name,
    { label: source.name, color: source.color },
  ]),
) satisfies ChartConfig;

export function ChartAreaInteractive({
  dateRange,
  selectedSources,
}: {
  dateRange: DateRangeValue;
  selectedSources: readonly string[];
}) {
  const [view, setView] = React.useState<"bar" | "line">("bar");
  const days = selectedOverviewDays(dateRange);
  const scale = days.reduce((sum, day) => sum + day.scale, 0) / days.length;
  const chartData = sources
    .filter((source) => selectedSources.includes(source.name))
    .map((source) => ({
      ...source,
      visibility: Math.round(source.visibility * scale),
    }));
  const dates = days.map((day) => day.day);
  const lineData = dates.map((day, index) => {
    const row: Record<string, string | number> = { day };
    chartData.forEach((source, sourceIndex) => {
      const offset =
        (index - dates.length + 1) * 0.42 + ((index + sourceIndex) % 3) * 0.24;
      row[source.name] = Math.max(
        0,
        Number((source.visibility + offset).toFixed(1)),
      );
    });
    return row;
  });

  return (
    <Card variant="panel" id="analytics" className="min-w-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-1">
          Visibility
          <Tooltip>
            <TooltipTrigger variant="info" aria-label="About visibility" />
            <TooltipContent>
              Visibility by traffic source in this example dataset.
            </TooltipContent>
          </Tooltip>
        </CardTitle>
        <CardAction>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-xs"
                  aria-label="Visibility chart actions"
                />
              }
            >
              <IconDots aria-hidden="true" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                disabled={chartData.length === 0}
                onClick={() =>
                  downloadCsv(
                    "visibility.csv",
                    chartData.map(({ name, visibility }) => ({
                      source: name,
                      visibility,
                    })),
                  )
                }
              >
                <IconDownload aria-hidden="true" /> Download CSV
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardAction>
      </CardHeader>
      <CardContent padding="chart">
        {chartData.length === 0 ? (
          <div className="flex min-h-(--chart-panel-min-height) flex-1 items-center justify-center type-ui-body text-muted-foreground">
            No sources match these filters.
          </div>
        ) : (
          <ChartContainer
            config={view === "bar" ? chartConfig : lineConfig}
            variant="panel"
          >
            {view === "bar" ? (
              <BarChart
                data={chartData}
                margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
                barCategoryGap="38%"
              >
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="short"
                  tickLine={false}
                  axisLine={false}
                  height={32}
                  tick={({ x, y, payload }) => {
                    const source = sources.find(
                      (item) => item.short === payload?.value,
                    );
                    if (!source) return <g />;
                    const SourceIcon = source.icon;
                    return (
                      <g
                        transform={`translate(${Number(x) - 9}, ${Number(y) + 5})`}
                      >
                        <SourceIcon
                          size={18}
                          stroke={1.8}
                          color={source.color}
                          aria-label={source.name}
                        />
                      </g>
                    );
                  }}
                />
                <YAxis
                  width={44}
                  domain={[0, 20]}
                  ticks={[0, 5, 10, 15, 20]}
                  tickFormatter={(value: number) => `${value}%`}
                  tickLine={false}
                  axisLine={false}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      labelFormatter={(_label, payload) =>
                        payload[0]?.payload?.name
                      }
                      valueFormatter={(value) => `${value}%`}
                    />
                  }
                />
                <Bar
                  dataKey="visibility"
                  barSize={40}
                  radius={[7, 7, 0, 0]}
                  isAnimationActive={false}
                >
                  {chartData.map((source) => (
                    <Cell key={source.name} fill={source.color} />
                  ))}
                </Bar>
              </BarChart>
            ) : (
              <LineChart
                data={lineData}
                margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
              >
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={12}
                />
                <YAxis
                  width={44}
                  domain={[0, 25]}
                  ticks={[0, 5, 10, 15, 20, 25]}
                  tickFormatter={(value: number) => `${value}%`}
                  tickLine={false}
                  axisLine={false}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      labelFormatter={(_label, payload) =>
                        payload[0]?.payload?.day
                      }
                      valueFormatter={(value) => `${value}%`}
                    />
                  }
                />
                {chartData.map((source) => (
                  <Line
                    key={source.name}
                    dataKey={source.name}
                    type="monotone"
                    stroke={`var(--color-${source.name})`}
                    isAnimationActive={false}
                    dot={false}
                    activeDot={{ r: 3 }}
                  />
                ))}
              </LineChart>
            )}
          </ChartContainer>
        )}
      </CardContent>
      <div className="ui-chart-panel-footer">
        <span>Showing data for {days.length} days</span>
        <ButtonGroup variant="segmented" aria-label="Chart view">
          <Button
            variant="segment"
            size="icon-sm"
            aria-label="Show line chart"
            aria-pressed={view === "line"}
            onClick={() => setView("line")}
          >
            <IconChartLine aria-hidden="true" />
          </Button>
          <Button
            variant="segment"
            size="icon-sm"
            aria-label="Show bar chart"
            aria-pressed={view === "bar"}
            onClick={() => setView("bar")}
          >
            <IconChartBar aria-hidden="true" />
          </Button>
        </ButtonGroup>
      </div>
    </Card>
  );
}
