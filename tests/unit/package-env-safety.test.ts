import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  analyzePackFiles,
  analyzeTrackedFiles,
  parsePackFilePaths,
} from "../../scripts/check-pack-env.mjs";

describe("package env safety", () => {
  it("keeps env examples but excludes local env and generated files from the real npm manifest", () => {
    const probeDir = fs.mkdtempSync(path.join(os.tmpdir(), "jjlabs-pack-probe-"));

    try {
      fs.writeFileSync(
        path.join(probeDir, "package.json"),
        JSON.stringify({
          name: "jjlabs-pack-probe",
          version: "1.0.0",
          files: ["template"],
        }),
      );
      const templateDir = path.join(probeDir, "template");
      const webDir = path.join(templateDir, "apps/web");
      fs.mkdirSync(path.join(webDir, ".next"), { recursive: true });
      fs.copyFileSync(
        new URL("../../template/.npmignore", import.meta.url),
        path.join(templateDir, ".npmignore"),
      );
      fs.writeFileSync(path.join(webDir, ".env.example"), "SAFE=example");
      fs.writeFileSync(path.join(webDir, ".env.local"), "SECRET=probe");
      fs.writeFileSync(path.join(webDir, ".next/probe.txt"), "generated");
      const emailDir = path.join(templateDir, "packages/email/.react-email");
      fs.mkdirSync(emailDir, { recursive: true });
      fs.writeFileSync(path.join(emailDir, "probe.txt"), "generated");

      const files = parsePackFilePaths(
        execFileSync("npm", ["pack", "--dry-run", "--json", "--ignore-scripts"], {
          cwd: probeDir,
          encoding: "utf8",
        }),
      );

      expect(files).toContain("template/apps/web/.env.example");
      expect(files).not.toContain("template/apps/web/.env.local");
      expect(files).not.toContain("template/apps/web/.next/probe.txt");
      expect(files).not.toContain("template/packages/email/.react-email/probe.txt");
    } finally {
      fs.rmSync(probeDir, { recursive: true, force: true });
    }
  });

  it("declares repository metadata required by npm provenance", () => {
    const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));

    expect(pkg.repository).toEqual({
      type: "git",
      url: "git+https://github.com/jjlabsio/jjlabsio-starter.git",
    });
  });

  it("passes when all expected env examples are packed and no real env files are present", () => {
    const result = analyzePackFiles([
      "dist/index.js",
      "template/apps/app/.env.example",
      "template/apps/admin/.env.example",
      "template/apps/web/.env.example",
      "template/packages/database/.env.example",
    ]);

    expect(result).toEqual({
      forbiddenEnvFiles: [],
      forbiddenGeneratedFiles: [],
      missingEnvExamples: [],
    });
  });

  it("reports packed real env files", () => {
    const result = analyzePackFiles([
      "template/apps/app/.env.example",
      "template/apps/app/.env.local",
      "template/packages/database/.env.production",
    ]);

    expect(result.forbiddenEnvFiles).toEqual([
      "template/apps/app/.env.local",
      "template/packages/database/.env.production",
    ]);
  });

  it("reports packed generated template artifacts", () => {
    const result = analyzePackFiles([
      "dist/index.js",
      "template/apps/api/dist/main.js",
      "template/apps/app/.next/build-manifest.json",
      "template/apps/app/.vercel/output/config.json",
      "template/apps/app/build/server.js",
      "template/apps/app/coverage/coverage-final.json",
      "template/apps/web/out/index.html",
      "template/apps/web/.turbo/turbo-build.log",
      "template/packages/email/.react-email/index.html",
      "template/node_modules/.pnpm/lock.yaml",
    ]);

    expect(result.forbiddenGeneratedFiles).toEqual([
      "template/apps/api/dist/main.js",
      "template/apps/app/.next/build-manifest.json",
      "template/apps/app/.vercel/output/config.json",
      "template/apps/app/build/server.js",
      "template/apps/app/coverage/coverage-final.json",
      "template/apps/web/out/index.html",
      "template/apps/web/.turbo/turbo-build.log",
      "template/packages/email/.react-email/index.html",
      "template/node_modules/.pnpm/lock.yaml",
    ]);
  });

  it("reports missing expected env examples", () => {
    const result = analyzePackFiles(["dist/index.js"]);

    expect(result.missingEnvExamples).toEqual([
      "template/apps/app/.env.example",
      "template/apps/admin/.env.example",
      "template/apps/web/.env.example",
      "template/packages/database/.env.example",
    ]);
  });

  it("parses npm pack --json output paths", () => {
    const paths = parsePackFilePaths(
      JSON.stringify([
        {
          files: [
            { path: "dist/index.js" },
            { path: "template/apps/app/.env.example" },
          ],
        },
      ]),
    );

    expect(paths).toEqual([
      "dist/index.js",
      "template/apps/app/.env.example",
    ]);
  });

  it("rejects tracked generated files without scanning local preview output", () => {
    const result = analyzeTrackedFiles([
      ".env",
      ".local-preview/secret",
      "dist/index.js",
      "template/apps/app/.env.example",
      "template/apps/app/.env.local",
      "template/apps/app/.next/BUILD_ID",
      "template/node_modules/.pnpm/lock.yaml",
    ]);

    expect(result.forbiddenFiles).toEqual([
      ".env",
      ".local-preview/secret",
      "dist/index.js",
      "template/apps/app/.env.local",
      "template/apps/app/.next/BUILD_ID",
      "template/node_modules/.pnpm/lock.yaml",
    ]);
  });
});
