import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export interface HookContractDiagnostic {
  severity: "error";
  category: "cli" | "docs" | "generated" | "skills" | "meta";
  code: string;
  source: string;
  message: string;
}

export interface HookContractResult {
  ok: boolean;
  diagnostics: HookContractDiagnostic[];
}

type OwningCheckerRunner = (
  command: string,
  args: string[],
  options: { cwd: string; encoding: "utf8"; env: NodeJS.ProcessEnv },
) => {
  error?: Error;
  signal?: NodeJS.Signals | null;
  status: number | null;
  stderr: string;
  stdout: string;
};

const surfaces = [
  { source: "repos/arashi/src/commands/init.ts", category: "cli" },
  { source: "repos/arashi/docs/hooks.md", category: "cli" },
  { source: "repos/arashi-docs/docs/reference/hooks.md", category: "docs" },
  { source: "repos/arashi-docs/public/llms-full.txt", category: "generated" },
  {
    source: "repos/arashi-skills/skills/arashi/references/hooks.md",
    category: "skills",
  },
] as const;

const guidanceSurfaces = new Set(surfaces.slice(1).map(({ source }) => source));
const repositoryRemoveAliasSurfaces = new Set([
  "repos/arashi/docs/hooks.md",
  "repos/arashi-docs/docs/reference/hooks.md",
  "repos/arashi-docs/public/llms-full.txt",
  "repos/arashi-skills/skills/arashi/references/hooks.md",
]);
const hookInputGuidanceSurfaces = new Set(surfaces.map(({ source }) => source));
const hookInputModes = ["tty", "disabled", "unavailable"] as const;
const docsAggregate = "pnpm --dir repos/arashi-docs validate:semantic-docs";
const skillsSourceAggregate =
  "node repos/arashi-skills/scripts/validate-guidance.mjs";
const skillsArchiveCreate =
  "node repos/arashi-skills/scripts/create-release-archive.mjs --root repos/arashi-skills --output arashi-skill-package.tar.gz";
const skillsArchiveVerify =
  "node repos/arashi-skills/scripts/create-release-archive.mjs --verify arashi-skill-package.tar.gz";
const skillsPackageAggregate =
  "node repos/arashi-skills/scripts/validate-guidance.mjs --skill-root package-check/skills/arashi";
const publicOutcomeFields = [
  "hookName",
  "scope",
  "workspaceMode",
  "hookStatus",
  "reasonCode",
  "message",
  "repositoryId",
  "sourceKind",
  "sourceOwnerKind",
  "sourceOwnerName",
  "sourceScriptPath",
  "executionPath",
  "targetRepositoryName",
  "targetRepositoryPath",
  "targetWorktreePath",
  "durationMs",
] as const;
type Obj = Record<string, unknown>;
const object = (value: unknown): value is Obj =>
  typeof value === "object" && value !== null && !Array.isArray(value);
const strings = (value: unknown): string[] | undefined =>
  Array.isArray(value) && value.every((item) => typeof item === "string")
    ? value
    : undefined;
const sameStrings = (actual: unknown, expected: readonly string[]): boolean => {
  const values = strings(actual);
  return (
    values !== undefined && JSON.stringify(values) === JSON.stringify(expected)
  );
};
const sameKeys = (actual: Obj, expected: readonly string[]): boolean =>
  sameStrings(Object.keys(actual).sort(), [...expected].sort());
const workflowJobBlocks = (content: string): string[] => {
  const blocks: string[] = [];
  let current: string[] | undefined;
  let inJobs = false;
  for (const line of content.split("\n")) {
    if (line === "jobs:") {
      inJobs = true;
      continue;
    }
    if (!inJobs) continue;
    if (/^\S/.test(line)) break;
    if (/^  [A-Za-z0-9_-]+:\s*$/.test(line)) {
      if (current) blocks.push(current.join("\n"));
      current = [line];
    } else if (current) {
      current.push(line);
    }
  }
  if (current) blocks.push(current.join("\n"));
  return blocks;
};
const workflowRunSteps = (workflow: string): string[] => {
  const lines = workflow.split(/\r?\n/);
  const runs: string[] = [];
  let jobsIndent = -1;
  let jobIndent = -1;
  let stepsIndent = -1;
  let stepIndent = -1;
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (/^\s*(?:#.*)?$/.test(line)) continue;
    const indent = line.match(/^\s*/)?.[0].length ?? 0;
    if (/^\s*jobs:\s*(?:#.*)?$/.test(line)) {
      jobsIndent = indent;
      jobIndent = -1;
      stepsIndent = -1;
      stepIndent = -1;
      continue;
    }
    if (jobsIndent < 0) continue;
    if (indent <= jobsIndent) {
      jobsIndent = -1;
      continue;
    }
    if (jobIndent < 0 && /^\s*[A-Za-z0-9_-]+:\s*(?:#.*)?$/.test(line)) {
      jobIndent = indent;
      continue;
    }
    if (
      jobIndent >= 0 &&
      indent === jobIndent &&
      /^\s*[A-Za-z0-9_-]+:/.test(line)
    ) {
      stepsIndent = -1;
      stepIndent = -1;
      continue;
    }
    if (jobIndent < 0 || indent <= jobIndent) continue;
    if (/^\s*steps:\s*(?:#.*)?$/.test(line)) {
      stepsIndent = indent;
      stepIndent = -1;
      continue;
    }
    if (stepsIndent < 0 || indent <= stepsIndent) continue;
    const step = line.match(/^\s*-\s+(.*)$/);
    if (step) {
      if (stepIndent < 0) stepIndent = indent;
      if (indent !== stepIndent) continue;
      const directRun = step[1].match(/^run:\s*(.*)$/);
      if (!directRun) continue;
      const value = directRun[1].trim();
      if (!["|", "|-", "|+", ">", ">-", ">+"].includes(value)) {
        runs.push(value);
        continue;
      }
      const block: string[] = [];
      while (index + 1 < lines.length) {
        const next = lines[index + 1];
        const nextIndent = next.match(/^\s*/)?.[0].length ?? 0;
        if (next.trim() && nextIndent <= indent) break;
        index += 1;
        if (next.trim()) block.push(next.trim());
      }
      runs.push(block.join("\n"));
      continue;
    }
    if (stepIndent < 0 || indent !== stepIndent + 2) continue;
    const field = line.match(/^\s*run:\s*(.*)$/);
    if (!field) continue;
    const value = field[1].trim();
    if (!["|", "|-", "|+", ">", ">-", ">+"].includes(value)) {
      runs.push(value);
      continue;
    }
    const block: string[] = [];
    while (index + 1 < lines.length) {
      const next = lines[index + 1];
      const nextIndent = next.match(/^\s*/)?.[0].length ?? 0;
      if (next.trim() && nextIndent <= indent) break;
      index += 1;
      if (next.trim()) block.push(next.trim());
    }
    runs.push(block.join("\n"));
  }
  return runs;
};
const workflowCommandLines = (runs: string[]): string[] =>
  runs.flatMap((run) =>
    run
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0 && !line.startsWith("#")),
  );
const directlyRuns = (runs: string[], command: string): boolean =>
  workflowCommandLines(runs).includes(command);
const dogfoodPostCreateHooks = [
  ".arashi/hooks/post-create.arashi.sh",
  ".arashi/hooks/post-create.arashi-docs.sh",
  ".arashi/hooks/post-create.arashi-presentation.sh",
  ".arashi/hooks/post-create.arashi-vscode.sh",
] as const;

function addDiagnostic(
  diagnostics: HookContractDiagnostic[],
  category: HookContractDiagnostic["category"],
  code: string,
  source: string,
  message: string,
) {
  diagnostics.push({ category, code, message, severity: "error", source });
}

function addMetaDiagnostic(
  diagnostics: HookContractDiagnostic[],
  code: string,
  source: string,
  message: string,
) {
  diagnostics.push({
    category: "meta",
    code,
    message,
    severity: "error",
    source,
  });
}

function repositoryRemoveAliasContractDefects(content: string): string[] {
  const plain = content.replaceAll("`", "").replace(/\s+/g, " ");
  const lower = plain.toLowerCase();
  const requirements: Array<[string, boolean]> = [
    [
      "canonical configuration-root qualified filename",
      lower.includes(
        "<configurationroot>/.arashi/hooks/<lifecycle>.<repo><ext>",
      ),
    ],
    [
      "compatible active-repository local alias",
      lower.includes("<active-repository>/.arashi/hooks/<lifecycle><ext>"),
    ],
    [
      "inline repository alias",
      lower.includes("repos.<repo>.hooks.<lifecycle>"),
    ],
    [
      "one repository slot with fail-closed collision",
      /three alternatives for one repository slot[^.]*exactly zero or one[^.]*collision[^.]*fails before[^.]*(?:hook|removal) mutation/i.test(
        plain,
      ),
    ],
    [
      "plain lifecycle identity and repository ownership",
      /plain pre-remove or post-remove lifecycle identity[^.]*repository scope[^.]*owner <repo>/i.test(
        plain,
      ),
    ],
    [
      "target-checkout cwd and separate source identity",
      /active target repository source checkout as cwd[^.]*arashi_hook_execution_path[^.]*arashi_hook_source_path[^.]*selected file independently of cwd/i.test(
        plain,
      ),
    ],
    [
      "configuration-root onboarding destination",
      /repository hook onboarding[^.]*qualified create and remove files beneath the active configuration root[^.]*never into the target checkout or canonical clone/i.test(
        plain,
      ),
    ],
    [
      "direct, bare, linked, and linked-bare topology",
      /direct non-bare, configured bare, ordinary linked, and linked worktrees backed by a configured bare authority[^.]*configuration authority[^.]*active target checkout/i.test(
        plain,
      ),
    ],
    [
      "exact delete ownership",
      /deletion owns only exact pre-create\.<repo>, post-create\.<repo>, pre-remove\.<repo>, and post-remove\.<repo>[^.]*exact \.example templates/i.test(
        plain,
      ) &&
        /never glob-deletes[^.]*compatible repository-local[^.]*shared workspace[^.]*user-global hooks/i.test(
          plain,
        ),
    ],
    [
      "doctor and dry-run shared non-executing resolver",
      /doctor and remove dry-run use the runtime resolver without execution/i.test(
        plain,
      ),
    ],
    [
      "bounded ordered all-native ambiguity paths",
      /hook_ambiguous reports hookname, scope, sourcekinds, sourceownerkind, sourceownername, nullable sourcescriptpath, and de-duplicated sourcescriptpaths: at most six native paths ordered canonical workspace-owned location first, compatible repository-local location second, then established platform extension order within each location/i.test(
        plain,
      ),
    ],
  ];
  return requirements.filter(([, present]) => !present).map(([label]) => label);
}

function contradictsRepositoryRemoveAliases(content: string): boolean {
  return content
    .replaceAll("`", "")
    .split(/(?<=[.!?])\s+|\n+/)
    .map((statement) => statement.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .some(
      (statement) =>
        /both repository files|canonical[^.]*compatible|workspace-owned[^.]*repository-local/i.test(
          statement,
        ) &&
        (/(?:prefers?|takes precedence|wins|falls back to)[^.]*repository-local/i.test(
          statement,
        ) ||
          /executes? both|both hooks? (?:execute|run)/i.test(statement)),
    );
}

export function checkOwningHookContracts(
  root: string,
  runner: OwningCheckerRunner = spawnSync,
): HookContractDiagnostic[] {
  const diagnostics: HookContractDiagnostic[] = [];
  const checks = [
    {
      args: ["--dir", "repos/arashi", "contract:check"],
      category: "cli" as const,
      command: "pnpm",
      source: "repos/arashi/package.json#scripts.contract:check",
    },
    {
      args: ["--dir", "repos/arashi-docs", "validate:semantic-docs"],
      category: "docs" as const,
      command: "pnpm",
      source: "repos/arashi-docs/package.json#scripts.validate:semantic-docs",
    },
    {
      args: [join(root, "repos/arashi-skills/scripts/validate-guidance.mjs")],
      category: "skills" as const,
      command: process.execPath,
      source: "repos/arashi-skills/scripts/validate-guidance.mjs",
    },
  ];
  for (const check of checks) {
    const result = runner(check.command, check.args, {
      cwd: root,
      encoding: "utf8",
      env: { ...process.env, NO_COLOR: "1" },
    });
    if (result.status === 0 && !result.error && !result.signal) continue;
    addDiagnostic(
      diagnostics,
      check.category,
      "HOOK_OWNING_CHECKER_FAILED",
      check.source,
      result.error?.message ??
        (result.signal
          ? `Owning checker terminated by ${result.signal}.`
          : `Owning checker exited with status ${result.status}: ${(result.stderr || result.stdout).trim()}`),
    );
  }
  return diagnostics;
}

export async function checkHookContracts(
  root: string,
): Promise<HookContractResult> {
  const diagnostics: HookContractDiagnostic[] = [];
  const workflowSource = ".github/workflows/cross-repo-command-contracts.yml";
  let workflowContent = "";
  try {
    workflowContent = await readFile(join(root, workflowSource), "utf8");
  } catch (error) {
    addMetaDiagnostic(
      diagnostics,
      "HOOK_DOGFOOD_WORKFLOW_MISSING",
      workflowSource,
      error instanceof Error ? error.message : String(error),
    );
  }
  for (const hookSource of dogfoodPostCreateHooks) {
    const repository = hookSource
      .replace(".arashi/hooks/post-create.", "")
      .replace(".sh", "");
    if (!workflowContent.includes(`path: meta/repos/${repository}`)) {
      addMetaDiagnostic(
        diagnostics,
        "HOOK_DOGFOOD_REPOSITORY_UNAVAILABLE",
        workflowSource,
        `Check out ${repository} so its local pnpm workspace policy is available to the contract checker.`,
      );
    }
  }
  const workflowRuns = workflowRunSteps(workflowContent);
  const requiredWorkflowChecks = [
    {
      code: "HOOK_INPUT_CHECKER_UNREACHABLE",
      command: "pnpm contracts:check:ci",
      message:
        "The authoritative workflow must execute the aggregate contract checker that includes hook semantics.",
    },
    {
      code: "HOOK_INPUT_DOCS_CHECK_UNREACHABLE",
      command: docsAggregate,
      message:
        "The authoritative workflow must execute the stable docs semantic aggregate that includes lifecycle hooks.",
    },
    {
      code: "HOOK_INPUT_SKILLS_SOURCE_CHECK_UNREACHABLE",
      command: skillsSourceAggregate,
      message:
        "The authoritative workflow must check lifecycle-hook guidance through the source skills aggregate.",
    },
    {
      code: "HOOK_INPUT_SKILLS_PACKAGE_CHECK_UNREACHABLE",
      command: skillsPackageAggregate,
      message:
        "The authoritative workflow must check lifecycle-hook guidance through the extracted-package skills aggregate.",
    },
  ];
  for (const check of requiredWorkflowChecks) {
    if (!directlyRuns(workflowRuns, check.command)) {
      addMetaDiagnostic(diagnostics, check.code, workflowSource, check.message);
    }
  }

  const packagedSkillCheck = skillsPackageAggregate;
  const packagedSkillJobRuns = workflowJobBlocks(workflowContent)
    .map((job) => workflowRunSteps(`jobs:\n${job}`))
    .find((runs) => directlyRuns(runs, packagedSkillCheck));
  const packagedSkillCommands = workflowCommandLines(
    packagedSkillJobRuns ?? [],
  );
  const packagedSkillCheckIndex =
    packagedSkillCommands.indexOf(packagedSkillCheck);
  const packagedSkillPrerequisites = [
    {
      code: "HOOK_INPUT_SKILLS_ARCHIVE_CREATION_UNREACHABLE",
      command: skillsArchiveCreate,
      message:
        "The authoritative workflow must create the canonical release archive before packaged lifecycle-hook validation.",
    },
    {
      code: "HOOK_INPUT_SKILLS_ARCHIVE_VERIFICATION_UNREACHABLE",
      command: skillsArchiveVerify,
      message:
        "The authoritative workflow must verify the canonical release archive before packaged lifecycle-hook validation.",
    },
    {
      code: "HOOK_INPUT_SKILLS_PACKAGE_DESTINATION_UNREACHABLE",
      command: "mkdir package-check",
      message:
        "The authoritative workflow must create the package-check extraction destination before packaged lifecycle-hook validation.",
    },
    {
      code: "HOOK_INPUT_SKILLS_PACKAGE_EXTRACTION_UNREACHABLE",
      command: "tar -xzf arashi-skill-package.tar.gz -C package-check",
      message:
        "The authoritative workflow must extract the release-shaped skill archive before packaged lifecycle-hook validation.",
    },
  ];
  for (const prerequisite of packagedSkillPrerequisites) {
    const prerequisiteIndex = packagedSkillCommands.indexOf(
      prerequisite.command,
    );
    if (
      prerequisiteIndex < 0 ||
      packagedSkillCheckIndex < 0 ||
      prerequisiteIndex >= packagedSkillCheckIndex
    ) {
      addMetaDiagnostic(
        diagnostics,
        prerequisite.code,
        workflowSource,
        prerequisite.message,
      );
    }
  }
  const packagedSkillSequence = [
    ...packagedSkillPrerequisites.map(({ command }) => command),
    packagedSkillCheck,
  ].map((command) => packagedSkillCommands.indexOf(command));
  if (
    packagedSkillSequence.every((index) => index >= 0) &&
    packagedSkillSequence.some(
      (index, position) =>
        position > 0 && index <= packagedSkillSequence[position - 1],
    )
  ) {
    addMetaDiagnostic(
      diagnostics,
      "HOOK_INPUT_SKILLS_PACKAGE_PREREQUISITE_ORDER_INVALID",
      workflowSource,
      "The authoritative workflow must create and verify the release-shaped archive, create its destination, extract it, and then validate the extracted package in that order within one job.",
    );
  }

  const cliWorkflowSource = "repos/arashi/.github/workflows/ci.yml";
  try {
    const cliWorkflow = await readFile(join(root, cliWorkflowSource), "utf8");
    const jobs = workflowJobBlocks(cliWorkflow);
    if (
      !jobs.some(
        (job) =>
          job.includes("hook-input-wrapper") && job.includes("ubuntu-latest"),
      )
    ) {
      addMetaDiagnostic(
        diagnostics,
        "HOOK_INPUT_WRAPPER_ACCEPTANCE_UNREACHABLE",
        cliWorkflowSource,
        "Installed wrapper hook-input acceptance must run on a POSIX CI host.",
      );
    }
    if (
      !jobs.some(
        (job) =>
          job.includes("hook-input-native") &&
          job.includes("windows-latest") &&
          /hook-input[^\n]*\.ps1/i.test(job),
      )
    ) {
      addMetaDiagnostic(
        diagnostics,
        "HOOK_INPUT_WINDOWS_ACCEPTANCE_UNREACHABLE",
        cliWorkflowSource,
        "A terminal-capable native PowerShell/cmd hook-input fixture must run on windows-latest.",
      );
    }
  } catch (error) {
    addMetaDiagnostic(
      diagnostics,
      "HOOK_INPUT_WINDOWS_ACCEPTANCE_UNREACHABLE",
      cliWorkflowSource,
      error instanceof Error ? error.message : String(error),
    );
    addMetaDiagnostic(
      diagnostics,
      "HOOK_INPUT_WRAPPER_ACCEPTANCE_UNREACHABLE",
      cliWorkflowSource,
      error instanceof Error ? error.message : String(error),
    );
  }

  const wrapperAcceptanceSource =
    "repos/arashi/tests/integration/hook-input-wrapper.test.ts";
  try {
    const content = await readFile(join(root, wrapperAcceptanceSource), "utf8");
    const wrapperEntrypoints = [
      "bin/arashi",
      "bin/arashi.js",
      "bin/arashi.ps1",
      "bin/arashi.bat",
    ];
    if (
      !wrapperEntrypoints.every((entrypoint) => content.includes(entrypoint))
    ) {
      addDiagnostic(
        diagnostics,
        "cli",
        "HOOK_INPUT_WRAPPER_SURFACE_MISSING",
        wrapperAcceptanceSource,
        "Wrapper acceptance must cover POSIX, JavaScript, PowerShell, and batch package entrypoints.",
      );
    }
  } catch (error) {
    addDiagnostic(
      diagnostics,
      "cli",
      "HOOK_INPUT_WRAPPER_SURFACE_MISSING",
      wrapperAcceptanceSource,
      error instanceof Error ? error.message : String(error),
    );
  }

  const windowsAcceptanceSource =
    "repos/arashi/tests/windows/hook-input-native.ps1";
  try {
    const content = await readFile(join(root, windowsAcceptanceSource), "utf8");
    const lower = content.toLowerCase();
    if (!lower.includes("read-host")) {
      addDiagnostic(
        diagnostics,
        "cli",
        "HOOK_INPUT_WINDOWS_POWERSHELL_ACCEPTANCE_MISSING",
        windowsAcceptanceSource,
        "Native Windows acceptance must exercise PowerShell Read-Host.",
      );
    }
    if (!lower.includes("set /p")) {
      addDiagnostic(
        diagnostics,
        "cli",
        "HOOK_INPUT_WINDOWS_CMD_ACCEPTANCE_MISSING",
        windowsAcceptanceSource,
        "Native Windows acceptance must exercise cmd set /p.",
      );
    }
    if (
      !lower.includes("arashi-windows-x64.exe") ||
      !lower.includes("disabled") ||
      !lower.includes("unavailable") ||
      !lower.includes("immediate eof")
    ) {
      addDiagnostic(
        diagnostics,
        "cli",
        "HOOK_INPUT_WINDOWS_BUILT_EOF_ACCEPTANCE_MISSING",
        windowsAcceptanceSource,
        "Native Windows acceptance must use the built CLI and cover disabled/unavailable immediate EOF.",
      );
    }
  } catch (error) {
    addDiagnostic(
      diagnostics,
      "cli",
      "HOOK_INPUT_WINDOWS_BUILT_EOF_ACCEPTANCE_MISSING",
      windowsAcceptanceSource,
      error instanceof Error ? error.message : String(error),
    );
  }

  const commandContractSource = "repos/arashi/contracts/cli-commands.json";
  try {
    const contract = JSON.parse(
      await readFile(join(root, commandContractSource), "utf8"),
    ) as unknown;
    const commands =
      object(contract) && Array.isArray(contract.commands)
        ? contract.commands.filter(object)
        : [];
    const owners = commands
      .flatMap((command) => {
        const options = Array.isArray(command.options)
          ? command.options.filter(object)
          : [];
        return options
          .filter(
            (option) =>
              option.long === "--no-hook-input" ||
              (typeof option.flags === "string" &&
                option.flags.includes("--no-hook-input")),
          )
          .map(() => command.path);
      })
      .filter((path): path is string => typeof path === "string")
      .sort();
    if (!sameStrings(owners, ["create", "remove"])) {
      addDiagnostic(
        diagnostics,
        "cli",
        "HOOK_INPUT_OPTION_OWNERSHIP",
        commandContractSource,
        "--no-hook-input must be owned by exactly create and remove.",
      );
    }
    for (const commandName of ["create", "remove"] as const) {
      const command = commands.find(
        (candidate) => candidate.path === commandName,
      );
      const options =
        command && Array.isArray(command.options)
          ? command.options.filter(object)
          : [];
      const option = options.find(
        (candidate) => candidate.long === "--no-hook-input",
      );
      const policy =
        option && object(option.semanticPolicy)
          ? option.semanticPolicy
          : undefined;
      const hookInput =
        policy && object(policy.hookInput) ? policy.hookInput : undefined;
      const longs = options
        .map((candidate) => candidate.long)
        .filter((value): value is string => typeof value === "string");
      if (
        !policy ||
        !sameKeys(policy, ["hookInput", "ownership", "persisted"]) ||
        policy.ownership !== "command" ||
        policy.persisted !== false ||
        !hookInput ||
        !sameKeys(hookInput, [
          "disabledMode",
          "immediateEof",
          "jsonPrecedence",
          "modes",
          "skipsHooks",
        ]) ||
        hookInput.skipsHooks !== false ||
        (commandName === "create" &&
          (!longs.includes("--no-hooks") || !longs.includes("--interactive")))
      ) {
        addDiagnostic(
          diagnostics,
          "cli",
          "HOOK_INPUT_POLICY_INVALID",
          commandContractSource,
          `${commandName} must publish command-owned, invocation-only semantics that neither skip hooks nor replace create selection.`,
        );
      }
      if (!hookInput || !sameStrings(hookInput.modes, hookInputModes)) {
        addDiagnostic(
          diagnostics,
          "cli",
          "HOOK_INPUT_MODES_INVALID",
          commandContractSource,
          `${commandName} must publish exactly tty, disabled, and unavailable.`,
        );
      }
      if (!hookInput || hookInput.jsonPrecedence !== true) {
        addDiagnostic(
          diagnostics,
          "cli",
          "HOOK_INPUT_JSON_PRECEDENCE",
          commandContractSource,
          `${commandName} must publish JSON-first hook-input precedence.`,
        );
      }
      if (
        !hookInput ||
        hookInput.disabledMode !== "disabled" ||
        hookInput.immediateEof !== true
      ) {
        addDiagnostic(
          diagnostics,
          "cli",
          "HOOK_INPUT_STDIN_INVALID",
          commandContractSource,
          `${commandName} must publish disabled mode and immediate EOF outside TTY input.`,
        );
      }
    }
  } catch (error) {
    addDiagnostic(
      diagnostics,
      "cli",
      "HOOK_INPUT_COMMAND_CONTRACT_INVALID",
      commandContractSource,
      error instanceof Error ? error.message : String(error),
    );
  }

  for (const surface of surfaces) {
    let content: string;
    try {
      content = await readFile(join(root, surface.source), "utf8");
    } catch (error) {
      diagnostics.push({
        severity: "error",
        category: surface.category,
        code: "HOOK_SURFACE_MISSING",
        source: surface.source,
        message: error instanceof Error ? error.message : String(error),
      });
      continue;
    }

    const mentionsStaleBranchAlias = /\bARASHI_BRANCH\b/.test(content);
    const mentionsBaseBranchAlias = content.includes("ARASHI_BASE_BRANCH");
    const explicitlyRejectsStaleBranchAlias = content.includes(
      "`ARASHI_BRANCH` and `ARASHI_BASE_BRANCH` are not compatibility aliases",
    );
    const explicitlyRejectsBaseBranchAlias =
      explicitlyRejectsStaleBranchAlias ||
      /(?:does not|doesn't|must not|never)\s+(?:provide|expose|set)[^.!?\n]*`?ARASHI_BASE_BRANCH`?[^.!?\n]*(?:hook|environment variable)/i.test(
        content,
      );
    if (
      (mentionsStaleBranchAlias && !explicitlyRejectsStaleBranchAlias) ||
      (mentionsBaseBranchAlias && !explicitlyRejectsBaseBranchAlias)
    ) {
      diagnostics.push({
        severity: "error",
        category: surface.category,
        code: "HOOK_STALE_BRANCH_ALIAS",
        source: surface.source,
        message:
          "Use ARASHI_BRANCH_NAME; stale branch aliases are not runtime context.",
      });
    }
    if (!content.includes("ARASHI_REMOVE_TARGETS_JSON")) {
      diagnostics.push({
        severity: "error",
        category: surface.category,
        code: "HOOK_STRUCTURED_TARGETS_MISSING",
        source: surface.source,
        message: "Structured multi-target remove guidance is missing.",
      });
    }

    if (hookInputGuidanceSurfaces.has(surface.source)) {
      const lower = content.toLowerCase();
      if (
        !content.includes("--no-hook-input") ||
        !/(?:invocation-(?:only|scoped)|for (?:that|the current) invocation)/i.test(
          content,
        ) ||
        !content.includes("--no-hooks") ||
        !content.includes("--interactive")
      ) {
        addDiagnostic(
          diagnostics,
          surface.category,
          "HOOK_INPUT_GUIDANCE_POLICY_MISSING",
          surface.source,
          "Guidance must distinguish the invocation-only input opt-out from hook execution and create selection.",
        );
      }
      if (
        !content.includes("ARASHI_HOOK_INPUT") ||
        !hookInputModes.every((mode) => lower.includes(mode))
      ) {
        addDiagnostic(
          diagnostics,
          surface.category,
          "HOOK_INPUT_GUIDANCE_MODES_MISSING",
          surface.source,
          "Guidance must publish ARASHI_HOOK_INPUT=tty|disabled|unavailable.",
        );
      }
      if (
        !content.includes("--json") ||
        !lower.includes("precedence") ||
        !lower.includes("immediate eof")
      ) {
        addDiagnostic(
          diagnostics,
          surface.category,
          "HOOK_INPUT_GUIDANCE_AUTOMATION_MISSING",
          surface.source,
          "Guidance must publish JSON precedence and immediate EOF outside TTY mode.",
        );
      }
      if (
        !/tty.{0,160}inherit.{0,160}(?:(?:terminal\s+)?stdin|the terminal)/is.test(
          content,
        ) &&
        !/inherit.{0,160}(?:(?:terminal\s+)?stdin|the terminal).{0,160}tty/is.test(
          content,
        )
      ) {
        addDiagnostic(
          diagnostics,
          surface.category,
          "HOOK_INPUT_GUIDANCE_STDIN_MATRIX_MISSING",
          surface.source,
          "Guidance must state that TTY mode inherits terminal stdin while disabled and unavailable modes receive immediate EOF.",
        );
      }
      if (
        !lower.includes("bash") ||
        !/\bread(?:\s+-r)?\b/i.test(content) ||
        !lower.includes("powershell") ||
        !lower.includes("read-host") ||
        !lower.includes("cmd") ||
        (!lower.includes("set /p") &&
          !/\bchoice(?:\.exe)?\s+\/c\b/i.test(content))
      ) {
        addDiagnostic(
          diagnostics,
          surface.category,
          "HOOK_INPUT_NATIVE_GUIDANCE_MISSING",
          surface.source,
          "Guidance must cover native Bash read, PowerShell Read-Host, and cmd set /p or choice /c.",
        );
      }
      if (
        !lower.includes("password") ||
        !lower.includes("token") ||
        !lower.includes("secret")
      ) {
        addDiagnostic(
          diagnostics,
          surface.category,
          "HOOK_INPUT_NO_SECRETS_WARNING_MISSING",
          surface.source,
          "Guidance must warn users not to enter passwords, tokens, or other secrets into hook prompts.",
        );
      }
    }

    if (guidanceSurfaces.has(surface.source)) {
      if (
        ![".ps1", ".cmd", ".bat"].every((extension) =>
          content.includes(extension),
        )
      ) {
        diagnostics.push({
          severity: "error",
          category: surface.category,
          code: "HOOK_WINDOWS_GUIDANCE_MISSING",
          source: surface.source,
          message: "Native Windows lifecycle extensions are incomplete.",
        });
      }
      if (!content.includes("300000")) {
        diagnostics.push({
          severity: "error",
          category: surface.category,
          code: "HOOK_TIMEOUT_CONTRACT_MISSING",
          source: surface.source,
          message: "The shared 300000ms timeout contract is missing.",
        });
      }
      if (!content.includes("supported throughout 1.x")) {
        diagnostics.push({
          severity: "error",
          category: surface.category,
          code: "HOOK_COMPATIBILITY_WINDOW_MISSING",
          source: surface.source,
          message: "The 1.x compatibility boundary is missing.",
        });
      }
    }

    if (repositoryRemoveAliasSurfaces.has(surface.source)) {
      const defects = repositoryRemoveAliasContractDefects(content);
      if (defects.length > 0) {
        addDiagnostic(
          diagnostics,
          surface.category,
          "HOOK_REPOSITORY_REMOVE_ALIAS_CONTRACT_MISSING",
          surface.source,
          `Missing approved repository-remove alias semantics: ${defects.join(", ")}.`,
        );
      }
      if (contradictsRepositoryRemoveAliases(content)) {
        addDiagnostic(
          diagnostics,
          surface.category,
          "HOOK_REPOSITORY_REMOVE_ALIAS_CONTRADICTION",
          surface.source,
          "Repository-remove aliases collide in one slot; they never use silent precedence or double execution.",
        );
      }
    }

    if (
      surface.category === "cli" &&
      surface.source.endsWith("init.ts") &&
      !content.includes(
        "corepack pnpm --ignore-workspace install --frozen-lockfile",
      )
    ) {
      diagnostics.push({
        severity: "error",
        category: surface.category,
        code: "HOOK_PACKAGE_PROVENANCE_MISSING",
        source: surface.source,
        message: "Generated setup guidance is not child-workspace-safe.",
      });
    }
  }

  const configSchemaSource = "repos/arashi/schema/config.schema.json";
  try {
    const schema = JSON.parse(
      await readFile(join(root, configSchemaSource), "utf8"),
    ) as unknown;
    const definitions =
      object(schema) && object(schema.definitions)
        ? schema.definitions
        : undefined;
    const config =
      definitions && object(definitions.Config)
        ? definitions.Config
        : undefined;
    const properties =
      config && object(config.properties) ? config.properties : undefined;
    const hooks =
      properties && object(properties.hooks) ? properties.hooks : undefined;
    const hookProperties =
      hooks && object(hooks.properties) ? hooks.properties : undefined;
    if (hookProperties && Object.hasOwn(hookProperties, "input")) {
      addDiagnostic(
        diagnostics,
        "cli",
        "HOOK_INPUT_PERSISTENT_CONFIG_PUBLISHED",
        configSchemaSource,
        "Hook input is invocation-only; the generated schema must not publish hooks.input.",
      );
    }
  } catch (error) {
    addDiagnostic(
      diagnostics,
      "cli",
      "HOOK_INPUT_CONFIG_SCHEMA_INVALID",
      configSchemaSource,
      error instanceof Error ? error.message : String(error),
    );
  }

  const hookRuntimeSource = "repos/arashi/src/lib/hooks.ts";
  try {
    const content = await readFile(join(root, hookRuntimeSource), "utf8");
    const outcome = content.match(
      /export interface LifecycleHookOutcome\s*\{([\s\S]*?)\n?\}/,
    )?.[1];
    const outcomeFields = outcome
      ? [...outcome.matchAll(/(?:^|;)\s*([A-Za-z_$][\w$]*)\??\s*:/g)].map(
          (match) => match[1],
        )
      : undefined;
    if (
      !outcomeFields ||
      !sameStrings([...outcomeFields].sort(), [...publicOutcomeFields].sort())
    ) {
      addDiagnostic(
        diagnostics,
        "cli",
        "HOOK_INPUT_PUBLIC_OUTCOME_FIELDS_CHANGED",
        hookRuntimeSource,
        "LifecycleHookOutcome must retain its existing fields and must not publish captured stdout or stderr.",
      );
    }
  } catch (error) {
    addDiagnostic(
      diagnostics,
      "cli",
      "HOOK_INPUT_PUBLIC_OUTCOME_FIELDS_CHANGED",
      hookRuntimeSource,
      error instanceof Error ? error.message : String(error),
    );
  }

  for (const source of dogfoodPostCreateHooks) {
    let content = "";
    try {
      content = await readFile(join(root, source), "utf8");
    } catch (error) {
      addMetaDiagnostic(
        diagnostics,
        "HOOK_DOGFOOD_SCRIPT_MISSING",
        source,
        error instanceof Error ? error.message : String(error),
      );
      continue;
    }
    if (!content.includes("set -euo pipefail") || content.includes("|| true")) {
      addMetaDiagnostic(
        diagnostics,
        "HOOK_DOGFOOD_NOT_FAIL_FAST",
        source,
        "Required setup must fail fast and must not mask failures.",
      );
    }
    const repository = source
      .replace(".arashi/hooks/post-create.", "")
      .replace(".sh", "");
    const workspacePolicySource = `repos/${repository}/pnpm-workspace.yaml`;
    let hasTrustedBuildPolicy = false;
    try {
      const workspacePolicy = await readFile(
        join(root, workspacePolicySource),
        "utf8",
      );
      hasTrustedBuildPolicy = workspacePolicy.includes("allowBuilds:");
    } catch {
      // A child without a local workspace policy still needs ancestor isolation.
    }
    const isolatedInstall =
      "corepack pnpm --ignore-workspace install --frozen-lockfile";
    const childWorkspaceInstall = "corepack pnpm install --frozen-lockfile";
    if (
      !content.includes(isolatedInstall) &&
      !(hasTrustedBuildPolicy && content.includes(childWorkspaceInstall))
    ) {
      addMetaDiagnostic(
        diagnostics,
        "HOOK_DOGFOOD_PACKAGE_PROVENANCE",
        source,
        "Use an ancestor-isolated install or a child-local workspace boundary with reviewed build policy.",
      );
    }
    if (hasTrustedBuildPolicy && content.includes(isolatedInstall)) {
      addMetaDiagnostic(
        diagnostics,
        "HOOK_DOGFOOD_BUILD_POLICY_IGNORED",
        source,
        `Do not ignore ${workspacePolicySource}; it defines the child's trusted dependency builds.`,
      );
    }
    if (
      source === ".arashi/hooks/post-create.arashi-presentation.sh" &&
      content.includes("--config.strict-dep-builds=false") &&
      !content.includes("corepack pnpm exec playwright install chromium")
    ) {
      addMetaDiagnostic(
        diagnostics,
        "HOOK_DOGFOOD_BUILD_REPLACEMENT_MISSING",
        source,
        "Disabling strict dependency builds requires an explicit trusted Playwright setup step.",
      );
    }
  }

  const removeSource = ".arashi/hooks/pre-remove.sh";
  try {
    const content = await readFile(join(root, removeSource), "utf8");
    if (!content.includes("ARASHI_REMOVE_TARGETS_JSON")) {
      addMetaDiagnostic(
        diagnostics,
        "HOOK_DOGFOOD_TARGET_JSON_MISSING",
        removeSource,
        "Cleanup must consume structured target JSON.",
      );
    }
    if (
      !content.includes("pane_current_path") ||
      !content.includes('== "$target_path"')
    ) {
      addMetaDiagnostic(
        diagnostics,
        "HOOK_DOGFOOD_TMUX_NOT_EXACT",
        removeSource,
        "Cleanup must compare exact pane cwd and target paths.",
      );
    }
  } catch (error) {
    addMetaDiagnostic(
      diagnostics,
      "HOOK_DOGFOOD_SCRIPT_MISSING",
      removeSource,
      error instanceof Error ? error.message : String(error),
    );
  }

  const configSource = ".arashi/config.json";
  try {
    const config = JSON.parse(
      await readFile(join(root, configSource), "utf8"),
    ) as unknown;
    const hooks =
      object(config) && object(config.hooks) ? config.hooks : undefined;
    if (hooks && Object.hasOwn(hooks, "input")) {
      addMetaDiagnostic(
        diagnostics,
        "HOOK_INPUT_PERSISTENT_CONFIG_PUBLISHED",
        configSource,
        "Hook input is invocation-only; dogfood configuration must not persist hooks.input.",
      );
    }
    if (
      !hooks ||
      typeof hooks.timeout !== "number" ||
      !Number.isInteger(hooks.timeout) ||
      hooks.timeout < 300_000
    ) {
      addMetaDiagnostic(
        diagnostics,
        "HOOK_DOGFOOD_TIMEOUT_MISSING",
        configSource,
        "Dogfood dependency setup requires an explicit timeout of at least 300000ms.",
      );
    }
  } catch (error) {
    addMetaDiagnostic(
      diagnostics,
      "HOOK_DOGFOOD_CONFIG_INVALID",
      configSource,
      error instanceof Error ? error.message : String(error),
    );
  }

  return { diagnostics, ok: diagnostics.length === 0 };
}

export function formatHookContracts(result: HookContractResult): string {
  if (result.ok) return "Lifecycle-hook contracts are aligned.";
  return result.diagnostics
    .map(({ code, source, message }) => `[${code}] ${source}: ${message}`)
    .join("\n");
}
