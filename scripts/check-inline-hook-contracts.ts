#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { join } from "node:path";

type Category = "cli" | "docs" | "generated" | "skills";
type JsonObject = Record<string, unknown>;

interface Diagnostic {
  severity: "error";
  category: Category;
  code: string;
  source: string;
  message: string;
}

const expected = {
  ownership: {
    workspace: "hooks.scripts.<lifecycle>",
    repository: "repos.<name>.hooks.<lifecycle>",
  },
  lifecycles: ["pre-create", "post-create", "pre-remove", "post-remove"],
  valueModel: {
    stringShorthand: "bash",
    interpreters: ["bash", "powershell", "cmd"],
    nonEmpty: true,
    closedKeys: true,
  },
  selection: {
    posix: {
      order: ["bash"],
      lookup:
        "scan non-empty PATH entries for executable bash and return its absolute realpath",
    },
    windows: {
      order: ["powershell", "cmd", "bash"],
      lookup:
        "use fixed SystemRoot PowerShell and cmd paths, then scan non-empty PATH entries for regular bash.exe",
    },
  },
  logicalNames: {
    repositoryCreate: ["pre-create.<repo>", "post-create.<repo>"],
    repositoryRemove: ["pre-remove", "post-remove"],
  },
  ambiguity: {
    sourceKinds: ["inline-config", "file"],
    outcomeReason: "validation_failed",
    createJsonCode: "CREATE_FAILED",
    removeJsonCode: "HOOK_CONFIGURATION_INVALID",
    doctorCode: "HOOK_AMBIGUOUS",
  },
  options: {
    create: { noHooks: true, noHookInput: true },
    remove: { noHooks: false, noHookInput: true },
  },
  dryRun: {
    create: {
      discoversHooks: false,
      hookPreviews: false,
      emptyHookLedger: true,
    },
    remove: { discoversHooks: true, hookPreviews: true, executesHooks: false },
  },
  automation: {
    timeout: "source-neutral",
    input: "source-neutral",
    quietOwner: "json",
    jsonStdoutDocuments: 1,
  },
  sourceMetadata: {
    fields: [
      "sourceKind",
      "sourceOwnerKind",
      "sourceOwnerName",
      "sourceScriptPath",
    ],
    sourceKinds: ["file", "inline-config"],
    ownerKinds: ["workspace", "repository", "user-global"],
    inlineSourceScriptPath: null,
    snippetDisclosure: "forbidden",
  },
  boundaries: {
    standaloneInline: false,
    userGlobalInline: false,
    fileOnlyCompatible: true,
  },
} as const;

const contractSource = "repos/arashi/contracts/inline-lifecycle-hooks.json";
const commandSource = "repos/arashi/contracts/cli-commands.json";
const schemaSource = "repos/arashi/schema/config.schema.json";
const producerSource =
  "repos/arashi/scripts/contracts/inline-lifecycle-hooks.ts";
type GuidanceRequirementCode =
  | "INLINE_GUIDANCE_OWNERSHIP_MISMATCH"
  | "INLINE_GUIDANCE_VALUE_MODEL_MISMATCH"
  | "INLINE_GUIDANCE_INTERPRETER_POLICY_MISMATCH"
  | "INLINE_GUIDANCE_AMBIGUITY_MISMATCH"
  | "INLINE_GUIDANCE_COMMAND_PARITY_MISMATCH"
  | "INLINE_GUIDANCE_AUTOMATION_MISMATCH"
  | "INLINE_GUIDANCE_FILE_BOUNDARY_MISMATCH"
  | "INLINE_GUIDANCE_SOURCE_DISCLOSURE_MISMATCH"
  | "INLINE_GUIDANCE_SECURITY_MISMATCH";
type GuidanceProfile = "reference" | "canonical";

const fullGuidanceRequirements: readonly GuidanceRequirementCode[] = [
  "INLINE_GUIDANCE_OWNERSHIP_MISMATCH",
  "INLINE_GUIDANCE_VALUE_MODEL_MISMATCH",
  "INLINE_GUIDANCE_INTERPRETER_POLICY_MISMATCH",
  "INLINE_GUIDANCE_AMBIGUITY_MISMATCH",
  "INLINE_GUIDANCE_COMMAND_PARITY_MISMATCH",
  "INLINE_GUIDANCE_AUTOMATION_MISMATCH",
  "INLINE_GUIDANCE_FILE_BOUNDARY_MISMATCH",
  "INLINE_GUIDANCE_SOURCE_DISCLOSURE_MISMATCH",
  "INLINE_GUIDANCE_SECURITY_MISMATCH",
];
const guidanceSurfaces = [
  {
    source: "repos/arashi/docs/hooks.md",
    category: "cli",
    requirements: fullGuidanceRequirements,
    profile: "reference",
  },
  {
    source: "repos/arashi-docs/docs/workflows/hooks.md",
    category: "docs",
    requirements: fullGuidanceRequirements,
    profile: "canonical",
  },
  {
    source: "repos/arashi-docs/public/llms-full.txt",
    category: "generated",
    requirements: fullGuidanceRequirements,
    profile: "canonical",
  },
  {
    source: "repos/arashi-skills/skills/arashi/references/hooks.md",
    category: "skills",
    requirements: fullGuidanceRequirements,
    profile: "reference",
  },
  {
    source: "package-check/skills/arashi/references/hooks.md",
    category: "skills",
    requirements: fullGuidanceRequirements,
    profile: "reference",
  },
] as const;

const object = (value: unknown): value is JsonObject =>
  typeof value === "object" && value !== null && !Array.isArray(value);

function canonical(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonical);
  if (!object(value)) return value;
  return Object.fromEntries(
    Object.keys(value)
      .sort()
      .map((key) => [key, canonical(value[key])]),
  );
}

const equal = (actual: unknown, wanted: unknown): boolean =>
  JSON.stringify(canonical(actual)) === JSON.stringify(canonical(wanted));

function add(
  diagnostics: Diagnostic[],
  category: Category,
  code: string,
  source: string,
  message: string,
): void {
  diagnostics.push({ severity: "error", category, code, source, message });
}

async function readJson(
  root: string,
  source: string,
  diagnostics: Diagnostic[],
  missingCode: string,
): Promise<JsonObject | undefined> {
  try {
    const parsed: unknown = JSON.parse(
      await readFile(join(root, source), "utf8"),
    );
    if (object(parsed)) return parsed;
    add(
      diagnostics,
      "cli",
      missingCode,
      source,
      "Expected a JSON object; contract validation failed closed.",
    );
  } catch {
    add(
      diagnostics,
      "cli",
      missingCode,
      source,
      "Required normalized contract artifact is missing or invalid.",
    );
  }
  return undefined;
}

function resolveSchema(schema: JsonObject, value: unknown): unknown {
  let current = value;
  const visited = new Set<string>();
  while (object(current) && typeof current.$ref === "string") {
    const reference = current.$ref;
    if (!reference.startsWith("#/definitions/") || visited.has(reference))
      return undefined;
    visited.add(reference);
    current = object(schema.definitions)
      ? schema.definitions[reference.slice("#/definitions/".length)]
      : undefined;
  }
  return current;
}

function schemaSupportsInlineHooks(schema: JsonObject): boolean {
  const config = resolveSchema(schema, schema);
  if (!object(config) || !object(config.properties)) return false;
  const version = resolveSchema(schema, config.properties.version);
  if (!object(version) || version.const !== "1.0.0") return false;

  const workspaceHooks = resolveSchema(schema, config.properties.hooks);
  if (!object(workspaceHooks) || !object(workspaceHooks.properties))
    return false;
  const scripts = resolveSchema(schema, workspaceHooks.properties.scripts);
  if (!validLifecycleObject(schema, scripts)) return false;

  const repos = resolveSchema(schema, config.properties.repos);
  if (!object(repos)) return false;
  const repository = resolveSchema(schema, repos.additionalProperties);
  if (!object(repository) || !object(repository.properties)) return false;
  return validLifecycleObject(
    schema,
    resolveSchema(schema, repository.properties.hooks),
  );
}

function validLifecycleObject(schema: JsonObject, value: unknown): boolean {
  if (!object(value) || value.additionalProperties !== false) return false;
  if (!object(value.properties)) return false;
  const properties = value.properties;
  if (!equal(Object.keys(properties).sort(), [...expected.lifecycles].sort()))
    return false;
  return expected.lifecycles.every((lifecycle) =>
    validInlineValue(schema, resolveSchema(schema, properties[lifecycle])),
  );
}

function validInlineValue(schema: JsonObject, value: unknown): boolean {
  if (!object(value) || !Array.isArray(value.anyOf)) return false;
  const branches = value.anyOf.map((branch) => resolveSchema(schema, branch));
  const hasString = branches.some(
    (branch) =>
      object(branch) &&
      branch.type === "string" &&
      branch.minLength === 1 &&
      branch.pattern === "\\S",
  );
  const hasMap = branches.some((branch) => {
    if (
      !object(branch) ||
      branch.type !== "object" ||
      branch.additionalProperties !== false ||
      branch.minProperties !== 1 ||
      !object(branch.properties) ||
      !equal(
        Object.keys(branch.properties).sort(),
        [...expected.valueModel.interpreters].sort(),
      )
    )
      return false;
    const properties = branch.properties;
    return expected.valueModel.interpreters.every((interpreter) => {
      const snippet = resolveSchema(schema, properties[interpreter]);
      return (
        object(snippet) &&
        snippet.type === "string" &&
        snippet.minLength === 1 &&
        snippet.pattern === "\\S"
      );
    });
  });
  return hasString && hasMap;
}

function commandOptions(
  commandContract: JsonObject,
  path: string,
): string[] | undefined {
  if (!Array.isArray(commandContract.commands)) return undefined;
  const command = commandContract.commands.find(
    (candidate) => object(candidate) && candidate.path === path,
  );
  if (!object(command) || !Array.isArray(command.options)) return undefined;
  const options: string[] = [];
  for (const option of command.options) {
    if (!object(option) || typeof option.long !== "string") return undefined;
    options.push(option.long);
  }
  return options;
}

interface GuidanceRequirement {
  code: GuidanceRequirementCode;
  message: string;
  accepts: (content: string, profile: GuidanceProfile) => boolean;
}

const containsAll = (content: string, values: readonly string[]): boolean =>
  values.every((value) => content.includes(value));

const claimNegation =
  /\b(?:cannot|can't|do not|does not|must not|never|no|not|without)\b/i;

function hasAffirmativeClaim(content: string, pattern: RegExp): boolean {
  return content
    .split(
      /(?<=[.!?;])\s+|\n+|,\s*(?:but|however|yet)\s+|\s+(?:but|however|yet)\s+/i,
    )
    .some((clause) => pattern.test(clause) && !claimNegation.test(clause));
}

const guidanceRequirementDefinitions: readonly GuidanceRequirement[] = [
  {
    code: "INLINE_GUIDANCE_OWNERSHIP_MISMATCH",
    message:
      "Guidance must identify the canonical workspace and repository inline-hook owners.",
    accepts: (content) =>
      containsAll(content, [
        "hooks.scripts.<lifecycle>",
        "repos.<name>.hooks.<lifecycle>",
      ]) &&
      !hasAffirmativeClaim(
        content,
        /hooks\.scripts(?:\s*\[\s*["'][^"']+\.[^"']+["']\s*\]|\.(?:<lifecycle>|pre-create|post-create|pre-remove|post-remove)\.(?:<repo>|[a-z0-9_-]+))/i,
      ),
  },
  {
    code: "INLINE_GUIDANCE_VALUE_MODEL_MISMATCH",
    message:
      "Guidance must retain all four lifecycle keys, Bash string shorthand, and the closed interpreter vocabulary.",
    accepts: (content) =>
      containsAll(content, [
        "pre-create",
        "post-create",
        "pre-remove",
        "post-remove",
        "bash",
        "powershell",
        "cmd",
      ]) &&
      (/(?:string[^.\n]{0,80}bash[^.\n]{0,40}shorthand|bash[^.\n]{0,40}string[^.\n]{0,40}shorthand)/i.test(
        content,
      ) ||
        /inline bash uses[^.\n]{0,80}bash\s+-c/i.test(content)),
  },
  {
    code: "INLINE_GUIDANCE_INTERPRETER_POLICY_MISMATCH",
    message:
      "Guidance must retain the exact POSIX and Windows interpreter lookup policy and order.",
    accepts: (content, profile) =>
      /posix[\s\S]{0,500}non-empty[^.\n]{0,80}path[^.\n]{0,120}(?:executable|regular)[^.\n]{0,40}bash/i.test(
        content,
      ) &&
      (profile === "canonical" ||
        /(?:absolute real path|absolute realpath)/i.test(content)) &&
      /powershell[^.\n]{0,80}(?:then|→|,)[^.\n]{0,60}cmd[^.\n]{0,80}(?:then|→|,)[^.\n]{0,60}bash/i.test(
        content,
      ) &&
      (/(?:systemroot[\s\S]{0,300}powershell[\s\S]{0,160}cmd)/i.test(content) ||
        /powershell[\s\S]{0,160}cmd[\s\S]{0,300}systemroot/i.test(content)) &&
      /path[\s\S]{0,180}bash\.exe/i.test(content) &&
      (profile === "canonical" ||
        containsAll(content.toLowerCase(), ["pwsh", "alias", "terminal"])) &&
      !/cmd\s*(?:,|→)?\s*then\s+powershell/i.test(content) &&
      !/posix[^.\n]{0,220}(?:returns?|selects?|uses?)[^.\n]{0,80}(?:command name|alias)/i.test(
        content,
      ),
  },
  {
    code: "INLINE_GUIDANCE_AMBIGUITY_MISMATCH",
    message:
      "Guidance must fail same-location inline/file ambiguity before mutation and execute neither source.",
    accepts: (content, profile) =>
      /(?:inline[\s\S]{0,320}(?:native )?file|(?:native )?file[\s\S]{0,320}inline)[\s\S]{0,320}(?:ambiguous|ambiguity)|(?:ambiguous|ambiguity)[\s\S]{0,320}(?:inline[\s\S]{0,320}(?:native )?file|(?:native )?file[\s\S]{0,320}inline)/i.test(
        content,
      ) &&
      (profile === "canonical"
        ? /(?:neither|execute neither|runs neither)/i.test(content)
        : /(?:before mutation[\s\S]{0,180}(?:neither|execute neither|runs neither)|(?:neither|execute neither|runs neither)[\s\S]{0,180}before mutation)/i.test(
            content,
          )),
  },
  {
    code: "INLINE_GUIDANCE_COMMAND_PARITY_MISMATCH",
    message:
      "Guidance must preserve create/remove lifecycle parity and exact option ownership.",
    accepts: (content) =>
      /inline[^.\n]{0,180}(?:same|preserv|retain)[^.\n]{0,180}(?:lifecycle|timing|native-file)/i.test(
        content,
      ) &&
      /(?:--no-hooks[^.\n]{0,100}(?:create-only|create only|only create)|(?:create-only|create only|only create)[^.\n]{0,100}--no-hooks)/i.test(
        content,
      ) &&
      /remove[^.\n]{0,100}(?:does not|doesn't|not)[^.\n]{0,60}(?:accept|have|provide|own)[^.\n]{0,40}--no-hooks|--no-hooks[^.\n]{0,100}remove[^.\n]{0,60}(?:does not|doesn't|not)/i.test(
        content,
      ) &&
      /--no-hook-input[^.\n]{0,120}(?:shared by|create and remove)|(?:create and remove)[^.\n]{0,120}--no-hook-input/i.test(
        content,
      ),
  },
  {
    code: "INLINE_GUIDANCE_AUTOMATION_MISMATCH",
    message:
      "Guidance must retain input, timeout, JSON-owned quiet/stdout, and command-specific dry-run behavior.",
    accepts: (content) =>
      containsAll(content.toLowerCase(), [
        "timeout",
        "json",
        "quiet",
        "stdout",
      ]) &&
      /(?:one|exactly one)[^.\n]{0,50}(?:json )?document|json stdout/i.test(
        content,
      ) &&
      /remove[^.\n]{0,100}dry-run[\s\S]{0,220}preview/i.test(content) &&
      (/(?:dry runs?|remove[^.\n]{0,100}dry-run)[^.\n]{0,240}(?:never executes?|without execution|does not (?:execute|spawn)|never spawns?)/i.test(
        content,
      ) ||
        /dry runs?[^.\n]{0,120}(?:do not|does not|never) (?:execute|spawn)/i.test(
          content,
        )) &&
      /(?:configured[- ]create|configured[^.\n]{0,30}create|create)[^.\n]{0,100}dry-run[\s\S]{0,260}(?:no hook discovery|does not discover|performs no hook discovery)/i.test(
        content,
      ) &&
      /(?:configured[- ]create|configured[^.\n]{0,30}create|create)[^.\n]{0,100}dry-run[\s\S]{0,320}empty[^.\n]{0,40}(?:hook )?(?:ledger|outcomes)/i.test(
        content,
      ) &&
      /(?:configured[- ]create|configured[^.\n]{0,30}create|create)[^.\n]{0,100}dry-run[\s\S]{0,320}(?:no hook[- ]preview|has no (?:hook[- ])?previews?)/i.test(
        content,
      ),
  },
  {
    code: "INLINE_GUIDANCE_FILE_BOUNDARY_MISMATCH",
    message:
      "Guidance must retain standalone and user-global file-only compatibility boundaries.",
    accepts: (content) =>
      /standalone[^.\n]{0,160}(?:file-only|native[- ]files? only|native-file only)/i.test(
        content,
      ) &&
      (/(?:user-global[^.\n]{0,160}(?:file-only|native[- ]files? only|native-file only|native file locations))/i.test(
        content,
      ) ||
        /standalone[^.\n]{0,100}(?:native[- ]files? only|file-only)[^.\n]{0,100}user-global/i.test(
          content,
        )) &&
      !hasAffirmativeClaim(
        content,
        /(?:standalone|user-global)[^.\n]{0,140}(?:accept|allow|support|execute|use)[^.\n]{0,100}inline/i,
      ),
  },
  {
    code: "INLINE_GUIDANCE_SOURCE_DISCLOSURE_MISMATCH",
    message:
      "Guidance must retain non-secret source metadata, null inline path semantics, and explicit snippet non-disclosure.",
    accepts: (content) =>
      expected.sourceMetadata.fields.every((field) =>
        content.includes(field),
      ) &&
      /sourceScriptPath[\s\S]{0,120}(?:is\s+`?null`?|null\s+or\s+omitted)/i.test(
        content,
      ) &&
      (/(?:never|do not|does not|must not)[^.\n]{0,180}(?:snippet|command)[^.\n]{0,100}(?:text)?/i.test(
        content,
      ) ||
        /(?:snippet|command)[^.\n]{0,100}(?:never|do not|does not|must not)[^.\n]{0,120}(?:include|derive|disclos|reveal|print|hash|truncate|quote)/i.test(
          content,
        )) &&
      !hasAffirmativeClaim(
        content,
        /(?:outcomes?|previews?|diagnostics?|logs?)[^.\n]{0,120}(?:print|include|reveal|disclose|show|contain)[^.\n]{0,100}(?:inline\s+(?:snippet|command)|snippet\s+text|command\s+text)/i,
      ),
  },
  {
    code: "INLINE_GUIDANCE_SECURITY_MISMATCH",
    message:
      "Guidance must retain shell-native fail-fast composition and prohibit secrets in snippets and hook input.",
    accepts: (content) =>
      /(?:shell-native|shell's native|shell-specific|native environment)/i.test(
        content,
      ) &&
      /fail-fast|fail fast/i.test(content) &&
      /(?:never|do not|does not|must not)[^.\n]{0,140}(?:embed|enter|put|place|store|contain)[^.\n]{0,100}(?:secret|token|password)|(?:secret|token|password)[^.\n]{0,120}(?:never|do not|does not|must not|not contain)/i.test(
        content,
      ) &&
      !hasAffirmativeClaim(
        content,
        /(?:store|embed|put|place|contain)[^.\n]{0,100}(?:credentials?|api tokens?|secrets?|passwords?)[^.\n]{0,140}(?:inline snippets?|hook input)|(?:inline snippets?|hook input)[^.\n]{0,140}(?:store|embed|put|place|contain)[^.\n]{0,100}(?:credentials?|api tokens?|secrets?|passwords?)/i,
      ),
  },
];

function validateGuidance(
  content: string,
  requiredCodes: readonly GuidanceRequirementCode[],
  profile: GuidanceProfile,
): GuidanceRequirement[] {
  return guidanceRequirementDefinitions.filter(
    (requirement) =>
      requiredCodes.includes(requirement.code) &&
      !requirement.accepts(content, profile),
  );
}

async function check(
  root: string,
): Promise<{ ok: boolean; diagnostics: Diagnostic[] }> {
  const diagnostics: Diagnostic[] = [];
  const contract = await readJson(
    root,
    contractSource,
    diagnostics,
    "INLINE_CONTRACT_MISSING",
  );
  if (contract) {
    const checks: Array<{
      code: string;
      actual: unknown;
      wanted: unknown;
      message: string;
    }> = [
      {
        code: "INLINE_CONTRACT_PRODUCER_INVALID",
        actual: contract.producer,
        wanted: "scripts/contracts/inline-lifecycle-hooks.ts",
        message: "Dedicated inline-hook producer identity changed.",
      },
      {
        code: "INLINE_CONTRACT_SCHEMA_VERSION_INVALID",
        actual: contract.schemaVersion,
        wanted: 1,
        message: "Dedicated inline-hook contract must remain schema version 1.",
      },
      {
        code: "INLINE_CONFIG_VERSION_CHANGED",
        actual: contract.configVersion,
        wanted: "1.0.0",
        message: "Inline hooks must not change the public config version.",
      },
      {
        code: "INLINE_OWNERSHIP_MISMATCH",
        actual: contract.ownership,
        wanted: expected.ownership,
        message:
          "Inline-hook ownership paths do not match the normalized contract.",
      },
      {
        code: "INLINE_LIFECYCLES_MISMATCH",
        actual: contract.lifecycles,
        wanted: expected.lifecycles,
        message: "Inline-hook lifecycle set or order changed.",
      },
      {
        code: "INLINE_VALUE_MODEL_MISMATCH",
        actual: contract.valueModel,
        wanted: expected.valueModel,
        message:
          "Inline-hook shorthand or closed interpreter value model changed.",
      },
      {
        code: "INLINE_INTERPRETER_POLICY_MISMATCH",
        actual: contract.selection,
        wanted: expected.selection,
        message: "Inline-hook interpreter selection policy changed.",
      },
      {
        code: "INLINE_LOGICAL_NAMES_MISMATCH",
        actual: contract.logicalNames,
        wanted: expected.logicalNames,
        message: "Inline-hook logical naming policy changed.",
      },
      {
        code: "INLINE_AMBIGUITY_MISMATCH",
        actual: contract.ambiguity,
        wanted: expected.ambiguity,
        message: "Inline/file ambiguity classification changed.",
      },
      {
        code: "INLINE_OPTION_OWNERSHIP_MISMATCH",
        actual: contract.options,
        wanted: expected.options,
        message: "Inline-hook command option ownership changed.",
      },
      {
        code: "INLINE_DRY_RUN_MISMATCH",
        actual: contract.dryRun,
        wanted: expected.dryRun,
        message: "Inline-hook dry-run ownership changed.",
      },
      {
        code: "INLINE_AUTOMATION_MISMATCH",
        actual: contract.automation,
        wanted: expected.automation,
        message: "Inline-hook automation policy changed.",
      },
      {
        code: "INLINE_SOURCE_METADATA_MISMATCH",
        actual: contract.sourceMetadata,
        wanted: expected.sourceMetadata,
        message: "Non-secret inline-hook source metadata contract changed.",
      },
      {
        code: "INLINE_BOUNDARIES_MISMATCH",
        actual: contract.boundaries,
        wanted: expected.boundaries,
        message: "Standalone, global, or file-compatibility boundary changed.",
      },
    ];
    for (const item of checks)
      if (!equal(item.actual, item.wanted))
        add(diagnostics, "cli", item.code, contractSource, item.message);
  }

  const commandContract = await readJson(
    root,
    commandSource,
    diagnostics,
    "INLINE_COMMAND_CONTRACT_MISSING",
  );
  if (commandContract) {
    if (commandContract.schemaVersion !== 7)
      add(
        diagnostics,
        "cli",
        "INLINE_COMMAND_CONTRACT_VERSION_CHANGED",
        commandSource,
        "CLI command contract must remain schema version 7.",
      );
    const create = commandOptions(commandContract, "create");
    const remove = commandOptions(commandContract, "remove");
    if (
      !create?.includes("--no-hooks") ||
      !create.includes("--no-hook-input") ||
      !remove?.includes("--no-hook-input") ||
      remove.includes("--no-hooks")
    )
      add(
        diagnostics,
        "cli",
        "INLINE_OPTION_OWNERSHIP_MISMATCH",
        commandSource,
        "Create alone must own --no-hooks; create and remove must own --no-hook-input.",
      );
  }

  const schema = await readJson(
    root,
    schemaSource,
    diagnostics,
    "INLINE_CONFIG_SCHEMA_MISSING",
  );
  if (schema && !schemaSupportsInlineHooks(schema))
    add(
      diagnostics,
      "cli",
      "INLINE_CONFIG_SCHEMA_MISMATCH",
      schemaSource,
      "Config schema no longer exposes the closed non-empty workspace and repository inline-hook model.",
    );

  try {
    const producer = await readFile(join(root, producerSource), "utf8");
    if (
      !/INLINE_LIFECYCLE_HOOK_CONTRACT_SCHEMA_VERSION\s*=\s*1\b/.test(producer)
    )
      throw new Error("schema marker missing");
  } catch {
    add(
      diagnostics,
      "cli",
      "INLINE_CONTRACT_PRODUCER_INVALID",
      producerSource,
      "Dedicated inline-hook producer is missing or does not declare schema version 1.",
    );
  }

  for (const surface of guidanceSurfaces) {
    try {
      const content = await readFile(join(root, surface.source), "utf8");
      const mismatches = validateGuidance(
        content,
        surface.requirements,
        surface.profile,
      );
      for (const mismatch of mismatches)
        add(
          diagnostics,
          surface.category,
          mismatch.code,
          surface.source,
          mismatch.message,
        );
    } catch {
      add(
        diagnostics,
        surface.category,
        "INLINE_GUIDANCE_SOURCE_DISCLOSURE_MISMATCH",
        surface.source,
        "Required inline-hook guidance surface is missing or unreadable.",
      );
    }
  }

  return { ok: diagnostics.length === 0, diagnostics };
}

function formatHuman(result: {
  ok: boolean;
  diagnostics: Diagnostic[];
}): string {
  if (result.ok)
    return "Inline lifecycle-hook semantic contracts passed across CLI, docs, generated exports, and skill guidance.";
  return [
    "Inline lifecycle-hook semantic contracts failed:",
    ...result.diagnostics.map(
      ({ code, source, message }) => `- [${code}] ${source}: ${message}`,
    ),
  ].join("\n");
}

const args = new Set(process.argv.slice(2));
const unknown = [...args].filter((argument) => argument !== "--json");
if (unknown.length > 0) {
  console.error(`Unknown option(s): ${unknown.join(", ")}`);
  process.exit(2);
}

const result = await check(process.cwd());
console.log(
  args.has("--json") ? JSON.stringify(result, null, 2) : formatHuman(result),
);
if (!result.ok) process.exitCode = 1;
