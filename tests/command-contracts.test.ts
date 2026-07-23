import { afterEach, describe, expect, test } from "vitest";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { checkContracts, formatHuman } from "../scripts/command-contracts";

const roots: string[] = [];
afterEach(async () =>
  Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true }))),
);

async function fixture(): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), "arashi-contracts-"));
  roots.push(root);
  const files: Record<string, unknown | string> = {
    "repos/arashi/schema/config.schema.json": {
      definitions: {
        CreateCommandDefaults: {
          properties: { launchMode: { $ref: "#/definitions/LaunchMode" } },
        },
        SwitchCommandDefaults: {
          additionalProperties: false,
          properties: { mode: { $ref: "#/definitions/SwitchMode" } },
        },
        SwitchMode: { enum: ["auto", "cd", "launch", "sesh", "herdr"] },
      },
    },
    "repos/arashi-docs/contracts/switch-config.json": {
      schemaVersion: 1,
      canonicalField: "defaults.switch.mode",
      modes: ["auto", "cd", "launch", "sesh", "herdr"],
      absentMode: "launch",
      autoOrder: ["tmux", "herdr", "cmux", "ide", "cd", "platform"],
      legacyFields: [
        "defaults.switch.launchMode",
        "defaults.switch.launch_mode",
      ],
      createDefaultsUnchanged: true,
    },
    "repos/arashi-skills/contracts/switch-config.json": {
      schemaVersion: 1,
      canonicalField: "defaults.switch.mode",
      modes: ["auto", "cd", "launch", "sesh", "herdr"],
      absentMode: "launch",
      autoOrder: ["tmux", "herdr", "cmux", "ide", "cd", "platform"],
      legacyFields: [
        "defaults.switch.launchMode",
        "defaults.switch.launch_mode",
      ],
      createDefaultsUnchanged: true,
    },
    "repos/arashi/contracts/cli-commands.json": {
      schemaVersion: 3,
      commands: [
        {
          path: "add",
          description: "add",
          aliases: [],
          hidden: false,
          arguments: [],
          options: [],
          semantics: {
            json: { support: "full" },
            docs: { expectation: "required" },
            skills: { expectation: "required" },
            standalone: { support: "full" },
            vscode: { expectation: "required" },
          },
        },
        {
          path: "init",
          description: "init",
          aliases: [],
          hidden: false,
          arguments: [],
          options: [
            "--dry-run",
            "--force",
            "--ignore-scope <scope>",
            "--json",
            "--no-discover",
            "--repos-dir <path>",
            "--verbose",
            "--worktrees-dir <path>",
            "--zero-config",
          ].map((flags) => ({
            flags,
            description: flags,
            required: flags.includes("<"),
            optional: false,
            variadic: false,
          })),
          semantics: {
            json: { support: "full" },
            docs: { expectation: "required" },
            skills: { expectation: "required" },
            standalone: {
              support: "conditional",
              reason:
                "Only init --zero-config prepares standalone mode; ordinary init creates configured mode.",
            },
            zeroConfig: {
              option: "--zero-config",
              dryRun: { finalState: "unchanged", supported: true },
              json: {
                singleEnvelope: true,
                supported: true,
                suppressesHumanStdout: true,
              },
              compatibleOptions: ["--dry-run", "--json", "--verbose"],
              incompatibleOptions: [
                "--force",
                "--ignore-scope",
                "--no-discover",
                "--repos-dir",
                "--worktrees-dir",
              ],
            },
            vscode: { expectation: "required" },
          },
        },
        {
          path: "old",
          description: "old",
          aliases: [],
          hidden: false,
          arguments: [],
          options: [],
          semantics: {
            json: { support: "unsupported", reason: "interactive" },
            docs: { expectation: "excluded", reason: "internal" },
            skills: { expectation: "excluded", reason: "internal" },
            standalone: { support: "not-applicable", reason: "internal" },
            vscode: { expectation: "excluded", reason: "internal" },
          },
        },
      ],
    },
    "repos/arashi-docs/docs/commands/add.md": "# Add\n",
    "repos/arashi-docs/docs/commands/init.md": "# Init\n",
    "repos/arashi-docs/docs/commands/index.md":
      "- [Add](/commands/add/)\n- [Init](/commands/init/)\n",
    "repos/arashi-skills/contracts/command-coverage.json": {
      schemaVersion: 1,
      commands: [
        {
          name: "add",
          status: "covered",
          reference: "references/commands.md",
          standalone: { support: "supported" },
        },
        {
          name: "init",
          status: "covered",
          reference: "references/commands.md",
          requiredOptions: ["--zero-config"],
          standalone: {
            support: "conditional",
            reason:
              "Only init --zero-config prepares standalone mode; ordinary init creates configured mode.",
            policy: {
              option: "--zero-config",
              dryRun: true,
              json: true,
              compatibleOptions: ["--dry-run", "--json", "--verbose"],
              incompatibleOptions: [
                "--force",
                "--ignore-scope",
                "--no-discover",
                "--repos-dir",
                "--worktrees-dir",
              ],
            },
          },
        },
        {
          name: "old",
          status: "excluded",
          reason: "internal",
          standalone: { support: "not-applicable", reason: "internal" },
        },
      ],
    },
    "repos/arashi-skills/skills/arashi/references/commands.md":
      "Use `arashi add`.\n",
    "repos/arashi-vscode/contracts/command-policy.json": {
      schemaVersion: 1,
      cliCommands: {
        add: { state: "mapped", commands: ["arashi.add"] },
        init: { state: "mapped", commands: ["arashi.add"] },
        old: { state: "excluded", reason: "internal" },
      },
      extensionOnlyCommands: ["arashi.open"],
    },
    "repos/arashi-vscode/package.json": {
      contributes: {
        commands: [{ command: "arashi.add" }, { command: "arashi.open" }],
      },
    },
  };
  for (const [path, value] of Object.entries(files)) {
    const target = join(root, path);
    await mkdir(join(target, ".."), { recursive: true });
    await writeFile(
      target,
      typeof value === "string" ? value : JSON.stringify(value),
    );
  }
  return root;
}

describe("cross-repository command contracts", () => {
  test("accepts coverage and reports intentional exclusions as info", async () => {
    const result = await checkContracts(await fixture());
    expect(result.ok).toBe(true);
    expect(result.diagnostics.map((d) => d.code)).toEqual([
      "DOCS_EXCLUDED",
      "SKILLS_EXCLUDED",
      "VSCODE_EXCLUDED",
    ]);
  });
  test("rejects the previous command contract schema without applying schema 3 rules", async () => {
    const root = await fixture();
    const path = join(root, "repos/arashi/contracts/cli-commands.json");
    const data = JSON.parse(await readFile(path, "utf8"));
    data.schemaVersion = 2;
    data.cliVersion = "1.20.1";
    await writeFile(path, JSON.stringify(data));

    const diagnostics = (await checkContracts(root)).diagnostics;
    expect(diagnostics).toContainEqual(
      expect.objectContaining({
        code: "SCHEMA_VERSION_UNSUPPORTED",
        source: "repos/arashi/contracts/cli-commands.json",
        subject: "2",
      }),
    );
    expect(diagnostics).not.toContainEqual(
      expect.objectContaining({
        code: "SCHEMA_INVALID",
        subject: "cliVersion",
      }),
    );
  });
  test("rejects package release metadata in schema version 3", async () => {
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
    const tmuxPolicy = {
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
    };
    mutate(tmuxPolicy);
    contract.commands.push({
      path: "switch",
      description: "switch",
      aliases: [],
      hidden: false,
      arguments: [],
      options: [
        "--cd",
        "--cursor",
        "--herdr",
        "--kiro",
        "--no-cd",
        "--no-default-launch",
        "--sesh",
        "--tmux",
        "--vscode",
      ].map((flags) => ({
        flags,
        description: flags,
        required: false,
        optional: false,
        variadic: false,
      })),
      semantics: {
        json: { support: "unsupported", reason: "launch" },
        docs: { expectation: "required" },
        skills: { expectation: "required" },
        standalone: { support: "full" },
        vscode: { expectation: "excluded", reason: "terminal" },
        optionPolicies: { "--tmux": tmuxPolicy },
      },
    });
    await writeFile(contractPath, JSON.stringify(contract));

    const coveragePath = join(
      root,
      "repos/arashi-skills/contracts/command-coverage.json",
    );
    const coverage = JSON.parse(await readFile(coveragePath, "utf8"));
    coverage.commands.push({
      name: "switch",
      status: "covered",
      reference: "references/commands.md",
      requiredOptions: ["--tmux"],
      standalone: { support: "supported" },
    });
    await writeFile(coveragePath, JSON.stringify(coverage));

    expect((await checkContracts(root)).diagnostics).toContainEqual(
      expect.objectContaining({
        code: "TMUX_OPTION_POLICY_MISMATCH",
        subject: "switch.--tmux",
      }),
    );
  });
  test("rejects missing skills --tmux coverage", async () => {
    const root = await fixture();
    const contractPath = join(root, "repos/arashi/contracts/cli-commands.json");
    const contract = JSON.parse(await readFile(contractPath, "utf8"));
    contract.commands.push({
      path: "create",
      description: "create",
      aliases: [],
      hidden: false,
      arguments: [],
      options: [
        {
          flags: "--tmux",
          description: "tmux",
          required: false,
          optional: false,
          variadic: false,
        },
      ],
      semantics: {
        json: { support: "conditional", reason: "non-interactive" },
        docs: { expectation: "excluded", reason: "fixture" },
        skills: { expectation: "required" },
        standalone: { support: "full" },
        vscode: { expectation: "excluded", reason: "terminal" },
        optionPolicies: {
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
      },
    });
    await writeFile(contractPath, JSON.stringify(contract));
    const coveragePath = join(
      root,
      "repos/arashi-skills/contracts/command-coverage.json",
    );
    const coverage = JSON.parse(await readFile(coveragePath, "utf8"));
    coverage.commands.push({
      name: "create",
      status: "covered",
      reference: "references/commands.md",
      requiredOptions: [],
      standalone: { support: "supported" },
    });
    await writeFile(coveragePath, JSON.stringify(coverage));

    expect((await checkContracts(root)).diagnostics).toContainEqual(
      expect.objectContaining({
        code: "SKILLS_TMUX_POLICY_MISMATCH",
        subject: "create",
      }),
    );

    coverage.commands.at(-1).requiredOptions = ["--tmux", "--future-option"];
    await writeFile(coveragePath, JSON.stringify(coverage));
    expect((await checkContracts(root)).diagnostics).not.toContainEqual(
      expect.objectContaining({
        code: "SKILLS_TMUX_POLICY_MISMATCH",
        subject: "create",
      }),
    );

    contract.commands.at(-1).semantics.optionPolicies["--tmux"].conflicts = [
      "--sesh",
    ];
    await writeFile(contractPath, JSON.stringify(contract));
    expect((await checkContracts(root)).diagnostics).toContainEqual(
      expect.objectContaining({
        code: "TMUX_OPTION_POLICY_MISMATCH",
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
  test("sorts diagnostics deterministically and formats stable output", async () => {
    const root = await fixture();
    await rm(join(root, "repos/arashi-docs/docs/commands/add.md"));
    const a = await checkContracts(root);
    const b = await checkContracts(root);
    expect(a).toEqual(b);
    expect(formatHuman(a)).toContain("[error] DOCS_PAGE_MISSING");
  });
});
