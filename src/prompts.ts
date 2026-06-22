import path from "node:path";
import prompts from "prompts";
import type { LayoutChoice } from "./config/constants.js";
import {
  type AssignedLocalPorts,
  type LocalPortOptions,
  previewLocalPorts,
} from "./steps/assign-local-ports.js";
import { validateProjectName } from "./utils/validate.js";

export interface UserChoices {
  readonly projectName: string;
  readonly layout: LayoutChoice;
  readonly localPorts: AssignedLocalPorts;
}

export async function getUserChoices(
  argProjectName?: string,
  portOptions: LocalPortOptions = {},
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

  const localPorts = await confirmLocalPorts(projectName, portOptions, onCancel);

  if (!localPorts) {
    return null;
  }

  return {
    projectName,
    layout: response.layout as LayoutChoice,
    localPorts,
  };
}

async function confirmLocalPorts(
  projectName: string,
  portOptions: LocalPortOptions,
  onCancel: () => void,
): Promise<AssignedLocalPorts | null> {
  const projectDir = path.resolve(projectName);
  let selected = await previewLocalPorts(projectDir, portOptions);

  while (true) {
    const response = await prompts(
      {
        type: "select",
        name: "portAction",
        message: formatPortPreview(selected),
        choices: [
          {
            title: "Use these ports",
            value: "accept",
          },
          {
            title: "Show another available set",
            value: "another",
          },
          {
            title: "Cancel",
            value: "cancel",
          },
        ],
      },
      { onCancel },
    );

    if (response.portAction === "accept") {
      return selected;
    }

    if (response.portAction === "another") {
      selected = await previewLocalPorts(
        projectDir,
        portOptions,
        selected.portSet,
      );
      continue;
    }

    return null;
  }
}

function formatPortPreview(selected: AssignedLocalPorts): string {
  return [
    "Use this local development port set?",
    `app ${selected.ports.app}`,
    `web ${selected.ports.web}`,
    `api ${selected.ports.api}`,
    `worker ${selected.ports.worker}`,
    `postgres ${selected.ports.postgres}`,
  ].join(" ");
}
