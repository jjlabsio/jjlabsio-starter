import { beforeEach, describe, expect, it, vi } from "vitest";
const { getSession, jar } = vi.hoisted(() => ({
  getSession: vi.fn(),
  jar: new Map<string, string>(),
}));
vi.mock("@repo/auth", () => ({ auth: { api: { getSession } } }));
vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (key: string) => ({ value: jar.get(key) }),
    set: (key: string, value: string) => jar.set(key, value),
  }),
}));
import { GET, POST } from "./route";
import { exampleRecords } from "@/domains/sidebar/lib/example-records";
const request = (query = "") =>
  new Request(`http://localhost:3999/api/examples/records${query}`);
const archive = (ids: unknown, origin = "http://localhost:3999") =>
  new Request("http://localhost:3999/api/examples/records", {
    method: "POST",
    headers: { "Content-Type": "application/json", origin },
    body: JSON.stringify({ ids }),
  });
beforeEach(() => {
  jar.clear();
  getSession.mockResolvedValue({ user: { id: "test-user" } });
});
describe("server table example", () => {
  it("requires a session for reads and writes", async () => {
    getSession.mockResolvedValue(null);
    expect((await GET(request())).status).toBe(401);
    expect((await POST(archive(["record-0"]))).status).toBe(401);
  });
  it("returns one page and the complete result count", async () => {
    const response = await GET(request());
    const first = await response.json();
    const second = await (await GET(request("?pageIndex=1"))).json();
    expect(first.rows).toHaveLength(20);
    expect(first.rowCount).toBe(63);
    expect(first.rows[0].id).not.toBe(second.rows[0].id);
    expect(response.headers.get("cache-control")).toContain("no-store");
  });
  it("filters with OR within a column and AND across search and columns before pagination", async () => {
    const result = await (
      await GET(
        request(
          "?status=Active&status=Paused&category=Product&search=Northstar",
        ),
      )
    ).json();
    expect(result.rowCount).toBeGreaterThan(0);
    expect(
      result.rows.every(
        (row: (typeof exampleRecords)[number]) =>
          ["Active", "Paused"].includes(row.status) &&
          row.category === "Product" &&
          row.name.includes("Northstar"),
      ),
    ).toBe(true);
  });
  it("sorts the whole dataset before taking a page", async () => {
    const result = await (
      await GET(request("?sort=entries&direction=desc&pageSize=1"))
    ).json();
    expect(result.rows[0].entries).toBe(
      Math.max(...exampleRecords.map((row) => row.entries)),
    );
  });
  it("validates query and mutation inputs", async () => {
    for (const query of [
      "?pageIndex=-1",
      "?pageSize=0",
      "?pageSize=101",
      "?sort=unknown",
      "?status=unknown",
    ])
      expect((await GET(request(query))).status).toBe(400);
    expect((await POST(archive(["missing-id"]))).status).toBe(400);
    expect((await POST(archive([]))).status).toBe(400);
    expect(
      (await POST(archive(["record-0"], "https://other.example"))).status,
    ).toBe(403);
  });
  it("archives on the server, preserving other users' example data", async () => {
    expect((await POST(archive(["record-0"]))).status).toBe(200);
    expect(
      (await (await GET(request("?search=Northstar"))).json()).rows[0].status,
    ).toBe("Archived");
    getSession.mockResolvedValue({ user: { id: "other-user" } });
    expect(
      (await (await GET(request("?search=Northstar"))).json()).rows[0].status,
    ).toBe("Active");
  });
});
