import { readFile, rm, symlink } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import {
  cliCompletionCheckStage,
  cliCompletionGenerateStage,
  cliContractCheckStage,
  cliContractGenerateStage,
  cliGeneratedDiffStage,
  cliInstallStage,
  cliSchemaCheckStage,
  cliSchemaPublishStage,
  docsInstallStage,
  docsStage,
  executeMeta,
  executeMetaJson,
  executionLog,
  expectStagesOnceInOrder,
  metaCiStage,
  metaFixture,
  metaInstallStage,
  metaLocalStage,
  metaRoot,
  mutateRegistry,
  registry,
  skillsArchiveCreateStage,
  skillsArchiveDestinationStage,
  skillsArchiveExtractStage,
  skillsArchiveVerifyStage,
  skillsPackageStage,
  skillsSourceStage,
  write,
} from "./semantic-validation-entrypoints.fixtures";
describe("meta contract checker registration", () => {
  test.each(["local", "ci"] as const)(
    "%s aggregate rejects an omitted maintained checker before any child runs",
    async (mode) => {
      const root = await metaFixture();
      await write(
        join(root, "scripts/check-future-contracts.ts"),
        'throw new Error("omitted checker executed");\n',
      );

      const result = await executeMeta(root, mode);

      expect(result.status).not.toBe(0);
      expect(`${result.stdout}${result.stderr}`).toContain(
        "scripts/check-future-contracts.ts",
      );
      expect(await executionLog(root)).toBe("");
    },
  );
  test.each([
    [
      "stale",
      async (root: string) =>
        mutateRegistry(root, (items) => {
          items.push("scripts/check-missing-contracts.ts");
        }),
    ],
    [
      "duplicate",
      async (root: string) =>
        mutateRegistry(root, (items) => {
          items.push(items[0]);
        }),
    ],
    [
      "escaping",
      async (root: string) =>
        mutateRegistry(root, (items) => {
          items.push("../check-escape-contracts.ts");
        }),
    ],
    [
      "malformed",
      async (root: string) =>
        mutateRegistry(root, (items) => {
          items.push("scripts/check-Bad_contracts.ts");
        }),
    ],
    [
      "non-bytewise-sorted",
      async (root: string) =>
        mutateRegistry(root, (items) => {
          items.reverse();
        }),
    ],
    [
      "symlinked",
      async (root: string) => {
        await write(join(root, "outside.ts"), "process.exit(0);\n");
        await symlink(
          join(root, "outside.ts"),
          join(root, "scripts/check-linked-contracts.ts"),
        );
        await mutateRegistry(root, (items) => {
          items.push("scripts/check-linked-contracts.ts");
        });
      },
    ],
  ])(
    "both modes reject a %s registry before child execution",
    async (_label, mutate) => {
      for (const mode of ["local", "ci"] as const) {
        const root = await metaFixture();
        await mutate(root);

        const result = await executeMeta(root, mode);

        expect(result.status).not.toBe(0);
        expect(`${result.stdout}${result.stderr}`).toMatch(
          /registration|registry/i,
        );
        expect(await executionLog(root)).toBe("");
      }
    },
  );
});
describe("meta aggregate modes", () => {
  test("package scripts route local and CI checks through one registry-backed runner", async () => {
    const packageJson = JSON.parse(
      await readFile(join(metaRoot, "package.json"), "utf8"),
    );

    expect(packageJson.scripts["contracts:check"]).toBe(
      "node --experimental-strip-types scripts/run-contract-checks.ts",
    );
    expect(packageJson.scripts["contracts:check:ci"]).toBe(
      "node --experimental-strip-types scripts/run-contract-checks.ts --prevalidated-children",
    );
  });
  test("local and CI modes consume the same deterministic registry and differ only in child policy", async () => {
    const root = await metaFixture();

    const local = await executeMeta(root, "local");
    const localLog = await executionLog(root);
    await rm(join(root, "executed.log"), { force: true });
    const ci = await executeMeta(root, "ci");
    const ciLog = await executionLog(root);

    expect(local.status, `${local.stdout}${local.stderr}`).toBe(0);
    expect(ci.status, `${ci.stdout}${ci.stderr}`).toBe(0);
    expect(
      localLog
        .split("\n")
        .filter(Boolean)
        .map((line) => line.split(" ")[0]),
    ).toEqual(registry);
    expect(
      ciLog
        .split("\n")
        .filter(Boolean)
        .map((line) => line.split(" ")[0]),
    ).toEqual(registry);
    expect(localLog.split("\n").filter(Boolean)).toEqual(
      registry.map((identity) => `${identity} `),
    );
    expect(ciLog.split("\n").filter(Boolean)).toEqual([
      "scripts/check-command-contracts.ts --skip-focused-checkers",
      "scripts/check-documented-command-contracts.ts ",
      "scripts/check-executable-distribution-contracts.ts ",
      "scripts/check-hook-contracts.ts ",
      "scripts/check-inline-hook-contracts.ts ",
      "scripts/check-worktree-materialization-contracts.ts ",
      "scripts/check-worktree-naming-contracts.ts ",
    ]);
  });
  test("a child failure remains actionable and does not prevent later registered checks", async () => {
    const root = await metaFixture();
    await write(
      join(root, registry[0]),
      `import { appendFileSync } from "node:fs";\nappendFileSync("executed.log", ${JSON.stringify(registry[0])} + "\\n");\nconsole.error("command contract sentinel failure");\nprocess.exit(7);\n`,
    );

    const result = await executeMeta(root, "local");
    const output = `${result.stdout}${result.stderr}`;

    expect(result.status).not.toBe(0);
    expect(output).toContain("command contract sentinel failure");
    expect(output).toMatch(
      /\[NONZERO\] scripts\/check-command-contracts\.ts exited with status 7/,
    );
    expect(
      (await executionLog(root))
        .split("\n")
        .filter(Boolean)
        .map((line) => line.split(" ")[0]),
    ).toEqual(registry);
  });
  test("json mode emits one machine-readable aggregate document", async () => {
    const root = await metaFixture();
    for (const [index, identity] of registry.entries()) {
      await write(
        join(root, identity),
        `console.log(JSON.stringify({ ok: true, diagnostics: [{ severity: "info", category: "meta", code: "SENTINEL_${index}", source: ${JSON.stringify(identity)}, message: "sentinel" }] }));\n`,
      );
    }

    const result = await executeMetaJson(root, "local");
    const parsed = JSON.parse(result.stdout) as {
      ok: boolean;
      diagnostics: Array<{ code: string }>;
    };

    expect(result.status, result.stderr).toBe(0);
    expect(parsed.ok).toBe(true);
    expect(parsed.diagnostics.map(({ code }) => code)).toEqual(
      registry.map((_, index) => `SENTINEL_${index}`),
    );
    expect(result.stdout).not.toContain("Contract checker registration passed");
    expect(result.stdout).not.toContain("== Contract checker:");
  });
  test("json mode reports registration failure as one machine-readable document", async () => {
    const root = await metaFixture();
    await mutateRegistry(root, (items) => {
      items.reverse();
    });

    const result = await executeMetaJson(root, "local");
    const parsed = JSON.parse(result.stdout) as {
      ok: boolean;
      diagnostics: Array<{ code: string }>;
    };

    expect(result.status).not.toBe(0);
    expect(parsed.ok).toBe(false);
    expect(parsed.diagnostics.map(({ code }) => code)).toContain(
      "CONTRACT_CHECKER_REGISTRATION_INVALID",
    );
    expect(await executionLog(root)).toBe("");
  });
});
describe("coordinated local and workflow composition", () => {
  test("documented local validation names each stable semantic stage exactly once", async () => {
    const guidance = await readFile(
      join(metaRoot, "docs/cross-repo-command-contracts.md"),
      "utf8",
    );
    expectStagesOnceInOrder(guidance, [
      metaInstallStage,
      cliInstallStage,
      cliSchemaPublishStage,
      cliSchemaCheckStage,
      cliContractGenerateStage,
      cliContractCheckStage,
      cliCompletionGenerateStage,
      cliCompletionCheckStage,
      cliGeneratedDiffStage,
      docsInstallStage,
      docsStage,
      skillsSourceStage,
      skillsArchiveCreateStage,
      skillsArchiveVerifyStage,
      skillsArchiveDestinationStage,
      skillsArchiveExtractStage,
      skillsPackageStage,
      metaLocalStage,
    ]);
    expect(guidance).toMatch(/canonical release archive/i);
    expect(guidance).toMatch(/contract:generate/);
  });
  test("authoritative workflow runs each stable stage once without separate docs generation or focused enumeration", async () => {
    const workflow = await readFile(
      join(metaRoot, ".github/workflows/cross-repo-command-contracts.yml"),
      "utf8",
    );
    expectStagesOnceInOrder(workflow, [
      metaInstallStage,
      cliInstallStage,
      cliSchemaPublishStage,
      cliSchemaCheckStage,
      cliContractGenerateStage,
      cliContractCheckStage,
      cliCompletionGenerateStage,
      cliCompletionCheckStage,
      cliGeneratedDiffStage,
      docsInstallStage,
      docsStage,
      skillsSourceStage,
      skillsArchiveCreateStage,
      skillsArchiveVerifyStage,
      skillsArchiveDestinationStage,
      skillsArchiveExtractStage,
      skillsPackageStage,
      metaCiStage,
    ]);
    expect(workflow).not.toContain("pnpm --dir repos/arashi-docs sync:content");
    expect(workflow).not.toMatch(
      /node repos\/arashi-skills\/scripts\/[a-z0-9-]+-guidance-selftest\.mjs/,
    );
  });
  test("authoritative workflow is manual-only and records exact child revisions", async () => {
    const workflow = await readFile(
      join(metaRoot, ".github/workflows/cross-repo-command-contracts.yml"),
      "utf8",
    );
    expect(workflow).toMatch(/on:\n  workflow_dispatch:\n/);
    expect(workflow).not.toMatch(/pull_request:\n(?:    .+\n)*?    paths:/);
    expect(workflow).toContain("github.workflow_ref");
    expect(workflow).toContain("github.workflow_sha");
    expect(workflow).toContain("name: Write revision manifest");
    expect(workflow).toContain("name: cross-repo-revisions");
    expect(workflow).toContain("if-no-files-found: error");
  });
});
describe("registered skills aggregate executable reachability", () => {
  test("feature-era reachability is aggregate-based and retains explicit ordinary-fixture skip policy", async () => {
    const commandTests = await readFile(
      join(metaRoot, "tests/command-contracts.fixtures.ts"),
      "utf8",
    );
    const hookTests = await readFile(
      join(metaRoot, "tests/hook-contracts.test.ts"),
      "utf8",
    );
    const combined = `${commandTests}\n${hookTests}`;

    expect(combined).toContain("validate-guidance.mjs");
    expect(combined).toContain("--skill-root package-check/skills/arashi");
    expect(combined).toContain("runFocusedCheckers: false");
  });
});
