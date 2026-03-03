import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { cleanLayout } from "../../src/steps/clean-layout.js";
import * as fsUtils from "../../src/utils/fs.js";

vi.mock("../../src/utils/fs.js");
vi.mock("../../src/utils/logger.js");

describe("cleanLayout", () => {
  beforeEach(() => {
    vi.mocked(fsUtils.removeDir).mockResolvedValue();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("removes standard route group and domain dirs when sidebar selected", async () => {
    await cleanLayout("/tmp/test-project", "sidebar");

    expect(fsUtils.removeDir).toHaveBeenCalledWith(
      expect.stringContaining("(standard)"),
    );
    expect(fsUtils.removeDir).toHaveBeenCalledWith(
      expect.stringContaining("domains/standard"),
    );
    expect(fsUtils.removeDir).toHaveBeenCalledTimes(2);
  });

  it("removes sidebar route group and domain dirs when standard selected", async () => {
    await cleanLayout("/tmp/test-project", "standard");

    expect(fsUtils.removeDir).toHaveBeenCalledWith(
      expect.stringContaining("(sidebar)"),
    );
    expect(fsUtils.removeDir).toHaveBeenCalledWith(
      expect.stringContaining("domains/sidebar"),
    );
    expect(fsUtils.removeDir).toHaveBeenCalledTimes(2);
  });
});
