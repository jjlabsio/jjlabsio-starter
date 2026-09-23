import path from "node:path";
import { copyTemplate } from "./steps/copy-template.js";
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
  readonly localPorts: AssignedLocalPorts;
}

export async function scaffold(options: ScaffoldOptions): Promise<void> {
  const { projectName } = options;
  const projectDir = path.resolve(projectName);

  logger.info(`\nCreating ${projectName}...\n`);

  await copyTemplate(projectDir);
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
