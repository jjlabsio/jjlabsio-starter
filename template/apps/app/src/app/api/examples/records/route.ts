import { createHash } from "node:crypto";
import { auth } from "@repo/auth";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  exampleRecords,
  parseRecordQuery,
  queryExampleRecords,
} from "@/domains/sidebar/lib/example-records";

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const query = parseRecordQuery(new URL(request.url).searchParams);
    const store = await cookies();
    const archived = readArchived(
      store.get(cookieName(session.user.id))?.value,
    );
    return NextResponse.json(queryExampleRecords(query, archived), {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch {
    return NextResponse.json(
      { error: "Invalid table query." },
      { status: 400 },
    );
  }
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const origin = request.headers.get("origin");
  if (
    (origin && origin !== new URL(request.url).origin) ||
    !request.headers.get("content-type")?.startsWith("application/json")
  )
    return NextResponse.json({ error: "Invalid request." }, { status: 403 });
  const text = await request.text();
  if (text.length > 4000)
    return NextResponse.json({ error: "Request too large." }, { status: 413 });
  try {
    const body: unknown = JSON.parse(text);
    if (
      !body ||
      typeof body !== "object" ||
      !("ids" in body) ||
      !Array.isArray(body.ids) ||
      !body.ids.length ||
      body.ids.length > 100 ||
      body.ids.some(
        (id: unknown) =>
          typeof id !== "string" ||
          !exampleRecords.some((row) => row.id === id),
      )
    )
      throw new Error("Invalid records.");
    const store = await cookies();
    const key = cookieName(session.user.id);
    const ids = [
      ...new Set([...readArchived(store.get(key)?.value), ...body.ids]),
    ];
    // Demo-only session state; production services replace this with a user-scoped DB update.
    store.set(key, ids.join(","), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/api/examples/records",
    });
    return NextResponse.json(
      { archived: body.ids.length },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch {
    return NextResponse.json({ error: "Invalid records." }, { status: 400 });
  }
}
function cookieName(userId: string) {
  return `example-records-${createHash("sha256").update(userId).digest("hex").slice(0, 16)}`;
}
function readArchived(value = "") {
  return value
    .split(",")
    .filter((id) => exampleRecords.some((row) => row.id === id));
}
