import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const [portEnvName, fallbackPort, separator, ...command] = process.argv.slice(2);

if (!portEnvName || !fallbackPort || separator !== "--" || command.length === 0) {
  console.error(
    "Usage: node scripts/run-local-port.mjs PORT_ENV_NAME FALLBACK_PORT -- command [args...]",
  );
  process.exit(1);
}

const workspaceRoot = findWorkspaceRoot(process.cwd());
loadEnvFile(path.join(workspaceRoot, ".env"));
loadEnvFile(path.join(process.cwd(), ".env"));

const port = process.env[portEnvName] || fallbackPort;
process.env.PORT = port;

const args = command.slice(1);
if (args.at(-1) === "--port") {
  args.push(port);
}

const child = spawn(command[0], args, {
  env: process.env,
  stdio: "inherit",
  shell: process.platform === "win32",
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});

function findWorkspaceRoot(startDir) {
  let currentDir = startDir;

  while (true) {
    if (fs.existsSync(path.join(currentDir, "pnpm-workspace.yaml"))) {
      return currentDir;
    }

    const parentDir = path.dirname(currentDir);
    if (parentDir === currentDir) {
      return startDir;
    }

    currentDir = parentDir;
  }
}

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  for (const line of fs.readFileSync(filePath, "utf-8").split(/\r?\n/)) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();

    process.env[key] ??= unquote(value);
  }
}

function unquote(value) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  return value;
}
