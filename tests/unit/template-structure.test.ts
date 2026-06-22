import { describe, expect, it } from "vitest";
import path from "node:path";
import fs from "fs-extra";

const TEMPLATE_DIR = path.resolve(__dirname, "../../template");

describe("template structure contracts", () => {
  it("uses Base UI render instead of keeping a deprecated Button asChild shim", async () => {
    const content = await fs.readFile(
      path.join(TEMPLATE_DIR, "packages/ui/src/components/button.tsx"),
      "utf-8",
    );

    expect(content).not.toContain("asChild");
    expect(content).toContain("nativeButton={!props.render}");
  });

  it("exposes database source types without requiring dist for typecheck", async () => {
    const packageJson = await fs.readJson(
      path.join(TEMPLATE_DIR, "packages/database/package.json"),
    );

    expect(packageJson.exports["."]).toMatchObject({
      types: "./src/index.ts",
      default: "./dist/index.js",
    });
    expect(packageJson.exports["./prisma"]).toMatchObject({
      types: "./src/prisma.ts",
      default: "./dist/prisma.js",
    });
  });

  it("keeps API typecheck independent from database dist builds", async () => {
    const packageJson = await fs.readJson(
      path.join(TEMPLATE_DIR, "apps/api/package.json"),
    );

    expect(packageJson.scripts["generate:deps"]).toBe(
      "pnpm --filter @repo/database db:generate",
    );
    expect(packageJson.scripts.pretypecheck).toBe("pnpm run generate:deps");
    expect(packageJson.scripts.typecheck).toBe("tsc --noEmit");
    expect(packageJson.scripts.predev).toBe("pnpm run build:deps");
    expect(packageJson.scripts.pretest).toBe("pnpm run build:deps");
    expect(packageJson.scripts.prebuild).toBe("pnpm run build:deps");
  });

  it("includes a worker NestJS app with worker-specific identity", async () => {
    const workerPackageJson = await fs.readJson(
      path.join(TEMPLATE_DIR, "apps/worker/package.json"),
    );
    const workerMain = await fs.readFile(
      path.join(TEMPLATE_DIR, "apps/worker/src/main.ts"),
      "utf-8",
    );
    const workerService = await fs.readFile(
      path.join(TEMPLATE_DIR, "apps/worker/src/app.service.ts"),
      "utf-8",
    );
    const workerControllerTest = await fs.readFile(
      path.join(TEMPLATE_DIR, "apps/worker/src/app.controller.test.ts"),
      "utf-8",
    );

    expect(workerPackageJson.name).toBe("worker");
    expect(workerPackageJson.scripts.pretypecheck).toBe("pnpm run generate:deps");
    expect(workerPackageJson.scripts.typecheck).toBe("tsc --noEmit");
    expect(workerMain).toContain("{{LOCAL_WORKER_PORT}}");
    expect(workerMain).not.toContain("{{LOCAL_API_PORT}}");
    expect(workerMain).toContain('const DEFAULT_HOST = "127.0.0.1";');
    expect(workerMain).toContain('process.env.HOST || DEFAULT_HOST');
    expect(workerMain).not.toContain("enableCors");
    expect(workerService).toContain("jjlabsio-starter-worker");
    expect(workerControllerTest).toContain("jjlabsio-starter-worker");
  });

  it("documents the generated worker app", async () => {
    const rootReadme = await fs.readFile(
      path.resolve(__dirname, "../../README.md"),
      "utf-8",
    );
    const templateReadme = await fs.readFile(
      path.join(TEMPLATE_DIR, "README.md"),
      "utf-8",
    );

    expect(rootReadme).toContain("apps/worker");
    expect(templateReadme).toContain("apps/worker");
  });

  it("uses MDF fallback docs structure for generated projects", async () => {
    const expectedDocs = [
      "docs/index.md",
      "docs/product/index.md",
      "docs/product/product-brief.md",
      "docs/architecture/index.md",
      "docs/decisions/index.md",
      "docs/operations/index.md",
    ];

    for (const relativePath of expectedDocs) {
      await expect(
        fs.pathExists(path.join(TEMPLATE_DIR, relativePath)),
      ).resolves.toBe(true);
    }

    const removedDocs = [
      "docs/brand_brief.md",
      "docs/brand_brief_prompt.md",
      "docs/growth_playbook.md",
      "docs/prd.md",
    ];

    for (const relativePath of removedDocs) {
      await expect(
        fs.pathExists(path.join(TEMPLATE_DIR, relativePath)),
      ).resolves.toBe(false);
    }
  });
});
