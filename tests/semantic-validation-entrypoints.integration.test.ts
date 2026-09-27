import { cp } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import {
  run,
  skillsFixture,
  write,
} from "./semantic-validation-entrypoints.fixtures";
describe("registered skills aggregate executable reachability", () => {
  test("source aggregate propagates a registered checker failure with its identity and diagnostics", async () => {
    const { root, sentinel } = await skillsFixture("source");

    const result = run("node", ["scripts/validate-guidance.mjs"], root);

    expect(result.status).not.toBe(0);
    expect(`${result.stdout}${result.stderr}`).toContain(sentinel);
    expect(`${result.stdout}${result.stderr}`).toContain(
      "sentinel semantic failure",
    );
  });
  test("canonical extracted-package aggregate propagates package-only drift with checker diagnostics", async () => {
    const { root, sentinel } = await skillsFixture("package");
    const extracted = join(root, "package-check/skills/arashi");
    await cp(join(root, "skills/arashi"), extracted, { recursive: true });
    await write(join(extracted, "PACKAGE-DRIFT"), "package-only mutation\n");

    const sourceResult = run("node", ["scripts/validate-guidance.mjs"], root);
    const packageResult = run(
      "node",
      ["scripts/validate-guidance.mjs", "--skill-root", extracted],
      root,
    );

    expect(
      sourceResult.status,
      `${sourceResult.stdout}${sourceResult.stderr}`,
    ).toBe(0);
    expect(packageResult.status).not.toBe(0);
    expect(`${packageResult.stdout}${packageResult.stderr}`).toContain(
      sentinel,
    );
    expect(`${packageResult.stdout}${packageResult.stderr}`).toContain(
      "sentinel semantic failure",
    );
  });
});
