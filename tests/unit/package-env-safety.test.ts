import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  analyzePackFiles,
  findUnsafeTemplateFiles,
  parsePackFilePaths,
} from "../../scripts/check-pack-env.mjs";

describe("package env safety", () => {
  it("passes when all expected env examples are packed and no real env files are present", () => {
    const result = analyzePackFiles([
      "dist/index.js",
      "template/.env.example",
      "template/apps/app/.env.example",
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
      "template/node_modules/.pnpm/lock.yaml",
    ]);
  });

  it("reports missing expected env examples", () => {
    const result = analyzePackFiles(["dist/index.js"]);

    expect(result.missingEnvExamples).toEqual([
      "template/.env.example",
      "template/apps/app/.env.example",
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

  it("reports unsafe generated files in template source", () => {
    const originalCwd = process.cwd();
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "pack-env-"));

    try {
      process.chdir(tempDir);

      for (const filePath of [
        "template/apps/api/dist/main.js",
        "template/apps/app/.next/build-manifest.json",
        "template/apps/app/.vercel/output/config.json",
        "template/apps/app/build/server.js",
        "template/apps/app/coverage/coverage-final.json",
        "template/apps/web/out/index.html",
      ]) {
        fs.mkdirSync(path.dirname(filePath), { recursive: true });
        fs.writeFileSync(filePath, "generated");
      }

      const result = findUnsafeTemplateFiles(path.join(tempDir, "template"));
      const generatedArtifactFiles = result.generatedArtifactFiles.map(
        (filePath) => filePath.slice(filePath.indexOf("template/")),
      );

      expect({
        generatedArtifactFiles,
        realEnvFiles: result.realEnvFiles,
      }).toEqual({
        generatedArtifactFiles: [
          "template/apps/api/dist/main.js",
          "template/apps/app/.next/build-manifest.json",
          "template/apps/app/.vercel/output/config.json",
          "template/apps/app/build/server.js",
          "template/apps/app/coverage/coverage-final.json",
          "template/apps/web/out/index.html",
        ],
        realEnvFiles: [],
      });
    } finally {
      process.chdir(originalCwd);
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });
});
