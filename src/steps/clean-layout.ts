import path from "node:path";
import { getDirsToRemove } from "../config/layout-files.js";
import type { LayoutChoice } from "../config/constants.js";
import { removeDir } from "../utils/fs.js";
import { logger } from "../utils/logger.js";

export async function cleanLayout(
  projectDir: string,
  layout: LayoutChoice,
): Promise<void> {
  const { routeGroupDir, domainDir } = getDirsToRemove(layout);
  const unused = layout === "sidebar" ? "standard" : "sidebar";

  logger.step(`Removing unused ${unused} layout files...`);

  await Promise.all([
    removeDir(path.join(projectDir, routeGroupDir)),
    removeDir(path.join(projectDir, domainDir)),
  ]);
}
