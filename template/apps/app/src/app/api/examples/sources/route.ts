import { auth } from "@repo/auth";
import { NextResponse } from "next/server";
import { parseRecordQuery } from "@/domains/sidebar/lib/example-records";
import {
  overviewSources,
  overviewDays,
} from "@/domains/sidebar/lib/overview-data";

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const params = new URL(request.url).searchParams;
    const query = parseRecordQuery(
      params,
      ["name", "visibility", "visitors"],
      {},
    );
    const from = params.get("from") ?? "2026-09-18";
    const to = params.get("to") ?? "2026-09-19";
    const selected = params.has("source")
      ? params.getAll("source").filter(Boolean)
      : overviewSources.map((source) => source.name);
    if (
      !overviewDays.some((day) => day.date === from) ||
      !overviewDays.some((day) => day.date === to) ||
      from > to ||
      selected.some(
        (name) => !overviewSources.some((source) => source.name === name),
      )
    )
      throw new Error();
    const days = overviewDays.filter(
      (day) => day.date >= from && day.date <= to,
    );
    const scale = days.reduce((sum, day) => sum + day.scale, 0) / days.length;
    const visitors = days.reduce((sum, day) => sum + day.visitors, 0);
    const total = overviewSources.reduce(
      (sum, source) => sum + source.visibility,
      0,
    );
    const rows = overviewSources
      .filter(
        (source) =>
          selected.includes(source.name) &&
          source.name
            .toLowerCase()
            .includes(query.globalFilter.trim().toLowerCase()),
      )
      .map((source) => ({
        name: source.name,
        visibility: Math.round(source.visibility * scale),
        visitors: Math.round((visitors * source.visibility) / total),
      }));
    const sort = query.sorting[0];
    if (sort)
      rows.sort((a, b) => {
        const left = a[sort.id as keyof typeof a];
        const right = b[sort.id as keyof typeof b];
        const difference =
          typeof left === "number" && typeof right === "number"
            ? left - right
            : String(left).localeCompare(String(right));
        return (
          (sort.desc ? -difference : difference) || a.name.localeCompare(b.name)
        );
      });
    const start = query.pagination.pageIndex * query.pagination.pageSize;
    return NextResponse.json(
      {
        rows: rows.slice(start, start + query.pagination.pageSize),
        rowCount: rows.length,
      },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch {
    return NextResponse.json(
      { error: "Invalid table query." },
      { status: 400 },
    );
  }
}
