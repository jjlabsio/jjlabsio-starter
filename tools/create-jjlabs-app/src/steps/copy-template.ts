import path from "path";
import fs from "fs-extra";
import { logger } from "../utils/logger.js";

// TEMPLATE_DIR resolves to tools/create-jjlabs-app/template/
// Works for both dist/ (built) and src/steps/ (tsx dev) contexts:
// - In built: __dirname = dist/, so ../../template
// - In tsx dev: __dirname = src/steps/, so ../../template (same relative path works)
const TEMPLATE_DIR = path.resolve(__dirname, "../../template");

export async function copyTemplate(projectPath: string): Promise<void> {
  logger.step("Copying template...");

  if (!(await fs.pathExists(TEMPLATE_DIR))) {
    throw new Error(`Template directory not found: ${TEMPLATE_DIR}`);
  }

  await fs.copy(TEMPLATE_DIR, projectPath);

  // Rename gitignore → .gitignore (npm strips dotfiles from published packages)
  const gitignoreSrc = path.join(projectPath, "gitignore");
  const gitignoreDest = path.join(projectPath, ".gitignore");
  if (await fs.pathExists(gitignoreSrc)) {
    await fs.move(gitignoreSrc, gitignoreDest);
  }
}
