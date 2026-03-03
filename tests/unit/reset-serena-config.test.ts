import { describe, expect, it, vi, afterEach } from "vitest";
import { resetSerenaConfig } from "../../src/steps/reset-serena-config.js";
import fs from "fs-extra";

vi.mock("fs-extra");
vi.mock("../../src/utils/logger.js");

const TEMPLATE_CONTENT = `project_name: "jjlabsio-starter"

languages:
- typescript

encoding: "utf-8"
`;

describe("resetSerenaConfig", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("replaces project_name with new project name", async () => {
    vi.mocked(fs.pathExists).mockResolvedValue(true as never);
    vi.mocked(fs.readFile).mockResolvedValue(TEMPLATE_CONTENT as never);
    vi.mocked(fs.writeFile).mockResolvedValue(undefined as never);

    await resetSerenaConfig("/tmp/test-project", "my-cool-app");

    const writeCall = vi.mocked(fs.writeFile).mock.calls[0];
    expect(writeCall![0]).toContain(".serena/project.yml");
    expect(writeCall![1]).toContain('project_name: "my-cool-app"');
    expect(writeCall![1]).not.toContain("jjlabsio-starter");
  });

  it("preserves other settings", async () => {
    vi.mocked(fs.pathExists).mockResolvedValue(true as never);
    vi.mocked(fs.readFile).mockResolvedValue(TEMPLATE_CONTENT as never);
    vi.mocked(fs.writeFile).mockResolvedValue(undefined as never);

    await resetSerenaConfig("/tmp/test-project", "my-cool-app");

    const written = vi.mocked(fs.writeFile).mock.calls[0]![1] as string;
    expect(written).toContain("- typescript");
    expect(written).toContain('encoding: "utf-8"');
  });

  it("skips when project.yml does not exist", async () => {
    vi.mocked(fs.pathExists).mockResolvedValue(false as never);

    await resetSerenaConfig("/tmp/test-project", "my-app");

    expect(fs.readFile).not.toHaveBeenCalled();
    expect(fs.writeFile).not.toHaveBeenCalled();
  });
});
