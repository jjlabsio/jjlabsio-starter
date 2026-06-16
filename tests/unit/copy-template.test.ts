import { describe, expect, it, vi, afterEach } from "vitest";
import { copyTemplate } from "../../src/steps/copy-template.js";
import fs from "fs-extra";

vi.mock("fs-extra");
vi.mock("../../src/utils/logger.js");

describe("copyTemplate", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("copies template files to projectPath", async () => {
    vi.mocked(fs.pathExists).mockResolvedValue(true as never);
    vi.mocked(fs.copy).mockResolvedValue(undefined as never);
    vi.mocked(fs.move).mockResolvedValue(undefined as never);

    await copyTemplate("/tmp/test-project");

    expect(fs.copy).toHaveBeenCalledWith(
      expect.stringContaining("template"),
      "/tmp/test-project",
      expect.objectContaining({
        filter: expect.any(Function),
      }),
    );
  });

  it("excludes generated build and install artifacts while copying", async () => {
    vi.mocked(fs.pathExists)
      .mockResolvedValueOnce(true as never)
      .mockResolvedValueOnce(false as never);
    vi.mocked(fs.copy).mockResolvedValue(undefined as never);

    await copyTemplate("/tmp/test-project");

    const [, , options] = vi.mocked(fs.copy).mock.calls[0];
    const filter = options?.filter;

    expect(filter).toBeDefined();
    expect(filter?.("/repo/template/apps/app/src/app/page.tsx", "")).toBe(true);
    expect(filter?.("/repo/template/apps/app/.next/types/validator.ts", "")).toBe(
      false,
    );
    expect(filter?.("/repo/template/apps/app/.turbo/turbo-build.log", "")).toBe(
      false,
    );
    expect(filter?.("/repo/template/apps/api/dist/main.js", "")).toBe(false);
    expect(filter?.("/repo/template/node_modules/.pnpm/lock.yaml", "")).toBe(
      false,
    );
  });

  it("copies env examples but excludes real env files", async () => {
    vi.mocked(fs.pathExists)
      .mockResolvedValueOnce(true as never)
      .mockResolvedValueOnce(false as never);
    vi.mocked(fs.copy).mockResolvedValue(undefined as never);

    await copyTemplate("/tmp/test-project");

    const [, , options] = vi.mocked(fs.copy).mock.calls[0];
    const filter = options?.filter;

    expect(filter).toBeDefined();
    expect(filter?.("/repo/template/apps/app/.env.example", "")).toBe(true);
    expect(filter?.("/repo/template/apps/app/.env.local.example", "")).toBe(
      true,
    );
    expect(filter?.("/repo/template/apps/app/.env", "")).toBe(false);
    expect(filter?.("/repo/template/apps/app/.env.local", "")).toBe(false);
    expect(filter?.("/repo/template/apps/app/.env.production", "")).toBe(
      false,
    );
    expect(filter?.("/repo/template/apps/app/.env.test.local", "")).toBe(false);
  });

  it("renames gitignore to .gitignore after copy", async () => {
    // First pathExists call: TEMPLATE_DIR exists; second: gitignore src exists
    vi.mocked(fs.pathExists)
      .mockResolvedValueOnce(true as never)
      .mockResolvedValueOnce(true as never);
    vi.mocked(fs.copy).mockResolvedValue(undefined as never);
    vi.mocked(fs.move).mockResolvedValue(undefined as never);

    await copyTemplate("/tmp/test-project");

    expect(fs.move).toHaveBeenCalledWith(
      "/tmp/test-project/gitignore",
      "/tmp/test-project/.gitignore",
    );
  });

  it("skips gitignore rename when gitignore file does not exist", async () => {
    // First pathExists call: TEMPLATE_DIR exists; second: gitignore src does NOT exist
    vi.mocked(fs.pathExists)
      .mockResolvedValueOnce(true as never)
      .mockResolvedValueOnce(false as never);
    vi.mocked(fs.copy).mockResolvedValue(undefined as never);

    await copyTemplate("/tmp/test-project");

    expect(fs.move).not.toHaveBeenCalled();
  });

  it("throws when TEMPLATE_DIR does not exist", async () => {
    vi.mocked(fs.pathExists).mockResolvedValueOnce(false as never);

    await expect(copyTemplate("/tmp/test-project")).rejects.toThrow(
      "Template directory not found",
    );

    expect(fs.copy).not.toHaveBeenCalled();
  });
});
