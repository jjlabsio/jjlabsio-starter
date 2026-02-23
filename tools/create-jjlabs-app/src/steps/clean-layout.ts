import path from "node:path";
import { getFilesToRemove } from "../config/layout-files.js";
import type { LayoutChoice } from "../config/constants.js";
import { removeDir, removeFile } from "../utils/fs.js";
import { logger } from "../utils/logger.js";

export async function cleanLayout(
  projectDir: string,
  layout: LayoutChoice,
): Promise<void> {
  const filesToRemove = getFilesToRemove(layout);

  logger.step(
    `Removing unused ${layout === "sidebar" ? "standard" : "sidebar"} layout files...`,
  );

  await removeDir(path.join(projectDir, filesToRemove.routeGroupDir));

  await Promise.all(
    filesToRemove.components.map((component) =>
      removeFile(path.join(projectDir, component)),
    ),
  );
}
