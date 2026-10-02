export function downloadCsv(
  filename: string,
  rows: readonly Record<string, string | number>[],
) {
  if (rows.length === 0) return;
  const columns = Object.keys(rows[0]!);
  const escape = (value: string | number) =>
    `"${String(value).replaceAll('"', '""')}"`;
  const content = [
    columns.map(escape).join(","),
    ...rows.map((row) =>
      columns.map((column) => escape(row[column] ?? "")).join(","),
    ),
  ].join("\r\n");
  const url = URL.createObjectURL(
    new Blob([content], { type: "text/csv;charset=utf-8" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
