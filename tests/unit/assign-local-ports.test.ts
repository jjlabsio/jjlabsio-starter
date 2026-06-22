import path from "node:path";
import os from "node:os";
import fs from "fs-extra";
import { afterEach, describe, expect, it } from "vitest";
import {
  assignLocalPorts,
  getPortsForSet,
  previewLocalPorts,
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
    await fs.outputFile(
      path.join(projectDir, "apps/app/package.json"),
      '{"scripts":{"dev":"next dev --port {{LOCAL_APP_PORT}}","start":"next start --port {{LOCAL_APP_PORT}}"}}',
    );
    await fs.outputFile(
      path.join(projectDir, "apps/web/package.json"),
      '{"scripts":{"dev":"next dev --port {{LOCAL_WEB_PORT}}","start":"next start --port {{LOCAL_WEB_PORT}}"}}',
    );
    await fs.outputFile(
      path.join(projectDir, "apps/api/src/main.ts"),
      "const DEFAULT_PORT = {{LOCAL_API_PORT}};",
    );
    await fs.outputFile(
      path.join(projectDir, "apps/worker/src/main.ts"),
      "const DEFAULT_PORT = {{LOCAL_WORKER_PORT}};",
    );
    await fs.outputFile(
      path.join(projectDir, "docker-compose.yml"),
      'ports:\n  - "{{LOCAL_POSTGRES_PORT}}:5432"',
    );
  }

  it("starts the first port set at 3100 and uses 100-port increments", () => {
    expect(getPortsForSet(0)).toEqual({
      app: 3100,
      web: 3101,
      api: 3102,
      worker: 3103,
      postgres: 5532,
    });
    expect(getPortsForSet(1)).toEqual({
      app: 3200,
      web: 3201,
      api: 3202,
      worker: 3203,
      postgres: 5632,
    });
  });

  it("previews an available port set without writing registry or project files", async () => {
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

    const result = await previewLocalPorts(projectDir, {
      homeDir,
      isPortAvailable: async () => true,
    });

    expect(result.portSet).toBe(1);
    expect(result.ports).toEqual(getPortsForSet(1));
    await expect(fs.readJson(registryPath)).resolves.toMatchObject({
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
    await expect(
      fs.readFile(path.join(projectDir, "apps/app/.env.example"), "utf-8"),
    ).resolves.toContain("{{LOCAL_APP_PORT}}");
  });

  it("reserves a previewed port set and writes literal ports into project templates", async () => {
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

    const selected = {
      portSet: 1,
      ports: getPortsForSet(1),
    };
    const result = await assignLocalPorts(projectDir, "new-project", selected, {
      homeDir,
      isPortAvailable: async () => true,
    });

    expect(result).toEqual(selected);
    await expect(
      fs.readFile(path.join(projectDir, "apps/app/.env.example"), "utf-8"),
    ).resolves.toContain("http://localhost:3200");
    await expect(
      fs.readFile(path.join(projectDir, "apps/app/package.json"), "utf-8"),
    ).resolves.toContain("next dev --port 3200");
    await expect(
      fs.readFile(path.join(projectDir, "apps/app/package.json"), "utf-8"),
    ).resolves.toContain("next start --port 3200");
    await expect(
      fs.readFile(path.join(projectDir, "apps/web/package.json"), "utf-8"),
    ).resolves.toContain("next dev --port 3201");
    await expect(
      fs.readFile(path.join(projectDir, "apps/web/package.json"), "utf-8"),
    ).resolves.toContain("next start --port 3201");
    await expect(
      fs.readFile(path.join(projectDir, "apps/web/.env.example"), "utf-8"),
    ).resolves.toContain("http://localhost:3200");
    await expect(
      fs.readFile(
        path.join(projectDir, "packages/database/.env.example"),
        "utf-8",
      ),
    ).resolves.toContain("localhost:5632");
    await expect(
      fs.readFile(path.join(projectDir, "apps/api/src/main.ts"), "utf-8"),
    ).resolves.toContain("const DEFAULT_PORT = 3202;");
    await expect(
      fs.readFile(path.join(projectDir, "apps/worker/src/main.ts"), "utf-8"),
    ).resolves.toContain("const DEFAULT_PORT = 3203;");
    await expect(
      fs.readFile(path.join(projectDir, "packages/database/README.md"), "utf-8"),
    ).resolves.toContain("localhost:5632");
    await expect(
      fs.readFile(path.join(projectDir, "docker-compose.yml"), "utf-8"),
    ).resolves.toContain('"5632:5432"');

    const registry = await fs.readJson(registryPath);
    expect(registry.projects[staleProject]).toBeUndefined();
    expect(registry.projects[projectDir]).toMatchObject({
      projectName: "new-project",
      portSet: 1,
    });
  });

  it("rejects a previewed port set that becomes used before assignment", async () => {
    const homeDir = await createTempDir("jjlabs-home-");
    const projectDir = await createTempDir("jjlabs-project-");
    const competingProject = await createTempDir("jjlabs-competing-");
    const registryPath = path.join(homeDir, ".jjlabsio-starter/ports.json");
    await writeProjectTemplates(projectDir);

    const selected = await previewLocalPorts(projectDir, {
      homeDir,
      isPortAvailable: async () => true,
    });

    await fs.outputJson(registryPath, {
      version: 1,
      projects: {
        [competingProject]: {
          projectName: "competing-project",
          portSet: selected.portSet,
        },
      },
    });

    await expect(
      assignLocalPorts(projectDir, "new-project", selected, {
        homeDir,
        isPortAvailable: async () => true,
      }),
    ).rejects.toThrow("Selected local development port set is no longer available.");

    await expect(
      fs.readFile(path.join(projectDir, "apps/app/package.json"), "utf-8"),
    ).resolves.toContain("{{LOCAL_APP_PORT}}");
  });

  it("rejects a previewed port set when one of its ports becomes unavailable", async () => {
    const homeDir = await createTempDir("jjlabs-home-");
    const projectDir = await createTempDir("jjlabs-project-");
    await writeProjectTemplates(projectDir);

    const selected = await previewLocalPorts(projectDir, {
      homeDir,
      isPortAvailable: async () => true,
    });

    await expect(
      assignLocalPorts(projectDir, "new-project", selected, {
        homeDir,
        isPortAvailable: async (port) => port !== selected.ports.worker,
      }),
    ).rejects.toThrow("Selected local development port set is no longer available.");
  });

  it("skips a port set when one of its ports is currently unavailable", async () => {
    const homeDir = await createTempDir("jjlabs-home-");
    const projectDir = await createTempDir("jjlabs-project-");
    await writeProjectTemplates(projectDir);

    const result = await previewLocalPorts(projectDir, {
      homeDir,
      isPortAvailable: async (port) => port !== 3100,
    });

    expect(result.portSet).toBe(1);
    expect(result.ports.app).toBe(3200);
  });
});
