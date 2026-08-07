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
const dogfoodPostCreateHooks = [
  ".arashi/hooks/post-create.arashi.sh",
  ".arashi/hooks/post-create.arashi-docs.sh",
  ".arashi/hooks/post-create.arashi-presentation.sh",
  ".arashi/hooks/post-create.arashi-vscode.sh",
] as const;

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
