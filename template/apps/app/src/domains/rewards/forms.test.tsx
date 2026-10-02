// @vitest-environment jsdom
import * as React from "react";
import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
vi.mock("./actions", () => ({ submitReward: vi.fn() }));
import { SubmissionForm } from "./forms";

it("requires a valid HTTPS URL and participation, not optional marketing permission", async () => {
  Object.assign(globalThis, { React, IS_REACT_ACT_ENVIRONMENT: true });
  vi.stubGlobal("PointerEvent", MouseEvent);
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  try {
    await act(async () => { root.render(createElement(SubmissionForm)); });
    const submit = () => container.querySelector('button[type="submit"]') as HTMLButtonElement;
    const input = container.querySelector('input[name="postUrl"]') as HTMLInputElement;
    const changeUrl = async (value: string) => act(async () => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(input, value);
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });
    const participation = container.querySelector('[role="checkbox"]') as HTMLElement;
    expect(submit().disabled).toBe(true);
    await changeUrl("https://example.com/review");
    expect(submit().disabled).toBe(true);
    await act(async () => { participation.click(); });
    expect(submit().disabled).toBe(false);
    expect(container.querySelectorAll('[role="checkbox"]')[1]!.getAttribute("aria-checked")).toBe("false");
    await changeUrl("http://example.com/review");
    expect(submit().disabled).toBe(true);
    await changeUrl("https://example.com/review");
    await act(async () => { participation.click(); });
    expect(submit().disabled).toBe(true);
    expect(submit().textContent).toBe("Submit");
  } finally {
    await act(async () => { root.unmount(); });
    container.remove();
    vi.unstubAllGlobals();
  }
});
