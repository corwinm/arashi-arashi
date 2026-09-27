import { describe, expect, test } from "vitest";
import * as hookContractModule from "../scripts/hook-contracts.ts";
import {
  checkHookContracts,
  type HookContractDiagnostic,
} from "../scripts/hook-contracts.ts";
import {
  commandContract,
  files,
  fixture,
  hookInputSemanticPolicy,
} from "./hook-contracts.fixtures";
describe("cross-repository lifecycle-hook contract", () => {
  test("invokes each owning child checker instead of substituting weaker meta checks", () => {
    const runOwningChecks = (
      hookContractModule as typeof hookContractModule & {
        checkOwningHookContracts?: (
          root: string,
          runner: (...args: unknown[]) => unknown,
        ) => HookContractDiagnostic[];
      }
    ).checkOwningHookContracts;
    expect(runOwningChecks).toBeTypeOf("function");
    const calls: unknown[][] = [];
    const diagnostics = runOwningChecks!("/contract-root", (...args) => {
      calls.push(args);
      return {
        error: undefined,
        signal: null,
        status: 0,
        stderr: "",
        stdout: "",
      };
    });
    expect(diagnostics).toEqual([]);
    expect(calls.map(([command, args]) => [command, args])).toEqual([
      ["pnpm", ["--dir", "repos/arashi", "contract:check"]],
      ["pnpm", ["--dir", "repos/arashi-docs", "validate:semantic-docs"]],
      [
        process.execPath,
        ["/contract-root/repos/arashi-skills/scripts/validate-guidance.mjs"],
      ],
      [
        process.execPath,
        [
          "/contract-root/repos/arashi-skills/scripts/create-release-archive.mjs",
          "--root",
          "/contract-root/repos/arashi-skills",
          "--output",
          expect.stringMatching(/arashi-skill-package\.tar\.gz$/),
        ],
      ],
      [
        "tar",
        [
          "-xzf",
          expect.stringMatching(/arashi-skill-package\.tar\.gz$/),
          "-C",
          expect.stringMatching(/package-check$/),
        ],
      ],
      [
        process.execPath,
        [
          "/contract-root/repos/arashi-skills/scripts/validate-guidance.mjs",
          "--skill-root",
          expect.stringMatching(/package-check\/skills\/arashi$/),
        ],
      ],
    ]);
  });
  test("propagates extracted skills package validation failure", () => {
    const calls: Array<[string, string[]]> = [];
    const diagnostics = hookContractModule.checkOwningHookContracts(
      "/contract-root",
      (command, args) => {
        calls.push([command, args]);
        const packageValidation = args.includes("--skill-root");
        return {
          error: undefined,
          signal: null,
          status: packageValidation ? 1 : 0,
          stderr: packageValidation ? "packaged guidance drift" : "",
          stdout: "",
        };
      },
    );
    expect(calls.at(-1)?.[1]).toContain("--skill-root");
    expect(diagnostics).toContainEqual(
      expect.objectContaining({
        category: "skills",
        code: "HOOK_OWNING_CHECKER_FAILED",
        source:
          "repos/arashi-skills/scripts/validate-guidance.mjs#extracted-package",
      }),
    );
  });
  test("accepts the pre-finish CLI hook-input contract", async () => {
    const root = await fixture();
    expect(await checkHookContracts(root)).toEqual({
      diagnostics: [],
      ok: true,
    });
  });
  test("accepts finish with its own no-hook-input policy", async () => {
    const contract = structuredClone(commandContract);
    contract.commands.push({
      path: "finish",
      options: [
        { long: "--no-hook-input", semanticPolicy: hookInputSemanticPolicy() },
      ],
      semantics: {},
    });
    const root = await fixture({
      "repos/arashi/contracts/cli-commands.json": JSON.stringify(contract),
    });
    expect(await checkHookContracts(root)).toEqual({
      diagnostics: [],
      ok: true,
    });
  });
  test("requires no-hook-input when finish exists", async () => {
    const contract = structuredClone(commandContract);
    contract.commands.push({ path: "finish", options: [], semantics: {} });
    const root = await fixture({
      "repos/arashi/contracts/cli-commands.json": JSON.stringify(contract),
    });
    expect((await checkHookContracts(root)).diagnostics).toContainEqual(
      expect.objectContaining({ code: "HOOK_INPUT_OPTION_OWNERSHIP" }),
    );
  });
  test("validates finish hook-input semantics", async () => {
    const contract = structuredClone(commandContract);
    const policy = hookInputSemanticPolicy();
    policy.hookInput.immediateEof = false;
    contract.commands.push({
      path: "finish",
      options: [{ long: "--no-hook-input", semanticPolicy: policy }],
      semantics: {},
    });
    const root = await fixture({
      "repos/arashi/contracts/cli-commands.json": JSON.stringify(contract),
    });
    expect((await checkHookContracts(root)).diagnostics).toContainEqual(
      expect.objectContaining({ code: "HOOK_INPUT_STDIN_INVALID" }),
    );
  });
  test("accepts the complete repository-remove alias contract on every maintained hook surface", async () => {
    const maintained = [
      "repos/arashi/docs/hooks.md",
      "repos/arashi-docs/docs/reference/hooks.md",
      "repos/arashi-docs/public/llms-full.txt",
      "repos/arashi-skills/skills/arashi/references/hooks.md",
    ];
    const overrides = Object.fromEntries(
      maintained.map((source) => [source, files[source]]),
    );
    const root = await fixture(overrides);
    expect(await checkHookContracts(root)).toEqual({
      diagnostics: [],
      ok: true,
    });
  });
  test.each([
    [
      "canonical path",
      "<configurationRoot>/.arashi/hooks/<lifecycle>.<repo><ext>",
    ],
    ["compatible alias", "<active-repository>/.arashi/hooks/<lifecycle><ext>"],
    ["inline alias", "repos.<repo>.hooks.<lifecycle>"],
    ["one slot", "three alternatives for one repository slot"],
    ["target cwd", "active target repository source checkout as cwd"],
    [
      "doctor and dry-run",
      "Doctor and remove dry-run use the runtime resolver without execution",
    ],
  ])(
    "rejects missing repository-remove %s semantics on each maintained surface",
    async (_label, fragment) => {
      const maintained = [
        "repos/arashi/docs/hooks.md",
        "repos/arashi-docs/docs/reference/hooks.md",
        "repos/arashi-docs/public/llms-full.txt",
        "repos/arashi-skills/skills/arashi/references/hooks.md",
      ];
      for (const source of maintained) {
        const result = await checkHookContracts(
          await fixture({ [source]: files[source].replace(fragment, "") }),
        );
        expect(result.diagnostics).toContainEqual(
          expect.objectContaining({
            code: "HOOK_REPOSITORY_REMOVE_ALIAS_CONTRACT_MISSING",
            source,
          }),
        );
      }
    },
    20_000,
  );
  test("rejects alias precedence, sequential execution, and fallback contradictions on every maintained surface", async () => {
    const maintained = [
      "repos/arashi/docs/hooks.md",
      "repos/arashi-docs/docs/reference/hooks.md",
      "repos/arashi-docs/public/llms-full.txt",
      "repos/arashi-skills/skills/arashi/references/hooks.md",
    ];
    const contradictions = [
      "When aliases collide, Arashi prefers the canonical workspace-owned hook over the compatible repository-local hook.",
      "On collision, the canonical workspace-owned hook is preferred.",
      "When aliases collide, the compatible repository-local hook takes precedence over the canonical workspace-owned hook.",
      "When aliases collide, Arashi selects the canonical workspace-owned hook over the compatible repository-local hook.",
      "When aliases collide, Arashi chooses the compatible repository-local hook over the canonical workspace-owned hook.",
      "The canonical workspace-owned hook does not take precedence over the compatible repository-local hook, but the compatible repository-local hook takes precedence over the canonical workspace-owned hook.",
      "Arashi runs the canonical workspace-owned hook and then the compatible repository-local hook.",
      "Arashi executes the compatible repository-local hook after the canonical workspace-owned hook.",
      "If the canonical workspace-owned hook is unavailable, Arashi uses the compatible repository-local hook as a fallback.",
      "On collision, the compatible repository-local hook becomes the fallback.",
    ];
    for (const source of maintained) {
      for (const contradiction of contradictions) {
        const root = await fixture({
          [source]: `${files[source]}\n${contradiction}`,
        });
        expect((await checkHookContracts(root)).diagnostics).toContainEqual(
          expect.objectContaining({
            code: "HOOK_REPOSITORY_REMOVE_ALIAS_CONTRADICTION",
            source,
          }),
        );
      }
    }
  }, 20_000);
  test.each([
    "The canonical workspace-owned hook does not take precedence over the compatible repository-local hook.",
    "The canonical workspace-owned hook doesn't take precedence over the compatible repository-local hook.",
    "The canonical workspace-owned hook doesn’t take precedence over the compatible repository-local hook.",
    "On collision, the canonical workspace-owned hook is not preferred.",
    "When aliases collide, Arashi does not select the canonical workspace-owned hook over the compatible repository-local hook.",
    "When aliases collide, Arashi never chooses the compatible repository-local hook over the canonical workspace-owned hook.",
    "Arashi never runs the canonical workspace-owned hook and then the compatible repository-local hook.",
    "Arashi cannot fall back from the canonical workspace-owned hook to the compatible repository-local hook.",
    "On collision, the compatible repository-local hook is not a fallback.",
    "Neither the canonical workspace-owned nor compatible repository-local hook is preferred.",
  ])("accepts truthful alias collision negation: %s", async (statement) => {
    const source = "repos/arashi-docs/docs/reference/hooks.md";
    expect(
      (
        await checkHookContracts(
          await fixture({ [source]: `${files[source]}\n${statement}` }),
        )
      ).diagnostics,
    ).not.toContainEqual(
      expect.objectContaining({
        code: "HOOK_REPOSITORY_REMOVE_ALIAS_CONTRADICTION",
        source,
      }),
    );
  });
  test("rejects a stale branch alias in any consumer", async () => {
    const root = await fixture({
      "repos/arashi-docs/docs/reference/hooks.md":
        "ARASHI_BRANCH ARASHI_REMOVE_TARGETS_JSON 300000 .ps1 .cmd .bat supported throughout 1.x",
    });
    const result = await checkHookContracts(root);
    expect(result.ok).toBe(false);
    expect(result.diagnostics).toContainEqual(
      expect.objectContaining({
        code: "HOOK_STALE_BRANCH_ALIAS",
        source: "repos/arashi-docs/docs/reference/hooks.md",
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
  test("allows create-base guidance to state that no base hook variable exists", async () => {
    const root = await fixture({
      "repos/arashi-docs/public/llms-full.txt": `${files["repos/arashi-docs/public/llms-full.txt"]} Arashi keeps \`ARASHI_BRANCH_NAME\` target-oriented and deliberately does not provide an \`ARASHI_BASE_BRANCH\` hook or environment variable.`,
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
    [
      "hook execution distinction",
      "remove",
      "skips-hooks",
      "HOOK_INPUT_POLICY_INVALID",
    ],
    [
      "interactive selection distinction",
      "create",
      "interactive",
      "HOOK_INPUT_POLICY_INVALID",
    ],
    ["mode vocabulary", "remove", "modes", "HOOK_INPUT_MODES_INVALID"],
    ["JSON precedence", "create", "precedence", "HOOK_INPUT_JSON_PRECEDENCE"],
    ["immediate EOF", "remove", "stdin", "HOOK_INPUT_STDIN_INVALID"],
    [
      "exact typed policy",
      "create",
      "extra-policy-field",
      "HOOK_INPUT_POLICY_INVALID",
    ],
    [
      "single option registration",
      "remove",
      "duplicate-option",
      "HOOK_INPUT_OPTION_OWNERSHIP",
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
      if (mismatch === "interactive")
        command.options = command.options.filter(
          (option) => option.long !== "--interactive",
        );
      const option = command.options.find(
        (candidate) => candidate.long === "--no-hook-input",
      );
      const policy = option?.semanticPolicy;
      if (mismatch === "persisted" && policy) policy.persisted = true;
      if (mismatch === "skips-hooks" && policy)
        policy.hookInput.skipsHooks = true;
      if (mismatch === "modes" && policy)
        policy.hookInput.modes = ["tty", "disabled", "closed"];
      if (mismatch === "precedence" && policy)
        policy.hookInput.jsonPrecedence = false;
      if (mismatch === "stdin" && policy) policy.hookInput.immediateEof = false;
      if (mismatch === "extra-policy-field" && policy)
        Object.assign(policy, { configurable: true });
      if (mismatch === "duplicate-option" && option)
        command.options.push(structuredClone(option));
      const root = await fixture({
        "repos/arashi/contracts/cli-commands.json": JSON.stringify(contract),
      });
      const result = await checkHookContracts(root);
      expect(result.diagnostics).toContainEqual(
        expect.objectContaining({ code }),
      );
    },
  );
  test("accepts safe cmd choice guidance as native shell coverage", async () => {
    const source = "repos/arashi-skills/skills/arashi/references/hooks.md";
    const root = await fixture({
      [source]: files[source].replace("cmd set /p", "cmd choice /c"),
    });
    const result = await checkHookContracts(root);
    expect(result.diagnostics).not.toContainEqual(
      expect.objectContaining({
        code: "HOOK_INPUT_NATIVE_GUIDANCE_MISSING",
        source,
      }),
    );
  });
  test("rejects guidance without native shell coverage", async () => {
    const source = "repos/arashi-docs/docs/reference/hooks.md";
    const root = await fixture({
      [source]: files[source].replace("cmd set /p", "cmd input"),
    });
    const result = await checkHookContracts(root);
    expect(result.diagnostics).toContainEqual(
      expect.objectContaining({
        code: "HOOK_INPUT_NATIVE_GUIDANCE_MISSING",
        source,
      }),
    );
  });
  test("rejects guidance that omits inherited TTY stdin from the availability matrix", async () => {
    const source = "repos/arashi/docs/hooks.md";
    const root = await fixture({
      [source]: files[source].replace("TTY mode inherits terminal stdin. ", ""),
    });
    const result = await checkHookContracts(root);
    expect(result.diagnostics).toContainEqual(
      expect.objectContaining({
        code: "HOOK_INPUT_GUIDANCE_STDIN_MATRIX_MISSING",
        source,
      }),
    );
  });
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
  test("rejects any unapproved public lifecycle outcome field", async () => {
    const source = "repos/arashi/src/lib/hooks.ts";
    const root = await fixture({
      [source]: files[source].replace(
        "durationMs?: number;",
        "durationMs?: number; answers?: string[];",
      ),
    });
    const result = await checkHookContracts(root);
    expect(result.diagnostics).toContainEqual(
      expect.objectContaining({
        code: "HOOK_INPUT_PUBLIC_OUTCOME_FIELDS_CHANGED",
        source,
      }),
    );
  });
  test.each([
    [
      "generated schema",
      "repos/arashi/schema/config.schema.json",
      JSON.stringify({
        definitions: {
          Config: {
            properties: {
              hooks: { properties: { input: { enum: ["auto", "never"] } } },
            },
          },
        },
      }),
    ],
    [
      "dogfood configuration",
      ".arashi/config.json",
      JSON.stringify({ hooks: { input: "auto", timeout: 300000 } }),
    ],
  ])("rejects persistent hooks.input in %s", async (_name, source, content) => {
    const root = await fixture({ [source]: content });
    const result = await checkHookContracts(root);
    expect(result.diagnostics).toContainEqual(
      expect.objectContaining({
        code: "HOOK_INPUT_PERSISTENT_CONFIG_PUBLISHED",
        source,
      }),
    );
  });
  test.each([
    [
      "PowerShell native input",
      "repos/arashi/tests/windows/hook-input-native.ps1",
      "PowerShell Read-Host",
      "PowerShell input",
      "HOOK_INPUT_WINDOWS_POWERSHELL_ACCEPTANCE_MISSING",
    ],
    [
      "cmd native input",
      "repos/arashi/tests/windows/hook-input-native.ps1",
      "cmd set /p",
      "cmd input",
      "HOOK_INPUT_WINDOWS_CMD_ACCEPTANCE_MISSING",
    ],
    [
      "PowerShell package wrapper",
      "repos/arashi/tests/integration/hook-input-wrapper.test.ts",
      "bin/arashi.ps1",
      "bin/arashi",
      "HOOK_INPUT_WRAPPER_SURFACE_MISSING",
    ],
  ])(
    "rejects acceptance coverage without %s",
    async (_name, source, required, replacement, code) => {
      const root = await fixture({
        [source]: files[source].replace(required, replacement),
      });
      const result = await checkHookContracts(root);
      expect(result.diagnostics).toContainEqual(
        expect.objectContaining({ code, source }),
      );
    },
  );
  test("rejects workflow tokens that are not reachable in the same platform job", async () => {
    const source = "repos/arashi/.github/workflows/ci.yml";
    const root = await fixture({
      [source]: `name: CI
jobs:
  wrappers:
    runs-on: windows-latest
    steps:
      - run: pnpm exec vitest run tests/integration/hook-input-wrapper.test.ts
  native:
    runs-on: ubuntu-latest
    steps:
      - run: pwsh -File tests/windows/hook-input-native.ps1
`,
    });
    const result = await checkHookContracts(root);
    expect(result.diagnostics.map(({ code }) => code)).toEqual(
      expect.arrayContaining([
        "HOOK_INPUT_WRAPPER_ACCEPTANCE_UNREACHABLE",
        "HOOK_INPUT_WINDOWS_ACCEPTANCE_UNREACHABLE",
      ]),
    );
  });
  test.each([
    [
      "archive creation",
      "node repos/arashi-skills/scripts/create-release-archive.mjs --root repos/arashi-skills --output arashi-skill-package.tar.gz",
      "HOOK_INPUT_SKILLS_ARCHIVE_CREATION_UNREACHABLE",
    ],
    [
      "archive verification",
      "node repos/arashi-skills/scripts/create-release-archive.mjs --verify arashi-skill-package.tar.gz",
      "HOOK_INPUT_SKILLS_ARCHIVE_VERIFICATION_UNREACHABLE",
    ],
    [
      "package-check destination creation",
      "mkdir package-check",
      "HOOK_INPUT_SKILLS_PACKAGE_DESTINATION_UNREACHABLE",
    ],
    [
      "archive extraction",
      "tar -xzf arashi-skill-package.tar.gz -C package-check",
      "HOOK_INPUT_SKILLS_PACKAGE_EXTRACTION_UNREACHABLE",
    ],
  ])(
    "rejects missing %s before packaged skill validation",
    async (_label, command, code) => {
      const workflow =
        files[".github/workflows/cross-repo-command-contracts.yml"];
      const root = await fixture({
        ".github/workflows/cross-repo-command-contracts.yml": workflow.replace(
          `${command}\n`,
          "",
        ),
      });

      expect((await checkHookContracts(root)).diagnostics).toContainEqual(
        expect.objectContaining({
          code,
          source: ".github/workflows/cross-repo-command-contracts.yml",
        }),
      );
    },
  );
  test("rejects packaged skill prerequisites isolated in a different workflow job", async () => {
    const workflow =
      files[".github/workflows/cross-repo-command-contracts.yml"];
    const prerequisiteBlock = `      - run: |
          node repos/arashi-skills/scripts/create-release-archive.mjs --root repos/arashi-skills --output arashi-skill-package.tar.gz
          node repos/arashi-skills/scripts/create-release-archive.mjs --verify arashi-skill-package.tar.gz
          mkdir package-check
          tar -xzf arashi-skill-package.tar.gz -C package-check
`;
    const root = await fixture({
      ".github/workflows/cross-repo-command-contracts.yml": workflow
        .replace(prerequisiteBlock, "")
        .replace(
          "jobs:\n",
          `jobs:
  package-producer:
    steps:
${prerequisiteBlock}`,
        ),
    });

    expect(
      (await checkHookContracts(root)).diagnostics.map(({ code }) => code),
    ).toEqual(
      expect.arrayContaining([
        "HOOK_INPUT_SKILLS_ARCHIVE_CREATION_UNREACHABLE",
        "HOOK_INPUT_SKILLS_PACKAGE_DESTINATION_UNREACHABLE",
        "HOOK_INPUT_SKILLS_PACKAGE_EXTRACTION_UNREACHABLE",
      ]),
    );
  });
  test("rejects packaged skill prerequisites in an unusable order", async () => {
    const workflow =
      files[".github/workflows/cross-repo-command-contracts.yml"];
    const root = await fixture({
      ".github/workflows/cross-repo-command-contracts.yml": workflow.replace(
        `          node repos/arashi-skills/scripts/create-release-archive.mjs --root repos/arashi-skills --output arashi-skill-package.tar.gz
          node repos/arashi-skills/scripts/create-release-archive.mjs --verify arashi-skill-package.tar.gz
          mkdir package-check
          tar -xzf arashi-skill-package.tar.gz -C package-check`,
        `          tar -xzf arashi-skill-package.tar.gz -C package-check
          mkdir package-check
          node repos/arashi-skills/scripts/create-release-archive.mjs --verify arashi-skill-package.tar.gz
          node repos/arashi-skills/scripts/create-release-archive.mjs --root repos/arashi-skills --output arashi-skill-package.tar.gz`,
      ),
    });

    expect((await checkHookContracts(root)).diagnostics).toContainEqual(
      expect.objectContaining({
        code: "HOOK_INPUT_SKILLS_PACKAGE_PREREQUISITE_ORDER_INVALID",
      }),
    );
  });
  test.each([
    [
      "docs source checker",
      "pnpm --dir repos/arashi-docs validate:semantic-docs",
      "HOOK_INPUT_DOCS_CHECK_UNREACHABLE",
    ],
    [
      "skills source checker",
      "node repos/arashi-skills/scripts/validate-guidance.mjs",
      "HOOK_INPUT_SKILLS_SOURCE_CHECK_UNREACHABLE",
    ],
    [
      "skills extracted-package checker",
      "node repos/arashi-skills/scripts/validate-guidance.mjs --skill-root package-check/skills/arashi",
      "HOOK_INPUT_SKILLS_PACKAGE_CHECK_UNREACHABLE",
    ],
  ])("rejects missing %s reachability", async (_label, command, code) => {
    const root = await fixture({
      ".github/workflows/cross-repo-command-contracts.yml": files[
        ".github/workflows/cross-repo-command-contracts.yml"
      ].replace(`${command}\n`, ""),
    });

    expect((await checkHookContracts(root)).diagnostics).toContainEqual(
      expect.objectContaining({
        code,
        source: ".github/workflows/cross-repo-command-contracts.yml",
      }),
    );
  });
  test("rejects missing wrapper, native Windows, or checker workflow reachability", async () => {
    const root = await fixture({
      "repos/arashi/.github/workflows/ci.yml": "runs-on: ubuntu-latest",
      ".github/workflows/cross-repo-command-contracts.yml": files[
        ".github/workflows/cross-repo-command-contracts.yml"
      ].replace("pnpm contracts:check:ci", "pnpm test"),
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
