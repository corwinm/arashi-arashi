#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { join, resolve } from "node:path";

type Diagnostic = {
  category: "meta";
  code: string;
  message: string;
  severity: "error";
  source: string;
};
type JsonObject = Record<string, unknown>;
const root = resolve(process.cwd());
const diagnostics: Diagnostic[] = [];
const object = (value: unknown): value is JsonObject =>
  typeof value === "object" && value !== null && !Array.isArray(value);
const add = (code: string, source: string, message: string) =>
  diagnostics.push({
    category: "meta",
    code,
    message,
    severity: "error",
    source,
  });
const read = async (source: string) => {
  try {
    return await readFile(join(root, source), "utf8");
  } catch (error) {
    add(
      "WORKTREE_NAMING_SOURCE_MISSING",
      source,
      error instanceof Error ? error.message : String(error),
    );
    return "";
  }
};
const exact = (actual: unknown, expected: unknown) =>
  JSON.stringify(actual) === JSON.stringify(expected);

const schemaSource = "repos/arashi/schema/config.schema.json";
async function checkSchema() {
  let schema: JsonObject;
  try {
    schema = JSON.parse(await read(schemaSource)) as JsonObject;
  } catch {
    add(
      "WORKTREE_NAMING_SCHEMA_INVALID",
      schemaSource,
      "schema is not valid JSON",
    );
    return;
  }
  const definitions = object(schema.definitions) ? schema.definitions : {};
  const config = object(definitions.Config) ? definitions.Config : {};
  const properties = object(config.properties) ? config.properties : {};
  const naming = object(definitions.WorktreeNamingConfig)
    ? definitions.WorktreeNamingConfig
    : {};
  const namingProperties = object(naming.properties) ? naming.properties : {};
  const style = object(definitions.WorktreeNamingStyle)
    ? definitions.WorktreeNamingStyle
    : {};
  const slashes = object(definitions.WorktreeNamingBranchSlashes)
    ? definitions.WorktreeNamingBranchSlashes
    : {};
  const version = object(definitions.ConfigVersion)
    ? definitions.ConfigVersion
    : {};
  const required = Array.isArray(config.required) ? config.required : [];
  const defects = [
    config.additionalProperties !== false && "Config must remain closed",
    !object(properties.worktreeNaming) && "Config must expose worktreeNaming",
    required.includes("worktreeNaming") &&
      "worktreeNaming must remain optional",
    naming.additionalProperties !== false && "worktreeNaming must be closed",
    !exact(Object.keys(namingProperties).sort(), ["branchSlashes", "style"]) &&
      "worktreeNaming fields drifted",
    !exact(style.enum, ["default", "branch", "repo-branch"]) &&
      "style enum drifted",
    !exact(slashes.enum, ["preserve", "flatten"]) &&
      "branchSlashes enum drifted",
    version.const !== "1.0.0" && "configuration version changed",
    JSON.stringify(schema).includes('"current"') &&
      "stale current naming style remains",
  ].filter(Boolean) as string[];
  for (const defect of defects)
    add("WORKTREE_NAMING_SCHEMA_MISMATCH", schemaSource, defect);
}

const rows = [
  ["bare", "default", "preserve", "example/feature/auth"],
  ["bare", "default", "flatten", "example/feature-auth"],
  ["bare", "branch", "preserve", "feature/auth"],
  ["bare", "branch", "flatten", "feature-auth"],
  ["bare", "repo-branch", "preserve", "example-feature/auth"],
  ["bare", "repo-branch", "flatten", "example-feature-auth"],
  ["non-bare", "default", "preserve", "feature/auth"],
  ["non-bare", "default", "flatten", "feature-auth"],
  ["non-bare", "branch", "preserve", "feature/auth"],
  ["non-bare", "branch", "flatten", "feature-auth"],
  ["non-bare", "repo-branch", "preserve", "example-feature/auth"],
  ["non-bare", "repo-branch", "flatten", "example-feature-auth"],
] as const;
const detailedSources = [
  "repos/arashi-docs/docs/workflows/config.md",
  "repos/arashi-docs/docs/commands/create.md",
  "repos/arashi-docs/public/workflows/config.md",
  "repos/arashi-docs/public/commands/create.md",
  "repos/arashi-docs/public/llms-full.txt",
  "repos/arashi-skills/skills/arashi/references/commands/create.md",
];
const compactSources = [
  "repos/arashi/docs/configuration.md",
  "repos/arashi-docs/public/llms.txt",
];
const normalize = (content: string) =>
  content.replaceAll("`", "").replace(/\s+/g, " ").toLowerCase();
function checkCore(source: string, content: string, detailed: boolean) {
  const plain = normalize(content);
  const requirements: [string, boolean][] = [
    [
      "root worktreeNaming scope",
      plain.includes("worktreenaming") && plain.includes("root"),
    ],
    [
      "closed style enum",
      ["default", "branch", "repo-branch"].every((value) =>
        plain.includes(value),
      ),
    ],
    [
      "closed slash enum",
      ["preserve", "flatten"].every((value) => plain.includes(value)),
    ],
    [
      "omission defaults",
      /omitt[^.\n]{0,240}default[^.\n]{0,160}preserve|omitt[^.\n]{0,240}preserve[^.\n]{0,160}default/i.test(
        content,
      ),
    ],
    [
      "exact branch identity",
      plain.includes("git branch") &&
        (plain.includes("exact") || plain.includes("never changes")),
    ],
    [
      "no collision suffix",
      plain.includes("colli") && plain.includes("suffix"),
    ],
    [
      "existing metadata/no rename",
      plain.includes("existing") &&
        (plain.includes("metadata") || plain.includes("recorded")) &&
        plain.includes("renam"),
    ],
    ["coordinated placement", plain.includes("coordinated child")],
    [
      "standalone isolation",
      /standalone[^.\n]{0,120}\.worktrees\/<branch>[^.\n]{0,120}(?:unchanged|does not apply)|does not apply[^.\n]{0,120}standalone[^.\n]{0,120}\.worktrees\/<branch>/i.test(
        plain,
      ),
    ],
  ];
  for (const [label, ok] of requirements)
    if (!ok)
      add("WORKTREE_NAMING_GUIDANCE_MISMATCH", source, `missing ${label}`);
  if (detailed)
    for (const [topology, style, slashes, destination] of rows) {
      const expectedTopology = topology.toLowerCase();
      const matchingRow = content
        .replaceAll("`", "")
        .split("\n")
        .map((line) =>
          line
            .split("|")
            .map((cell) => cell.trim().toLowerCase())
            .filter(Boolean),
        )
        .some(
          (cells) =>
            (cells.length === 2 &&
              cells[0] === `${expectedTopology} ${style} + ${slashes}` &&
              cells[1] === destination) ||
            (cells.length === 4 &&
              exact(cells, [expectedTopology, style, slashes, destination])),
        );
      if (!matchingRow)
        add(
          "WORKTREE_NAMING_MATRIX_MISMATCH",
          source,
          `missing ${topology} ${style} ${slashes} -> ${destination}`,
        );
    }
  const contradictions = [
    /style[^.\n]*(?:accepts?|supports?)[^.\n]*(?:current|custom|template)/i,
    /branchslashes[^.\n]*(?:accepts?|supports?)[^.\n]*(?:strip|remove|custom)/i,
    /(?:rewrites?|changes?)[^.\n]*git branch[^.\n]*feature-auth/i,
    /(?:collision|conflict)[^.\n]*(?:may|can|will|retries?)[^.\n]*(?:append|use|choose)[^.\n]*suffix/i,
    /(?:renames?|moves?|relocates?)[^.\n]*existing[^.\n]*worktree/i,
    /standalone[^.\n]*(?:uses?|honors?|follows?)[^.\n]*worktreenaming/i,
  ];
  if (
    !source.endsWith("llms-full.txt") &&
    !source.endsWith("llms.txt") &&
    contradictions.some((pattern) => pattern.test(content))
  )
    add(
      "WORKTREE_NAMING_GUIDANCE_CONTRADICTION",
      source,
      "contains contradictory naming guidance",
    );
}
async function checkGuidance() {
  for (const source of detailedSources)
    checkCore(source, await read(source), true);
  for (const source of compactSources)
    checkCore(source, await read(source), false);
}
async function checkRegistrations() {
  const docsSource = "repos/arashi-docs/scripts/semantic-doc-checks.json";
  const skillsSource = "repos/arashi-skills/scripts/guidance-checkers.json";
  for (const [source, identity] of [
    [docsSource, "check-worktree-naming-docs.ts"],
    [skillsSource, "scripts/worktree-naming-guidance-selftest.mjs"],
  ] as const) {
    try {
      const entries = JSON.parse(await read(source));
      if (
        !Array.isArray(entries) ||
        entries.filter((entry) => entry === identity).length !== 1
      )
        add(
          "WORKTREE_NAMING_CHECKER_REGISTRATION_MISMATCH",
          source,
          `expected exactly one ${identity}`,
        );
    } catch {
      add(
        "WORKTREE_NAMING_CHECKER_REGISTRATION_MISMATCH",
        source,
        "invalid registration JSON",
      );
    }
  }
}
await checkSchema();
await checkGuidance();
await checkRegistrations();
const result = { diagnostics, ok: diagnostics.length === 0 };
if (process.argv.includes("--json"))
  console.log(JSON.stringify(result, null, 2));
else if (result.ok)
  console.log("Worktree naming cross-repository contract passed.");
else {
  console.error("Worktree naming cross-repository contract failed:");
  for (const diagnostic of diagnostics)
    console.error(`- ${diagnostic.source}: ${diagnostic.message}`);
}
if (!result.ok) process.exitCode = 1;
