import path from "node:path";
import fs from "fs-extra";
import { logger } from "../utils/logger.js";

const TEMPLATES: Array<{ input: string; output: string; label: string }> = [
  { input: "README.template.md", output: "README.md", label: "README.md" },
  { input: "CLAUDE.template.md", output: "CLAUDE.md", label: "CLAUDE.md" },
];

export async function generateReadme(
  projectDir: string,
  projectName: string,
): Promise<void> {
  for (const { input, output, label } of TEMPLATES) {
    const templatePath = path.join(projectDir, input);

    if (!(await fs.pathExists(templatePath))) {
      continue;
    }

    logger.step(`Generating ${label}...`);

    const template = await fs.readFile(templatePath, "utf-8");
    const content = template.replaceAll("{{PROJECT_NAME}}", projectName);

    await fs.writeFile(path.join(projectDir, output), content, "utf-8");
    await fs.remove(templatePath);
  }
}
