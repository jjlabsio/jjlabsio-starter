export function filterSelectionState(
  value: string | null | readonly string[],
  defaultValue: string | null | readonly string[] = Array.isArray(value)
    ? []
    : null,
) {
  const values = [
    ...new Set(typeof value === "string" ? [value] : (value ?? [])),
  ];
  const defaults = new Set(
    typeof defaultValue === "string" ? [defaultValue] : (defaultValue ?? []),
  );
  return {
    values,
    active:
      values.length !== defaults.size ||
      values.some((item) => !defaults.has(item)),
  };
}

export function toggleFilterValue(
  values: readonly string[],
  value: string,
  checked: boolean,
) {
  return checked
    ? [...new Set([...values, value])]
    : values.filter((item) => item !== value);
}
