import { describe, expect, it, vi, afterEach } from "vitest";
import { updateRedirects } from "../../src/steps/update-redirects.js";
import * as fsUtils from "../../src/utils/fs.js";

vi.mock("../../src/utils/fs.js");
vi.mock("../../src/utils/logger.js");

describe("updateRedirects", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("does not modify files when sidebar is selected", async () => {
    await updateRedirects("/tmp/test-project", "sidebar");

    expect(fsUtils.readFile).not.toHaveBeenCalled();
    expect(fsUtils.writeFile).not.toHaveBeenCalled();
  });

  it("updates root page redirect to /home when standard is selected", async () => {
    vi.mocked(fsUtils.readFile).mockResolvedValue(
      `import { redirect } from "next/navigation";\n\nexport default function Page() {\n  redirect("/dashboard");\n}\n`,
    );
    vi.mocked(fsUtils.writeFile).mockResolvedValue();

    await updateRedirects("/tmp/test-project", "standard");

    const rootPageCall = vi
      .mocked(fsUtils.writeFile)
      .mock.calls.find(
        ([filePath]) =>
          filePath.includes("page.tsx") && !filePath.includes("sign-in"),
      );
    expect(rootPageCall).toBeDefined();
    expect(rootPageCall![1]).toContain('redirect("/home")');
    expect(rootPageCall![1]).not.toContain('redirect("/dashboard")');
  });

  it("updates sign-in page callbackURL to /home when standard is selected", async () => {
    vi.mocked(fsUtils.readFile).mockImplementation(async (filePath) => {
      if (filePath.includes("sign-in")) {
        return `callbackURL: "/dashboard"`;
      }
      return `redirect("/dashboard")`;
    });
    vi.mocked(fsUtils.writeFile).mockResolvedValue();

    await updateRedirects("/tmp/test-project", "standard");

    const signInCall = vi
      .mocked(fsUtils.writeFile)
      .mock.calls.find(([filePath]) => filePath.includes("sign-in"));
    expect(signInCall).toBeDefined();
    expect(signInCall![1]).toContain('callbackURL: "/home"');
  });
});
