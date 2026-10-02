import { spawn, spawnSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const template = path.join(root, "template");
const appPort = 3999;
const postgresPort = 5599;
const projectName = "jjlabs_template_preview";
const stateDir = path.join(root, ".local-preview");
const secretPath = path.join(stateDir, "secret");
const databaseUrl = `postgresql://postgres:postgres@127.0.0.1:${postgresPort}/${projectName}?schema=public`;
const compose = fs
  .readFileSync(path.join(template, "docker-compose.yml"), "utf8")
  .replaceAll("{{LOCAL_POSTGRES_PORT}}", `127.0.0.1:${postgresPort}`)
  .replaceAll("{{PROJECT_NAME}}", projectName);
fs.mkdirSync(stateDir, { recursive: true, mode: 0o700 });
if (!fs.existsSync(secretPath)) {
  fs.writeFileSync(secretPath, randomBytes(32).toString("base64"), {
    flag: "wx",
    mode: 0o600,
  });
}

const exampleEnv = Object.fromEntries(
  fs
    .readFileSync(path.join(template, "apps/app/.env.example"), "utf8")
    .split("\n")
    .map((line) => line.match(/^([A-Z0-9_]+)=(.*)$/))
    .filter(Boolean)
    .map((match) => [match[1], match[2].replace(/^"|"$/g, "")]),
);
const previewEnv = {
  ...process.env,
  ...exampleEnv,
  NODE_ENV: "development",
  NEXT_PUBLIC_WEB_URL: "http://localhost:4000",
  DATABASE_URL: databaseUrl,
  DIRECT_URL: databaseUrl,
  BETTER_AUTH_URL: `http://localhost:${appPort}`,
  BETTER_AUTH_SECRET: fs.readFileSync(secretPath, "utf8"),
};
delete previewEnv.SKIP_ENV_VALIDATION;

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd ?? root,
    env: options.env ?? previewEnv,
    input: options.input,
    stdio: options.input ? ["pipe", "inherit", "inherit"] : "inherit",
    encoding: "utf8",
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(" ")} failed`);
  }
}

async function waitForDatabase() {
  for (let attempt = 0; attempt < 60; attempt++) {
    const result = spawnSync(
      "docker",
      [
        "compose",
        "-f",
        "-",
        "-p",
        "jjlabs-template-preview",
        "exec",
        "-T",
        "postgres",
        "pg_isready",
        "-U",
        "postgres",
      ],
      {
        cwd: root,
        input: compose,
        encoding: "utf8",
        stdio: ["pipe", "ignore", "ignore"],
      },
    );
    if (result.status === 0) return;
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error("Local preview PostgreSQL did not become ready.");
}

async function main() {
  if (!fs.existsSync(path.join(template, "node_modules"))) {
    run("pnpm", ["install", "--frozen-lockfile"], { cwd: template });
  }

  run(
    "docker",
    ["compose", "-f", "-", "-p", "jjlabs-template-preview", "up", "-d"],
    {
      input: compose,
    },
  );
  await waitForDatabase();
  run("pnpm", ["--filter", "@repo/database", "build"], { cwd: template });
  run("pnpm", ["--filter", "@repo/database", "db:push"], {
    cwd: template,
  });

  console.log(`\nTemplate app: http://localhost:${appPort}/sign-in\n`);
  const app = spawn(
    "pnpm",
    [
      "--filter",
      "app",
      "exec",
      "next",
      "dev",
      "--hostname",
      "localhost",
      "--port",
      String(appPort),
    ],
    { cwd: template, env: previewEnv, stdio: "inherit" },
  );
  app.on("error", (error) => {
    console.error(error);
    process.exitCode = 1;
  });
  app.on("exit", (code) => {
    process.exitCode = code ?? 1;
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
