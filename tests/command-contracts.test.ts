import { readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import { formatHuman } from "../scripts/command-contracts";
import {
  checkContracts,
  createLaunchContract,
  fixture,
  option,
} from "./command-contracts.fixtures";
describe("cross-repository command contracts", () => {
  test("accepts coverage and reports intentional exclusions as info", async () => {
    const result = await checkContracts(await fixture());
    expect(result.ok, JSON.stringify(result.diagnostics, null, 2)).toBe(true);
    expect(result.diagnostics.map((d) => d.code)).toEqual([
      "DOCS_EXCLUDED",
      "SKILLS_EXCLUDED",
      "VSCODE_EXCLUDED",
    ]);
  });
  test("rejects a controlled linked-add materialization contract mismatch", async () => {
    const root = await fixture();
    const contractPath = join(root, "repos/arashi/contracts/cli-commands.json");
    const contract = JSON.parse(await readFile(contractPath, "utf8"));
    contract.commands.find(
      (command: { path: string }) => command.path === "add",
    ).semantics.addMaterialization.activeConfigOwnership = false;
    await writeFile(contractPath, JSON.stringify(contract));

    expect((await checkContracts(root)).diagnostics).toContainEqual(
      expect.objectContaining({
        code: "ADD_MATERIALIZATION_MISMATCH",
        source: "repos/arashi/contracts/cli-commands.json",
      }),
    );
  });
  test("rejects a controlled out-of-repository linked-add guidance mismatch", async () => {
    const root = await fixture();
    await writeFile(
      join(root, "repos/arashi-docs/docs/commands/add.md"),
      "# Add\nClone a repository.\n",
    );

    expect((await checkContracts(root)).diagnostics).toContainEqual(
      expect.objectContaining({
        category: "docs",
        code: "ADD_MATERIALIZATION_GUIDANCE_MISMATCH",
        source: "repos/arashi-docs/docs/commands/add.md",
      }),
    );
  });
  test("accepts schema v4 generic typed option policies for create and switch", async () => {
    const result = await checkContracts(await fixture());
    expect(result.diagnostics).not.toContainEqual(
      expect.objectContaining({ code: "OPTION_POLICY_MISMATCH" }),
    );
    expect(result.ok).toBe(true);
  });
  test("ordinary mutation fixtures do not execute focused checker subprocesses", async () => {
    const root = await fixture();
    await writeFile(
      join(root, "repos/arashi-docs/scripts/check-tab-launch-docs.ts"),
      "process.exit(9);\n",
    );

    expect((await checkContracts(root)).diagnostics).not.toContainEqual(
      expect.objectContaining({ code: "DOCS_OPTION_POLICY_CHECK_FAILED" }),
    );
  });
  test("accepts an arbitrary typed policy when its command option and skills coverage exist", async () => {
    const root = await fixture();
    const contractPath = join(root, "repos/arashi/contracts/cli-commands.json");
    const contract = JSON.parse(await readFile(contractPath, "utf8"));
    const create = contract.commands.find(
      (command: { path: string }) => command.path === "create",
    );
    create.options.push(option("--future-mode"));
    create.semantics.optionPolicies["--future-mode"] = {
      compatibleOptions: [],
      conflicts: [],
      implies: ["launch"],
      json: {
        guardPrecedence: "before-option-validation",
        mode: "interactive-or-launch",
        unsupported: true,
      },
      persisted: false,
    };
    await writeFile(contractPath, JSON.stringify(contract));
    const coveragePath = join(
      root,
      "repos/arashi-skills/contracts/command-coverage.json",
    );
    const coverage = JSON.parse(await readFile(coveragePath, "utf8"));
    coverage.commands
      .find((command: { name: string }) => command.name === "create")
      .requiredOptions.push("--future-mode");
    await writeFile(coveragePath, JSON.stringify(coverage));

    expect((await checkContracts(root)).ok).toBe(true);
  });
  test("rejects an option policy whose key is not an option on that exact command", async () => {
    const root = await fixture();
    const contractPath = join(root, "repos/arashi/contracts/cli-commands.json");
    const contract = JSON.parse(await readFile(contractPath, "utf8"));
    contract.commands
      .find((command: { path: string }) => command.path === "switch")
      .options.push(option("--future-mode"));
    contract.commands.find(
      (command: { path: string }) => command.path === "create",
    ).semantics.optionPolicies["--future-mode"] = {
      compatibleOptions: [],
      conflicts: [],
      implies: [],
      json: {
        guardPrecedence: "before-option-validation",
        mode: "interactive-or-launch",
        unsupported: true,
      },
      persisted: false,
    };
    await writeFile(contractPath, JSON.stringify(contract));

    expect((await checkContracts(root)).diagnostics).toContainEqual(
      expect.objectContaining({
        code: "OPTION_POLICY_OPTION_MISSING",
        subject: "create.--future-mode",
      }),
    );
  });
  test("requires skills coverage for every generic option policy", async () => {
    const root = await fixture();
    const contractPath = join(root, "repos/arashi/contracts/cli-commands.json");
    const contract = JSON.parse(await readFile(contractPath, "utf8"));
    const create = contract.commands.find(
      (command: { path: string }) => command.path === "create",
    );
    create.options.push(option("--future-mode"));
    create.semantics.optionPolicies["--future-mode"] = {
      compatibleOptions: [],
      conflicts: [],
      implies: [],
      json: {
        guardPrecedence: "before-option-validation",
        mode: "interactive-or-launch",
        unsupported: true,
      },
      persisted: false,
    };
    await writeFile(contractPath, JSON.stringify(contract));

    expect((await checkContracts(root)).diagnostics).toContainEqual(
      expect.objectContaining({
        code: "SKILLS_OPTION_POLICY_MISMATCH",
        subject: "create.--future-mode",
      }),
    );
  });
  test("rejects an excluded skills command whose option policy is absent from requiredOptions", async () => {
    const root = await fixture();
    const contractPath = join(root, "repos/arashi/contracts/cli-commands.json");
    const contract = JSON.parse(await readFile(contractPath, "utf8"));
    const old = contract.commands.find(
      (command: { path: string }) => command.path === "old",
    );
    old.options.push(option("--future-mode"));
    old.semantics.optionPolicies = {
      "--future-mode": {
        compatibleOptions: [],
        conflicts: [],
        implies: [],
        json: {
          guardPrecedence: "before-option-validation",
          mode: "interactive",
          unsupported: true,
        },
        persisted: false,
      },
    };
    await writeFile(contractPath, JSON.stringify(contract));

    expect((await checkContracts(root)).diagnostics).toContainEqual(
      expect.objectContaining({
        code: "SKILLS_OPTION_POLICY_MISMATCH",
        subject: "old.--future-mode",
      }),
    );
  });
  test("accepts an excluded skills command whose option policy is represented in requiredOptions", async () => {
    const root = await fixture();
    const contractPath = join(root, "repos/arashi/contracts/cli-commands.json");
    const contract = JSON.parse(await readFile(contractPath, "utf8"));
    const old = contract.commands.find(
      (command: { path: string }) => command.path === "old",
    );
    old.options.push(option("--future-mode"));
    old.semantics.optionPolicies = {
      "--future-mode": {
        compatibleOptions: [],
        conflicts: [],
        implies: [],
        json: {
          guardPrecedence: "before-option-validation",
          mode: "interactive",
          unsupported: true,
        },
        persisted: false,
      },
    };
    await writeFile(contractPath, JSON.stringify(contract));

    const coveragePath = join(
      root,
      "repos/arashi-skills/contracts/command-coverage.json",
    );
    const coverage = JSON.parse(await readFile(coveragePath, "utf8"));
    coverage.commands.find(
      (command: { name: string }) => command.name === "old",
    ).requiredOptions = ["--future-mode"];
    await writeFile(coveragePath, JSON.stringify(coverage));

    expect((await checkContracts(root)).ok).toBe(true);
  });
  test.each([
    [
      "extra top-level field",
      (policy: Record<string, unknown>) => (policy.extra = true),
    ],
    [
      "extra nested field",
      (policy: Record<string, unknown>) =>
        ((policy.json as Record<string, unknown>).extra = true),
    ],
    [
      "overlapping launcher classification",
      (policy: Record<string, unknown>) =>
        ((policy.launcherSupport as Record<string, unknown>).unsupported = [
          "tmux",
        ]),
    ],
    [
      "persisted option policy",
      (policy: Record<string, unknown>) => (policy.persisted = true),
    ],
    [
      "JSON-supported option policy",
      (policy: Record<string, unknown>) =>
        ((policy.json as Record<string, unknown>).unsupported = false),
    ],
    [
      "unsupported dry-run policy",
      (policy: Record<string, unknown>) =>
        ((policy.dryRun as Record<string, unknown>).supported = false),
    ],
    [
      "launcher policy that permits fallback",
      (policy: Record<string, unknown>) =>
        ((policy.launcherSupport as Record<string, unknown>).noFallback =
          false),
    ],
  ])("rejects generic policy malformed shape: %s", async (_label, mutate) => {
    const root = await fixture();
    const contractPath = join(root, "repos/arashi/contracts/cli-commands.json");
    const contract = JSON.parse(await readFile(contractPath, "utf8"));
    mutate(
      contract.commands.find(
        (command: { path: string }) => command.path === "create",
      ).semantics.optionPolicies["--tab"],
    );
    await writeFile(contractPath, JSON.stringify(contract));

    expect((await checkContracts(root)).diagnostics).toContainEqual(
      expect.objectContaining({
        code: "SCHEMA_INVALID",
        subject: "create.--tab",
      }),
    );
  });
  test("rejects the previous command contract schema without applying schema 4 rules", async () => {
    const root = await fixture();
    const path = join(root, "repos/arashi/contracts/cli-commands.json");
    const data = JSON.parse(await readFile(path, "utf8"));
    data.schemaVersion = 3;
    data.cliVersion = "1.20.1";
    await writeFile(path, JSON.stringify(data));

    const diagnostics = (await checkContracts(root)).diagnostics;
    expect(diagnostics).toContainEqual(
      expect.objectContaining({
        code: "SCHEMA_VERSION_UNSUPPORTED",
        source: "repos/arashi/contracts/cli-commands.json",
        subject: "3",
      }),
    );
    expect(diagnostics).not.toContainEqual(
      expect.objectContaining({
        code: "SCHEMA_INVALID",
        subject: "cliVersion",
      }),
    );
  });
  test("rejects package release metadata in schema version 4", async () => {
    const root = await fixture();
    const path = join(root, "repos/arashi/contracts/cli-commands.json");
    const data = JSON.parse(await readFile(path, "utf8"));
    data.cliVersion = "1.20.1";
    await writeFile(path, JSON.stringify(data));

    expect((await checkContracts(root)).diagnostics).toContainEqual(
      expect.objectContaining({
        code: "SCHEMA_INVALID",
        source: "repos/arashi/contracts/cli-commands.json",
        subject: "cliVersion",
      }),
    );
  });
  test.each([
    [
      "semantic drift",
      (policy: Record<string, unknown>) => (policy.overrides = []),
    ],
    [
      "missing policy",
      (_policy: Record<string, unknown>, policies: Record<string, unknown>) =>
        delete policies["--tab"],
    ],
  ])("rejects create --tab %s", async (_label, mutate) => {
    const root = await fixture();
    const path = join(root, "repos/arashi/contracts/cli-commands.json");
    const data = JSON.parse(await readFile(path, "utf8"));
    const policies = data.commands.find(
      (command: { path: string }) => command.path === "create",
    ).semantics.optionPolicies;
    mutate(policies["--tab"], policies);
    await writeFile(path, JSON.stringify(data));

    expect((await checkContracts(root)).diagnostics).toContainEqual(
      expect.objectContaining({
        code: "OPTION_POLICY_MISMATCH",
        source: "repos/arashi/contracts/cli-commands.json",
        subject: "create.--tab",
      }),
    );
  });
  test("rejects missing --tab skills coverage generically", async () => {
    const root = await fixture();
    const path = join(
      root,
      "repos/arashi-skills/contracts/command-coverage.json",
    );
    const data = JSON.parse(await readFile(path, "utf8"));
    data.commands.find(
      (command: { name: string }) => command.name === "switch",
    ).requiredOptions = ["--tmux"];
    await writeFile(path, JSON.stringify(data));

    expect((await checkContracts(root)).diagnostics).toContainEqual(
      expect.objectContaining({
        category: "skills",
        code: "SKILLS_OPTION_POLICY_MISMATCH",
        subject: "switch.--tab",
      }),
    );
  });
  test.each([
    [
      "docs",
      "pnpm --dir repos/arashi-docs validate:semantic-docs",
      "DOCS_OPTION_POLICY_CHECK_UNREACHABLE",
    ],
    [
      "skills",
      "node repos/arashi-skills/scripts/validate-guidance.mjs",
      "SKILLS_OPTION_POLICY_CHECK_UNREACHABLE",
    ],
  ])(
    "rejects missing %s focused option-policy CI coverage",
    async (_label, command, code) => {
      const root = await fixture();
      const path = join(
        root,
        ".github/workflows/cross-repo-command-contracts.yml",
      );
      const workflow = await readFile(path, "utf8");
      await writeFile(path, workflow.replace(`run: ${command}\n`, ""));

      expect((await checkContracts(root)).diagnostics).toContainEqual(
        expect.objectContaining({
          code,
          source: ".github/workflows/cross-repo-command-contracts.yml",
        }),
      );
    },
  );
  test.each([
    [
      "comment-only text",
      "# run: pnpm --dir repos/arashi-docs validate:semantic-docs\n# run: node repos/arashi-skills/scripts/validate-guidance.mjs\n",
    ],
    [
      "non-run step fields",
      'jobs:\n  contracts:\n    steps:\n      - name: "run: pnpm --dir repos/arashi-docs validate:semantic-docs"\n        env:\n          NOTE: "run: node repos/arashi-skills/scripts/validate-guidance.mjs"\n        uses: actions/checkout@v4\n',
    ],
    [
      "uses step with with.run",
      "jobs:\n  contracts:\n    steps:\n      - uses: actions/checkout@v4\n        with:\n          run: pnpm --dir repos/arashi-docs validate:semantic-docs\n      - uses: actions/checkout@v4\n        with:\n          run: node repos/arashi-skills/scripts/validate-guidance.mjs\n",
    ],
    [
      "uses step with env.run",
      "jobs:\n  contracts:\n    steps:\n      - uses: actions/checkout@v4\n        env:\n          run: pnpm --dir repos/arashi-docs validate:semantic-docs\n      - uses: actions/checkout@v4\n        env:\n          run: node repos/arashi-skills/scripts/validate-guidance.mjs\n",
    ],
    [
      "nested arbitrary run objects",
      "jobs:\n  contracts:\n    steps:\n      - name: docs\n        metadata:\n          run: pnpm --dir repos/arashi-docs validate:semantic-docs\n      - name: skills\n        metadata:\n          run: node repos/arashi-skills/scripts/validate-guidance.mjs\n",
    ],
  ])("rejects focused checker reachability in %s", async (_label, workflow) => {
    const root = await fixture();
    await writeFile(
      join(root, ".github/workflows/cross-repo-command-contracts.yml"),
      workflow,
    );

    const codes = (await checkContracts(root)).diagnostics.map(
      (diagnostic) => diagnostic.code,
    );
    expect(codes).toContain("DOCS_OPTION_POLICY_CHECK_UNREACHABLE");
    expect(codes).toContain("SKILLS_OPTION_POLICY_CHECK_UNREACHABLE");
  });
  test.each([
    [
      "docs configured-launcher override drift",
      "repos/arashi-docs/docs/reference/launching.md",
      (content: string) =>
        content.replace(
          "bypasses configured launcher defaults",
          "retains configured launcher defaults",
        ),
      "DOCS_TAB_POLICY_MISMATCH",
    ],
    [
      "docs create configured-launcher override drift",
      "repos/arashi-docs/docs/reference/launching.md",
      (content: string) =>
        content.replace(
          "For create, create tab implies launch and switch, wins over `--no-launch` and `--no-switch`, and bypasses configured launcher defaults.",
          "For create, create tab implies launch and switch and retains configured launcher defaults.",
        ),
      "DOCS_TAB_POLICY_MISMATCH",
    ],
    [
      "docs Terminal.app capability drift",
      "repos/arashi-docs/docs/reference/launching.md",
      (content: string) =>
        content.replace(
          "| Terminal.app | New window | Unsupported | No supported true-tab automation |",
          "| Terminal.app | New window | True tab | Current application/window |",
        ),
      "DOCS_TAB_POLICY_MISMATCH",
    ],
    [
      "docs Terminal.app guidance drift",
      "repos/arashi-docs/docs/reference/launching.md",
      (content: string) =>
        content.replace("press Command-T manually", "create a tab somehow"),
      "DOCS_TAB_POLICY_MISMATCH",
    ],
    [
      "docs invalid Terminal.app path-substitution guidance",
      "repos/arashi-docs/docs/reference/launching.md",
      (content: string) =>
        `${content}\nWithout shell integration, run \`cd "$(aw switch --no-cd --no-default-launch)"\`.\n`,
      "DOCS_TAB_POLICY_MISMATCH",
    ],
    [
      "docs default disposition drift",
      "repos/arashi-docs/docs/reference/launching.md",
      (content: string) =>
        content.replace(
          "| Windows Terminal | New window | True tab |",
          "| Windows Terminal | Reused current window | True tab |",
        ),
      "DOCS_TAB_POLICY_MISMATCH",
    ],
    [
      "docs missing old Ghostty row",
      "repos/arashi-docs/docs/reference/launching.md",
      (content: string) =>
        content.replace(
          "| macOS Ghostty older than 1.3 or missing supported-version evidence | New window | Unsupported | No supported tab API |\n",
          "",
        ),
      "DOCS_TAB_POLICY_MISMATCH",
    ],
    [
      "docs launcher mapping",
      "repos/arashi-docs/docs/reference/launching.md",
      (content: string) =>
        content.replace(
          "| WezTerm | New window | True tab |",
          "| WezTerm | New window | Unsupported |",
        ),
      "DOCS_TAB_POLICY_MISMATCH",
    ],
    [
      "docs unknown launcher row",
      "repos/arashi-docs/docs/reference/launching.md",
      (content: string) =>
        content.replace(
          "| generic fallback | New terminal/platform window | Unsupported | No portable exact tab target |",
          "| Surprise Terminal | New window | True tab | Exact surprise target |\n| generic fallback | New terminal/platform window | Unsupported | No portable exact tab target |",
        ),
      "DOCS_TAB_POLICY_MISMATCH",
    ],
    [
      "docs JSON guard mode",
      "repos/arashi-docs/docs/reference/launching.md",
      (content: string) => content.replace("`launch` mode", "`cd` mode"),
      "DOCS_TAB_POLICY_MISMATCH",
    ],
    [
      "docs no-fallback guarantee",
      "repos/arashi-docs/docs/reference/launching.md",
      (content: string) =>
        content.replace(
          "never opens a window or falls through to another launcher",
          "may fall back to a window",
        ),
      "DOCS_TAB_POLICY_MISMATCH",
    ],
  ])(
    "rejects contradictory companion semantics: %s",
    async (_label, relativePath, mutate, code) => {
      const root = await fixture();
      const path = join(root, relativePath);
      await writeFile(path, mutate(await readFile(path, "utf8")));

      expect((await checkContracts(root)).diagnostics).toContainEqual(
        expect.objectContaining({ code }),
      );
    },
  );
  test.each([
    [
      "docs",
      "repos/arashi-docs/scripts/check-tab-launch-docs.ts",
      "DOCS_OPTION_POLICY_CHECK_FAILED",
    ],
    [
      "skills",
      "repos/arashi-skills/scripts/tab-launch-disposition-guidance-selftest.mjs",
      "SKILLS_OPTION_POLICY_CHECK_FAILED",
    ],
  ])(
    "rejects an empty %s focused checker stub",
    async (_label, relativePath, code) => {
      const root = await fixture();
      await writeFile(join(root, relativePath), "// empty fixture stub\n");

      expect((await checkContracts(root)).diagnostics).toContainEqual(
        expect.objectContaining({ code }),
      );
    },
  );
  test("finds missing docs page and index entry", async () => {
    const root = await fixture();
    await rm(join(root, "repos/arashi-docs/docs/commands/add.md"));
    await writeFile(
      join(root, "repos/arashi-docs/docs/commands/index.md"),
      "# Commands\n",
    );
    const codes = (await checkContracts(root)).diagnostics.map((d) => d.code);
    for (const code of ["DOCS_INDEX_MISSING", "DOCS_PAGE_MISSING"])
      expect(codes).toContain(code);
  });
  test("finds stale structured and constrained prose skills references", async () => {
    const root = await fixture();
    const path = join(
      root,
      "repos/arashi-skills/contracts/command-coverage.json",
    );
    const data = JSON.parse(await readFile(path, "utf8"));
    data.commands.push({
      name: "gone",
      status: "covered",
      reference: "references/commands.md",
    });
    await writeFile(path, JSON.stringify(data));
    await writeFile(
      join(root, "repos/arashi-skills/skills/arashi/references/commands.md"),
      "Use `arashi vanished --json`.\n",
    );
    const codes = (await checkContracts(root)).diagnostics.map((d) => d.code);
    for (const code of ["SKILLS_STALE_COVERAGE", "SKILLS_STALE_REFERENCE"])
      expect(codes).toContain(code);
  });
  test("rejects normalized standalone classification drift", async () => {
    const root = await fixture();
    const path = join(root, "repos/arashi/contracts/cli-commands.json");
    const data = JSON.parse(await readFile(path, "utf8"));
    data.commands.find(
      (command: { path: string }) => command.path === "add",
    ).semantics.standalone = {
      support: "configured-only",
      reason: "Changed CLI policy.",
    };
    await writeFile(path, JSON.stringify(data));

    expect((await checkContracts(root)).diagnostics).toContainEqual(
      expect.objectContaining({
        code: "SKILLS_STANDALONE_MISMATCH",
        subject: "add",
      }),
    );
  });
  test("rejects init options that are not classified for zero-config mode", async () => {
    const root = await fixture();
    const path = join(root, "repos/arashi/contracts/cli-commands.json");
    const data = JSON.parse(await readFile(path, "utf8"));
    data.commands
      .find((command: { path: string }) => command.path === "init")
      .options.push({
        description: "future mode",
        flags: "--future-mode",
        optional: false,
        required: false,
        variadic: false,
      });
    await writeFile(path, JSON.stringify(data));

    expect((await checkContracts(root)).diagnostics).toContainEqual(
      expect.objectContaining({ code: "STANDALONE_INIT_POLICY_INVALID" }),
    );
  });
  test.each([
    [
      "policy",
      (semantics: Record<string, unknown>) => delete semantics.zeroConfig,
    ],
    [
      "reason",
      (semantics: Record<string, unknown>) =>
        delete (semantics.standalone as Record<string, unknown>).reason,
    ],
    [
      "dry-run support",
      (semantics: Record<string, unknown>) =>
        ((
          (semantics.zeroConfig as Record<string, unknown>).dryRun as Record<
            string,
            unknown
          >
        ).supported = false),
    ],
    [
      "JSON support",
      (semantics: Record<string, unknown>) =>
        ((
          (semantics.zeroConfig as Record<string, unknown>).json as Record<
            string,
            unknown
          >
        ).supported = false),
    ],
    [
      "compatible options",
      (semantics: Record<string, unknown>) =>
        (
          (semantics.zeroConfig as Record<string, unknown>)
            .compatibleOptions as unknown[]
        ).pop(),
    ],
    [
      "incompatible options",
      (semantics: Record<string, unknown>) =>
        (
          (semantics.zeroConfig as Record<string, unknown>)
            .incompatibleOptions as unknown[]
        ).pop(),
    ],
  ])(
    "requires complete init --zero-config %s metadata",
    async (_label, mutate) => {
      const root = await fixture();
      const path = join(root, "repos/arashi/contracts/cli-commands.json");
      const data = JSON.parse(await readFile(path, "utf8"));
      mutate(
        data.commands.find(
          (command: { path: string }) => command.path === "init",
        ).semantics,
      );
      await writeFile(path, JSON.stringify(data));

      const codes = (await checkContracts(root)).diagnostics.map(
        (diagnostic) => diagnostic.code,
      );
      expect(codes).toContain(
        _label === "reason"
          ? "POLICY_REASON_REQUIRED"
          : "STANDALONE_INIT_POLICY_INVALID",
      );
    },
  );
  test.each([
    [
      "conflicts",
      (policy: Record<string, unknown>) => (policy.conflicts = ["--sesh"]),
    ],
    [
      "environment prerequisite",
      (policy: Record<string, unknown>) =>
        (policy.environment = { name: "TMUX", nonEmptyAfterTrim: false }),
    ],
    [
      "implications",
      (policy: Record<string, unknown>) => (policy.implies = []),
    ],
    [
      "JSON precedence and label",
      (policy: Record<string, unknown>) =>
        (policy.json = {
          guardPrecedence: "after-option-validation",
          mode: "wrong",
          unsupported: true,
        }),
    ],
    [
      "persistence",
      (policy: Record<string, unknown>) => (policy.persisted = true),
    ],
  ])("rejects switch --tmux %s drift", async (_label, mutate) => {
    const root = await fixture();
    const contractPath = join(root, "repos/arashi/contracts/cli-commands.json");
    const contract = JSON.parse(await readFile(contractPath, "utf8"));
    const tmuxPolicy = contract.commands.find(
      (command: { path: string }) => command.path === "switch",
    ).semantics.optionPolicies["--tmux"];
    mutate(tmuxPolicy);
    await writeFile(contractPath, JSON.stringify(contract));

    expect((await checkContracts(root)).diagnostics).toContainEqual(
      expect.objectContaining({
        code: "OPTION_POLICY_MISMATCH",
        subject: "switch.--tmux",
      }),
    );
  });
  test("rejects missing skills --tmux coverage", async () => {
    const root = await fixture();
    const coveragePath = join(
      root,
      "repos/arashi-skills/contracts/command-coverage.json",
    );
    const coverage = JSON.parse(await readFile(coveragePath, "utf8"));
    const createCoverage = coverage.commands.find(
      (command: { name: string }) => command.name === "create",
    );
    createCoverage.requiredOptions = ["--tab"];
    await writeFile(coveragePath, JSON.stringify(coverage));

    expect((await checkContracts(root)).diagnostics).toContainEqual(
      expect.objectContaining({
        code: "SKILLS_OPTION_POLICY_MISMATCH",
        subject: "create.--tmux",
      }),
    );

    createCoverage.requiredOptions = ["--tab", "--tmux", "--future-option"];
    await writeFile(coveragePath, JSON.stringify(coverage));
    expect((await checkContracts(root)).diagnostics).not.toContainEqual(
      expect.objectContaining({
        code: "SKILLS_OPTION_POLICY_MISMATCH",
        subject: "create.--tmux",
      }),
    );

    const contractPath = join(root, "repos/arashi/contracts/cli-commands.json");
    const contract = JSON.parse(await readFile(contractPath, "utf8"));
    contract.commands.find(
      (command: { path: string }) => command.path === "create",
    ).semantics.optionPolicies["--tmux"].conflicts = ["--sesh"];
    await writeFile(contractPath, JSON.stringify(contract));
    expect((await checkContracts(root)).diagnostics).toContainEqual(
      expect.objectContaining({
        code: "OPTION_POLICY_MISMATCH",
        subject: "create.--tmux",
      }),
    );
  });
  test("finds unresolved parity, invalid mappings, and undeclared extension commands", async () => {
    const root = await fixture();
    const policyPath = join(
      root,
      "repos/arashi-vscode/contracts/command-policy.json",
    );
    const policy = JSON.parse(await readFile(policyPath, "utf8"));
    delete policy.cliCommands.add;
    policy.cliCommands.gone = { state: "mapped", commands: ["arashi.missing"] };
    await writeFile(policyPath, JSON.stringify(policy));
    const codes = (await checkContracts(root)).diagnostics.map((d) => d.code);
    for (const code of [
      "VSCODE_INVALID_CLI",
      "VSCODE_INVALID_COMMAND",
      "VSCODE_PARITY_MISSING",
    ])
      expect(codes).toContain(code);
  });
  test("rejects unsupported versions and exclusions without reasons", async () => {
    const root = await fixture();
    const path = join(
      root,
      "repos/arashi-skills/contracts/command-coverage.json",
    );
    await writeFile(
      path,
      JSON.stringify({
        schemaVersion: 2,
        commands: [{ name: "old", status: "excluded" }],
      }),
    );
    const codes = (await checkContracts(root)).diagnostics.map((d) => d.code);
    for (const code of ["POLICY_REASON_REQUIRED", "SCHEMA_VERSION_UNSUPPORTED"])
      expect(codes).toContain(code);
  });
  test("accepts managed Kitty in the canonical automatic launcher order", async () => {
    const root = await fixture();
    const autoOrder = [
      "tmux",
      "herdr",
      "cmux",
      "ide",
      "kitty",
      "cd",
      "platform",
    ];
    for (const relativePath of [
      "repos/arashi-docs/contracts/switch-config.json",
      "repos/arashi-skills/contracts/switch-config.json",
    ]) {
      const path = join(root, relativePath);
      const data = JSON.parse(await readFile(path, "utf8"));
      data.autoOrder = autoOrder;
      await writeFile(path, JSON.stringify(data));
    }

    expect(
      (await checkContracts(root)).diagnostics.filter(
        (diagnostic) => diagnostic.code === "SWITCH_CONFIG_MISMATCH",
      ),
    ).toEqual([]);
  });
  test("rejects a controlled switch-configuration semantic mismatch", async () => {
    const root = await fixture();
    const path = join(root, "repos/arashi-docs/contracts/switch-config.json");
    const data = JSON.parse(await readFile(path, "utf8"));
    data.autoOrder = ["cd", "tmux", "herdr", "cmux", "ide", "platform"];
    await writeFile(path, JSON.stringify(data));

    expect((await checkContracts(root)).diagnostics).toContainEqual(
      expect.objectContaining({
        code: "SWITCH_CONFIG_MISMATCH",
        source: "repos/arashi-docs/contracts/switch-config.json",
        subject: "autoOrder",
      }),
    );
  });
  test.each([
    { subject: "minimumVersion", value: "0.42.0" },
    { subject: "remoteControl.required", value: false },
    { subject: "identity.exactMatch", value: false },
    { subject: "reuse.automaticWindowCleanup", value: true },
    { subject: "locking.timeoutMs", value: 9_999 },
    { subject: "locking.ownershipSafeRelease", value: false },
    { subject: "session.persistentFiles", value: true },
    { subject: "session.removeClosesWindows", value: true },
    { subject: "selection.autoDetectedOnly", value: false },
    { remove: true, subject: "selection.failClosed" },
  ])(
    "rejects controlled Kitty semantic drift at $subject",
    async ({ remove, subject, value }) => {
      const root = await fixture();
      const path = join(
        root,
        "repos/arashi-docs/contracts/kitty-worktree-sessions.json",
      );
      const data = JSON.parse(await readFile(path, "utf8")) as Record<
        string,
        unknown
      >;
      const segments = subject.split(".");
      const leaf = segments.pop()!;
      let parent = data;
      for (const segment of segments) {
        parent = parent[segment] as Record<string, unknown>;
      }
      if (remove) {
        delete parent[leaf];
      } else {
        parent[leaf] = value;
      }
      await writeFile(path, JSON.stringify(data));

      expect((await checkContracts(root)).diagnostics).toContainEqual(
        expect.objectContaining({
          code: "KITTY_WORKTREE_SESSION_MISMATCH",
          source: "repos/arashi-docs/contracts/kitty-worktree-sessions.json",
          subject,
        }),
      );
    },
  );
  test("rejects Kitty semantic drift in canonical human guidance", async () => {
    const root = await fixture();
    const path = join(root, "repos/arashi-docs/docs/workflows/kitty.md");
    const content = await readFile(path, "utf8");
    await writeFile(
      path,
      content.replace("Kitty 0.43 or newer", "Kitty 0.42 or newer"),
    );

    expect((await checkContracts(root)).diagnostics).toContainEqual(
      expect.objectContaining({
        code: "KITTY_GUIDANCE_MISMATCH",
        source: "repos/arashi-docs/docs/workflows/kitty.md",
        subject: "Kitty 0.43 or newer",
      }),
    );
  });
  test("rejects a controlled create-launch semantic mismatch", async () => {
    const root = await fixture();
    const contract = createLaunchContract;
    const skillsPath = join(
      root,
      "repos/arashi-skills/contracts/create-launch-config.json",
    );
    const docsPath = join(
      root,
      "repos/arashi-docs/contracts/create-launch-config.json",
    );
    await writeFile(skillsPath, JSON.stringify(contract));
    await writeFile(
      docsPath,
      JSON.stringify({
        ...contract,
        modes: ["none", "auto", "sesh", "herdr", "drift"],
      }),
    );

    expect((await checkContracts(root)).diagnostics).toContainEqual(
      expect.objectContaining({
        code: "CREATE_CONFIG_MISMATCH",
        source: "repos/arashi-docs/contracts/create-launch-config.json",
        subject: "modes",
      }),
    );
  });
  test("derives coordinated create semantics from the CLI contract and schema", async () => {
    const root = await fixture();
    const modes = ["none", "auto", "sesh", "herdr", "future"];
    for (const relativePath of [
      "repos/arashi/contracts/create-launch-config.json",
      "repos/arashi-docs/contracts/create-launch-config.json",
      "repos/arashi-skills/contracts/create-launch-config.json",
    ]) {
      const path = join(root, relativePath);
      const data = JSON.parse(await readFile(path, "utf8"));
      data.modes = modes;
      await writeFile(path, JSON.stringify(data));
    }
    const schemaPath = join(root, "repos/arashi/schema/config.schema.json");
    const schema = JSON.parse(await readFile(schemaPath, "utf8"));
    schema.definitions.CreateLaunchMode.enum = modes;
    await writeFile(schemaPath, JSON.stringify(schema));

    expect(
      (await checkContracts(root)).diagnostics.filter((diagnostic) =>
        diagnostic.code.startsWith("CREATE_CONFIG"),
      ),
    ).toEqual([]);
  });
  test("rejects effective create refs and editor schema drift", async () => {
    const root = await fixture();
    const path = join(root, "repos/arashi/schema/config.schema.json");
    const data = JSON.parse(await readFile(path, "utf8"));
    data.definitions.CreateCommandDefaults.properties.launch = {
      $ref: "#/definitions/SwitchMode",
      enum: ["none", "auto", "sesh", "herdr"],
    };
    delete data.definitions.EditorCommandDefaults.properties.create;
    delete data.definitions.EditorDefaultsConfig.properties.cursor;
    await writeFile(path, JSON.stringify(data));

    const diagnostics = (await checkContracts(root)).diagnostics;
    for (const subject of ["launch", "editorCreate", "editorHosts"]) {
      expect(diagnostics).toContainEqual(
        expect.objectContaining({
          code: "CREATE_CONFIG_MISMATCH",
          source: "repos/arashi/schema/config.schema.json",
          subject,
        }),
      );
    }
  });
  test("rejects stale switch schema modes and deprecated canonical fields", async () => {
    const root = await fixture();
    const path = join(root, "repos/arashi/schema/config.schema.json");
    const data = JSON.parse(await readFile(path, "utf8"));
    data.definitions.SwitchMode.enum = ["auto", "cd", "launch"];
    data.definitions.SwitchCommandDefaults.properties.launchMode = {
      $ref: "#/definitions/LaunchMode",
    };
    await writeFile(path, JSON.stringify(data));

    const diagnostics = (await checkContracts(root)).diagnostics;
    expect(diagnostics).toContainEqual(
      expect.objectContaining({
        code: "SWITCH_CONFIG_MISMATCH",
        source: "repos/arashi/schema/config.schema.json",
        subject: "modes",
      }),
    );
    expect(diagnostics).toContainEqual(
      expect.objectContaining({
        code: "SWITCH_CONFIG_DEPRECATED_FIELD",
        source: "repos/arashi/schema/config.schema.json",
        subject: "launchMode",
      }),
    );
  });
  test("rejects stale create schema modes and deprecated canonical fields", async () => {
    const root = await fixture();
    const path = join(root, "repos/arashi/schema/config.schema.json");
    const data = JSON.parse(await readFile(path, "utf8"));
    data.definitions.CreateLaunchMode.enum = ["none", "auto", "sesh"];
    data.definitions.CreateCommandDefaults.properties.launch = {
      type: "string",
    };
    data.definitions.CreateCommandDefaults.properties.launchMode = {
      $ref: "#/definitions/LaunchMode",
    };
    await writeFile(path, JSON.stringify(data));

    const diagnostics = (await checkContracts(root)).diagnostics;
    expect(diagnostics).toContainEqual(
      expect.objectContaining({
        code: "CREATE_CONFIG_MISMATCH",
        source: "repos/arashi/schema/config.schema.json",
        subject: "modes",
      }),
    );
    expect(diagnostics).toContainEqual(
      expect.objectContaining({
        code: "CREATE_CONFIG_MISMATCH",
        source: "repos/arashi/schema/config.schema.json",
        subject: "launch",
      }),
    );
    expect(diagnostics).toContainEqual(
      expect.objectContaining({
        code: "CREATE_CONFIG_DEPRECATED_FIELD",
        source: "repos/arashi/schema/config.schema.json",
        subject: "launchMode",
      }),
    );
  });
  test("authoritative workflow uses the stable docs semantic aggregate", async () => {
    const workflow = await readFile(
      join(process.cwd(), ".github/workflows/cross-repo-command-contracts.yml"),
      "utf8",
    );

    expect(workflow).toContain(
      "run: pnpm --dir repos/arashi-docs validate:semantic-docs",
    );
    expect(workflow).not.toMatch(
      /run: pnpm --dir repos\/arashi-docs validate:(?!semantic-docs)[^\n]*-docs/,
    );
  });
  test("authoritative workflow does not run hook contracts twice", async () => {
    const workflow = await readFile(
      join(process.cwd(), ".github/workflows/cross-repo-command-contracts.yml"),
      "utf8",
    );

    expect(workflow).not.toContain("run: pnpm contracts:hooks");
    expect(workflow.match(/run: pnpm contracts:check:ci/g)).toHaveLength(1);
  });
  test("sorts diagnostics deterministically and formats stable output", async () => {
    const root = await fixture();
    await rm(join(root, "repos/arashi-docs/docs/commands/add.md"));
    const a = await checkContracts(root);
    const b = await checkContracts(root);
    expect(a).toEqual(b);
    expect(formatHuman(a)).toContain("[error] DOCS_PAGE_MISSING");
  });
});
