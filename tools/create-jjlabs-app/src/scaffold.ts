import path from "node:path";
import type { LayoutChoice } from "./config/constants.js";
import { cloneTemplate } from "./steps/clone.js";
import { cleanLayout } from "./steps/clean-layout.js";
import { cleanAuthDuplication } from "./steps/clean-auth-duplication.js";
import { updateRedirects } from "./steps/update-redirects.js";
import { updatePackageNames } from "./steps/update-package-names.js";
import { resetSerenaConfig } from "./steps/reset-serena-config.js";
import { finalize } from "./steps/finalize.js";
import { logger } from "./utils/logger.js";

interface ScaffoldOptions {
  readonly projectName: string;
  readonly layout: LayoutChoice;
}

export async function scaffold(options: ScaffoldOptions): Promise<void> {
  const { projectName, layout } = options;
  const projectDir = path.resolve(projectName);

  logger.info(`\nCreating ${projectName} with ${layout} layout...\n`);

  await cloneTemplate(projectDir);
  await cleanLayout(projectDir, layout);
  await cleanAuthDuplication(projectDir, layout);
  await updateRedirects(projectDir, layout);
  await updatePackageNames(projectDir, projectName);
  await resetSerenaConfig(projectDir, projectName);
  await finalize(projectDir);

  logger.success(`\nProject "${projectName}" created successfully!\n`);
  logger.info("Next steps:");
  logger.info(`  cd ${projectName}`);
  logger.info("  # Update .env with your credentials");
  logger.info("  pnpm dev\n");
}
