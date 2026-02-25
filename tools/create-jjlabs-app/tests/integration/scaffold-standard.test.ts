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

describe("scaffold: standard layout", () => {
  let projectDir: string;

  beforeEach(async () => {
    projectDir = path.join(os.tmpdir(), `test-standard-${Date.now()}`);
    await fs.copy(FIXTURE_DIR, projectDir);
  });

  afterEach(async () => {
    await fs.remove(projectDir);
  });

  it("removes sidebar route group directory", async () => {
    await cleanLayout(projectDir, "standard");

    const sidebarDir = path.join(
      projectDir,
      "apps/app/src/app/(authenticated)/(sidebar)",
    );
    expect(await fs.pathExists(sidebarDir)).toBe(false);
  });

  it("preserves standard route group", async () => {
    await cleanLayout(projectDir, "standard");

    const standardDir = path.join(
      projectDir,
      "apps/app/src/app/(authenticated)/(standard)",
    );
    expect(await fs.pathExists(standardDir)).toBe(true);

    const homePage = path.join(standardDir, "home/page.tsx");
    expect(await fs.pathExists(homePage)).toBe(true);

    const aboutPage = path.join(standardDir, "about/page.tsx");
    expect(await fs.pathExists(aboutPage)).toBe(true);
  });

  it("removes sidebar-specific components", async () => {
    await cleanLayout(projectDir, "standard");

    const componentsDir = path.join(projectDir, "apps/app/src/components");
    expect(
      await fs.pathExists(path.join(componentsDir, "app-sidebar.tsx")),
    ).toBe(false);
    expect(await fs.pathExists(path.join(componentsDir, "nav-main.tsx"))).toBe(
      false,
    );
    expect(
      await fs.pathExists(path.join(componentsDir, "nav-secondary.tsx")),
    ).toBe(false);
    expect(await fs.pathExists(path.join(componentsDir, "nav-user.tsx"))).toBe(
      false,
    );
    expect(
      await fs.pathExists(path.join(componentsDir, "nav-documents.tsx")),
    ).toBe(false);
    expect(
      await fs.pathExists(path.join(componentsDir, "site-header.tsx")),
    ).toBe(false);
    expect(
      await fs.pathExists(path.join(componentsDir, "page-container.tsx")),
    ).toBe(false);
    expect(
      await fs.pathExists(path.join(componentsDir, "section-cards.tsx")),
    ).toBe(false);
    expect(
      await fs.pathExists(
        path.join(componentsDir, "chart-area-interactive.tsx"),
      ),
    ).toBe(false);
  });

  it("preserves standard-specific components", async () => {
    await cleanLayout(projectDir, "standard");

    const componentsDir = path.join(projectDir, "apps/app/src/components");
    expect(
      await fs.pathExists(path.join(componentsDir, "app-header.tsx")),
    ).toBe(true);
    expect(
      await fs.pathExists(path.join(componentsDir, "app-footer.tsx")),
    ).toBe(true);
    expect(
      await fs.pathExists(path.join(componentsDir, "mobile-nav.tsx")),
    ).toBe(true);
    expect(await fs.pathExists(path.join(componentsDir, "user-menu.tsx"))).toBe(
      true,
    );
  });

  it("removes auth check from standard layout", async () => {
    await cleanAuthDuplication(projectDir, "standard");

    const layoutPath = path.join(
      projectDir,
      "apps/app/src/app/(authenticated)/(standard)/layout.tsx",
    );
    const content = await fs.readFile(layoutPath, "utf-8");

    expect(content).not.toContain("if (!session)");
    expect(content).not.toContain('redirect("/sign-in")');
    expect(content).not.toContain("import { redirect }");
    expect(content).toContain("session!.user");
    expect(content).toContain("auth.api.getSession");
  });

  it("updates redirect paths to /home", async () => {
    await updateRedirects(projectDir, "standard");

    const rootPage = await fs.readFile(
      path.join(projectDir, "apps/app/src/app/page.tsx"),
      "utf-8",
    );
    expect(rootPage).toContain('redirect("/home")');
    expect(rootPage).not.toContain('redirect("/dashboard")');

    const signInPage = await fs.readFile(
      path.join(projectDir, "apps/app/src/app/(public)/sign-in/page.tsx"),
      "utf-8",
    );
    expect(signInPage).toContain('callbackURL: "/home"');
    expect(signInPage).not.toContain('callbackURL: "/dashboard"');
  });

  it("resets serena project name", async () => {
    await resetSerenaConfig(projectDir, "my-standard-app");

    const content = await fs.readFile(
      path.join(projectDir, ".serena/project.yml"),
      "utf-8",
    );
    expect(content).toContain('project_name: "my-standard-app"');
    expect(content).not.toContain("jjlabsio-starter");
  });

  it("runs full standard scaffold pipeline correctly", async () => {
    await cleanLayout(projectDir, "standard");
    await cleanAuthDuplication(projectDir, "standard");
    await updateRedirects(projectDir, "standard");
    await updatePackageNames(projectDir, "my-standard-app");
    await resetSerenaConfig(projectDir, "my-standard-app");

    // Sidebar gone
    expect(
      await fs.pathExists(
        path.join(projectDir, "apps/app/src/app/(authenticated)/(sidebar)"),
      ),
    ).toBe(false);

    // Standard present and clean
    const standardLayout = await fs.readFile(
      path.join(
        projectDir,
        "apps/app/src/app/(authenticated)/(standard)/layout.tsx",
      ),
      "utf-8",
    );
    expect(standardLayout).not.toContain("redirect");
    expect(standardLayout).toContain("session!.user");

    // Auth guard intact
    const authLayout = await fs.readFile(
      path.join(projectDir, "apps/app/src/app/(authenticated)/layout.tsx"),
      "utf-8",
    );
    expect(authLayout).toContain("redirect");

    // Redirects updated
    const rootPage = await fs.readFile(
      path.join(projectDir, "apps/app/src/app/page.tsx"),
      "utf-8",
    );
    expect(rootPage).toContain('redirect("/home")');

    // Package names updated
    const rootPkg = await fs.readJson(path.join(projectDir, "package.json"));
    expect(rootPkg.name).toBe("my-standard-app");

    // Serena config updated
    const serenaConfig = await fs.readFile(
      path.join(projectDir, ".serena/project.yml"),
      "utf-8",
    );
    expect(serenaConfig).toContain('project_name: "my-standard-app"');
  });
});
