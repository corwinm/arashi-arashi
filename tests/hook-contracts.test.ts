import { afterEach, describe, expect, test } from "vitest";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";
import {
  checkHookContracts,
  type HookContractDiagnostic,
} from "../scripts/hook-contracts.ts";

const roots: string[] = [];
const files = {
  "repos/arashi/src/commands/init.ts": `ARASHI_BRANCH_NAME ARASHI_REMOVE_TARGETS_JSON corepack pnpm --ignore-workspace install --frozen-lockfile`,
  "repos/arashi/docs/hooks.md": `ARASHI_BRANCH_NAME ARASHI_REMOVE_TARGETS_JSON 300000 .ps1 .cmd .bat supported throughout 1.x`,
  "repos/arashi-docs/docs/workflows/hooks.md": `ARASHI_BRANCH_NAME ARASHI_REMOVE_TARGETS_JSON 300000 .ps1 .cmd .bat supported throughout 1.x`,
  "repos/arashi-docs/public/llms-full.txt": `ARASHI_BRANCH_NAME ARASHI_REMOVE_TARGETS_JSON 300000 .ps1 .cmd .bat supported throughout 1.x`,
  "repos/arashi-skills/skills/arashi/references/hooks.md": `ARASHI_BRANCH_NAME ARASHI_REMOVE_TARGETS_JSON 300000 .ps1 .cmd .bat supported throughout 1.x`,
  ".arashi/config.json": JSON.stringify({ hooks: { timeout: 300000 } }),
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
});
