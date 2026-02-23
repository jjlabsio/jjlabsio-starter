import { execFileSync } from "node:child_process";
import { TEMPLATE_REPO } from "../config/constants.js";
import { logger } from "../utils/logger.js";

export async function cloneTemplate(targetDir: string): Promise<void> {
  logger.step("Cloning template...");

  try {
    await cloneWithDegit(targetDir);
  } catch {
    logger.warn("degit failed, falling back to git clone...");
    cloneWithGit(targetDir);
  }
}

async function cloneWithDegit(targetDir: string): Promise<void> {
  const degit = (await import("degit")).default;
  const emitter = degit(TEMPLATE_REPO, { cache: false, force: true });
  await emitter.clone(targetDir);
}

function cloneWithGit(targetDir: string): void {
  execFileSync(
    "git",
    [
      "clone",
      "--depth",
      "1",
      `https://github.com/${TEMPLATE_REPO}.git`,
      targetDir,
    ],
    { stdio: "pipe" },
  );
}
