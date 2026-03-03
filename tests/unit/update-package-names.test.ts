import { describe, expect, it, vi, afterEach } from "vitest";
import { updatePackageNames } from "../../src/steps/update-package-names.js";
import fs from "fs-extra";

vi.mock("fs-extra");
vi.mock("../../src/utils/logger.js");

describe("updatePackageNames", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("updates root package.json name to project name", async () => {
    vi.mocked(fs.pathExists).mockResolvedValue(true as never);
    vi.mocked(fs.readJson).mockResolvedValue({
      name: "jjlabsio-starter",
      version: "0.0.1",
    });
    vi.mocked(fs.writeJson).mockResolvedValue(undefined as never);

    await updatePackageNames("/tmp/test-project", "my-cool-app");

    const rootCall = vi
      .mocked(fs.writeJson)
      .mock.calls.find(
        ([filePath]) =>
          (filePath as string).endsWith("package.json") &&
          !(filePath as string).includes("apps/"),
      );
    expect(rootCall).toBeDefined();
    expect(rootCall![1]).toEqual(
      expect.objectContaining({ name: "my-cool-app" }),
    );
  });

  it("updates app package.json with scoped name", async () => {
    vi.mocked(fs.pathExists).mockResolvedValue(true as never);
    vi.mocked(fs.readJson).mockResolvedValue({
      name: "@repo/app",
      version: "0.0.1",
    });
    vi.mocked(fs.writeJson).mockResolvedValue(undefined as never);

    await updatePackageNames("/tmp/test-project", "my-cool-app");

    const appCall = vi
      .mocked(fs.writeJson)
      .mock.calls.find(([filePath]) =>
        (filePath as string).includes("apps/app"),
      );
    expect(appCall).toBeDefined();
    expect(appCall![1]).toEqual(
      expect.objectContaining({ name: "@my-cool-app/app" }),
    );
  });

  it("skips missing package.json files", async () => {
    vi.mocked(fs.pathExists).mockResolvedValue(false as never);

    await updatePackageNames("/tmp/test-project", "my-app");

    expect(fs.readJson).not.toHaveBeenCalled();
    expect(fs.writeJson).not.toHaveBeenCalled();
  });
});
