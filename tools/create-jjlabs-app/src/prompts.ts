import prompts from "prompts";
import type { LayoutChoice } from "./config/constants.js";
import { validateProjectName } from "./utils/validate.js";

export interface UserChoices {
  readonly projectName: string;
  readonly layout: LayoutChoice;
}

export async function getUserChoices(
  argProjectName?: string,
): Promise<UserChoices | null> {
  const onCancel = () => {
    process.exit(0);
  };

  const response = await prompts(
    [
      {
        type: argProjectName ? null : "text",
        name: "projectName",
        message: "Project name:",
        initial: "my-app",
        validate: (value: string) => {
          const result = validateProjectName(value);
          return result.valid ? true : (result.message ?? "Invalid name");
        },
      },
      {
        type: "select",
        name: "layout",
        message: "Choose a layout:",
        choices: [
          {
            title: "Sidebar",
            value: "sidebar",
            description: "Dashboard-style sidebar navigation",
          },
          {
            title: "Standard",
            value: "standard",
            description: "Header + footer layout",
          },
        ],
      },
    ],
    { onCancel },
  );

  const projectName = argProjectName ?? response.projectName;

  if (!projectName || !response.layout) {
    return null;
  }

  return {
    projectName,
    layout: response.layout as LayoutChoice,
  };
}
