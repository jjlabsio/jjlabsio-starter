import { describe, expect, it } from "vitest";
import {
  overviewPeriod,
  overviewRanges,
  readOverviewRange,
  selectedOverviewDays,
} from "./overview-data";
import {
  comparisonDateRange,
  dateRangeDays,
  formatDateRange,
} from "@repo/ui/lib/date-range";

describe("overview date filters", () => {
  it("preserves the existing two- and seven-day example datasets", () => {
    expect(
      selectedOverviewDays(overviewRanges["2d"]).reduce(
        (sum, day) => sum + day.visitors,
        0,
      ),
    ).toBe(31_420);
    expect(
      selectedOverviewDays(overviewRanges["7d"]).reduce(
        (sum, day) => sum + day.visitors,
        0,
      ),
    ).toBe(87_940);
    expect(
      overviewPeriod(readOverviewRange(new URLSearchParams("period=7d"))),
    ).toBe("7d");
  });
  it("restores an inclusive custom window and filters real fixture rows", () => {
    const range = readOverviewRange(
      new URLSearchParams("from=2026-09-14&to=2026-09-16"),
    );
    expect(overviewPeriod(range)).toBe("custom");
    expect(dateRangeDays(range)).toBe(3);
    expect(selectedOverviewDays(range).map((day) => day.date)).toEqual([
      "2026-09-14",
      "2026-09-15",
      "2026-09-16",
    ]);
    expect(
      selectedOverviewDays(range).reduce((sum, day) => sum + day.visitors, 0),
    ).toBe(33_740);
    expect(comparisonDateRange(range, "previous-period")).toEqual({
      from: new Date(2026, 8, 11),
      to: new Date(2026, 8, 13),
    });
  });
  it("rejects reversed, malformed and unavailable dates", () => {
    for (const query of [
      "from=2026-09-19&to=2026-09-13",
      "from=invalid&to=2026-09-15",
      "from=2026-08-31&to=2026-09-15",
    ]) {
      expect(readOverviewRange(new URLSearchParams(query))).toEqual(
        overviewRanges["2d"],
      );
    }
  });
  it("shifts month/year comparisons using calendar arithmetic", () => {
    const value = { from: new Date(2024, 2, 30), to: new Date(2024, 2, 31) };
    expect(comparisonDateRange(value, "last-month")).toEqual({
      from: new Date(2024, 1, 29),
      to: new Date(2024, 1, 29),
    });
    expect(comparisonDateRange(value, "last-year")).toEqual({
      from: new Date(2023, 2, 30),
      to: new Date(2023, 2, 31),
    });
  });
  it("formats both range endpoints as yyyy.MM.dd", () => {
    expect(
      formatDateRange({
        from: new Date(2026, 8, 14),
        to: new Date(2026, 8, 16),
      }),
    ).toBe("2026.09.14 – 2026.09.16");
    expect(
      formatDateRange({
        from: new Date(2026, 7, 20),
        to: new Date(2026, 8, 19),
      }),
    ).toBe("2026.08.20 – 2026.09.19");
    expect(
      formatDateRange({
        from: new Date(2025, 11, 31),
        to: new Date(2026, 0, 1),
      }),
    ).toBe("2025.12.31 – 2026.01.01");
  });
});
