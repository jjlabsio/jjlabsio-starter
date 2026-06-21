import { describe, expect, it } from "vitest";
import path from "node:path";
import os from "node:os";
import fs from "fs-extra";
import { substituteProjectName } from "../../src/steps/substitute-project-name.js";

describe("substituteProjectName", () => {
  it("replaces project placeholders in generated product docs", async () => {
    const projectDir = await fs.mkdtemp(
      path.join(os.tmpdir(), "substitute-project-name-"),
    );

    try {
      const productDir = path.join(projectDir, "docs/product");
      await fs.ensureDir(productDir);
      await fs.writeFile(
        path.join(productDir, "index.md"),
        "# Product\n\nProduct context for `{{PROJECT_NAME}}`.\n",
      );
      await fs.writeFile(
        path.join(productDir, "product-brief.md"),
        "# Product Brief\n\n`{{PROJECT_NAME}}` is a new product.\n",
      );

      await substituteProjectName(projectDir, "my-app");

      await expect(
        fs.readFile(path.join(productDir, "index.md"), "utf-8"),
      ).resolves.toContain("my-app");
      await expect(
        fs.readFile(path.join(productDir, "product-brief.md"), "utf-8"),
      ).resolves.toContain("my-app");
    } finally {
      await fs.remove(projectDir);
    }
  });
});
