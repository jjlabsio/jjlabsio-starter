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

  // Remove the if (!session) { redirect(...) } block (supports nested content)
  result = result.replace(
    /\s*if\s*\(!session\)\s*\{[\s\S]*?redirect\([^)]*\);\s*\}\s*/,
    "\n\n",
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

  // Change session.user to session!.user (since auth guard already verified)
  result = result.replace(/\bsession\.user\b/g, "session!.user");

  // Add comment about auth guard
  result = result.replace(
    /(const session = await auth\.api\.getSession\(\{[\s\S]*?\}\);)\n/,
    "$1\n  // session is already verified by (authenticated)/layout.tsx\n",
  );

  return result;
}
