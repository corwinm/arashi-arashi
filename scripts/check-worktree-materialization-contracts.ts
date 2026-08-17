#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { lstat, mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";

type Category = "cli" | "docs" | "generated" | "skills";
interface Diagnostic {
  category: Category;
  code: string;
  message: string;
  severity: "error";
  source: string;
}
type JsonObject = Record<string, unknown>;

const schemaSource = "repos/arashi/schema/config.schema.json";
const guidanceGroups = [
  {
    category: "cli",
    source: "repos/arashi/docs",
    sources: ["repos/arashi/docs/configuration.md", "repos/arashi/README.md"],
  },
  {
    category: "docs",
    source: "repos/arashi-docs/docs",
    sources: [
      "repos/arashi-docs/docs/workflows/config.md",
      "repos/arashi-docs/docs/commands/create.md",
    ],
  },
  {
    category: "generated",
    source: "repos/arashi-docs/public",
    sources: [
      "repos/arashi-docs/public/workflows/config.md",
      "repos/arashi-docs/public/commands/create.md",
      "repos/arashi-docs/public/llms-full.txt",
    ],
  },
  {
    category: "skills",
    source: "repos/arashi-skills/skills/arashi/references",
    sources: [
      "repos/arashi-skills/skills/arashi/references/commands.md",
      "repos/arashi-skills/skills/arashi/references/workflows.md",
      "repos/arashi-skills/skills/arashi/references/hooks.md",
    ],
  },
] as const;
const packagedSource = "repos/arashi-skills/package/skills/arashi/references";

const object = (value: unknown): value is JsonObject =>
  typeof value === "object" && value !== null && !Array.isArray(value);

function resolveSchema(schema: JsonObject, value: unknown): unknown {
  let current = value;
  const seen = new Set<string>();
  while (object(current) && typeof current.$ref === "string") {
    const reference = current.$ref;
    if (!reference.startsWith("#/definitions/") || seen.has(reference)) return undefined;
    seen.add(reference);
    current = object(schema.definitions)
      ? schema.definitions[reference.slice("#/definitions/".length)]
      : undefined;
  }
  return current;
}

function schemaSupportsMaterialization(schema: JsonObject): boolean {
  const definitions = object(schema.definitions) ? schema.definitions : undefined;
  const repository = definitions ? resolveSchema(schema, definitions.RepoConfig) : undefined;
  if (!object(repository) || repository.additionalProperties !== false || !object(repository.properties)) {
    return false;
  }
  const properties = repository.properties as JsonObject;
  const required = Array.isArray(repository.required) ? repository.required : [];
  return ["copy", "symlink"].every((field) => {
    if (required.includes(field)) return false;
    const value = resolveSchema(schema, properties[field]);
    if (!object(value) || value.type !== "array") return false;
    const item = resolveSchema(schema, value.items);
    return object(item) && item.type === "string";
  });
}

function guidanceSupportsMaterialization(content: string): boolean {
  const normalized = content.replaceAll("`", "").replace(/\\`/g, "").replace(/\s+/g, " ");
  const lower = normalized.toLowerCase();
  const contains = (...values: string[]) => values.every((value) => lower.includes(value));
  return (
    contains("repos.<name>.copy", "repos.<name>.symlink") &&
    /git[- ]primary/i.test(normalized) &&
    /same[^.]{0,100}relative path/i.test(normalized) &&
    /pre-create[\s\S]{0,260}copy[\s\S]{0,200}symlink[\s\S]{0,260}post-create/i.test(normalized) &&
    /--no-hooks[^.]{0,200}(?:does not|doesn't|never)[^.]{0,120}(?:disable|skip)[^.]{0,100}materialization/i.test(normalized) &&
    /missing[^.]{0,180}skip/i.test(normalized) &&
    /(?:no overwrite|without overwrite|never overwrites?)/i.test(normalized) &&
    /(?:no[^.]{0,100}copy[^.]{0,100}hard[- ]?link[^.]{0,100}junction[^.]{0,100}fallback|(?:never|does not|cannot)[^.]{0,100}fall(?:s)? back[^.]{0,100}copy[^.]{0,100}hard[- ]?link[^.]{0,100}junction)/i.test(normalized) &&
    /copy[^.]{0,220}(?:independent|isolat)/i.test(normalized) &&
    /symlink[^.]{0,220}shar(?:e|ed|ing)/i.test(normalized) &&
    /package-manager[^.]{0,220}(?:stores?|content-addressed)[^.]{0,220}per-worktree installs?/i.test(normalized) &&
    /node_modules/i.test(normalized) &&
    /lifecycle hooks?[^.]{0,240}globs?[^.]{0,180}remapping[^.]{0,180}external sources?[^.]{0,180}interpolation/i.test(normalized) &&
    /dry-run[^.]{0,180}(?:preview|plan)[^.]{0,180}(?:order|declaration)/i.test(normalized) &&
    /doctor[^.]{0,180}(?:non-mutating|without repair|without mutation|inspect|diagnos)/i.test(normalized) &&
    /(?:missing sources?[^.]{0,180}(?:visib(?:le|ly)|non-fatal|optional)[^.]{0,120}skip|missing sources?[^.]{0,180}skip[^.]{0,120}(?:visib(?:le|ly)|non-fatal|optional))/i.test(normalized) &&
    /destination[^.]{0,180}(?:inside|within|remain|never escape)[^.]{0,100}worktree/i.test(normalized) &&
    /(?:configured[^.]{0,120}only|standalone[^.]{0,120}(?:not supported|unsupported|not available))/i.test(normalized)
  );
}

function semanticStatements(content: string): string[] {
  return content
    .replaceAll("`", "")
    .split(/(?<=[.!?])\s+|\n{2,}|\s*;\s*/)
    .map((statement) => statement.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

function isNegatedBefore(statement: string, index: number): boolean {
  const beforeAction = statement.slice(0, index);
  const contrast = /(?:\b(?:yet|but|however|while|although|though|whereas|and|or)\b|;)/gi;
  let clauseStart = 0;
  for (const match of beforeAction.matchAll(contrast)) clauseStart = (match.index ?? 0) + match[0].length;
  const prefix = statement.slice(Math.max(clauseStart, index - 80), index).toLowerCase();
  return /\b(?:does?|do|is|are|must|should|can|may|will)\s+not(?:\s+\w+){0,5}\s*$/.test(prefix) ||
    /\b(?:cannot|can't)(?:\s+\w+){0,4}\s*$/.test(prefix) ||
    /\bnever(?:\s+\w+){0,4}\s*$/.test(prefix) ||
    /\bwithout(?:\s+\w+){0,4}\s*$/.test(prefix);
}

function hasAffirmativeAction(statement: string, pattern: RegExp): boolean {
  for (const match of statement.matchAll(pattern)) {
    if (!isNegatedBefore(statement, match.index ?? 0)) return true;
  }
  return false;
}

export function contradictoryGuidance(content: string): boolean {
  for (const statement of semanticStatements(content)) {
    if (
      /standalone/i.test(statement) &&
      /materialization|repos\.<name>\.(?:copy|symlink)|copy[^.]{0,40}symlink/i.test(statement) &&
      hasAffirmativeAction(statement, /\b(?:available|supports?|supported|accepts?|loads?|uses?)\b/gi)
    ) return true;
    if (
      /missing sources?/i.test(statement) &&
      hasAffirmativeAction(
        statement,
        /\b(?:causes?\s+creation\s+to\s+abort|(?:aborts?|fails?)\s+(?:configured\s+)?creation|creation\s+(?:aborts?|fails?))\b/gi,
      )
    ) return true;
    if (
      /materialization/i.test(statement) &&
      hasAffirmativeAction(statement, /\b(?:reads?|uses?|sources?)\b[^.]{0,120}\b(?:caller|active) checkout\b/gi)
    ) return true;
    if (/(?:symlink[^.]{0,100}before[^.]{0,100}copy|copy[^.]{0,100}after[^.]{0,100}symlink)/i.test(statement)) return true;
    if (
      /symlink/i.test(statement) &&
      hasAffirmativeAction(statement, /\bfall(?:s)? back\b/gi)
    ) return true;
    if (
      /destination/i.test(statement) &&
      (hasAffirmativeAction(statement, /\boverwrite(?:s|n)?\b/gi) ||
        hasAffirmativeAction(statement, /\bescape(?:s|d)?\b/gi))
    ) return true;
    if (
      /--no-hooks/i.test(statement) &&
      hasAffirmativeAction(statement, /\b(?:disables|skips)\s+(?:configured\s+|declarative\s+)?materialization/gi)
    ) return true;
    if (
      /symlink/i.test(statement) && /independently mutable/i.test(statement) && /\.env/i.test(statement) &&
      hasAffirmativeAction(statement, /\b(?:provides?|supports?|use)\b[^.]{0,120}independently mutable/gi)
    ) return true;
  }
  return false;
}

function add(
  diagnostics: Diagnostic[],
  category: Category,
  code: string,
  source: string,
  message: string,
): void {
  diagnostics.push({ category, code, message, severity: "error", source });
}

async function readCombined(root: string, sources: readonly string[]): Promise<string> {
  return (await Promise.all(sources.map((source) => readFile(join(root, source), "utf8")))).join("\n");
}

async function readPackagedSkillGuidance(root: string): Promise<string> {
  const temporaryRoot = await mkdtemp(join(tmpdir(), "arashi-materialization-package-"));
  const archive = join(temporaryRoot, "arashi-skills.tar.gz");
  const extracted = join(temporaryRoot, "extracted");
  try {
    const skillsRoot = join(root, "repos/arashi-skills");
    const producer = join(skillsRoot, "scripts/create-release-archive.mjs");
    const created = spawnSync(process.execPath, [producer, "--output", archive], {
      cwd: skillsRoot,
      encoding: "utf8",
      env: { ...process.env, NO_COLOR: "1" },
    });
    if (created.status !== 0 || created.error) {
      throw new Error("canonical skills archive creation failed");
    }
    const listed = spawnSync("tar", ["-tvzf", archive], {
      encoding: "utf8",
      env: { ...process.env, COPYFILE_DISABLE: "1" },
    });
    if (
      listed.status !== 0 ||
      listed.error ||
      listed.stdout.split(/\r?\n/).some((line) => /^[lh]/.test(line))
    ) {
      throw new Error("canonical skills archive contains a link entry");
    }
    await mkdir(extracted, { recursive: true });
    const unpacked = spawnSync("tar", ["-xzf", archive, "-C", extracted], {
      encoding: "utf8",
      env: { ...process.env, COPYFILE_DISABLE: "1" },
    });
    if (unpacked.status !== 0 || unpacked.error) {
      throw new Error("canonical skills archive extraction failed");
    }
    const packagedSources = [
      "skills/arashi/references/commands.md",
      "skills/arashi/references/workflows.md",
      "skills/arashi/references/hooks.md",
    ];
    for (const source of packagedSources) {
      const entry = await lstat(join(extracted, source));
      if (!entry.isFile() || entry.isSymbolicLink()) {
        throw new Error("canonical packaged guidance is not a regular file");
      }
    }
    const content = await readCombined(extracted, packagedSources);
    if (contradictoryGuidance(content)) throw new Error("canonical package contradicts guidance");
    return content;
  } finally {
    await rm(temporaryRoot, { force: true, recursive: true });
  }
}

async function check(root: string): Promise<{ diagnostics: Diagnostic[]; ok: boolean }> {
  const diagnostics: Diagnostic[] = [];
  try {
    const parsed: unknown = JSON.parse(await readFile(join(root, schemaSource), "utf8"));
    if (!object(parsed) || !schemaSupportsMaterialization(parsed)) {
      add(diagnostics, "cli", "MATERIALIZATION_CONFIG_SCHEMA_MISMATCH", schemaSource,
        "Generated configuration schema must expose direct repository copy and symlink string arrays.");
    }
  } catch {
    add(diagnostics, "cli", "MATERIALIZATION_CONFIG_SCHEMA_MISMATCH", schemaSource,
      "Generated configuration schema is missing or invalid.");
  }

  for (const group of guidanceGroups) {
    try {
      const surfaces = await Promise.all(
        group.sources.map(async (source) => ({ content: await readFile(join(root, source), "utf8"), source })),
      );
      if (
        !guidanceSupportsMaterialization(surfaces.map(({ content }) => content).join("\n")) ||
        surfaces.some(({ content }) => contradictoryGuidance(content))
      ) {
        add(diagnostics, group.category, "MATERIALIZATION_GUIDANCE_MISMATCH", group.source,
          "Owning guidance surfaces do not preserve the configured worktree materialization contract.");
      }
    } catch {
      add(diagnostics, group.category, "MATERIALIZATION_GUIDANCE_MISMATCH", group.source,
        "Required owning guidance is missing or unreadable.");
    }
  }

  try {
    if (!guidanceSupportsMaterialization(await readPackagedSkillGuidance(root))) {
      add(diagnostics, "skills", "MATERIALIZATION_GUIDANCE_MISMATCH", packagedSource,
        "Extracted canonical skill guidance does not preserve the materialization contract.");
    }
  } catch {
    add(diagnostics, "skills", "MATERIALIZATION_GUIDANCE_MISMATCH", packagedSource,
      "Canonical skill package could not be created, extracted, or read.");
  }
  return { diagnostics, ok: diagnostics.length === 0 };
}

const args = new Set(process.argv.slice(2));
const unknown = [...args].filter((argument) => argument !== "--json");
if (unknown.length > 0) {
  console.error(`Unknown option(s): ${unknown.join(", ")}`);
  process.exit(2);
}
const result = await check(process.cwd());
if (args.has("--json")) console.log(JSON.stringify(result, null, 2));
else if (result.ok) console.log("Worktree materialization contracts passed across CLI, docs, exports, and skills.");
else {
  console.log("Worktree materialization contracts failed:");
  for (const diagnostic of result.diagnostics) {
    console.log(`- [${diagnostic.code}] ${diagnostic.source}: ${diagnostic.message}`);
  }
}
if (!result.ok) process.exitCode = 1;
