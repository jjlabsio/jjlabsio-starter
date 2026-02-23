import { createRequire } from "node:module";
import { getUserChoices } from "./prompts.js";
import { scaffold } from "./scaffold.js";
import {
  validateProjectName,
  checkDirectoryAvailable,
} from "./utils/validate.js";
import { logger } from "./utils/logger.js";

const require = createRequire(import.meta.url);
const { version: VERSION } = require("../package.json") as { version: string };

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.includes("--version") || args.includes("-v")) {
    console.log(VERSION);
    return;
  }

  if (args.includes("--help") || args.includes("-h")) {
    printHelp();
    return;
  }

  const argProjectName = args.find((arg) => !arg.startsWith("-"));

  if (argProjectName) {
    const validation = validateProjectName(argProjectName);
    if (!validation.valid) {
      logger.error(validation.message!);
      process.exit(1);
    }

    const dirCheck = await checkDirectoryAvailable(argProjectName);
    if (!dirCheck.available) {
      logger.error(dirCheck.message!);
      process.exit(1);
    }
  }

  const choices = await getUserChoices(argProjectName);

  if (!choices) {
    logger.error("Setup cancelled.");
    process.exit(1);
  }

  if (!argProjectName) {
    const dirCheck = await checkDirectoryAvailable(choices.projectName);
    if (!dirCheck.available) {
      logger.error(dirCheck.message!);
      process.exit(1);
    }
  }

  await scaffold(choices);
}

function printHelp(): void {
  console.log(`
  create-jjlabs-app [project-name]

  Scaffold a new JJLabs app from the starter template.

  Options:
    -h, --help      Show this help message
    -v, --version   Show version number

  Examples:
    npx create-jjlabs-app my-app
    npx create-jjlabs-app
  `);
}

main().catch((error: Error) => {
  logger.error(error.message);
  process.exit(1);
});
