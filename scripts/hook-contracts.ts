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

const surfaces = [
  { source: "repos/arashi/src/commands/init.ts", category: "cli" },
  { source: "repos/arashi/docs/hooks.md", category: "cli" },
  { source: "repos/arashi-docs/docs/workflows/hooks.md", category: "docs" },
  { source: "repos/arashi-docs/public/llms-full.txt", category: "generated" },
  {
    source: "repos/arashi-skills/skills/arashi/references/hooks.md",
    category: "skills",
  },
] as const;

const guidanceSurfaces = new Set(surfaces.slice(1).map(({ source }) => source));
const hookInputGuidanceSurfaces = new Set(surfaces.map(({ source }) => source));
const hookInputModes = ["tty", "disabled", "unavailable"] as const;
const hookInputPrecedence = [
  "json",
  "no-hook-input",
  "tty",
  "unavailable",
] as const;
const hookInputNativeShells = ["bash", "powershell", "cmd"] as const;
const publicOutcomeFields = [
  "hookName",
  "scope",
  "workspaceMode",
  "hookStatus",
  "reasonCode",
  "message",
  "repositoryId",
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
  if (!workflowContent.includes("pnpm contracts:hooks")) {
    addMetaDiagnostic(
      diagnostics,
      "HOOK_INPUT_CHECKER_UNREACHABLE",
      workflowSource,
      "The authoritative workflow must execute the focused hook semantic checker.",
    );
  }

  const cliWorkflowSource = "repos/arashi/.github/workflows/ci.yml";
  try {
    const cliWorkflow = await readFile(join(root, cliWorkflowSource), "utf8");
    if (
      !cliWorkflow.includes("hook-input-wrapper") ||
      !cliWorkflow.includes("ubuntu-latest")
    ) {
      addMetaDiagnostic(
        diagnostics,
        "HOOK_INPUT_WRAPPER_ACCEPTANCE_UNREACHABLE",
        cliWorkflowSource,
        "Installed wrapper hook-input acceptance must run on a POSIX CI host.",
      );
    }
    if (
      !cliWorkflow.includes("hook-input-native") ||
      !cliWorkflow.includes("windows-latest") ||
      !/hook-input[^\n]*\.ps1/i.test(cliWorkflow)
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
      .filter((command) => {
        const options = Array.isArray(command.options)
          ? command.options.filter(object)
          : [];
        return options.some(
          (option) =>
            option.long === "--no-hook-input" ||
            (typeof option.flags === "string" &&
              option.flags.includes("--no-hook-input")),
        );
      })
      .map((command) => command.path)
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
      const semantics =
        command && object(command.semantics) ? command.semantics : undefined;
      const policy =
        semantics && object(semantics.hookInput)
          ? semantics.hookInput
          : undefined;
      const expectedDistinct =
        commandName === "create"
          ? ["--no-hooks", "--interactive"]
          : ["--no-hooks"];
      if (
        !policy ||
        policy.option !== "--no-hook-input" ||
        policy.invocationOnly !== true ||
        policy.persisted !== false ||
        policy.disablesHooks !== false ||
        !sameStrings(policy.distinctFrom, expectedDistinct)
      ) {
        addDiagnostic(
          diagnostics,
          "cli",
          "HOOK_INPUT_POLICY_INVALID",
          commandContractSource,
          `${commandName} must publish invocation-only, non-persisted hook-input semantics distinct from hook execution and selection.`,
        );
      }
      if (!policy || !sameStrings(policy.modes, hookInputModes)) {
        addDiagnostic(
          diagnostics,
          "cli",
          "HOOK_INPUT_MODES_INVALID",
          commandContractSource,
          `${commandName} must publish exactly tty, disabled, and unavailable.`,
        );
      }
      if (!policy || !sameStrings(policy.precedence, hookInputPrecedence)) {
        addDiagnostic(
          diagnostics,
          "cli",
          "HOOK_INPUT_JSON_PRECEDENCE",
          commandContractSource,
          `${commandName} must publish JSON-first hook-input precedence.`,
        );
      }
      const stdin = policy && object(policy.stdin) ? policy.stdin : undefined;
      if (
        !stdin ||
        stdin.tty !== "inherit" ||
        stdin.disabled !== "immediate-eof" ||
        stdin.unavailable !== "immediate-eof"
      ) {
        addDiagnostic(
          diagnostics,
          "cli",
          "HOOK_INPUT_STDIN_INVALID",
          commandContractSource,
          `${commandName} must inherit TTY stdin and provide immediate EOF otherwise.`,
        );
      }
      if (!policy || !sameStrings(policy.nativeShells, hookInputNativeShells)) {
        addDiagnostic(
          diagnostics,
          "cli",
          "HOOK_INPUT_NATIVE_SHELLS_INVALID",
          commandContractSource,
          `${commandName} must cover native Bash, PowerShell, and cmd input.`,
        );
      }
      if (!policy || policy.publicOutcomeSchema !== "unchanged") {
        addDiagnostic(
          diagnostics,
          "cli",
          "HOOK_INPUT_PUBLIC_OUTCOME_CHANGED",
          commandContractSource,
          `${commandName} must keep the public lifecycle outcome schema unchanged.`,
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

    const mentionsStaleBranchAlias =
      /\bARASHI_BRANCH\b/.test(content) ||
      content.includes("ARASHI_BASE_BRANCH");
    const explicitlyRejectsStaleBranchAliases = content.includes(
      "`ARASHI_BRANCH` and `ARASHI_BASE_BRANCH` are not compatibility aliases",
    );
    if (mentionsStaleBranchAlias && !explicitlyRejectsStaleBranchAliases) {
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
        !lower.includes("invocation-only") ||
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
        !lower.includes("bash read") ||
        !lower.includes("powershell read-host") ||
        !lower.includes("cmd set /p")
      ) {
        addDiagnostic(
          diagnostics,
          surface.category,
          "HOOK_INPUT_NATIVE_GUIDANCE_MISSING",
          surface.source,
          "Guidance must cover native Bash read, PowerShell Read-Host, and cmd set /p.",
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

  const hookRuntimeSource = "repos/arashi/src/lib/hooks.ts";
  try {
    const content = await readFile(join(root, hookRuntimeSource), "utf8");
    const outcome = content.match(
      /export interface LifecycleHookOutcome\s*\{([\s\S]*?)\n?\}/,
    )?.[1];
    if (
      !outcome ||
      !publicOutcomeFields.every((field) =>
        new RegExp(`\\b${field}\\??\\s*:`).test(outcome),
      ) ||
      /\b(?:stdout|stderr)\??\s*:/.test(outcome)
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
    ) as {
      hooks?: { timeout?: unknown };
    };
    if (
      typeof config.hooks?.timeout !== "number" ||
      !Number.isInteger(config.hooks.timeout) ||
      config.hooks.timeout < 300_000
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
