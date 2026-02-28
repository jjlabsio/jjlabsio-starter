import path from "node:path";
import { execSync } from "node:child_process";
import fs from "fs-extra";
import { logger } from "../utils/logger.js";

export async function finalize(projectDir: string): Promise<void> {
  await removeGitDir(projectDir);
  await removeToolsDir(projectDir);
  await copyEnvFile(projectDir);
  await installDependencies(projectDir);
}

async function removeGitDir(projectDir: string): Promise<void> {
  const gitDir = path.join(projectDir, ".git");

  if (await fs.pathExists(gitDir)) {
    logger.step("Removing .git directory...");
    await fs.remove(gitDir);
  }
}

async function removeToolsDir(projectDir: string): Promise<void> {
  const toolsDir = path.join(projectDir, "tools");

  if (await fs.pathExists(toolsDir)) {
    logger.step("Removing tools directory...");
    await fs.remove(toolsDir);
  }
}

const ENV_EXAMPLE_PATHS = [
  "apps/app/.env.example",
  "packages/database/.env.example",
];

async function copyEnvFile(projectDir: string): Promise<void> {
  logger.step("Creating .env files from .env.example...");

  for (const envExampleRelPath of ENV_EXAMPLE_PATHS) {
    const envExample = path.join(projectDir, envExampleRelPath);
    const envLocal = path.join(
      projectDir,
      envExampleRelPath.replace(".env.example", ".env"),
    );

    if (await fs.pathExists(envExample)) {
      await fs.copy(envExample, envLocal);
    }
  }
}

async function installDependencies(projectDir: string): Promise<void> {
  logger.step("Installing dependencies...");

  try {
    execSync("pnpm install", {
      cwd: projectDir,
      stdio: "inherit",
    });
  } catch {
    logger.warn("Failed to install dependencies. Run 'pnpm install' manually.");
  }
}
