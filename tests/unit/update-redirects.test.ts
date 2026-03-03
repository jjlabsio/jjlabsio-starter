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

  it("updates resolve-callback-url DEFAULT_CALLBACK_URL to /home when standard is selected", async () => {
    vi.mocked(fsUtils.readFile).mockImplementation(async (filePath) => {
      if (filePath.includes("resolve-callback-url")) {
        return `const DEFAULT_CALLBACK_URL = "/dashboard";`;
      }
      return `redirect("/dashboard")`;
    });
    vi.mocked(fsUtils.writeFile).mockResolvedValue();

    await updateRedirects("/tmp/test-project", "standard");

    const callbackUrlCall = vi
      .mocked(fsUtils.writeFile)
      .mock.calls.find(([filePath]) =>
        filePath.includes("resolve-callback-url"),
      );
    expect(callbackUrlCall).toBeDefined();
    expect(callbackUrlCall![1]).toContain(
      'const DEFAULT_CALLBACK_URL = "/home"',
    );
  });

  it("updates checkout route successUrl to /home when standard is selected", async () => {
    vi.mocked(fsUtils.readFile).mockImplementation(async (filePath) => {
      if (filePath.includes("checkout")) {
        return `const successUrl = new URL("/dashboard", request.nextUrl.origin).toString();`;
      }
      return `redirect("/dashboard")`;
    });
    vi.mocked(fsUtils.writeFile).mockResolvedValue();

    await updateRedirects("/tmp/test-project", "standard");

    const checkoutCall = vi
      .mocked(fsUtils.writeFile)
      .mock.calls.find(([filePath]) => filePath.includes("checkout"));
    expect(checkoutCall).toBeDefined();
    expect(checkoutCall![1]).toContain('new URL("/home",');
    expect(checkoutCall![1]).not.toContain('new URL("/dashboard",');
  });
});
