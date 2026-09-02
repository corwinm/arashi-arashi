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
  "repos/arashi-docs/docs/commands/create.md",
  "repos/arashi-docs/public/commands/create.md",
  "repos/arashi-docs/public/llms-full.txt",
  "repos/arashi-docs/public/llms.txt",
  "repos/arashi-docs/scripts/semantic-doc-checks.json",
  "repos/arashi-skills/skills/arashi/references/commands/create.md",
  "repos/arashi-skills/scripts/guidance-checkers.json",
] as const;

const schemaSource = "repos/arashi/schema/config.schema.json";
const cliGuidanceSource = "repos/arashi/docs/configuration.md";
const pathBudgetGuidanceSources = [
  cliGuidanceSource,
  "repos/arashi-docs/docs/commands/create.md",
  "repos/arashi-docs/public/commands/create.md",
  "repos/arashi-docs/public/llms-full.txt",
  "repos/arashi-docs/public/llms.txt",
  "repos/arashi-skills/skills/arashi/references/commands/create.md",
] as const;
const exactExampleSources = pathBudgetGuidanceSources.filter(
  (source) => source !== "repos/arashi-docs/public/llms.txt",
);
const ownerCode = (source: string) => {
  if (source === cliGuidanceSource)
    return "WORKTREE_NAMING_CLI_GUIDANCE_MISMATCH";
  if (source.startsWith("repos/arashi-skills/"))
    return "WORKTREE_NAMING_SKILL_GUIDANCE_MISMATCH";
  if (source.includes("/public/llms"))
    return "WORKTREE_NAMING_DOCS_EXPORT_MISMATCH";
  if (source.startsWith("repos/arashi-docs/public/"))
    return "WORKTREE_NAMING_DOCS_GENERATED_MISMATCH";
  return "WORKTREE_NAMING_DOCS_SOURCE_MISMATCH";
};
const exactPathBudgetExample = `\`\`\`json
{
  "worktreeNaming": {
    "style": "repo-branch",
    "branchSlashes": "flatten",
    "maxPathLength": 180
  }
}
\`\`\``;
const pathBudgetContract = `${exactPathBudgetExample}

Omitting \`style\` means \`default\`, and omitting \`branchSlashes\` means \`preserve\`.

\`maxPathLength\` is an optional positive integer from 1 through 2,147,483,647. It limits each full absolute newly planned configured-worktree destination in UTF-16 code units, rather than limiting one folder component. Omitting \`maxPathLength\` preserves current path bytes; Arashi does not infer, persist, or migrate a platform or Windows default.

If every selected destination fits the budget, its path remains exact. Only newly planned configured paths may shorten. When the budget is exceeded, Arashi shortens the generated parent namespace to a readable prefix followed by \`-\` and the first eight lowercase SHA-256 hexadecimal characters of the portable \`/\`-separated ordinary namespace. If the chosen destination collides, create fails deterministically instead of appending a suffix; it never appends a numeric suffix.

Arashi sizes one authoritative parent against all selected coordinated child paths, even when selection excludes the parent; child-relative paths remain unchanged and children never shorten independently. Coordinated children remain under the planned parent path using their configured child paths. If fixed base and child topology leave fewer than nine UTF-16 code units for \`-<eight-hex-hash>\`, create reports \`WORKTREE_PATH_LENGTH_EXCEEDED\` before mutation. Its details contain exactly \`repositoryName\`, \`worktreePath\`, \`maxPathLength\`, and \`minimumPathLength\`; \`worktreePath\` is the ordinary absolute planned path and \`minimumPathLength\` is the shortest collision-resistant absolute length.

The Git branch remains exactly \`feature/auth\`. Existing worktree paths are metadata-authoritative and are never renamed by this setting. Standalone \`.worktrees/<branch>\` placement is unchanged and ignores \`maxPathLength\`. The budget reserves space only for each worktree root; it cannot guarantee repository-internal file paths fit.`;

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
async function canonicalFixture() {
  const root = await fixture();
  const schemaPath = join(root, schemaSource);
  const schema = JSON.parse(await readFile(schemaPath, "utf8"));
  schema.definitions.WorktreeNamingConfig.properties.maxPathLength = {
    description:
      "Maximum UTF-16 length of each absolute configured worktree destination",
    maximum: 2147483647,
    minimum: 1,
    multipleOf: 1,
    type: "number",
  };
  delete schema.definitions.WorktreeNamingConfig.required;
  await writeFile(schemaPath, `${JSON.stringify(schema, null, 2)}\n`);
  for (const source of pathBudgetGuidanceSources) {
    const path = join(root, source);
    const content = await readFile(path, "utf8");
    await writeFile(path, `${content}\n\n${pathBudgetContract}\n`);
  }
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
  await writeFile(path, content.replaceAll(oldText, newText));
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
function focusedDiagnostics(root: string) {
  const result = runFocused(root);
  return {
    diagnostics: JSON.parse(result.stdout).diagnostics as {
      code: string;
      message: string;
      source: string;
    }[],
    result,
  };
}
function expectOwnerDiagnostic(
  root: string,
  label: string,
  source: string,
  code: string,
) {
  expectRejected(root, label);
  const { diagnostics } = focusedDiagnostics(root);
  expect(
    diagnostics,
    `${label} lacks owner-specific diagnostic`,
  ).toContainEqual(expect.objectContaining({ code, source }));
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
  test("accepts a controlled canonical path-budget contract", async () => {
    const root = await canonicalFixture();
    expect(runFocused(root).status).toBe(0);
    expect(runAggregate(root).status).toBe(0);
  });
  test("rejects maxPathLength schema removal, type, bounds, and required drift", async () => {
    const mutations: [string, (schema: any) => void][] = [
      [
        "field removal",
        (schema) =>
          delete schema.definitions.WorktreeNamingConfig.properties
            .maxPathLength,
      ],
      [
        "missing integer constraint",
        (schema) =>
          delete schema.definitions.WorktreeNamingConfig.properties
            .maxPathLength.multipleOf,
      ],
      [
        "minimum",
        (schema) =>
          (schema.definitions.WorktreeNamingConfig.properties.maxPathLength.minimum = 0),
      ],
      [
        "maximum",
        (schema) =>
          (schema.definitions.WorktreeNamingConfig.properties.maxPathLength.maximum = 2147483648),
      ],
      [
        "required field",
        (schema) =>
          (schema.definitions.WorktreeNamingConfig.required = [
            "maxPathLength",
          ]),
      ],
    ];
    for (const [label, mutate] of mutations) {
      const root = await canonicalFixture();
      const path = join(root, schemaSource);
      const schema = JSON.parse(await readFile(path, "utf8"));
      mutate(schema);
      await writeFile(path, `${JSON.stringify(schema, null, 2)}\n`);
      expectOwnerDiagnostic(
        root,
        label,
        schemaSource,
        "WORKTREE_NAMING_CLI_SCHEMA_MISMATCH",
      );
    }
  }, 20_000);
  test("rejects path-budget removal on every maintained guidance surface", async () => {
    for (const source of pathBudgetGuidanceSources) {
      const root = await canonicalFixture();
      const path = join(root, source);
      const content = await readFile(path, "utf8");
      await writeFile(
        path,
        content
          .replaceAll(pathBudgetContract, "")
          .replaceAll(
            /```json\n\{\n  "worktreeNaming": \{\n    "style": "repo-branch",\n    "branchSlashes": "flatten",\n    "maxPathLength": 180\n  \}\n\}\n```/g,
            "",
          )
          .replaceAll(/^.*maxPathLength.*$/gm, ""),
      );
      expectOwnerDiagnostic(
        root,
        `removed ${source}`,
        source,
        ownerCode(source),
      );
    }
  }, 30_000);
  test("rejects exact nested maxPathLength example drift on docs and skill surfaces", async () => {
    for (const source of exactExampleSources) {
      const root = await canonicalFixture();
      const path = join(root, source);
      const content = await readFile(path, "utf8");
      expect(content).toContain('"maxPathLength": 180');
      await writeFile(
        path,
        content.replaceAll('"maxPathLength": 180', '"maxPathLength": 181'),
      );
      expectOwnerDiagnostic(
        root,
        `example drift ${source}`,
        source,
        ownerCode(source),
      );
    }
  }, 30_000);
  test("rejects semantic mutation on every maintained guidance surface", async () => {
    for (const source of pathBudgetGuidanceSources) {
      const root = await canonicalFixture();
      const path = join(root, source);
      const content = await readFile(path, "utf8");
      expect(content).toContain(
        "UTF-16 code units, rather than limiting one folder component",
      );
      await writeFile(
        path,
        content
          .replaceAll("UTF-16", "Unicode-code-point")
          .replaceAll(
            "rather than limiting one folder component",
            "and limits one folder component",
          ),
      );
      expectOwnerDiagnostic(
        root,
        `measurement and scope drift ${source}`,
        source,
        ownerCode(source),
      );
    }
  }, 30_000);
  test("rejects additive path-budget contradictions on every maintained guidance surface", async () => {
    const contradictions = [
      "On Windows, omission automatically selects a maxPathLength default of 260.",
      "The budget limits only the generated folder component, not the absolute configured destination.",
      "Path length is measured in Unicode code points rather than UTF-16 code units.",
      "A collision may append a numeric suffix after the eight-hex hash.",
      "Each coordinated child shortens its parent namespace independently.",
      "This setting guarantees that every repository-internal file path fits.",
      "Changing maxPathLength renames existing registered worktrees.",
      "Standalone .worktrees/<branch> creation also applies maxPathLength.",
    ];
    for (const source of pathBudgetGuidanceSources) {
      for (const contradiction of contradictions) {
        const root = await canonicalFixture();
        const path = join(root, source);
        const content = await readFile(path, "utf8");
        await writeFile(path, `${content}\n${contradiction}\n`);
        expectOwnerDiagnostic(
          root,
          `additive contradiction ${source}: ${contradiction}`,
          source,
          ownerCode(source),
        );
      }
    }
  }, 60_000);
  test("rejects removal of condition-bound overflow semantics", async () => {
    const failureContract =
      "If fixed base and child topology leave fewer than nine UTF-16 code units for `-<eight-hex-hash>`, create reports `WORKTREE_PATH_LENGTH_EXCEEDED` before mutation.";
    for (const source of pathBudgetGuidanceSources) {
      const root = await canonicalFixture();
      const path = join(root, source);
      const content = await readFile(path, "utf8");
      await writeFile(
        path,
        content
          .replaceAll(failureContract, "")
          .replaceAll(
            "WORKTREE_PATH_LENGTH_EXCEEDED",
            "WORKTREE_PATH_BUDGET_FAILED",
          ),
      );
      expectOwnerDiagnostic(
        root,
        `overflow failure semantics ${source}`,
        source,
        ownerCode(source),
      );
    }

    const root = await canonicalFixture();
    const path = join(root, cliGuidanceSource);
    const content = await readFile(path, "utf8");
    await writeFile(
      path,
      content
        .replaceAll(
          "Its details contain exactly `repositoryName`, `worktreePath`, `maxPathLength`, and `minimumPathLength`; `worktreePath` is the ordinary absolute planned path and `minimumPathLength` is the shortest collision-resistant absolute length.",
          "",
        )
        .replaceAll(
          "and reports the repository, ordinary planned path, configured limit,\nand minimum required length",
          "and reports no structured length context",
        ),
    );
    expectOwnerDiagnostic(
      root,
      "CLI overflow details and meanings",
      cliGuidanceSource,
      ownerCode(cliGuidanceSource),
    );
  }, 30_000);
  test("keeps canonical truthful-negation controls green", async () => {
    const root = await canonicalFixture();
    const controls =
      "The budget does not limit only one folder component. Omission does not choose an automatic Windows default. Collisions never append a numeric suffix. Children never shorten independently. Existing registered worktrees are not renamed. Standalone creation does not apply the setting. Repository-internal file paths are not guaranteed to fit.";
    for (const source of pathBudgetGuidanceSources) {
      const path = join(root, source);
      const content = await readFile(path, "utf8");
      await writeFile(path, `${content}\n${controls}\n`);
    }
    expect(runFocused(root).status).toBe(0);
    expect(runAggregate(root).status).toBe(0);
  });
  test("rejects every removed destination row through both paths", async () => {
    const source = "repos/arashi-docs/docs/commands/create.md";
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
        "nested style required",
        (schema) => {
          schema.definitions.WorktreeNamingConfig.required = ["style"];
        },
      ],
      [
        "malformed nested required",
        (schema) => {
          schema.definitions.WorktreeNamingConfig.required = "style";
        },
      ],
      [
        "detached naming definition",
        (schema) => {
          schema.definitions.Config.properties.worktreeNaming = {
            type: "string",
          };
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
        "detached version definition",
        (schema) => {
          schema.definitions.Config.properties.version.$ref =
            "#/definitions/WorktreeNamingStyle";
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
    const source = "repos/arashi-docs/docs/commands/create.md";
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
  test("rejects polarity, closed-value, default, CLI destination, and generated contradictions", async () => {
    const drifts: [string, string, string, string][] = [
      [
        "interactive reversal",
        "repos/arashi-docs/docs/commands/create.md",
        "not available in interactive `aw configure`",
        "available through interactive `aw configure`; direct JSON editing is unnecessary",
      ],
      [
        "custom style",
        "repos/arashi-docs/docs/commands/create.md",
        "`style`: `default | branch | repo-branch`",
        "`style`: `default | branch | repo-branch | custom`",
      ],
      [
        "wrong omission default",
        "repos/arashi-docs/docs/commands/create.md",
        "Omitting `style` means `default`",
        "Omitting `style` selects `repo-branch`",
      ],
      [
        "CLI destination drift",
        "repos/arashi/docs/configuration.md",
        "`repo-feature/auth` (or `repo-feature-auth`)",
        "`wrong-feature/auth` (or `wrong-feature-auth`)",
      ],
      [
        "generated compact contradiction",
        "repos/arashi-docs/public/llms.txt",
        "Omitting `style` means `default`",
        "Omitting `style` means `default`. Another valid style is `custom`",
      ],
      [
        "skill contradiction",
        "repos/arashi-skills/skills/arashi/references/commands/create.md",
        "`default`, `branch`, and `repo-branch`",
        "`default`, `branch`, `repo-branch`, and `custom`",
      ],
    ];
    for (const [label, source, oldText, newText] of drifts) {
      const root = await fixture();
      await replace(root, source, oldText, newText);
      expectRejected(root, label);
    }
  }, 20_000);
  test("rejects additive matrix and natural-language semantic reversals", async () => {
    const drifts: [string, string, string, string][] = [
      [
        "detailed conflicting row",
        "repos/arashi-docs/docs/commands/create.md",
        "| Bare `default` + `preserve` | `example/feature/auth` |",
        "| Bare `default` + `preserve` | `example/feature/auth` |\n| Bare `default` + `preserve` | `WRONG/path` |",
      ],
      [
        "compact conflicting row",
        "repos/arashi-docs/public/llms.txt",
        "bare `default` + `preserve` | `example/feature/auth`;",
        "bare `default` + `preserve` | `example/feature/auth`;\n- bare `default` + `preserve` | `WRONG/path`",
      ],
      [
        "CLI additive destination",
        "repos/arashi/docs/configuration.md",
        "`repo-feature/auth` (or `repo-feature-auth`)",
        "`repo-feature/auth` (or `repo-feature-auth`). `repo-branch` may instead be `wrong-feature/auth`",
      ],
      [
        "natural custom style",
        "repos/arashi-docs/docs/commands/create.md",
        "Omitting `style` means `default`",
        "Omitting `style` means `default`. `style` can be `custom`",
      ],
      [
        "natural omission reversal",
        "repos/arashi-docs/public/llms-full.txt",
        "Omitting `style` means `default`",
        "Omitting `style` means `default`. When `style` is omitted, it defaults to `repo-branch`",
      ],
      [
        "natural interactive reversal",
        "repos/arashi-skills/skills/arashi/references/commands/create.md",
        "`aw configure` does not expose worktree naming",
        "`aw configure` does not expose worktree naming. Worktree naming can also be edited with interactive `aw configure`",
      ],
    ];
    for (const [label, source, oldText, newText] of drifts) {
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
