import { spawnSync } from "node:child_process";
import { cp, mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { afterEach } from "vitest";
const roots: string[] = [];
const repositoryRoot = join(import.meta.dirname, "..");
const hookInputSemanticPolicy = () => ({
  hookInput: {
    disabledMode: "disabled",
    immediateEof: true,
    jsonPrecedence: true,
    modes: ["tty", "disabled", "unavailable"],
    skipsHooks: false,
  },
  ownership: "command",
  persisted: false,
});
const commandContract: {
  schemaVersion: number;
  root: { name: string };
  commands: Array<{
    path: string;
    options: Array<{
      long: string;
      semanticPolicy?: ReturnType<typeof hookInputSemanticPolicy>;
    }>;
    semantics: Record<string, never>;
  }>;
} = {
  schemaVersion: 6,
  root: { name: "arashi" },
  commands: [
    {
      path: "create",
      options: [
        {
          long: "--no-hook-input",
          semanticPolicy: hookInputSemanticPolicy(),
        },
        { long: "--no-hooks" },
        { long: "--interactive" },
      ],
      semantics: {},
    },
    {
      path: "remove",
      options: [
        {
          long: "--no-hook-input",
          semanticPolicy: hookInputSemanticPolicy(),
        },
        { long: "--no-hooks" },
      ],
      semantics: {},
    },
    { path: "status", options: [], semantics: {} },
  ],
};
const hookInputGuidance = `
--no-hook-input is invocation-only and distinct from --no-hooks and create --interactive.
ARASHI_HOOK_INPUT uses exactly tty, disabled, or unavailable.
TTY mode inherits terminal stdin. --json takes precedence and disabled or unavailable input receives immediate EOF.
Native examples use Bash read, PowerShell Read-Host, and cmd set /p.
Lifecycle hooks are trusted executables, but do not enter passwords, tokens, or other secrets into prompts.
`;
const repositoryRemoveAliasGuidance = `
Configured repository remove hooks use the canonical <configurationRoot>/.arashi/hooks/<lifecycle>.<repo><ext> workspace-owned file or the compatible <active-repository>/.arashi/hooks/<lifecycle><ext> child-local alias. Repository inline repos.<repo>.hooks.<lifecycle>, the canonical file, and the compatible file are three alternatives for one repository slot: exactly zero or one source is selected, and every collision fails before hooks or removal mutation instead of using precedence or executing twice.
The selected source keeps plain pre-remove or post-remove lifecycle identity, repository scope and owner <repo>, and runs with the active target repository source checkout as cwd and ARASHI_HOOK_EXECUTION_PATH; ARASHI_HOOK_SOURCE_PATH identifies the selected file independently of cwd.
Repository hook onboarding writes qualified create and remove files beneath the active configuration root, never into the target checkout or canonical clone. Direct non-bare, configured bare, ordinary linked, and linked worktrees backed by a configured bare authority retain their configuration authority while repository remove execution uses the active target checkout.
Configured repository deletion owns only exact pre-create.<repo>, post-create.<repo>, pre-remove.<repo>, and post-remove.<repo> native candidates and their exact .example templates. It never glob-deletes similarly named, compatible repository-local, shared workspace, or user-global hooks.
Doctor and remove dry-run use the runtime resolver without execution. HOOK_AMBIGUOUS reports hookName, scope, sourceKinds, sourceOwnerKind, sourceOwnerName, nullable sourceScriptPath, and de-duplicated sourceScriptPaths: at most six native paths ordered canonical workspace-owned location first, compatible repository-local location second, then established platform extension order within each location.
`;
const files: Record<string, string> = {
  "repos/arashi/contracts/cli-commands.json": JSON.stringify(commandContract),
  "repos/arashi/schema/config.schema.json": JSON.stringify({
    $ref: "#/definitions/Config",
    definitions: {
      Config: {
        additionalProperties: false,
        properties: {
          hooks: {
            additionalProperties: false,
            properties: { timeout: { type: "number" } },
            type: "object",
          },
          repos: { type: "object" },
          reposDir: { type: "string" },
          version: { type: "string" },
        },
        type: "object",
      },
    },
  }),
  "repos/arashi/src/lib/hooks.ts": `export interface LifecycleHookOutcome { hookName: string; scope: HookScope; workspaceMode: "configured" | "standalone"; hookStatus: HookOutcomeStatus; reasonCode: HookOutcomeReasonCode; message: string; repositoryId: string; sourceKind: "file" | "inline-config"; sourceOwnerKind: "repository" | "user-global" | "workspace"; sourceOwnerName: string | null; sourceScriptPath: string | null; sourceScriptPaths?: readonly string[]; executionPath: string | null; targetRepositoryName: string | null; targetRepositoryPath: string | null; targetWorktreePath: string | null; durationMs?: number; }`,
  "repos/arashi/src/commands/init.ts": `ARASHI_BRANCH_NAME ARASHI_REMOVE_TARGETS_JSON corepack pnpm --ignore-workspace install --frozen-lockfile ${hookInputGuidance}`,
  "repos/arashi/docs/hooks.md": `ARASHI_BRANCH_NAME ARASHI_REMOVE_TARGETS_JSON 300000 .ps1 .cmd .bat supported throughout 1.x ${hookInputGuidance} ${repositoryRemoveAliasGuidance}`,
  "repos/arashi-docs/docs/reference/hooks.md": `ARASHI_BRANCH_NAME ARASHI_REMOVE_TARGETS_JSON 300000 .ps1 .cmd .bat supported throughout 1.x ${hookInputGuidance} ${repositoryRemoveAliasGuidance}`,
  "repos/arashi-docs/public/llms-full.txt": `ARASHI_BRANCH_NAME ARASHI_REMOVE_TARGETS_JSON 300000 .ps1 .cmd .bat supported throughout 1.x ${hookInputGuidance} ${repositoryRemoveAliasGuidance}`,
  "repos/arashi-skills/skills/arashi/references/hooks.md": `ARASHI_BRANCH_NAME ARASHI_REMOVE_TARGETS_JSON 300000 .ps1 .cmd .bat supported throughout 1.x ${hookInputGuidance} ${repositoryRemoveAliasGuidance}`,
  ".arashi/config.json": JSON.stringify({ hooks: { timeout: 300000 } }),
  ".github/workflows/cross-repo-command-contracts.yml": `
path: meta/repos/arashi
path: meta/repos/arashi-docs
path: meta/repos/arashi-presentation
path: meta/repos/arashi-vscode
jobs:
  contracts:
    steps:
      - run: pnpm contracts:check:ci
      - run: pnpm --dir repos/arashi-docs validate:semantic-docs
      - run: node repos/arashi-skills/scripts/validate-guidance.mjs
      - run: |
          node repos/arashi-skills/scripts/create-release-archive.mjs --root repos/arashi-skills --output arashi-skill-package.tar.gz
          node repos/arashi-skills/scripts/create-release-archive.mjs --verify arashi-skill-package.tar.gz
          mkdir package-check
          tar -xzf arashi-skill-package.tar.gz -C package-check
          node repos/arashi-skills/scripts/validate-guidance.mjs --skill-root package-check/skills/arashi
`,
  "repos/arashi/.github/workflows/ci.yml": `name: CI
jobs:
  hook-input-wrapper-acceptance:
    runs-on: ubuntu-latest
    steps:
      - run: pnpm exec vitest run tests/integration/hook-input-wrapper.test.ts
  hook-input-native-acceptance:
    runs-on: windows-latest
    steps:
      - run: pwsh -File tests/windows/hook-input-native.ps1
`,
  "repos/arashi/tests/integration/hook-input-wrapper.test.ts": `
const wrappers = ["bin/arashi", "bin/arashi.js", "bin/arashi.ps1", "bin/arashi.bat"];
test("installed package wrappers preserve eligible hook input", () => wrappers);
`,
  "repos/arashi/tests/windows/hook-input-native.ps1": `
$Binary = "bin/arashi-windows-x64.exe"
# Native fixtures exercise PowerShell Read-Host and cmd set /p through the built CLI.
# They also prove disabled and unavailable modes receive immediate EOF.
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
async function docsOwningCheckerFixture() {
  const root = await mkdtemp(join(tmpdir(), "arashi-docs-hook-owner-"));
  roots.push(root);
  await mkdir(join(root, "scripts"), { recursive: true });
  await cp(
    join(
      repositoryRoot,
      "repos/arashi-docs/scripts/check-repository-remove-hook-docs.ts",
    ),
    join(root, "scripts/check-repository-remove-hook-docs.ts"),
  );
  for (const relativePath of [
    "docs/reference/hooks.md",
    "docs/commands/remove.md",
    "docs/reference/configuration.md",
    "docs/commands/add.md",
    "docs/commands/configure.md",
    "docs/commands/delete.md",
    "public/reference/hooks.md",
    "public/commands/remove.md",
    "public/reference/configuration.md",
    "public/commands/add.md",
    "public/commands/configure.md",
    "public/commands/delete.md",
    "public/llms.txt",
    "public/llms-full.txt",
  ]) {
    const target = join(root, relativePath);
    await mkdir(dirname(target), { recursive: true });
    await cp(join(repositoryRoot, "repos/arashi-docs", relativePath), target);
  }
  return root;
}
function runNodeChecker(root: string, script: string, args: string[] = []) {
  return spawnSync(process.execPath, [script, ...args], {
    cwd: root,
    encoding: "utf8",
    env: { ...process.env, NO_COLOR: "1" },
  });
}
afterEach(async () => {
  await Promise.all(
    roots.splice(0).map((root) => rm(root, { recursive: true, force: true })),
  );
});
export {
  commandContract,
  docsOwningCheckerFixture,
  files,
  fixture,
  hookInputGuidance,
  hookInputSemanticPolicy,
  repositoryRemoveAliasGuidance,
  repositoryRoot,
  roots,
  runNodeChecker,
};
