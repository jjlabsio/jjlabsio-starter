import path from "node:path";
import { getSelectedLayoutDir } from "../config/layout-files.js";
import type { LayoutChoice } from "../config/constants.js";
import { readFile, writeFile } from "../utils/fs.js";
import { logger } from "../utils/logger.js";

export async function cleanAuthDuplication(
  projectDir: string,
  layout: LayoutChoice,
): Promise<void> {
  const layoutDir = getSelectedLayoutDir(layout);
  const layoutFile = path.join(projectDir, layoutDir, "layout.tsx");

  logger.step("Removing duplicate auth check from selected layout...");

  const content = await readFile(layoutFile);
  const transformed = transformLayout(content);
  await writeFile(layoutFile, transformed);
}

export function transformLayout(content: string): string {
  let result = content;

  // Replace the if (!session) { redirect(...) } block with a safe fallback.
  // The outer (authenticated)/layout.tsx handles the redirect; this guard
  // prevents a runtime crash in edge cases (e.g. concurrent rendering).
  result = result.replace(
    /\s*if\s*\(!session\)\s*\{[\s\S]*?redirect\([^)]*\);\s*\}\s*/,
    "\n\n  if (!session) return null;\n\n",
  );

  // Remove redirect import - handle standalone import
  result = result.replace(
    /import\s*\{([^}]*)\}\s*from\s*["']next\/navigation["'];\s*\n/,
    (_match, imports: string) => {
      const remaining = imports
        .split(",")
        .map((s: string) => s.trim())
        .filter((s: string) => s !== "" && s !== "redirect");
      if (remaining.length === 0) return "";
      return `import { ${remaining.join(", ")} } from "next/navigation";\n`;
    },
  );

  return result;
}
