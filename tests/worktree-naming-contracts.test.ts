import { spawnSync } from "node:child_process";
import { afterEach, describe, expect, test } from "vitest";
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";

const metaRoot = process.cwd();
const roots: string[] = [];
const checkerIdentity = "scripts/check-worktree-naming-contracts.ts";
const sources = [
  "repos/arashi/schema/config.schema.json",
  "repos/arashi/docs/configuration.md",
  "repos/arashi-docs/docs/workflows/config.md",
  "repos/arashi-docs/docs/commands/create.md",
  "repos/arashi-docs/public/workflows/config.md",
  "repos/arashi-docs/public/commands/create.md",
  "repos/arashi-docs/public/llms-full.txt",
  "repos/arashi-docs/public/llms.txt",
  "repos/arashi-docs/scripts/semantic-doc-checks.json",
  "repos/arashi-skills/skills/arashi/references/commands/create.md",
  "repos/arashi-skills/scripts/guidance-checkers.json",
] as const;

async function fixture() {
  const root = await mkdtemp(
    join(tmpdir(), "arashi-worktree-naming-contract-"),
  );
  roots.push(root);
  for (const source of sources) {
    const destination = join(root, source);
    await mkdir(dirname(destination), { recursive: true });
    await cp(join(metaRoot, source), destination);
  }
  for (const script of [
    checkerIdentity,
    "scripts/check-contract-registration.ts",
    "scripts/run-contract-checks.ts",
  ] as const) {
    const destination = join(root, script);
    await mkdir(dirname(destination), { recursive: true });
    await cp(join(metaRoot, script), destination);
  }
  await writeFile(
    join(root, "scripts/contract-checks.json"),
    `${JSON.stringify([checkerIdentity], null, 2)}\n`,
  );
  return root;
}
const runFocused = (root: string) =>
  spawnSync(
    process.execPath,
    ["--experimental-strip-types", join(root, checkerIdentity), "--json"],
    { cwd: root, encoding: "utf8" },
  );
const runAggregate = (root: string) =>
  spawnSync(
    process.execPath,
    [
      "--experimental-strip-types",
      join(root, "scripts/run-contract-checks.ts"),
      "--json",
    ],
    { cwd: root, encoding: "utf8" },
  );
async function replace(
  root: string,
  source: string,
  oldText: string,
  newText: string,
) {
  const path = join(root, source);
  const content = await readFile(path, "utf8");
  expect(content).toContain(oldText);
  await writeFile(path, content.replace(oldText, newText));
}
function expectRejected(root: string, label: string) {
  const focused = runFocused(root);
  const aggregate = runAggregate(root);
  expect(
    focused.status,
    `${label} focused false green:\n${focused.stdout}${focused.stderr}`,
  ).not.toBe(0);
  expect(
    aggregate.status,
    `${label} aggregate false green:\n${aggregate.stdout}${aggregate.stderr}`,
  ).not.toBe(0);
}
afterEach(async () =>
  Promise.all(
    roots.splice(0).map((root) => rm(root, { force: true, recursive: true })),
  ),
);

describe("worktree naming cross-repository contract", () => {
  test("is registered in the fail-closed aggregate", async () => {
    const registry = JSON.parse(
      await readFile(join(metaRoot, "scripts/contract-checks.json"), "utf8"),
    ) as string[];
    expect(registry).toContain(checkerIdentity);
  });
  test("accepts the coordinated child heads through focused and aggregate paths", async () => {
    const root = await fixture();
    expect(runFocused(root).status).toBe(0);
    expect(runAggregate(root).status).toBe(0);
  });
  test("rejects every removed destination row through both paths", async () => {
    const source = "repos/arashi-docs/docs/workflows/config.md";
    const rows = [
      "| Bare `default` + `preserve` | `example/feature/auth` |",
      "| Bare `default` + `flatten` | `example/feature-auth` |",
      "| Bare `branch` + `preserve` | `feature/auth` |",
      "| Bare `branch` + `flatten` | `feature-auth` |",
      "| Bare `repo-branch` + `preserve` | `example-feature/auth` |",
      "| Bare `repo-branch` + `flatten` | `example-feature-auth` |",
      "| Non-bare `default` + `preserve` | `feature/auth` |",
      "| Non-bare `default` + `flatten` | `feature-auth` |",
      "| Non-bare `branch` + `preserve` | `feature/auth` |",
      "| Non-bare `branch` + `flatten` | `feature-auth` |",
      "| Non-bare `repo-branch` + `preserve` | `example-feature/auth` |",
      "| Non-bare `repo-branch` + `flatten` | `example-feature-auth` |",
    ];
    for (const row of rows) {
      const root = await fixture();
      await replace(root, source, row, "");
      expectRejected(root, row);
    }
  }, 20_000);
  test("rejects schema closure, enum, optionality, version, and stale-style drift", async () => {
    const source = "repos/arashi/schema/config.schema.json";
    const mutations: [string, (schema: any) => void][] = [
      [
        "open naming object",
        (schema) => {
          schema.definitions.WorktreeNamingConfig.additionalProperties = true;
        },
      ],
      [
        "open root",
        (schema) => {
          schema.definitions.Config.additionalProperties = true;
        },
      ],
      [
        "required naming object",
        (schema) => {
          schema.definitions.Config.required.push("worktreeNaming");
        },
      ],
      [
        "style enum",
        (schema) => {
          schema.definitions.WorktreeNamingStyle.enum = ["default", "branch"];
        },
      ],
      [
        "slash enum",
        (schema) => {
          schema.definitions.WorktreeNamingBranchSlashes.enum = ["preserve"];
        },
      ],
      [
        "current alias",
        (schema) => {
          schema.definitions.WorktreeNamingStyle.enum.push("current");
        },
      ],
      [
        "version",
        (schema) => {
          schema.definitions.ConfigVersion.const = "1.1.0";
        },
      ],
    ];
    for (const [label, mutate] of mutations) {
      const root = await fixture();
      const path = join(root, source);
      const schema = JSON.parse(await readFile(path, "utf8"));
      mutate(schema);
      await writeFile(path, `${JSON.stringify(schema, null, 2)}\n`);
      expectRejected(root, label);
    }
  }, 20_000);
  test("rejects removed defaults and guarantees plus additive contradictions", async () => {
    const source = "repos/arashi-docs/docs/workflows/config.md";
    const drifts: [string, string, string][] = [
      [
        "default omission",
        "Omitting `style` means `default`",
        "Omitting style is unspecified",
      ],
      [
        "slash omission",
        "omitting `branchSlashes` means `preserve`",
        "omitting branchSlashes is unspecified",
      ],
      [
        "branch identity",
        "Git branch remains exactly `feature/auth`",
        "Git reference behavior is unspecified",
      ],
      [
        "collision",
        "fails deterministically instead of appending a suffix",
        "collision handling is unspecified",
      ],
      [
        "metadata",
        "Existing worktree paths are metadata-authoritative",
        "Existing worktree paths are historical",
      ],
      [
        "children",
        "Coordinated children remain under the planned parent path using their configured child paths",
        "Child placement is unspecified",
      ],
      [
        "standalone",
        "Standalone `.worktrees/<branch>` placement is unchanged",
        "Standalone placement is unspecified",
      ],
      [
        "additive suffix",
        "Standalone `.worktrees/<branch>` placement is unchanged.",
        "Standalone `.worktrees/<branch>` placement is unchanged. Despite the rule above, a collision may append a numeric suffix.",
      ],
      [
        "additive branch rewrite",
        "Standalone `.worktrees/<branch>` placement is unchanged.",
        "Standalone `.worktrees/<branch>` placement is unchanged. The mapper changes the Git branch to `feature-auth`.",
      ],
      [
        "additive relocation",
        "Standalone `.worktrees/<branch>` placement is unchanged.",
        "Standalone `.worktrees/<branch>` placement is unchanged. Changing naming moves existing worktrees.",
      ],
    ];
    for (const [label, oldText, newText] of drifts) {
      const root = await fixture();
      await replace(root, source, oldText, newText);
      expectRejected(root, label);
    }
  }, 20_000);
  test("rejects stale child checker registrations", async () => {
    for (const [source, identity] of [
      [
        "repos/arashi-docs/scripts/semantic-doc-checks.json",
        "check-worktree-naming-docs.ts",
      ],
      [
        "repos/arashi-skills/scripts/guidance-checkers.json",
        "scripts/worktree-naming-guidance-selftest.mjs",
      ],
    ] as const) {
      const root = await fixture();
      await replace(root, source, `  "${identity}"`, "");
      expectRejected(root, identity);
    }
  });
});
