import path from "node:path";
import type { LayoutChoice } from "./config/constants.js";
import { copyTemplate } from "./steps/copy-template.js";
import { cleanLayout } from "./steps/clean-layout.js";
import { cleanAuthDuplication } from "./steps/clean-auth-duplication.js";
import { updatePackageNames } from "./steps/update-package-names.js";
import { substituteProjectName } from "./steps/substitute-project-name.js";
import {
  type AssignedLocalPorts,
  assignLocalPorts,
} from "./steps/assign-local-ports.js";
import { finalize } from "./steps/finalize.js";
import { logger } from "./utils/logger.js";

interface ScaffoldOptions {
  readonly projectName: string;
  readonly layout: LayoutChoice;
  readonly localPorts: AssignedLocalPorts;
}

export async function scaffold(options: ScaffoldOptions): Promise<void> {
  const { projectName, layout } = options;
  const projectDir = path.resolve(projectName);

  logger.info(`\nCreating ${projectName} with ${layout} layout...\n`);

  await copyTemplate(projectDir);
  await cleanLayout(projectDir, layout);
  await cleanAuthDuplication(projectDir, layout);
  await updatePackageNames(projectDir, projectName);
  await substituteProjectName(projectDir, projectName);
  const localPorts = await assignLocalPorts(
    projectDir,
    projectName,
    options.localPorts,
  );
  await finalize(projectDir);

  logger.success(`\nProject "${projectName}" created successfully!\n`);
  logger.info("Local development ports:");
  logger.info(`  app:      http://localhost:${localPorts.ports.app}`);
  logger.info(`  web:      http://localhost:${localPorts.ports.web}`);
  logger.info(`  api:      http://localhost:${localPorts.ports.api}`);
  logger.info(`  worker:   http://localhost:${localPorts.ports.worker}`);
  logger.info(`  postgres: localhost:${localPorts.ports.postgres}`);
  logger.info("Next steps:");
  logger.info(`  cd ${projectName}`);
  logger.info("  # Update .env with your credentials");
  logger.info("  pnpm dev\n");
}
