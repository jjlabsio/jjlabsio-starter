import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "fs-extra";
import { logger } from "../utils/logger.js";

// TEMPLATE_DIR resolves to tools/create-jjlabs-app/template/
// Uses fileURLToPath(import.meta.url) for ESM compatibility (no __dirname in ESM).
// Works for both dist/ (built: dist/steps/ → ../../template) and
// src/steps/ (tsx dev: src/steps/ → ../../template) contexts.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
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
