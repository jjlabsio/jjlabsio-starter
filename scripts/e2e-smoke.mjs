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

function runInteractive(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: options.cwd ?? process.cwd(),
      env: options.env ?? process.env,
      stdio: ["pipe", "inherit", "inherit"],
    });

    child.once("error", reject);
    child.once("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${command} ${args.join(" ")} failed`));
    });

    for (const [index, input] of (options.inputs ?? []).entries()) {
      setTimeout(() => {
        child.stdin.write(input);

        if (index === options.inputs.length - 1) {
          child.stdin.end();
        }
      }, index * 500);
    }
  });
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
  for (const rootEnvRelPath of [".env", ".env.example"]) {
    const rootEnvPath = path.join(PROJECT_DIR, rootEnvRelPath);

    if (fs.existsSync(rootEnvPath)) {
      throw new Error(`Expected root ${rootEnvRelPath} to be absent`);
    }
  }

  for (const envExampleRelPath of [
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
  const appEnvPath = path.join(PROJECT_DIR, "apps/app/.env");
  const appPackagePath = path.join(PROJECT_DIR, "apps/app/package.json");
  const webEnvPath = path.join(PROJECT_DIR, "apps/web/.env");
  const webPackagePath = path.join(PROJECT_DIR, "apps/web/package.json");
  const databaseEnvPath = path.join(PROJECT_DIR, "packages/database/.env");
  const apiMainPath = path.join(PROJECT_DIR, "apps/api/src/main.ts");
  const dockerComposePath = path.join(PROJECT_DIR, "docker-compose.yml");
  const registryPath = path.join(
    STATE_HOME_DIR,
    ".jjlabsio-starter",
    "ports.json",
  );

  const appEnv = fs.readFileSync(appEnvPath, "utf8");
  const appPackage = fs.readFileSync(appPackagePath, "utf8");
  const webEnv = fs.readFileSync(webEnvPath, "utf8");
  const webPackage = fs.readFileSync(webPackagePath, "utf8");
  const databaseEnv = fs.readFileSync(databaseEnvPath, "utf8");
  const apiMain = fs.readFileSync(apiMainPath, "utf8");
  const dockerCompose = fs.readFileSync(dockerComposePath, "utf8");
  const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
  const portSet = registry.projects[PROJECT_DIR]?.portSet;
  const appPort = 3100 + portSet * 100;
  const webPort = 3101 + portSet * 100;
  const apiPort = 3102 + portSet * 100;
  const postgresPort = 5532 + portSet * 100;

  if (!Number.isInteger(portSet)) {
    throw new Error("Expected local port registry to record generated project");
  }

  if (!appEnv.includes(`BETTER_AUTH_URL=\"http://localhost:${appPort}\"`)) {
    throw new Error("Expected generated app .env to include selected app port");
  }

  if (!appPackage.includes(`next dev --port ${appPort}`)) {
    throw new Error("Expected generated app package scripts to include selected app port");
  }

  if (!appPackage.includes(`next start --port ${appPort}`)) {
    throw new Error("Expected generated app start script to include selected app port");
  }

  if (!webEnv.includes(`NEXT_PUBLIC_APP_URL=http://localhost:${appPort}`)) {
    throw new Error("Expected generated web .env to include selected app port");
  }

  if (!webPackage.includes(`next dev --port ${webPort}`)) {
    throw new Error("Expected generated web package scripts to include selected web port");
  }

  if (!webPackage.includes(`next start --port ${webPort}`)) {
    throw new Error("Expected generated web start script to include selected web port");
  }

  if (!databaseEnv.includes(`localhost:${postgresPort}`)) {
    throw new Error("Expected generated database .env to include selected postgres port");
  }

  if (!apiMain.includes(`const DEFAULT_PORT = ${apiPort};`)) {
    throw new Error("Expected generated API main.ts to include selected API port");
  }

  if (!dockerCompose.includes(`\"${postgresPort}:5432\"`)) {
    throw new Error("Expected docker-compose.yml to include selected postgres port");
  }
}

function assertNoStalePortRuntimeReferences() {
  const staleFiles = listFiles(PROJECT_DIR).filter((filePath) => {
    const relativePath = path.relative(PROJECT_DIR, filePath);

    if (
      relativePath.startsWith(`node_modules${path.sep}`) ||
      relativePath.startsWith(`.turbo${path.sep}`) ||
      relativePath.startsWith(`.next${path.sep}`) ||
      relativePath.startsWith(`dist${path.sep}`) ||
      relativePath.includes(`${path.sep}dist${path.sep}`)
    ) {
      return false;
    }

    const content = fs.readFileSync(filePath, "utf8");
    return content.includes("{{LOCAL_") || content.includes("run-local-port");
  });

  if (staleFiles.length > 0) {
    throw new Error(
      `Expected no stale port placeholders or runtime scripts:\n${staleFiles.join("\n")}`,
    );
  }
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
  await runInteractive("node", ["dist/index.js", PROJECT_NAME], {
    env: {
      ...process.env,
      JJLABSIO_STARTER_HOME: STATE_HOME_DIR,
    },
    inputs: ["\n", "\n"],
  });

  assertGeneratedEnvFiles();
  assertGeneratedPorts();
  assertNoStalePortRuntimeReferences();

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
