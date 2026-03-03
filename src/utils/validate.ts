import fs from "fs-extra";
import path from "node:path";

const VALID_NAME_REGEX = /^[a-z0-9]([a-z0-9._-]*[a-z0-9])?$/;

export function validateProjectName(name: string): {
  valid: boolean;
  message?: string;
} {
  if (!name || name.trim().length === 0) {
    return { valid: false, message: "Project name is required." };
  }

  if (!VALID_NAME_REGEX.test(name)) {
    return {
      valid: false,
      message:
        "Project name must start and end with a lowercase letter or number, and can only contain lowercase letters, numbers, hyphens, dots, and underscores.",
    };
  }

  return { valid: true };
}

export async function checkDirectoryAvailable(
  targetDir: string,
): Promise<{ available: boolean; message?: string }> {
  const resolved = path.resolve(targetDir);

  if (await fs.pathExists(resolved)) {
    return {
      available: false,
      message: `Directory "${resolved}" already exists.`,
    };
  }

  return { available: true };
}
