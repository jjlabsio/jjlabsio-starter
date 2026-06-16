import { execSync } from "node:child_process";
import fs from "fs-extra";
import { afterEach, describe, expect, it, vi } from "vitest";
import { finalize } from "../../src/steps/finalize.js";

vi.mock("fs-extra");
vi.mock("../../src/utils/logger.js");
vi.mock("node:child_process", () => ({
  execSync: vi.fn(),
}));

describe("finalize", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("creates .env files from .env.example without removing examples", async () => {
    vi.mocked(fs.pathExists)
      .mockResolvedValueOnce(false as never)
      .mockResolvedValueOnce(true as never)
      .mockResolvedValueOnce(true as never)
      .mockResolvedValueOnce(true as never)
      .mockResolvedValueOnce(true as never);
    vi.mocked(fs.copy).mockResolvedValue(undefined as never);

    await finalize("/tmp/test-project");

    expect(fs.copy).toHaveBeenCalledWith(
      "/tmp/test-project/.env.example",
      "/tmp/test-project/.env",
      { overwrite: false },
    );
    expect(fs.copy).toHaveBeenCalledWith(
      "/tmp/test-project/apps/app/.env.example",
      "/tmp/test-project/apps/app/.env",
      { overwrite: false },
    );
    expect(fs.copy).toHaveBeenCalledWith(
      "/tmp/test-project/apps/web/.env.example",
      "/tmp/test-project/apps/web/.env",
      { overwrite: false },
    );
    expect(fs.copy).toHaveBeenCalledWith(
      "/tmp/test-project/packages/database/.env.example",
      "/tmp/test-project/packages/database/.env",
      { overwrite: false },
    );
    expect(fs.move).not.toHaveBeenCalled();
    expect(execSync).toHaveBeenCalledWith("pnpm install", {
      cwd: "/tmp/test-project",
      stdio: "inherit",
    });
  });
});
