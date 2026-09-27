import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import { checkContracts as checkContractsWithFocusedAcceptance } from "../scripts/command-contracts";
import {
  checkContracts,
  configureContract,
  schemaV5Fixture,
  schemaV6Fixture,
  schemaV7Fixture,
  schemaV8Fixture,
} from "./command-contracts.fixtures";
describe("cross-repository command contracts", () => {
  test("accepts the complete schema-v5 CLI option semantic contract", async () => {
    const result = await checkContracts(await schemaV5Fixture());
    expect(
      result.diagnostics.filter((diagnostic) =>
        [
          "CLI_OPTION_SCHEMA_INVALID",
          "CLI_ALIAS_MISMATCH",
          "CLI_ALIAS_COLLISION",
          "CLI_COMPATIBILITY_INVALID",
          "CLI_POLICY_REFERENCE_INVALID",
          "CLI_SELECTOR_POLICY_INVALID",
          "CLI_SELECTOR_POLICY_MISSING",
          "CLI_SWITCH_POLICY_INVALID",
          "CLI_UPDATE_POLICY_INVALID",
          "DOCS_CLI_OPTION_POLICY_MISMATCH",
        ].includes(diagnostic.code),
      ),
    ).toEqual([]);
    expect(result.diagnostics).not.toContainEqual(
      expect.objectContaining({
        code: "SCHEMA_VERSION_UNSUPPORTED",
        source: "repos/arashi/contracts/cli-commands.json",
      }),
    );
  });
  test("accepts schema v6 completion metadata and coordinated companion semantics", async () => {
    const result = await checkContracts(await schemaV6Fixture());
    expect(
      result.diagnostics.filter(
        (diagnostic) =>
          diagnostic.code.includes("COMPLETION") ||
          diagnostic.code === "SCHEMA_VERSION_UNSUPPORTED",
      ),
    ).toEqual([]);
    expect(result.ok, JSON.stringify(result.diagnostics, null, 2)).toBe(true);
  });
  test("accepts schema-v8 shared repository-base semantics", async () => {
    const result = await checkContracts(await schemaV8Fixture());
    expect(
      result.diagnostics.filter(
        (diagnostic) =>
          diagnostic.code.includes("CREATE_BASE") ||
          diagnostic.code === "SCHEMA_VERSION_UNSUPPORTED",
      ),
    ).toEqual([]);
    expect(result.ok, JSON.stringify(result.diagnostics, null, 2)).toBe(true);
  });
  test("accepts an unfiltered pull request trigger as complete path coverage", async () => {
    const root = await schemaV8Fixture();
    const workflowPath = join(
      root,
      ".github/workflows/cross-repo-command-contracts.yml",
    );
    const workflow = await readFile(workflowPath, "utf8");
    await writeFile(
      workflowPath,
      workflow.replace(
        /  pull_request:\n    paths:\n(?:      - .+\n)+/,
        "  pull_request:\n",
      ),
    );

    const result = await checkContracts(root);
    expect(
      result.diagnostics.filter(
        (diagnostic) =>
          diagnostic.code === "CREATE_BASE_TRIGGER_PATH_UNREACHABLE",
      ),
    ).toEqual([]);
  });
  test("normalizes the complete canonical configure policy and companion classifications", async () => {
    const result = await checkContracts(await schemaV8Fixture());
    expect(
      result.diagnostics.filter(
        (diagnostic) =>
          diagnostic.code.startsWith("CONFIGURE_") ||
          diagnostic.code.includes("CONFIGURE"),
      ),
    ).toEqual([]);
    expect(result.ok, JSON.stringify(result.diagnostics, null, 2)).toBe(true);
  });
  test.each([
    ["scopes", (policy: any) => policy.scopes.reverse()],
    ["descriptors", (policy: any) => policy.descriptors.repository.pop()],
    [
      "configured-effective-state",
      (policy: any) => policy.state.effective.reverse(),
    ],
    ["keep-edit-clear", (policy: any) => policy.actions.splice(1, 1)],
    [
      "tty-json-invocation",
      (policy: any) => (policy.invocation.json = "interactive-mutation"),
    ],
    ["strict-loading", (policy: any) => (policy.loading = "normalized-only")],
    ["semantic-no-op", (policy: any) => (policy.noOp = "confirm-then-save")],
    ["exact-preview", (policy: any) => (policy.preview.config = "summary")],
    [
      "separate-active-file-plan",
      (policy: any) => (policy.preview.activeFiles = "inline-with-config"),
    ],
    [
      "body-bearing-views",
      (policy: any) =>
        (policy.secrecy.ordinaryAndJson = "includes-inline-bodies"),
    ],
    [
      "shared-expected-byte-transaction",
      (policy: any) => (policy.transaction.expectedBytes = false),
    ],
    [
      "single-save-transaction",
      (policy: any) => (policy.transaction.configSavesAtMost = 2),
    ],
    [
      "shared-workspace-lock",
      (policy: any) => (policy.transaction.lock = "configure-only-lock"),
    ],
    [
      "native-file-safety",
      (policy: any) => (policy.transaction.nativeFiles = "overwrite-existing"),
    ],
  ])("rejects controlled configure %s drift", async (_axis, mutate) => {
    const root = await schemaV8Fixture();
    const contractPath = join(root, "repos/arashi/contracts/cli-commands.json");
    const contract = JSON.parse(await readFile(contractPath, "utf8"));
    const configure = contract.commands.find(
      (command: { path: string }) => command.path === "configure",
    );
    mutate(configure.semantics.configure);
    await writeFile(contractPath, JSON.stringify(contract));

    expect((await checkContracts(root)).diagnostics).toContainEqual(
      expect.objectContaining({
        code: "CONFIGURE_CLI_POLICY_MISMATCH",
        source: "repos/arashi/contracts/cli-commands.json",
      }),
    );
  });
  test.each([
    [
      "json support",
      (semantics: any) => (semantics.json.support = "unsupported"),
    ],
    [
      "standalone support",
      (semantics: any) => (semantics.standalone.support = "full"),
    ],
  ])("rejects controlled configure generic %s drift", async (_axis, mutate) => {
    const root = await schemaV8Fixture();
    const contractPath = join(root, "repos/arashi/contracts/cli-commands.json");
    const contract = JSON.parse(await readFile(contractPath, "utf8"));
    const configure = contract.commands.find(
      (command: { path: string }) => command.path === "configure",
    );
    mutate(configure.semantics);
    await writeFile(contractPath, JSON.stringify(contract));

    expect((await checkContracts(root)).diagnostics).toContainEqual(
      expect.objectContaining({
        code: "CONFIGURE_CLI_POLICY_MISMATCH",
        source: "repos/arashi/contracts/cli-commands.json",
      }),
    );
  });
  test("requires docs and skills coverage with a reasoned VS Code exclusion", async () => {
    const root = await schemaV8Fixture();
    const contractPath = join(root, "repos/arashi/contracts/cli-commands.json");
    const contract = JSON.parse(await readFile(contractPath, "utf8"));
    const configure = contract.commands.find(
      (command: { path: string }) => command.path === "configure",
    );
    configure.semantics.docs = { expectation: "excluded", reason: "omitted" };
    configure.semantics.skills = { expectation: "excluded", reason: "omitted" };
    configure.semantics.vscode = { expectation: "excluded", reason: "" };
    await writeFile(contractPath, JSON.stringify(contract));

    const diagnostics = (await checkContracts(root)).diagnostics;
    expect(diagnostics).toContainEqual(
      expect.objectContaining({
        code: "CONFIGURE_COMPANION_POLICY_MISMATCH",
        subject: "docs",
      }),
    );
    expect(diagnostics).toContainEqual(
      expect.objectContaining({
        code: "CONFIGURE_COMPANION_POLICY_MISMATCH",
        subject: "skills",
      }),
    );
    expect(diagnostics).toContainEqual(
      expect.objectContaining({
        code: "CONFIGURE_COMPANION_POLICY_MISMATCH",
        subject: "vscode",
      }),
    );
  });
  test.each([
    [
      "docs",
      "repos/arashi-docs/scripts/semantic-doc-checks.json",
      "check-configure-docs.ts",
      "DOCS_CONFIGURE_CHECK_UNREACHABLE",
    ],
    [
      "skills source and package",
      "repos/arashi-skills/scripts/guidance-checkers.json",
      "scripts/configure-workspace-guidance-selftest.mjs",
      "SKILLS_CONFIGURE_CHECK_UNREACHABLE",
    ],
  ])(
    "requires registered configure checker reachability for %s",
    async (_surface, manifestPath, entry, code) => {
      const root = await schemaV8Fixture();
      const absolute = join(root, manifestPath);
      const manifest = JSON.parse(await readFile(absolute, "utf8"));
      await writeFile(
        absolute,
        JSON.stringify(manifest.filter((item: string) => item !== entry)),
      );

      expect((await checkContracts(root)).diagnostics).toContainEqual(
        expect.objectContaining({ code, source: manifestPath }),
      );
    },
  );
  test("invokes the registered docs configure checker for controlled no-op drift", async () => {
    const root = await schemaV8Fixture();
    const guidancePath = join(root, "repos/arashi-docs/public/llms.txt");
    const guidance = await readFile(guidancePath, "utf8");
    expect(guidance).toContain("exits before final confirmation or save");
    await writeFile(
      guidancePath,
      guidance.replace(
        "exits before final confirmation or save",
        "continues to final confirmation and save",
      ),
    );

    expect(
      (await checkContractsWithFocusedAcceptance(root)).diagnostics,
    ).toContainEqual(
      expect.objectContaining({ code: "DOCS_CONFIGURE_CHECK_FAILED" }),
    );
  }, 30_000);
  test("invokes configure guidance checks in source and extracted-package flows", async () => {
    const root = await schemaV8Fixture();
    const guidancePath = join(
      root,
      "repos/arashi-skills/skills/arashi/references/commands/workspace.md",
    );
    const guidance = await readFile(guidancePath, "utf8");
    expect(guidance).toContain(
      "reports no changes before final mutation confirmation",
    );
    await writeFile(
      guidancePath,
      guidance.replace(
        "reports no changes before final mutation confirmation",
        "reports no changes after final mutation confirmation",
      ),
    );

    const diagnostics = (await checkContractsWithFocusedAcceptance(root))
      .diagnostics;
    expect(diagnostics).toContainEqual(
      expect.objectContaining({ code: "SKILLS_CONFIGURE_CHECK_FAILED" }),
    );
    expect(diagnostics).toContainEqual(
      expect.objectContaining({
        code: "SKILLS_CONFIGURE_PACKAGE_CHECK_FAILED",
      }),
    );
  }, 30_000);
  test("the configure fixture itself matches the expected canonical policy", async () => {
    const root = await schemaV8Fixture();
    const contract = JSON.parse(
      await readFile(
        join(root, "repos/arashi/contracts/cli-commands.json"),
        "utf8",
      ),
    );
    expect(
      contract.commands.find(
        (command: { path: string }) => command.path === "configure",
      ).semantics.configure,
    ).toEqual(configureContract);
  });
  test.each([
    "The deprecated `defaults.create.baseBranch` value remains create-only and does not affect clone.",
    "Set `defaults.create.baseBranch` to choose the create base.",
    "`defaults.create.baseBranch` is the workspace-wide default used by create.",
    "Although `defaults.create.baseBranch` was removed from the schema, create still accepts it.",
    "`defaults.create.baseBranch` was removed from the schema, but you can still use it.",
    "`defaults.create.baseBranch` was removed from the schema but continues to control create.",
    "The removed `defaults.create.baseBranch` controls the create base.",
    "`defaults.create.baseBranch` controls create, while editor-scoped defaults are unsupported.",
    "- `defaults.create.baseBranch` was removed.\n- `defaults.create.baseBranch` controls the create base",
  ])(
    "rejects removed create-base guidance on companion skill surfaces: %s",
    async (claim) => {
      const root = await schemaV8Fixture();
      const path = join(
        root,
        "repos/arashi-skills/skills/arashi/references/commands/workspace.md",
      );
      await writeFile(path, `${await readFile(path, "utf8")}\n${claim}\n`);

      expect((await checkContracts(root)).diagnostics).toContainEqual(
        expect.objectContaining({
          code: "REPOSITORY_BASE_GUIDANCE_MISMATCH",
          source:
            "repos/arashi-skills/skills/arashi/references/commands/workspace.md",
        }),
      );
    },
  );
  test("rejects removed create-base guidance on MDX surfaces", async () => {
    const root = await schemaV8Fixture();
    const path = join(root, "repos/arashi-docs/docs/index.mdx");
    await writeFile(
      path,
      "Set `defaults.create.baseBranch` to choose the create base.\n",
    );

    expect((await checkContracts(root)).diagnostics).toContainEqual(
      expect.objectContaining({
        code: "REPOSITORY_BASE_GUIDANCE_MISMATCH",
        source: "repos/arashi-docs/docs/index.mdx",
      }),
    );
  });
  test.each([
    "repos/arashi/README.md",
    "repos/arashi-docs/public/llms.txt",
    "repos/arashi-docs/public/llms-full.txt",
  ])(
    "rejects removed create-base guidance on generated and CLI surface %s",
    async (source) => {
      const root = await schemaV8Fixture();
      await writeFile(
        join(root, source),
        "`defaults.create.baseBranch` controls create.\n",
      );

      expect((await checkContracts(root)).diagnostics).toContainEqual(
        expect.objectContaining({
          code: "REPOSITORY_BASE_GUIDANCE_MISMATCH",
          source,
        }),
      );
    },
  );
  test("allows explicit rejection and negation of the removed create-base key", async () => {
    const root = await schemaV8Fixture();
    const path = join(
      root,
      "repos/arashi-skills/skills/arashi/references/commands/workspace.md",
    );
    await writeFile(
      path,
      `${await readFile(path, "utf8")}
\`defaults.create.baseBranch\` never applies. Do not set \`defaults.create.baseBranch\`. Replace \`defaults.create.baseBranch\` with root \`baseBranch\`; it is no longer supported.
Configuration supports root \`baseBranch\`; \`defaults.create.baseBranch\` was removed.
Configuration does not support \`defaults.create.baseBranch\`.
Support for \`defaults.create.baseBranch\` was removed.
Use of \`defaults.create.baseBranch\` is forbidden.
\`defaults.create.baseBranch\` is not supported.
Use root \`baseBranch\` instead of \`defaults.create.baseBranch\`.

## \`defaults.create.baseBranch\`

This property is unsupported; migrate to root \`baseBranch\`.
`,
    );

    expect(
      (await checkContracts(root)).diagnostics.filter(
        (diagnostic) => diagnostic.code === "REPOSITORY_BASE_GUIDANCE_MISMATCH",
      ),
    ).toEqual([]);
  });
  test.each([
    ["precedence", (policy: any) => policy.precedence.reverse()],
    ["meta selector", (policy: any) => (policy.options.metaSelector = "meta")],
    [
      "coordinated clone target",
      (policy: any) => (policy.clone.coordinated = "checkout-effective-base"),
    ],
    [
      "selected-set validation",
      (policy: any) => (policy.validation = "during-mutation"),
    ],
    ["output omission", (policy: any) => (policy.output.omitted = "never")],
    ["rollback boundary", (policy: any) => (policy.rollback = "all-targets")],
  ])("rejects schema-v8 repository-base %s drift", async (_label, mutate) => {
    const root = await schemaV8Fixture();
    const path = join(root, "repos/arashi/contracts/cli-commands.json");
    const data = JSON.parse(await readFile(path, "utf8"));
    const base = data.commands
      .find((command: any) => command.path === "create")
      .options.find((entry: any) => entry.long === "--base");
    mutate(base.semanticPolicy.repositoryBase);
    await writeFile(path, JSON.stringify(data));

    expect((await checkContracts(root)).diagnostics).toContainEqual(
      expect.objectContaining({
        code: "REPOSITORY_BASE_CLI_POLICY_MISMATCH",
        source: "repos/arashi/contracts/cli-commands.json",
      }),
    );
  });
  test.each([
    ["baseBranch", "Config"],
    ["meta.baseBranch", "MetaRepositoryConfig"],
    ["repos.<name>.baseBranch", "RepoConfig"],
  ])("rejects schema-v8 %s schema drift", async (subject, definition) => {
    const root = await schemaV8Fixture();
    const path = join(root, "repos/arashi/schema/config.schema.json");
    const data = JSON.parse(await readFile(path, "utf8"));
    data.definitions[definition].properties.baseBranch.pattern = ".+";
    await writeFile(path, JSON.stringify(data));

    expect((await checkContracts(root)).diagnostics).toContainEqual(
      expect.objectContaining({
        code: "REPOSITORY_BASE_CONFIG_SCHEMA_MISMATCH",
        source: "repos/arashi/schema/config.schema.json",
        subject,
      }),
    );
  });
  test.each([
    [
      "reintroduced removed create field",
      (schema: any) =>
        (schema.definitions.CreateCommandDefaults.properties.baseBranch = {
          minLength: 1,
          pattern: ".+",
          type: "string",
        }),
      "defaults.create.baseBranch",
    ],
    [
      "permissive create defaults",
      (schema: any) =>
        (schema.definitions.CreateCommandDefaults.additionalProperties = true),
      "defaults.create.additionalProperties",
    ],
    [
      "editor-scoped legacy field",
      (schema: any) =>
        (schema.definitions.EditorCreateCommandDefaults.properties.baseBranch =
          { type: "string" }),
      "defaults.editors.<host>.create.baseBranch",
    ],
    [
      "permissive editor create defaults",
      (schema: any) =>
        (schema.definitions.EditorCreateCommandDefaults.additionalProperties = true),
      "defaults.editors.<host>.create.additionalProperties",
    ],
    [
      "missing meta route",
      (schema: any) => delete schema.definitions.Config.properties.meta,
      "meta",
    ],
    [
      "wrong child collection route",
      (schema: any) =>
        (schema.definitions.Config.properties.repos.additionalProperties.$ref =
          "#/definitions/MetaRepositoryConfig"),
      "repos",
    ],
  ])("rejects schema-v8 %s", async (_label, mutate, subject) => {
    const root = await schemaV8Fixture();
    const path = join(root, "repos/arashi/schema/config.schema.json");
    const data = JSON.parse(await readFile(path, "utf8"));
    mutate(data);
    await writeFile(path, JSON.stringify(data));

    expect((await checkContracts(root)).diagnostics).toContainEqual(
      expect.objectContaining({
        code: "REPOSITORY_BASE_CONFIG_SCHEMA_MISMATCH",
        source: "repos/arashi/schema/config.schema.json",
        subject,
      }),
    );
  });
  test.each([
    [
      "missing policy",
      (policy: any) => delete policy.createBase,
      "create.--base.semanticPolicy.createBase",
    ],
    [
      "extra policy field",
      (policy: any) => (policy.createBase.extra = true),
      "create.--base.semanticPolicy.createBase.extra",
    ],
    [
      "wrong precedence",
      (policy: any) => policy.createBase.precedence.reverse(),
      "create.--base.semanticPolicy.createBase.precedence.0",
    ],
    [
      "wrong ref order",
      (policy: any) => policy.createBase.resolution.refs.reverse(),
      "create.--base.semanticPolicy.createBase.resolution.refs.0",
    ],
    [
      "wrong reuse ancestry",
      (policy: any) =>
        (policy.createBase.mutation.reusedTarget.ancestry = "must-descend"),
      "create.--base.semanticPolicy.createBase.mutation.reusedTarget.ancestry",
    ],
    [
      "wrong output fields",
      (policy: any) =>
        policy.createBase.output.json.failure.fields.splice(2, 1, "failures"),
      "create.--base.semanticPolicy.createBase.output.json.failure.fields.2",
    ],
    [
      "invented environment variable",
      (policy: any) =>
        (policy.createBase.environmentVariables.ARASHI_BASE_BRANCH =
          "provided"),
      "create.--base.semanticPolicy.createBase.environmentVariables.ARASHI_BASE_BRANCH",
    ],
  ])("rejects schema-v7 create-base %s", async (_label, mutate, subject) => {
    const root = await schemaV7Fixture();
    const path = join(root, "repos/arashi/contracts/cli-commands.json");
    const data = JSON.parse(await readFile(path, "utf8"));
    const base = data.commands
      .find((command: any) => command.path === "create")
      .options.find((entry: any) => entry.long === "--base");
    mutate(base.semanticPolicy);
    await writeFile(path, JSON.stringify(data));

    expect((await checkContracts(root)).diagnostics).toContainEqual(
      expect.objectContaining({
        code: "CREATE_BASE_CLI_POLICY_MISMATCH",
        source: "repos/arashi/contracts/cli-commands.json",
        subject,
      }),
    );
  });
  test("rejects create-base policy on the wrong command option", async () => {
    const root = await schemaV7Fixture();
    const path = join(root, "repos/arashi/contracts/cli-commands.json");
    const data = JSON.parse(await readFile(path, "utf8"));
    const create = data.commands.find(
      (command: any) => command.path === "create",
    );
    const base = create.options.find((entry: any) => entry.long === "--base");
    create.options.find(
      (entry: any) => entry.long === "--dry-run",
    ).semanticPolicy = structuredClone(base.semanticPolicy);
    await writeFile(path, JSON.stringify(data));

    expect((await checkContracts(root)).diagnostics).toContainEqual(
      expect.objectContaining({
        code: "CREATE_BASE_POLICY_WRONG_OWNER",
        subject: "create.--dry-run",
      }),
    );
  });
  test("rejects packaged skill create-base policy drift", async () => {
    const root = await schemaV7Fixture();
    const path = join(
      root,
      "repos/arashi-skills/contracts/create-base-branch.json",
    );
    const data = JSON.parse(await readFile(path, "utf8"));
    data.semanticPolicy.createBase.output.json.success.repositories =
      "affected-only-selected-set";
    await writeFile(path, JSON.stringify(data));

    expect((await checkContracts(root)).diagnostics).toContainEqual(
      expect.objectContaining({
        code: "CREATE_BASE_SKILLS_POLICY_MISMATCH",
        source: "repos/arashi-skills/contracts/create-base-branch.json",
        subject: "semanticPolicy.createBase.output.json.success.repositories",
      }),
    );
  });
  test.each([
    [
      "missing generic field",
      (schema: any) =>
        delete schema.definitions.CreateCommandDefaults.properties.baseBranch,
      "defaults.create.baseBranch",
    ],
    [
      "editor-scoped field",
      (schema: any) =>
        (schema.definitions.EditorCreateCommandDefaults.properties.baseBranch =
          { type: "string" }),
      "defaults.editors.<host>.create.baseBranch",
    ],
    [
      "weakened pattern",
      (schema: any) =>
        (schema.definitions.CreateCommandDefaults.properties.baseBranch.pattern =
          ".+"),
      "defaults.create.baseBranch.pattern",
    ],
  ])(
    "rejects create-base config schema %s",
    async (_label, mutate, subject) => {
      const root = await schemaV7Fixture();
      const path = join(root, "repos/arashi/schema/config.schema.json");
      const data = JSON.parse(await readFile(path, "utf8"));
      mutate(data);
      await writeFile(path, JSON.stringify(data));

      expect((await checkContracts(root)).diagnostics).toContainEqual(
        expect.objectContaining({
          code: "CREATE_BASE_CONFIG_SCHEMA_MISMATCH",
          source: "repos/arashi/schema/config.schema.json",
          subject,
        }),
      );
    },
  );
  test.each([
    [
      "docs focused checker",
      "pnpm --dir repos/arashi-docs validate:semantic-docs",
      "DOCS_CREATE_BASE_CHECK_UNREACHABLE",
    ],
    [
      "docs dependencies",
      "pnpm --dir repos/arashi-docs install --frozen-lockfile",
      "DOCS_CREATE_BASE_INSTALL_UNREACHABLE",
    ],
    [
      "skills source checker",
      "node repos/arashi-skills/scripts/validate-guidance.mjs",
      "SKILLS_CREATE_BASE_CHECK_UNREACHABLE",
    ],
    [
      "skills package checker",
      "node repos/arashi-skills/scripts/validate-guidance.mjs --skill-root package-check/skills/arashi",
      "SKILLS_CREATE_BASE_PACKAGE_CHECK_UNREACHABLE",
    ],
  ])(
    "rejects missing schema-v7 %s CI reachability",
    async (_label, command, code) => {
      const root = await schemaV7Fixture();
      const path = join(
        root,
        ".github/workflows/cross-repo-command-contracts.yml",
      );
      const workflow = await readFile(path, "utf8");
      await writeFile(path, workflow.replace(command, `# ${command}`));

      expect((await checkContracts(root)).diagnostics).toContainEqual(
        expect.objectContaining({
          code,
          source: ".github/workflows/cross-repo-command-contracts.yml",
        }),
      );
    },
  );
  test("rejects schema-v7 create-base prerequisites in a sibling CI job", async () => {
    const root = await schemaV7Fixture();
    await writeFile(
      join(root, ".github/workflows/cross-repo-command-contracts.yml"),
      `jobs:\n  prepare:\n    steps:\n      - run: pnpm --dir repos/arashi-docs install --frozen-lockfile\n  contracts:\n    steps:\n      - run: pnpm --dir repos/arashi-docs validate:semantic-docs\n      - run: node repos/arashi-skills/scripts/validate-guidance.mjs\n      - run: node repos/arashi-skills/scripts/validate-guidance.mjs --skill-root package-check/skills/arashi\n      - run: pnpm contracts:check\n`,
    );

    const codes = (await checkContracts(root)).diagnostics.map(
      (diagnostic) => diagnostic.code,
    );
    expect(codes).toContain("DOCS_CREATE_BASE_INSTALL_UNREACHABLE");
  });
  test("rejects commented and out-of-order schema-v7 CI commands", async () => {
    const root = await schemaV7Fixture();
    const path = join(
      root,
      ".github/workflows/cross-repo-command-contracts.yml",
    );
    const workflow = await readFile(path, "utf8");
    await writeFile(
      path,
      workflow
        .replace(
          "      - run: pnpm --dir repos/arashi schema:publish\n",
          "      # - run: pnpm --dir repos/arashi schema:publish\n",
        )
        .replace(
          "      - run: pnpm --dir repos/arashi-docs install --frozen-lockfile\n",
          "      - run: __CREATE_BASE_DOCS_SWAP__\n",
        )
        .replace(
          "      - run: pnpm --dir repos/arashi-docs validate:semantic-docs\n",
          "      - run: pnpm --dir repos/arashi-docs install --frozen-lockfile\n",
        )
        .replace(
          "      - run: __CREATE_BASE_DOCS_SWAP__\n",
          "      - run: pnpm --dir repos/arashi-docs validate:semantic-docs\n",
        ),
    );

    const codes = (await checkContracts(root)).diagnostics.map(
      (diagnostic) => diagnostic.code,
    );
    expect(codes).toContain("CLI_CREATE_BASE_SCHEMA_GENERATION_UNREACHABLE");
    expect(codes).toContain("DOCS_CREATE_BASE_SEQUENCE_UNREACHABLE");
  });
  test("rejects missing create-base child source, workflow, and contract trigger paths", async () => {
    const root = await schemaV7Fixture();
    const path = join(
      root,
      ".github/workflows/cross-repo-command-contracts.yml",
    );
    const workflow = await readFile(path, "utf8");
    await writeFile(
      path,
      workflow
        .replace('      - "repos/arashi/src/**"\n', "")
        .replace('      - "repos/arashi-docs/.github/workflows/**"\n', "")
        .replace('      - "repos/arashi-skills/contracts/**"\n', ""),
    );

    expect((await checkContracts(root)).diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "CREATE_BASE_TRIGGER_PATH_UNREACHABLE",
          subject: "repos/arashi/src/**",
        }),
        expect.objectContaining({
          code: "CREATE_BASE_TRIGGER_PATH_UNREACHABLE",
          subject: "repos/arashi-docs/.github/workflows/**",
        }),
        expect.objectContaining({
          code: "CREATE_BASE_TRIGGER_PATH_UNREACHABLE",
          subject: "repos/arashi-skills/contracts/**",
        }),
      ]),
    );
  });
  test.each([
    [
      "canonical docs contradiction",
      "repos/arashi-docs/docs/commands/create.md",
      (content: string) => `${content}\nConfiguration overrides CLI --base.\n`,
    ],
    [
      "generated curated export drift",
      "repos/arashi-docs/public/llms.txt",
      (content: string) =>
        content.replace(
          "Standalone create base selection is CLI-only and invocation-only",
          "Standalone create base selection reads workspace configuration",
        ),
    ],
  ])("rejects %s", async (_label, relativePath, mutate) => {
    const root = await schemaV7Fixture();
    const path = join(root, relativePath);
    await writeFile(path, mutate(await readFile(path, "utf8")));

    expect(
      (await checkContractsWithFocusedAcceptance(root)).diagnostics,
    ).toContainEqual(
      expect.objectContaining({ code: "DOCS_CREATE_BASE_CHECK_FAILED" }),
    );
  });
  test("rejects CLI contract drift from optional-user SSH alias syntax", async () => {
    const root = await schemaV6Fixture();
    const contractPath = join(root, "repos/arashi/contracts/cli-commands.json");
    const contract = JSON.parse(await readFile(contractPath, "utf8"));
    const add = contract.commands.find(
      (command: { path: string }) => command.path === "add",
    );
    add.arguments[0].description = "Git repository URL";
    await writeFile(contractPath, JSON.stringify(contract));

    expect((await checkContracts(root)).diagnostics).toContainEqual(
      expect.objectContaining({
        category: "schema",
        code: "SSH_ALIAS_CLI_CONTRACT_MISMATCH",
        source: "repos/arashi/contracts/cli-commands.json",
      }),
    );
  });
  test("rejects missing canonical and generated SSH alias guidance", async () => {
    const root = await schemaV6Fixture();
    await writeFile(
      join(root, "repos/arashi-docs/docs/commands/add.md"),
      "# add\n\nAdd a repository.\n",
    );

    expect((await checkContracts(root)).diagnostics).toContainEqual(
      expect.objectContaining({
        category: "docs",
        code: "SSH_ALIAS_GUIDANCE_MISMATCH",
        source: "repos/arashi-docs/docs/commands/add.md",
      }),
    );
  });
  test("rejects missing packaged SSH alias guidance", async () => {
    const root = await schemaV6Fixture();
    await writeFile(
      join(
        root,
        "repos/arashi-skills/skills/arashi/references/commands/workspace.md",
      ),
      "# Workspace commands\n\nRun Arashi commands.\n",
    );

    expect((await checkContracts(root)).diagnostics).toContainEqual(
      expect.objectContaining({
        category: "skills",
        code: "SSH_ALIAS_GUIDANCE_MISMATCH",
        source:
          "repos/arashi-skills/skills/arashi/references/commands/workspace.md",
      }),
    );
  });
  test("rejects repository-local insteadOf guidance for future clones", async () => {
    const root = await schemaV6Fixture();
    const guidancePath = join(
      root,
      "repos/arashi-skills/skills/arashi/references/commands/workspace.md",
    );
    const guidance = await readFile(guidancePath, "utf8");
    await writeFile(
      guidancePath,
      guidance
        .replace(
          "machine-global Git `url.<base>.insteadOf` rule",
          "local Git `url.<base>.insteadOf` rule",
        )
        .replace(
          'git config --global url."git@work-github:".insteadOf git@github.com:',
          "configure the rewrite in this repository",
        ),
    );

    expect((await checkContracts(root)).diagnostics).toContainEqual(
      expect.objectContaining({
        category: "skills",
        code: "SSH_ALIAS_GUIDANCE_MISMATCH",
        source:
          "repos/arashi-skills/skills/arashi/references/commands/workspace.md",
      }),
    );
  });
  test("requires focused SSH alias checks in coordinated CI", async () => {
    const root = await schemaV6Fixture();
    await writeFile(
      join(root, ".github/workflows/cross-repo-command-contracts.yml"),
      "jobs: {}\n",
    );

    expect((await checkContracts(root)).diagnostics).toContainEqual(
      expect.objectContaining({
        category: "docs",
        code: "SSH_ALIAS_WORKFLOW_UNWIRED",
        source: ".github/workflows/cross-repo-command-contracts.yml",
      }),
    );
  });
  test("rejects incomplete canonical completion guidance", async () => {
    const root = await schemaV6Fixture();
    await writeFile(
      join(root, "repos/arashi-docs/docs/commands/completion.md"),
      "# Completion\n\nRun `aw completion bash`.\n",
    );
    expect((await checkContracts(root)).diagnostics).toContainEqual(
      expect.objectContaining({
        code: "COMPLETION_GUIDANCE_INVALID",
        source: "repos/arashi-docs/docs/commands/completion.md",
      }),
    );
  });
  test("rejects polarity reversal in canonical completion safety guidance", async () => {
    const root = await schemaV6Fixture();
    const path = join(root, "repos/arashi-docs/docs/commands/completion.md");
    const content = await readFile(path, "utf8");
    await writeFile(
      path,
      content.replace(
        "It does not perform network requests or mutate workspace state. It does not execute hooks, does not prompt, and does not start child operations.",
        "It performs network requests and mutates workspace state. It executes hooks, prompts, and starts child operations.",
      ),
    );
    expect((await checkContracts(root)).diagnostics).toContainEqual(
      expect.objectContaining({
        code: "COMPLETION_GUIDANCE_INVALID",
        source: "repos/arashi-docs/docs/commands/completion.md",
      }),
    );
  });
  test("rejects incomplete canonical shell activation guidance", async () => {
    const root = await schemaV6Fixture();
    await writeFile(
      join(root, "repos/arashi-docs/docs/commands/shell.md"),
      "# Shell\n\nRun `aw shell install`.\n",
    );
    expect((await checkContracts(root)).diagnostics).toContainEqual(
      expect.objectContaining({
        code: "COMPLETION_GUIDANCE_INVALID",
        source: "repos/arashi-docs/docs/commands/shell.md",
      }),
    );
  });
  test.each([
    [
      "root help/version metadata",
      (data: any) => data.root.options.pop(),
      "CLI_COMPLETION_ROOT_INVALID",
      "root.--version",
    ],
    [
      "exact dynamic ownership",
      (data: any) => {
        data.commands
          .find((command: any) => command.path === "status")
          .options.find((entry: any) => entry.long === "--only").candidateKind =
          "worktree";
      },
      "CLI_COMPLETION_POLICY_INVALID",
      "status.--only",
    ],
    [
      "declared choices",
      (data: any) => {
        data.commands.find(
          (command: any) => command.path === "completion",
        ).arguments[0].choices = ["bash", "zsh"];
      },
      "CLI_COMPLETION_POLICY_INVALID",
      "completion.shell",
    ],
    [
      "declared conflicts",
      (data: any) => {
        data.commands
          .find((command: any) => command.path === "switch")
          .options.find((entry: any) => entry.long === "--tab").conflicts = [];
      },
      "CLI_COMPLETION_POLICY_INVALID",
      "switch.--tab",
    ],
    [
      "declared repeatability",
      (data: any) => {
        data.commands
          .find((command: any) => command.path === "handoff")
          .options.find((entry: any) => entry.long === "--risk").repeatable =
          false;
      },
      "CLI_COMPLETION_POLICY_INVALID",
      "handoff.--risk",
    ],
    [
      "hidden query exclusion",
      (data: any) => {
        data.commands.find(
          (command: any) => command.path === "completion __query",
        ).hidden = false;
      },
      "CLI_COMPLETION_HIDDEN_INVALID",
      "completion __query",
    ],
    [
      "completion companion policy",
      (data: any) => {
        data.commands.find(
          (command: any) => command.path === "completion",
        ).semantics.vscode.expectation = "required";
      },
      "CLI_COMPLETION_COMPANION_INVALID",
      "completion.vscode",
    ],
  ])("rejects schema-v6 %s drift", async (_label, mutate, code, subject) => {
    const root = await schemaV6Fixture();
    const path = join(root, "repos/arashi/contracts/cli-commands.json");
    const data = JSON.parse(await readFile(path, "utf8"));
    mutate(data);
    await writeFile(path, JSON.stringify(data));
    expect((await checkContracts(root)).diagnostics).toContainEqual(
      expect.objectContaining({ code, subject }),
    );
  });
  test.each([
    [
      "CLI generation",
      "pnpm --dir repos/arashi completion:generate",
      "CLI_COMPLETION_GENERATION_UNREACHABLE",
    ],
    [
      "CLI freshness",
      "pnpm --dir repos/arashi completion:check",
      "CLI_COMPLETION_FRESHNESS_UNREACHABLE",
    ],
    [
      "generated artifact diff",
      "git -C repos/arashi diff --exit-code -- src/generated/completions.ts",
      "CLI_COMPLETION_FRESHNESS_UNREACHABLE",
    ],
    [
      "focused docs",
      "pnpm --dir repos/arashi-docs validate:semantic-docs",
      "DOCS_COMPLETION_CHECK_UNREACHABLE",
    ],
    [
      "focused skills source",
      "node repos/arashi-skills/scripts/validate-guidance.mjs",
      "SKILLS_COMPLETION_CHECK_UNREACHABLE",
    ],
    [
      "focused skills package",
      "node repos/arashi-skills/scripts/validate-guidance.mjs --skill-root package-check/skills/arashi",
      "SKILLS_COMPLETION_PACKAGE_CHECK_UNREACHABLE",
    ],
  ])("rejects missing %s CI reachability", async (_label, command, code) => {
    const root = await schemaV6Fixture();
    const path = join(
      root,
      ".github/workflows/cross-repo-command-contracts.yml",
    );
    await writeFile(
      path,
      (await readFile(path, "utf8")).replace(`${command}\n`, ""),
    );
    expect((await checkContracts(root)).diagnostics).toContainEqual(
      expect.objectContaining({
        code,
        source: ".github/workflows/cross-repo-command-contracts.yml",
      }),
    );
  });
  test.each([
    [
      "docs",
      "repos/arashi-docs/scripts/check-shell-completion-docs.ts",
      "DOCS_COMPLETION_CHECK_FAILED",
      "process.exit(7);\n",
    ],
    [
      "skills source",
      "repos/arashi-skills/scripts/shell-completion-guidance-selftest.mjs",
      "SKILLS_COMPLETION_CHECK_FAILED",
      "if (!process.argv.includes('--skill-root')) process.exit(7);\n",
    ],
    [
      "skills extracted package",
      "repos/arashi-skills/scripts/shell-completion-guidance-selftest.mjs",
      "SKILLS_COMPLETION_PACKAGE_CHECK_FAILED",
      "if (process.argv.includes('--skill-root')) process.exit(7);\n",
    ],
  ])(
    "runs the focused %s completion checker",
    async (_label, relativePath, code, source) => {
      const root = await schemaV6Fixture();
      await writeFile(join(root, relativePath), source);
      expect(
        (await checkContractsWithFocusedAcceptance(root)).diagnostics,
      ).toContainEqual(expect.objectContaining({ code }));
    },
  );
  test("rejects a string-valued schema version instead of bypassing schema-v5 checks", async () => {
    const root = await schemaV5Fixture();
    const path = join(root, "repos/arashi/contracts/cli-commands.json");
    const data = JSON.parse(await readFile(path, "utf8"));
    data.schemaVersion = "5";
    await writeFile(path, JSON.stringify(data));

    expect((await checkContracts(root)).diagnostics).toContainEqual(
      expect.objectContaining({
        code: "SCHEMA_VERSION_UNSUPPORTED",
        source: "repos/arashi/contracts/cli-commands.json",
      }),
    );
  });
  test.each([
    ["status selector", "status", "--only"],
    ["canonical switch option", "switch", "--ignore-configured-launcher"],
  ])("rejects a missing schema-v5 %s", async (_label, commandName, long) => {
    const root = await schemaV5Fixture();
    const path = join(root, "repos/arashi/contracts/cli-commands.json");
    const data = JSON.parse(await readFile(path, "utf8"));
    const command = data.commands.find(
      (entry: any) => entry.path === commandName,
    );
    command.options = command.options.filter(
      (option: any) => option.long !== long,
    );
    await writeFile(path, JSON.stringify(data));

    expect((await checkContracts(root)).diagnostics).toContainEqual(
      expect.objectContaining({
        code: "CLI_OPTION_SURFACE_MISMATCH",
        subject: `${commandName}.${long}`,
      }),
    );
  });
  test("rejects a missing audited zero-option command", async () => {
    const root = await schemaV5Fixture();
    const path = join(root, "repos/arashi/contracts/cli-commands.json");
    const data = JSON.parse(await readFile(path, "utf8"));
    data.commands = data.commands.filter(
      (entry: any) => entry.path !== "shell install",
    );
    await writeFile(path, JSON.stringify(data));

    expect((await checkContracts(root)).diagnostics).toContainEqual(
      expect.objectContaining({
        code: "CLI_OPTION_SURFACE_MISMATCH",
        subject: "shell install",
      }),
    );
  });
  test.each([
    [
      "unknown command",
      (data: any) => data.commands.push({ options: [], path: "future" }),
      "future",
    ],
    [
      "unknown option",
      (data: any) =>
        data.commands
          .find((entry: any) => entry.path === "status")
          .options.push({
            deprecated: false,
            description: "Future option",
            flags: "--future",
            hidden: false,
            long: "--future",
            optional: false,
            required: false,
            semanticPolicyOwner: "structural",
            short: null,
            valueShape: "boolean",
            variadic: false,
          }),
      "status.--future",
    ],
  ])("rejects an %s", async (_label, mutate, subject) => {
    const root = await schemaV5Fixture();
    const path = join(root, "repos/arashi/contracts/cli-commands.json");
    const data = JSON.parse(await readFile(path, "utf8"));
    mutate(data);
    await writeFile(path, JSON.stringify(data));

    expect((await checkContracts(root)).diagnostics).toContainEqual(
      expect.objectContaining({ code: "CLI_OPTION_SURFACE_MISMATCH", subject }),
    );
  });
  test("rejects malformed schema-v5 option array entries", async () => {
    const root = await schemaV5Fixture();
    const path = join(root, "repos/arashi/contracts/cli-commands.json");
    const data = JSON.parse(await readFile(path, "utf8"));
    const statusOptions = data.commands.find(
      (entry: any) => entry.path === "status",
    ).options;
    const malformedIndex = statusOptions.length;
    statusOptions.push(null);
    await writeFile(path, JSON.stringify(data));

    expect((await checkContracts(root)).diagnostics).toContainEqual(
      expect.objectContaining({
        code: "CLI_OPTION_SCHEMA_INVALID",
        subject: `status.options[${malformedIndex}]`,
      }),
    );
  });
  test("rejects an unapproved specialized short alias", async () => {
    const root = await schemaV5Fixture();
    const path = join(root, "repos/arashi/contracts/cli-commands.json");
    const data = JSON.parse(await readFile(path, "utf8"));
    const check = data.commands
      .find((entry: any) => entry.path === "update")
      .options.find((option: any) => option.long === "--check");
    check.short = "-x";
    check.flags = "-x, --check";
    await writeFile(path, JSON.stringify(data));

    expect((await checkContracts(root)).diagnostics).toContainEqual(
      expect.objectContaining({
        code: "CLI_ALIAS_UNAPPROVED",
        subject: "update.--check",
      }),
    );
  });
  test("rejects inconsistent option flags, long name, and short alias", async () => {
    const root = await schemaV5Fixture();
    const path = join(root, "repos/arashi/contracts/cli-commands.json");
    const data = JSON.parse(await readFile(path, "utf8"));
    data.commands
      .find((entry: any) => entry.path === "status")
      .options.find((option: any) => option.long === "--json").flags = "--json";
    await writeFile(path, JSON.stringify(data));

    expect((await checkContracts(root)).diagnostics).toContainEqual(
      expect.objectContaining({
        code: "CLI_OPTION_SCHEMA_INVALID",
        subject: "status.--json",
      }),
    );
  });
  test.each(["hidden", "deprecated"])(
    "rejects a canonical compatibility option that is %s",
    async (field) => {
      const root = await schemaV5Fixture();
      const path = join(root, "repos/arashi/contracts/cli-commands.json");
      const data = JSON.parse(await readFile(path, "utf8"));
      data.commands
        .find((entry: any) => entry.path === "switch")
        .options.find((option: any) => option.long === "--launch")[field] =
        true;
      await writeFile(path, JSON.stringify(data));

      expect((await checkContracts(root)).diagnostics).toContainEqual(
        expect.objectContaining({
          code: "CLI_COMPATIBILITY_INVALID",
          subject: "switch.--launch",
        }),
      );
    },
  );
  test.each([
    ["missing", "create", "--json", null],
    ["stale", "create", "--json", "-x"],
    ["command-local add name exception", "add", "--name", "-o"],
    ["long-only exec jobs exception", "exec", "--jobs", "-j"],
  ])(
    "rejects %s alias policy drift",
    async (_label, commandName, long, short) => {
      const root = await schemaV5Fixture();
      const path = join(root, "repos/arashi/contracts/cli-commands.json");
      const data = JSON.parse(await readFile(path, "utf8"));
      const option = data.commands
        .find((command: { path: string }) => command.path === commandName)
        .options.find((entry: { long: string }) => entry.long === long);
      option.short = short;
      option.flags = option.flags.replace(/^-\w,\s*/, "");
      if (short) option.flags = `${short}, ${option.flags}`;
      await writeFile(path, JSON.stringify(data));

      expect((await checkContracts(root)).diagnostics).toContainEqual(
        expect.objectContaining({
          code: "CLI_ALIAS_MISMATCH",
          subject: `${commandName}.${long}`,
        }),
      );
    },
  );
  test("rejects a command-local short alias collision", async () => {
    const root = await schemaV5Fixture();
    const path = join(root, "repos/arashi/contracts/cli-commands.json");
    const data = JSON.parse(await readFile(path, "utf8"));
    const create = data.commands.find(
      (command: { path: string }) => command.path === "create",
    );
    const json = create.options.find(
      (entry: { long: string }) => entry.long === "--json",
    );
    json.short = "-n";
    json.flags = "-n, --json";
    await writeFile(path, JSON.stringify(data));

    expect((await checkContracts(root)).diagnostics).toContainEqual(
      expect.objectContaining({
        code: "CLI_ALIAS_COLLISION",
        subject: "create.-n",
      }),
    );
  });
  test.each([
    [
      "compatibility mapping",
      (data: any) =>
        (data.commands
          .find((command: any) => command.path === "switch")
          .options.find(
            (entry: any) => entry.long === "--launch",
          ).semanticPolicy.compatibility.alternatives = ["--invented"]),
      "CLI_COMPATIBILITY_INVALID",
      "switch.--launch",
    ],
    [
      "deprecation visibility",
      (data: any) =>
        (data.commands
          .find((command: any) => command.path === "switch")
          .options.find((entry: any) => entry.long === "--no-cd").hidden =
          false),
      "CLI_COMPATIBILITY_INVALID",
      "switch.--launch",
    ],
    [
      "removal boundary",
      (data: any) =>
        (data.commands
          .find((command: any) => command.path === "handoff")
          .options.find(
            (entry: any) => entry.long === "--markdown",
          ).semanticPolicy.compatibility.removal.earliestMajor = 1),
      "CLI_COMPATIBILITY_INVALID",
      "handoff.--markdown",
    ],
    [
      "stale conflict reference",
      (data: any) =>
        data.commands
          .find((command: any) => command.path === "switch")
          .options.find((entry: any) => entry.long === "--launch")
          .semanticPolicy.conflicts.push("--invented"),
      "CLI_POLICY_REFERENCE_INVALID",
      "switch.--launch",
    ],
    [
      "wrong policy owner",
      (data: any) =>
        (data.commands
          .find((command: any) => command.path === "switch")
          .options.find(
            (entry: any) => entry.long === "--launch",
          ).semanticPolicy.ownership = "structural"),
      "CLI_OPTION_SCHEMA_INVALID",
      "switch.--launch",
    ],
  ])("rejects schema-v5 %s drift", async (_label, mutate, code, subject) => {
    const root = await schemaV5Fixture();
    const path = join(root, "repos/arashi/contracts/cli-commands.json");
    const data = JSON.parse(await readFile(path, "utf8"));
    mutate(data);
    await writeFile(path, JSON.stringify(data));

    expect((await checkContracts(root)).diagnostics).toContainEqual(
      expect.objectContaining({ code, subject }),
    );
  });
  test.each([
    [
      "malformed selector literal",
      (option: any) => (option.semanticPolicy.selector.flatten = "sorted"),
      "CLI_SELECTOR_POLICY_INVALID",
    ],
    [
      "wrong selector owner",
      (option: any) => (option.semanticPolicyOwner = "structural"),
      "CLI_OPTION_SCHEMA_INVALID",
    ],
    [
      "missing selector policy",
      (option: any) => delete option.semanticPolicy,
      "CLI_SELECTOR_POLICY_MISSING",
    ],
  ])("rejects %s", async (_label, mutate, code) => {
    const root = await schemaV5Fixture();
    const path = join(root, "repos/arashi/contracts/cli-commands.json");
    const data = JSON.parse(await readFile(path, "utf8"));
    const option = data.commands
      .find((command: any) => command.path === "status")
      .options.find((entry: any) => entry.long === "--only");
    mutate(option);
    await writeFile(path, JSON.stringify(data));

    expect((await checkContracts(root)).diagnostics).toContainEqual(
      expect.objectContaining({ code, subject: "status.--only" }),
    );
  });
  test("rejects asymmetric update inspection conflicts", async () => {
    const root = await schemaV5Fixture();
    const path = join(root, "repos/arashi/contracts/cli-commands.json");
    const data = JSON.parse(await readFile(path, "utf8"));
    data.commands
      .find((command: any) => command.path === "update")
      .options.find(
        (entry: any) => entry.long === "--dry-run",
      ).semanticPolicy.conflicts = [];
    await writeFile(path, JSON.stringify(data));

    expect((await checkContracts(root)).diagnostics).toContainEqual(
      expect.objectContaining({
        code: "CLI_UPDATE_POLICY_INVALID",
        subject: "update.--dry-run",
      }),
    );
  });
  test("rejects update JSON execution drift", async () => {
    const root = await schemaV5Fixture();
    const path = join(root, "repos/arashi/contracts/cli-commands.json");
    const data = JSON.parse(await readFile(path, "utf8"));
    data.commands
      .find((command: any) => command.path === "update")
      .options.find(
        (entry: any) => entry.long === "--json",
      ).semanticPolicy.jsonExecution.prompt = true;
    await writeFile(path, JSON.stringify(data));

    expect((await checkContracts(root)).diagnostics).toContainEqual(
      expect.objectContaining({
        code: "CLI_UPDATE_POLICY_INVALID",
        subject: "update.--json",
      }),
    );
  });
  test("rejects normalized docs record drift instead of loose token parity", async () => {
    const root = await schemaV5Fixture();
    const path = join(root, "repos/arashi-docs/contracts/cli-options.json");
    const data = JSON.parse(await readFile(path, "utf8"));
    data.switch.ignoreConfiguredLauncher.preserveBehaviorModes = [
      "auto",
      "launch",
    ];
    await writeFile(path, JSON.stringify(data));

    expect((await checkContracts(root)).diagnostics).toContainEqual(
      expect.objectContaining({
        code: "DOCS_CLI_OPTION_POLICY_MISMATCH",
        subject: "switch.ignoreConfiguredLauncher.preserveBehaviorModes",
      }),
    );
  });
});
