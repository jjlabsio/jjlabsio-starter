import fs from "fs-extra";

export async function removeDir(dirPath: string): Promise<void> {
  if (await fs.pathExists(dirPath)) {
    await fs.remove(dirPath);
  }
}

export async function removeFile(filePath: string): Promise<void> {
  if (await fs.pathExists(filePath)) {
    await fs.remove(filePath);
  }
}

export async function readFile(filePath: string): Promise<string> {
  return fs.readFile(filePath, "utf-8");
}

export async function writeFile(
  filePath: string,
  content: string,
): Promise<void> {
  await fs.writeFile(filePath, content, "utf-8");
}
