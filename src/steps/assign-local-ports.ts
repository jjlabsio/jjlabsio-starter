import net from "node:net";
import os from "node:os";
import path from "node:path";
import fs from "fs-extra";
import { logger } from "../utils/logger.js";

const REGISTRY_PATH = ".jjlabsio-starter/ports.json";
const MAX_PORT_SET = 500;

const PORT_TEMPLATE_FILES = [
  ".env.example",
  "apps/app/.env.example",
  "apps/web/.env.example",
  "packages/database/.env.example",
  "packages/database/README.md",
];

export interface LocalPorts {
  readonly app: number;
  readonly web: number;
  readonly api: number;
  readonly postgres: number;
}

interface PortRegistryProject {
  readonly projectName: string;
  readonly portSet: number;
}

interface PortRegistry {
  readonly version: 1;
  readonly projects: Record<string, PortRegistryProject>;
}

interface AssignLocalPortsOptions {
  readonly homeDir?: string;
  readonly isPortAvailable?: (port: number) => Promise<boolean>;
}

export interface AssignedLocalPorts {
  readonly portSet: number;
  readonly ports: LocalPorts;
}

export function getPortsForSet(portSet: number): LocalPorts {
  return {
    app: 3000 + portSet * 100,
    web: 3001 + portSet * 100,
    api: 3002 + portSet * 100,
    postgres: 5432 + portSet * 100,
  };
}

export async function assignLocalPorts(
  projectDir: string,
  projectName: string,
  options: AssignLocalPortsOptions = {},
): Promise<AssignedLocalPorts> {
  logger.step("Assigning local development ports...");

  const homeDir =
    options.homeDir ?? process.env.JJLABSIO_STARTER_HOME ?? os.homedir();
  const registryPath = path.join(homeDir, REGISTRY_PATH);
  const isPortAvailable = options.isPortAvailable ?? isLocalPortAvailable;
  const registry = await readPortRegistry(registryPath);
  const projects = await pruneMissingProjects(registry.projects);
  const usedPortSets = new Set(
    Object.entries(projects)
      .filter(([registeredProjectDir]) => registeredProjectDir !== projectDir)
      .map(([, project]) => project.portSet),
  );
  const assigned = await selectPortSet(usedPortSets, isPortAvailable);

  projects[projectDir] = {
    projectName,
    portSet: assigned.portSet,
  };

  await writePortRegistry(registryPath, {
    version: 1,
    projects,
  });
  await applyLocalPorts(projectDir, assigned.ports);

  return assigned;
}

async function readPortRegistry(registryPath: string): Promise<PortRegistry> {
  if (!(await fs.pathExists(registryPath))) {
    return {
      version: 1,
      projects: {},
    };
  }

  try {
    const registry = (await fs.readJson(registryPath)) as Partial<PortRegistry>;

    if (registry.version === 1 && registry.projects) {
      return {
        version: 1,
        projects: Object.fromEntries(
          Object.entries(registry.projects).filter(([, project]) =>
            isPortRegistryProject(project),
          ),
        ),
      };
    }
  } catch {
    logger.warn(
      `Ignoring unreadable local port registry at ${registryPath}; it will be recreated.`,
    );
  }

  return {
    version: 1,
    projects: {},
  };
}

function isPortRegistryProject(
  project: unknown,
): project is PortRegistryProject {
  return (
    typeof project === "object" &&
    project !== null &&
    "projectName" in project &&
    "portSet" in project &&
    typeof project.projectName === "string" &&
    Number.isInteger(project.portSet)
  );
}

async function pruneMissingProjects(
  projects: Record<string, PortRegistryProject>,
): Promise<Record<string, PortRegistryProject>> {
  const entries = await Promise.all(
    Object.entries(projects).map(async ([projectDir, project]) =>
      (await fs.pathExists(projectDir)) ? ([projectDir, project] as const) : null,
    ),
  );

  return Object.fromEntries(entries.filter((entry) => entry !== null));
}

async function selectPortSet(
  usedPortSets: Set<number>,
  isPortAvailable: (port: number) => Promise<boolean>,
): Promise<AssignedLocalPorts> {
  for (let portSet = 0; portSet <= MAX_PORT_SET; portSet += 1) {
    if (usedPortSets.has(portSet)) {
      continue;
    }

    const ports = getPortsForSet(portSet);
    const available = await Promise.all(
      Object.values(ports).map((port) => isPortAvailable(port)),
    );

    if (available.every(Boolean)) {
      return {
        portSet,
        ports,
      };
    }
  }

  throw new Error("No available local development port set found.");
}

async function writePortRegistry(
  registryPath: string,
  registry: PortRegistry,
): Promise<void> {
  await fs.ensureDir(path.dirname(registryPath));
  await fs.writeJson(registryPath, registry, { spaces: 2 });
}

async function applyLocalPorts(
  projectDir: string,
  ports: LocalPorts,
): Promise<void> {
  const replacements = {
    "{{LOCAL_APP_PORT}}": String(ports.app),
    "{{LOCAL_WEB_PORT}}": String(ports.web),
    "{{LOCAL_API_PORT}}": String(ports.api),
    "{{LOCAL_POSTGRES_PORT}}": String(ports.postgres),
  };

  await Promise.all(
    PORT_TEMPLATE_FILES.map(async (relativePath) => {
      const filePath = path.join(projectDir, relativePath);

      if (!(await fs.pathExists(filePath))) {
        return;
      }

      const content = await fs.readFile(filePath, "utf-8");
      const updated = Object.entries(replacements).reduce(
        (nextContent, [placeholder, value]) =>
          nextContent.replaceAll(placeholder, value),
        content,
      );

      if (content !== updated) {
        await fs.writeFile(filePath, updated, "utf-8");
      }
    }),
  );
}

async function isLocalPortAvailable(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = net.createServer();

    server.once("error", () => resolve(false));
    server.once("listening", () => {
      server.close(() => resolve(true));
    });
    server.listen(port);
  });
}
