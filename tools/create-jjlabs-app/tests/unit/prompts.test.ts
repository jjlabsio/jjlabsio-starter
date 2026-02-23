import { describe, expect, it, vi, afterEach } from "vitest";
import { getUserChoices } from "../../src/prompts.js";

vi.mock("prompts", () => ({
  default: vi.fn(),
}));

import prompts from "prompts";

describe("getUserChoices", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns choices when user provides all inputs", async () => {
    vi.mocked(prompts).mockResolvedValue({
      projectName: "my-app",
      layout: "sidebar",
    });

    const result = await getUserChoices();

    expect(result).toEqual({
      projectName: "my-app",
      layout: "sidebar",
    });
  });

  it("uses argProjectName when provided", async () => {
    vi.mocked(prompts).mockResolvedValue({
      layout: "standard",
    });

    const result = await getUserChoices("pre-defined-name");

    expect(result).toEqual({
      projectName: "pre-defined-name",
      layout: "standard",
    });
  });

  it("returns null when layout is not selected", async () => {
    vi.mocked(prompts).mockResolvedValue({
      projectName: "my-app",
    });

    const result = await getUserChoices();
    expect(result).toBeNull();
  });
});
