import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const PROJECT_NAME = "test-project";
const API_PORT = 4312;
const PROJECT_DIR = path.join(process.cwd(), PROJECT_NAME);
const STATE_HOME_DIR = path.join(process.cwd(), ".tmp-e2e-home");

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd ?? process.cwd(),
    env: options.env ?? process.env,
    input: options.input,
    stdio: options.input ? ["pipe", "inherit", "inherit"] : "inherit",
    encoding: "utf8",
  });

  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(" ")} failed`);
  }

  return result;
}

function assertFile(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Expected file to exist: ${filePath}`);
  }
}

function assertMatchingFiles(leftPath, rightPath) {
  assertFile(leftPath);
  assertFile(rightPath);

  if (fs.readFileSync(leftPath, "utf8") !== fs.readFileSync(rightPath, "utf8")) {
    throw new Error(`Expected files to match: ${leftPath} and ${rightPath}`);
  }
}

function assertGeneratedEnvFiles() {
  for (const envExampleRelPath of [
    ".env.example",
    "apps/app/.env.example",
    "apps/web/.env.example",
    "packages/database/.env.example",
  ]) {
    const envExamplePath = path.join(PROJECT_DIR, envExampleRelPath);
    const envPath = path.join(
      PROJECT_DIR,
      envExampleRelPath.replace(".env.example", ".env"),
    );

    assertMatchingFiles(envExamplePath, envPath);
  }
}

function assertGeneratedPorts() {
  const rootEnvPath = path.join(PROJECT_DIR, ".env");
  const appEnvPath = path.join(PROJECT_DIR, "apps/app/.env");
  const registryPath = path.join(
    STATE_HOME_DIR,
    ".jjlabsio-starter",
    "ports.json",
  );

  const rootEnv = fs.readFileSync(rootEnvPath, "utf8");
  const appEnv = fs.readFileSync(appEnvPath, "utf8");
  const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
  const portSet = registry.projects[PROJECT_DIR]?.portSet;
  const appPort = 3000 + portSet * 100;

  if (!Number.isInteger(portSet)) {
    throw new Error("Expected local port registry to record generated project");
  }

  if (!rootEnv.includes(`LOCAL_APP_PORT=${appPort}`)) {
    throw new Error("Expected generated root .env to include LOCAL_APP_PORT");
  }

  if (!appEnv.includes(`BETTER_AUTH_URL=\"http://localhost:${appPort}\"`)) {
    throw new Error("Expected generated app .env to include selected app port");
  }
}

async function waitForHealth(url, timeoutMs = 15_000) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(url);
      const body = await response.json();

      if (response.ok && body.status === "ok") {
        return;
      }
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
  }

  throw new Error(`Timed out waiting for ${url}`);
}

async function assertApiRuntime() {
  const api = spawn("pnpm", ["--filter", "api", "start"], {
    cwd: PROJECT_DIR,
    env: {
      ...process.env,
      PORT: String(API_PORT),
    },
    stdio: "inherit",
  });

  try {
    await waitForHealth(`http://127.0.0.1:${API_PORT}/health`);
  } finally {
    api.kill("SIGINT");
  }
}

async function main() {
  fs.rmSync(PROJECT_DIR, { recursive: true, force: true });
  fs.rmSync(STATE_HOME_DIR, { recursive: true, force: true });

  run("pnpm", ["build"]);
  run("node", ["dist/index.js", PROJECT_NAME], {
    env: {
      ...process.env,
      JJLABSIO_STARTER_HOME: STATE_HOME_DIR,
    },
    input: "\n",
  });

  assertGeneratedEnvFiles();
  assertGeneratedPorts();

  run("pnpm", ["typecheck"], { cwd: PROJECT_DIR });
  run("pnpm", ["test"], { cwd: PROJECT_DIR });
  run("pnpm", ["build"], { cwd: PROJECT_DIR });
  await assertApiRuntime();

  fs.rmSync(PROJECT_DIR, { recursive: true, force: true });
  fs.rmSync(STATE_HOME_DIR, { recursive: true, force: true });
  console.log("e2e smoke test passed.");
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
