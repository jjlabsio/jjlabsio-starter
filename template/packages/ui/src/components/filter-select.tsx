"use client";

import * as React from "react";
import { IconSearch, IconFilter } from "@tabler/icons-react";
import { Button } from "@repo/ui/components/button";
import { Badge } from "@repo/ui/components/badge";
import { CaretIcon } from "@repo/ui/components/caret-icon";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@repo/ui/components/dropdown-menu";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@repo/ui/components/input-group";
import {
  filterSelectionState,
  toggleFilterValue,
} from "@repo/ui/lib/filter-select";

export type FilterSelectOption = {
  value: string;
  label: string;
  group?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
};

type Selection =
  | {
      mode?: "single";
      value: string | null;
      defaultValue?: string | null;
      onValueChange: (value: string | null) => void;
    }
  | {
      mode: "multiple";
      value: readonly string[];
      defaultValue?: readonly string[];
      onValueChange: (value: string[]) => void;
    };

type ListOptions = {
  label: string;
  options: readonly FilterSelectOption[];
  allLabel?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  emptyMessage?: string;
  onCreate?: { label: string; onClick: () => void };
  onReset?: () => void;
  resetDisabled?: boolean;
};

type ListProps = Selection & ListOptions;

/** Reuse inside a filter submenu; never nest another menu root in that submenu. */
export function FilterSelectList(props: ListProps) {
  const [query, setQuery] = React.useState("");
  const { values, active } = filterSelectionState(
    props.value,
    props.defaultValue,
  );
  const matching = props.options.filter((option) =>
    option.label.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()),
  );
  const groups = [...new Set(matching.map((option) => option.group))];
  const rows = groups.map((group) => (
    <DropdownMenuGroup key={group ?? "ungrouped"}>
      {group && <DropdownMenuLabel>{group}</DropdownMenuLabel>}
      {matching
        .filter((option) => option.group === group)
        .map((option) =>
          props.mode === "multiple" ? (
            <DropdownMenuCheckboxItem
              key={option.value}
              checked={values.includes(option.value)}
              disabled={option.disabled}
              onCheckedChange={(checked) =>
                props.onValueChange(
                  toggleFilterValue(props.value, option.value, checked),
                )
              }
            >
              {option.icon}
              <span className="min-w-0 truncate">{option.label}</span>
            </DropdownMenuCheckboxItem>
          ) : (
            <DropdownMenuRadioItem
              key={option.value}
              value={option.value}
              disabled={option.disabled}
              closeOnClick
            >
              {option.icon}
              <span className="min-w-0 truncate">{option.label}</span>
            </DropdownMenuRadioItem>
          ),
        )}
    </DropdownMenuGroup>
  ));
  const all = props.allLabel ? (
    <>
      {props.mode === "multiple" ? (
        <DropdownMenuItem
          selected={!active}
          closeOnClick={false}
          onClick={() => props.onValueChange([...(props.defaultValue ?? [])])}
        >
          {props.allLabel}
        </DropdownMenuItem>
      ) : (
        <DropdownMenuRadioItem value={props.defaultValue ?? ""} closeOnClick>
          {props.allLabel}
        </DropdownMenuRadioItem>
      )}
      <DropdownMenuSeparator />
    </>
  ) : null;
  return (
    <>
      {props.searchable && (
        <>
          <InputGroup variant="menu">
            <InputGroupAddon>
              <IconSearch aria-hidden="true" />
            </InputGroupAddon>
            <InputGroupInput
              aria-label={`Search ${props.label.toLocaleLowerCase()}`}
              placeholder={
                props.searchPlaceholder ??
                `Search ${props.label.toLocaleLowerCase()}...`
              }
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onClear={() => setQuery("")}
            />
          </InputGroup>
          <DropdownMenuSeparator />
        </>
      )}
      {props.mode === "multiple" ? (
        <>
          {all}
          {rows}
        </>
      ) : (
        <DropdownMenuRadioGroup
          value={props.value ?? ""}
          onValueChange={(value) =>
            props.onValueChange(value === "" ? null : value)
          }
        >
          {all}
          {rows}
        </DropdownMenuRadioGroup>
      )}
      {!matching.length && (
        <p
          role="status"
          className="px-2 py-2 type-ui-body text-muted-foreground"
        >
          {props.emptyMessage ?? "No matching options."}
        </p>
      )}
      {(props.onReset || props.onCreate) && <DropdownMenuSeparator />}
      {props.onReset && (
        <DropdownMenuItem
          variant="reset"
          disabled={props.resetDisabled ?? !active}
          onClick={props.onReset}
        >
          Reset filters
        </DropdownMenuItem>
      )}
      {props.onCreate && (
        <DropdownMenuItem variant="create" onClick={props.onCreate.onClick}>
          {props.onCreate.label}
        </DropdownMenuItem>
      )}
    </>
  );
}

export type FilterSelectProps = Selection &
  Omit<ListOptions, "onCreate" | "onReset" | "resetDisabled"> & {
    placeholder?: string;
    emptyLabel?: string;
    icon?: React.ReactNode;
    summary?: "value" | "compact" | "chips";
    reset?: boolean;
    disabled?: boolean;
    ariaLabel?: string;
    onCreate?: {
      label: string;
      onClick: (trigger: HTMLButtonElement | null) => void;
    };
  };

export function FilterSelect({
  placeholder,
  emptyLabel = "None selected",
  icon,
  summary = "value",
  reset = true,
  disabled,
  ariaLabel,
  onCreate,
  ...props
}: FilterSelectProps) {
  const trigger = React.useRef<HTMLButtonElement>(null);
  const { values, active } = filterSelectionState(
    props.value,
    props.defaultValue,
  );
  const labels = values.map(
    (value) =>
      props.options.find((option) => option.value === value)?.label ?? value,
  );
  const restore = () => {
    if (props.mode === "multiple")
      props.onValueChange([...(props.defaultValue ?? [])]);
    else props.onValueChange(props.defaultValue ?? null);
  };
  const showCount =
    active && values.length > 0 && (summary !== "value" || values.length > 1);
  const text = !active
    ? (placeholder ?? props.allLabel ?? props.label)
    : summary === "value" && values.length === 1
      ? labels[0]
      : summary === "value" && !values.length
        ? emptyLabel
        : props.label;
  return (
    <div
      data-slot="filter-select"
      data-summary={summary}
      className="flex min-w-0 flex-wrap items-center gap-2"
    >
      <DropdownMenu>
        <DropdownMenuTrigger
          ref={trigger}
          aria-label={
            active
              ? `${ariaLabel ?? props.label}: ${values.length} selected${labels.length ? ` (${labels.join(", ")})` : ""}`
              : ariaLabel
                ? `${ariaLabel}: default`
                : (placeholder ?? props.allLabel ?? props.label)
          }
          render={
            <Button
              variant="outline"
              size="sm"
              data-filter-active={active}
              disabled={disabled}
              className="max-w-full"
            />
          }
        >
          {icon}
          <span className="min-w-0 truncate">{text}</span>
          {showCount && (
            <Badge
              variant="count"
              className="rounded-full border-transparent bg-accent text-foreground"
              aria-hidden="true"
            >
              {values.length}
            </Badge>
          )}
          <CaretIcon variant="chevron" />
        </DropdownMenuTrigger>
        <DropdownMenuContent variant="filter">
          <FilterSelectList
            {...props}
            onReset={reset && summary !== "chips" ? restore : undefined}
            onCreate={
              onCreate
                ? {
                    label: onCreate.label,
                    onClick: () => onCreate.onClick(trigger.current),
                  }
                : undefined
            }
          />
        </DropdownMenuContent>
      </DropdownMenu>
      {summary === "chips" && active && (
        <>
          {values.map((value, index) => (
            <Badge
              key={value}
              variant="filter"
              label={props.label}
              onRemove={() => {
                if (props.mode === "multiple")
                  props.onValueChange(
                    props.value.filter((item) => item !== value),
                  );
                else restore();
              }}
            >
              {labels[index]}
            </Badge>
          ))}
          {reset && (
            <Button variant="reset" size="sm" onClick={restore}>
              Reset
            </Button>
          )}
        </>
      )}
    </div>
  );
}

export function FilterMenu({
  label = "All filters",
  activeCount,
  onReset,
  children,
}: {
  label?: string;
  activeCount: number;
  onReset?: () => void;
  children: React.ReactNode;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`${label}: ${activeCount} active`}
        render={
          <Button
            variant="outline"
            size="sm"
            data-filter-active={activeCount > 0}
          />
        }
      >
        <IconFilter aria-hidden="true" />
        {label}
        {activeCount > 0 && (
          <Badge
            variant="count"
            className="rounded-full border-transparent bg-accent text-foreground"
            aria-hidden="true"
          >
            {activeCount}
          </Badge>
        )}
        <CaretIcon variant="chevron" />
      </DropdownMenuTrigger>
      <DropdownMenuContent variant="filter">
        {children}
        {onReset && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="reset"
              disabled={!activeCount}
              onClick={onReset}
            >
              Reset filters
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
