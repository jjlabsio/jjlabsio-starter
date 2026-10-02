import assert from "node:assert/strict";

const origin = process.env.NEXT_PUBLIC_WEB_URL ?? "http://localhost:4000";
const response = await fetch(new URL("/pricing", origin));
assert.equal(response.status, 200);
const html = await response.text();
const comparison = html.match(/<section aria-labelledby="plan-comparison-title"[\s\S]*?<\/section>/)?.[0];
assert.ok(comparison, "Pricing includes the comparison section");
for (const category of ["Workspace", "Insights &amp; automation", "Support &amp; access"]) {
  assert.ok(comparison.includes(category), `Missing category: ${category}`);
}
for (const value of ["Starter", "Pro", "Premium", "$190", "$290", "$490", "Included", "Not included"]) {
  assert.ok(comparison.includes(value), `Missing value: ${value}`);
}
const rowCount = (comparison.match(/scope="row"/g) ?? []).length;
assert.ok(rowCount > 0);
assert.equal((comparison.match(/data-slot="table-cell"/g) ?? []).length, rowCount * 3);
console.log(`Pricing comparison passed: 3 plans, 3 categories, ${rowCount} feature rows`);
