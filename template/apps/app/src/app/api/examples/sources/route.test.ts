import { beforeEach, describe, expect, it, vi } from "vitest";

const { getSession } = vi.hoisted(() => ({ getSession: vi.fn() }));
vi.mock("@repo/auth", () => ({ auth: { api: { getSession } } }));
import { GET } from "./route";

const request = (query = "") =>
  new Request(`http://localhost:3999/api/examples/sources${query}`);
beforeEach(() => getSession.mockResolvedValue({ user: { id: "test-user" } }));

describe("overview server table", () => {
  it("requires an authenticated session", async () => {
    getSession.mockResolvedValue(null);
    expect((await GET(request())).status).toBe(401);
  });
  it("returns a server page with the filtered total and no shared cache", async () => {
    const response = await GET(
      request("?pageSize=2&sort=visibility&direction=desc"),
    );
    const result = await response.json();
    expect(result.rows).toHaveLength(2);
    expect(result.rowCount).toBe(7);
    expect(result.rows[0].visibility).toBeGreaterThanOrEqual(
      result.rows[1].visibility,
    );
    expect(response.headers.get("cache-control")).toContain("no-store");
  });
  it("applies source and date filters before calculating the result", async () => {
    const result = await (
      await GET(request("?source=Direct&from=2026-09-18&to=2026-09-19"))
    ).json();
    const empty = await (await GET(request("?source="))).json();
    expect(result.rows).toHaveLength(1);
    expect(result.rowCount).toBe(1);
    expect(result.rows[0].name).toBe("Direct");
    expect(result.rows[0].visitors).toBeGreaterThan(0);
    expect(empty).toEqual({ rows: [], rowCount: 0 });
  });
  it("rejects invalid source and period inputs", async () => {
    for (const query of [
      "?source=Unknown",
      "?from=invalid",
      "?from=2026-09-19&to=2026-09-18",
      "?sort=unknown",
    ])
      expect((await GET(request(query))).status).toBe(400);
  });
});
