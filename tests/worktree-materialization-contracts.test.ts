import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import { metaRoot } from "./worktree-materialization-contracts.fixtures";
describe("worktree materialization coordinated contract", () => {
  test("is registered in the fail-closed aggregate", async () => {
    const registry = JSON.parse(
      await readFile(join(metaRoot, "scripts/contract-checks.json"), "utf8"),
    ) as string[];
    expect(registry).toContain(
      "scripts/check-worktree-materialization-contracts.ts",
    );
  });
});
