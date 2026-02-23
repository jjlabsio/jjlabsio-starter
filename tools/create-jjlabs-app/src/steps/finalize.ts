import path from "node:path";
import { execSync } from "node:child_process";
import fs from "fs-extra";
import { logger } from "../utils/logger.js";

export async function finalize(projectDir: string): Promise<void> {
  await removeGitDir(projectDir);
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

async function copyEnvFile(projectDir: string): Promise<void> {
  const envExample = path.join(projectDir, ".env.example");
  const envLocal = path.join(projectDir, ".env");

  if (await fs.pathExists(envExample)) {
    logger.step("Creating .env from .env.example...");
    await fs.copy(envExample, envLocal);
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
