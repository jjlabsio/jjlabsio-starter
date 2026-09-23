import { describe, expect, it, vi, afterEach } from "vitest";
import { getUserChoices } from "../../src/prompts.js";
import { getPortsForSet } from "../../src/steps/assign-local-ports.js";

vi.mock("prompts", () => ({
  default: vi.fn(),
}));

vi.mock("../../src/steps/assign-local-ports.js", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../../src/steps/assign-local-ports.js")>();

  return {
    ...actual,
    previewLocalPorts: vi.fn(async (_projectDir, _options, startAfterPortSet) => {
      const portSet = startAfterPortSet === 0 ? 1 : 0;

      return {
        portSet,
        ports: actual.getPortsForSet(portSet),
      };
    }),
  };
});

import prompts from "prompts";

describe("getUserChoices", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns choices when user provides all inputs", async () => {
    vi.mocked(prompts)
      .mockResolvedValueOnce({
        projectName: "my-app",
      })
      .mockResolvedValueOnce({
        portAction: "accept",
      });

    const result = await getUserChoices();

    expect(result).toEqual({
      projectName: "my-app",
      localPorts: {
        portSet: 0,
        ports: getPortsForSet(0),
      },
    });
    expect(vi.mocked(prompts).mock.calls[0]?.[0]).toEqual([
      expect.objectContaining({ name: "projectName" }),
    ]);
    expect(vi.mocked(prompts).mock.calls[1]?.[0]).toMatchObject({
      message: expect.stringContaining("worker 3103"),
    });
  });

  it("uses argProjectName when provided", async () => {
    vi.mocked(prompts)
      .mockResolvedValueOnce({
      })
      .mockResolvedValueOnce({
        portAction: "accept",
      });

    const result = await getUserChoices("pre-defined-name");

    expect(result).toEqual({
      projectName: "pre-defined-name",
      localPorts: {
        portSet: 0,
        ports: getPortsForSet(0),
      },
    });
  });

  it("returns null when project name is not entered", async () => {
    vi.mocked(prompts).mockResolvedValue({
      projectName: "my-app",
    });

    const result = await getUserChoices();
    expect(result).toBeNull();
  });

  it("lets the user preview another available port set before accepting", async () => {
    vi.mocked(prompts)
      .mockResolvedValueOnce({
        projectName: "my-app",
      })
      .mockResolvedValueOnce({
        portAction: "another",
      })
      .mockResolvedValueOnce({
        portAction: "accept",
      });

    const result = await getUserChoices();

    expect(result?.localPorts).toEqual({
      portSet: 1,
      ports: getPortsForSet(1),
    });
  });

  it("returns null when user cancels port selection", async () => {
    vi.mocked(prompts)
      .mockResolvedValueOnce({
        projectName: "my-app",
      })
      .mockResolvedValueOnce({
        portAction: "cancel",
      });

    const result = await getUserChoices();

    expect(result).toBeNull();
  });
});
