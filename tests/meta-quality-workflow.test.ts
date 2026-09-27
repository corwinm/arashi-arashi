import { readFile } from "node:fs/promises";
import { describe, expect, test } from "vitest";

const path = ".github/workflows/meta-quality.yml";

describe("automatic meta-only quality", () => {
  test("checks this repository on every PR and main push without resolving children", async () => {
    const source = await readFile(path, "utf8");
    expect(source).toMatch(
      /on:\n  pull_request:\n  push:\n    branches: \[main\]/,
    );
    expect(source).toContain("name: Meta quality checks");
    expect(source).toContain("permissions:\n  contents: read");
    expect(source.match(/uses: actions\/checkout@/g)).toHaveLength(1);
    expect(source).toContain("persist-credentials: false");
    expect(source).not.toMatch(
      /repository:|repos\/|git fetch|contracts:check|workflow_call|paths:|continue-on-error:/,
    );
    for (const command of [
      "pnpm install --frozen-lockfile",
      "pnpm test",
      "pnpm typecheck",
      "pnpm format:check",
    ]) {
      expect(source).toContain(`run: ${command}\n`);
    }
  });

  test("keeps live-child tests explicit and after revision evidence", async () => {
    const pkg = JSON.parse(await readFile("package.json", "utf8"));
    expect(pkg.scripts["test:integration"]).toBe(
      "vitest run --config vitest.integration.config.ts",
    );
    const source = await readFile(
      ".github/workflows/cross-repo-command-contracts.yml",
      "utf8",
    );
    expect(source.indexOf("run: pnpm test:integration")).toBeGreaterThan(
      source.indexOf("name: Upload revision manifest"),
    );
  });
});
