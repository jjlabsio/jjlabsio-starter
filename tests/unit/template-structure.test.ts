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
});
