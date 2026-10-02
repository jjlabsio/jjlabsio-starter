import { describe, expect, it } from "vitest";
import path from "node:path";
import fs from "fs-extra";

const TEMPLATE_DIR = path.resolve(__dirname, "../../template");

describe("template structure contracts", () => {
  it("ships one root design guide and no Claude-specific instruction file", async () => {
    await expect(
      fs.pathExists(path.join(TEMPLATE_DIR, "DESIGN.md")),
    ).resolves.toBe(true);
    await expect(
      fs.pathExists(path.join(TEMPLATE_DIR, "CLAUDE.md")),
    ).resolves.toBe(false);

    const webLayout = await fs.readFile(
      path.join(TEMPLATE_DIR, "apps/web/src/app/layout.tsx"),
      "utf-8",
    );
    expect(webLayout).toContain('import "@repo/ui/globals.css"');
    expect(webLayout).not.toContain("theme.css");
    await expect(
      fs.pathExists(path.join(TEMPLATE_DIR, "apps/web/src/styles/theme.css")),
    ).resolves.toBe(false);
  });

  it("ships only the sidebar app layout", async () => {
    const authenticatedDir = path.join(
      TEMPLATE_DIR,
      "apps/app/src/app/(authenticated)",
    );

    await expect(
      fs.pathExists(path.join(authenticatedDir, "(sidebar)")),
    ).resolves.toBe(true);
    await expect(
      fs.pathExists(path.join(authenticatedDir, "(standard)")),
    ).resolves.toBe(false);
    await expect(
      fs.pathExists(path.join(TEMPLATE_DIR, "apps/app/src/domains/standard")),
    ).resolves.toBe(false);
  });

  it("keeps reference-backed navigation routes using shared UI patterns", async () => {
    const sidebar = await fs.readFile(
      path.join(TEMPLATE_DIR, "apps/app/src/domains/sidebar/components/app-sidebar.tsx"),
      "utf-8",
    );
    const overview = await fs.readFile(
      path.join(TEMPLATE_DIR, "apps/app/src/app/(authenticated)/(sidebar)/page.tsx"),
      "utf-8",
    );
    const activityPath = path.join(
      TEMPLATE_DIR,
      "apps/app/src/app/(authenticated)/(sidebar)/activity/page.tsx",
    );
    const sharedCard = await fs.readFile(
      path.join(TEMPLATE_DIR, "packages/ui/src/components/card.tsx"),
      "utf-8",
    );

    expect(sidebar).toContain('label="Home"');
    expect(sidebar).toContain('label="Project settings"');
    expect(sidebar).not.toContain('url: "/activity"');
    expect(sidebar).not.toContain('aria-label="Workspace mode"');
    expect(overview).not.toContain('id="activity"');
    await expect(fs.pathExists(activityPath)).resolves.toBe(false);
    for (const route of ["my-website", "requests", "actions", "settings/profile", "settings/projects", "settings/company", "settings/billing"]) {
      expect(sidebar).toContain(`url: "/${route}"`);
      await expect(fs.pathExists(path.join(
        TEMPLATE_DIR,
        "apps/app/src/app/(authenticated)/(sidebar)",
        route,
        "page.tsx",
      ))).resolves.toBe(true);
    }
    expect(sharedCard).toContain('variant?: "default" | "panel"');
  });

  it("uses the standard Base UI Button without legacy shims", async () => {
    const content = await fs.readFile(
      path.join(TEMPLATE_DIR, "packages/ui/src/components/button.tsx"),
      "utf-8",
    );

    expect(content).not.toContain("asChild");
    expect(content).not.toContain("nativeButton");
    expect(content).toContain("ButtonPrimitive.Props");
  });

  it("uses one pinned Recharts version across the app and shared UI", async () => {
    const appPackage = await fs.readJson(
      path.join(TEMPLATE_DIR, "apps/app/package.json"),
    );
    const uiPackage = await fs.readJson(
      path.join(TEMPLATE_DIR, "packages/ui/package.json"),
    );

    expect(appPackage.dependencies.recharts).toMatch(/^\d+\.\d+\.\d+$/);
    expect(appPackage.dependencies.recharts).toBe(
      uiPackage.dependencies.recharts,
    );
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
