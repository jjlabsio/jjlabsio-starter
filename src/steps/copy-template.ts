import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "fs-extra";
import { logger } from "../utils/logger.js";

// TEMPLATE_DIR resolves to <repo-root>/template/
// Uses fileURLToPath(import.meta.url) for ESM compatibility (no __dirname in ESM).
// Built context: dist/index.js (single bundle) → ../template = <repo-root>/template/
// Dev context (tsx): src/steps/copy-template.ts → ../../template = <repo-root>/template/
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isBundled = __filename.endsWith("dist/index.js");
const TEMPLATE_DIR = path.resolve(
  __dirname,
  isBundled ? "../template" : "../../template",
);

const GENERATED_TEMPLATE_DIRS = new Set([
  ".next",
  ".turbo",
  "dist",
  "node_modules",
]);

function shouldCopyTemplateEntry(src: string): boolean {
  const relativePath = path.relative(TEMPLATE_DIR, src);

  if (!relativePath) {
    return true;
  }

  return !relativePath
    .split(path.sep)
    .some((segment) => GENERATED_TEMPLATE_DIRS.has(segment));
}

export async function copyTemplate(projectPath: string): Promise<void> {
  logger.step("Copying template...");

  if (!(await fs.pathExists(TEMPLATE_DIR))) {
    throw new Error(`Template directory not found: ${TEMPLATE_DIR}`);
  }

  await fs.copy(TEMPLATE_DIR, projectPath, {
    filter: shouldCopyTemplateEntry,
  });

  // Rename gitignore → .gitignore (npm strips dotfiles from published packages)
  const gitignoreSrc = path.join(projectPath, "gitignore");
  const gitignoreDest = path.join(projectPath, ".gitignore");
  if (await fs.pathExists(gitignoreSrc)) {
    await fs.move(gitignoreSrc, gitignoreDest);
  }
}
