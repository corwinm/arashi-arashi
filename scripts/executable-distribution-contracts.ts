import { readFile } from "node:fs/promises";
import { join } from "node:path";

export interface ExecutableDistributionDiagnostic {
  severity: "error";
  category: "distribution" | "docs" | "skills" | "companion";
  code: string;
  source: string;
  message: string;
}

export interface ExecutableDistributionResult {
  ok: boolean;
  diagnostics: ExecutableDistributionDiagnostic[];
}

type JsonObject = Record<string, unknown>;

const paths = {
  contract: "repos/arashi/contracts/executable-distribution.json",
  package: "repos/arashi/package.json",
  releaseWorkflow: "repos/arashi/.github/workflows/verify-aw-release.yml",
  commander: "repos/arashi/contracts/cli-commands.json",
  vscode: "repos/arashi-vscode/contracts/command-policy.json",
  llmsIndex: "repos/arashi-docs/public/llms.txt",
  llmsFull: "repos/arashi-docs/public/llms-full.txt",
} as const;

const expected = {
  posixRelease: ["arashi", "aw"],
  posixInstalled: ["arashi.bin", "arashi", "aw"],
  windowsRelease: [
    "arashi",
    "arashi.ps1",
    "arashi.bat",
    "aw",
    "aw.ps1",
    "aw.bat",
  ],
  windowsInstalled: [
    "arashi.bin.exe",
    "arashi",
    "arashi.ps1",
    "arashi.bat",
    "aw",
    "aw.ps1",
    "aw.bat",
  ],
} as const;

const object = (value: unknown): value is JsonObject =>
  typeof value === "object" && value !== null && !Array.isArray(value);
const strings = (value: unknown): string[] | undefined =>
  Array.isArray(value) && value.every((item) => typeof item === "string")
    ? value
    : undefined;
const equalSet = (value: unknown, expectedValues: readonly string[]) => {
  const actual = strings(value);
  return (
    actual !== undefined &&
    actual.length === new Set(actual).size &&
    JSON.stringify([...actual].sort()) ===
      JSON.stringify([...expectedValues].sort())
  );
};
const equalKeys = (value: unknown, expectedKeys: readonly string[]) =>
  object(value) && equalSet(Object.keys(value), expectedKeys);
const get = (value: unknown, ...keys: string[]): unknown => {
  let current = value;
  for (const key of keys) {
    if (!object(current)) return undefined;
    current = current[key];
  }
  return current;
};

async function json(root: string, path: string): Promise<unknown> {
  return JSON.parse(await readFile(join(root, path), "utf8"));
}

function yamlMappingBlock(
  workflow: string,
  name: string,
  indentation: number,
): string {
  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
  const spaces = " ".repeat(indentation);
  return (
    workflow.match(
      new RegExp(
        `^${spaces}${escapedName}:\\s*\\n(?:(?!^ {0,${indentation}}\\S)[\\s\\S])*`,
        "mu",
      ),
    )?.[0] ?? ""
  );
}

const canonicalContradiction =
  /\b(?:aw\s+(?:is\s+)?(?:now\s+)?(?:the\s+)?canonical(?:\s+command)?|canonical(?:\s+command)?\s+is\s+aw)\b/iu;

const includesAll = (text: string, phrases: readonly string[]) =>
  phrases.every((phrase) => text.includes(phrase));

function collectStrings(value: unknown, result: string[] = []): string[] {
  if (typeof value === "string") result.push(value);
  else if (Array.isArray(value))
    for (const item of value) collectStrings(item, result);
  else if (object(value))
    for (const item of Object.values(value)) collectStrings(item, result);
  return result;
}

export async function checkExecutableDistributionContracts(
  root = process.cwd(),
): Promise<ExecutableDistributionResult> {
  const diagnostics: ExecutableDistributionDiagnostic[] = [];
  const add = (
    category: ExecutableDistributionDiagnostic["category"],
    code: string,
    source: string,
    message: string,
  ) => diagnostics.push({ severity: "error", category, code, source, message });

  let contract: unknown;
  try {
    contract = await json(root, paths.contract);
  } catch (error) {
    add(
      "distribution",
      "EXECUTABLE_CONTRACT_UNREADABLE",
      paths.contract,
      `Executable distribution contract could not be read: ${error instanceof Error ? error.message : String(error)}`,
    );
    return { ok: false, diagnostics };
  }

  if (
    get(contract, "schemaVersion") !== 1 ||
    get(contract, "canonical") !== "arashi"
  )
    add(
      "distribution",
      "EXECUTABLE_IDENTITY_MISMATCH",
      paths.contract,
      "Canonical executable identity must be arashi under schema version 1.",
    );

  const alias = get(contract, "alias");
  if (
    !object(alias) ||
    alias.name !== "aw" ||
    alias.expansion !== "Arashi Workspace"
  )
    add(
      "distribution",
      "EXECUTABLE_ALIAS_EXPANSION_MISMATCH",
      paths.contract,
      "The only executable alias must be aw, expanded as Arashi Workspace.",
    );

  const npmBins = get(contract, "npmBins");
  if (
    !object(npmBins) ||
    !equalKeys(npmBins, ["arashi", "aw"]) ||
    npmBins.arashi !== "./bin/arashi.js" ||
    npmBins.aw !== "./bin/arashi.js"
  )
    add(
      "distribution",
      "EXECUTABLE_NATIVE_DUPLICATION",
      paths.contract,
      "Both npm names must route to one bin/arashi.js entrypoint.",
    );

  if (
    get(contract, "nativeBinaries", "posix") !== "arashi.bin" ||
    !equalSet(get(contract, "posix", "installed"), expected.posixInstalled) ||
    !equalSet(get(contract, "posix", "releaseLaunchers"), expected.posixRelease)
  )
    add(
      "distribution",
      "EXECUTABLE_POSIX_PAYLOAD_MISMATCH",
      paths.contract,
      "POSIX distribution must route arashi and aw wrappers to one arashi.bin payload.",
    );

  if (
    get(contract, "nativeBinaries", "windows") !== "arashi.bin.exe" ||
    !equalSet(
      get(contract, "windows", "installed"),
      expected.windowsInstalled,
    ) ||
    !equalSet(
      get(contract, "windows", "releaseLaunchers"),
      expected.windowsRelease,
    )
  )
    add(
      "distribution",
      "EXECUTABLE_WINDOWS_PAYLOAD_MISMATCH",
      paths.contract,
      "Windows distribution must provide Git Bash, PowerShell, and CMD wrappers for both names around one arashi.bin.exe payload.",
    );

  const markers = get(contract, "ownership", "markers");
  const markerValues = object(markers) ? Object.values(markers) : [];
  if (
    !equalKeys(markers, ["cmd", "posix", "powershell"]) ||
    !markerValues.every((marker) => marker === "arashi-managed-alias:aw:v1") ||
    get(contract, "ownership", "ledger", "name") !==
      ".arashi-managed-entrypoints.json" ||
    get(contract, "ownership", "ledger", "schemaVersion") !== 1 ||
    get(contract, "ownership", "collisionPolicy") !== "marker-and-ledger-hash"
  )
    add(
      "distribution",
      "EXECUTABLE_OWNERSHIP_MISMATCH",
      paths.contract,
      "Direct ownership requires marked wrappers plus a versioned path/hash ledger and fail-closed collision policy.",
    );

  if (
    !equalSet(get(contract, "shellWrapperNames"), ["arashi", "aw"]) ||
    get(contract, "identity", "managedShellBlock") !== "arashi"
  )
    add(
      "distribution",
      "EXECUTABLE_SHELL_MISMATCH",
      paths.contract,
      "One canonical managed shell block must expose guarded arashi and aw wrappers.",
    );
  if (!equalSet(get(contract, "completionNames"), ["arashi", "aw"]))
    add(
      "distribution",
      "EXECUTABLE_COMPLETION_MISMATCH",
      paths.contract,
      "Completion must register the same model for arashi and aw.",
    );

  if (
    get(contract, "identity", "commanderProgramName") !== "arashi" ||
    get(contract, "identity", "configurationVocabulary") !== "arashi" ||
    get(contract, "identity", "environmentPrefix") !== "ARASHI_" ||
    get(contract, "identity", "branding") !== "arashi" ||
    get(contract, "identity", "packageName") !== "arashi"
  )
    add(
      "distribution",
      "EXECUTABLE_CANONICAL_BOUNDARY_MISMATCH",
      paths.contract,
      "Commander, configuration, environment, branding, and package identity remain canonical-only.",
    );

  try {
    const packageJson = await json(root, paths.package);
    const workflow = await readFile(join(root, paths.releaseWorkflow), "utf8");
    const dispatch = yamlMappingBlock(workflow, "workflow_dispatch", 2);
    const inputs = yamlMappingBlock(dispatch, "inputs", 4);
    const versionInput = yamlMappingBlock(inputs, "version", 6);
    const posixJob = yamlMappingBlock(workflow, "verify-aw-posix", 2);
    const windowsJob = yamlMappingBlock(workflow, "verify-aw-windows", 2);
    const windowsStepEvidence = windowsJob
      .split(/\r?\n/u)
      .filter((line) => !/^\s*#/u.test(line))
      .join("\n");
    const posixConsumesDispatchedVersion =
      /release:verify-aw\s+--\s+["']?\$\{\{\s*inputs\.version\s*\}\}["']?/u.test(
        posixJob,
      );
    const windowsBindsDispatchedVersion =
      /^\s*VERIFY_VERSION:\s*["']?\$\{\{\s*inputs\.version\s*\}\}["']?\s*$/mu.test(
        windowsJob,
      );
    const windowsConsumesBoundVersion =
      /release:verify-aw\s+--\s+["']?\$env:VERIFY_VERSION["']?/u.test(
        windowsJob,
      );
    if (
      get(packageJson, "scripts", "release:verify-aw") !==
        "node scripts/release/verify-aw.ts" ||
      !equalKeys(get(packageJson, "bin"), ["arashi", "aw"]) ||
      get(packageJson, "bin", "arashi") !== "./bin/arashi.js" ||
      get(packageJson, "bin", "aw") !== "./bin/arashi.js" ||
      !/^        required:\s*true\s*$/mu.test(versionInput) ||
      /release:verify-aw[^\n]*--\s+["']?latest\b/iu.test(workflow) ||
      !workflow.includes("release:verify-aw") ||
      !workflow.includes("verify-aw-posix") ||
      !posixJob.includes("runs-on: ubuntu-latest") ||
      !workflow.includes("verify-aw-windows") ||
      !windowsJob.includes("runs-on: windows-latest") ||
      !workflow.includes("inputs.version") ||
      !posixConsumesDispatchedVersion ||
      !windowsBindsDispatchedVersion ||
      !windowsConsumesBoundVersion ||
      !windowsStepEvidence.includes("powershell.exe") ||
      !windowsStepEvidence.includes("cmd.exe") ||
      !windowsStepEvidence.includes("bash.exe")
    )
      add(
        "distribution",
        "EXECUTABLE_RELEASE_GATE_MISMATCH",
        paths.releaseWorkflow,
        "Published acceptance must retain shared npm bins and exact-version POSIX/native-Windows stages.",
      );
  } catch (error) {
    add(
      "distribution",
      "EXECUTABLE_RELEASE_GATE_MISMATCH",
      paths.releaseWorkflow,
      String(error),
    );
  }

  try {
    const commander = await json(root, paths.commander);
    const strings = collectStrings(commander);
    const forbidden = strings.some((value) => value === "aw");
    if (forbidden)
      add(
        "companion",
        "EXECUTABLE_COMMANDER_ALIAS_FORBIDDEN",
        paths.commander,
        "aw is a distribution executable and must not appear in Commander command paths or alias metadata.",
      );
  } catch (error) {
    add(
      "companion",
      "EXECUTABLE_COMMANDER_CONTRACT_UNREADABLE",
      paths.commander,
      String(error),
    );
  }

  try {
    const vscode = await json(root, paths.vscode);
    if (collectStrings(vscode).some((value) => value === "aw"))
      add(
        "companion",
        "EXECUTABLE_VSCODE_ALIAS_FORBIDDEN",
        paths.vscode,
        "VS Code command policy is canonical command metadata, not executable alias policy.",
      );
  } catch (error) {
    add(
      "companion",
      "EXECUTABLE_VSCODE_POLICY_UNREADABLE",
      paths.vscode,
      String(error),
    );
  }

  const docsOwnerGroups = [
    [
      "index.mdx",
      "index.md",
      [
        "`aw` means “Arashi Workspace”",
        "`arashi` remains the canonical command",
        "supported installations provide both names",
      ],
    ],
    [
      "getting-started/index.md",
      "getting-started.md",
      [
        "`aw` means “Arashi Workspace”",
        "`arashi` remains the canonical command",
        "macOS/Linux installer provides both `arashi` and `aw`",
        "PowerShell installer provides both `arashi` and `aw`",
        "npm installs provide both `arashi` and `aw`",
        "aw status",
        "unrelated existing `aw` command",
        "on PATH or at the destination",
        "unsupported interim workaround for older releases",
        "no direct-installer ownership ledger",
        "deliberately move or remove",
        "arashi-windows-x64.exe",
        "arashi.ps1",
        "arashi.bat",
        "aw.ps1",
        "aw.bat",
      ],
    ],
    [
      "commands/shell.md",
      "commands/shell.md",
      [
        "both `arashi` and `aw`",
        "one managed block",
        "unrelated `aw` alias or function",
        "command arashi",
      ],
    ],
    [
      "commands/completion.md",
      "commands/completion.md",
      ["both `arashi` and `aw`", "command arashi"],
    ],
    [
      "commands/update.md",
      "commands/update.md",
      ["updates both `arashi` and `aw`", "`arashi` remains canonical"],
    ],
  ] as const;
  for (const [authored, generated, phrases] of docsOwnerGroups) {
    for (const [source, code] of [
      [
        `repos/arashi-docs/docs/${authored}`,
        "EXECUTABLE_AUTHORED_DOCS_MISMATCH",
      ],
      [
        `repos/arashi-docs/public/${generated}`,
        "EXECUTABLE_GENERATED_DOCS_MISMATCH",
      ],
    ] as const) {
      try {
        const text = await readFile(join(root, source), "utf8");
        if (!includesAll(text, phrases) || canonicalContradiction.test(text))
          add(
            "docs",
            code,
            source,
            "Alias documentation drifted in its maintained owning path.",
          );
      } catch (error) {
        add("docs", code, source, String(error));
      }
    }
  }

  const docsRequirements = [
    "Arashi Workspace",
    "canonical",
    "npm",
    "macOS",
    "Linux",
    "Windows",
    "shell integration",
    "completion",
    "destination",
    "PATH",
    "ownership ledger",
    "alias",
    "same native binary",
    "move or remove",
    "arashi-windows-x64.exe",
    "arashi.ps1",
    "arashi.bat",
    "aw.ps1",
    "aw.bat",
  ] as const;

  for (const [source, phrases, code] of [
    [
      paths.llmsIndex,
      ["Arashi Workspace", "canonical", "npm", "macOS", "Linux", "Windows"],
      "EXECUTABLE_LLMS_INDEX_MISMATCH",
    ],
    [paths.llmsFull, docsRequirements, "EXECUTABLE_LLMS_FULL_MISMATCH"],
  ] as const) {
    try {
      const text = await readFile(join(root, source), "utf8");
      if (!includesAll(text, phrases) || canonicalContradiction.test(text))
        add(
          "docs",
          code,
          source,
          "Generated agent-readable alias guidance drifted.",
        );
    } catch (error) {
      add("docs", code, source, String(error));
    }
  }

  const skillRequirements = [
    "Arashi Workspace",
    "canonical",
    "arashi --help",
    "aw",
    "not a Commander command alias or a second command vocabulary",
  ] as const;
  for (const [source, code] of [
    [
      "repos/arashi-skills/skills/arashi/references/tutorial.md",
      "EXECUTABLE_AUTHORED_SKILL_MISMATCH",
    ],
    [
      "package-check/skills/arashi/references/tutorial.md",
      "EXECUTABLE_PACKAGED_SKILL_MISMATCH",
    ],
  ] as const) {
    try {
      const text = await readFile(join(root, source), "utf8");
      if (
        !includesAll(text, skillRequirements) ||
        canonicalContradiction.test(text)
      )
        add(
          "skills",
          code,
          source,
          "Skill guidance must keep canonical arashi discovery while recognizing aw as equivalent shorthand without a duplicate workflow vocabulary.",
        );
    } catch (error) {
      add("skills", code, source, String(error));
    }
  }

  diagnostics.sort((left, right) =>
    `${left.source}\0${left.code}`.localeCompare(
      `${right.source}\0${right.code}`,
    ),
  );
  return { ok: diagnostics.length === 0, diagnostics };
}

export function formatExecutableDistributionResult(
  result: ExecutableDistributionResult,
): string {
  if (result.ok) return "Executable distribution contracts passed.";
  return [
    "Executable distribution contracts failed:",
    ...result.diagnostics.map(
      (diagnostic) =>
        `- [${diagnostic.code}] ${diagnostic.source}: ${diagnostic.message}`,
    ),
  ].join("\n");
}
