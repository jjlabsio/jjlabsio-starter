import path from "node:path";
import fs from "fs-extra";
import { logger } from "../utils/logger.js";

const PACKAGE_JSON_PATHS = ["package.json", "apps/app/package.json"];

export async function updatePackageNames(
  projectDir: string,
  projectName: string,
): Promise<void> {
  logger.step("Updating package names...");

  await Promise.all(
    PACKAGE_JSON_PATHS.map(async (relativePath) => {
      const filePath = path.join(projectDir, relativePath);

      if (!(await fs.pathExists(filePath))) {
        return;
      }

      const content = await fs.readJson(filePath);
      const updatedName =
        relativePath === "package.json" ? projectName : `@${projectName}/app`;

      const { name: _, ...rest } = content;
      await fs.writeJson(
        filePath,
        { name: updatedName, ...rest },
        { spaces: 2 },
      );
    }),
  );
}
