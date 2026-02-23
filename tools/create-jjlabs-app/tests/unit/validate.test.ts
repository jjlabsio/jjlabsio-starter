import { describe, expect, it, vi, afterEach } from "vitest";
import {
  validateProjectName,
  checkDirectoryAvailable,
} from "../../src/utils/validate.js";
import fs from "fs-extra";

vi.mock("fs-extra");

describe("validateProjectName", () => {
  it("accepts valid names", () => {
    expect(validateProjectName("my-app").valid).toBe(true);
    expect(validateProjectName("my-app-123").valid).toBe(true);
    expect(validateProjectName("app").valid).toBe(true);
    expect(validateProjectName("a").valid).toBe(true);
    expect(validateProjectName("my.app").valid).toBe(true);
    expect(validateProjectName("my_app").valid).toBe(true);
  });

  it("rejects empty names", () => {
    const result = validateProjectName("");
    expect(result.valid).toBe(false);
    expect(result.message).toContain("required");
  });

  it("rejects whitespace-only names", () => {
    const result = validateProjectName("   ");
    expect(result.valid).toBe(false);
  });

  it("rejects names with uppercase", () => {
    expect(validateProjectName("MyApp").valid).toBe(false);
  });

  it("rejects names starting with hyphen", () => {
    expect(validateProjectName("-my-app").valid).toBe(false);
  });

  it("rejects names with spaces", () => {
    expect(validateProjectName("my app").valid).toBe(false);
  });

  it("rejects names with special characters", () => {
    expect(validateProjectName("my@app").valid).toBe(false);
    expect(validateProjectName("my/app").valid).toBe(false);
  });
});

describe("checkDirectoryAvailable", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns available when directory does not exist", async () => {
    vi.mocked(fs.pathExists).mockResolvedValue(false as never);
    const result = await checkDirectoryAvailable("/tmp/nonexistent");
    expect(result.available).toBe(true);
  });

  it("returns unavailable when directory exists", async () => {
    vi.mocked(fs.pathExists).mockResolvedValue(true as never);
    const result = await checkDirectoryAvailable("/tmp/existing");
    expect(result.available).toBe(false);
    expect(result.message).toContain("already exists");
  });
});
