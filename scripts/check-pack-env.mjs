import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export const EXPECTED_ENV_EXAMPLES = [
  "template/apps/app/.env.example",
  "template/apps/admin/.env.example",
  "template/apps/web/.env.example",
  "template/packages/database/.env.example",
];

const GENERATED_TEMPLATE_DIRS = new Set([
  ".next",
  ".react-email",
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

export function analyzeTrackedFiles(filePaths) {
  const { forbiddenEnvFiles, forbiddenGeneratedFiles } =
    analyzePackFiles(filePaths);
  const forbiddenRootFiles = filePaths.filter(
    (filePath) =>
      [".local-preview/", "dist/", "node_modules/"].some((prefix) =>
        filePath.startsWith(prefix),
      ),
  );

  return {
    forbiddenFiles: [
      ...forbiddenEnvFiles,
      ...forbiddenGeneratedFiles,
      ...forbiddenRootFiles,
    ].sort(),
  };
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
  if (process.argv[2] === "--tracked") {
    const trackedFiles = execFileSync("git", ["ls-files", "-z"], {
      encoding: "utf8",
    })
      .split("\0")
      .filter(Boolean);
    const { forbiddenFiles } = analyzeTrackedFiles(trackedFiles);
    if (forbiddenFiles.length > 0) {
      reportFailure(
        "Generated or secret files are tracked by Git:",
        forbiddenFiles,
      );
      process.exitCode = 1;
      return;
    }
    console.log("Git tracked-file safety check passed.");
    return;
  }

  const packFilePaths = parsePackFilePaths(runPackDryRun());
  const { forbiddenEnvFiles, forbiddenGeneratedFiles, missingEnvExamples } =
    analyzePackFiles(packFilePaths);

  if (
    forbiddenEnvFiles.length > 0 ||
    forbiddenGeneratedFiles.length > 0 ||
    missingEnvExamples.length > 0
  ) {
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
