import { spawn } from "node:child_process";
import { randomBytes } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const state = path.join(root, ".local-preview");
fs.mkdirSync(state, { recursive: true, mode: 0o700 });
const secretPath = path.join(state, "admin-secret");
if (!fs.existsSync(secretPath)) fs.writeFileSync(secretPath, randomBytes(32).toString("base64"), { flag: "wx", mode: 0o600 });
const databaseUrl = "postgresql://postgres:postgres@127.0.0.1:5599/jjlabs_template_preview?schema=public";
const envPath = path.join(root, "template/apps/app/.env");
const adminEnvPath = path.join(root, "template/apps/admin/.env.local");
const configuredEmail = fs.existsSync(adminEnvPath) ? fs.readFileSync(adminEnvPath, "utf8").match(/^ADMIN_EMAIL="([^"]*)"$/m)?.[1] ?? "" : "";
const local = fs.existsSync(envPath) ? Object.fromEntries(fs.readFileSync(envPath, "utf8").split("\n").map(line => line.match(/^([A-Z0-9_]+)=(.*)$/)).filter(Boolean).map(match => [match[1], match[2].replace(/^"|"$/g, "")])) : {};
const child = spawn("pnpm", ["--filter", "admin", "exec", "next", "dev", "--hostname", "localhost", "--port", "4001"], {
  cwd: path.join(root, "template"), stdio: "inherit", env: { ...local, ...process.env, NEXT_PUBLIC_WEB_URL: process.env.NEXT_PUBLIC_WEB_URL ?? "http://localhost:4000", ADMIN_EMAIL: process.env.ADMIN_EMAIL ?? configuredEmail, DATABASE_URL: databaseUrl, DIRECT_URL: databaseUrl, BETTER_AUTH_URL: "http://localhost:4001", BETTER_AUTH_SECRET: fs.readFileSync(secretPath, "utf8"), GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ?? local.GOOGLE_CLIENT_ID ?? "not-configured", GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ?? local.GOOGLE_CLIENT_SECRET ?? "not-configured" },
});
child.on("exit", code => { process.exitCode = code ?? 1; });
