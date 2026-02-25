import { describe, expect, it, beforeEach, afterEach } from "vitest";
import path from "node:path";
import os from "node:os";
import fs from "fs-extra";
import { cleanLayout } from "../../src/steps/clean-layout.js";
import { cleanAuthDuplication } from "../../src/steps/clean-auth-duplication.js";
import { updateRedirects } from "../../src/steps/update-redirects.js";
import { updatePackageNames } from "../../src/steps/update-package-names.js";
import { resetSerenaConfig } from "../../src/steps/reset-serena-config.js";

const FIXTURE_DIR = path.resolve(__dirname, "../fixtures/template");

describe("scaffold: sidebar layout", () => {
  let projectDir: string;

  beforeEach(async () => {
    projectDir = path.join(os.tmpdir(), `test-sidebar-${Date.now()}`);
    await fs.copy(FIXTURE_DIR, projectDir);
  });

  afterEach(async () => {
    await fs.remove(projectDir);
  });

  it("removes standard route group directory", async () => {
    await cleanLayout(projectDir, "sidebar");

    const standardDir = path.join(
      projectDir,
      "apps/app/src/app/(authenticated)/(standard)",
    );
    expect(await fs.pathExists(standardDir)).toBe(false);
  });

  it("preserves sidebar route group", async () => {
    await cleanLayout(projectDir, "sidebar");

    const sidebarDir = path.join(
      projectDir,
      "apps/app/src/app/(authenticated)/(sidebar)",
    );
    expect(await fs.pathExists(sidebarDir)).toBe(true);

    const dashboardPage = path.join(sidebarDir, "dashboard/page.tsx");
    expect(await fs.pathExists(dashboardPage)).toBe(true);
  });

  it("removes standard-specific components", async () => {
    await cleanLayout(projectDir, "sidebar");

    const componentsDir = path.join(projectDir, "apps/app/src/components");
    expect(
      await fs.pathExists(path.join(componentsDir, "app-header.tsx")),
    ).toBe(false);
    expect(
      await fs.pathExists(path.join(componentsDir, "app-footer.tsx")),
    ).toBe(false);
    expect(
      await fs.pathExists(path.join(componentsDir, "mobile-nav.tsx")),
    ).toBe(false);
    expect(await fs.pathExists(path.join(componentsDir, "user-menu.tsx"))).toBe(
      false,
    );
  });

  it("preserves sidebar-specific components", async () => {
    await cleanLayout(projectDir, "sidebar");

    const componentsDir = path.join(projectDir, "apps/app/src/components");
    expect(
      await fs.pathExists(path.join(componentsDir, "app-sidebar.tsx")),
    ).toBe(true);
    expect(await fs.pathExists(path.join(componentsDir, "nav-main.tsx"))).toBe(
      true,
    );
    expect(await fs.pathExists(path.join(componentsDir, "nav-user.tsx"))).toBe(
      true,
    );
  });

  it("preserves shared components", async () => {
    await cleanLayout(projectDir, "sidebar");

    const componentsDir = path.join(projectDir, "apps/app/src/components");
    expect(await fs.pathExists(path.join(componentsDir, "providers.tsx"))).toBe(
      true,
    );
    expect(
      await fs.pathExists(path.join(componentsDir, "theme-toggle.tsx")),
    ).toBe(true);
  });

  it("removes auth check from sidebar layout", async () => {
    await cleanAuthDuplication(projectDir, "sidebar");

    const layoutPath = path.join(
      projectDir,
      "apps/app/src/app/(authenticated)/(sidebar)/layout.tsx",
    );
    const content = await fs.readFile(layoutPath, "utf-8");

    expect(content).not.toContain("if (!session)");
    expect(content).not.toContain('redirect("/sign-in")');
    expect(content).not.toContain("import { redirect }");
    expect(content).toContain("session!.user");
    expect(content).toContain("auth.api.getSession");
  });

  it("preserves authenticated layout auth guard", async () => {
    await cleanAuthDuplication(projectDir, "sidebar");

    const authLayoutPath = path.join(
      projectDir,
      "apps/app/src/app/(authenticated)/layout.tsx",
    );
    const content = await fs.readFile(authLayoutPath, "utf-8");

    expect(content).toContain("if (!session)");
    expect(content).toContain("redirect");
  });

  it("keeps redirect paths unchanged for sidebar", async () => {
    await updateRedirects(projectDir, "sidebar");

    const rootPage = await fs.readFile(
      path.join(projectDir, "apps/app/src/app/page.tsx"),
      "utf-8",
    );
    expect(rootPage).toContain('redirect("/dashboard")');

    const signInPage = await fs.readFile(
      path.join(projectDir, "apps/app/src/app/(public)/sign-in/page.tsx"),
      "utf-8",
    );
    expect(signInPage).toContain('callbackURL: "/dashboard"');
  });

  it("updates package names", async () => {
    await updatePackageNames(projectDir, "my-sidebar-app");

    const rootPkg = await fs.readJson(path.join(projectDir, "package.json"));
    expect(rootPkg.name).toBe("my-sidebar-app");

    const appPkg = await fs.readJson(
      path.join(projectDir, "apps/app/package.json"),
    );
    expect(appPkg.name).toBe("@my-sidebar-app/app");
  });

  it("resets serena project name", async () => {
    await resetSerenaConfig(projectDir, "my-sidebar-app");

    const content = await fs.readFile(
      path.join(projectDir, ".serena/project.yml"),
      "utf-8",
    );
    expect(content).toContain('project_name: "my-sidebar-app"');
    expect(content).not.toContain("jjlabsio-starter");
  });

  it("runs full sidebar scaffold pipeline correctly", async () => {
    await cleanLayout(projectDir, "sidebar");
    await cleanAuthDuplication(projectDir, "sidebar");
    await updateRedirects(projectDir, "sidebar");
    await updatePackageNames(projectDir, "my-sidebar-app");
    await resetSerenaConfig(projectDir, "my-sidebar-app");

    // Standard gone
    expect(
      await fs.pathExists(
        path.join(projectDir, "apps/app/src/app/(authenticated)/(standard)"),
      ),
    ).toBe(false);

    // Sidebar present and clean
    const sidebarLayout = await fs.readFile(
      path.join(
        projectDir,
        "apps/app/src/app/(authenticated)/(sidebar)/layout.tsx",
      ),
      "utf-8",
    );
    expect(sidebarLayout).not.toContain("redirect");
    expect(sidebarLayout).toContain("session!.user");

    // Auth guard intact
    const authLayout = await fs.readFile(
      path.join(projectDir, "apps/app/src/app/(authenticated)/layout.tsx"),
      "utf-8",
    );
    expect(authLayout).toContain("redirect");

    // Redirects unchanged
    const rootPage = await fs.readFile(
      path.join(projectDir, "apps/app/src/app/page.tsx"),
      "utf-8",
    );
    expect(rootPage).toContain('redirect("/dashboard")');

    // Serena config updated
    const serenaConfig = await fs.readFile(
      path.join(projectDir, ".serena/project.yml"),
      "utf-8",
    );
    expect(serenaConfig).toContain('project_name: "my-sidebar-app"');
  });
});
