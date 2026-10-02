// Local preview regression: no real checkout, email, or production writes.
// PLAYWRIGHT_MODULE may point at an existing Playwright installation.
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || "playwright");
const base = process.env.UI_PREVIEW_URL || "http://localhost:3999";
assert.ok(["localhost", "127.0.0.1"].includes(new URL(base).hostname), "Local preview only");
const out = resolve(".local-preview/ui-audit");
await mkdir(out, { recursive: true });
const browser = await chromium.launch({ headless: true });
const layoutAudit = [];
const dropdownAudit = [];
let auditPage;
try {
  for (const [device, width, height] of [["desktop", 1440, 900], ["mobile", 390, 844]]) {
    const context = await browser.newContext({ viewport: { width, height }, isMobile: device === "mobile", hasTouch: device === "mobile", reducedMotion: "reduce" });
    // Observe the first rendered state, not only the settled preference.
    await context.addInitScript(() => {
      window.__companySwitchStates = [];
      const setItem = Storage.prototype.setItem;
      Storage.prototype.setItem = function(key, value) {
        if (window.__failProjectWrite && key === "starter-projects-preview-v1") throw new DOMException("Preview storage failure", "QuotaExceededError");
        return setItem.call(this, key, value);
      };
      new MutationObserver(() => {
        if (location.pathname !== "/settings/company") return;
        const state = document.querySelector('[role="switch"][aria-label="Email reports"]')?.getAttribute("aria-checked");
        const states = window.__companySwitchStates;
        if (state !== null && state !== undefined && state !== states.at(-1)) states.push(state);
      }).observe(document, { subtree: true, childList: true, attributes: true, attributeFilter: ["aria-checked"] });
    });
    const page = await context.newPage();
    auditPage = page;
    const errors = [];
    page.on("pageerror", error => { errors.push(error.message); console.error(`${device}: ${error.message}`); });
    const button = name => page.getByRole("button", { name, exact: true });
    const menuitem = name => page.getByRole("menuitem", { name, exact: true });
    async function verifyLayout() {
      const path = new URL(page.url()).pathname;
      const type = ({ "/": "dashboard", "/my-website": "default", "/settings/company": "settings", "/settings/billing": "settings-sections", "/requests": "canvas", "/actions": "canvas", "/settings/profile": "canvas", "/settings/projects": "canvas" })[path];
      if (!type) return;
      const actual = await page.locator(".ui-page-layout").evaluate(element => {
        const style = getComputedStyle(element);
        const inFlow = e => getComputedStyle(e).position !== "absolute" && getComputedStyle(e).display !== "none";
        const gaps = e => Array.from(e.children).filter(inFlow).slice(1).map((child, i) => child.getBoundingClientRect().top - Array.from(e.children).filter(inFlow)[i].getBoundingClientRect().bottom);
        const analysis = element.querySelector("#overview-analysis");
        return {
          type: element.dataset.layout,
          padding: [style.paddingTop, style.paddingRight, style.paddingBottom, style.paddingLeft].map(parseFloat),
          gap: parseFloat(style.rowGap),
          sectionGaps: gaps(element),
          panelGaps: analysis ? gaps(analysis) : [],
        };
      });
      const [padding, gap] = ({ default: [24, 24], dashboard: [32, 48], settings: [8, 12], "settings-sections": [8, 24], canvas: [0, 0] })[type];
      assert.equal(actual.type, type, `${path}: page type`);
      const [left, right] = type === "canvas" ? [0, 0] : type.startsWith("settings") ? [12, 12] : device === "mobile" ? [16, 16] : [12, 24];
      assert.deepEqual(actual.padding, [padding, right, padding, left], `${path}: content padding`);
      assert.equal(actual.gap, gap, `${path}: page gap`);
      if (type !== "canvas") {
        for (const measured of actual.sectionGaps) assert.ok(Math.abs(measured - gap) < 0.5, `${path}: section gap ${measured}, expected ${gap}`);
      }
      if (type === "dashboard") {
        assert.equal(actual.sectionGaps.length, 1, "Summary and analysis must be separate regions");
        assert.equal(actual.panelGaps.length, 2, "Analysis contains three panel groups");
        for (const measured of actual.panelGaps) assert.ok(Math.abs(measured - 16) < 0.5, `Panel gap ${measured}, expected 16`);
      }
      layoutAudit.push({ device, path, ...actual });
    }
    async function visit(path) {
      await page.goto(base + path);
      await page.waitForLoadState("networkidle");
      await page.evaluate(() => document.fonts.ready);
      await verifyLayout();
    }
    async function capture(name) {
      // Capture settled UI, not the first frame of a menu/sidebar transition.
      await page.evaluate(async () => {
        await document.fonts.ready;
        await new Promise(requestAnimationFrame);
        await new Promise(requestAnimationFrame);
        await Promise.allSettled(document.getAnimations()
          .filter(animation => animation.effect?.getTiming().iterations !== Infinity)
          .map(animation => animation.finished));
      });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `${name}: page overflow`);
      await page.screenshot({ path: `${out}/verified-${name}-${device}.png`, animations: "disabled" });
    }
    async function navOpen() { if (device === "mobile") await button("Toggle Sidebar").click(); }
    async function navClose() { if (device === "mobile") await page.keyboard.press("Escape"); }
    await visit("/settings/billing");
    assert.equal(new URL(page.url()).pathname, "/sign-in", "Unauthenticated billing redirects without reading a null session");
    await button("Continue with development account").click();
    await page.waitForURL(url => url.pathname === "/");
    await page.waitForLoadState("networkidle");
    await verifyLayout();
    await navOpen();
    assert.equal(await button("Workspace navigation").count(), 0, "Workspace is display-only");
    await page.getByRole("group", { name: "Current workspace", exact: true }).waitFor();
    await capture("workspace");
    await button("Home").click();
    assert.equal(await button("Home").getAttribute("aria-expanded"), "false");
    assert.equal(await page.getByRole("link", { name: "Overview", exact: true }).isVisible(), false);
    await button("Home").press("Enter");
    assert.equal(await button("Home").getAttribute("aria-expanded"), "true");
    await button("Search navigation").click();
    await page.getByRole("textbox", { name: "Search pages" }).fill("projects");
    await menuitem("Projects").waitFor();
    await page.getByRole("textbox", { name: "Search pages" }).press("Escape");
    await page.getByRole("menu").waitFor({ state: "hidden" });
    await button("Account menu").click();
    await page.getByRole("menu", { name: "Account menu", exact: true }).waitFor();
    await capture("account");
    await page.keyboard.press("Escape");
    await page.getByRole("menu", { name: "Account menu", exact: true }).waitFor({ state: "hidden" });
    await navClose();
    if (device === "desktop") {
      await button("Toggle Sidebar").click();
      await capture("sidebar-collapsed");
      assert.equal(await page.getByRole("link", { name: "Overview", exact: true }).isVisible(), true);
      await button("Toggle Sidebar").click();
    }
    await button("Show line chart").click();
    assert.equal(await button("Show line chart").getAttribute("aria-pressed"), "true");
    assert.equal(await button("Show bar chart").getAttribute("aria-pressed"), "false");
    await page.waitForFunction(() => getComputedStyle(document.querySelector('[aria-label="Show line chart"]')).backgroundColor === "rgb(253, 253, 253)");
    assert.equal(await button("Show line chart").evaluate(e => getComputedStyle(e).backgroundColor), "rgb(253, 253, 253)");
    await button("Show bar chart").click();
    await page.evaluate(() => window.scrollTo(0, 0));
    await button("All sources").click();
    const sourceMenu = page.getByRole("menu", { name: "All sources", exact: true });
    await sourceMenu.waitFor();
    await capture("sources-open");
    const menuMetrics = await sourceMenu.evaluate(element => {
      const style = getComputedStyle(element);
      const label = element.querySelector('[data-slot="dropdown-menu-label"]');
      return {
        width: element.getBoundingClientRect().width,
        radius: style.borderRadius,
        itemHeight: element.querySelector('[role="menuitem"]').getBoundingClientRect().height,
        checkboxHeight: element.querySelector('[role="menuitemcheckbox"]').getBoundingClientRect().height,
        searchHeight: element.querySelector('[data-slot="input-group"]').getBoundingClientRect().height,
        labelWeight: getComputedStyle(label).fontWeight,
      };
    });
    assert.deepEqual(menuMetrics, { width: 218, radius: "12px", itemHeight: 32, checkboxHeight: 32, searchHeight: 32, labelWeight: "400" });
    assert.equal(await page.getByRole("textbox", { name: "Search sources" }).evaluate(e => document.activeElement === e), false);
    await page.getByRole("textbox", { name: "Search sources" }).fill("Search");
    assert.equal(await page.getByRole("menuitemcheckbox").count(), 1);
    await capture("sources-search");
    await button("Clear search").click();
    assert.equal(await page.getByRole("textbox", { name: "Search sources" }).inputValue(), "");
    assert.equal(await page.getByRole("textbox", { name: "Search sources" }).evaluate(e => document.activeElement === e), true);
    await page.getByRole("textbox", { name: "Search sources" }).fill("no-such-source");
    await page.getByRole("status").filter({ hasText: "No matching sources" }).waitFor();
    await button("Clear search").click();
    await page.getByRole("menuitemcheckbox", { name: "Direct", exact: true }).click();
    assert.equal(await menuitem("All sources").getAttribute("data-selected"), "false");
    await capture("sources-unchecked");
    await menuitem("All sources").click();
    await page.keyboard.press("Escape");
    await button("All filters").click();
    assert.equal(await menuitem("Reset filters").isEnabled(), false);
    await capture("all-filters");
    await (device === "mobile" ? menuitem("Source").tap() : menuitem("Source").click());
    await page.getByRole("menu", { name: "Source", exact: true }).waitFor();
    await capture("source-submenu");
    await page.keyboard.press("Escape");
    await page.keyboard.press("Escape");
    await button("2 days").click();
    const dateDialog = page.getByRole("dialog", { name: "Date range", exact: true });
    await dateDialog.waitFor();
    await capture("date-range");
    assert.equal(await button("vs Last month").isEnabled(), false);
    assert.equal(await button("vs Last year").isEnabled(), false);
    assert.equal(await page.getByRole("button", { name: "Saturday, September 12th, 2026", exact: true }).isEnabled(), false);
    const dateMetrics = await dateDialog.evaluate(element => ({
      width: element.getBoundingClientRect().width,
      radius: getComputedStyle(element).borderRadius,
      presetWeight: getComputedStyle(Array.from(element.querySelectorAll("button")).find(button => button.textContent.trim() === "Last 2 days")).fontWeight,
      overflow: element.scrollWidth > element.clientWidth,
    }));
    assert.equal(dateMetrics.width, device === "mobile" ? 358 : 400);
    assert.equal(dateMetrics.radius, "12px");
    assert.equal(dateMetrics.overflow, false, "Date range content fits the viewport");
    assert.equal(dateMetrics.presetWeight, "400", "Date presets use the common menu body style");
    dropdownAudit.push({ device, menu: menuMetrics, date: dateMetrics });
    await button("Last 7 days").click();
    await dateDialog.waitFor({ state: "hidden" });
    assert.equal(new URL(page.url()).searchParams.get("period"), "7d");
    await page.getByText("Showing data for 7 days", { exact: true }).waitFor();
    await button("7 days").click();
    await button("Custom range").click();
    await page.getByRole("button", { name: /^Monday, September 14th, 2026/ }).click();
    await page.getByRole("button", { name: /^Wednesday, September 16th, 2026/ }).click();
    await button("3 days").waitFor();
    assert.equal(new URL(page.url()).searchParams.get("from"), "2026-09-14");
    assert.equal(new URL(page.url()).searchParams.get("to"), "2026-09-16");
    await capture("date-custom");
    await page.keyboard.press("Escape");
    await page.reload();
    await page.getByText("Showing data for 3 days", { exact: true }).waitFor();
    await button("Source impact actions").click();
    const customDownload = page.waitForEvent("download");
    await menuitem("Download CSV").click();
    const customFile = await customDownload;
    assert.equal(customFile.suggestedFilename(), "source-impact.csv");
    const stream = await customFile.createReadStream();
    const chunks = [];
    for await (const chunk of stream) chunks.push(chunk);
    const customCsv = Buffer.concat(chunks).toString("utf8");
    assert.ok(customCsv.includes("14 Sep") && customCsv.includes("16 Sep") && !customCsv.includes("18 Sep"));
    await button("1 filter selected").click();
    await menuitem("Reset filters").click();
    await button("2 days").press("Enter");
    await dateDialog.waitFor();
    await page.keyboard.press("Escape");
    await button("All sources").click();
    await page.getByRole("menuitemcheckbox", { name: "Direct", exact: true }).click();
    await page.keyboard.press("Escape");
    await button("1 filter selected").click();
    await menuitem("Reset filters").click();
    await button("All sources").waitFor();
    await button("W").click();
    await button("7 days").waitFor();
    await button("D").click();
    for (const [trigger, filename] of [[null, "top-sources.csv"], ["Visibility chart actions", "visibility.csv"], ["Source impact actions", "source-impact.csv"]]) {
      if (trigger) await button(trigger).click();
      const download = page.waitForEvent("download");
      await (trigger ? menuitem("Download CSV") : button("Download top sources CSV")).click();
      const file = await download;
      assert.equal(file.suggestedFilename(), filename);
      assert.equal(await file.failure(), null);
    }
    await button("All sources").click();
    await page.getByRole("menuitemcheckbox").first().waitFor();
    for (const checkbox of await page.getByRole("menuitemcheckbox").all()) await checkbox.click();
    await button("0 sources").waitFor();
    await page.keyboard.press("Escape");
    assert.equal(await button("Download top sources CSV").isEnabled(), false);
    await button("Visibility chart actions").click();
    assert.equal(await menuitem("Download CSV").isEnabled(), false);
    await page.keyboard.press("Escape");
    await button("1 filter selected").click();
    await menuitem("Reset filters").click();
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.locator(".ui-sticky-summary").waitFor({ state: "hidden" });
    await capture("overview");
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.locator(".ui-sticky-summary").waitFor({ state: "visible" });
    assert.equal(Math.round((await page.locator("header").first().boundingBox()).y), 0);
    assert.equal(Math.round((await page.locator(".ui-filter-bar").boundingBox()).y), 48);
    await capture("overview-scrolled");
    await visit("/my-website");
    await capture("my-website");
    await button("View overview").click();
    await page.waitForURL(url => url.pathname === "/");
    await visit("/actions");
    await button("All filters").click();
    assert.equal(await page.getByRole("textbox", { name: "Search actions" }).evaluate(e => document.activeElement === e), false);
    await page.getByRole("menuitemcheckbox", { name: "Content brief", exact: true }).click();
    await capture("actions-filter");
    await page.keyboard.press("Escape");
    await button("Reset").click();
    await page.getByRole("menu").waitFor({ state: "hidden" });
    await button("All filters").press("Enter");
    await page.getByRole("textbox", { name: "Search actions" }).waitFor();
    await page.waitForFunction(() => document.activeElement?.getAttribute("aria-label") === "Search actions");
    assert.equal(await page.getByRole("textbox", { name: "Search actions" }).evaluate(e => document.activeElement === e), true);
    await page.getByRole("textbox", { name: "Search actions" }).press("Escape");
    await page.getByRole("checkbox", { name: "Select Write a guide to organizing project feedback", exact: true }).click();
    const parent = page.getByRole("checkbox", { name: "Select all Content brief actions", exact: true });
    assert.equal(await parent.getAttribute("aria-checked"), "mixed");
    await page.waitForFunction(() => getComputedStyle(document.querySelector('[aria-label="Select all Content brief actions"]')).backgroundColor === "rgb(43, 127, 255)");
    assert.equal(await parent.evaluate(e => getComputedStyle(e).backgroundColor), "rgb(43, 127, 255)");
    await capture("actions-mixed");
    await parent.click();
    assert.match(await page.locator(".ui-page-footer").innerText(), /5 selected/);
    await button("Accept selected").click();
    await button("In progress 6").waitFor();
    await button("Group by: What to do").click();
    await menuitem("Format").click();
    await button("Group by: Format").waitFor();
    await capture("actions");
    await visit("/requests");
    await button("All time").click();
    await page.getByRole("dialog", { name: "Date range", exact: true }).waitFor();
    await capture("requests-date-range");
    await button("Last 7 days").click();
    await page.getByRole("dialog", { name: "Date range", exact: true }).waitFor({ state: "hidden" });
    await page.getByRole("status").filter({ hasText: /^7 requests$/ }).waitFor();
    await button("Last 7 days").click();
    await button("Custom range").click();
    await page.getByRole("button", { name: /^Thursday, September 17th, 2026/ }).click();
    await page.getByRole("button", { name: /^Friday, September 18th, 2026/ }).click();
    await page.getByRole("status").filter({ hasText: /^3 requests$/ }).waitFor();
    await page.keyboard.press("Escape");
    await page.locator('[data-slot="popover-trigger"]').click();
    await page.getByRole("dialog", { name: "Date range", exact: true }).getByRole("button", { name: "All time", exact: true }).click();
    await page.getByRole("tab", { name: "Planned", exact: true }).click();
    await page.getByRole("status").filter({ hasText: /^2 requests$/ }).waitFor();
    await page.getByRole("tab", { name: "Archived", exact: true }).click();
    await page.getByRole("tab", { name: "Open", exact: true }).click();
    await page.getByRole("textbox", { name: "Search requests" }).fill("not-found-audit");
    await page.getByText("No requests match these filters.").waitFor();
    await page.getByRole("textbox", { name: "Search requests" }).fill("");
    await button("Add request").click();
    await page.getByLabel("Request", { exact: true }).fill("How can we test reusable interfaces?");
    await page.getByRole("dialog").getByRole("button", { name: "Add request", exact: true }).click();
    await page.getByText("How can we test reusable interfaces?", { exact: true }).filter({ visible: true }).waitFor();
    await capture("requests");
    await button("All categories").click();
    await capture("category-create-menu");
    await menuitem("New category").click();
    const categoryDialog = page.getByRole("dialog", { name: "New category", exact: true });
    await categoryDialog.waitFor();
    assert.equal(await page.getByLabel("Category name", { exact: true }).evaluate(e => document.activeElement === e), true);
    assert.equal(await button("Add category").isEnabled(), false);
    await capture("category-create-form");
    await page.getByLabel("Category name", { exact: true }).fill("Operations");
    await page.getByText("A category with this name already exists.", { exact: true }).waitFor();
    assert.equal(await button("Add category").isEnabled(), false);
    await capture("category-create-error");
    await page.getByLabel("Category name", { exact: true }).fill("All categories");
    assert.equal(await button("Add category").isEnabled(), false, "The all-categories filter name is reserved");
    await page.getByLabel("Category name", { exact: true }).fill("Audit category");
    await button("Cancel").click();
    await categoryDialog.waitFor({ state: "hidden" });
    assert.equal(await button("All categories").evaluate(e => document.activeElement === e), true);
    await button("All categories").press("ArrowDown");
    await menuitem("New category").click();
    assert.equal(await page.getByLabel("Category name", { exact: true }).inputValue(), "");
    await page.getByLabel("Category name", { exact: true }).fill("Audit category");
    await page.getByLabel("Category name", { exact: true }).press("Enter");
    await categoryDialog.waitFor({ state: "hidden" });
    assert.equal(await button("Category: 1 selected (Audit category)").evaluate(e => document.activeElement === e), true);
    await page.getByText("No requests match these filters.").waitFor();
    await button("Add request").click();
    assert.equal(await page.getByLabel("Category", { exact: true }).innerText(), "Audit category");
    await page.getByLabel("Request", { exact: true }).fill("An item in the newly created category");
    await page.getByRole("dialog").getByRole("button", { name: "Add request", exact: true }).click();
    await button("All categories").click();
    await page.getByRole("menuitemradio", { name: "Audit category", exact: true }).click();
    await page.getByText("An item in the newly created category", { exact: true }).filter({ visible: true }).waitFor();
    await capture("category-created");
    await visit("/settings/company");
    await page.getByRole("switch", { name: "Email reports", exact: true }).waitFor();
    assert.deepEqual(await page.evaluate(() => window.__companySwitchStates), ["true"], "Fresh preview shows its default without a false intermediate state");
    await page.getByLabel("Name", { exact: true }).fill("Preview Studio");
    await button("Save").click();
    await page.getByRole("status").filter({ hasText: "Saved" }).waitFor();
    await page.getByLabel("Name", { exact: true }).fill("Unsaved name");
    await page.getByRole("switch", { name: "Email reports", exact: true }).click();
    assert.equal(await page.getByRole("status").filter({ hasText: "Saved" }).count(), 0);
    await visit("/settings/company");
    assert.equal(await page.getByLabel("Name", { exact: true }).inputValue(), "Preview Studio");
    assert.equal(await page.getByRole("switch", { name: "Email reports", exact: true }).getAttribute("aria-checked"), "false");
    assert.deepEqual(await page.evaluate(() => window.__companySwitchStates), ["false"], "Saved false must never render as true during hydration");
    await page.getByRole("switch", { name: "Email reports", exact: true }).click();
    await visit("/settings/company");
    assert.deepEqual(await page.evaluate(() => window.__companySwitchStates), ["true"], "Saved true must never render as false during hydration");
    await page.getByRole("switch", { name: "Email reports", exact: true }).click();
    await visit("/settings/company");
    assert.deepEqual(await page.evaluate(() => window.__companySwitchStates), ["false"]);
    await capture("company");
    await visit("/settings/billing");
    assert.deepEqual(await page.getByRole("link", { name: "View plan details", exact: true }).evaluateAll(links => links.map(link => link.getBoundingClientRect().height)), [32, 32, 32], "Plan actions use the shared default button size");
    for (const section of await page.locator('.ui-page-layout > section.ui-section-stack').all()) {
      assert.equal(await section.evaluate(element => element.children[1].getBoundingClientRect().top - element.children[0].getBoundingClientRect().bottom), 16, "Settings section heading belongs to its content group");
    }
    await capture("billing");
    if (await button("Manage Billing").isVisible()) {
      await page.route("**/api/billing/portal", route => route.fulfill({ status: 404, contentType: "application/json", body: JSON.stringify({ error: "No billing account found" }) }));
      await button("Manage Billing").click();
      await page.getByText("Could not open billing", { exact: true }).waitFor();
      assert.equal(new URL(page.url()).pathname, "/settings/billing");
      await page.unroute("**/api/billing/portal");
    }
    await page.getByRole("link", { name: "View plan details", exact: true }).first().click();
    await button("Yearly").click();
    assert.equal(await button("Yearly").getAttribute("aria-pressed"), "true");
    await button("Monthly").click();
    await capture("pricing");
    // External financial actions are not submitted; exercise failure locally.
    const trial = button("Start Free Trial").first();
    if (await trial.isVisible()) {
      await page.route("**/api/billing/trial", route => route.fulfill({ status: 503, body: "{}" }));
      await trial.click();
      await page.getByRole("alert").filter({ hasText: "Could not start" }).waitFor();
      assert.equal(new URL(page.url()).pathname, "/pricing");
      await page.unroute("**/api/billing/trial");
    }
    await visit("/welcome");
    assert.ok(["/", "/welcome"].includes(new URL(page.url()).pathname));
    await visit("/settings/profile");
    await page.getByLabel("Industry", { exact: true }).fill("Design Software");
    await button("Save changes").click();
    await page.getByText("Changes saved in this browser tab.").waitFor();
    await visit("/settings/profile");
    assert.equal(await page.getByLabel("Industry", { exact: true }).inputValue(), "Design Software");
    await capture("profile");
    await page.locator(".ui-form-scroll").evaluate(e => e.scrollTop = 500);
    await capture("profile-fields");
    await visit("/settings/projects");
    await capture("projects");
    const projectFilter = page.locator('[data-slot="filter-select"]').getByRole("button", { name: /^(All projects|Project:)/ });
    await projectFilter.click();
    await capture("project-create-menu");
    await page.getByRole("textbox", { name: "Search project", exact: true }).fill("does-not-exist");
    await page.getByRole("status").filter({ hasText: "No matching projects." }).waitFor();
    await menuitem("Add project").click();
    const projectDialog = page.getByRole("dialog", { name: "Add project", exact: true });
    await projectDialog.waitFor();
    assert.equal(await page.getByLabel("Display name", { exact: true }).evaluate(e => document.activeElement === e), true);
    assert.equal(await button("Create").isEnabled(), false);
    await capture("project-create-empty");
    await button("Cancel").click();
    await projectDialog.waitFor({ state: "hidden" });
    assert.equal(await projectFilter.evaluate(e => document.activeElement === e), true);
    await projectFilter.click();
    await menuitem("Add project").click();
    await page.getByLabel("Display name", { exact: true }).fill("Customer Portal");
    await page.getByLabel("Short name 1", { exact: true }).fill("Example");
    await button("Create").click();
    await page.getByText("A project with this name already exists.", { exact: true }).waitFor();
    await capture("project-create-error");
    await button("Cancel").click();
    await page.getByRole("dialog", { name: "Discard changes?", exact: true }).waitFor();
    await button("Keep editing").click();
    assert.equal(await page.getByLabel("Display name", { exact: true }).inputValue(), "Customer Portal");
    await page.getByLabel("Display name", { exact: true }).fill("Audit Project");
    await page.getByLabel("Short name 1", { exact: true }).fill("Audit");
    await page.getByLabel("Domain 1", { exact: true }).fill("audit.example");
    await capture("project-form");
    await page.evaluate(() => { window.__failProjectWrite = true; });
    await button("Create").click();
    await page.getByRole("dialog", { name: "Add project", exact: true }).getByText("Could not save. Check your browser storage settings and try again.", { exact: true }).waitFor();
    assert.equal(await page.getByLabel("Display name", { exact: true }).inputValue(), "Audit Project");
    assert.equal(await page.getByLabel("Short name 1", { exact: true }).inputValue(), "Audit");
    assert.equal(await page.getByLabel("Domain 1", { exact: true }).inputValue(), "audit.example");
    await capture("project-create-storage-error");
    await page.evaluate(() => { window.__failProjectWrite = false; });
    await button("Create").click();
    await page.getByRole("dialog").waitFor({ state: "hidden" });
    await button("Audit Project").waitFor();
    assert.equal(await projectFilter.innerText(), "Audit Project");
    assert.equal(await projectFilter.evaluate(e => document.activeElement === e), true);
    assert.equal(await page.getByRole("textbox", { name: "Search projects", exact: true }).inputValue(), "");
    await capture("project-created");
    await projectFilter.click();
    assert.equal(await page.getByRole("menuitemradio", { name: "Audit Project", exact: true }).getAttribute("aria-checked"), "true");
    await page.getByRole("menuitemradio", { name: "All projects", exact: true }).click();
    await visit("/settings/projects");
    await button("Audit Project").waitFor();
    await navOpen();
    // Exercise touch events on mobile, not a synthetic mouse hover through submenus.
    const activate = locator => device === "mobile" ? locator.tap() : locator.click();
    await activate(button("Account menu"));
    await activate(menuitem("Theme"));
    await page.getByRole("menu", { name: "Theme", exact: true }).waitFor();
    await capture("theme-menu");
    await activate(menuitem("Dark"));
    await page.waitForFunction(() => document.documentElement.classList.contains("dark"));
    await navClose();
    await visit("/settings/projects");
    await capture("projects-dark");
    await visit("/settings/profile");
    await capture("profile-dark");
    await button("Toggle theme").click();
    await navOpen();
    await button("Back to overview").click();
    await page.waitForURL(url => url.pathname === "/");
    if (device === "mobile") await page.getByRole("dialog", { name: "Sidebar", exact: true }).waitFor({ state: "hidden" });
    await navOpen();
    await button("Account menu").click();
    await menuitem("Log out").click();
    await page.waitForURL(url => url.pathname === "/sign-in");
    assert.deepEqual(errors, [], `${device}: runtime errors`);
    console.log(`PASS ${device}: all routes, navigation, filters, mixed selection, chart states, forms, responsive layout, theme, sign out`);
    await context.close();
  }
  await writeFile(`${out}/verified-layout.json`, JSON.stringify(layoutAudit, null, 2) + "\n");
  await writeFile(`${out}/verified-dropdowns.json`, JSON.stringify(dropdownAudit, null, 2) + "\n");
} catch (error) {
  await auditPage?.screenshot({ path: `${out}/audit-failure.png` });
  throw error;
} finally { await browser.close(); }
