import { afterEach, describe, expect, test } from "vitest";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";
import {
  checkHookContracts,
  type HookContractDiagnostic,
} from "../scripts/hook-contracts.ts";

const roots: string[] = [];
const hookInputSemantics = (distinctFrom: string[]) => ({
  option: "--no-hook-input",
  invocationOnly: true,
  persisted: false,
  disablesHooks: false,
  distinctFrom,
  modes: ["tty", "disabled", "unavailable"],
  precedence: ["json", "no-hook-input", "tty", "unavailable"],
  stdin: {
    tty: "inherit",
    disabled: "immediate-eof",
    unavailable: "immediate-eof",
  },
  nativeShells: ["bash", "powershell", "cmd"],
  publicOutcomeSchema: "unchanged",
});
const commandContract: {
  schemaVersion: number;
  commands: Array<{
    path: string;
    options: Array<{ long: string }>;
    semantics: { hookInput?: ReturnType<typeof hookInputSemantics> };
  }>;
} = {
  schemaVersion: 4,
  commands: [
    {
      path: "create",
      options: [
        { long: "--no-hook-input" },
        { long: "--no-hooks" },
        { long: "--interactive" },
      ],
      semantics: {
        hookInput: hookInputSemantics(["--no-hooks", "--interactive"]),
      },
    },
    {
      path: "remove",
      options: [{ long: "--no-hook-input" }, { long: "--no-hooks" }],
      semantics: { hookInput: hookInputSemantics(["--no-hooks"]) },
    },
    { path: "status", options: [], semantics: {} },
  ],
};
const hookInputGuidance = `
--no-hook-input is invocation-only and distinct from --no-hooks and create --interactive.
ARASHI_HOOK_INPUT uses exactly tty, disabled, or unavailable.
--json takes precedence and disabled or unavailable input receives immediate EOF.
Native examples use Bash read, PowerShell Read-Host, and cmd set /p.
Lifecycle hooks are trusted executables, but do not enter passwords, tokens, or other secrets into prompts.
`;
const files = {
  "repos/arashi/contracts/cli-commands.json": JSON.stringify(commandContract),
  "repos/arashi/src/lib/hooks.ts": `export interface LifecycleHookOutcome { hookName: string; scope: HookScope; workspaceMode: "configured" | "standalone"; hookStatus: HookOutcomeStatus; reasonCode: HookOutcomeReasonCode; message: string; repositoryId: string; sourceScriptPath: string | null; executionPath: string | null; targetRepositoryName: string | null; targetRepositoryPath: string | null; targetWorktreePath: string | null; durationMs?: number; }`,
  "repos/arashi/src/commands/init.ts": `ARASHI_BRANCH_NAME ARASHI_REMOVE_TARGETS_JSON corepack pnpm --ignore-workspace install --frozen-lockfile ${hookInputGuidance}`,
  "repos/arashi/docs/hooks.md": `ARASHI_BRANCH_NAME ARASHI_REMOVE_TARGETS_JSON 300000 .ps1 .cmd .bat supported throughout 1.x ${hookInputGuidance}`,
  "repos/arashi-docs/docs/workflows/hooks.md": `ARASHI_BRANCH_NAME ARASHI_REMOVE_TARGETS_JSON 300000 .ps1 .cmd .bat supported throughout 1.x ${hookInputGuidance}`,
  "repos/arashi-docs/public/llms-full.txt": `ARASHI_BRANCH_NAME ARASHI_REMOVE_TARGETS_JSON 300000 .ps1 .cmd .bat supported throughout 1.x ${hookInputGuidance}`,
  "repos/arashi-skills/skills/arashi/references/hooks.md": `ARASHI_BRANCH_NAME ARASHI_REMOVE_TARGETS_JSON 300000 .ps1 .cmd .bat supported throughout 1.x ${hookInputGuidance}`,
  ".arashi/config.json": JSON.stringify({ hooks: { timeout: 300000 } }),
  ".github/workflows/cross-repo-command-contracts.yml": `
path: meta/repos/arashi
path: meta/repos/arashi-docs
path: meta/repos/arashi-presentation
path: meta/repos/arashi-vscode
pnpm contracts:hooks
`,
  "repos/arashi/.github/workflows/ci.yml": `
hook-input-wrapper-acceptance:
  runs-on: ubuntu-latest
  run: pnpm exec vitest run tests/integration/hook-input-wrapper.test.ts
hook-input-native-acceptance:
  runs-on: windows-latest
  run: pwsh -File tests/windows/hook-input-native.ps1
`,
  ".arashi/hooks/post-create.arashi.sh": `set -euo pipefail\nCI=true corepack pnpm install --frozen-lockfile`,
  ".arashi/hooks/post-create.arashi-docs.sh": `set -euo pipefail\nCI=true corepack pnpm install --frozen-lockfile`,
  ".arashi/hooks/post-create.arashi-presentation.sh": `set -euo pipefail\nCI=true corepack pnpm install --frozen-lockfile`,
  ".arashi/hooks/post-create.arashi-vscode.sh": `set -euo pipefail\nCI=true corepack pnpm install --frozen-lockfile`,
  "repos/arashi/pnpm-workspace.yaml": "allowBuilds:\n  esbuild: true\n",
  "repos/arashi-docs/pnpm-workspace.yaml": "allowBuilds:\n  esbuild: true\n",
  "repos/arashi-presentation/pnpm-workspace.yaml":
    "allowBuilds:\n  playwright-chromium: true\n",
  "repos/arashi-vscode/pnpm-workspace.yaml": "allowBuilds:\n  esbuild: true\n",
  ".arashi/hooks/pre-remove.sh": `ARASHI_REMOVE_TARGETS_JSON\ntmux list-panes -a -F '#{pane_current_path}'\n[[ "$pane_path" == "$target_path" ]]`,
};

async function fixture(overrides: Record<string, string> = {}) {
  const root = await mkdtemp(join(tmpdir(), "arashi-hook-contracts-"));
  roots.push(root);
  for (const [path, content] of Object.entries({ ...files, ...overrides })) {
    const target = join(root, path);
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, content);
  }
  return root;
}

afterEach(async () => {
  await Promise.all(
    roots.splice(0).map((root) => rm(root, { recursive: true, force: true })),
  );
});

describe("cross-repository lifecycle-hook contract", () => {
  test("accepts aligned CLI, docs, generated export, and packaged skill semantics", async () => {
    const root = await fixture();
    expect(await checkHookContracts(root)).toEqual({
      diagnostics: [],
      ok: true,
    });
  });

  test("rejects a stale branch alias in any consumer", async () => {
    const root = await fixture({
      "repos/arashi-docs/docs/workflows/hooks.md":
        "ARASHI_BRANCH ARASHI_REMOVE_TARGETS_JSON 300000 .ps1 .cmd .bat supported throughout 1.x",
    });
    const result = await checkHookContracts(root);
    expect(result.ok).toBe(false);
    expect(result.diagnostics).toContainEqual(
      expect.objectContaining({
        code: "HOOK_STALE_BRANCH_ALIAS",
        source: "repos/arashi-docs/docs/workflows/hooks.md",
      }),
    );
  });

  test("allows documentation to explicitly reject stale branch aliases", async () => {
    const root = await fixture({
      "repos/arashi/docs/hooks.md": `${files["repos/arashi/docs/hooks.md"]} \`ARASHI_BRANCH\` and \`ARASHI_BASE_BRANCH\` are not compatibility aliases`,
    });
    expect(await checkHookContracts(root)).toEqual({
      diagnostics: [],
      ok: true,
    });
  });

  test("rejects missing structured targets or platform guidance in generated output", async () => {
    const root = await fixture({
      "repos/arashi-docs/public/llms-full.txt":
        "ARASHI_BRANCH_NAME 300000 .sh supported throughout 1.x",
    });
    const result = await checkHookContracts(root);
    expect(result.ok).toBe(false);
    expect(
      result.diagnostics.map(
        (diagnostic: HookContractDiagnostic) => diagnostic.code,
      ),
    ).toEqual(
      expect.arrayContaining([
        "HOOK_STRUCTURED_TARGETS_MISSING",
        "HOOK_WINDOWS_GUIDANCE_MISSING",
      ]),
    );
  });

  test("rejects masked or ancestor-workspace dogfood setup", async () => {
    const root = await fixture({
      ".arashi/hooks/post-create.arashi.sh": "pnpm install || true",
    });
    const result = await checkHookContracts(root);
    expect(result.ok).toBe(false);
    expect(
      result.diagnostics.map(
        (diagnostic: HookContractDiagnostic) => diagnostic.code,
      ),
    ).toEqual(
      expect.arrayContaining([
        "HOOK_DOGFOOD_NOT_FAIL_FAST",
        "HOOK_DOGFOOD_PACKAGE_PROVENANCE",
      ]),
    );
  });

  test("rejects dogfood setup that ignores a child-local trusted-build policy", async () => {
    const root = await fixture({
      ".arashi/hooks/post-create.arashi.sh":
        "set -euo pipefail\nCI=true corepack pnpm --ignore-workspace install --frozen-lockfile",
      "repos/arashi/pnpm-workspace.yaml": "allowBuilds:\n  esbuild: true\n",
    });
    const result = await checkHookContracts(root);
    expect(result.diagnostics).toContainEqual(
      expect.objectContaining({
        code: "HOOK_DOGFOOD_BUILD_POLICY_IGNORED",
        source: ".arashi/hooks/post-create.arashi.sh",
      }),
    );
  });

  test("rejects CI that omits a dogfood hook repository", async () => {
    const root = await fixture({
      ".github/workflows/cross-repo-command-contracts.yml": `
path: meta/repos/arashi
path: meta/repos/arashi-docs
path: meta/repos/arashi-vscode
`,
    });
    const result = await checkHookContracts(root);
    expect(result.diagnostics).toContainEqual(
      expect.objectContaining({
        code: "HOOK_DOGFOOD_REPOSITORY_UNAVAILABLE",
        source: ".github/workflows/cross-repo-command-contracts.yml",
      }),
    );
  });

  test("rejects substring-based tmux cleanup", async () => {
    const root = await fixture({
      ".arashi/hooks/pre-remove.sh": `ARASHI_WORKTREE_PATH\n[[ "$session_name" == *"$worktree_name"* ]]`,
    });
    const result = await checkHookContracts(root);
    expect(result.ok).toBe(false);
    expect(
      result.diagnostics.map(
        (diagnostic: HookContractDiagnostic) => diagnostic.code,
      ),
    ).toEqual(
      expect.arrayContaining([
        "HOOK_DOGFOOD_TARGET_JSON_MISSING",
        "HOOK_DOGFOOD_TMUX_NOT_EXACT",
      ]),
    );
  });

  test("requires an explicit trusted build replacement when strict dependency builds are disabled", async () => {
    const root = await fixture({
      ".arashi/hooks/post-create.arashi-presentation.sh":
        "set -euo pipefail\nCI=true corepack pnpm install --frozen-lockfile --config.strict-dep-builds=false",
    });
    const result = await checkHookContracts(root);
    expect(result.diagnostics).toContainEqual(
      expect.objectContaining({
        code: "HOOK_DOGFOOD_BUILD_REPLACEMENT_MISSING",
        source: ".arashi/hooks/post-create.arashi-presentation.sh",
      }),
    );
  });

  test.each([
    ["option ownership", "status", "owner", "HOOK_INPUT_OPTION_OWNERSHIP"],
    [
      "invocation-only policy",
      "create",
      "persisted",
      "HOOK_INPUT_POLICY_INVALID",
    ],
    ["mode vocabulary", "remove", "modes", "HOOK_INPUT_MODES_INVALID"],
    ["JSON precedence", "create", "precedence", "HOOK_INPUT_JSON_PRECEDENCE"],
    ["immediate EOF", "remove", "stdin", "HOOK_INPUT_STDIN_INVALID"],
    ["native shells", "create", "shells", "HOOK_INPUT_NATIVE_SHELLS_INVALID"],
    [
      "public outcome stability",
      "remove",
      "outcome",
      "HOOK_INPUT_PUBLIC_OUTCOME_CHANGED",
    ],
  ])(
    "rejects a controlled %s mismatch",
    async (_name, path, mismatch, code) => {
      const contract = structuredClone(commandContract);
      const command = contract.commands.find(
        (candidate) => candidate.path === path,
      )!;
      if (mismatch === "owner")
        command.options.push({ long: "--no-hook-input" });
      const semantics = command.semantics.hookInput;
      if (mismatch === "persisted" && semantics) semantics.persisted = true;
      if (mismatch === "modes" && semantics)
        semantics.modes = ["tty", "disabled", "closed"];
      if (mismatch === "precedence" && semantics)
        semantics.precedence = ["no-hook-input", "json", "tty", "unavailable"];
      if (mismatch === "stdin" && semantics) semantics.stdin.disabled = "pipe";
      if (mismatch === "shells" && semantics)
        semantics.nativeShells = ["bash", "powershell"];
      if (mismatch === "outcome" && semantics)
        semantics.publicOutcomeSchema = "adds-captured-output";
      const root = await fixture({
        "repos/arashi/contracts/cli-commands.json": JSON.stringify(contract),
      });
      const result = await checkHookContracts(root);
      expect(result.diagnostics).toContainEqual(
        expect.objectContaining({ code }),
      );
    },
  );

  test("rejects guidance without the no-secrets warning", async () => {
    const source = "repos/arashi-skills/skills/arashi/references/hooks.md";
    const root = await fixture({
      [source]: files[source].replace(
        "Lifecycle hooks are trusted executables, but do not enter passwords, tokens, or other secrets into prompts.",
        "Lifecycle hooks are trusted executables.",
      ),
    });
    const result = await checkHookContracts(root);
    expect(result.diagnostics).toContainEqual(
      expect.objectContaining({
        code: "HOOK_INPUT_NO_SECRETS_WARNING_MISSING",
        source,
      }),
    );
  });

  test("rejects public lifecycle outcomes that add captured streams", async () => {
    const root = await fixture({
      "repos/arashi/src/lib/hooks.ts":
        "export interface LifecycleHookOutcome { hookName: string; stdout: string; stderr: string; }",
    });
    const result = await checkHookContracts(root);
    expect(result.diagnostics).toContainEqual(
      expect.objectContaining({
        code: "HOOK_INPUT_PUBLIC_OUTCOME_FIELDS_CHANGED",
      }),
    );
  });

  test("rejects missing wrapper, native Windows, or checker workflow reachability", async () => {
    const root = await fixture({
      "repos/arashi/.github/workflows/ci.yml": "runs-on: ubuntu-latest",
      ".github/workflows/cross-repo-command-contracts.yml": files[
        ".github/workflows/cross-repo-command-contracts.yml"
      ].replace("pnpm contracts:hooks", "pnpm test"),
    });
    const result = await checkHookContracts(root);
    expect(result.diagnostics.map(({ code }) => code)).toEqual(
      expect.arrayContaining([
        "HOOK_INPUT_CHECKER_UNREACHABLE",
        "HOOK_INPUT_WRAPPER_ACCEPTANCE_UNREACHABLE",
        "HOOK_INPUT_WINDOWS_ACCEPTANCE_UNREACHABLE",
      ]),
    );
  });
});
