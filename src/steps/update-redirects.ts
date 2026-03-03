import path from "node:path";
import {
  ROOT_PAGE,
  RESOLVE_CALLBACK_URL,
  CHECKOUT_ROUTE,
} from "../config/constants.js";
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
    updateResolveCallbackUrl(projectDir, targetPath),
    updateCheckoutRoute(projectDir, targetPath),
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

async function updateResolveCallbackUrl(
  projectDir: string,
  targetPath: string,
): Promise<void> {
  const filePath = path.join(projectDir, RESOLVE_CALLBACK_URL);
  const content = await readFile(filePath);
  const updated = content.replace(
    /const DEFAULT_CALLBACK_URL = ["']\/dashboard["']/,
    `const DEFAULT_CALLBACK_URL = "${targetPath}"`,
  );
  await writeFile(filePath, updated);
}

async function updateCheckoutRoute(
  projectDir: string,
  targetPath: string,
): Promise<void> {
  const filePath = path.join(projectDir, CHECKOUT_ROUTE);
  const content = await readFile(filePath);
  const updated = content.replace(
    /new URL\(["']\/dashboard["'],/,
    `new URL("${targetPath}",`,
  );
  await writeFile(filePath, updated);
}
