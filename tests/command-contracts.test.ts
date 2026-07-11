import { afterEach, describe, expect, test } from "bun:test";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
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
    "repos/arashi/contracts/cli-commands.json": {
      schemaVersion: 1,
      cliVersion: "1.0.0",
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
            vscode: { expectation: "excluded", reason: "internal" },
          },
        },
      ],
    },
    "repos/arashi-docs/docs/commands/add.md": "# Add\n",
    "repos/arashi-docs/docs/commands/index.md": "- [Add](/commands/add/)\n",
    "repos/arashi-skills/contracts/command-coverage.json": {
      schemaVersion: 1,
      commands: [
        { name: "add", status: "covered", reference: "references/commands.md" },
        { name: "old", status: "excluded", reason: "internal" },
      ],
    },
    "repos/arashi-skills/skills/arashi/references/commands.md":
      "Use `arashi add`.\n",
    "repos/arashi-vscode/contracts/command-policy.json": {
      schemaVersion: 1,
      cliCommands: {
        add: { state: "mapped", commands: ["arashi.add"] },
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
    const data = JSON.parse(await Bun.file(path).text());
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
  test("finds unresolved parity, invalid mappings, and undeclared extension commands", async () => {
    const root = await fixture();
    const policyPath = join(
      root,
      "repos/arashi-vscode/contracts/command-policy.json",
    );
    const policy = JSON.parse(await Bun.file(policyPath).text());
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
  test("sorts diagnostics deterministically and formats stable output", async () => {
    const root = await fixture();
    await rm(join(root, "repos/arashi-docs/docs/commands/add.md"));
    const a = await checkContracts(root);
    const b = await checkContracts(root);
    expect(a).toEqual(b);
    expect(formatHuman(a)).toContain("[error] DOCS_PAGE_MISSING");
  });
});
