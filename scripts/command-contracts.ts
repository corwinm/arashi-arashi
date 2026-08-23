import { access, cp, mkdtemp, readFile, readdir, rm } from "node:fs/promises";
import { execFile } from "node:child_process";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";
import { isDeepStrictEqual, promisify } from "node:util";

export type Severity = "error" | "info";
export interface Diagnostic {
  severity: Severity;
  category: "schema" | "docs" | "skills" | "vscode";
  code: string;
  source: string;
  subject: string;
  message: string;
}
export interface CheckResult {
  ok: boolean;
  diagnostics: Diagnostic[];
}
export interface CheckContractsOptions {
  runFocusedCheckers?: boolean;
}
type Obj = Record<string, unknown>;

const paths = {
  contract: "repos/arashi/contracts/cli-commands.json",
  cliReadme: "repos/arashi/README.md",
  cliCreateConfig: "repos/arashi/contracts/create-launch-config.json",
  cliKittySessions: "repos/arashi/contracts/kitty-worktree-sessions.json",
  configSchema: "repos/arashi/schema/config.schema.json",
  docs: "repos/arashi-docs/docs/commands",
  docsCreateConfig: "repos/arashi-docs/contracts/create-launch-config.json",
  docsKittySessions: "repos/arashi-docs/contracts/kitty-worktree-sessions.json",
  docsCliOptions: "repos/arashi-docs/contracts/cli-options.json",
  docsSwitchConfig: "repos/arashi-docs/contracts/switch-config.json",
  skills: "repos/arashi-skills/skills/arashi",
  coverage: "repos/arashi-skills/contracts/command-coverage.json",
  skillsCreateConfig: "repos/arashi-skills/contracts/create-launch-config.json",
  skillsKittySessions:
    "repos/arashi-skills/contracts/kitty-worktree-sessions.json",
  skillsSwitchConfig: "repos/arashi-skills/contracts/switch-config.json",
  policy: "repos/arashi-vscode/contracts/command-policy.json",
  manifest: "repos/arashi-vscode/package.json",
  workflow: ".github/workflows/cross-repo-command-contracts.yml",
  docsOptionPolicyCheck: "repos/arashi-docs/scripts/check-tab-launch-docs.ts",
  docsCliOptionPolicyCheck:
    "repos/arashi-docs/scripts/check-cli-option-docs.ts",
  docsTabPolicy: "repos/arashi-docs/docs/workflows/launch-disposition.md",
  skillsOptionPolicyCheck:
    "repos/arashi-skills/scripts/tab-launch-disposition-guidance-selftest.mjs",
  skillsCliOptionPolicyCheck:
    "repos/arashi-skills/scripts/cli-flag-rationalization-guidance-selftest.mjs",
  docsCompletionCheck:
    "repos/arashi-docs/scripts/check-shell-completion-docs.ts",
  skillsCompletionCheck:
    "repos/arashi-skills/scripts/shell-completion-guidance-selftest.mjs",
  docsSshAliasCheck: "repos/arashi-docs/scripts/check-ssh-host-alias-docs.ts",
  skillsSshAliasCheck:
    "repos/arashi-skills/scripts/ssh-host-alias-guidance-selftest.mjs",
  docsCreateBaseCheck: "repos/arashi-docs/scripts/check-create-base-docs.ts",
  skillsCreateBaseContract:
    "repos/arashi-skills/contracts/create-base-branch.json",
  skillsCreateBaseCheck:
    "repos/arashi-skills/scripts/create-base-guidance-selftest.mjs",
  docsConfigureCheck: "repos/arashi-docs/scripts/check-configure-docs.ts",
  docsSemanticChecks: "repos/arashi-docs/scripts/semantic-doc-checks.json",
  skillsConfigureCheck:
    "repos/arashi-skills/scripts/configure-workspace-guidance-selftest.mjs",
  skillsGuidanceChecks: "repos/arashi-skills/scripts/guidance-checkers.json",
} as const;
const docsAggregate = "pnpm --dir repos/arashi-docs validate:semantic-docs";
const skillsSourceAggregate =
  "node repos/arashi-skills/scripts/validate-guidance.mjs";
const skillsArchiveCreate =
  "node repos/arashi-skills/scripts/create-release-archive.mjs --root repos/arashi-skills --output arashi-skill-package.tar.gz";
const skillsArchiveVerify =
  "node repos/arashi-skills/scripts/create-release-archive.mjs --verify arashi-skill-package.tar.gz";
const skillsArchiveExtract =
  "tar -xzf arashi-skill-package.tar.gz -C package-check";
const skillsPackageAggregate =
  "node repos/arashi-skills/scripts/validate-guidance.mjs --skill-root package-check/skills/arashi";
const createBaseBranchPattern = String.raw`^(?!HEAD$)(?!origin/(?:HEAD$|-))(?![-/.])(?!.*(?:/\.|//|\.\.|@\{))(?!.*\.lock(?:/|$))(?!.*[/.]$)[^\u0000-\u0020\u007F~^:?*\[\\]+$`;
const configureSemanticPolicy: Obj = {
  actions: ["keep", "edit", "clear"],
  descriptors: {
    commandDefaults: [
      "defaults.create.switch",
      "defaults.create.launch",
      "defaults.switch.mode",
    ],
    editorDefaults: [
      "defaults.editors.vscode.create.switch",
      "defaults.editors.vscode.create.launch",
      "defaults.editors.cursor.create.switch",
      "defaults.editors.cursor.create.launch",
      "defaults.editors.kiro.create.switch",
      "defaults.editors.kiro.create.launch",
    ],
    meta: ["meta.baseBranch"],
    repository: [
      "groups",
      "baseBranch",
      "copy",
      "symlink",
      "pre-create",
      "post-create",
      "pre-remove",
      "post-remove",
    ],
    workspace: [
      "reposDir",
      "worktreesDir",
      "baseBranch",
      "sync.timeoutSeconds",
    ],
    workspaceHooks: [
      "hooks.timeout",
      "hooks.scripts.pre-create",
      "hooks.scripts.post-create",
      "hooks.scripts.pre-remove",
      "hooks.scripts.post-remove",
    ],
  },
  invocation: {
    editing: "tty-stdin-and-stdout",
    json: "sanitized-inspection-only",
  },
  loading: "exact-bytes-strict-no-migration-or-repair",
  noOp: "preserve-original-bytes-before-confirmation",
  preview: {
    activeFiles: "separate-body-free-list",
    config: "exact-serialized-json-including-inline-bodies",
  },
  scopes: [
    "workspace-settings",
    "workspace-hooks",
    "command-defaults",
    "editor-defaults",
    "meta-policy",
    "repository",
  ],
  secrecy: {
    inlineEntry: "visible-plaintext",
    ordinaryAndJson: "lifecycle-and-interpreter-presence-only",
  },
  state: {
    effective: ["inherited", "built-in"],
    persisted: ["configured", "not-configured"],
  },
  transaction: {
    activeFiles: "atomic-no-replace-with-owned-rollback",
    configSavesAtMost: 1,
    expectedBytes: true,
    lock: "shared-workspace-add-configure-lock",
    nativeFiles: "metadata-only-observe-keep-skip-never-overwrite",
  },
};
export const createBaseSemanticPolicy: Obj = {
  ownership: "command",
  persisted: false,
  createBase: {
    scope: {
      cli: "invocation-only",
      workspaceDefault: "defaults.create.baseBranch",
      workspaceDefaultScope: "generic-only",
      editorScopedDefault: "rejected",
    },
    precedence: ["cli", "defaults.create.baseBranch", "legacy-omitted"],
    normalization: { originPrefix: "remove-at-most-one" },
    standalone: {
      cli: "invocation-only",
      workspaceDefault: "ignored",
      omitted: "legacy-current-head",
    },
    resolution: {
      repositories: "every-effective-selected-including-reused",
      refs: ["refs/heads/<branch>", "refs/remotes/origin/<branch>"],
    },
    mutation: {
      preflight: "all-before-any",
      executionStartPoint: "immutable-resolved-oid",
      reusedTarget: {
        ancestry: "not-asserted-checked-or-derived",
        baseResolution: "required",
        mutation: "none",
      },
    },
    output: {
      humanDryRun: { baseResolution: true },
      json: {
        base: "optional",
        baseFields: ["requestedBranch", "source", "repositories"],
        requestedBranch: "normalized-logical-branch",
        sources: ["cli", "config"],
        targetActions: ["created", "reused"],
        success: {
          ordering: "effective-selected-repository-order",
          repositories: "complete-selected-set",
          repositoryFields: [
            "repositoryName",
            "repositoryPath",
            "resolvedRef",
            "resolvedOid",
            "targetAction",
          ],
          repositoryPath: "canonical-absolute",
        },
        failure: {
          attemptedRefs: [
            "refs/heads/<branch>",
            "refs/remotes/origin/<branch>",
          ],
          code: "CREATE_BASE_RESOLUTION_FAILED",
          fields: ["requestedBranch", "source", "repositories"],
          ordering: "effective-selected-repository-order",
          repositories: "affected-only-selected-set",
          repositoryFields: [
            "repositoryName",
            "repositoryPath",
            "attemptedRefs",
          ],
          repositoryPath: "canonical-absolute",
        },
      },
    },
    environmentVariables: { ARASHI_BASE_BRANCH: "forbidden" },
  },
};
const execFileAsync = promisify(execFile);
const switchModes = ["auto", "cd", "launch", "sesh", "herdr"];
const switchAutoOrder = [
  "tmux",
  "herdr",
  "cmux",
  "ide",
  "kitty",
  "cd",
  "platform",
];
const switchLegacyFields = [
  "defaults.switch.launchMode",
  "defaults.switch.launch_mode",
];
const kittyWorktreeSessionContract: Obj = {
  schemaVersion: 1,
  minimumVersion: "0.43.0",
  resultMode: "kitty",
  autoOrder: ["tmux", "herdr", "cmux", "ide", "kitty", "cd", "platform"],
  detection: {
    beforeSupportPreflight: true,
    trimMarkers: true,
    requireAllEvidence: true,
    termOnlyManaged: false,
    evidence: ["KITTY_PID", "KITTY_WINDOW_ID"],
  },
  remoteControl: {
    required: true,
    clients: ["inherited-path", "macos-app-bundle"],
    arbitrarySocketDiscovery: false,
  },
  identity: {
    source: "canonical-realpath",
    algorithm: "sha256",
    marker: "arashi_worktree_id",
    exactMatch: true,
  },
  reuse: {
    existing: "focus",
    duplicate: "fail",
    closeRaceRetries: 1,
    automaticWindowCleanup: false,
    staleReadableMetadata: "accept",
  },
  locking: {
    crossProcess: true,
    scope: "identity",
    timeoutMs: 10_000,
    liveOwnerStealing: false,
    deadOwnerRecovery: true,
    malformedOwnerRecoveryAfterMs: 30_000,
    ownershipSafeRelease: true,
  },
  session: {
    scope: "live-only",
    persistentFiles: false,
    removeClosesWindows: false,
  },
  selection: {
    autoDetectedOnly: true,
    explicitFlag: false,
    persistedMode: false,
    failClosed: true,
  },
  create: {
    sharedLauncher: true,
    failurePreservesCreatedWorktrees: true,
  },
};
const kittyDocsGuidance = [
  "Kitty 0.43 or newer",
  "`allow_remote_control`",
  "after integrated IDE detection and before parent-shell `cd`",
  "exact Arashi worktree identity",
  "live only",
  "`.kitty-session`",
  "`aw remove` does not close Kitty windows or sessions",
  "no `--kitty` flag",
  "does not add Kitty to persistent Arashi launch configuration",
  "`LAUNCH_FAILED`",
  "does not fall back",
  "created worktrees remain available",
  "cross-process identity lock",
  "10 seconds",
  "live owner",
  "dead owner",
  "30 seconds",
  "ownership-safe release",
] as const;
const kittyGuidanceRequirements: Array<{
  category: "docs" | "skills";
  phrases: readonly string[];
  source: string;
}> = [
  {
    category: "docs",
    source: "repos/arashi-docs/docs/workflows/kitty.md",
    phrases: kittyDocsGuidance,
  },
  {
    category: "docs",
    source: "repos/arashi-docs/public/workflows/kitty.md",
    phrases: kittyDocsGuidance,
  },
  {
    category: "docs",
    source: "repos/arashi-docs/public/llms-full.txt",
    phrases: kittyDocsGuidance,
  },
  {
    category: "skills",
    source: "repos/arashi-skills/skills/arashi/references/prerequisites.md",
    phrases: [
      "Kitty 0.43+",
      "kitten --version",
      "remote control",
      "allow_remote_control",
    ],
  },
  {
    category: "skills",
    source:
      "repos/arashi-skills/skills/arashi/references/commands/switch-and-launch.md",
    phrases: [
      "tmux → Herdr → cmux → integrated IDE → Kitty → parent-shell `cd` → terminal application/platform fallback",
      '`mode: "kitty"`',
      "no explicit Kitty launcher flag",
      "not a persisted create or switch mode",
      "does not fall back",
    ],
  },
  {
    category: "skills",
    source: "repos/arashi-skills/skills/arashi/references/workflows.md",
    phrases: [
      "Kitty 0.43+",
      "exact Arashi-managed marker",
      "stable identity",
      "live-only",
      "`.kitty-session`",
      "does not close Kitty",
      "preserves every successfully created worktree",
    ],
  },
  {
    category: "skills",
    source: "repos/arashi-skills/skills/arashi/references/troubleshooting.md",
    phrases: [
      "Kitty 0.43+",
      "remote control",
      "LAUNCH_FAILED",
      "duplicate exact marked Kitty windows",
      "cross-process identity lock",
      "10-second wait",
      "live owner",
      "dead owner",
      "30 seconds",
      "ownership-safe release",
    ],
  },
];
const addMaterializationContract: Obj = {
  activeConfigOwnership: true,
  canonicalCloneDefaultBranch: true,
  coordinatedBranch: "active-parent-branch",
  linkedMode: "git-topology",
  resultRoles: [
    "path",
    "materialization",
    "canonicalPath",
    "worktreePath",
    "defaultBranch",
    "coordinatedBranch",
    "setupScript",
    "setupScriptCreated",
  ],
};
const addMaterializationGuidanceRequirements: Array<{
  category: "docs" | "skills";
  phrases: readonly string[];
  source: string;
}> = [
  {
    category: "docs",
    source: paths.cliReadme,
    phrases: [
      "canonical clone",
      "active linked parent worktree",
      "coordinated branch",
    ],
  },
  {
    category: "docs",
    source: "repos/arashi-docs/docs/commands/add.md",
    phrases: [
      "linked parent worktree",
      "canonical clone",
      "active child worktree",
      "linked checkout's `.arashi/config.json`",
    ],
  },
  {
    category: "docs",
    source: "repos/arashi-docs/public/commands/add.md",
    phrases: [
      "linked parent worktree",
      "canonical clone",
      "active child worktree",
      "linked checkout's `.arashi/config.json`",
    ],
  },
  {
    category: "docs",
    source: "repos/arashi-docs/public/llms-full.txt",
    phrases: [
      "linked parent worktree",
      "canonical clone",
      "active child worktree",
      "linked checkout's `.arashi/config.json`",
    ],
  },
  {
    category: "skills",
    source:
      "repos/arashi-skills/skills/arashi/references/commands/workspace.md",
    phrases: [
      "canonical clone",
      "child default branch",
      "active child path",
      "active parent branch",
      "Only the active parent worktree's `.arashi/config.json`",
      "remote-tracking ref",
      "creates it from the detected child default branch",
      "`local` scope",
      "`tracked` scope",
      "`none`",
      "retains the canonical clone",
    ],
  },
];
const object = (value: unknown): value is Obj =>
  typeof value === "object" && value !== null && !Array.isArray(value);
const text = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;
const strings = (value: unknown): string[] | undefined =>
  Array.isArray(value) && value.every(text) ? value : undefined;
const sorted = (values: string[]): string[] => [...values].sort();
const sameStrings = (left: string[] | undefined, right: string[]): boolean =>
  left !== undefined &&
  left.length === new Set(left).size &&
  JSON.stringify(sorted(left)) === JSON.stringify(sorted(right));
const completionCandidates = new Map<string, Obj>([
  [
    "completion.shell",
    { candidateKind: "shell", choices: ["bash", "fish", "zsh"] },
  ],
  [
    "create.--conflict",
    { candidateKind: "choice", choices: ["ABORT", "REUSE_EXISTING"] },
  ],
  ["create.--editor-host", { choices: ["cursor", "kiro", "vscode"] }],
  ["create.--group", { candidateKind: "group" }],
  ["create.--only", { candidateKind: "repository" }],
  ["exec.--group", { candidateKind: "group" }],
  ["exec.--only", { candidateKind: "repository" }],
  ["init.--ignore-scope", { choices: ["local", "tracked", "none"] }],
  ["move.--from", { candidateKind: "workspace" }],
  ["move.--to", { candidateKind: "workspace" }],
  ["pull.--group", { candidateKind: "group" }],
  ["pull.--only", { candidateKind: "repository" }],
  ["push.--group", { candidateKind: "group" }],
  ["push.--only", { candidateKind: "repository" }],
  ["remove.target", { candidateKind: "worktree" }],
  ["setup.--group", { candidateKind: "group" }],
  ["setup.--only", { candidateKind: "repository" }],
  [
    "shell init.shell",
    { candidateKind: "shell", choices: ["bash", "fish", "zsh"] },
  ],
  ["status.--group", { candidateKind: "group" }],
  ["status.--only", { candidateKind: "repository" }],
  ["switch.filter", { candidateKind: "worktree" }],
  ["sync.--group", { candidateKind: "group" }],
  ["sync.--only", { candidateKind: "repository" }],
]);
const completionHiddenOptions = new Set([
  "create.--editor-host",
  "handoff.--markdown",
  "switch.--no-cd",
  "switch.--no-default-launch",
]);
const completionRepeatableOptions = new Set([
  "clone.--repo-base",
  "create.--repo-base",
  "handoff.--link",
  "handoff.--next-command",
  "handoff.--risk",
  "handoff.--todo",
  "handoff.--validation",
]);
const cliStandaloneSupport = new Set([
  "full",
  "conditional",
  "configured-only",
  "not-applicable",
]);
const skillsStandaloneSupport = new Set([
  "supported",
  "conditional",
  "configured-only",
  "not-applicable",
]);
const normalizeStandaloneSupport = (value: unknown): string | undefined => {
  if (!text(value)) return undefined;
  return value === "full" ? "supported" : value;
};
const initCompatibleOptions = ["--dry-run", "--json", "--verbose"];
const initIncompatibleOptions = [
  "--force",
  "--ignore-scope",
  "--no-discover",
  "--repos-dir",
  "--worktrees-dir",
];
const tabLauncherSupport: Obj = {
  noFallback: true,
  supported: [
    "cmux",
    "herdr-with-workspace",
    "macos-ghostty-1.3+",
    "macos-iterm2",
    "managed-kitty",
    "sesh",
    "tmux",
    "wezterm-with-pane",
    "windows-terminal-with-session",
  ],
  unsupported: [
    "available-ide",
    "generic",
    "git-bash",
    "linux-ghostty",
    "macos-ghostty-before-1.3",
    "macos-terminal",
    "unmanaged-kitty",
  ],
};
const canonicalOptionPolicies: Record<
  "create" | "switch",
  Record<string, Obj>
> = {
  create: {
    "--tab": {
      compatibleOptions: [
        "--herdr",
        "--launch",
        "--no-launch",
        "--no-switch",
        "--sesh",
        "--switch",
        "--tmux",
      ],
      conflicts: [],
      dryRun: { runtimeTargetEvidenceRequired: false, supported: true },
      implies: ["launch", "switch"],
      json: {
        guardPrecedence: "before-option-validation",
        mode: "interactive-or-launch",
        unsupported: true,
      },
      launcherSupport: tabLauncherSupport,
      overrides: ["--no-launch", "--no-switch", "configured-launcher"],
      persisted: false,
    },
    "--tmux": {
      compatibleOptions: ["--no-launch", "--no-switch"],
      conflicts: ["--herdr", "--sesh"],
      environment: { name: "TMUX", nonEmptyAfterTrim: true },
      implies: ["launch", "switch"],
      json: {
        guardPrecedence: "before-option-validation",
        mode: "interactive-or-launch",
        unsupported: true,
      },
      persisted: false,
    },
  },
  switch: {
    "--tab": {
      compatibleOptions: [
        "--cursor",
        "--herdr",
        "--kiro",
        "--no-cd",
        "--no-default-launch",
        "--sesh",
        "--tmux",
        "--vscode",
      ],
      conflicts: ["--cd"],
      implies: ["launch"],
      json: {
        guardPrecedence: "before-option-validation",
        mode: "launch",
        unsupported: true,
      },
      launcherSupport: tabLauncherSupport,
      overrides: ["configured-cd", "configured-launcher", "contextual-cd"],
      persisted: false,
    },
    "--tmux": {
      compatibleOptions: ["--no-cd", "--no-default-launch"],
      conflicts: [
        "--cd",
        "--cursor",
        "--herdr",
        "--kiro",
        "--sesh",
        "--vscode",
      ],
      environment: { name: "TMUX", nonEmptyAfterTrim: true },
      implies: ["launch"],
      json: {
        guardPrecedence: "before-option-validation",
        mode: "launch",
        unsupported: true,
      },
      persisted: false,
    },
  },
};
const samePolicyValue = (actual: unknown, expected: unknown): boolean => {
  if (Array.isArray(expected))
    return (
      Array.isArray(actual) &&
      actual.length ===
        new Set(actual.map((value) => JSON.stringify(value))).size &&
      JSON.stringify([...actual].sort()) ===
        JSON.stringify([...expected].sort())
    );
  if (object(expected)) {
    if (!object(actual)) return false;
    const actualKeys = Object.keys(actual).sort();
    const expectedKeys = Object.keys(expected).sort();
    return (
      JSON.stringify(actualKeys) === JSON.stringify(expectedKeys) &&
      expectedKeys.every((key) => samePolicyValue(actual[key], expected[key]))
    );
  }
  return actual === expected;
};
const exactKeys = (
  value: Obj,
  required: readonly string[],
  optional: readonly string[] = [],
): boolean => {
  const allowed = new Set([...required, ...optional]);
  return (
    required.every((key) => key in value) &&
    Object.keys(value).every((key) => allowed.has(key))
  );
};
const uniqueStrings = (value: unknown): value is string[] => {
  const values = strings(value);
  return values !== undefined && values.length === new Set(values).size;
};
const validOptionPolicy = (value: unknown): value is Obj => {
  if (!object(value)) return false;
  if (
    !exactKeys(
      value,
      ["compatibleOptions", "conflicts", "implies", "json", "persisted"],
      ["dryRun", "environment", "launcherSupport", "overrides"],
    )
  )
    return false;
  const jsonPolicy = object(value.json) ? value.json : {};
  if (
    !uniqueStrings(value.compatibleOptions) ||
    !uniqueStrings(value.conflicts) ||
    !uniqueStrings(value.implies) ||
    value.persisted !== false ||
    !exactKeys(jsonPolicy, ["guardPrecedence", "mode", "unsupported"]) ||
    !text(jsonPolicy.guardPrecedence) ||
    !text(jsonPolicy.mode) ||
    jsonPolicy.unsupported !== true
  )
    return false;
  if (
    value.environment !== undefined &&
    (!object(value.environment) ||
      !exactKeys(value.environment, ["name", "nonEmptyAfterTrim"]) ||
      !text(value.environment.name) ||
      value.environment.nonEmptyAfterTrim !== true)
  )
    return false;
  if (
    value.dryRun !== undefined &&
    (!object(value.dryRun) ||
      !exactKeys(value.dryRun, [
        "runtimeTargetEvidenceRequired",
        "supported",
      ]) ||
      value.dryRun.supported !== true ||
      typeof value.dryRun.runtimeTargetEvidenceRequired !== "boolean")
  )
    return false;
  if (value.launcherSupport !== undefined) {
    if (!object(value.launcherSupport)) return false;
    const launcherSupport = value.launcherSupport;
    const supported = launcherSupport.supported;
    const unsupported = launcherSupport.unsupported;
    if (
      !exactKeys(launcherSupport, ["noFallback", "supported", "unsupported"]) ||
      launcherSupport.noFallback !== true ||
      !uniqueStrings(supported) ||
      !uniqueStrings(unsupported)
    )
      return false;
    if (supported.some((launcher) => unsupported.includes(launcher)))
      return false;
  }
  return value.overrides === undefined || uniqueStrings(value.overrides);
};
const sameInitPolicy = (left: Obj, right: Obj): boolean =>
  left.option === right.option &&
  left.dryRun === right.dryRun &&
  left.json === right.json &&
  sameStrings(
    strings(left.compatibleOptions),
    strings(right.compatibleOptions) ?? [],
  ) &&
  sameStrings(
    strings(left.incompatibleOptions),
    strings(right.incompatibleOptions) ?? [],
  );
const exists = async (path: string): Promise<boolean> => {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
};
const commandOptionNames = (command: Obj): string[] =>
  Array.isArray(command.options)
    ? command.options
        .filter(object)
        .flatMap((option) =>
          text(option.flags) ? (option.flags.match(/--[a-z0-9-]+/g) ?? []) : [],
        )
    : [];
const commandOptions = (command: Obj): Obj[] =>
  Array.isArray(command.options) ? command.options.filter(object) : [];
const optionLong = (option: Obj): string | undefined =>
  text(option.long) ? option.long : undefined;
const optionMap = (command: Obj): Map<string, Obj> =>
  new Map(
    commandOptions(command).flatMap((option) => {
      const long = optionLong(option);
      return long ? [[long, option] as const] : [];
    }),
  );

function checkConfigurePolicy(
  command: Obj | undefined,
  docsChecks: unknown,
  skillsChecks: unknown,
  diagnostics: Diagnostic[],
): void {
  if (!command) {
    add(
      diagnostics,
      "error",
      "schema",
      "CONFIGURE_CLI_POLICY_MISMATCH",
      paths.contract,
      "configure",
      "Schema v8 must publish the canonical configure command and semantic policy.",
    );
    return;
  }
  const semantics = object(command.semantics) ? command.semantics : {};
  const json = object(semantics.json) ? semantics.json : {};
  const standalone = object(semantics.standalone) ? semantics.standalone : {};
  if (
    !isDeepStrictEqual(semantics.configure, configureSemanticPolicy) ||
    json.support !== "full" ||
    standalone.support !== "configured-only"
  )
    add(
      diagnostics,
      "error",
      "schema",
      "CONFIGURE_CLI_POLICY_MISMATCH",
      paths.contract,
      "configure",
      "Configure scopes, descriptors, configured/effective state, keep/edit/clear actions, TTY/JSON inspection, exclusive body-bearing views, exact preview, separate active-file plan, and shared expected-byte transaction must match the canonical CLI policy exactly.",
    );

  const optionNames = commandOptionNames(command);
  if (!sameStrings(optionNames, ["--help", "--json"]))
    add(
      diagnostics,
      "error",
      "schema",
      "CONFIGURE_CLI_POLICY_MISMATCH",
      paths.contract,
      "configure.options",
      "Configure must expose only help and sanitized JSON inspection, without broad non-interactive mutation flags.",
    );

  for (const surface of ["docs", "skills"] as const) {
    const companion = object(semantics[surface]) ? semantics[surface] : {};
    if (companion.expectation !== "required")
      add(
        diagnostics,
        "error",
        surface,
        "CONFIGURE_COMPANION_POLICY_MISMATCH",
        paths.contract,
        surface,
        `Configure requires ${surface} semantic coverage.`,
      );
  }
  const vscode = object(semantics.vscode) ? semantics.vscode : {};
  if (
    vscode.expectation !== "excluded" ||
    !text(vscode.reason) ||
    !/terminal|interactive/i.test(vscode.reason)
  )
    add(
      diagnostics,
      "error",
      "vscode",
      "CONFIGURE_COMPANION_POLICY_MISMATCH",
      paths.contract,
      "vscode",
      "Configure must carry a reasoned VS Code exclusion tied to its terminal-owned interactive workflow.",
    );

  const docsEntries = Array.isArray(docsChecks) ? docsChecks : [];
  if (!docsEntries.includes("check-configure-docs.ts"))
    add(
      diagnostics,
      "error",
      "docs",
      "DOCS_CONFIGURE_CHECK_UNREACHABLE",
      paths.docsSemanticChecks,
      "check-configure-docs.ts",
      "The stable docs semantic aggregate must register the configure checker.",
    );
  const skillsEntries = Array.isArray(skillsChecks) ? skillsChecks : [];
  if (
    !skillsEntries.includes("scripts/configure-workspace-guidance-selftest.mjs")
  )
    add(
      diagnostics,
      "error",
      "skills",
      "SKILLS_CONFIGURE_CHECK_UNREACHABLE",
      paths.skillsGuidanceChecks,
      "scripts/configure-workspace-guidance-selftest.mjs",
      "The stable source and extracted-package skill aggregates must register the configure checker.",
    );
}
const commonAliases = new Map([
  ["--verbose", "-v"],
  ["--force", "-f"],
  ["--json", "-j"],
  ["--only", "-o"],
  ["--group", "-g"],
  ["--dry-run", "-n"],
]);
const commandQualifiedAliases = new Map([
  ["add.--name", "-n"],
  ["create.--interactive", "-i"],
  ["list.--table", "-t"],
  ["status.--short", "-s"],
  ["update.--yes", "-y"],
]);
const expectedSchemaV5OptionSurface = new Map<string, readonly string[]>([
  ["add", ["--create-setup", "--force", "--json", "--name"]],
  ["clone", ["--all", "--json"]],
  [
    "create",
    [
      "--conflict",
      "--editor-host",
      "--herdr",
      "--launch",
      "--move-changes",
      "--no-hooks",
      "--no-launch",
      "--no-progress",
      "--no-switch",
      "--sesh",
      "--switch",
      "--tab",
      "--tmux",
      "--group",
      "--interactive",
      "--json",
      "--dry-run",
      "--only",
    ],
  ],
  ["doctor", ["--json"]],
  ["exec", ["--dirty", "--fail-fast", "--jobs", "--group", "--json", "--only"]],
  [
    "handoff",
    [
      "--link",
      "--markdown",
      "--next-command",
      "--risk",
      "--todo",
      "--validation",
      "--json",
    ],
  ],
  [
    "init",
    [
      "--ignore-scope",
      "--no-discover",
      "--repos-dir",
      "--worktrees-dir",
      "--zero-config",
      "--force",
      "--json",
      "--dry-run",
      "--verbose",
    ],
  ],
  ["install", ["--json"]],
  ["list", ["--max-depth", "--json", "--table", "--verbose"]],
  ["move", ["--from", "--to", "--json"]],
  ["prune", ["--expire", "--json", "--dry-run"]],
  ["pull", ["--group", "--json", "--only", "--verbose"]],
  ["push", ["--set-upstream", "--group", "--json", "--dry-run", "--only"]],
  [
    "remove",
    [
      "--keep-branches",
      "--keep-worktrees",
      "--no-check-dirty",
      "--path",
      "--force",
      "--json",
      "--dry-run",
    ],
  ],
  ["setup", ["--group", "--json", "--only", "--verbose"]],
  ["shell", []],
  ["shell init", ["--json"]],
  ["shell install", []],
  ["status", ["--group", "--json", "--only", "--short", "--verbose"]],
  [
    "switch",
    [
      "--all",
      "--cd",
      "--cursor",
      "--herdr",
      "--ignore-configured-launcher",
      "--kiro",
      "--launch",
      "--no-cd",
      "--no-default-launch",
      "--path",
      "--repos",
      "--sesh",
      "--tab",
      "--tmux",
      "--vscode",
      "--json",
    ],
  ],
  ["sync", ["--group", "--json", "--only", "--verbose"]],
  ["update", ["--check", "--json", "--dry-run", "--yes"]],
]);
const selectorPolicyBase: Obj = {
  accepts: ["repeated", "comma-separated", "mixed"],
  blankSegments: "ignored-beside-values",
  deduplicate: "first-occurrence",
  explicitEmpty: "error",
  flatten: "encounter-order",
  omitted: "default-selection",
  supplied: "distinct-from-omitted",
  trim: true,
  unknown: "error",
  validationPrecedence: "before-repository-work",
};
const compatibilityBoundary: Obj = {
  earliestMajor: 2,
  requiresApprovedBreakingChange: true,
};
const switchSharedPolicy: Obj = {
  explicitLauncher: {
    authoritative: true,
    compatible: true,
    noFallback: "preserved",
  },
  jsonGuardPrecedence: "before-option-and-conflict-validation",
  tab: {
    bypassesConfiguredDefaults: true,
    compatible: true,
    disposition: "tab",
  },
};
const explicitSwitchOptions = [
  "--cursor",
  "--herdr",
  "--kiro",
  "--sesh",
  "--tmux",
  "--vscode",
];
const switchPolicyExpected = (long: string): Obj | undefined => {
  const explicit = explicitSwitchOptions.includes(long);
  if (long === "--cd")
    return {
      conflicts: [
        "--cursor",
        "--herdr",
        "--kiro",
        "--launch",
        "--no-cd",
        "--sesh",
        "--tab",
        "--tmux",
        "--vscode",
      ],
      implies: ["cd"],
      ownership: "command",
      persisted: false,
    };
  if (explicit)
    return {
      conflicts: [
        "--cd",
        ...explicitSwitchOptions.filter((x) => x !== long),
      ].sort(),
      implies: ["launch"],
      ownership: "command",
      persisted: false,
      switch: switchSharedPolicy,
    };
  if (["--launch", "--no-cd"].includes(long))
    return {
      ...(long === "--launch"
        ? {
            compatibility: {
              alternatives: ["--no-cd"],
              canonical: { option: "--launch" },
              deprecatedAlternatives: true,
              removal: compatibilityBoundary,
            },
          }
        : {}),
      conflicts: ["--cd"],
      implies: ["launch"],
      ownership: "command",
      persisted: false,
      switch: {
        configuredModeEffects: {
          auto: "launch",
          cd: "launch",
          herdr: "preserve-named-launcher",
          launch: "launch",
          sesh: "preserve-named-launcher",
        },
        ...switchSharedPolicy,
      },
    };
  if (["--ignore-configured-launcher", "--no-default-launch"].includes(long))
    return {
      ...(long === "--ignore-configured-launcher"
        ? {
            compatibility: {
              alternatives: ["--no-default-launch"],
              canonical: { option: "--ignore-configured-launcher" },
              deprecatedAlternatives: true,
              removal: compatibilityBoundary,
            },
          }
        : {}),
      conflicts: [],
      implies: [],
      ownership: "command",
      persisted: false,
      switch: {
        configuredModeEffects: {
          auto: "preserve-configured-or-contextual-behavior",
          cd: "preserve-configured-or-contextual-behavior",
          herdr: "automatic-launch",
          launch: "preserve-configured-or-contextual-behavior",
          sesh: "automatic-launch",
        },
        ...switchSharedPolicy,
      },
    };
  if (long === "--tab")
    return {
      conflicts: ["--cd"],
      implies: ["launch"],
      ownership: "command",
      persisted: false,
      switch: switchSharedPolicy,
    };
};

function validateCompatibility(
  commandPath: string,
  owner: Obj,
  options: Map<string, Obj>,
  diagnostics: Diagnostic[],
): void {
  const long = optionLong(owner);
  const policy = object(owner.semanticPolicy) ? owner.semanticPolicy : {};
  const compatibility = object(policy.compatibility)
    ? policy.compatibility
    : undefined;
  if (!long || !compatibility) return;
  const alternatives = strings(compatibility.alternatives) ?? [];
  const removal = object(compatibility.removal) ? compatibility.removal : {};
  const canonical = object(compatibility.canonical)
    ? compatibility.canonical
    : {};
  const canonicalValid =
    canonical.option === long ||
    (canonical.omittedDefault === true && text(canonical.behavior));
  const canonicalVisible =
    canonical.option !== long ||
    (owner.hidden === false && owner.deprecated === false);
  const valid =
    alternatives.length > 0 &&
    compatibility.deprecatedAlternatives === true &&
    removal.earliestMajor === 2 &&
    removal.requiresApprovedBreakingChange === true &&
    canonicalValid &&
    canonicalVisible &&
    alternatives.every((alternative) => {
      const option = options.get(alternative);
      return option?.hidden === true && option.deprecated === true;
    });
  if (!valid)
    add(
      diagnostics,
      "error",
      "schema",
      "CLI_COMPATIBILITY_INVALID",
      paths.contract,
      `${commandPath}.${long}`,
      "Compatibility mappings require a registered hidden/deprecated alternative and the approved 2.0 removal boundary.",
    );
}

function compareExactRecord(
  actual: unknown,
  expected: unknown,
  source: string,
  subject: string,
  category: Diagnostic["category"],
  code: string,
  message: string,
  diagnostics: Diagnostic[],
): void {
  if (object(expected)) {
    if (!object(actual)) {
      add(diagnostics, "error", category, code, source, subject, message);
      return;
    }
    for (const key of [
      ...new Set([...Object.keys(actual), ...Object.keys(expected)]),
    ].sort())
      compareExactRecord(
        actual[key],
        expected[key],
        source,
        subject ? `${subject}.${key}` : key,
        category,
        code,
        message,
        diagnostics,
      );
    return;
  }
  if (Array.isArray(expected)) {
    if (!Array.isArray(actual)) {
      add(diagnostics, "error", category, code, source, subject, message);
      return;
    }
    const length = Math.max(actual.length, expected.length);
    for (let index = 0; index < length; index += 1)
      compareExactRecord(
        actual[index],
        expected[index],
        source,
        `${subject}.${index}`,
        category,
        code,
        message,
        diagnostics,
      );
    return;
  }
  if (actual !== expected)
    add(diagnostics, "error", category, code, source, subject, message);
}

function compareNormalizedRecord(
  actual: unknown,
  expected: unknown,
  source: string,
  subject: string,
  diagnostics: Diagnostic[],
): void {
  if (object(expected)) {
    if (!object(actual)) {
      add(
        diagnostics,
        "error",
        "docs",
        "DOCS_CLI_OPTION_POLICY_MISMATCH",
        source,
        subject,
        "Normalized documentation option policy differs from the CLI schema-v5 contract.",
      );
      return;
    }
    for (const key of [
      ...new Set([...Object.keys(actual), ...Object.keys(expected)]),
    ].sort())
      compareNormalizedRecord(
        actual[key],
        expected[key],
        source,
        subject ? `${subject}.${key}` : key,
        diagnostics,
      );
    return;
  }
  if (JSON.stringify(actual) !== JSON.stringify(expected))
    add(
      diagnostics,
      "error",
      "docs",
      "DOCS_CLI_OPTION_POLICY_MISMATCH",
      source,
      subject,
      "Normalized documentation option policy differs from the CLI schema-v5 contract.",
    );
}

const normalizedDocsCliOptions: Obj = {
  schemaVersion: 1,
  aliases: {
    verbose: "-v",
    force: "-f",
    json: "-j",
    only: "-o",
    group: "-g",
    dryRun: "-n",
    exceptions: { addName: "-n", execJobs: "long-only" },
    npmWrapper: {
      installJson: "-j",
      updateJson: "-j",
      updateDryRun: "-n",
    },
  },
  switch: {
    canonical: {
      launch: "--launch",
      ignoreConfiguredLauncher: "--ignore-configured-launcher",
    },
    compatibility: {
      "--no-cd": "--launch",
      "--no-default-launch": "--ignore-configured-launcher",
    },
    compatibilityBoundary: {
      supportedThrough: "1.x",
      earliestRemovalMajor: 2,
      requiresApprovedBreakingChange: true,
    },
    persisted: false,
    combinedCanonicalIntent: "generic-automatic-launch",
    launchPreservesConfiguredLauncher: true,
    ignoreConfiguredLauncher: {
      preserveBehaviorModes: ["auto", "cd", "launch"],
      namedLaunchModesBecomeAutomatic: ["sesh", "herdr"],
    },
    cdConflicts: ["launch", "tab", "explicit-launcher"],
    explicitLauncherWithTabAuthoritative: true,
    jsonGuardPrecedenceUnchanged: true,
    noFallbackUnchanged: true,
  },
  selectors: {
    options: ["--only", "--group"],
    inputForms: ["repeated", "comma-separated", "mixed"],
    flatten: "encounter-order",
    trim: true,
    blankSegments: "ignored-beside-values",
    deduplicate: "first-occurrence",
    omitted: "default-selection",
    suppliedEmpty: "error",
    unknown: "error",
    combination: "intersection",
    emptyIntersection: "error",
    validationPrecedence: "before-repository-work",
  },
  status: {
    only: "configured-child-selection",
    standaloneSelectors: "unsupported",
    parentReporting: "unchanged",
    jsonSelection: {
      repositories: "selected-children-plus-parent",
      effectiveFilters: "normalized-only-and-groups",
      agree: true,
    },
  },
  handoff: {
    defaultFormat: "markdown",
    preferredMarkdownOption: "omitted",
    compatibilityOption: "--markdown",
    compatibilityBoundary: {
      supportedThrough: "1.x",
      earliestRemovalMajor: 2,
      requiresApprovedBreakingChange: true,
    },
  },
  update: {
    conflict: ["--check", "--dry-run"],
    dryRunAlias: "-n",
    precedence: "before-lookup-or-mutation",
    humanJsonParity: true,
    bareJson: "inspection-only",
    jsonApply: "unsupported",
    jsonPrompt: false,
    jsonMutation: false,
  },
  nativeCompletion: "out-of-scope",
};

function validateSchemaV5Commands(
  commands: Map<string, Obj>,
  diagnostics: Diagnostic[],
): void {
  for (const [commandPath, expectedLongs] of expectedSchemaV5OptionSurface) {
    const command = commands.get(commandPath);
    if (!command) {
      add(
        diagnostics,
        "error",
        "schema",
        "CLI_OPTION_SURFACE_MISMATCH",
        paths.contract,
        commandPath,
        "Schema-v5 command surface is missing an audited command path.",
      );
      continue;
    }
    const actualLongs = new Set(optionMap(command).keys());
    for (const long of expectedLongs)
      if (!actualLongs.has(long))
        add(
          diagnostics,
          "error",
          "schema",
          "CLI_OPTION_SURFACE_MISMATCH",
          paths.contract,
          `${commandPath}.${long}`,
          "Schema-v5 option surface is missing an audited command-local registration.",
        );
    for (const long of actualLongs)
      if (!expectedLongs.includes(long))
        add(
          diagnostics,
          "error",
          "schema",
          "CLI_OPTION_SURFACE_MISMATCH",
          paths.contract,
          `${commandPath}.${long}`,
          "Schema-v5 option surface contains an unaudited command-local registration.",
        );
  }
  for (const commandPath of commands.keys())
    if (!expectedSchemaV5OptionSurface.has(commandPath))
      add(
        diagnostics,
        "error",
        "schema",
        "CLI_OPTION_SURFACE_MISMATCH",
        paths.contract,
        commandPath,
        "Schema-v5 command surface contains an unaudited command path.",
      );

  for (const [commandPath, command] of commands) {
    const rawOptions = Array.isArray(command.options) ? command.options : [];
    rawOptions.forEach((option, index) => {
      if (!object(option))
        add(
          diagnostics,
          "error",
          "schema",
          "CLI_OPTION_SCHEMA_INVALID",
          paths.contract,
          `${commandPath}.options[${index}]`,
          "Schema-v5 option arrays may contain only complete option records.",
        );
    });
    const options = optionMap(command);
    const semantics = object(command.semantics) ? command.semantics : {};
    const legacyPolicies = object(semantics.optionPolicies)
      ? semantics.optionPolicies
      : {};
    const aliases = new Map<string, string[]>();
    for (const option of commandOptions(command)) {
      const long = optionLong(option);
      if (!long) {
        add(
          diagnostics,
          "error",
          "schema",
          "CLI_OPTION_SCHEMA_INVALID",
          paths.contract,
          `${commandPath}.${String(option.flags)}`,
          "Schema-v5 options require an explicit long name.",
        );
        continue;
      }
      const policy = object(option.semanticPolicy)
        ? option.semanticPolicy
        : undefined;
      const flags = text(option.flags) ? option.flags : "";
      const flagLongs = flags.match(/--[a-z0-9-]+/g) ?? [];
      const flagShorts =
        flags
          .match(/(?:^|[\s,])-[A-Za-z0-9](?=[\s,]|$)/g)
          ?.map((value) => value.trim().replace(/^,/, "").trim()) ?? [];
      const expectedShorts = text(option.short) ? [option.short] : [];
      const structuralValid =
        typeof option.flags === "string" &&
        sameStrings(flagLongs, [long]) &&
        sameStrings(flagShorts, expectedShorts) &&
        typeof option.description === "string" &&
        typeof option.hidden === "boolean" &&
        typeof option.deprecated === "boolean" &&
        typeof option.required === "boolean" &&
        typeof option.optional === "boolean" &&
        typeof option.variadic === "boolean" &&
        ["boolean", "required", "optional", "variadic"].includes(
          String(option.valueShape),
        ) &&
        ["structural", "command"].includes(
          String(option.semanticPolicyOwner),
        ) &&
        (option.short === null ||
          /^-[A-Za-z0-9]$/.test(String(option.short))) &&
        ((option.semanticPolicyOwner === "command" &&
          (policy?.ownership === "command" || object(legacyPolicies[long]))) ||
          (option.semanticPolicyOwner === "structural" &&
            policy === undefined));
      if (!structuralValid)
        add(
          diagnostics,
          "error",
          "schema",
          "CLI_OPTION_SCHEMA_INVALID",
          paths.contract,
          `${commandPath}.${long}`,
          "Schema-v5 option metadata and semantic-policy ownership must be complete and coherent.",
        );
      if (text(option.short)) {
        const owners = aliases.get(option.short) ?? [];
        owners.push(long);
        aliases.set(option.short, owners);
      }
      const expectedAlias =
        commonAliases.get(long) ??
        commandQualifiedAliases.get(`${commandPath}.${long}`);
      if (
        (expectedAlias !== undefined && option.short !== expectedAlias) ||
        (commandPath === "exec" && long === "--jobs" && option.short !== null)
      )
        add(
          diagnostics,
          "error",
          "schema",
          "CLI_ALIAS_MISMATCH",
          paths.contract,
          `${commandPath}.${long}`,
          `Expected command-local alias ${expectedAlias ?? "long-only"}.`,
        );
      if (text(option.short) && expectedAlias === undefined)
        add(
          diagnostics,
          "error",
          "schema",
          "CLI_ALIAS_UNAPPROVED",
          paths.contract,
          `${commandPath}.${long}`,
          "Specialized options may not claim an unaudited short alias.",
        );

      if (policy) {
        const conflicts = strings(policy.conflicts) ?? [];
        const implications = strings(policy.implies) ?? [];
        for (const reference of [
          ...conflicts,
          ...implications.filter((value) => value.startsWith("--")),
        ])
          if (!options.has(reference))
            add(
              diagnostics,
              "error",
              "schema",
              "CLI_POLICY_REFERENCE_INVALID",
              paths.contract,
              `${commandPath}.${long}`,
              `Semantic policy references unregistered option ${reference}.`,
            );
        validateCompatibility(commandPath, option, options, diagnostics);
      }

      if (["--only", "--group"].includes(long)) {
        if (!policy || !object(policy.selector))
          add(
            diagnostics,
            "error",
            "schema",
            "CLI_SELECTOR_POLICY_MISSING",
            paths.contract,
            `${commandPath}.${long}`,
            "Every selector registration requires a complete typed policy.",
          );
        else {
          const expectedSelector: Obj = {
            ...selectorPolicyBase,
            combination: {
              empty: "error",
              mode: "intersection",
              with: long === "--only" ? "--group" : "--only",
            },
            kind: long === "--only" ? "repository" : "group",
            standalone: ["create", "status"].includes(commandPath)
              ? "unsupported"
              : "configured-only",
          };
          if (
            policy.persisted !== false ||
            !samePolicyValue(policy.selector, expectedSelector) ||
            !options.has(long === "--only" ? "--group" : "--only")
          )
            add(
              diagnostics,
              "error",
              "schema",
              "CLI_SELECTOR_POLICY_INVALID",
              paths.contract,
              `${commandPath}.${long}`,
              "Selector policy must fail closed with normalized repeated/comma input and a reciprocal intersection counterpart.",
            );
        }
      }
    }
    for (const [short, owners] of aliases)
      if (owners.length > 1)
        add(
          diagnostics,
          "error",
          "schema",
          "CLI_ALIAS_COLLISION",
          paths.contract,
          `${commandPath}.${short}`,
          `Short alias is shared by ${owners.join(", ")}.`,
        );

    if (commandPath === "switch")
      for (const [long, option] of options) {
        const expectedPolicy = switchPolicyExpected(long);
        if (
          expectedPolicy &&
          !samePolicyValue(option.semanticPolicy, expectedPolicy)
        )
          add(
            diagnostics,
            "error",
            "schema",
            "CLI_SWITCH_POLICY_INVALID",
            paths.contract,
            `${commandPath}.${long}`,
            "Switch policy must preserve canonical compatibility, conflicts, precedence, and launcher effects.",
          );
      }
    if (commandPath === "handoff") {
      const markdown = options.get("--markdown");
      const expectedPolicy: Obj = {
        compatibility: {
          alternatives: ["--markdown"],
          canonical: { behavior: "markdown", omittedDefault: true },
          deprecatedAlternatives: true,
          removal: compatibilityBoundary,
        },
        ownership: "command",
        persisted: false,
        role: "redundant-compatibility",
      };
      if (
        !markdown ||
        !samePolicyValue(markdown.semanticPolicy, expectedPolicy)
      )
        add(
          diagnostics,
          "error",
          "schema",
          "CLI_COMPATIBILITY_INVALID",
          paths.contract,
          "handoff.--markdown",
          "Handoff Markdown must be a hidden deprecated redundant compatibility spelling for the omitted default.",
        );
    }
    if (commandPath === "update") {
      for (const [long, target] of [
        ["--check", "--dry-run"],
        ["--dry-run", "--check"],
      ] as const) {
        const option = options.get(long);
        const expectedPolicy: Obj = {
          conflicts: [target],
          inspection: { executionPaths: ["human", "json"] },
          ownership: "command",
        };
        if (!option || !samePolicyValue(option.semanticPolicy, expectedPolicy))
          add(
            diagnostics,
            "error",
            "schema",
            "CLI_UPDATE_POLICY_INVALID",
            paths.contract,
            `update.${long}`,
            "Update inspection modes must conflict reciprocally for human and JSON paths before lookup or mutation.",
          );
      }
      const json = options.get("--json");
      const expectedJsonPolicy: Obj = {
        jsonExecution: {
          apply: "unsupported",
          bare: "inspection-only",
          mutation: false,
          prompt: false,
        },
        ownership: "command",
      };
      if (!json || !samePolicyValue(json.semanticPolicy, expectedJsonPolicy))
        add(
          diagnostics,
          "error",
          "schema",
          "CLI_UPDATE_POLICY_INVALID",
          paths.contract,
          "update.--json",
          "Bare update JSON must be inspection-only without prompt or mutation, while JSON apply remains unsupported.",
        );
    }
  }
}

function validateSchemaV6Completion(
  contract: Obj,
  commands: Map<string, Obj>,
  diagnostics: Diagnostic[],
): void {
  const root = object(contract.root) ? contract.root : {};
  const rootOptions = optionMap(root);
  const expectedRootOptions: Record<string, Obj> = {
    "--help": {
      conflicts: [],
      deprecated: false,
      description: "display help for command",
      flags: "-h, --help",
      hidden: false,
      long: "--help",
      optional: false,
      repeatable: false,
      required: false,
      semanticPolicyOwner: "structural",
      short: "-h",
      valueShape: "boolean",
      variadic: false,
    },
    "--version": {
      conflicts: [],
      deprecated: false,
      description: "output the version number",
      flags: "-V, --version",
      hidden: false,
      long: "--version",
      optional: false,
      repeatable: false,
      required: false,
      semanticPolicyOwner: "structural",
      short: "-V",
      valueShape: "boolean",
      variadic: false,
    },
  };
  for (const [long, expected] of Object.entries(expectedRootOptions))
    if (!samePolicyValue(rootOptions.get(long), expected))
      add(
        diagnostics,
        "error",
        "schema",
        "CLI_COMPLETION_ROOT_INVALID",
        paths.contract,
        `root.${long}`,
        "Schema-v6 root metadata must expose the exact Commander help and version options.",
      );
  if (
    root.name !== "arashi" ||
    !text(root.description) ||
    !sameStrings(strings(root.aliases), []) ||
    rootOptions.size !== 2
  )
    add(
      diagnostics,
      "error",
      "schema",
      "CLI_COMPLETION_ROOT_INVALID",
      paths.contract,
      "root",
      "Schema-v6 root completion metadata must be exact and contain no unaudited options.",
    );

  const seenCandidates = new Set<string>();
  for (const [commandPath, command] of commands) {
    const hiddenCommand = commandPath === "completion __query";
    if (command.hidden !== hiddenCommand)
      add(
        diagnostics,
        "error",
        "schema",
        "CLI_COMPLETION_HIDDEN_INVALID",
        paths.contract,
        commandPath,
        "Only the internal completion query may be hidden from interactive suggestions.",
      );
    const arguments_ = Array.isArray(command.arguments)
      ? command.arguments.filter(object)
      : [];
    for (const argument of arguments_) {
      const subject = `${commandPath}.${String(argument.name)}`;
      const expected = completionCandidates.get(subject);
      if (expected) seenCandidates.add(subject);
      const actualChoices = strings(argument.choices);
      const expectedChoices = strings(expected?.choices);
      if (
        argument.hidden !== false ||
        argument.candidateKind !== expected?.candidateKind ||
        (expectedChoices
          ? !sameStrings(actualChoices, expectedChoices)
          : actualChoices !== undefined)
      )
        add(
          diagnostics,
          "error",
          "schema",
          "CLI_COMPLETION_POLICY_INVALID",
          paths.contract,
          subject,
          "Schema-v6 positional candidate ownership and finite choices must match the audited completion surface exactly.",
        );
    }
    for (const option of commandOptions(command)) {
      const long = optionLong(option) ?? String(option.flags);
      const subject = `${commandPath}.${long}`;
      const expected = completionCandidates.get(subject);
      if (expected) seenCandidates.add(subject);
      const actualChoices = strings(option.choices);
      const expectedChoices = strings(expected?.choices);
      const policy = object(option.semanticPolicy) ? option.semanticPolicy : {};
      const canonicalCommandPolicy =
        commandPath === "create" || commandPath === "switch"
          ? canonicalOptionPolicies[commandPath][long]
          : undefined;
      const expectedConflicts =
        strings(canonicalCommandPolicy?.conflicts) ??
        strings(policy.conflicts) ??
        strings(option.conflicts) ??
        [];
      if (
        option.hidden !== completionHiddenOptions.has(subject) ||
        option.repeatable !== completionRepeatableOptions.has(subject) ||
        option.candidateKind !== expected?.candidateKind ||
        (expectedChoices
          ? !sameStrings(actualChoices, expectedChoices)
          : actualChoices !== undefined) ||
        !sameStrings(strings(option.conflicts), expectedConflicts)
      )
        add(
          diagnostics,
          "error",
          "schema",
          "CLI_COMPLETION_POLICY_INVALID",
          paths.contract,
          subject,
          "Schema-v6 option visibility, repeatability, candidate ownership, choices, and declared conflicts must match the audited command policy exactly.",
        );
    }
  }
  for (const subject of completionCandidates.keys())
    if (!seenCandidates.has(subject))
      add(
        diagnostics,
        "error",
        "schema",
        "CLI_COMPLETION_POLICY_INVALID",
        paths.contract,
        subject,
        "An audited schema-v6 completion candidate owner is missing.",
      );

  const companionExpectations: Array<[string, string, string]> = [
    ["completion", "docs", "required"],
    ["completion", "skills", "required"],
    ["completion", "vscode", "excluded"],
    ["completion __query", "docs", "excluded"],
    ["completion __query", "skills", "excluded"],
    ["completion __query", "vscode", "excluded"],
  ];
  for (const [commandPath, surface, expectation] of companionExpectations) {
    const command = commands.get(commandPath);
    const semantics =
      command && object(command.semantics) ? command.semantics : {};
    const companion = object(semantics[surface]) ? semantics[surface] : {};
    if (
      companion.expectation !== expectation ||
      (expectation === "excluded" && !text(companion.reason))
    )
      add(
        diagnostics,
        "error",
        surface === "docs"
          ? "docs"
          : surface === "skills"
            ? "skills"
            : "vscode",
        "CLI_COMPLETION_COMPANION_INVALID",
        paths.contract,
        `${commandPath}.${surface}`,
        "Completion commands must preserve their exact required or reasoned-exclusion companion semantics.",
      );
  }
}

async function json(
  root: string,
  path: string,
  diagnostics: Diagnostic[],
): Promise<Obj | undefined> {
  try {
    const value: unknown = JSON.parse(await readFile(join(root, path), "utf8"));
    if (!object(value)) throw new Error("root must be an object");
    return value;
  } catch (error) {
    diagnostics.push({
      severity: "error",
      category: "schema",
      code: "SCHEMA_INVALID",
      source: path,
      subject: path,
      message: `Cannot parse JSON object: ${error instanceof Error ? error.message : String(error)}`,
    });
  }
}
async function jsonStringArray(
  root: string,
  path: string,
  diagnostics: Diagnostic[],
): Promise<string[] | undefined> {
  try {
    const value: unknown = JSON.parse(await readFile(join(root, path), "utf8"));
    if (!Array.isArray(value) || value.some((entry) => !text(entry)))
      throw new Error("root must be an array of strings");
    return value;
  } catch (error) {
    diagnostics.push({
      severity: "error",
      category: "schema",
      code: "SCHEMA_INVALID",
      source: path,
      subject: path,
      message: `Cannot parse JSON string array: ${error instanceof Error ? error.message : String(error)}`,
    });
  }
}
function version(
  value: Obj | undefined,
  source: string,
  diagnostics: Diagnostic[],
  expected = 1,
) {
  if (value && value.schemaVersion !== expected)
    diagnostics.push({
      severity: "error",
      category: "schema",
      code: "SCHEMA_VERSION_UNSUPPORTED",
      source,
      subject: String(value.schemaVersion),
      message: `Expected schemaVersion ${expected}.`,
    });
}
function reason(
  entry: Obj,
  source: string,
  subject: string,
  required: boolean,
  diagnostics: Diagnostic[],
) {
  if (required && !text(entry.reason))
    diagnostics.push({
      severity: "error",
      category: "schema",
      code: "POLICY_REASON_REQUIRED",
      source,
      subject,
      message: "This classification requires a non-empty reason.",
    });
}
function add(
  diagnostics: Diagnostic[],
  severity: Severity,
  category: Diagnostic["category"],
  code: string,
  source: string,
  subject: string,
  message: string,
) {
  diagnostics.push({ severity, category, code, source, subject, message });
}
function checkSwitchConfigContract(
  value: Obj | undefined,
  source: string,
  diagnostics: Diagnostic[],
) {
  if (!value) return;
  version(value, source, diagnostics);
  const expectations: Array<[string, boolean]> = [
    ["canonicalField", value?.canonicalField === "defaults.switch.mode"],
    ["modes", sameStrings(strings(value?.modes), switchModes)],
    ["absentMode", value?.absentMode === "launch"],
    [
      "autoOrder",
      JSON.stringify(strings(value?.autoOrder)) ===
        JSON.stringify(switchAutoOrder),
    ],
    [
      "legacyFields",
      sameStrings(strings(value?.legacyFields), switchLegacyFields),
    ],
    ["createDefaultsUnchanged", !("createDefaultsUnchanged" in value)],
  ];
  for (const [subject, matches] of expectations)
    if (!matches)
      add(
        diagnostics,
        "error",
        source.includes("arashi-docs") ? "docs" : "skills",
        "SWITCH_CONFIG_MISMATCH",
        source,
        subject,
        "Switch configuration semantics must match the canonical unified-mode contract.",
      );
}
function checkKittyWorktreeSessionContract(
  value: Obj | undefined,
  source: string,
  category: "schema" | "docs" | "skills",
  diagnostics: Diagnostic[],
) {
  if (!value) return;

  const visit = (actual: unknown, expected: unknown, subject: string): void => {
    if (object(expected)) {
      if (!object(actual)) {
        add(
          diagnostics,
          "error",
          category,
          "KITTY_WORKTREE_SESSION_MISMATCH",
          source,
          subject,
          "Managed Kitty worktree-session semantics must match the canonical CLI-owned contract.",
        );
        return;
      }
      const keys = new Set([...Object.keys(expected), ...Object.keys(actual)]);
      for (const key of [...keys].sort())
        visit(
          actual[key],
          expected[key],
          subject.length > 0 ? `${subject}.${key}` : key,
        );
      return;
    }

    if (JSON.stringify(actual) !== JSON.stringify(expected))
      add(
        diagnostics,
        "error",
        category,
        "KITTY_WORKTREE_SESSION_MISMATCH",
        source,
        subject,
        "Managed Kitty worktree-session semantics must match the canonical CLI-owned contract.",
      );
  };

  visit(value, kittyWorktreeSessionContract, "");
}

async function checkKittyGuidance(
  root: string,
  diagnostics: Diagnostic[],
): Promise<void> {
  for (const requirement of kittyGuidanceRequirements) {
    let content: string;
    try {
      content = await readFile(join(root, requirement.source), "utf8");
    } catch {
      add(
        diagnostics,
        "error",
        requirement.category,
        "KITTY_GUIDANCE_MISMATCH",
        requirement.source,
        "file",
        "Managed Kitty human guidance is missing.",
      );
      continue;
    }
    for (const phrase of requirement.phrases) {
      if (content.includes(phrase)) continue;
      add(
        diagnostics,
        "error",
        requirement.category,
        "KITTY_GUIDANCE_MISMATCH",
        requirement.source,
        phrase,
        "Managed Kitty human guidance must match the normalized cross-repository contract.",
      );
    }
  }
}

function checkAddMaterializationContract(
  command: Obj | undefined,
  diagnostics: Diagnostic[],
): void {
  const semantics =
    command && object(command.semantics) ? command.semantics : {};
  if (
    !samePolicyValue(semantics.addMaterialization, addMaterializationContract)
  )
    add(
      diagnostics,
      "error",
      "schema",
      "ADD_MATERIALIZATION_MISMATCH",
      paths.contract,
      "add.addMaterialization",
      "Linked-add materialization and result-role semantics must match the CLI-owned contract.",
    );
}

async function checkAddMaterializationGuidance(
  root: string,
  diagnostics: Diagnostic[],
): Promise<void> {
  for (const requirement of addMaterializationGuidanceRequirements) {
    let content: string;
    try {
      content = await readFile(join(root, requirement.source), "utf8");
    } catch {
      add(
        diagnostics,
        "error",
        requirement.category,
        "ADD_MATERIALIZATION_GUIDANCE_MISMATCH",
        requirement.source,
        "file",
        "Linked-add human guidance is missing.",
      );
      continue;
    }
    for (const phrase of requirement.phrases) {
      if (content.includes(phrase)) continue;
      add(
        diagnostics,
        "error",
        requirement.category,
        "ADD_MATERIALIZATION_GUIDANCE_MISMATCH",
        requirement.source,
        phrase,
        "Linked-add human guidance must match the normalized cross-repository contract.",
      );
    }
  }
}

function checkSshAliasCliContract(
  command: Obj | undefined,
  diagnostics: Diagnostic[],
): void {
  const argumentsList =
    command && Array.isArray(command.arguments)
      ? command.arguments.filter(object)
      : [];
  const descriptions = argumentsList
    .map((argument) => argument.description)
    .filter(text)
    .join("\n");
  for (const syntax of ["[user@]host:path", "ssh://[user@]host/path"])
    if (!descriptions.includes(syntax))
      add(
        diagnostics,
        "error",
        "schema",
        "SSH_ALIAS_CLI_CONTRACT_MISMATCH",
        paths.contract,
        syntax,
        "The add positional argument must expose optional-user SCP and ssh:// alias syntax in the generated CLI contract.",
      );
}

async function checkSshAliasDirectGuidance(
  root: string,
  diagnostics: Diagnostic[],
): Promise<void> {
  const requirements: Array<{
    category: "docs" | "skills";
    phrases: string[];
    source: string;
  }> = [
    {
      category: "docs",
      source: "repos/arashi-docs/docs/commands/add.md",
      phrases: ["`[user@]host:path`", "`ssh://[user@]host/path`"],
    },
    {
      category: "skills",
      source:
        "repos/arashi-skills/skills/arashi/references/commands/workspace.md",
      phrases: [
        "SSH Remote Aliases for Add and Clone",
        "aw add work-github:acme/api.git",
        "preserves every configured SSH URL byte-for-byte",
        "machine-global Git `url.<base>.insteadOf` rule",
        'git config --global url."git@work-github:".insteadOf git@github.com:',
      ],
    },
  ];
  for (const requirement of requirements) {
    let content = "";
    try {
      content = await readFile(join(root, requirement.source), "utf8");
    } catch {
      // Report the missing file through the same semantic diagnostic below.
    }
    for (const phrase of requirement.phrases)
      if (!content.includes(phrase))
        add(
          diagnostics,
          "error",
          requirement.category,
          "SSH_ALIAS_GUIDANCE_MISMATCH",
          requirement.source,
          phrase,
          "SSH alias guidance must preserve the optional-user syntax, opaque-host ownership, exact URL policy, and machine-local portability contract.",
        );
  }
}

type CompanionKind = "docs" | "skills";
type DefaultDisposition =
  | "window"
  | "managed-independent-session"
  | "unrecognized";
type TabClassification = "true-tab" | "managed-equivalent" | "unsupported";
type LauncherProjection = {
  defaultDisposition: DefaultDisposition;
  tabClassification: TabClassification;
};
type TabProjection = {
  commands: Record<
    "create" | "switch",
    {
      conflicts: string[];
      exit: number;
      guard: string;
      implies: string[];
      mode: string;
      overrides: string[];
    }
  >;
  cliOnly: boolean;
  launchers: Map<string, LauncherProjection>;
  noFallback: boolean;
};

const launcherSemantics = new Map<string, LauncherProjection>([
  [
    "windows-terminal-with-session",
    { defaultDisposition: "window", tabClassification: "true-tab" },
  ],
  [
    "git-bash",
    { defaultDisposition: "window", tabClassification: "unsupported" },
  ],
  [
    "wezterm-with-pane",
    { defaultDisposition: "window", tabClassification: "true-tab" },
  ],
  [
    "managed-kitty",
    {
      defaultDisposition: "managed-independent-session",
      tabClassification: "managed-equivalent",
    },
  ],
  [
    "unmanaged-kitty",
    { defaultDisposition: "window", tabClassification: "unsupported" },
  ],
  [
    "tmux",
    {
      defaultDisposition: "managed-independent-session",
      tabClassification: "managed-equivalent",
    },
  ],
  [
    "sesh",
    {
      defaultDisposition: "managed-independent-session",
      tabClassification: "managed-equivalent",
    },
  ],
  [
    "cmux",
    {
      defaultDisposition: "managed-independent-session",
      tabClassification: "managed-equivalent",
    },
  ],
  [
    "herdr-with-workspace",
    {
      defaultDisposition: "managed-independent-session",
      tabClassification: "true-tab",
    },
  ],
  [
    "available-ide",
    { defaultDisposition: "window", tabClassification: "unsupported" },
  ],
  [
    "linux-ghostty",
    { defaultDisposition: "window", tabClassification: "unsupported" },
  ],
  [
    "macos-ghostty-before-1.3",
    { defaultDisposition: "window", tabClassification: "unsupported" },
  ],
  [
    "macos-ghostty-1.3+",
    { defaultDisposition: "window", tabClassification: "true-tab" },
  ],
  [
    "macos-terminal",
    { defaultDisposition: "window", tabClassification: "unsupported" },
  ],
  [
    "macos-iterm2",
    { defaultDisposition: "window", tabClassification: "true-tab" },
  ],
  [
    "generic",
    { defaultDisposition: "window", tabClassification: "unsupported" },
  ],
]);

const companionLauncherIds = (label: string, kind: CompanionKind): string[] => {
  const normalized = label.toLowerCase();
  if (normalized.includes("automatically detected ide")) return [];
  if (normalized.includes("windows terminal"))
    return ["windows-terminal-with-session"];
  if (normalized.includes("wezterm")) return ["wezterm-with-pane"];
  if (normalized.includes("unmanaged kitty")) return ["unmanaged-kitty"];
  if (normalized.includes("managed kitty")) return ["managed-kitty"];
  if (normalized.includes("tmux") && normalized.includes("sesh"))
    return ["tmux", "sesh"];
  if (normalized === "cmux") return ["cmux"];
  if (normalized.includes("herdr")) return ["herdr-with-workspace"];
  if (
    normalized.includes("vscode") ||
    normalized.includes("vs code") ||
    normalized.includes("ide workspace")
  )
    return ["available-ide"];
  if (normalized.includes("linux ghostty")) return ["linux-ghostty"];
  if (normalized.includes("ghostty older than"))
    return ["macos-ghostty-before-1.3"];
  if (normalized.includes("macos ghostty 1.3")) return ["macos-ghostty-1.3+"];
  if (normalized.includes("terminal.app")) return ["macos-terminal"];
  if (normalized.includes("iterm2")) return ["macos-iterm2"];
  if (normalized.includes("git bash") || normalized.includes("mintty"))
    return ["git-bash"];
  if (normalized.includes("generic")) return ["generic"];
  return [`unrecognized:${label}`];
};

const markdownTable = (content: string): string[][] => {
  const lines = content.split(/\r?\n/);
  const start = lines.findIndex(
    (line) =>
      /^\s*\|\s*launcher(?:\s+or)?(?:\/|\s|`)/i.test(line) &&
      /explicit.*tab|`--tab` request/i.test(line),
  );
  if (start < 0) return [];
  const rows: string[][] = [];
  for (const line of lines.slice(start + 2)) {
    if (!/^\s*\|/.test(line)) break;
    rows.push(
      line
        .trim()
        .slice(1, -1)
        .split("|")
        .map((cell) => cell.trim()),
    );
  }
  return rows;
};

const managedLauncherIds = new Set([
  "cmux",
  "herdr-with-workspace",
  "managed-kitty",
  "sesh",
  "tmux",
]);

const defaultDisposition = (
  cell: string,
  launcher: string,
): DefaultDisposition => {
  if (managedLauncherIds.has(launcher))
    return /(?:workspace|managed (?:independent )?session|managed session|tmux window|tmux new-window|sesh-managed session|sesh connect|worktree session|exact managed session|herdr worktree open)/i.test(
      cell,
    )
      ? "managed-independent-session"
      : "unrecognized";
  return /(?:\bnew(?:[- ][a-z]+)*[- ]window\b|-w new|independent window|new supported default path|existing editor behavior|--new-window|independent-process window|new window transaction|new terminal\/platform window|platform-specific independent process\/window|continue terminal resolution)/i.test(
    cell,
  )
    ? "window"
    : "unrecognized";
};

const tabClassification = (cell: string): TabClassification => {
  if (/^(?:`)?(?:unsupported\b|TAB_DISPOSITION_UNSUPPORTED)/i.test(cell))
    return "unsupported";
  if (
    /(?:managed tab|managed primitive|managed Kitty|managed tab equivalent|workspace\s*\/\s*vertical[- ]tab|same workspace|tmux\/sesh managed primitive)/i.test(
      cell,
    )
  )
    return "managed-equivalent";
  return "true-tab";
};

const companionProjection = (
  content: string,
  kind: CompanionKind,
): TabProjection | undefined => {
  let scoped = content;
  if (kind === "skills") {
    const start = content.indexOf("### Launch disposition (`--tab`)");
    if (start < 0) return undefined;
    const end = content.indexOf("\n## ", start);
    scoped = content.slice(start, end < 0 ? undefined : end);
  }
  const rows = markdownTable(scoped);
  if (rows.length === 0) return undefined;
  const launchers = new Map<string, LauncherProjection>();
  for (const row of rows) {
    if (row.length < 3) return undefined;
    for (const id of companionLauncherIds(row[0], kind)) {
      const projection = {
        defaultDisposition: defaultDisposition(row[1], id),
        tabClassification: tabClassification(row[2]),
      };
      if (launchers.has(id) && !samePolicyValue(launchers.get(id), projection))
        return undefined;
      launchers.set(id, projection);
    }
  }

  const commands = {} as TabProjection["commands"];
  for (const command of ["create", "switch"] as const) {
    const commandPattern =
      kind === "docs"
        ? new RegExp(
            String.raw`[^\n]*${command} --json --tab[^\n]*existing \x60([^\x60]+)\x60 mode and exit status \x60(\d+)\x60`,
          )
        : new RegExp(
            String.raw`[^\n]*${command} --tab --json[^\n]*\x60details\.mode: "([^"]+)"\x60[^\n]*exits \x60(\d+)\x60`,
          );
    const match = scoped.match(commandPattern);
    if (!match) return undefined;
    commands[command] = {
      conflicts:
        command === "switch" &&
        /conflicts only with explicit `--cd`/i.test(scoped)
          ? ["--cd"]
          : [],
      exit: Number(match[2]),
      guard:
        kind === "docs"
          ? /guards win before launcher conflicts or runtime-context validation/i.test(
              scoped,
            )
            ? "before-option-validation"
            : "missing"
          : /before option or context validation/i.test(scoped)
            ? "before-option-validation"
            : "missing",
      implies:
        command === "create" &&
        /(?:create tab|`create --tab`) implies (?:both )?launch and switch/i.test(
          scoped,
        )
          ? ["launch", "switch"]
          : command === "switch" &&
              /(?:`switch --tab`[^.\n]*expresses explicit launch intent|explicit tab intent overrides configured|`switch --tab` implies launch)/i.test(
                scoped,
              )
            ? ["launch"]
            : [],
      mode: match[1],
      overrides:
        command === "create"
          ? [
              ...(/(?:wins over|overrides)[^.\n]*`--no-launch`[^.\n]*`--no-switch`/i.test(
                scoped,
              )
                ? ["--no-launch", "--no-switch"]
                : []),
              ...(/(?:For (?:`create`|create)|`create --tab`)[^.\n]*bypasses configured(?: generic or editor-scoped)? launch(?:er)? defaults/i.test(
                scoped,
              )
                ? ["configured-launcher"]
                : []),
            ]
          : [
              ...(/overrides configured or contextual parent-shell `cd`|overrides configured parent-shell cd/i.test(
                scoped,
              )
                ? ["configured-cd", "contextual-cd"]
                : []),
              ...(/(?:For `switch`|`switch --tab`(?: request)? expresses)[^\n]*bypasses configured (?:launcher|behavior and named-launcher) defaults/i.test(
                scoped,
              )
                ? ["configured-launcher"]
                : []),
            ].sort(),
    };
  }

  return {
    commands,
    cliOnly:
      /(?:CLI-only, one-invocation (?:request|launch disposition)|one-shot CLI-only launch disposition)/i.test(
        scoped,
      ) &&
      /(?:does not create a persistent preference|never persisted)/i.test(
        scoped,
      ),
    launchers,
    noFallback:
      kind === "docs"
        ? /Unsupported tab disposition never opens a window or falls through to another launcher\./i.test(
            scoped,
          )
        : /never silently falls back/i.test(scoped),
  };
};

const canonicalTabProjection = (
  commands: Map<string, Obj>,
): TabProjection | undefined => {
  const projectedCommands = {} as TabProjection["commands"];
  let launcherPolicy: Obj | undefined;
  for (const command of ["create", "switch"] as const) {
    const commandEntry = commands.get(command);
    const semantics =
      commandEntry && object(commandEntry.semantics)
        ? commandEntry.semantics
        : {};
    const policies = object(semantics.optionPolicies)
      ? semantics.optionPolicies
      : {};
    const tab = object(policies["--tab"]) ? policies["--tab"] : {};
    const jsonPolicy = object(tab.json) ? tab.json : {};
    if (
      !text(jsonPolicy.guardPrecedence) ||
      !text(jsonPolicy.mode) ||
      !object(tab.launcherSupport)
    )
      return undefined;
    projectedCommands[command] = {
      conflicts: strings(tab.conflicts) ?? [],
      exit: command === "switch" ? 2 : 1,
      guard: jsonPolicy.guardPrecedence,
      implies: strings(tab.implies) ?? [],
      mode: jsonPolicy.mode,
      overrides: strings(tab.overrides) ?? [],
    };
    launcherPolicy ??= tab.launcherSupport;
  }
  const supported = strings(launcherPolicy?.supported);
  const unsupported = strings(launcherPolicy?.unsupported);
  if (!supported || !unsupported) return undefined;
  const launchers = new Map<string, LauncherProjection>();
  for (const launcher of [...supported, ...unsupported]) {
    const semantics = launcherSemantics.get(launcher);
    if (!semantics) return undefined;
    if (
      (supported.includes(launcher) &&
        semantics.tabClassification === "unsupported") ||
      (unsupported.includes(launcher) &&
        semantics.tabClassification !== "unsupported")
    )
      return undefined;
    launchers.set(launcher, semantics);
  }
  return {
    commands: projectedCommands,
    cliOnly: ["create", "switch"].every((command) => {
      const entry = commands.get(command);
      const semantics = entry && object(entry.semantics) ? entry.semantics : {};
      const policies = object(semantics.optionPolicies)
        ? semantics.optionPolicies
        : {};
      const tab = object(policies["--tab"]) ? policies["--tab"] : {};
      return tab.persisted === false;
    }),
    launchers,
    noFallback: launcherPolicy?.noFallback === true,
  };
};

async function checkTabCompanionSemantics(
  root: string,
  commands: Map<string, Obj>,
  diagnostics: Diagnostic[],
): Promise<void> {
  const canonical = canonicalTabProjection(commands);
  if (!canonical) return;
  const companions: Array<{
    category: CompanionKind;
    code: string;
    source: string;
  }> = [
    {
      category: "docs",
      code: "DOCS_TAB_POLICY_MISMATCH",
      source: paths.docsTabPolicy,
    },
  ];
  const terminalGuidance = [
    "press Command-T manually, then run `aw switch --cd`",
    "requires active Arashi shell integration",
    "when automatic launcher resolution selects Terminal.app",
  ];
  const invalidTerminalGuidance =
    'cd "$(aw switch --no-cd --no-default-launch)"';
  for (const companion of companions) {
    let content: string | undefined;
    let projection: TabProjection | undefined;
    try {
      content = await readFile(join(root, companion.source), "utf8");
      projection = companionProjection(content, companion.category);
    } catch {
      // Report the same owning-source mismatch below.
    }
    if (!projection) {
      add(
        diagnostics,
        "error",
        companion.category,
        companion.code,
        companion.source,
        "projection",
        "Structured launch-disposition policy could not be parsed.",
      );
      continue;
    }
    for (const required of terminalGuidance)
      if (!content?.includes(required))
        add(
          diagnostics,
          "error",
          companion.category,
          companion.code,
          companion.source,
          "launcherSupport.macos-terminal.guidance",
          `Terminal.app unsupported-tab guidance is missing ${JSON.stringify(required)}.`,
        );
    if (content?.includes(invalidTerminalGuidance))
      add(
        diagnostics,
        "error",
        companion.category,
        companion.code,
        companion.source,
        "launcherSupport.macos-terminal.guidance",
        "Terminal.app guidance must not recommend launch-mode output as a path-only command substitution.",
      );
    for (const command of ["create", "switch"] as const)
      for (const field of [
        "conflicts",
        "exit",
        "guard",
        "implies",
        "mode",
        "overrides",
      ] as const)
        if (
          !samePolicyValue(
            projection.commands[command][field],
            canonical.commands[command][field],
          )
        )
          add(
            diagnostics,
            "error",
            companion.category,
            companion.code,
            companion.source,
            `${command}.json.${field}`,
            `Companion ${command} JSON ${field} contradicts the canonical CLI tab policy.`,
          );
    if (projection.cliOnly !== canonical.cliOnly)
      add(
        diagnostics,
        "error",
        companion.category,
        companion.code,
        companion.source,
        "persisted",
        "Companion CLI-only status contradicts the canonical CLI tab policy.",
      );
    if (projection.noFallback !== canonical.noFallback)
      add(
        diagnostics,
        "error",
        companion.category,
        companion.code,
        companion.source,
        "launcherSupport.noFallback",
        "Companion fallback behavior contradicts the canonical CLI tab policy.",
      );
    for (const launcher of [...canonical.launchers.keys()].sort())
      if (
        !samePolicyValue(
          projection.launchers.get(launcher),
          canonical.launchers.get(launcher),
        )
      )
        add(
          diagnostics,
          "error",
          companion.category,
          companion.code,
          companion.source,
          `launcherSupport.${launcher}`,
          "Companion launcher mapping contradicts the canonical CLI tab support classification.",
        );
    for (const launcher of [...projection.launchers.keys()].sort())
      if (!canonical.launchers.has(launcher))
        add(
          diagnostics,
          "error",
          companion.category,
          companion.code,
          companion.source,
          `launcherSupport.${launcher}`,
          "Companion launcher mapping is absent from the canonical CLI tab policy.",
        );
  }
}
const createUnorderedArraySubjects = [
  "modes",
  "editorHosts",
  "legacyFields",
  "acceptedMigrations",
  "rejectedMigrations",
  "jsonRestrictedModes",
] as const;

const createScalarSubjects = [
  "canonicalField",
  "absentMode",
  "editorScope",
  "editorScopeFallback",
  "failurePreservesCreatedWorktrees",
] as const;

const createCategory = (source: string): Diagnostic["category"] =>
  source.includes("arashi-docs")
    ? "docs"
    : source.includes("arashi-skills")
      ? "skills"
      : "schema";

function validateCreateConfigContract(
  value: Obj | undefined,
  source: string,
  diagnostics: Diagnostic[],
): boolean {
  if (!value) return false;
  version(value, source, diagnostics);
  const switchContract = object(value.switch) ? value.switch : {};
  const arrays = [...createUnorderedArraySubjects, "cliPrecedence"] as const;
  const expectations: Array<[string, boolean]> = [
    ["schemaVersion", value.schemaVersion === 1],
    ["canonicalField", text(value.canonicalField)],
    ["absentMode", text(value.absentMode)],
    ["editorScope", text(value.editorScope)],
    ["editorScopeFallback", text(value.editorScopeFallback)],
    [
      "switch",
      text(switchContract.field) &&
        text(switchContract.type) &&
        typeof switchContract.independent === "boolean" &&
        typeof switchContract.launchImpliesSwitch === "boolean",
    ],
    [
      "failurePreservesCreatedWorktrees",
      typeof value.failurePreservesCreatedWorktrees === "boolean",
    ],
    ...arrays.map((subject): [string, boolean] => {
      const values = strings(value[subject]) ?? [];
      return [
        subject,
        values.length > 0 && new Set(values).size === values.length,
      ];
    }),
  ];
  const modes = strings(value.modes) ?? [];
  const restricted = strings(value.jsonRestrictedModes) ?? [];
  expectations.push([
    "jsonRestrictedModes",
    restricted.every((mode) => modes.includes(mode)),
  ]);
  const accepted = strings(value.acceptedMigrations) ?? [];
  const rejected = new Set(strings(value.rejectedMigrations) ?? []);
  expectations.push([
    "migrationClassifications",
    accepted.every((classification) => !rejected.has(classification)),
  ]);

  let valid = true;
  for (const [subject, matches] of expectations) {
    if (matches) continue;
    valid = false;
    add(
      diagnostics,
      "error",
      createCategory(source),
      "CREATE_CONFIG_INVALID",
      source,
      subject,
      "Create launch semantic contract is missing or structurally invalid.",
    );
  }
  return valid;
}

function checkCreateConfigContract(
  value: Obj | undefined,
  canonical: Obj | undefined,
  source: string,
  diagnostics: Diagnostic[],
) {
  if (!value || !canonical) return;
  const switchContract = object(value.switch) ? value.switch : {};
  const canonicalSwitch = object(canonical.switch) ? canonical.switch : {};
  const expectations: Array<[string, boolean]> = [
    ...createScalarSubjects.map((subject): [string, boolean] => [
      subject,
      value[subject] === canonical[subject],
    ]),
    [
      "switch",
      switchContract.field === canonicalSwitch.field &&
        switchContract.type === canonicalSwitch.type &&
        switchContract.independent === canonicalSwitch.independent &&
        switchContract.launchImpliesSwitch ===
          canonicalSwitch.launchImpliesSwitch,
    ],
    ...createUnorderedArraySubjects.map((subject): [string, boolean] => [
      subject,
      sameStrings(strings(value[subject]), strings(canonical[subject]) ?? []),
    ]),
    [
      "cliPrecedence",
      JSON.stringify(strings(value.cliPrecedence)) ===
        JSON.stringify(strings(canonical.cliPrecedence)),
    ],
  ];
  for (const [subject, matches] of expectations) {
    if (matches) continue;
    add(
      diagnostics,
      "error",
      createCategory(source),
      "CREATE_CONFIG_MISMATCH",
      source,
      subject,
      "Create launch semantics must match the CLI semantic contract.",
    );
  }
}

async function markdownFiles(directory: string): Promise<string[]> {
  const result: string[] = [];
  async function walk(path: string) {
    for (const entry of await readdir(path, { withFileTypes: true })) {
      const child = join(path, entry.name);
      if (entry.isDirectory()) await walk(child);
      else if (/\.mdx?$/.test(entry.name)) result.push(child);
    }
  }
  try {
    await walk(directory);
  } catch {
    /* Missing tree is diagnosed through coverage/reference checks. */
  }
  return result.sort();
}

function removedCreateBaseGuidanceContradiction(content: string): boolean {
  const blocks = content
    .replace(/```[\s\S]*?```/g, (block) => block.replace(/\n/g, " "))
    .split(/\n{2,}/)
    .flatMap((block) => block.split(/\n(?=\s*(?:[-*+] |\d+\. ))/))
    .map((block) => block.replace(/\s+/g, " ").trim())
    .filter(Boolean);
  const contexts = blocks.flatMap((block, index) => {
    if (/^#{1,6}\s/.test(block) && /defaults\.create\.baseBranch/i.test(block))
      return [`${block} ${blocks[index + 1] ?? ""}`];
    return block.split(/(?<=[.!?])\s+/);
  });
  const mention = /defaults\.create\.baseBranch/gi;
  const rejection =
    /\b(?:unsupported|no longer supported|removed|obsolete|invalid|forbidden|rejects?|rejected|replac(?:e|ed|ement)|migrat(?:e|ed|ion)|move(?:d)?)\b|\b(?:(?:do|does|is|are|was|were|will|must|should|can|may)\s+not|never|cannot|can't|must not)\b[^.!?]{0,50}\b(?:set|use|configure|add|put|place|accept|support|read|honor)\b[^.!?]{0,50}defaults\.create\.baseBranch|\b(?:instead of|rather than)\s*`?defaults\.create\.baseBranch|defaults\.create\.baseBranch[^.!?]{0,80}(?:\b(?:does not|never|cannot|can't|must not)\b[^.!?]{0,40}\b(?:appl(?:y|ies)|works?|accepts?|supports?|reads?|honors?|uses?)\b|\b(?:is|are|was|were)\s+not\s+(?:supported|accepted|used|read|honored|valid|allowed)\b)/i;
  const actionBeforeMention =
    /\b(?:set|use|configure|add|put|place|accepts?|supports?|reads?|uses?|honors?)\b/gi;
  const affirmativeAfterMention =
    /\b(?:can|may|should)\s+(?:still\s+)?(?:be\s+)?(?:use|used|set|configure|configured|add|added|accept|accepted|support|supported|read|honor|honored)|\b(?:is|remains?|stays?)\s+(?!not\b)(?:still\s+)?(?:supported|accepted|valid|allowed|used|read|honored)|\b(?:arashi|create|configuration|config)\s+(?:still\s+)?(?:accepts?|supports?|reads?|uses?|honors?)\b|\bstill\s+(?:applies|works|controls?|defines?|selects?|chooses?|determines?)\b|\bcontinues?\s+to\s+(?:control|define|set|select|choose|determine)\b/i;
  const activeBehaviorAfterMention =
    /\b(?:appl(?:y|ies)|works?|controls?|defines?|selects?|chooses?|determines?)\b/gi;

  for (const context of contexts) {
    for (const match of context.matchAll(mention)) {
      const localIndex = match.index ?? 0;
      const before = context.slice(0, localIndex);
      const clauseStart = Math.max(
        before.lastIndexOf("."),
        before.lastIndexOf(";"),
        before.lastIndexOf("!"),
        before.lastIndexOf("?"),
      );
      const sameClauseBefore = before.slice(clauseStart + 1);
      const after = context.slice(localIndex + match[0].length);

      for (const action of sameClauseBefore.matchAll(actionBeforeMention)) {
        const prefix = sameClauseBefore.slice(0, action.index).toLowerCase();
        const suffix = sameClauseBefore.slice(
          (action.index ?? 0) + action[0].length,
        );
        if (
          /^(?:support|use)$/i.test(action[0]) &&
          /^\s+(?:for|of)\b/i.test(suffix)
        )
          continue;
        if (/\b(?:instead of|rather than)\s*`?$/i.test(suffix)) continue;
        if (
          !/\b(?:do|does|is|are|was|were|will|must|should|can|may)\s+not(?:\s+\w+){0,3}\s*$/.test(
            prefix,
          ) &&
          !/\bnever(?:\s+\w+){0,2}\s*$/.test(prefix)
        )
          return true;
      }

      if (affirmativeAfterMention.test(after)) return true;
      for (const action of after.matchAll(activeBehaviorAfterMention)) {
        const prefix = after.slice(0, action.index).toLowerCase();
        if (
          !/\b(?:do|does|is|are|was|were|will|must|should|can|may)\s+not(?:\s+\w+){0,3}\s*$/.test(
            prefix,
          ) &&
          !/\bnever(?:\s+\w+){0,2}\s*$/.test(prefix)
        )
          return true;
      }
      if (!rejection.test(context)) return true;
    }
  }
  return false;
}

const workflowRunSteps = (workflow: string): string[] => {
  const lines = workflow.split(/\r?\n/);
  const steps: Array<{ run?: string; uses: boolean }> = [];
  let jobsIndent = -1;
  let jobIndent = -1;
  let jobFieldIndent = -1;
  let stepsIndent = -1;
  let stepIndent = -1;
  let current: { run?: string; uses: boolean } | undefined;
  const finishStep = () => {
    if (current) steps.push(current);
    current = undefined;
  };
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (/^\s*(?:#.*)?$/.test(line)) continue;
    const indent = line.match(/^\s*/)?.[0].length ?? 0;
    if (/^\s*jobs:\s*(?:#.*)?$/.test(line)) {
      finishStep();
      jobsIndent = indent;
      jobIndent = -1;
      jobFieldIndent = -1;
      stepsIndent = -1;
      stepIndent = -1;
      continue;
    }
    if (jobsIndent < 0) continue;
    if (indent <= jobsIndent) {
      finishStep();
      jobsIndent = -1;
      jobIndent = -1;
      jobFieldIndent = -1;
      stepsIndent = -1;
      stepIndent = -1;
      continue;
    }
    const mapping = line.match(/^\s*([^:#][^:]*):\s*(?:#.*)?$/);
    if (jobIndent < 0 && mapping) {
      jobIndent = indent;
      continue;
    }
    if (jobIndent >= 0 && indent === jobIndent && mapping) {
      finishStep();
      jobFieldIndent = -1;
      stepsIndent = -1;
      stepIndent = -1;
      continue;
    }
    if (jobIndent < 0 || indent <= jobIndent) continue;
    if (jobFieldIndent < 0 && !/^\s*-\s+/.test(line)) jobFieldIndent = indent;
    if (
      jobFieldIndent >= 0 &&
      indent === jobFieldIndent &&
      /^\s*steps:\s*(?:#.*)?$/.test(line)
    ) {
      finishStep();
      stepsIndent = indent;
      stepIndent = -1;
      continue;
    }
    if (stepsIndent >= 0 && indent <= stepsIndent) {
      finishStep();
      stepsIndent = -1;
      stepIndent = -1;
    }
    if (stepsIndent < 0) continue;
    const step = line.match(/^\s*-\s+(.*)$/);
    if (step && indent > stepsIndent) {
      if (stepIndent < 0) stepIndent = indent;
      if (indent !== stepIndent) continue;
      finishStep();
      current = { uses: false };
      stepIndent = indent;
      const directField = step[1].match(/^(run|uses):\s*(.*)$/);
      if (directField?.[1] === "uses") current.uses = true;
      else if (directField?.[1] === "run") {
        const run = directField[2].trim();
        if (!["|", "|-", "|+", ">", ">-", ">+"].includes(run)) {
          current.run = run;
        } else {
          const block: string[] = [];
          while (index + 1 < lines.length) {
            const next = lines[index + 1];
            const nextIndent = next.match(/^\s*/)?.[0].length ?? 0;
            if (next.trim() && nextIndent <= indent) break;
            index += 1;
            if (next.trim()) block.push(next.trim());
          }
          current.run = block.join("\n");
        }
      }
      continue;
    }
    if (!current || stepIndent < 0 || indent !== stepIndent + 2) continue;
    const field = line.match(/^\s*(run|uses):\s*(.*)$/);
    if (!field) continue;
    if (field[1] === "uses") {
      current.uses = true;
      continue;
    }
    const run = field[2];
    if (!["|", "|-", "|+", ">", ">-", ">+"].includes(run.trim())) {
      current.run = run.trim();
      continue;
    }
    const blockIndent = indent;
    const block: string[] = [];
    while (index + 1 < lines.length) {
      const next = lines[index + 1];
      const nextIndent = next.match(/^\s*/)?.[0].length ?? 0;
      if (next.trim() && nextIndent <= blockIndent) break;
      index += 1;
      if (next.trim()) block.push(next.trim());
    }
    current.run = block.join("\n");
  }
  finishStep();
  return steps.flatMap((step) =>
    !step.uses && text(step.run) ? [step.run] : [],
  );
};

const workflowJobRunSteps = (workflow: string): string[][] => {
  const lines = workflow.split(/\r?\n/);
  const jobsLine = lines.findIndex((line) =>
    /^\s*jobs:\s*(?:#.*)?$/.test(line),
  );
  if (jobsLine < 0) return [];
  const jobsIndent = lines[jobsLine].match(/^\s*/)?.[0].length ?? 0;
  const starts: number[] = [];
  let jobIndent = -1;
  for (let index = jobsLine + 1; index < lines.length; index += 1) {
    const line = lines[index];
    if (/^\s*(?:#.*)?$/.test(line)) continue;
    const indent = line.match(/^\s*/)?.[0].length ?? 0;
    if (indent <= jobsIndent) break;
    if (/^\s*[^:#][^:]*:\s*(?:#.*)?$/.test(line)) {
      if (jobIndent < 0) jobIndent = indent;
      if (indent === jobIndent) starts.push(index);
    }
  }
  return starts.map((start, position) => {
    const end = starts[position + 1] ?? lines.length;
    return workflowRunSteps(["jobs:", ...lines.slice(start, end)].join("\n"));
  });
};

const directlyRuns = (runs: string[], command: string): boolean =>
  runs.some((run) =>
    run
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0 && !line.startsWith("#"))
      .some((line) => line === command),
  );

const executableRunLines = (runs: string[]): string[] =>
  runs.flatMap((run) =>
    run
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0 && !line.startsWith("#")),
  );

const runsInOrder = (runs: string[], commands: string[]): boolean => {
  const lines = executableRunLines(runs);
  let previous = -1;
  for (const command of commands) {
    const index = lines.indexOf(command, previous + 1);
    if (index < 0) return false;
    previous = index;
  }
  return true;
};

const workflowPullRequestPaths = (workflow: string): Set<string> => {
  const lines = workflow.split(/\r?\n/);
  let onIndent = -1;
  let pullRequestIndent = -1;
  let pathsIndent = -1;
  const result = new Set<string>();
  for (const line of lines) {
    if (/^\s*(?:#.*)?$/.test(line)) continue;
    const indent = line.match(/^\s*/)?.[0].length ?? 0;
    if (/^\s*["']?on["']?:\s*(?:#.*)?$/.test(line)) {
      onIndent = indent;
      pullRequestIndent = -1;
      pathsIndent = -1;
      continue;
    }
    if (onIndent < 0) continue;
    if (indent <= onIndent) break;
    if (/^\s*pull_request:\s*(?:#.*)?$/.test(line)) {
      pullRequestIndent = indent;
      pathsIndent = -1;
      continue;
    }
    if (pullRequestIndent < 0 || indent <= pullRequestIndent) continue;
    if (/^\s*paths:\s*(?:#.*)?$/.test(line)) {
      pathsIndent = indent;
      continue;
    }
    if (pathsIndent < 0 || indent <= pathsIndent) continue;
    const item = line.match(/^\s*-\s*(["']?)(.*?)\1\s*(?:#.*)?$/);
    if (item) result.add(item[2]);
  }
  return result;
};

const executableCheckerSource = (content: string): boolean =>
  content
    .replace(/^#!.*$/gm, "")
    .replace(/\/\/.*$/gm, "")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .trim().length > 0;

async function runFocusedChecker(
  root: string,
  checker: {
    category: "docs" | "skills";
    checker: string;
    code: string;
    cwd: string;
    args?: string[];
  },
  diagnostics: Diagnostic[],
  execute: boolean,
): Promise<void> {
  let source = "";
  try {
    source = await readFile(join(root, checker.checker), "utf8");
  } catch {
    return;
  }
  if (!executableCheckerSource(source)) {
    add(
      diagnostics,
      "error",
      checker.category,
      checker.code,
      checker.checker,
      "checker",
      "Focused checker is an empty or comment-only stub.",
    );
    return;
  }
  if (!execute) return;
  try {
    await execFileAsync(
      process.execPath,
      [relative(checker.cwd, checker.checker), ...(checker.args ?? [])],
      {
        cwd: join(root, checker.cwd),
        maxBuffer: 4 * 1024 * 1024,
      },
    );
  } catch (error) {
    const exitCode =
      object(error) && "code" in error ? String(error.code) : "unknown";
    add(
      diagnostics,
      "error",
      checker.category,
      checker.code,
      checker.checker,
      "checker",
      `Focused checker subprocess failed with exit ${exitCode}.`,
    );
  }
}

async function runPackagedCreateBaseChecker(
  root: string,
  diagnostics: Diagnostic[],
): Promise<void> {
  const temporaryRoot = await mkdtemp(
    join(tmpdir(), "arashi-create-base-package-check-"),
  );
  const skillRoot = join(temporaryRoot, "skills/arashi");
  try {
    await cp(join(root, paths.skills), skillRoot, { recursive: true });
    await runFocusedChecker(
      root,
      {
        category: "skills",
        checker: paths.skillsCreateBaseCheck,
        code: "SKILLS_CREATE_BASE_PACKAGE_CHECK_FAILED",
        cwd: "repos/arashi-skills",
        args: ["--skill-root", skillRoot],
      },
      diagnostics,
      true,
    );
  } finally {
    await rm(temporaryRoot, { force: true, recursive: true });
  }
}

async function runPackagedCompletionChecker(
  root: string,
  diagnostics: Diagnostic[],
): Promise<void> {
  const temporaryRoot = await mkdtemp(
    join(tmpdir(), "arashi-skill-package-check-"),
  );
  const skillRoot = join(temporaryRoot, "skills/arashi");
  try {
    await cp(join(root, paths.skills), skillRoot, { recursive: true });
    await runFocusedChecker(
      root,
      {
        category: "skills",
        checker: paths.skillsCompletionCheck,
        code: "SKILLS_COMPLETION_PACKAGE_CHECK_FAILED",
        cwd: "repos/arashi-skills",
        args: ["--skill-root", skillRoot],
      },
      diagnostics,
      true,
    );
  } finally {
    await rm(temporaryRoot, { force: true, recursive: true });
  }
}

async function runPackagedConfigureChecker(
  root: string,
  diagnostics: Diagnostic[],
): Promise<void> {
  const temporaryRoot = await mkdtemp(
    join(tmpdir(), "arashi-configure-package-check-"),
  );
  const skillRoot = join(temporaryRoot, "skills/arashi");
  try {
    await cp(join(root, paths.skills), skillRoot, { recursive: true });
    await runFocusedChecker(
      root,
      {
        category: "skills",
        checker: paths.skillsConfigureCheck,
        code: "SKILLS_CONFIGURE_PACKAGE_CHECK_FAILED",
        cwd: "repos/arashi-skills",
        args: ["--skill-root", skillRoot],
      },
      diagnostics,
      true,
    );
  } finally {
    await rm(temporaryRoot, { force: true, recursive: true });
  }
}

export async function checkContracts(
  root = process.cwd(),
  options: CheckContractsOptions = {},
): Promise<CheckResult> {
  const d: Diagnostic[] = [];
  const contract = await json(root, paths.contract, d);
  const skillsCreateBaseContract =
    typeof contract?.schemaVersion === "number" && contract.schemaVersion >= 7
      ? await json(root, paths.skillsCreateBaseContract, d)
      : undefined;
  const cliCreateConfig = await json(root, paths.cliCreateConfig, d);
  const cliKittySessions = await json(root, paths.cliKittySessions, d);
  const configSchema = await json(root, paths.configSchema, d);
  const docsCreateConfig = await json(root, paths.docsCreateConfig, d);
  const docsKittySessions = await json(root, paths.docsKittySessions, d);
  const docsCliOptions =
    contract?.schemaVersion === 5
      ? await json(root, paths.docsCliOptions, d)
      : undefined;
  const docsSwitchConfig = await json(root, paths.docsSwitchConfig, d);
  const coverage = await json(root, paths.coverage, d);
  const skillsCreateConfig = await json(root, paths.skillsCreateConfig, d);
  const skillsKittySessions = await json(root, paths.skillsKittySessions, d);
  const skillsSwitchConfig = await json(root, paths.skillsSwitchConfig, d);
  const policy = await json(root, paths.policy, d);
  const manifest = await json(root, paths.manifest, d);
  const docsSemanticChecks =
    contract?.schemaVersion === 8
      ? await jsonStringArray(root, paths.docsSemanticChecks, d)
      : undefined;
  const skillsGuidanceChecks =
    contract?.schemaVersion === 8
      ? await jsonStringArray(root, paths.skillsGuidanceChecks, d)
      : undefined;
  const cliCreateConfigValid = validateCreateConfigContract(
    cliCreateConfig,
    paths.cliCreateConfig,
    d,
  );
  const docsCreateConfigValid = validateCreateConfigContract(
    docsCreateConfig,
    paths.docsCreateConfig,
    d,
  );
  const skillsCreateConfigValid = validateCreateConfigContract(
    skillsCreateConfig,
    paths.skillsCreateConfig,
    d,
  );
  if (cliCreateConfigValid && docsCreateConfigValid)
    checkCreateConfigContract(
      docsCreateConfig,
      cliCreateConfig,
      paths.docsCreateConfig,
      d,
    );
  if (cliCreateConfigValid && skillsCreateConfigValid)
    checkCreateConfigContract(
      skillsCreateConfig,
      cliCreateConfig,
      paths.skillsCreateConfig,
      d,
    );
  checkKittyWorktreeSessionContract(
    cliKittySessions,
    paths.cliKittySessions,
    "schema",
    d,
  );
  checkKittyWorktreeSessionContract(
    docsKittySessions,
    paths.docsKittySessions,
    "docs",
    d,
  );
  checkKittyWorktreeSessionContract(
    skillsKittySessions,
    paths.skillsKittySessions,
    "skills",
    d,
  );
  checkSwitchConfigContract(docsSwitchConfig, paths.docsSwitchConfig, d);
  checkSwitchConfigContract(skillsSwitchConfig, paths.skillsSwitchConfig, d);
  const definitions = object(configSchema?.definitions)
    ? configSchema.definitions
    : {};
  const switchMode = object(definitions.SwitchMode)
    ? definitions.SwitchMode
    : {};
  if (!sameStrings(strings(switchMode.enum), switchModes))
    add(
      d,
      "error",
      "schema",
      "SWITCH_CONFIG_MISMATCH",
      paths.configSchema,
      "modes",
      "SwitchMode must enumerate auto, cd, launch, sesh, and herdr.",
    );
  const switchDefaults = object(definitions.SwitchCommandDefaults)
    ? definitions.SwitchCommandDefaults
    : {};
  const switchProperties = object(switchDefaults.properties)
    ? switchDefaults.properties
    : {};
  if (!("mode" in switchProperties))
    add(
      d,
      "error",
      "schema",
      "SWITCH_CONFIG_MISMATCH",
      paths.configSchema,
      "mode",
      "SwitchCommandDefaults must expose the canonical mode field.",
    );
  for (const deprecated of ["launchMode", "launch_mode"])
    if (deprecated in switchProperties)
      add(
        d,
        "error",
        "schema",
        "SWITCH_CONFIG_DEPRECATED_FIELD",
        paths.configSchema,
        deprecated,
        "Deprecated switch launcher aliases must not be canonical schema properties.",
      );
  const commandDefaults = object(definitions.CommandDefaultsConfig)
    ? definitions.CommandDefaultsConfig
    : {};
  const commandDefaultProperties = object(commandDefaults.properties)
    ? commandDefaults.properties
    : {};
  const commandCreate = object(commandDefaultProperties.create)
    ? commandDefaultProperties.create
    : {};
  if (
    cliCreateConfig?.canonicalField !== "defaults.create.launch" ||
    commandCreate.$ref !== "#/definitions/CreateCommandDefaults"
  )
    add(
      d,
      "error",
      "schema",
      "CREATE_CONFIG_MISMATCH",
      paths.configSchema,
      "canonicalField",
      "The CLI canonical field and generated defaults.create schema path must resolve to CreateCommandDefaults.launch.",
    );
  const createDefaults = object(definitions.CreateCommandDefaults)
    ? definitions.CreateCommandDefaults
    : {};
  const createProperties = object(createDefaults.properties)
    ? createDefaults.properties
    : {};
  const createLaunchMode = object(definitions.CreateLaunchMode)
    ? definitions.CreateLaunchMode
    : {};
  const cliCreateModes = strings(cliCreateConfig?.modes) ?? [];
  if (!sameStrings(strings(createLaunchMode.enum), cliCreateModes))
    add(
      d,
      "error",
      "schema",
      "CREATE_CONFIG_MISMATCH",
      paths.configSchema,
      "modes",
      "CreateLaunchMode must enumerate none, auto, sesh, and herdr.",
    );

  if (!("launch" in createProperties))
    add(
      d,
      "error",
      "schema",
      "CREATE_CONFIG_MISMATCH",
      paths.configSchema,
      "launch",
      "CreateCommandDefaults must expose the canonical launch field.",
    );
  const createLaunch = object(createProperties.launch)
    ? createProperties.launch
    : {};
  if (createLaunch.$ref !== "#/definitions/CreateLaunchMode")
    add(
      d,
      "error",
      "schema",
      "CREATE_CONFIG_MISMATCH",
      paths.configSchema,
      "launch",
      "CreateCommandDefaults.launch must use the canonical create launch enum.",
    );
  const createSwitch = object(createProperties.switch)
    ? createProperties.switch
    : {};
  const cliCreateSwitch = object(cliCreateConfig?.switch)
    ? cliCreateConfig.switch
    : {};
  if (
    createSwitch.type !== "boolean" ||
    cliCreateSwitch.field !== "defaults.create.switch" ||
    cliCreateSwitch.type !== createSwitch.type
  )
    add(
      d,
      "error",
      "schema",
      "CREATE_CONFIG_MISMATCH",
      paths.configSchema,
      "switch",
      "CreateCommandDefaults.switch must remain an independent boolean.",
    );
  for (const deprecated of ["launchMode", "launch_mode"])
    if (deprecated in createProperties)
      add(
        d,
        "error",
        "schema",
        "CREATE_CONFIG_DEPRECATED_FIELD",
        paths.configSchema,
        deprecated,
        "Deprecated create launcher aliases must not be canonical schema properties.",
      );
  const commandEditors = object(commandDefaultProperties.editors)
    ? commandDefaultProperties.editors
    : {};
  if (
    cliCreateConfig?.editorScope !== "defaults.editors.<host>.create" ||
    commandEditors.$ref !== "#/definitions/EditorDefaultsConfig"
  )
    add(
      d,
      "error",
      "schema",
      "CREATE_CONFIG_MISMATCH",
      paths.configSchema,
      "editorScope",
      "The CLI editor scope and generated defaults.editors schema path must resolve through EditorDefaultsConfig.",
    );
  const editorCommandDefaults = object(definitions.EditorCommandDefaults)
    ? definitions.EditorCommandDefaults
    : {};
  const editorCommandProperties = object(editorCommandDefaults.properties)
    ? editorCommandDefaults.properties
    : {};
  const editorCreate = object(editorCommandProperties.create)
    ? editorCommandProperties.create
    : {};
  const expectedEditorCreateRef =
    typeof contract?.schemaVersion === "number" && contract.schemaVersion >= 7
      ? "#/definitions/EditorCreateCommandDefaults"
      : "#/definitions/CreateCommandDefaults";
  if (editorCreate.$ref !== expectedEditorCreateRef)
    add(
      d,
      "error",
      "schema",
      "CREATE_CONFIG_MISMATCH",
      paths.configSchema,
      "editorCreate",
      `EditorCommandDefaults.create must reference ${expectedEditorCreateRef.split("/").at(-1)}.`,
    );
  const editorDefaults = object(definitions.EditorDefaultsConfig)
    ? definitions.EditorDefaultsConfig
    : {};
  const editorProperties = object(editorDefaults.properties)
    ? editorDefaults.properties
    : {};
  const cliEditorHosts = strings(cliCreateConfig?.editorHosts) ?? [];
  if (!sameStrings(Object.keys(editorProperties), cliEditorHosts))
    add(
      d,
      "error",
      "schema",
      "CREATE_CONFIG_MISMATCH",
      paths.configSchema,
      "editorHosts",
      "EditorDefaultsConfig hosts must match the CLI create-launch contract.",
    );
  for (const host of cliEditorHosts) {
    const editorHost = object(editorProperties[host])
      ? editorProperties[host]
      : {};
    if (editorHost.$ref !== "#/definitions/EditorCommandDefaults")
      add(
        d,
        "error",
        "schema",
        "CREATE_CONFIG_MISMATCH",
        paths.configSchema,
        `editorHost:${host}`,
        "Each editor host must reference EditorCommandDefaults.",
      );
  }
  if (contract && ![4, 5, 6, 7, 8].includes(contract.schemaVersion as number))
    add(
      d,
      "error",
      "schema",
      "SCHEMA_VERSION_UNSUPPORTED",
      paths.contract,
      String(contract.schemaVersion),
      "Expected schemaVersion 4, 5, 6, 7, or 8.",
    );
  version(coverage, paths.coverage, d);
  version(policy, paths.policy, d);
  const commandEntries = Array.isArray(contract?.commands)
    ? contract.commands.filter(object)
    : [];
  if (contract?.schemaVersion === 4 && "cliVersion" in contract)
    add(
      d,
      "error",
      "schema",
      "SCHEMA_INVALID",
      paths.contract,
      "cliVersion",
      "Contract schema version 4 excludes package release metadata.",
    );
  if (contract && !Array.isArray(contract.commands))
    add(
      d,
      "error",
      "schema",
      "SCHEMA_INVALID",
      paths.contract,
      "contract",
      "Contract requires commands.",
    );
  const commands = new Map<string, Obj>();
  for (const command of commandEntries) {
    if (!text(command.path) || commands.has(command.path)) {
      add(
        d,
        "error",
        "schema",
        "SCHEMA_INVALID",
        paths.contract,
        String(command.path),
        "Command paths must be non-empty and unique.",
      );
      continue;
    }
    commands.set(command.path, command);
    const semantics = object(command.semantics) ? command.semantics : {};
    const commandOptionPolicies = object(semantics.optionPolicies)
      ? semantics.optionPolicies
      : {};
    const commandOptions = commandOptionNames(command);
    for (const [option, optionPolicy] of Object.entries(
      commandOptionPolicies,
    )) {
      if (!validOptionPolicy(optionPolicy))
        add(
          d,
          "error",
          "schema",
          "SCHEMA_INVALID",
          paths.contract,
          `${command.path}.${option}`,
          "Schema-v4 option policies require typed conflict, implication, JSON, persistence, and optional prerequisite/support metadata.",
        );
      if (!commandOptions.includes(option))
        add(
          d,
          "error",
          "schema",
          "OPTION_POLICY_OPTION_MISSING",
          paths.contract,
          `${command.path}.${option}`,
          `Option policy key ${option} is not registered on the exact ${command.path} command.`,
        );
    }
    for (const surface of ["json", "docs", "skills", "standalone", "vscode"])
      if (!object(semantics[surface]))
        add(
          d,
          "error",
          "schema",
          "SCHEMA_INVALID",
          paths.contract,
          `${command.path}.${surface}`,
          "Missing semantic classification.",
        );
    const jsonPolicy = object(semantics.json) ? semantics.json : {};
    reason(
      jsonPolicy,
      paths.contract,
      `${command.path}.json`,
      jsonPolicy.support === "conditional" ||
        jsonPolicy.support === "unsupported",
      d,
    );
    const standalonePolicy = object(semantics.standalone)
      ? semantics.standalone
      : {};
    if (!cliStandaloneSupport.has(String(standalonePolicy.support)))
      add(
        d,
        "error",
        "schema",
        "SCHEMA_INVALID",
        paths.contract,
        `${command.path}.standalone`,
        "Standalone support must be full, conditional, configured-only, or not-applicable.",
      );
    reason(
      standalonePolicy,
      paths.contract,
      `${command.path}.standalone`,
      standalonePolicy.support !== "full",
      d,
    );
    for (const surface of ["docs", "skills", "vscode"]) {
      const p = object(semantics[surface]) ? (semantics[surface] as Obj) : {};
      reason(
        p,
        paths.contract,
        `${command.path}.${surface}`,
        p.expectation === "excluded" || p.expectation === "represented",
        d,
      );
    }
  }
  if (contract?.schemaVersion === 8)
    checkConfigurePolicy(
      commands.get("configure"),
      docsSemanticChecks,
      skillsGuidanceChecks,
      d,
    );
  checkAddMaterializationContract(commands.get("add"), d);
  if (
    typeof contract?.schemaVersion === "number" &&
    contract.schemaVersion >= 6
  )
    checkSshAliasCliContract(commands.get("add"), d);
  if (contract?.schemaVersion === 5) {
    validateSchemaV5Commands(commands, d);
    compareNormalizedRecord(
      docsCliOptions,
      normalizedDocsCliOptions,
      paths.docsCliOptions,
      "",
      d,
    );
  }
  if (
    typeof contract?.schemaVersion === "number" &&
    contract.schemaVersion >= 6
  )
    validateSchemaV6Completion(contract, commands, d);
  if (contract?.schemaVersion === 7) {
    const create = commands.get("create");
    const createOptions = create ? commandOptions(create) : [];
    const baseOption = createOptions.find(
      (option) => optionLong(option) === "--base",
    );
    if (!baseOption) {
      add(
        d,
        "error",
        "schema",
        "CREATE_BASE_CLI_POLICY_MISMATCH",
        paths.contract,
        "create.--base",
        "Schema v7 requires the owning create --base option and exact create-base semantic policy.",
      );
    } else {
      compareExactRecord(
        baseOption.semanticPolicy,
        createBaseSemanticPolicy,
        paths.contract,
        "create.--base.semanticPolicy",
        "schema",
        "CREATE_BASE_CLI_POLICY_MISMATCH",
        "Schema-v7 create --base semantics differ from the normalized create-base contract.",
        d,
      );
      if (
        baseOption.semanticPolicyOwner !== "command" ||
        baseOption.required !== true ||
        baseOption.valueShape !== "required"
      )
        add(
          d,
          "error",
          "schema",
          "CREATE_BASE_CLI_POLICY_MISMATCH",
          paths.contract,
          "create.--base",
          "Schema v7 requires command-owned create --base with a required branch value.",
        );
    }
    for (const [commandPath, command] of commands)
      for (const option of commandOptions(command)) {
        const long = optionLong(option);
        if (commandPath === "create" && long === "--base") continue;
        const semanticPolicy = object(option.semanticPolicy)
          ? option.semanticPolicy
          : undefined;
        if (semanticPolicy && "createBase" in semanticPolicy)
          add(
            d,
            "error",
            "schema",
            "CREATE_BASE_POLICY_WRONG_OWNER",
            paths.contract,
            `${commandPath}.${long ?? String(option.flags)}`,
            "Only the exact create --base option may own createBase semantic policy.",
          );
      }

    const expectedSkillsContract = {
      schemaVersion: 7,
      command: "create",
      option: "--base",
      semanticPolicy: createBaseSemanticPolicy,
      compatibilityWorkaround: "precreate-targets-and-reuse-existing",
    };
    compareExactRecord(
      skillsCreateBaseContract,
      expectedSkillsContract,
      paths.skillsCreateBaseContract,
      "",
      "skills",
      "CREATE_BASE_SKILLS_POLICY_MISMATCH",
      "Packaged-skill create-base record must exactly match the CLI create --base policy.",
      d,
    );

    const baseBranch = object(createProperties.baseBranch)
      ? createProperties.baseBranch
      : undefined;
    if (!baseBranch)
      add(
        d,
        "error",
        "schema",
        "CREATE_BASE_CONFIG_SCHEMA_MISMATCH",
        paths.configSchema,
        "defaults.create.baseBranch",
        "The generic create defaults must expose baseBranch.",
      );
    else {
      if (baseBranch.type !== "string" || baseBranch.minLength !== 1)
        add(
          d,
          "error",
          "schema",
          "CREATE_BASE_CONFIG_SCHEMA_MISMATCH",
          paths.configSchema,
          "defaults.create.baseBranch",
          "baseBranch must be a non-empty string.",
        );
      if (baseBranch.pattern !== createBaseBranchPattern)
        add(
          d,
          "error",
          "schema",
          "CREATE_BASE_CONFIG_SCHEMA_MISMATCH",
          paths.configSchema,
          "defaults.create.baseBranch.pattern",
          "baseBranch must retain the generated Git branch-name syntax pattern.",
        );
    }
    const editorCreateDefaults = object(definitions.EditorCreateCommandDefaults)
      ? definitions.EditorCreateCommandDefaults
      : {};
    const editorCreateProperties = object(editorCreateDefaults.properties)
      ? editorCreateDefaults.properties
      : {};
    if ("baseBranch" in editorCreateProperties)
      add(
        d,
        "error",
        "schema",
        "CREATE_BASE_CONFIG_SCHEMA_MISMATCH",
        paths.configSchema,
        "defaults.editors.<host>.create.baseBranch",
        "Create baseBranch is workspace-generic and must not be editor-scoped.",
      );
  } else if (contract?.schemaVersion === 8) {
    const skillsSemanticPolicy = object(
      skillsCreateBaseContract?.semanticPolicy,
    )
      ? skillsCreateBaseContract.semanticPolicy
      : {};
    const expectedRepositoryBase = object(skillsSemanticPolicy.repositoryBase)
      ? skillsSemanticPolicy.repositoryBase
      : undefined;
    if (!expectedRepositoryBase) {
      add(
        d,
        "error",
        "skills",
        "REPOSITORY_BASE_SKILLS_POLICY_MISMATCH",
        paths.skillsCreateBaseContract,
        "semanticPolicy.repositoryBase",
        "Schema v8 requires the packaged shared repository-base policy.",
      );
    }
    for (const commandPath of ["create", "clone"] as const) {
      const command = commands.get(commandPath);
      for (const optionName of ["--base", "--repo-base"] as const) {
        const option = commandOptions(command ?? {}).find(
          (candidate) => optionLong(candidate) === optionName,
        );
        const subject = `${commandPath}.${optionName}`;
        if (!option) {
          add(
            d,
            "error",
            "schema",
            "REPOSITORY_BASE_CLI_POLICY_MISMATCH",
            paths.contract,
            subject,
            "Schema v8 requires shared base options on configured create and clone.",
          );
          continue;
        }
        const semanticPolicy = object(option.semanticPolicy)
          ? option.semanticPolicy
          : {};
        compareExactRecord(
          semanticPolicy.repositoryBase,
          expectedRepositoryBase,
          paths.contract,
          `${subject}.semanticPolicy.repositoryBase`,
          "schema",
          "REPOSITORY_BASE_CLI_POLICY_MISMATCH",
          "Schema-v8 shared repository-base semantics differ from packaged guidance.",
          d,
        );
        if (
          option.semanticPolicyOwner !== "command" ||
          option.required !== true ||
          option.valueShape !== "required" ||
          option.repeatable !== (optionName === "--repo-base")
        )
          add(
            d,
            "error",
            "schema",
            "REPOSITORY_BASE_CLI_POLICY_MISMATCH",
            paths.contract,
            subject,
            "Schema v8 requires command-owned branch values and repeatable --repo-base overrides.",
          );
      }
    }

    const configDefinition = object(definitions.Config)
      ? definitions.Config
      : {};
    const configProperties = object(configDefinition.properties)
      ? configDefinition.properties
      : {};
    const metaDefinition = object(definitions.MetaRepositoryConfig)
      ? definitions.MetaRepositoryConfig
      : {};
    const metaProperties = object(metaDefinition.properties)
      ? metaDefinition.properties
      : {};
    const repoDefinition = object(definitions.RepoConfig)
      ? definitions.RepoConfig
      : {};
    const repoProperties = object(repoDefinition.properties)
      ? repoDefinition.properties
      : {};
    if ("baseBranch" in createProperties)
      add(
        d,
        "error",
        "schema",
        "REPOSITORY_BASE_CONFIG_SCHEMA_MISMATCH",
        paths.configSchema,
        "defaults.create.baseBranch",
        "Schema v8 must reject the removed defaults.create.baseBranch field.",
      );
    if (createDefaults.additionalProperties !== false)
      add(
        d,
        "error",
        "schema",
        "REPOSITORY_BASE_CONFIG_SCHEMA_MISMATCH",
        paths.configSchema,
        "defaults.create.additionalProperties",
        "Schema v8 must reject unknown defaults.create properties, including the removed baseBranch key.",
      );
    const editorCreateDefinition = object(
      definitions.EditorCreateCommandDefaults,
    )
      ? definitions.EditorCreateCommandDefaults
      : {};
    const editorCreateProperties = object(editorCreateDefinition.properties)
      ? editorCreateDefinition.properties
      : {};
    if ("baseBranch" in editorCreateProperties)
      add(
        d,
        "error",
        "schema",
        "REPOSITORY_BASE_CONFIG_SCHEMA_MISMATCH",
        paths.configSchema,
        "defaults.editors.<host>.create.baseBranch",
        "The removed create-only baseBranch field must not be editor-scoped.",
      );
    if (editorCreateDefinition.additionalProperties !== false)
      add(
        d,
        "error",
        "schema",
        "REPOSITORY_BASE_CONFIG_SCHEMA_MISMATCH",
        paths.configSchema,
        "defaults.editors.<host>.create.additionalProperties",
        "Schema v8 must reject unknown editor-scoped create properties, including the removed baseBranch key.",
      );

    for (const [category, directory] of [
      ["docs", "repos/arashi-docs/docs"],
      ["docs", "repos/arashi-docs/public"],
      ["skills", paths.skills],
    ] as const) {
      for (const file of await markdownFiles(join(root, directory))) {
        const guidance = await readFile(file, "utf8");
        if (removedCreateBaseGuidanceContradiction(guidance))
          add(
            d,
            "error",
            category,
            "REPOSITORY_BASE_GUIDANCE_MISMATCH",
            relative(root, file),
            "defaults.create.baseBranch",
            "Current guidance must reject the removed defaults.create.baseBranch key rather than recommend or describe legacy behavior.",
          );
      }
    }
    for (const relativePath of [
      "repos/arashi/README.md",
      "repos/arashi-docs/public/llms.txt",
      "repos/arashi-docs/public/llms-full.txt",
    ]) {
      try {
        const guidance = await readFile(join(root, relativePath), "utf8");
        if (removedCreateBaseGuidanceContradiction(guidance))
          add(
            d,
            "error",
            "docs",
            "REPOSITORY_BASE_GUIDANCE_MISMATCH",
            relativePath,
            "defaults.create.baseBranch",
            "Current guidance must reject the removed defaults.create.baseBranch key rather than recommend or describe legacy behavior.",
          );
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
      }
    }

    const metaRoute = object(configProperties.meta)
      ? configProperties.meta
      : {};
    if (metaRoute.$ref !== "#/definitions/MetaRepositoryConfig")
      add(
        d,
        "error",
        "schema",
        "REPOSITORY_BASE_CONFIG_SCHEMA_MISMATCH",
        paths.configSchema,
        "meta",
        "Config.meta must reference MetaRepositoryConfig so meta.baseBranch is reachable.",
      );
    const reposRoute = object(configProperties.repos)
      ? configProperties.repos
      : {};
    const repoValues = object(reposRoute.additionalProperties)
      ? reposRoute.additionalProperties
      : {};
    if (
      reposRoute.type !== "object" ||
      repoValues.$ref !== "#/definitions/RepoConfig"
    )
      add(
        d,
        "error",
        "schema",
        "REPOSITORY_BASE_CONFIG_SCHEMA_MISMATCH",
        paths.configSchema,
        "repos",
        "Config.repos must map repository names to RepoConfig so child baseBranch fields are reachable.",
      );

    const sharedBaseSchemas: Array<[string, Obj | undefined]> = [
      [
        "baseBranch",
        object(configProperties.baseBranch)
          ? configProperties.baseBranch
          : undefined,
      ],
      [
        "meta.baseBranch",
        object(metaProperties.baseBranch)
          ? metaProperties.baseBranch
          : undefined,
      ],
      [
        "repos.<name>.baseBranch",
        object(repoProperties.baseBranch)
          ? repoProperties.baseBranch
          : undefined,
      ],
    ];
    for (const [subject, field] of sharedBaseSchemas)
      if (
        !object(field) ||
        field.type !== "string" ||
        field.minLength !== 1 ||
        field.pattern !== createBaseBranchPattern
      )
        add(
          d,
          "error",
          "schema",
          "REPOSITORY_BASE_CONFIG_SCHEMA_MISMATCH",
          paths.configSchema,
          subject,
          "Shared repository baseBranch fields must retain the generated Git branch-name schema.",
        );
  }

  let index = "";
  try {
    index = await readFile(join(root, paths.docs, "index.md"), "utf8");
  } catch {
    add(
      d,
      "error",
      "docs",
      "DOCS_INDEX_MISSING",
      `${paths.docs}/index.md`,
      "index",
      "Canonical command index is missing.",
    );
  }
  for (const [name, command] of commands) {
    const p =
      object(command.semantics) && object(command.semantics.docs)
        ? command.semantics.docs
        : {};
    if (p.expectation === "required") {
      const requiredPage = `${paths.docs}/${name}.md`;
      if (!(await exists(join(root, requiredPage))))
        add(
          d,
          "error",
          "docs",
          "DOCS_PAGE_MISSING",
          requiredPage,
          name,
          "Required canonical command page is missing.",
        );
      const indexPattern = new RegExp(
        `(?:\\./|/)?commands/${name}(?:\\.md|/|\\))`,
      );
      if (!indexPattern.test(index))
        add(
          d,
          "error",
          "docs",
          "DOCS_INDEX_MISSING",
          `${paths.docs}/index.md`,
          name,
          "Required command is absent from the canonical index.",
        );
    } else if (p.expectation === "excluded")
      add(
        d,
        "info",
        "docs",
        "DOCS_EXCLUDED",
        paths.contract,
        name,
        String(p.reason),
      );
  }

  const covered = new Map<string, Obj>();
  const coverageEntries = Array.isArray(coverage?.commands)
    ? coverage.commands.filter(object)
    : [];
  if (coverage && !Array.isArray(coverage.commands))
    add(
      d,
      "error",
      "schema",
      "SCHEMA_INVALID",
      paths.coverage,
      "commands",
      "Coverage commands must be an array.",
    );
  for (const entry of coverageEntries) {
    const name = entry.name;
    if (!text(name) || covered.has(name)) {
      add(
        d,
        "error",
        "schema",
        "SCHEMA_INVALID",
        paths.coverage,
        String(name),
        "Coverage names must be non-empty and unique.",
      );
      continue;
    }
    covered.set(name, entry);
    reason(entry, paths.coverage, name, entry.status === "excluded", d);
    const standalonePolicy = object(entry.standalone) ? entry.standalone : {};
    if (!skillsStandaloneSupport.has(String(standalonePolicy.support)))
      add(
        d,
        "error",
        "schema",
        "SCHEMA_INVALID",
        paths.coverage,
        `${name}.standalone`,
        "Standalone support must be supported, conditional, configured-only, or not-applicable.",
      );
    reason(
      standalonePolicy,
      paths.coverage,
      `${name}.standalone`,
      standalonePolicy.support !== "supported",
      d,
    );
    if (!commands.has(name))
      add(
        d,
        "error",
        "skills",
        "SKILLS_STALE_COVERAGE",
        paths.coverage,
        name,
        "Coverage names a command absent from the CLI contract.",
      );
  }
  for (const [name, command] of commands) {
    const skillsPolicy =
      object(command.semantics) && object(command.semantics.skills)
        ? command.semantics.skills
        : {};
    const expectation = skillsPolicy.expectation;
    const entry = covered.get(name);
    if (name === "configure" && expectation === "required") continue;
    if (expectation === "excluded" && !entry) {
      add(
        d,
        "info",
        "skills",
        "SKILLS_EXCLUDED",
        paths.contract,
        name,
        String(skillsPolicy.reason),
      );
      continue;
    }
    if (!entry)
      add(
        d,
        "error",
        "skills",
        "SKILLS_COVERAGE_MISSING",
        paths.coverage,
        name,
        "Command has no structured skills decision.",
      );
    else if (entry.status === "covered") {
      if (
        !text(entry.reference) ||
        !(await exists(join(root, paths.skills, entry.reference)))
      )
        add(
          d,
          "error",
          "skills",
          "SKILLS_REFERENCE_INVALID",
          paths.coverage,
          name,
          "Covered command requires an existing relative reference.",
        );
    } else if (entry.status === "excluded")
      add(
        d,
        "info",
        "skills",
        "SKILLS_EXCLUDED",
        paths.coverage,
        name,
        String(entry.reason),
      );
    else
      add(
        d,
        "error",
        "schema",
        "SCHEMA_INVALID",
        paths.coverage,
        name,
        "Status must be covered or excluded.",
      );
    if (expectation === "required" && entry?.status === "excluded")
      add(
        d,
        "error",
        "skills",
        "SKILLS_EXPECTATION_MISMATCH",
        paths.coverage,
        name,
        "CLI requires skills coverage but policy excludes it.",
      );
    if (entry) {
      const cliStandalone =
        object(command.semantics) && object(command.semantics.standalone)
          ? command.semantics.standalone
          : {};
      const skillsStandalone = object(entry.standalone) ? entry.standalone : {};
      const cliSupport = normalizeStandaloneSupport(cliStandalone.support);
      const skillsSupport = normalizeStandaloneSupport(
        skillsStandalone.support,
      );
      if (cliSupport !== skillsSupport)
        add(
          d,
          "error",
          "skills",
          "SKILLS_STANDALONE_MISMATCH",
          paths.coverage,
          name,
          `Skills classify standalone support as ${String(skillsStandalone.support)}, but the CLI classifies it as ${String(cliStandalone.support)}.`,
        );
    }
  }

  for (const [name, command] of commands) {
    const semantics = object(command.semantics) ? command.semantics : {};
    const optionPolicies = object(semantics.optionPolicies)
      ? semantics.optionPolicies
      : {};
    const coverageEntry = covered.get(name);
    const coverageOptions = strings(coverageEntry?.requiredOptions) ?? [];
    for (const option of Object.keys(optionPolicies).sort()) {
      if (!coverageOptions.includes(option))
        add(
          d,
          "error",
          "skills",
          "SKILLS_OPTION_POLICY_MISMATCH",
          paths.coverage,
          `${name}.${option}`,
          `Skills coverage for ${name} must explicitly represent policy option ${option} in requiredOptions.`,
        );
    }
  }

  const initCommand = commands.get("init");
  const initCoverage = covered.get("init");
  if (initCommand) {
    const options = Array.isArray(initCommand.options)
      ? initCommand.options
          .filter(object)
          .flatMap((option) =>
            text(option.flags)
              ? (option.flags.match(/--[a-z0-9-]+/g) ?? [])
              : [],
          )
      : [];
    const semantics = object(initCommand.semantics)
      ? initCommand.semantics
      : {};
    const rawPolicy = object(semantics.zeroConfig) ? semantics.zeroConfig : {};
    const dryRun = object(rawPolicy.dryRun) ? rawPolicy.dryRun : {};
    const jsonPolicy = object(rawPolicy.json) ? rawPolicy.json : {};
    const policy: Obj = {
      compatibleOptions: rawPolicy.compatibleOptions,
      dryRun: dryRun.supported,
      incompatibleOptions: rawPolicy.incompatibleOptions,
      json: jsonPolicy.supported,
      option: rawPolicy.option,
    };
    const validPolicy =
      policy.option === "--zero-config" &&
      dryRun.supported === true &&
      dryRun.finalState === "unchanged" &&
      jsonPolicy.supported === true &&
      jsonPolicy.singleEnvelope === true &&
      jsonPolicy.suppressesHumanStdout === true &&
      sameStrings(strings(policy.compatibleOptions), initCompatibleOptions) &&
      sameStrings(
        strings(policy.incompatibleOptions),
        initIncompatibleOptions,
      ) &&
      sameStrings(options, [
        "--zero-config",
        ...initCompatibleOptions,
        ...initIncompatibleOptions,
        ...(typeof contract?.schemaVersion === "number" &&
        contract.schemaVersion >= 6
          ? ["--help"]
          : []),
      ]);
    if (!validPolicy)
      add(
        d,
        "error",
        "schema",
        "STANDALONE_INIT_POLICY_INVALID",
        paths.contract,
        "init.zeroConfig",
        "init --zero-config requires unchanged dry-run behavior, single-envelope JSON behavior, and complete compatible and incompatible option policy metadata.",
      );
    if (initCoverage) {
      const coverageStandalone = object(initCoverage.standalone)
        ? initCoverage.standalone
        : {};
      const coveragePolicy = object(coverageStandalone.policy)
        ? coverageStandalone.policy
        : {};
      const requiredOptions = strings(initCoverage.requiredOptions);
      if (
        !sameStrings(requiredOptions, ["--zero-config"]) ||
        !sameInitPolicy(policy, coveragePolicy)
      )
        add(
          d,
          "error",
          "skills",
          "SKILLS_INIT_POLICY_MISMATCH",
          paths.coverage,
          "init",
          "Skills init --zero-config option policy metadata must match the CLI contract.",
        );
    }
  }
  if (contract?.schemaVersion === 4)
    for (const commandName of ["create", "switch"] as const) {
      const command = commands.get(commandName);
      if (!command) continue;
      const commandOptions = commandOptionNames(command);
      const semantics = object(command.semantics) ? command.semantics : {};
      const optionPolicies = object(semantics.optionPolicies)
        ? semantics.optionPolicies
        : {};
      for (const [option, expectedPolicy] of Object.entries(
        canonicalOptionPolicies[commandName],
      )) {
        const actualPolicy = optionPolicies[option];
        const policyOptions = [
          option,
          ...(strings(expectedPolicy.compatibleOptions) ?? []),
          ...(strings(expectedPolicy.conflicts) ?? []),
        ];
        if (
          !samePolicyValue(actualPolicy, expectedPolicy) ||
          !policyOptions.every((candidate) =>
            commandOptions.includes(candidate),
          )
        )
          add(
            d,
            "error",
            "schema",
            "OPTION_POLICY_MISMATCH",
            paths.contract,
            `${commandName}.${option}`,
            `${commandName} ${option} must match the canonical typed schema-v4 option policy.`,
          );
      }
    }
  for (const file of await markdownFiles(join(root, paths.skills))) {
    const content = await readFile(file, "utf8");
    const regex = /`arashi\s+([a-z][a-z0-9-]*)(?=[\s`])/g;
    for (const match of content.matchAll(regex))
      if (
        !commands.has(match[1]) &&
        !["--help", "--version"].includes(match[1])
      )
        add(
          d,
          "error",
          "skills",
          "SKILLS_STALE_REFERENCE",
          relative(root, file),
          match[1],
          "Command-shaped reference is absent from the CLI contract.",
        );
  }

  const cliPolicy = object(policy?.cliCommands) ? policy.cliCommands : {};
  const extensionOnly = Array.isArray(policy?.extensionOnlyCommands)
    ? policy.extensionOnlyCommands.filter(text)
    : [];
  const contributed = new Set(
    (object(manifest?.contributes) &&
    Array.isArray(manifest.contributes.commands)
      ? manifest.contributes.commands
      : []
    )
      .filter(object)
      .map((x) => x.command)
      .filter(text),
  );
  for (const [name, raw] of Object.entries(cliPolicy)) {
    if (!object(raw)) {
      add(
        d,
        "error",
        "schema",
        "SCHEMA_INVALID",
        paths.policy,
        name,
        "CLI policy entry must be an object.",
      );
      continue;
    }
    if (!commands.has(name))
      add(
        d,
        "error",
        "vscode",
        "VSCODE_INVALID_CLI",
        paths.policy,
        name,
        "Policy names a command absent from the CLI contract.",
      );
    const ids = Array.isArray(raw.commands) ? raw.commands.filter(text) : [];
    reason(
      raw,
      paths.policy,
      name,
      raw.state === "excluded" || raw.state === "represented",
      d,
    );
    if (raw.state === "mapped" && ids.length === 0)
      add(
        d,
        "error",
        "vscode",
        "VSCODE_INVALID_MAPPING",
        paths.policy,
        name,
        "Mapped state requires extension command IDs.",
      );
    if (
      raw.state === "represented" &&
      ids.length === 0 &&
      !(Array.isArray(raw.views) && raw.views.some(text))
    )
      add(
        d,
        "error",
        "vscode",
        "VSCODE_INVALID_MAPPING",
        paths.policy,
        name,
        "Represented state requires commands or views.",
      );
    if (!["mapped", "represented", "excluded"].includes(String(raw.state)))
      add(
        d,
        "error",
        "schema",
        "SCHEMA_INVALID",
        paths.policy,
        name,
        "State must be mapped, represented, or excluded.",
      );
    for (const id of ids)
      if (!contributed.has(id))
        add(
          d,
          "error",
          "vscode",
          "VSCODE_INVALID_COMMAND",
          paths.policy,
          id,
          "Mapped extension command is not contributed by package.json.",
        );
    if (raw.state === "excluded")
      add(
        d,
        "info",
        "vscode",
        "VSCODE_EXCLUDED",
        paths.policy,
        name,
        String(raw.reason),
      );
  }
  for (const [name, command] of commands)
    if (!object(cliPolicy[name])) {
      const vscodePolicy =
        object(command.semantics) && object(command.semantics.vscode)
          ? command.semantics.vscode
          : {};
      if (vscodePolicy.expectation === "excluded")
        add(
          d,
          "info",
          "vscode",
          "VSCODE_EXCLUDED",
          paths.contract,
          name,
          String(vscodePolicy.reason),
        );
      else
        add(
          d,
          "error",
          "vscode",
          "VSCODE_PARITY_MISSING",
          paths.policy,
          name,
          "CLI command has no mapping, representation, or exclusion.",
        );
    }
  for (const id of extensionOnly)
    if (!contributed.has(id))
      add(
        d,
        "error",
        "vscode",
        "VSCODE_EXTENSION_ONLY_INVALID",
        paths.policy,
        id,
        "Extension-only command is not contributed.",
      );
  const classified = new Set(extensionOnly);
  for (const raw of Object.values(cliPolicy))
    if (object(raw) && Array.isArray(raw.commands))
      raw.commands.filter(text).forEach((id) => classified.add(id));
  for (const id of contributed)
    if (!classified.has(id))
      add(
        d,
        "error",
        "vscode",
        "VSCODE_COMMAND_UNCLASSIFIED",
        paths.manifest,
        id,
        "Contributed command is neither CLI-backed nor extension-only.",
      );

  await checkTabCompanionSemantics(root, commands, d);

  const focusedChecks = [
    {
      category: "docs" as const,
      checker: paths.docsOptionPolicyCheck,
      cwd: "repos/arashi-docs",
      failureCode: "DOCS_OPTION_POLICY_CHECK_FAILED",
      unreachableCode: "DOCS_OPTION_POLICY_CHECK_UNREACHABLE",
      command: docsAggregate,
    },
    {
      category: "skills" as const,
      checker: paths.skillsOptionPolicyCheck,
      cwd: "repos/arashi-skills",
      failureCode: "SKILLS_OPTION_POLICY_CHECK_FAILED",
      unreachableCode: "SKILLS_OPTION_POLICY_CHECK_UNREACHABLE",
      command: skillsSourceAggregate,
    },
    ...(contract?.schemaVersion === 5
      ? [
          {
            category: "docs" as const,
            checker: paths.docsCliOptionPolicyCheck,
            cwd: "repos/arashi-docs",
            failureCode: "DOCS_CLI_OPTION_POLICY_CHECK_FAILED",
            unreachableCode: "DOCS_CLI_OPTION_POLICY_CHECK_UNREACHABLE",
            command: docsAggregate,
          },
          {
            category: "skills" as const,
            checker: paths.skillsCliOptionPolicyCheck,
            cwd: "repos/arashi-skills",
            failureCode: "SKILLS_CLI_OPTION_POLICY_CHECK_FAILED",
            unreachableCode: "SKILLS_CLI_OPTION_POLICY_CHECK_UNREACHABLE",
            command: skillsSourceAggregate,
          },
        ]
      : []),
    ...(typeof contract?.schemaVersion === "number" &&
    contract.schemaVersion >= 6
      ? [
          {
            category: "docs" as const,
            checker: paths.docsSshAliasCheck,
            cwd: "repos/arashi-docs",
            failureCode: "SSH_ALIAS_GUIDANCE_MISMATCH",
            unreachableCode: "SSH_ALIAS_WORKFLOW_UNWIRED",
            command: docsAggregate,
          },
          {
            category: "skills" as const,
            checker: paths.skillsSshAliasCheck,
            cwd: "repos/arashi-skills",
            failureCode: "SSH_ALIAS_GUIDANCE_MISMATCH",
            unreachableCode: "SSH_ALIAS_WORKFLOW_UNWIRED",
            command: skillsSourceAggregate,
          },
          {
            category: "docs" as const,
            checker: paths.docsCompletionCheck,
            cwd: "repos/arashi-docs",
            failureCode: "DOCS_COMPLETION_CHECK_FAILED",
            unreachableCode: "DOCS_COMPLETION_CHECK_UNREACHABLE",
            command: docsAggregate,
          },
          {
            category: "skills" as const,
            checker: paths.skillsCompletionCheck,
            cwd: "repos/arashi-skills",
            failureCode: "SKILLS_COMPLETION_CHECK_FAILED",
            unreachableCode: "SKILLS_COMPLETION_CHECK_UNREACHABLE",
            command: skillsSourceAggregate,
          },
        ]
      : []),
    ...(typeof contract?.schemaVersion === "number" &&
    contract.schemaVersion >= 7
      ? [
          {
            category: "docs" as const,
            checker: paths.docsCreateBaseCheck,
            cwd: "repos/arashi-docs",
            failureCode: "DOCS_CREATE_BASE_CHECK_FAILED",
            unreachableCode: "DOCS_CREATE_BASE_CHECK_UNREACHABLE",
            command: docsAggregate,
          },
          {
            category: "skills" as const,
            checker: paths.skillsCreateBaseCheck,
            cwd: "repos/arashi-skills",
            failureCode: "SKILLS_CREATE_BASE_CHECK_FAILED",
            unreachableCode: "SKILLS_CREATE_BASE_CHECK_UNREACHABLE",
            command: skillsSourceAggregate,
          },
        ]
      : []),
    ...(contract?.schemaVersion === 8
      ? [
          {
            category: "docs" as const,
            checker: paths.docsConfigureCheck,
            cwd: "repos/arashi-docs",
            failureCode: "DOCS_CONFIGURE_CHECK_FAILED",
            unreachableCode: "DOCS_CONFIGURE_CHECK_UNREACHABLE",
            command: docsAggregate,
          },
          {
            category: "skills" as const,
            checker: paths.skillsConfigureCheck,
            cwd: "repos/arashi-skills",
            failureCode: "SKILLS_CONFIGURE_CHECK_FAILED",
            unreachableCode: "SKILLS_CONFIGURE_CHECK_UNREACHABLE",
            command: skillsSourceAggregate,
          },
        ]
      : []),
  ];
  let workflow = "";
  try {
    workflow = await readFile(join(root, paths.workflow), "utf8");
  } catch {
    // Each focused check below reports the owning category and shared workflow source.
  }
  const workflowRuns = workflowRunSteps(workflow);
  const contractJobRuns =
    workflowJobRunSteps(workflow).find(
      (runs) =>
        directlyRuns(runs, "pnpm contracts:check:ci") ||
        directlyRuns(runs, "pnpm contracts:check"),
    ) ?? [];
  if (
    typeof contract?.schemaVersion === "number" &&
    contract.schemaVersion >= 7
  ) {
    const cliGates = [
      {
        code: "CLI_CREATE_BASE_INSTALL_UNREACHABLE",
        command: "pnpm --dir repos/arashi install --frozen-lockfile",
      },
      {
        code: "CLI_CREATE_BASE_SCHEMA_GENERATION_UNREACHABLE",
        command: "pnpm --dir repos/arashi schema:publish",
      },
      {
        code: "CLI_CREATE_BASE_SCHEMA_CHECK_UNREACHABLE",
        command: "pnpm --dir repos/arashi schema:check",
      },
      {
        code: "CLI_CREATE_BASE_CONTRACT_GENERATION_UNREACHABLE",
        command: "pnpm --dir repos/arashi contract:generate",
      },
      {
        code: "CLI_CREATE_BASE_CONTRACT_CHECK_UNREACHABLE",
        command: "pnpm --dir repos/arashi contract:check",
      },
      {
        code: "CLI_CREATE_BASE_COMPLETION_GENERATION_UNREACHABLE",
        command: "pnpm --dir repos/arashi completion:generate",
      },
      {
        code: "CLI_CREATE_BASE_COMPLETION_CHECK_UNREACHABLE",
        command: "pnpm --dir repos/arashi completion:check",
      },
      {
        code: "CLI_CREATE_BASE_GENERATED_DIFF_UNREACHABLE",
        command:
          "git -C repos/arashi diff --exit-code -- schema/config.schema.json contracts/cli-commands.json contracts/executable-distribution.json src/generated/completions.ts",
      },
    ];
    for (const gate of cliGates)
      if (!directlyRuns(contractJobRuns, gate.command))
        add(
          d,
          "error",
          "schema",
          gate.code,
          paths.workflow,
          gate.command,
          "Meta CI must install the CLI toolchain, regenerate schema/contract/completions, run their canonical checks, and reject generated diffs in the checker job.",
        );
    if (
      !runsInOrder(
        contractJobRuns,
        cliGates.map((gate) => gate.command),
      )
    )
      add(
        d,
        "error",
        "schema",
        "CLI_CREATE_BASE_SEQUENCE_UNREACHABLE",
        paths.workflow,
        "CLI generated contracts",
        "CLI install, schema, contract, completion, freshness, and diff gates must execute in dependency order in the checker job.",
      );

    const docsSequence = [
      "pnpm --dir repos/arashi-docs install --frozen-lockfile",
      docsAggregate,
    ];
    for (const gate of [
      {
        category: "docs" as const,
        code: "DOCS_CREATE_BASE_INSTALL_UNREACHABLE",
        command: docsSequence[0],
      },
      {
        category: "skills" as const,
        code: "SKILLS_CREATE_BASE_PACKAGE_CHECK_UNREACHABLE",
        command: skillsPackageAggregate,
      },
    ])
      if (!directlyRuns(contractJobRuns, gate.command))
        add(
          d,
          "error",
          gate.category,
          gate.code,
          paths.workflow,
          gate.command,
          "Meta CI must install pinned docs dependencies and run the docs, source-skills, and canonical release-package aggregates in the checker job.",
        );
    if (!runsInOrder(contractJobRuns, docsSequence))
      add(
        d,
        "error",
        "docs",
        "DOCS_CREATE_BASE_SEQUENCE_UNREACHABLE",
        paths.workflow,
        "create-base docs",
        "Docs install and the generation-owning fail-closed semantic aggregate must execute in dependency order in the checker job.",
      );
    const skillsSequence = [
      skillsSourceAggregate,
      skillsArchiveCreate,
      skillsArchiveVerify,
      "mkdir package-check",
      skillsArchiveExtract,
      skillsPackageAggregate,
    ];
    if (!runsInOrder(contractJobRuns, skillsSequence))
      add(
        d,
        "error",
        "skills",
        "SKILLS_CREATE_BASE_SEQUENCE_UNREACHABLE",
        paths.workflow,
        "create-base packaged skill",
        "The source checker must precede creation, extraction, and checking of release-shaped skill bytes in the checker job.",
      );

    const triggerPaths = workflowPullRequestPaths(workflow);
    for (const requiredPath of [
      "repos/arashi/src/**",
      "repos/arashi/schema/**",
      "repos/arashi/contracts/**",
      "repos/arashi/.github/workflows/**",
      "repos/arashi-docs/docs/**",
      "repos/arashi-docs/scripts/**",
      "repos/arashi-docs/contracts/**",
      "repos/arashi-docs/.github/workflows/**",
      "repos/arashi-skills/skills/**",
      "repos/arashi-skills/scripts/**",
      "repos/arashi-skills/contracts/**",
      "repos/arashi-skills/.github/workflows/**",
    ])
      if (!triggerPaths.has(requiredPath))
        add(
          d,
          "error",
          "schema",
          "CREATE_BASE_TRIGGER_PATH_UNREACHABLE",
          paths.workflow,
          requiredPath,
          "The coordinated contract workflow pull-request trigger must cover child sources, contracts, and workflow wiring.",
        );
  }
  if (
    typeof contract?.schemaVersion === "number" &&
    contract.schemaVersion >= 6
  ) {
    let cliReadme = "";
    try {
      cliReadme = await readFile(join(root, paths.cliReadme), "utf8");
    } catch {
      // The missing README is reported through the same semantic diagnostic below.
    }
    const normalizedReadme = cliReadme.toLowerCase();
    const readmeRequirements = [
      'eval "$(command aw shell init bash)"',
      "source <(command aw completion bash)",
      'eval "$(command aw shell init zsh)"',
      "source <(command aw completion zsh)",
      "command aw shell init fish | source",
      "command aw completion fish | source",
      "wrapper-only",
      "local and read-only",
      "200 ms whole-query budget",
      "no network requests",
      "hooks",
      "prompts",
      "workspace mutations",
      "child operations",
    ];
    const missingReadmeRequirements = readmeRequirements.filter(
      (requirement) => !normalizedReadme.includes(requirement.toLowerCase()),
    );
    if (missingReadmeRequirements.length > 0)
      add(
        d,
        "error",
        "docs",
        "CLI_README_COMPLETION_INVALID",
        paths.cliReadme,
        "shell completion",
        `CLI README completion guidance is missing: ${missingReadmeRequirements.join(", ")}.`,
      );

    if (contract?.schemaVersion === 6) {
      const cliCompletionGates = [
        {
          code: "CLI_COMPLETION_GENERATION_UNREACHABLE",
          command: "pnpm --dir repos/arashi completion:generate",
        },
        {
          code: "CLI_COMPLETION_FRESHNESS_UNREACHABLE",
          command: "pnpm --dir repos/arashi completion:check",
        },
        {
          code: "CLI_COMPLETION_FRESHNESS_UNREACHABLE",
          command:
            "git -C repos/arashi diff --exit-code -- src/generated/completions.ts",
        },
      ];
      for (const gate of cliCompletionGates)
        if (!directlyRuns(workflowRuns, gate.command))
          add(
            d,
            "error",
            "schema",
            gate.code,
            paths.workflow,
            gate.command,
            "Meta CI must generate completion artifacts, run freshness validation, and reject generated diffs.",
          );
    }
  }
  for (const focused of focusedChecks)
    if (
      !(await exists(join(root, focused.checker))) ||
      !directlyRuns(
        typeof contract?.schemaVersion === "number" &&
          contract.schemaVersion >= 7
          ? contractJobRuns
          : workflowRuns,
        focused.command,
      )
    )
      add(
        d,
        "error",
        focused.category,
        focused.unreachableCode,
        paths.workflow,
        focused.checker,
        `Meta CI must run the owning stable checker aggregate: ${focused.command}.`,
      );
  if (contract?.schemaVersion === 5) {
    const packagedSkillCommands = [
      skillsArchiveCreate,
      skillsArchiveVerify,
      skillsArchiveExtract,
      skillsPackageAggregate,
    ];
    for (const command of packagedSkillCommands)
      if (!directlyRuns(workflowRuns, command))
        add(
          d,
          "error",
          "skills",
          "SKILLS_CLI_OPTION_PACKAGE_CHECK_UNREACHABLE",
          paths.workflow,
          command,
          "Meta CI must create, extract, and validate the release-shaped packaged skill.",
        );
  }
  if (
    typeof contract?.schemaVersion === "number" &&
    contract.schemaVersion >= 6
  ) {
    const packagedCompletionCommands = [
      skillsArchiveCreate,
      skillsArchiveVerify,
      skillsArchiveExtract,
      skillsPackageAggregate,
    ];
    for (const command of packagedCompletionCommands)
      if (!directlyRuns(workflowRuns, command))
        add(
          d,
          "error",
          "skills",
          "SKILLS_COMPLETION_PACKAGE_CHECK_UNREACHABLE",
          paths.workflow,
          command,
          "Meta CI must create, extract, and validate completion guidance in the release-shaped packaged skill.",
        );
  }
  if (
    typeof contract?.schemaVersion === "number" &&
    contract.schemaVersion >= 6
  )
    for (const command of [
      skillsArchiveCreate,
      skillsArchiveVerify,
      skillsArchiveExtract,
      skillsPackageAggregate,
    ])
      if (!directlyRuns(workflowRuns, command))
        add(
          d,
          "error",
          "skills",
          "SSH_ALIAS_PACKAGE_CHECK_UNWIRED",
          paths.workflow,
          command,
          "Meta CI must validate SSH alias guidance in the release-shaped packaged skill.",
        );

  await Promise.all(
    focusedChecks.map((focused) =>
      runFocusedChecker(
        root,
        {
          category: focused.category,
          checker: focused.checker,
          code: focused.failureCode,
          cwd: focused.cwd,
        },
        d,
        options.runFocusedCheckers !== false,
      ),
    ),
  );
  if (
    typeof contract?.schemaVersion === "number" &&
    contract.schemaVersion >= 7 &&
    options.runFocusedCheckers !== false
  )
    await runPackagedCreateBaseChecker(root, d);
  if (
    typeof contract?.schemaVersion === "number" &&
    contract.schemaVersion >= 6 &&
    options.runFocusedCheckers !== false
  ) {
    await runPackagedCompletionChecker(root, d);
  }
  if (contract?.schemaVersion === 8 && options.runFocusedCheckers !== false)
    await runPackagedConfigureChecker(root, d);

  await checkKittyGuidance(root, d);
  await checkAddMaterializationGuidance(root, d);
  if (
    typeof contract?.schemaVersion === "number" &&
    contract.schemaVersion >= 6
  )
    await checkSshAliasDirectGuidance(root, d);

  d.sort((a, b) =>
    [
      a.severity === "error" ? "0" : "1",
      a.category,
      a.code,
      a.subject,
      a.source,
    ]
      .join("\0")
      .localeCompare(
        [
          b.severity === "error" ? "0" : "1",
          b.category,
          b.code,
          b.subject,
          b.source,
        ].join("\0"),
      ),
  );
  return { ok: !d.some((x) => x.severity === "error"), diagnostics: d };
}
export function formatHuman(result: CheckResult): string {
  const lines = result.diagnostics.map(
    (x) =>
      `[${x.severity}] ${x.code} (${x.category}) ${x.subject} — ${x.message} [${x.source}]`,
  );
  lines.push(
    result.ok
      ? `PASS: command contracts agree (${result.diagnostics.length} informational finding(s)).`
      : `FAIL: ${result.diagnostics.filter((x) => x.severity === "error").length} contract error(s).`,
  );
  return lines.join("\n");
}
