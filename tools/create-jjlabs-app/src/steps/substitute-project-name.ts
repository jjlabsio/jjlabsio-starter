import path from "node:path";
import fs from "fs-extra";
import { logger } from "../utils/logger.js";

const TARGET_FILES = [
  "README.md",
  "CLAUDE.md",
  "apps/app/.env.example",
  "packages/database/.env.example",
  "docker-compose.yml",
];

export async function substituteProjectName(
  projectDir: string,
  projectName: string,
): Promise<void> {
  logger.step("Substituting project name...");

  await Promise.all(
    TARGET_FILES.map(async (relativePath) => {
      const filePath = path.join(projectDir, relativePath);

      if (!(await fs.pathExists(filePath))) {
        return;
      }

      const content = await fs.readFile(filePath, "utf-8");
      const updated = content.replaceAll("{{PROJECT_NAME}}", projectName);

      if (content !== updated) {
        await fs.writeFile(filePath, updated, "utf-8");
      }
    }),
  );
}
