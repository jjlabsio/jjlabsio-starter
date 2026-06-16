import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export const EXPECTED_ENV_EXAMPLES = [
  "template/.env.example",
  "template/apps/app/.env.example",
  "template/apps/web/.env.example",
  "template/packages/database/.env.example",
];

const GENERATED_TEMPLATE_DIRS = new Set([
  ".next",
  ".turbo",
  ".vercel",
  "build",
  "coverage",
  "dist",
  "node_modules",
  "out",
]);

export function parsePackFilePaths(packJson) {
  const packEntries = JSON.parse(packJson);
  const files = packEntries?.[0]?.files;

  if (!Array.isArray(files)) {
    throw new Error("Unexpected npm pack --json output: missing files array");
  }

  return files.map((file) => file.path).filter((filePath) => filePath);
}

export function analyzePackFiles(filePaths) {
  const forbiddenEnvFiles = filePaths.filter(
    (filePath) => isEnvFilePath(filePath) && !isEnvExamplePath(filePath),
  );
  const forbiddenGeneratedFiles = filePaths.filter(isGeneratedTemplatePath);
  const missingEnvExamples = EXPECTED_ENV_EXAMPLES.filter(
    (expectedPath) => !filePaths.includes(expectedPath),
  );

  return {
    forbiddenEnvFiles,
    forbiddenGeneratedFiles,
    missingEnvExamples,
  };
}

export function findUnsafeTemplateFiles(templateDir) {
  if (!fs.existsSync(templateDir)) {
    return {
      realEnvFiles: [],
      generatedArtifactFiles: [],
    };
  }

  const allFiles = listFiles(templateDir).map((filePath) =>
    path.relative(process.cwd(), filePath),
  );

  return {
    realEnvFiles: allFiles
      .filter((filePath) => isEnvFilePath(filePath) && !isEnvExamplePath(filePath))
      .sort(),
    generatedArtifactFiles: allFiles.filter(isGeneratedPath).sort(),
  };
}

function listFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      return listFiles(entryPath);
    }

    return entry.isFile() ? [entryPath] : [];
  });
}

function isEnvFilePath(filePath) {
  const fileName = path.posix.basename(filePath.split(path.sep).join("/"));

  return fileName === ".env" || fileName.startsWith(".env.");
}

function isEnvExamplePath(filePath) {
  return path.posix.basename(filePath.split(path.sep).join("/")).endsWith(
    ".example",
  );
}

function isGeneratedTemplatePath(filePath) {
  const normalizedPath = filePath.split(path.sep).join("/");

  return (
    normalizedPath.startsWith("template/") &&
    isGeneratedPath(normalizedPath)
  );
}

function isGeneratedPath(filePath) {
  return filePath
    .split(path.sep)
    .join("/")
    .split("/")
    .some((segment) => GENERATED_TEMPLATE_DIRS.has(segment));
}

function runPackDryRun() {
  return execFileSync("npm", ["pack", "--dry-run", "--json"], {
    encoding: "utf8",
    maxBuffer: 128 * 1024 * 1024,
    stdio: ["ignore", "pipe", "pipe"],
  });
}

function reportFailure(title, filePaths) {
  console.error(title);
  for (const filePath of filePaths) {
    console.error(`- ${filePath}`);
  }
}

export function main() {
  const { realEnvFiles, generatedArtifactFiles } = findUnsafeTemplateFiles(
    path.join(process.cwd(), "template"),
  );
  const packFilePaths = parsePackFilePaths(runPackDryRun());
  const { forbiddenEnvFiles, forbiddenGeneratedFiles, missingEnvExamples } =
    analyzePackFiles(packFilePaths);

  if (
    realEnvFiles.length > 0 ||
    generatedArtifactFiles.length > 0 ||
    forbiddenEnvFiles.length > 0 ||
    forbiddenGeneratedFiles.length > 0 ||
    missingEnvExamples.length > 0
  ) {
    if (realEnvFiles.length > 0) {
      reportFailure(
        "Real env files exist under template/ and must not be published:",
        realEnvFiles,
      );
    }

    if (generatedArtifactFiles.length > 0) {
      reportFailure(
        "Generated artifacts exist under template/ and must not be published:",
        generatedArtifactFiles,
      );
    }

    if (forbiddenEnvFiles.length > 0) {
      reportFailure(
        "Real env files would be included in npm package:",
        forbiddenEnvFiles,
      );
    }

    if (forbiddenGeneratedFiles.length > 0) {
      reportFailure(
        "Generated artifacts would be included in npm package:",
        forbiddenGeneratedFiles,
      );
    }

    if (missingEnvExamples.length > 0) {
      reportFailure(
        "Expected env example files are missing from npm package:",
        missingEnvExamples,
      );
    }

    process.exitCode = 1;
    return;
  }

  console.log("npm package env safety check passed.");
}

const isDirectRun =
  process.argv[1] &&
  pathToFileURL(fileURLToPath(import.meta.url)).href ===
    pathToFileURL(process.argv[1]).href;

if (isDirectRun) {
  main();
}
