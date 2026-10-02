import { describe, expect, it } from "vitest";
import { filterSelectionState, toggleFilterValue } from "@repo/ui/lib/filter-select";

describe("shared filter selection", () => {
  it("distinguishes defaults, single selection and multiple selection", () => {
    expect(filterSelectionState(null)).toEqual({ values: [], active: false });
    expect(filterSelectionState("active")).toEqual({ values: ["active"], active: true });
    expect(filterSelectionState(["a", "b"])).toEqual({ values: ["a", "b"], active: true });
    expect(filterSelectionState(["b", "a"], ["a", "b"]).active).toBe(false);
    expect(filterSelectionState([], ["a", "b"]).active).toBe(true);
    expect(filterSelectionState("category", "category").active).toBe(false);
  });
  it("adds once and removes values without changing the source", () => {
    const values = ["a"];
    expect(toggleFilterValue(values, "a", true)).toEqual(["a"]);
    expect(toggleFilterValue(values, "b", true)).toEqual(["a", "b"]);
    expect(toggleFilterValue(values, "a", false)).toEqual([]);
    expect(values).toEqual(["a"]);
  });
});
