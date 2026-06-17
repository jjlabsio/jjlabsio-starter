import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import vm from "node:vm";
import { afterEach, describe, expect, it } from "vitest";

const prCheckWorkflow = ".github/workflows/pr-release-check.yml";
const releaseWorkflow = ".github/workflows/release.yml";
const fixtureVersion = "0.2.0";

const tempFiles = new Set<string>();
const tempDirs = new Set<string>();

afterEach(() => {
  for (const file of tempFiles) {
    fs.rmSync(file, { force: true });
    tempFiles.delete(file);
  }
  for (const dir of tempDirs) {
    fs.rmSync(dir, { force: true, recursive: true });
    tempDirs.delete(dir);
  }
});

describe("PR release check workflow", () => {
  it("accepts title-based release signals without body metadata", () => {
    for (const [title, expected] of [
      ["feat: add option", "minor"],
      ["fix: repair release", "patch"],
      ["docs: update release docs", "patch"],
      ["chore: update deps", "patch"],
      ["refactor: simplify resolver", "patch"],
      ["perf: improve release", "patch"],
      ["test: add coverage", "patch"],
      ["ci: update workflow", "patch"],
      ["build: update package", "patch"],
      ["feat!: change contract", "major"],
      ["fix(api)!: change contract", "major"],
    ]) {
      const result = runPrCheck({ title, body: "", labels: [] });

      expect(result.failures, title).toEqual([]);
      expect(result.infos.join("\n"), title).toContain(expected);
    }
  });

  it("accepts release-none only when the title is not release-producing", () => {
    const noRelease = runPrCheck({
      title: "maintenance update",
      body: "",
      labels: [{ name: "Release-None" }],
    });
    const conflict = runPrCheck({
      title: "fix: repair release",
      body: "",
      labels: [{ name: "release-none" }],
    });

    expect(noRelease.failures).toEqual([]);
    expect(noRelease.infos.join("\n")).toContain("none");
    expect(conflict.failures.join("\n")).toContain("Conflicting release signals");
  });
});

describe("release workflow resolver", () => {
  it("resolves PR titles using the same mapping as the PR check", () => {
    expectReleaseVersion({ pr: pr("feat: add option") }, bumpVersion(fixtureVersion, "minor"));

    for (const title of [
      "fix: repair release",
      "docs: update release docs",
      "chore: update deps",
      "refactor: simplify resolver",
      "perf: improve release",
      "test: add coverage",
      "ci: update workflow",
      "build: update package",
    ]) {
      expectReleaseVersion({ pr: pr(title) }, bumpVersion(fixtureVersion, "patch"));
    }

    expectReleaseVersion({ pr: pr("feat!: change contract") }, bumpVersion(fixtureVersion, "major"));
    expectReleaseVersion({ pr: pr("fix(api)!: change contract") }, bumpVersion(fixtureVersion, "major"));
  });

  it("uses the merge commit title as the explicit non-PR fallback", () => {
    expectReleaseVersion(
      { pr: {}, headCommit: "fix: fallback release\n\nbody text" },
      bumpVersion(fixtureVersion, "patch"),
    );
  });

  it("keeps trusted exact workflow_dispatch versions independent from title resolution", () => {
    expectReleaseVersion({ pr: undefined, inputVersion: "0.2.5" }, "0.2.5");
    expectNoRelease({ pr: undefined });
  });

  it("handles release-none conflicts and no-release cases", () => {
    expectNoRelease({
      pr: { title: "maintenance update", body: "", labels: [{ name: "release-none" }] },
    });
    expectReleaseFailure(
      { pr: { title: "fix: repair release", body: "", labels: [{ name: "release-none" }] } },
      /Conflicting release signals/,
    );
  });

  it("documents that title-only breaking releases require ! in the title", () => {
    expectReleaseVersion(
      { pr: { title: "feat: api", body: "BREAKING CHANGE: incompatible API", labels: [] } },
      bumpVersion(fixtureVersion, "minor"),
    );
    expectReleaseVersion({ pr: pr("feat!: api") }, bumpVersion(fixtureVersion, "major"));
  });
});

describe("release publish job", () => {
  it("installs pnpm before npm publish triggers prepublishOnly", () => {
    const workflow = fs.readFileSync(releaseWorkflow, "utf8");
    const publishJob = workflow.slice(workflow.indexOf("  publish:"));
    const pnpmSetup = publishJob.indexOf("uses: pnpm/action-setup@v4");
    const publishStep = publishJob.indexOf("run: npm publish --provenance --access public");

    expect(pnpmSetup).toBeGreaterThanOrEqual(0);
    expect(publishStep).toBeGreaterThanOrEqual(0);
    expect(pnpmSetup).toBeLessThan(publishStep);
  });
});

function pr(title: string) {
  return { title, body: "", labels: [] };
}

function runPrCheck(pullRequest: { title: string; body: string; labels: Array<{ name: string }> }) {
  const script = extractGithubScript(prCheckWorkflow);
  const failures: string[] = [];
  const infos: string[] = [];
  const sandbox = {
    context: { payload: { pull_request: pullRequest } },
    core: {
      setFailed(message: string) {
        failures.push(message);
      },
      info(message: string) {
        infos.push(message);
      },
    },
  };

  vm.runInNewContext(`(() => {\n${script}\n})()`, sandbox);

  return { failures, infos };
}

function expectReleaseVersion(
  scenario: { pr?: { title?: string; body?: string; labels?: Array<{ name: string }> }; inputVersion?: string; headCommit?: string },
  version: string,
) {
  const result = runReleaseResolver(scenario);

  expect(result.ok, result.stderr || result.stdout).toBe(true);
  expect(result.output).toContain("has_changes=true");
  expect(result.output).toContain(`version=${version}`);
}

function expectNoRelease(
  scenario: { pr?: { title?: string; body?: string; labels?: Array<{ name: string }> }; inputVersion?: string; headCommit?: string },
) {
  const result = runReleaseResolver(scenario);

  expect(result.ok, result.stderr || result.stdout).toBe(true);
  expect(result.output).toContain("has_changes=false");
}

function expectReleaseFailure(
  scenario: { pr?: { title?: string; body?: string; labels?: Array<{ name: string }> }; inputVersion?: string; headCommit?: string },
  pattern: RegExp,
) {
  const result = runReleaseResolver(scenario);

  expect(result.ok).toBe(false);
  expect(`${result.stdout}\n${result.stderr}`).toMatch(pattern);
}

function runReleaseResolver({
  pr,
  inputVersion = "",
  headCommit = "",
}: {
  pr?: { title?: string; body?: string; labels?: Array<{ name: string }> };
  inputVersion?: string;
  headCommit?: string;
}) {
  const script = extractReleaseScript();
  const output = tempFile();
  const cwd = tempDir();

  fs.writeFileSync(path.join(cwd, "package.json"), JSON.stringify({ version: fixtureVersion }));

  if (pr !== undefined) {
    fs.writeFileSync(path.join(cwd, "pr.json"), JSON.stringify(pr));
  }

  try {
    const stdout = execFileSync(process.execPath, ["-e", script], {
      encoding: "utf8",
      env: {
        ...process.env,
        GITHUB_OUTPUT: output,
        HEAD_COMMIT: headCommit,
        INPUT_VERSION: inputVersion,
      },
      cwd,
      stdio: ["ignore", "pipe", "pipe"],
    });

    return {
      ok: true,
      output: fs.existsSync(output) ? fs.readFileSync(output, "utf8") : "",
      stdout,
      stderr: "",
    };
  } catch (error) {
    const commandError = error as { stdout?: Buffer; stderr?: Buffer };
    return {
      ok: false,
      output: fs.existsSync(output) ? fs.readFileSync(output, "utf8") : "",
      stdout: commandError.stdout?.toString() || "",
      stderr: commandError.stderr?.toString() || "",
    };
  }
}

function extractGithubScript(file: string) {
  const workflow = fs.readFileSync(file, "utf8");
  const match = workflow.match(/script: \|\n([\s\S]*)$/);

  if (!match) throw new Error(`script block not found in ${file}`);

  return match[1]
    .split("\n")
    .map((line) => (line.startsWith("            ") ? line.slice(12) : line))
    .join("\n");
}

function extractReleaseScript() {
  const lines = fs.readFileSync(releaseWorkflow, "utf8").split("\n");
  const start = lines.findIndex((line) => line.includes("node <<'NODE'"));
  const end = lines.findIndex((line, index) => index > start && line === "          NODE");

  if (start < 0 || end < 0) throw new Error("release node script block not found");

  return lines
    .slice(start + 1, end)
    .map((line) => line.replace(/^          /, ""))
    .join("\n");
}

function tempFile() {
  const file = path.join(os.tmpdir(), `release-workflow-test-${Date.now()}-${Math.random()}`);
  tempFiles.add(file);
  return file;
}

function tempDir() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "release-workflow-test-"));
  tempDirs.add(dir);
  return dir;
}

function bumpVersion(version: string, type: "major" | "minor" | "patch") {
  const [major, minor, patch] = version.split(".").map(Number);
  if (type === "major") return `${major + 1}.0.0`;
  if (type === "minor") return `${major}.${minor + 1}.0`;
  return `${major}.${minor}.${patch + 1}`;
}
