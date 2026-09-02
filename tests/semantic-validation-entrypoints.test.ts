import { afterEach, describe, expect, test } from "vitest";
import {
  cp,
  mkdtemp,
  mkdir,
  readFile,
  readdir,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

const roots: string[] = [];
const metaRoot = process.cwd();
const registryPath = "scripts/contract-checks.json";
const registry = [
  "scripts/check-command-contracts.ts",
  "scripts/check-documented-command-contracts.ts",
  "scripts/check-executable-distribution-contracts.ts",
  "scripts/check-hook-contracts.ts",
  "scripts/check-inline-hook-contracts.ts",
  "scripts/check-worktree-materialization-contracts.ts",
  "scripts/check-worktree-naming-contracts.ts",
];
const metaInstallStage = "pnpm install --frozen-lockfile";
const cliInstallStage = "pnpm --dir repos/arashi install --frozen-lockfile";
const cliSchemaPublishStage = "pnpm --dir repos/arashi schema:publish";
const cliSchemaCheckStage = "pnpm --dir repos/arashi schema:check";
const cliContractGenerateStage = "pnpm --dir repos/arashi contract:generate";
const cliContractCheckStage = "pnpm --dir repos/arashi contract:check";
const cliCompletionGenerateStage =
  "pnpm --dir repos/arashi completion:generate";
const cliCompletionCheckStage = "pnpm --dir repos/arashi completion:check";
const cliGeneratedDiffStage =
  "git -C repos/arashi diff --exit-code -- schema/config.schema.json contracts/cli-commands.json contracts/executable-distribution.json src/generated/completions.ts";
const docsInstallStage =
  "pnpm --dir repos/arashi-docs install --frozen-lockfile";
const docsStage = "pnpm --dir repos/arashi-docs validate:semantic-docs";
const skillsSourceStage =
  "node repos/arashi-skills/scripts/validate-guidance.mjs";
const skillsPackageStage = `${skillsSourceStage} --skill-root package-check/skills/arashi`;
const skillsArchiveCreateStage =
  "node repos/arashi-skills/scripts/create-release-archive.mjs --root repos/arashi-skills --output arashi-skill-package.tar.gz";
const skillsArchiveVerifyStage =
  "node repos/arashi-skills/scripts/create-release-archive.mjs --verify arashi-skill-package.tar.gz";
const skillsArchiveDestinationStage = "mkdir package-check";
const skillsArchiveExtractStage =
  "tar -xzf arashi-skill-package.tar.gz -C package-check";
const metaLocalStage = "pnpm contracts:check";
const metaCiStage = "pnpm contracts:check:ci";

function run(command: string, args: string[], cwd: string) {
  return spawnSync(command, args, {
    cwd,
    encoding: "utf8",
    env: { ...process.env, NO_COLOR: "1" },
  });
}

async function write(path: string, content: string) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, content);
}

async function metaFixture() {
  const root = await mkdtemp(join(tmpdir(), "arashi-meta-entrypoints-"));
  roots.push(root);
  await cp(join(metaRoot, "scripts"), join(root, "scripts"), {
    recursive: true,
  });
  await cp(join(metaRoot, "package.json"), join(root, "package.json"));
  await write(
    join(root, registryPath),
    `${JSON.stringify(registry, null, 2)}\n`,
  );
  for (const identity of registry) {
    await write(
      join(root, identity),
      `import { appendFileSync } from "node:fs";\nappendFileSync("executed.log", ${JSON.stringify(identity)} + " " + process.argv.slice(2).join(" ") + "\\n");\n`,
    );
  }
  return root;
}

async function executeMeta(root: string, mode: "local" | "ci") {
  return run(
    "pnpm",
    ["run", mode === "local" ? "contracts:check" : "contracts:check:ci"],
    root,
  );
}

async function executeMetaJson(root: string, mode: "local" | "ci") {
  return run(
    "pnpm",
    [
      "--silent",
      "run",
      mode === "local" ? "contracts:check" : "contracts:check:ci",
      "--json",
    ],
    root,
  );
}

async function executionLog(root: string) {
  try {
    return await readFile(join(root, "executed.log"), "utf8");
  } catch {
    return "";
  }
}

async function mutateRegistry(
  root: string,
  mutate: (entries: string[]) => Promise<void> | void,
) {
  const entries = JSON.parse(
    await readFile(join(root, registryPath), "utf8"),
  ) as string[];
  await mutate(entries);
  await writeFile(join(root, registryPath), `${JSON.stringify(entries)}\n`);
}

function executableCommands(source: string): string[] {
  return source
    .split(/\r?\n/)
    .map((line) => line.trim())
    .map((line) => line.replace(/^-\s+/, "").replace(/^run:\s*/, ""))
    .map((line) => line.replace(/^`([^`]+)`[.;]?$/, "$1"))
    .filter(Boolean);
}

function expectStagesOnceInOrder(source: string, stages: string[]) {
  const commands = executableCommands(source);
  const indexes = stages.map((stage) => {
    const matches = commands
      .map((command, index) => (command === stage ? index : -1))
      .filter((index) => index >= 0);
    expect(matches, `executable stage: ${stage}`).toHaveLength(1);
    return matches[0];
  });
  expect(indexes).toEqual([...indexes].sort((left, right) => left - right));
}

async function skillsFixture(failingMode: "source" | "package") {
  const source = join(metaRoot, "repos/arashi-skills");
  const root = await mkdtemp(join(tmpdir(), "arashi-skills-aggregate-"));
  roots.push(root);
  await cp(join(source, "scripts"), join(root, "scripts"), { recursive: true });
  await cp(join(source, "skills"), join(root, "skills"), { recursive: true });

  const identities = (await readdir(join(root, "scripts")))
    .filter((name) =>
      /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?-guidance-selftest\.mjs$/.test(name),
    )
    .map((name) => `scripts/${name}`)
    .sort((left, right) => Buffer.from(left).compare(Buffer.from(right)));
  await write(
    join(root, "scripts/guidance-checkers.json"),
    `${JSON.stringify(identities, null, 2)}\n`,
  );
  for (const identity of identities) {
    const isSentinel = identity === identities[0];
    await write(
      join(root, identity),
      `const packaged = process.argv.includes("--skill-root");\nconsole.log(${JSON.stringify(`sentinel:${identity}`)});\n${
        isSentinel
          ? `if (${JSON.stringify(failingMode)} === (packaged ? "package" : "source")) { console.error("sentinel semantic failure"); process.exit(23); }\n`
          : ""
      }`,
    );
  }
  return { root, sentinel: identities[0] };
}

afterEach(async () => {
  await Promise.all(
    roots.splice(0).map((root) => rm(root, { recursive: true, force: true })),
  );
});

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

  test("authoritative workflow always reports on pull requests and records exact child revisions", async () => {
    const workflow = await readFile(
      join(metaRoot, ".github/workflows/cross-repo-command-contracts.yml"),
      "utf8",
    );
    expect(workflow).toMatch(
      /on:\n  workflow_call:[\s\S]+?  pull_request:\n  push:/,
    );
    expect(workflow).not.toMatch(/pull_request:\n(?:    .+\n)*?    paths:/);
    expect(workflow).toContain("jobContext.workflow_repository");
    expect(workflow).toContain("jobContext.workflow_sha");
    expect(workflow).toContain("name: Write revision manifest");
    expect(workflow).toContain("name: cross-repo-revisions");
    expect(workflow).toContain("if-no-files-found: error");
  });
});

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

  test("feature-era reachability is aggregate-based and retains explicit ordinary-fixture skip policy", async () => {
    const commandTests = await readFile(
      join(metaRoot, "tests/command-contracts.test.ts"),
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
