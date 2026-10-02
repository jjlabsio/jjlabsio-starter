"use client";

import * as React from "react";
import { IconCalendar, IconCheck } from "@tabler/icons-react";
import type { DateRange } from "react-day-picker";
import { Button } from "@repo/ui/components/button";
import { ButtonGroup } from "@repo/ui/components/button-group";
import { Calendar } from "@repo/ui/components/calendar";
import { CaretIcon } from "@repo/ui/components/caret-icon";
import { menuRowClassName } from "@repo/ui/lib/menu-styles";
import { cn } from "@repo/ui/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@repo/ui/components/popover";
import {
  comparisonDateRange,
  dateRangeDays,
  formatDateRange,
  sameDateRange,
  type DateRangeComparison,
  type DateRangeValue,
} from "@repo/ui/lib/date-range";

const comparisons = [
  { value: "previous-period", label: "vs Prev. period" },
  { value: "last-month", label: "vs Last month" },
  { value: "last-year", label: "vs Last year" },
] as const;

export type DateRangePreset = {
  label: string;
  range: DateRangeValue;
  disabled?: boolean;
};

export type DateRangePickerProps = {
  value: DateRangeValue;
  onValueChange: (value: DateRangeValue) => void;
  presets: readonly DateRangePreset[];
  label?: string;
  minDate?: Date;
  maxDate?: Date;
};

export type ComparisonDateRangePickerProps = DateRangePickerProps & {
  comparison: DateRangeComparison;
  onComparisonChange: (value: DateRangeComparison) => void;
};

export function DateRangePicker(props: DateRangePickerProps) {
  return <RangePicker {...props} />;
}

export function ComparisonDateRangePicker({
  comparison,
  onComparisonChange,
  ...props
}: ComparisonDateRangePickerProps) {
  const compared = comparisonDateRange(props.value, comparison);
  return (
    <RangePicker
      {...props}
      ariaLabel="Comparison date range"
      header={
        <div className="p-2">
          <ButtonGroup
            variant="segmented"
            className="w-full"
            aria-label="Comparison period"
          >
            {comparisons.map((option) => (
              <Button
                key={option.value}
                variant="segment"
                size="sm"
                className="min-w-0 flex-1 px-1 type-ui-caption"
                aria-pressed={comparison === option.value}
                onClick={() => onComparisonChange(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </ButtonGroup>
        </div>
      }
      comparisonSummary={<>vs {formatDateRange(compared)}</>}
    />
  );
}

function RangePicker({
  value,
  onValueChange,
  presets,
  label,
  minDate,
  maxDate,
  header,
  comparisonSummary,
  ariaLabel = "Date range",
}: DateRangePickerProps & {
  header?: React.ReactNode;
  comparisonSummary?: React.ReactNode;
  ariaLabel?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [draft, setDraft] = React.useState<DateRange | undefined>(value);
  const [custom, setCustom] = React.useState(false);
  const activePreset = !custom
    ? presets.find((preset) => sameDateRange(preset.range, value))
    : undefined;
  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        if (next) {
          setDraft(value);
          setCustom(
            !presets.some((preset) => sameDateRange(preset.range, value)),
          );
        }
        setOpen(next);
      }}
    >
      <PopoverTrigger render={<Button variant="outline" size="sm" />}>
        <IconCalendar aria-hidden="true" />
        {label ??
          presets.find((preset) => sameDateRange(preset.range, value))?.label ??
          formatDateRange(value)}
        <CaretIcon variant="chevron" />
      </PopoverTrigger>
      <PopoverContent variant="date-range" align="start" aria-label={ariaLabel}>
        {header}
        <div className="grid sm:grid-cols-[160px_1fr]">
          <div className="p-1">
            <p className="px-2 py-1 type-ui-caption text-subtle-foreground">
              Select range
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-1">
              {presets.map((preset) => (
                <Button
                  key={preset.label}
                  variant="ghost"
                  className={cn(
                    menuRowClassName,
                    "h-auto justify-start aria-pressed:bg-accent",
                  )}
                  aria-pressed={activePreset === preset}
                  disabled={preset.disabled}
                  onClick={() => {
                    onValueChange(preset.range);
                    setOpen(false);
                  }}
                >
                  {preset.label}
                  <span
                    className="ml-auto flex size-4 shrink-0 items-center justify-center"
                    aria-hidden="true"
                  >
                    {activePreset === preset && <IconCheck />}
                  </span>
                </Button>
              ))}
              <Button
                variant="ghost"
                className={cn(
                  menuRowClassName,
                  "h-auto justify-start aria-pressed:bg-accent",
                )}
                aria-pressed={custom}
                onClick={() => {
                  setCustom(true);
                  setDraft(undefined);
                }}
              >
                Custom range
              </Button>
            </div>
          </div>
          <Calendar
            mode="range"
            buttonVariant="outline"
            required
            selected={draft}
            defaultMonth={value.to}
            startMonth={minDate}
            endMonth={maxDate}
            showOutsideDays={false}
            disabled={[
              ...(minDate ? [{ before: minDate }] : []),
              ...(maxDate ? [{ after: maxDate }] : []),
            ]}
            excludeDisabled
            onSelect={(range) => {
              setCustom(true);
              setDraft(range);
              if (range?.from && range.to)
                onValueChange({ from: range.from, to: range.to });
            }}
            className="mx-auto [--cell-size:--spacing(8)]"
          />
        </div>
        <div
          className="border-t bg-muted/50 px-3 py-3 type-ui-caption text-muted-foreground"
          aria-live="polite"
        >
          {draft?.from && !draft.to ? (
            "Choose an end date"
          ) : (
            <>
              <span className="text-foreground">{formatDateRange(value)}</span>
              {comparisonSummary && <> {comparisonSummary}</>} ·{" "}
              {dateRangeDays(value)}d
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
