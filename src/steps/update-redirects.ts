import path from "node:path";
import { ROOT_PAGE, SIGN_IN_PAGE } from "../config/constants.js";
import type { LayoutChoice } from "../config/constants.js";
import { readFile, writeFile } from "../utils/fs.js";
import { logger } from "../utils/logger.js";

const REDIRECT_MAP: Record<LayoutChoice, string> = {
  sidebar: "/dashboard",
  standard: "/home",
};

export async function updateRedirects(
  projectDir: string,
  layout: LayoutChoice,
): Promise<void> {
  const targetPath = REDIRECT_MAP[layout];

  if (layout === "sidebar") {
    logger.step("Redirect paths already correct for sidebar layout.");
    return;
  }

  logger.step(`Updating redirect paths to "${targetPath}"...`);

  await Promise.all([
    updateRootPage(projectDir, targetPath),
    updateSignInPage(projectDir, targetPath),
  ]);
}

async function updateRootPage(
  projectDir: string,
  targetPath: string,
): Promise<void> {
  const filePath = path.join(projectDir, ROOT_PAGE);
  const content = await readFile(filePath);
  const updated = content.replace(
    /redirect\(["']\/dashboard["']\)/,
    `redirect("${targetPath}")`,
  );
  await writeFile(filePath, updated);
}

async function updateSignInPage(
  projectDir: string,
  targetPath: string,
): Promise<void> {
  const filePath = path.join(projectDir, SIGN_IN_PAGE);
  const content = await readFile(filePath);
  const updated = content.replace(
    /callbackURL:\s*["']\/dashboard["']/,
    `callbackURL: "${targetPath}"`,
  );
  await writeFile(filePath, updated);
}
