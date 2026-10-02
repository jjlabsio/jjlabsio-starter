import { sameDateRange, type DateRangeValue } from "@repo/ui/lib/date-range";

export const overviewSources = [
  { name: "Direct", short: "DIR", visibility: 20, color: "var(--chart-1)" },
  { name: "Search", short: "SEO", visibility: 16, color: "var(--chart-2)" },
  { name: "Referrals", short: "REF", visibility: 12, color: "var(--chart-3)" },
  { name: "Social", short: "SOC", visibility: 11, color: "var(--chart-3)" },
  { name: "Email", short: "EML", visibility: 8, color: "var(--chart-4)" },
  { name: "Campaigns", short: "CMP", visibility: 6, color: "var(--chart-5)" },
  { name: "Other", short: "OTH", visibility: 4, color: "var(--chart-5)" },
];

// Fixed, non-sensitive example data; date filters never invent unavailable history.
export const overviewDays = [
  {
    date: "2026-09-13",
    day: "13 Sep",
    visitors: 11_300,
    scale: 0.79,
    visibility: 7.1,
    usedAsSource: 6.5,
  },
  {
    date: "2026-09-14",
    day: "14 Sep",
    visitors: 11_080,
    scale: 0.79,
    visibility: 7.6,
    usedAsSource: 7.2,
  },
  {
    date: "2026-09-15",
    day: "15 Sep",
    visitors: 11_760,
    scale: 0.79,
    visibility: 7.2,
    usedAsSource: 7.8,
  },
  {
    date: "2026-09-16",
    day: "16 Sep",
    visitors: 10_900,
    scale: 0.79,
    visibility: 7.9,
    usedAsSource: 8.1,
  },
  {
    date: "2026-09-17",
    day: "17 Sep",
    visitors: 11_480,
    scale: 0.79,
    visibility: 7.7,
    usedAsSource: 8.8,
  },
  {
    date: "2026-09-18",
    day: "18 Sep",
    visitors: 14_200,
    scale: 1,
    visibility: 7.4,
    usedAsSource: 7,
  },
  {
    date: "2026-09-19",
    day: "19 Sep",
    visitors: 17_220,
    scale: 1,
    visibility: 8.4,
    usedAsSource: 11,
  },
];
export const overviewRanges = {
  "2d": { from: new Date(2026, 8, 18), to: new Date(2026, 8, 19) },
  "7d": { from: new Date(2026, 8, 13), to: new Date(2026, 8, 19) },
};
export const overviewPresets = [
  { label: "All time", range: overviewRanges["7d"] },
  { label: "Last 2 days", range: overviewRanges["2d"] },
  { label: "Last 7 days", range: overviewRanges["7d"] },
];
export function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
export function overviewPeriod(range: DateRangeValue) {
  if (sameDateRange(range, overviewRanges["2d"])) return "2d";
  if (sameDateRange(range, overviewRanges["7d"])) return "7d";
  return "custom";
}
export function readOverviewRange(params: URLSearchParams): DateRangeValue {
  const from = params.get("from");
  const to = params.get("to");
  if (
    from &&
    to &&
    overviewDays.some((day) => day.date === from) &&
    overviewDays.some((day) => day.date === to) &&
    from <= to
  ) {
    return {
      from: new Date(`${from}T00:00:00`),
      to: new Date(`${to}T00:00:00`),
    };
  }
  return overviewRanges[params.get("period") === "7d" ? "7d" : "2d"];
}
export function selectedOverviewDays(range: DateRangeValue) {
  return overviewDays.filter(
    (day) => day.date >= dateKey(range.from) && day.date <= dateKey(range.to),
  );
}
