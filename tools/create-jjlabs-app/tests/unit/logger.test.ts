import { describe, expect, it, vi, afterEach } from "vitest";
import { logger } from "../../src/utils/logger.js";

describe("logger", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("logs info messages", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    logger.info("test info");
    expect(spy).toHaveBeenCalledOnce();
  });

  it("logs success messages", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    logger.success("test success");
    expect(spy).toHaveBeenCalledOnce();
  });

  it("logs warning messages", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    logger.warn("test warn");
    expect(spy).toHaveBeenCalledOnce();
  });

  it("logs error messages to stderr", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    logger.error("test error");
    expect(spy).toHaveBeenCalledOnce();
  });

  it("logs step messages", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    logger.step("test step");
    expect(spy).toHaveBeenCalledOnce();
  });
});
