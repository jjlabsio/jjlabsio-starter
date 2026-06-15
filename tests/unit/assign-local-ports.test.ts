import path from "node:path";
import os from "node:os";
import fs from "fs-extra";
import { afterEach, describe, expect, it } from "vitest";
import {
  assignLocalPorts,
  getPortsForSet,
} from "../../src/steps/assign-local-ports.js";

describe("assignLocalPorts", () => {
  const tempDirs: string[] = [];

  afterEach(async () => {
    await Promise.all(tempDirs.map((dir) => fs.remove(dir)));
  });

  async function createTempDir(prefix: string) {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), prefix));
    tempDirs.push(dir);
    return dir;
  }

  async function writeProjectTemplates(projectDir: string) {
    await fs.outputFile(
      path.join(projectDir, ".env.example"),
      [
        "LOCAL_APP_PORT={{LOCAL_APP_PORT}}",
        "LOCAL_WEB_PORT={{LOCAL_WEB_PORT}}",
        "LOCAL_API_PORT={{LOCAL_API_PORT}}",
        "LOCAL_POSTGRES_PORT={{LOCAL_POSTGRES_PORT}}",
      ].join("\n"),
    );
    await fs.outputFile(
      path.join(projectDir, "apps/app/.env.example"),
      [
        'DATABASE_URL="postgresql://postgres:postgres@localhost:{{LOCAL_POSTGRES_PORT}}/demo?schema=public"',
        'BETTER_AUTH_URL="http://localhost:{{LOCAL_APP_PORT}}"',
      ].join("\n"),
    );
    await fs.outputFile(
      path.join(projectDir, "apps/web/.env.example"),
      'NEXT_PUBLIC_APP_URL="http://localhost:{{LOCAL_APP_PORT}}"',
    );
    await fs.outputFile(
      path.join(projectDir, "packages/database/.env.example"),
      'DATABASE_URL="postgresql://postgres:postgres@localhost:{{LOCAL_POSTGRES_PORT}}/demo?schema=public"',
    );
    await fs.outputFile(
      path.join(projectDir, "packages/database/README.md"),
      "DATABASE_URL=postgresql://postgres:postgres@localhost:{{LOCAL_POSTGRES_PORT}}/demo",
    );
  }

  it("selects the first available port set, prunes stale records, and writes project env examples", async () => {
    const homeDir = await createTempDir("jjlabs-home-");
    const existingProject = await createTempDir("jjlabs-existing-");
    const staleProject = path.join(homeDir, "deleted-project");
    const projectDir = await createTempDir("jjlabs-project-");
    const registryPath = path.join(homeDir, ".jjlabsio-starter/ports.json");

    await fs.outputJson(registryPath, {
      version: 1,
      projects: {
        [existingProject]: {
          projectName: "existing-project",
          portSet: 0,
        },
        [staleProject]: {
          projectName: "deleted-project",
          portSet: 1,
        },
      },
    });
    await writeProjectTemplates(projectDir);

    const result = await assignLocalPorts(projectDir, "new-project", {
      homeDir,
      isPortAvailable: async () => true,
    });

    expect(result.portSet).toBe(1);
    expect(result.ports).toEqual(getPortsForSet(1));

    await expect(fs.readFile(path.join(projectDir, ".env.example"), "utf-8"))
      .resolves.toContain("LOCAL_POSTGRES_PORT=5532");
    await expect(
      fs.readFile(path.join(projectDir, "apps/app/.env.example"), "utf-8"),
    ).resolves.toContain("http://localhost:3100");
    await expect(
      fs.readFile(path.join(projectDir, "packages/database/README.md"), "utf-8"),
    ).resolves.toContain("localhost:5532");

    const registry = await fs.readJson(registryPath);
    expect(registry.projects[staleProject]).toBeUndefined();
    expect(registry.projects[projectDir]).toMatchObject({
      projectName: "new-project",
      portSet: 1,
    });
  });

  it("skips a port set when one of its ports is currently unavailable", async () => {
    const homeDir = await createTempDir("jjlabs-home-");
    const projectDir = await createTempDir("jjlabs-project-");
    await writeProjectTemplates(projectDir);

    const result = await assignLocalPorts(projectDir, "busy-project", {
      homeDir,
      isPortAvailable: async (port) => port !== 3000,
    });

    expect(result.portSet).toBe(1);
    expect(result.ports.app).toBe(3100);
  });
});
