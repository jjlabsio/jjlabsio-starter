import {
  differenceInCalendarDays,
  format,
  isSameDay,
  subDays,
  subMonths,
  subYears,
} from "date-fns";

export type DateRangeValue = { from: Date; to: Date };
export type DateRangeComparison =
  | "previous-period"
  | "last-month"
  | "last-year";

export function sameDateRange(a: DateRangeValue, b: DateRangeValue) {
  return isSameDay(a.from, b.from) && isSameDay(a.to, b.to);
}

export function dateRangeDays(range: DateRangeValue) {
  return differenceInCalendarDays(range.to, range.from) + 1;
}

export function comparisonDateRange(
  range: DateRangeValue,
  comparison: DateRangeComparison,
): DateRangeValue {
  if (comparison === "previous-period") {
    const days = dateRangeDays(range);
    return { from: subDays(range.from, days), to: subDays(range.from, 1) };
  }
  const shift = comparison === "last-month" ? subMonths : subYears;
  return { from: shift(range.from, 1), to: shift(range.to, 1) };
}

export function formatDateRange(range: DateRangeValue) {
  return `${format(range.from, "yyyy.MM.dd")} – ${format(range.to, "yyyy.MM.dd")}`;
}
