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
    !exact(properties.worktreeNaming, {
      $ref: "#/definitions/WorktreeNamingConfig",
      description: "Optional filesystem naming policy for configured create",
    }) && "Config.worktreeNaming must reference the naming definition",
    !exact(properties.version, {
      $ref: "#/definitions/ConfigVersion",
      description: "Configuration schema version for migrations",
    }) && "Config.version must reference ConfigVersion",
    required.includes("worktreeNaming") &&
      "worktreeNaming must remain optional",
    naming.required !== undefined &&
      "worktreeNaming fields must remain optional",
    naming.type !== "object" && "worktreeNaming must remain an object",
    naming.additionalProperties !== false && "worktreeNaming must be closed",
    !exact(Object.keys(namingProperties).sort(), ["branchSlashes", "style"]) &&
      "worktreeNaming fields drifted",
    !object(namingProperties.style) ||
    namingProperties.style.$ref !== "#/definitions/WorktreeNamingStyle"
      ? "style must reference WorktreeNamingStyle"
      : false,
    !object(namingProperties.branchSlashes) ||
    namingProperties.branchSlashes.$ref !==
      "#/definitions/WorktreeNamingBranchSlashes"
      ? "branchSlashes must reference WorktreeNamingBranchSlashes"
      : false,
    style.type !== "string" && "style definition type drifted",
    !exact(style.enum, ["default", "branch", "repo-branch"]) &&
      "style enum drifted",
    slashes.type !== "string" && "branchSlashes definition type drifted",
    !exact(slashes.enum, ["preserve", "flatten"]) &&
      "branchSlashes enum drifted",
    version.type !== "string" && "configuration version type drifted",
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
const cliSource = "repos/arashi/docs/configuration.md";
const compactExportSource = "repos/arashi-docs/public/llms.txt";
const compactSources = [cliSource, compactExportSource];
const normalize = (content: string) =>
  content.replaceAll("`", "").replace(/\s+/g, " ").toLowerCase();
const rowKey = (topology: string, style: string, slashes: string) =>
  `${topology.toLowerCase()}|${style.toLowerCase()}|${slashes.toLowerCase()}`;
const expectedByKey = new Map(
  rows.map(([topology, style, slashes, destination]) => [
    rowKey(topology, style, slashes),
    destination,
  ]),
);
function checkConflictingRows(source: string, content: string) {
  const unquoted = content.replaceAll("`", "");
  for (const match of unquoted.matchAll(
    /\b(non-bare|bare)\s+(default|branch|repo-branch)\s*\+\s*(preserve|flatten)\s*\|\s*([A-Za-z0-9][A-Za-z0-9_/-]*)/gi,
  )) {
    const key = rowKey(match[1]!, match[2]!, match[3]!);
    const destination = match[4]?.toLowerCase();
    const expected = expectedByKey.get(key);
    if (expected !== undefined && destination !== expected) {
      add(
        "WORKTREE_NAMING_MATRIX_CONTRADICTION",
        source,
        `conflicting ${key} mapping: ${destination}`,
      );
    }
  }
  for (const line of unquoted.split("\n")) {
    const cells = line
      .split("|")
      .map((cell) => cell.trim().toLowerCase())
      .filter(Boolean);
    let key: string | null = null;
    let destination: string | null = null;
    if (cells.length === 2) {
      const match = cells[0]?.match(
        /^(?:-\s*)?(non-bare|bare)\s+(default|branch|repo-branch)\s*\+\s*(preserve|flatten)$/,
      );
      if (match) {
        key = rowKey(match[1]!, match[2]!, match[3]!);
        destination = cells[1] ?? null;
      }
    } else if (
      cells.length === 4 &&
      /^(?:non-bare|bare)$/.test(cells[0] ?? "")
    ) {
      key = rowKey(cells[0]!, cells[1]!, cells[2]!);
      destination = cells[3] ?? null;
    }
    const expected = key === null ? undefined : expectedByKey.get(key);
    if (expected !== undefined && destination !== expected) {
      add(
        "WORKTREE_NAMING_MATRIX_CONTRADICTION",
        source,
        `conflicting ${key} mapping: ${destination}`,
      );
    }
  }
}
function checkCore(source: string, content: string, detailed: boolean) {
  const plain = normalize(content);
  checkConflictingRows(source, content);
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
      "direct JSON-only scope",
      plain.includes(".arashi/config.json") &&
        plain.includes("direct") &&
        plain.includes("not available") &&
        plain.includes("aw configure"),
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
  if (source === compactExportSource) {
    for (const [topology, style, slashes, destination] of rows) {
      const fragment = `${topology} ${style} + ${slashes} | ${destination}`;
      if (!plain.includes(fragment)) {
        add(
          "WORKTREE_NAMING_MATRIX_MISMATCH",
          source,
          `missing ${topology} ${style} ${slashes} -> ${destination}`,
        );
      }
    }
  }
  if (source === cliSource) {
    for (const fragment of [
      "branch produces feature/auth (or feature-auth when flattened)",
      "repo-branch produces repo-feature/auth (or repo-feature-auth)",
      "default uses the branch path for a non-bare configured repository and repo/feature/auth for a bare configured repository",
    ]) {
      if (!plain.includes(fragment)) {
        add(
          "WORKTREE_NAMING_MATRIX_MISMATCH",
          source,
          `missing exact CLI mapping: ${fragment}`,
        );
      }
    }
    for (const statement of content.split(/(?<=[.!?])\s+|\n+/)) {
      if (!/\brepo-branch\b/i.test(statement)) continue;
      const candidates = [
        ...statement.matchAll(/`([A-Za-z0-9_.-]+-feature(?:\/auth|-auth))`/gi),
      ].map((match) => match[1]?.toLowerCase());
      if (
        candidates.some(
          (candidate) =>
            candidate !== undefined &&
            candidate !== "repo-feature/auth" &&
            candidate !== "repo-feature-auth",
        )
      ) {
        add(
          "WORKTREE_NAMING_MATRIX_CONTRADICTION",
          source,
          "conflicting CLI repo-branch destination",
        );
      }
    }
  }
  const contradictions = [
    /style[^.\n]*(?:accepts?|supports?|includes?)[^.\n]*(?:current|custom|template|ticket)/i,
    /\bstyle\b[^.\n]{0,80}\b(?:can|may)\s+(?:also\s+)?be\s+`?(?:current|custom|template|ticket)\b/i,
    /`style`\s*:[^.\n]*(?:current|custom|template|ticket)/i,
    /\bstyle\b\s+(?:is|values?\s+are)[^.\n]*(?:current|custom|template|ticket)/i,
    /(?:another|additional)[^.\n]*style[^.\n]*(?:current|custom|template|ticket)/i,
    /branchslashes[^.\n]*(?:accepts?|supports?|includes?)[^.\n]*(?:strip|remove|custom)/i,
    /omitt[^.\n]{0,80}style[^.\n]{0,80}(?:selects?|uses?|means?|defaults?\s+to)\s+`?(?:branch|repo-branch)\b/i,
    /style[^.\n]{0,80}omitt[^.\n]{0,80}(?:selects?|uses?|means?|defaults?\s+to)\s+`?(?:branch|repo-branch)\b/i,
    /omitt[^.\n]{0,80}branchslashes[^.\n]{0,80}(?:selects?|uses?|means?|defaults?\s+to)\s+`?(?:flatten|remove|strip)\b/i,
    /branchslashes[^.\n]{0,80}omitt[^.\n]{0,80}(?:selects?|uses?|means?|defaults?\s+to)\s+`?(?:flatten|remove|strip)\b/i,
    /(?<!not )available\s+(?:through|in)\s+interactive\s+`?aw configure/i,
    /interactive\s+`?aw configure`?[^.\n]*(?:can|may|will)[^.\n]*(?:edit|configure)[^.\n]*worktreenaming/i,
    /worktree\s+naming[^.\n]*(?:can|may|will)[^.\n]*(?:edit|configure)[^.\n]*interactive\s+`?aw configure/i,
    /worktreenaming[^.\n]*(?:can|may|will)[^.\n]*(?:edit|configure)[^.\n]*interactive\s+`?aw configure/i,
    /direct\s+json\s+edit(?:ing)?[^.\n]*(?:unnecessary|not required)/i,
    /(?:rewrites?|changes?)[^.\n]*git branch[^.\n]*feature-auth/i,
    /(?:collision|conflict)[^.\n]*(?:may|can|will|retries?|falls?\s+back|chooses?)[^.\n]*(?:append|use|choose|suffix|another|alternate)/i,
    /(?:naming|this setting)[^.\n]*(?:renames?|moves?|relocates?)[^.\n]*existing[^.\n]*worktree|(?:renames?|moves?|relocates?)[^.\n]*existing\s+registered\s+worktree/i,
    /standalone[^.\n]*(?:uses?|honors?|follows?)[^.\n]*worktreenaming/i,
  ];
  if (contradictions.some((pattern) => pattern.test(content)))
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
