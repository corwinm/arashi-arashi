import { spawnSync } from "node:child_process";
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { afterEach, expect } from "vitest";
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
export {
  canonicalFixture,
  checkerIdentity,
  cliGuidanceSource,
  exactExampleSources,
  exactPathBudgetExample,
  expectOwnerDiagnostic,
  expectRejected,
  fixture,
  focusedDiagnostics,
  metaRoot,
  ownerCode,
  pathBudgetContract,
  pathBudgetGuidanceSources,
  replace,
  roots,
  runAggregate,
  runFocused,
  schemaSource,
  sources,
};
