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
        layout: "sidebar",
      })
      .mockResolvedValueOnce({
        portAction: "accept",
      });

    const result = await getUserChoices();

    expect(result).toEqual({
      projectName: "my-app",
      layout: "sidebar",
      localPorts: {
        portSet: 0,
        ports: getPortsForSet(0),
      },
    });
  });

  it("uses argProjectName when provided", async () => {
    vi.mocked(prompts)
      .mockResolvedValueOnce({
        layout: "standard",
      })
      .mockResolvedValueOnce({
        portAction: "accept",
      });

    const result = await getUserChoices("pre-defined-name");

    expect(result).toEqual({
      projectName: "pre-defined-name",
      layout: "standard",
      localPorts: {
        portSet: 0,
        ports: getPortsForSet(0),
      },
    });
  });

  it("returns null when layout is not selected", async () => {
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
        layout: "sidebar",
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
        layout: "sidebar",
      })
      .mockResolvedValueOnce({
        portAction: "cancel",
      });

    const result = await getUserChoices();

    expect(result).toBeNull();
  });
});
