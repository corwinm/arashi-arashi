import { afterEach, describe, expect, test } from "vitest";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

const roots: string[] = [];
const metaRoot = process.cwd();
const checker = join(metaRoot, "scripts/check-inline-hook-contracts.ts");
const canary = "INLINE_SNIPPET_CANARY_do-not-disclose_271";

const inlineContract = {
  schemaVersion: 1,
  producer: "scripts/contracts/inline-lifecycle-hooks.ts",
  configVersion: "1.0.0",
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
};

const commandContract = {
  schemaVersion: 8,
  root: { name: "arashi" },
  commands: [
    {
      path: "create",
      options: [{ long: "--no-hooks" }, { long: "--no-hook-input" }],
    },
    {
      path: "remove",
      options: [{ long: "--no-hook-input" }],
    },
  ],
};

const configSchema = {
  $ref: "#/definitions/Config",
  definitions: {
    Config: {
      additionalProperties: false,
      properties: {
        version: { const: "1.0.0" },
        hooks: {
          additionalProperties: false,
          properties: {
            timeout: { type: "number" },
            scripts: { $ref: "#/definitions/InlineLifecycleHooks" },
          },
          type: "object",
        },
        repos: {
          additionalProperties: { $ref: "#/definitions/RepositoryConfig" },
          type: "object",
        },
      },
      type: "object",
    },
    RepositoryConfig: {
      additionalProperties: false,
      properties: {
        hooks: { $ref: "#/definitions/InlineLifecycleHooks" },
        path: { type: "string" },
      },
      type: "object",
    },
    InlineLifecycleHooks: {
      additionalProperties: false,
      properties: Object.fromEntries(
        inlineContract.lifecycles.map((lifecycle) => [
          lifecycle,
          { $ref: "#/definitions/InlineHookValue" },
        ]),
      ),
      type: "object",
    },
    InlineHookValue: {
      anyOf: [
        { minLength: 1, pattern: "\\S", type: "string" },
        {
          additionalProperties: false,
          minProperties: 1,
          properties: {
            bash: { minLength: 1, pattern: "\\S", type: "string" },
            cmd: { minLength: 1, pattern: "\\S", type: "string" },
            powershell: { minLength: 1, pattern: "\\S", type: "string" },
          },
          type: "object",
        },
      ],
    },
  },
};

const guidance = `
Inline lifecycle hooks use hooks.scripts.<lifecycle> for workspace ownership and repos.<name>.hooks.<lifecycle> for repository ownership.
The lifecycle set is pre-create, post-create, pre-remove, and post-remove. A string is Bash shorthand; maps use bash, powershell, and cmd.
POSIX scans non-empty PATH entries in order for executable bash and returns its first absolute real path. Windows checks configured PowerShell, then cmd, then Bash: fixed SystemRoot paths own PowerShell and cmd, while non-empty PATH entries in order provide regular bash.exe; pwsh, aliases, terminal hosts, empty PATH entries, and unconfigured interpreters are not fallbacks.
An inline-config and file collision at one logical location is ambiguous, fails closed before mutation, and executes neither source: create reports CREATE_FAILED, remove reports HOOK_CONFIGURATION_INVALID, outcomes use validation_failed, and doctor reports HOOK_AMBIGUOUS.
Inline sources retain the native-file create and remove lifecycle timing, cwd, multiplicity, failure, rollback, finalization, and ordered outcomes. Only create owns --no-hooks; remove does not. Create and remove share --no-hook-input and source-neutral timeout and input behavior. JSON owns quiet output and writes exactly one document to stdout.
Remove dry-run resolves source-aware hook previews without execution or fabricated outcomes. Configured create dry-run does not discover or preflight hooks, has no previews, and keeps an empty hook ledger.
Outcomes and previews expose sourceKind, sourceOwnerKind, sourceOwnerName, and sourceScriptPath. Inline sourceScriptPath is null. Never print, hash, truncate, quote, or otherwise disclose inline snippet text.
Standalone and user-global hooks remain file-only. Existing file hooks remain compatible.
Inline snippets are trusted executable code: keep them short and reviewable, use native files for substantial scripts, supply portable shell variants, use shell-native ARASHI_* syntax and fail-fast composition, and never embed secrets.
`;

const guidanceMismatchCases = [
  {
    name: "ownership",
    code: "INLINE_GUIDANCE_OWNERSHIP_MISMATCH",
    mutate: (content: string) =>
      content.replace(
        "repos.<name>.hooks.<lifecycle>",
        "hooks.scripts.<lifecycle>.<repo>",
      ),
  },
  {
    name: "lifecycle value model",
    code: "INLINE_GUIDANCE_VALUE_MODEL_MISMATCH",
    mutate: (content: string) =>
      content
        .replace("post-remove", "post-destroy")
        .replace("Bash shorthand", "cmd shorthand"),
  },
  {
    name: "interpreter lookup",
    code: "INLINE_GUIDANCE_INTERPRETER_POLICY_MISMATCH",
    mutate: (content: string) =>
      content
        .replace(
          "PowerShell, then cmd, then Bash",
          "cmd, then PowerShell, then Bash",
        )
        .replace("first absolute real path", "first command name"),
  },
  {
    name: "same-location ambiguity",
    code: "INLINE_GUIDANCE_AMBIGUITY_MISMATCH",
    mutate: (content: string) =>
      content.replace(
        "is ambiguous, fails closed before mutation, and executes neither source",
        "prefers the inline source",
      ),
  },
  {
    name: "create and remove parity",
    code: "INLINE_GUIDANCE_COMMAND_PARITY_MISMATCH",
    mutate: (content: string) =>
      content
        .replace(
          "Only create owns --no-hooks; remove does not",
          "Create and remove own --no-hooks",
        )
        .replace(
          "Create and remove share --no-hook-input",
          "Create alone owns --no-hook-input",
        ),
  },
  {
    name: "automation input timeout JSON and dry-run",
    code: "INLINE_GUIDANCE_AUTOMATION_MISMATCH",
    mutate: (content: string) =>
      content
        .replace(
          "source-neutral timeout and input behavior",
          "different timeout behavior",
        )
        .replace(
          "exactly one document to stdout",
          "progress followed by JSON documents",
        )
        .replace(
          "without execution or fabricated outcomes",
          "and executes each hook",
        ),
  },
  {
    name: "standalone and user-global boundary",
    code: "INLINE_GUIDANCE_FILE_BOUNDARY_MISMATCH",
    mutate: (content: string) =>
      content.replace(
        "Standalone and user-global hooks remain file-only",
        "Standalone and user-global hooks accept inline configuration",
      ),
  },
  {
    name: "source metadata and no disclosure",
    code: "INLINE_GUIDANCE_SOURCE_DISCLOSURE_MISMATCH",
    mutate: (content: string) =>
      content.replace(
        "Inline sourceScriptPath is null. Never print, hash, truncate, quote, or otherwise disclose inline snippet text.",
        "Inline sourceScriptPath contains the snippet text for diagnostics.",
      ),
  },
  {
    name: "security and shell composition",
    code: "INLINE_GUIDANCE_SECURITY_MISMATCH",
    mutate: (content: string) =>
      content.replace(
        "use shell-native ARASHI_* syntax and fail-fast composition, and never embed secrets",
        "use one shell syntax and store credentials in the snippet",
      ),
  },
  {
    name: "contradictory dynamic repository ownership",
    code: "INLINE_GUIDANCE_OWNERSHIP_MISMATCH",
    mutate: (content: string) =>
      `${content}\nRepository inline hooks may also be configured at hooks.scripts.<lifecycle>.<repo>.\n`,
  },
  {
    name: "contradictory standalone inline support",
    code: "INLINE_GUIDANCE_FILE_BOUNDARY_MISMATCH",
    mutate: (content: string) =>
      `${content}\nStandalone and user-global hooks accept inline configuration as well as files.\n`,
  },
  {
    name: "contradictory snippet disclosure",
    code: "INLINE_GUIDANCE_SOURCE_DISCLOSURE_MISMATCH",
    mutate: (content: string) =>
      `${content}\nFor debugging, outcomes print the full inline snippet text.\n`,
  },
  {
    name: "contradictory secret placement",
    code: "INLINE_GUIDANCE_SECURITY_MISMATCH",
    mutate: (content: string) =>
      `${content}\nStore credentials and API tokens directly in inline snippets and hook input.\n`,
  },
  {
    name: "contrast-masked dynamic repository ownership",
    code: "INLINE_GUIDANCE_OWNERSHIP_MISMATCH",
    mutate: (content: string) =>
      `${content}\nRepository inline hooks must not use dynamic owners in old deployments, but repository inline hooks may also be configured at hooks.scripts.<lifecycle>.<repo>.\n`,
  },
  {
    name: "contrast-masked standalone inline support",
    code: "INLINE_GUIDANCE_FILE_BOUNDARY_MISMATCH",
    mutate: (content: string) =>
      `${content}\nStandalone hooks do not accept inline configuration in legacy projects, but standalone and user-global hooks support inline configuration now.\n`,
  },
  {
    name: "contrast-masked snippet disclosure",
    code: "INLINE_GUIDANCE_SOURCE_DISCLOSURE_MISMATCH",
    mutate: (content: string) =>
      `${content}\nOutcomes do not include owner metadata from old runs, but outcomes reveal inline snippet text for debugging.\n`,
  },
  {
    name: "contrast-masked secret placement",
    code: "INLINE_GUIDANCE_SECURITY_MISMATCH",
    mutate: (content: string) =>
      `${content}\nDo not store notes in hook input, but store credentials and API tokens directly in inline snippets and hook input.\n`,
  },
] as const;

const guidanceSurfaces = [
  ["CLI-maintained docs", "repos/arashi/docs/hooks.md"],
  ["canonical website docs", "repos/arashi-docs/docs/reference/hooks.md"],
  ["generated agent export", "repos/arashi-docs/public/llms-full.txt"],
  ["authored skill", "repos/arashi-skills/skills/arashi/references/hooks.md"],
  [
    "extracted-package skill",
    "package-check/skills/arashi/references/hooks.md",
  ],
] as const;

async function write(path: string, content: string) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, content);
}

async function fixture(overrides: Record<string, string> = {}) {
  const root = await mkdtemp(join(tmpdir(), "arashi-inline-contracts-"));
  roots.push(root);
  const files: Record<string, string> = {
    "repos/arashi/contracts/inline-lifecycle-hooks.json": `${JSON.stringify(inlineContract, null, 2)}\n`,
    "repos/arashi/contracts/cli-commands.json": `${JSON.stringify(commandContract, null, 2)}\n`,
    "repos/arashi/schema/config.schema.json": `${JSON.stringify(configSchema, null, 2)}\n`,
    "repos/arashi/scripts/contracts/inline-lifecycle-hooks.ts":
      "export const INLINE_LIFECYCLE_HOOK_CONTRACT_SCHEMA_VERSION = 1;\n",
    "repos/arashi/docs/hooks.md": guidance,
    "repos/arashi-docs/docs/reference/hooks.md": guidance,
    "repos/arashi-docs/public/llms-full.txt": guidance,
    "repos/arashi-skills/skills/arashi/references/hooks.md": guidance,
    "package-check/skills/arashi/references/hooks.md": guidance,
    ".arashi/config.json": JSON.stringify({
      version: "1.0.0",
      hooks: { scripts: { "pre-create": canary } },
    }),
    ...overrides,
  };
  for (const [path, content] of Object.entries(files))
    await write(join(root, path), content);
  return root;
}

function run(root: string) {
  return spawnSync(
    process.execPath,
    ["--experimental-strip-types", checker, "--json"],
    {
      cwd: root,
      encoding: "utf8",
      env: { ...process.env, NO_COLOR: "1" },
    },
  );
}

function output(result: ReturnType<typeof run>) {
  return `${result.stdout}${result.stderr}`;
}

function diagnosticCodes(result: ReturnType<typeof run>) {
  try {
    const parsed = JSON.parse(result.stdout) as {
      diagnostics?: Array<{ code?: string }>;
    };
    return parsed.diagnostics?.map(({ code }) => code) ?? [];
  } catch {
    return [];
  }
}

afterEach(async () => {
  await Promise.all(
    roots.splice(0).map((root) => rm(root, { recursive: true, force: true })),
  );
});

describe("normalized inline lifecycle-hook coordinated contract", () => {
  test("accepts the dedicated schema-v1 contract while config stays 1.0.0 and CLI commands stay schema v8", async () => {
    const root = await fixture();

    const result = run(root);

    expect(result.status, output(result)).toBe(0);
    expect(JSON.parse(result.stdout)).toEqual({ diagnostics: [], ok: true });
    expect(output(result)).not.toContain(canary);
  });

  test("accepts explicit negations of contradictory guidance claims", async () => {
    const negatedGuidance = `${guidance}
Repository inline hooks must not be configured at hooks.scripts.<lifecycle>.<repo>.
Standalone and user-global hooks do not accept inline configuration.
Outcomes do not print the full inline snippet text.
Do not store credentials or API tokens in inline snippets or hook input.
`;
    const root = await fixture(
      Object.fromEntries(
        guidanceSurfaces.map(([, source]) => [source, negatedGuidance]),
      ),
    );

    const result = run(root);

    expect(result.status, output(result)).toBe(0);
    expect(JSON.parse(result.stdout)).toEqual({ diagnostics: [], ok: true });
  });

  test("allows only configure plaintext entry and its exact final preview to bear inline bodies", async () => {
    const configureDisclosure = `${guidance}
Visible plaintext command entry and the exact final preview are the only views that include inline command bodies.
Selection screens, ordinary previews, diagnostics, cancellation, JSON, and active-file plans remain body-free.
`;
    const root = await fixture({
      "repos/arashi-docs/public/llms-full.txt": configureDisclosure,
    });

    const result = run(root);

    expect(result.status, output(result)).toBe(0);
    expect(JSON.parse(result.stdout)).toEqual({ diagnostics: [], ok: true });
  });

  test.each([
    "Selection screens include inline command bodies.",
    "Setting lists include inline command bodies.",
    "Cancellation output includes inline command bodies.",
    "JSON inspection includes inline command bodies.",
    "Active-file plans include inline command bodies.",
  ])(
    "rejects an extra body-bearing configure view: %s",
    async (contradiction) => {
      const contradictoryDisclosure = `${guidance}
Visible plaintext command entry and the exact final preview are the only views that include inline command bodies.
${contradiction}
`;
      const root = await fixture({
        "repos/arashi-docs/public/llms-full.txt": contradictoryDisclosure,
      });

      const result = run(root);

      expect(result.status).not.toBe(0);
      expect(diagnosticCodes(result), output(result)).toContain(
        "INLINE_GUIDANCE_SOURCE_DISCLOSURE_MISMATCH",
      );
    },
  );

  test.each([
    [
      "dedicated producer identity",
      "repos/arashi/contracts/inline-lifecycle-hooks.json",
      { ...inlineContract, producer: "scripts/contracts/cli-commands.ts" },
      "INLINE_CONTRACT_PRODUCER_INVALID",
    ],
    [
      "dedicated schema version",
      "repos/arashi/contracts/inline-lifecycle-hooks.json",
      { ...inlineContract, schemaVersion: 2 },
      "INLINE_CONTRACT_SCHEMA_VERSION_INVALID",
    ],
    [
      "config version",
      "repos/arashi/contracts/inline-lifecycle-hooks.json",
      { ...inlineContract, configVersion: "2.0.0" },
      "INLINE_CONFIG_VERSION_CHANGED",
    ],
    [
      "command-contract schema version",
      "repos/arashi/contracts/cli-commands.json",
      { ...commandContract, schemaVersion: 9 },
      "INLINE_COMMAND_CONTRACT_VERSION_CHANGED",
    ],
    [
      "repository ownership",
      "repos/arashi/contracts/inline-lifecycle-hooks.json",
      {
        ...inlineContract,
        ownership: {
          ...inlineContract.ownership,
          repository: "hooks.scripts.<lifecycle>.<repo>",
        },
      },
      "INLINE_OWNERSHIP_MISMATCH",
    ],
    [
      "lifecycle set and order",
      "repos/arashi/contracts/inline-lifecycle-hooks.json",
      { ...inlineContract, lifecycles: inlineContract.lifecycles.slice(0, 3) },
      "INLINE_LIFECYCLES_MISMATCH",
    ],
    [
      "string shorthand",
      "repos/arashi/contracts/inline-lifecycle-hooks.json",
      {
        ...inlineContract,
        valueModel: {
          ...inlineContract.valueModel,
          stringShorthand: "powershell",
        },
      },
      "INLINE_VALUE_MODEL_MISMATCH",
    ],
    [
      "Windows interpreter order",
      "repos/arashi/contracts/inline-lifecycle-hooks.json",
      {
        ...inlineContract,
        selection: {
          ...inlineContract.selection,
          windows: {
            ...inlineContract.selection.windows,
            order: ["cmd", "powershell", "bash"],
          },
        },
      },
      "INLINE_INTERPRETER_POLICY_MISMATCH",
    ],
    [
      "ambiguity classification",
      "repos/arashi/contracts/inline-lifecycle-hooks.json",
      {
        ...inlineContract,
        ambiguity: { ...inlineContract.ambiguity, doctorCode: "HOOK_CONFLICT" },
      },
      "INLINE_AMBIGUITY_MISMATCH",
    ],
    [
      "exact option ownership",
      "repos/arashi/contracts/cli-commands.json",
      {
        ...commandContract,
        commands: commandContract.commands.map((command) =>
          command.path === "remove"
            ? {
                ...command,
                options: [...command.options, { long: "--no-hooks" }],
              }
            : command,
        ),
      },
      "INLINE_OPTION_OWNERSHIP_MISMATCH",
    ],
    [
      "command-specific dry-run ownership",
      "repos/arashi/contracts/inline-lifecycle-hooks.json",
      {
        ...inlineContract,
        dryRun: {
          ...inlineContract.dryRun,
          create: {
            discoversHooks: true,
            hookPreviews: true,
            emptyHookLedger: false,
          },
        },
      },
      "INLINE_DRY_RUN_MISMATCH",
    ],
    [
      "public source metadata",
      "repos/arashi/contracts/inline-lifecycle-hooks.json",
      {
        ...inlineContract,
        sourceMetadata: {
          ...inlineContract.sourceMetadata,
          fields: ["sourceKind", "sourceScriptPath"],
        },
      },
      "INLINE_SOURCE_METADATA_MISMATCH",
    ],
  ])(
    "rejects normalized contract drift in %s",
    async (_name, path, value, code) => {
      const root = await fixture({
        [path]: `${JSON.stringify(value, null, 2)}\n`,
      });

      const result = run(root);

      expect(result.status).not.toBe(0);
      expect(diagnosticCodes(result), output(result)).toContain(code);
      expect(output(result)).not.toContain(canary);
    },
  );

  test.each([
    ["string shorthand", 0],
    ["interpreter-map member", 1],
  ])(
    "rejects InlineHookSnippet %s without pattern \\S",
    async (_name, branch) => {
      const schema = structuredClone(configSchema);
      const snippet =
        branch === 0
          ? schema.definitions.InlineHookValue.anyOf[0]
          : schema.definitions.InlineHookValue.anyOf[1]!.properties!.bash;
      Reflect.deleteProperty(snippet, "pattern");
      const root = await fixture({
        "repos/arashi/schema/config.schema.json": `${JSON.stringify(schema, null, 2)}\n`,
      });

      const result = run(root);

      expect(result.status).not.toBe(0);
      expect(diagnosticCodes(result), output(result)).toContain(
        "INLINE_CONFIG_SCHEMA_MISMATCH",
      );
      expect(output(result)).not.toContain(canary);
    },
  );

  test.each(
    guidanceSurfaces.flatMap(([surfaceName, source]) =>
      guidanceMismatchCases.map(
        ({ name, code, mutate }) =>
          [surfaceName, source, name, code, mutate] as const,
      ),
    ),
  )(
    "rejects %s with controlled %s drift",
    async (_surfaceName, source, _requirementName, code, mutate) => {
      const root = await fixture({
        [source]: mutate(guidance),
      });

      const result = run(root);

      expect(result.status).not.toBe(0);
      expect(diagnosticCodes(result), output(result)).toContain(code);
      expect(output(result)).toContain(source);
      expect(output(result)).not.toContain(canary);
    },
  );

  test("fails closed when the dedicated CLI contract artifact is absent", async () => {
    const root = await fixture();
    await rm(join(root, "repos/arashi/contracts/inline-lifecycle-hooks.json"));

    const result = run(root);

    expect(result.status).not.toBe(0);
    expect(diagnosticCodes(result), output(result)).toContain(
      "INLINE_CONTRACT_MISSING",
    );
    expect(output(result)).not.toContain(canary);
  });
});
