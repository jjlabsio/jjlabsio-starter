import path from "node:path";
import fs from "fs-extra";
import { logger } from "../utils/logger.js";

const SERENA_PROJECT_YML = ".serena/project.yml";

export async function resetSerenaConfig(
  projectDir: string,
  projectName: string,
): Promise<void> {
  const filePath = path.join(projectDir, SERENA_PROJECT_YML);

  if (!(await fs.pathExists(filePath))) {
    return;
  }

  logger.step("Resetting Serena project config...");

  const content = await fs.readFile(filePath, "utf-8");
  const updated = content.replace(
    /^project_name:\s*".*"/m,
    `project_name: "${projectName}"`,
  );

  await fs.writeFile(filePath, updated, "utf-8");
}
