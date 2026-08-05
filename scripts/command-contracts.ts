import { access, readFile, readdir } from "node:fs/promises";
import { execFile } from "node:child_process";
import { join, relative } from "node:path";
import { promisify } from "node:util";

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
type Obj = Record<string, unknown>;

const paths = {
  contract: "repos/arashi/contracts/cli-commands.json",
  cliCreateConfig: "repos/arashi/contracts/create-launch-config.json",
  cliKittySessions: "repos/arashi/contracts/kitty-worktree-sessions.json",
  configSchema: "repos/arashi/schema/config.schema.json",
  docs: "repos/arashi-docs/docs/commands",
  docsCreateConfig: "repos/arashi-docs/contracts/create-launch-config.json",
  docsKittySessions: "repos/arashi-docs/contracts/kitty-worktree-sessions.json",
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
  docsTabPolicy: "repos/arashi-docs/docs/workflows/launch-disposition.md",
  skillsOptionPolicyCheck:
    "repos/arashi-skills/scripts/tab-launch-disposition-guidance-selftest.mjs",
  skillsTabPolicy: "repos/arashi-skills/skills/arashi/references/commands.md",
} as const;
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
  "`arashi remove` does not close Kitty windows or sessions",
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
    source: "repos/arashi-skills/skills/arashi/references/commands.md",
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
              ...(/(?:For `switch`|`switch --tab`(?: request)? expresses)[^\n]*bypasses configured launcher defaults/i.test(
                scoped,
              )
                ? ["configured-launcher"]
                : []),
            ].sort(),
    };
  }

  if (kind === "skills") {
    const envelopes = [
      ...scoped.matchAll(/```json\s*\n([\s\S]*?)\n```/g),
    ].flatMap((match) => {
      try {
        return [JSON.parse(match[1]) as unknown];
      } catch {
        return [];
      }
    });
    for (const command of ["create", "switch"] as const) {
      const envelope = envelopes.find(
        (value) => object(value) && value.command === command,
      );
      if (
        !object(envelope) ||
        !object(envelope.error) ||
        !object(envelope.error.details) ||
        envelope.error.code !== "JSON_UNSUPPORTED_FOR_MODE" ||
        envelope.error.details.mode !== commands[command].mode
      )
        return undefined;
    }
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
    {
      category: "skills",
      code: "SKILLS_TAB_POLICY_MISMATCH",
      source: paths.skillsTabPolicy,
    },
  ];
  const terminalGuidance = [
    "press Command-T manually, then run `arashi switch --cd`",
    "requires active Arashi shell integration",
    "when automatic launcher resolution selects Terminal.app",
  ];
  const invalidTerminalGuidance =
    'cd "$(arashi switch --no-cd --no-default-launch)"';
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
      else if (entry.name.endsWith(".md")) result.push(child);
    }
  }
  try {
    await walk(directory);
  } catch {
    /* Missing tree is diagnosed through coverage/reference checks. */
  }
  return result.sort();
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
      else if (directField?.[1] === "run") current.run = directField[2].trim();
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

const directlyRuns = (runs: string[], command: string): boolean =>
  runs.some((run) =>
    run
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0 && !line.startsWith("#"))
      .some((line) => line === command),
  );

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
  },
  diagnostics: Diagnostic[],
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
  try {
    await execFileAsync(
      process.execPath,
      [relative(checker.cwd, checker.checker)],
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

export async function checkContracts(
  root = process.cwd(),
): Promise<CheckResult> {
  const d: Diagnostic[] = [];
  const contract = await json(root, paths.contract, d);
  const cliCreateConfig = await json(root, paths.cliCreateConfig, d);
  const cliKittySessions = await json(root, paths.cliKittySessions, d);
  const configSchema = await json(root, paths.configSchema, d);
  const docsCreateConfig = await json(root, paths.docsCreateConfig, d);
  const docsKittySessions = await json(root, paths.docsKittySessions, d);
  const docsSwitchConfig = await json(root, paths.docsSwitchConfig, d);
  const coverage = await json(root, paths.coverage, d);
  const skillsCreateConfig = await json(root, paths.skillsCreateConfig, d);
  const skillsKittySessions = await json(root, paths.skillsKittySessions, d);
  const skillsSwitchConfig = await json(root, paths.skillsSwitchConfig, d);
  const policy = await json(root, paths.policy, d);
  const manifest = await json(root, paths.manifest, d);
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
  if (editorCreate.$ref !== "#/definitions/CreateCommandDefaults")
    add(
      d,
      "error",
      "schema",
      "CREATE_CONFIG_MISMATCH",
      paths.configSchema,
      "editorCreate",
      "EditorCommandDefaults.create must reference CreateCommandDefaults.",
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
  version(contract, paths.contract, d, 4);
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
      if (!(await exists(join(root, paths.docs, `${name}.md`))))
        add(
          d,
          "error",
          "docs",
          "DOCS_PAGE_MISSING",
          `${paths.docs}/${name}.md`,
          name,
          "Required canonical command page is missing.",
        );
      if (!new RegExp(`(?:\\./|/)?commands/${name}(?:\\.md|/|\\))`).test(index))
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
        !policyOptions.every((candidate) => commandOptions.includes(candidate))
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
      command: "pnpm --dir repos/arashi-docs validate:tab-launch-docs",
    },
    {
      category: "skills" as const,
      checker: paths.skillsOptionPolicyCheck,
      cwd: "repos/arashi-skills",
      failureCode: "SKILLS_OPTION_POLICY_CHECK_FAILED",
      unreachableCode: "SKILLS_OPTION_POLICY_CHECK_UNREACHABLE",
      command:
        "node repos/arashi-skills/scripts/tab-launch-disposition-guidance-selftest.mjs",
    },
  ];
  let workflow = "";
  try {
    workflow = await readFile(join(root, paths.workflow), "utf8");
  } catch {
    // Each focused check below reports the owning category and shared workflow source.
  }
  const workflowRuns = workflowRunSteps(workflow);
  for (const focused of focusedChecks)
    if (
      !(await exists(join(root, focused.checker))) ||
      !directlyRuns(workflowRuns, focused.command)
    )
      add(
        d,
        "error",
        focused.category,
        focused.unreachableCode,
        paths.workflow,
        focused.checker,
        `Meta CI must directly run the owning focused checker: ${focused.command}.`,
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
      ),
    ),
  );

  await checkKittyGuidance(root, d);

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
