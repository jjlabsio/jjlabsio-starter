import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { cleanLayout } from "../../src/steps/clean-layout.js";
import * as fsUtils from "../../src/utils/fs.js";

vi.mock("../../src/utils/fs.js");
vi.mock("../../src/utils/logger.js");

describe("cleanLayout", () => {
  beforeEach(() => {
    vi.mocked(fsUtils.removeDir).mockResolvedValue();
    vi.mocked(fsUtils.removeFile).mockResolvedValue();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("removes standard route group and components when sidebar selected", async () => {
    await cleanLayout("/tmp/test-project", "sidebar");

    expect(fsUtils.removeDir).toHaveBeenCalledWith(
      expect.stringContaining("(standard)"),
    );
    expect(fsUtils.removeFile).toHaveBeenCalledWith(
      expect.stringContaining("app-header.tsx"),
    );
    expect(fsUtils.removeFile).toHaveBeenCalledWith(
      expect.stringContaining("app-footer.tsx"),
    );
    expect(fsUtils.removeFile).toHaveBeenCalledWith(
      expect.stringContaining("mobile-nav.tsx"),
    );
    expect(fsUtils.removeFile).toHaveBeenCalledWith(
      expect.stringContaining("user-menu.tsx"),
    );
    expect(fsUtils.removeFile).toHaveBeenCalledTimes(4);
  });

  it("removes sidebar route group and components when standard selected", async () => {
    await cleanLayout("/tmp/test-project", "standard");

    expect(fsUtils.removeDir).toHaveBeenCalledWith(
      expect.stringContaining("(sidebar)"),
    );
    expect(fsUtils.removeFile).toHaveBeenCalledWith(
      expect.stringContaining("app-sidebar.tsx"),
    );
    expect(fsUtils.removeFile).toHaveBeenCalledWith(
      expect.stringContaining("nav-main.tsx"),
    );
    expect(fsUtils.removeFile).toHaveBeenCalledWith(
      expect.stringContaining("nav-secondary.tsx"),
    );
    expect(fsUtils.removeFile).toHaveBeenCalledWith(
      expect.stringContaining("nav-user.tsx"),
    );
    expect(fsUtils.removeFile).toHaveBeenCalledWith(
      expect.stringContaining("nav-documents.tsx"),
    );
    expect(fsUtils.removeFile).toHaveBeenCalledWith(
      expect.stringContaining("site-header.tsx"),
    );
    expect(fsUtils.removeFile).toHaveBeenCalledWith(
      expect.stringContaining("page-container.tsx"),
    );
    expect(fsUtils.removeFile).toHaveBeenCalledWith(
      expect.stringContaining("section-cards.tsx"),
    );
    expect(fsUtils.removeFile).toHaveBeenCalledWith(
      expect.stringContaining("chart-area-interactive.tsx"),
    );
    expect(fsUtils.removeFile).toHaveBeenCalledTimes(9);
  });
});
