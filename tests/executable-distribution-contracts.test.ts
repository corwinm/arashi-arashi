import { afterEach, describe, expect, test } from "vitest";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { checkExecutableDistributionContracts } from "../scripts/executable-distribution-contracts";

const roots: string[] = [];

afterEach(async () => {
  await Promise.all(
    roots.splice(0).map((root) => rm(root, { recursive: true })),
  );
});

const contract = {
  alias: { expansion: "Arashi Workspace", name: "aw" },
  canonical: "arashi",
  completionNames: ["arashi", "aw"],
  identity: {
    branding: "arashi",
    commanderProgramName: "arashi",
    configurationVocabulary: "arashi",
    environmentPrefix: "ARASHI_",
    managedShellBlock: "arashi",
    packageName: "arashi",
  },
  ledger: { name: ".arashi-managed-entrypoints.json", schemaVersion: 1 },
  nativeBinaries: { posix: "arashi.bin", windows: "arashi.bin.exe" },
  npmBins: { arashi: "./bin/arashi.js", aw: "./bin/arashi.js" },
  ownership: {
    collisionPolicy: "marker-and-ledger-hash",
    ledger: { name: ".arashi-managed-entrypoints.json", schemaVersion: 1 },
    markers: {
      cmd: "arashi-managed-alias:aw:v1",
      posix: "arashi-managed-alias:aw:v1",
      powershell: "arashi-managed-alias:aw:v1",
    },
  },
  posix: {
    installed: ["arashi.bin", "arashi", "aw"],
    releaseLaunchers: ["arashi", "aw"],
  },
  schemaVersion: 1,
  shellWrapperNames: ["arashi", "aw"],
  windows: {
    installed: [
      "arashi.bin.exe",
      "arashi",
      "arashi.ps1",
      "arashi.bat",
      "aw",
      "aw.ps1",
      "aw.bat",
    ],
    releaseLaunchers: [
      "arashi",
      "arashi.ps1",
      "arashi.bat",
      "aw",
      "aw.ps1",
      "aw.bat",
    ],
  },
};

const docs = `# Install Arashi\n\nThe \`arashi\` executable remains supported for existing scripts and workflows. npm and direct macOS, Linux, and Windows installers provide both names. Both names support shell integration and completion through the same native binary. Direct installation refuses destination and effective PATH collisions before mutation. Existing shell aliases and functions are a separate namespace conflict. Manual Windows installation requires arashi-windows-x64.exe, arashi, arashi.ps1, arashi.bat, aw, aw.ps1, and aw.bat. Manually placed wrappers have no direct-installer ownership ledger; deliberately move or remove them before installer migration.\n`;
const landingDocs = `# Arashi\n\nCoordinate Git worktrees across every repository in your stack.\n`;
const gettingStartedDocs = `${docs}\nThe \`arashi\` executable remains supported for existing scripts and workflows. The macOS/Linux installer provides both \`arashi\` and \`aw\`. The PowerShell installer provides both \`arashi\` and \`aw\`. npm installs provide both \`arashi\` and \`aw\`. Run aw status. Refuse an unrelated existing \`aw\` command on PATH or at the destination. A manual wrapper is an unsupported interim workaround for older releases with no direct-installer ownership ledger; deliberately move or remove it.\n`;
const shellDocs = `Shell integration enables both installed executable names in one managed block, preserves an unrelated \`aw\` alias or function, and uses command aw.\n`;
const completionDocs = `Completion supports both \`arashi\` and \`aw\` through command aw.\n`;
const updateDocs = `An update refreshes both \`arashi\` and \`aw\`; both names continue to use the same release.\n`;
const skills = `Use \`aw --help\` for discovery. The \`arashi\` executable remains supported for existing scripts and workflows, and installations provide both names through the same implementation. See https://arashi.haphazard.dev.\n`;

async function fixture(): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), "arashi-executable-contracts-"));
  roots.push(root);
  const files: Record<string, string> = {
    "repos/arashi/contracts/executable-distribution.json": `${JSON.stringify(contract, null, 2)}\n`,
    "repos/arashi/package.json": `${JSON.stringify({ bin: { arashi: "./bin/arashi.js", aw: "./bin/arashi.js" }, scripts: { "release:verify-aw": "node scripts/release/verify-aw.ts" } })}\n`,
    "repos/arashi/.github/workflows/verify-aw-release.yml":
      'on:\n  workflow_dispatch:\n    inputs:\n      version:\n        required: true\njobs:\n  verify-aw-posix:\n    runs-on: ubuntu-latest\n    steps:\n      - env:\n          VERIFY_VERSION: ${{ inputs.version }}\n        run: pnpm release:verify-aw -- "$VERIFY_VERSION"\n  verify-aw-windows:\n    runs-on: windows-latest\n    env:\n      VERIFY_VERSION: ${{ inputs.version }}\n    steps:\n      - run: pnpm release:verify-aw -- "$env:VERIFY_VERSION"\n      - run: powershell.exe -NoProfile -Command arashi --version\n      - run: cmd.exe /d /s /c aw --version\n      - run: bash.exe --noprofile --norc -c \'aw --version\'\n',
    "repos/arashi/contracts/cli-commands.json": `${JSON.stringify({ schemaVersion: 1, aliasPaths: [], commands: [{ path: "status", aliases: [] }] })}\n`,
    "repos/arashi-vscode/contracts/command-policy.json": `${JSON.stringify({ commands: ["arashi.status"], executableAliases: [] })}\n`,
    "repos/arashi-docs/docs/index.mdx": landingDocs,
    "repos/arashi-docs/docs/getting-started/index.md": gettingStartedDocs,
    "repos/arashi-docs/docs/commands/shell.md": shellDocs,
    "repos/arashi-docs/docs/commands/completion.md": completionDocs,
    "repos/arashi-docs/docs/commands/update.md": updateDocs,
    "repos/arashi-docs/public/index.md": landingDocs,
    "repos/arashi-docs/public/getting-started.md": gettingStartedDocs,
    "repos/arashi-docs/public/getting-started/installation.md": docs,
    "repos/arashi-docs/public/commands/shell.md": shellDocs,
    "repos/arashi-docs/public/commands/completion.md": completionDocs,
    "repos/arashi-docs/public/commands/update.md": updateDocs,
    "repos/arashi-docs/public/llms.txt": `The \`arashi\` executable remains supported for existing scripts and workflows. See Getting started.\n`,
    "repos/arashi-docs/public/llms-full.txt": docs,
    "repos/arashi-skills/skills/arashi/references/commands/setup.md": skills,
    "repos/arashi-skills/skills/arashi/README.md": skills,
    "package-check/skills/arashi/references/commands/setup.md": skills,
    "package-check/skills/arashi/README.md": skills,
  };
  for (const [path, content] of Object.entries(files)) {
    const destination = join(root, path);
    await mkdir(join(destination, ".."), { recursive: true });
    await writeFile(destination, content);
  }
  return root;
}

async function mutateJson(
  root: string,
  path: string,
  update: (value: any) => void,
) {
  const fullPath = join(root, path);
  const value = JSON.parse(
    await import("node:fs/promises").then(({ readFile }) =>
      readFile(fullPath, "utf8"),
    ),
  );
  update(value);
  await writeFile(fullPath, `${JSON.stringify(value, null, 2)}\n`);
}

describe("executable distribution contracts", () => {
  test("accepts aligned CLI, docs, exports, authored skill, packaged skill, and companion exclusions", async () => {
    expect(await checkExecutableDistributionContracts(await fixture())).toEqual(
      {
        ok: true,
        diagnostics: [],
      },
    );
  });

  test.each([
    [
      "canonical identity",
      (value: any) => (value.canonical = "aw"),
      "EXECUTABLE_IDENTITY_MISMATCH",
    ],
    [
      "alias expansion",
      (value: any) => (value.alias.expansion = "Arashi Worktree"),
      "EXECUTABLE_ALIAS_EXPANSION_MISMATCH",
    ],
    [
      "npm shared entrypoint",
      (value: any) => (value.npmBins.aw = "./bin/aw.js"),
      "EXECUTABLE_NATIVE_DUPLICATION",
    ],
    [
      "POSIX payload",
      (value: any) => value.posix.installed.pop(),
      "EXECUTABLE_POSIX_PAYLOAD_MISMATCH",
    ],
    [
      "Windows payload",
      (value: any) => value.windows.installed.pop(),
      "EXECUTABLE_WINDOWS_PAYLOAD_MISMATCH",
    ],
    [
      "ownership ledger",
      (value: any) => delete value.ownership.ledger,
      "EXECUTABLE_OWNERSHIP_MISMATCH",
    ],
    [
      "shell names",
      (value: any) => value.shellWrapperNames.pop(),
      "EXECUTABLE_SHELL_MISMATCH",
    ],
    [
      "completion names",
      (value: any) => value.completionNames.pop(),
      "EXECUTABLE_COMPLETION_MISMATCH",
    ],
  ])("rejects %s drift", async (_label, update, code) => {
    const root = await fixture();
    await mutateJson(
      root,
      "repos/arashi/contracts/executable-distribution.json",
      update as (value: any) => void,
    );
    const result = await checkExecutableDistributionContracts(root);
    expect(result.ok).toBe(false);
    expect(result.diagnostics).toContainEqual(
      expect.objectContaining({ code }),
    );
  });

  test("rejects aw in Commander command aliases", async () => {
    const root = await fixture();
    await mutateJson(
      root,
      "repos/arashi/contracts/cli-commands.json",
      (value) => value.commands[0].aliases.push("aw"),
    );
    expect(
      (await checkExecutableDistributionContracts(root)).diagnostics,
    ).toContainEqual(
      expect.objectContaining({ code: "EXECUTABLE_COMMANDER_ALIAS_FORBIDDEN" }),
    );
  });

  test("rejects executable parity claims in the VS Code policy", async () => {
    const root = await fixture();
    await mutateJson(
      root,
      "repos/arashi-vscode/contracts/command-policy.json",
      (value) => value.executableAliases.push("aw"),
    );
    expect(
      (await checkExecutableDistributionContracts(root)).diagnostics,
    ).toContainEqual(
      expect.objectContaining({ code: "EXECUTABLE_VSCODE_ALIAS_FORBIDDEN" }),
    );
  });

  test.each([
    ["extra npm bin", (value: any) => (value.npmBins.rogue = "./bin/rogue.js")],
    [
      "renamed ownership marker",
      (value: any) => {
        value.ownership.markers.shell = value.ownership.markers.posix;
        delete value.ownership.markers.posix;
      },
    ],
  ])("rejects non-exact typed contract shape: %s", async (_label, update) => {
    const root = await fixture();
    await mutateJson(
      root,
      "repos/arashi/contracts/executable-distribution.json",
      update,
    );
    expect(
      (await checkExecutableDistributionContracts(root)).diagnostics,
    ).toContainEqual(
      expect.objectContaining({
        code: expect.stringMatching(
          /EXECUTABLE_(?:NATIVE_DUPLICATION|OWNERSHIP_MISMATCH)/,
        ),
      }),
    );
  });

  test("rejects extra package bin metadata", async () => {
    const root = await fixture();
    await mutateJson(root, "repos/arashi/package.json", (value) => {
      value.bin.rogue = "./bin/rogue.js";
    });
    expect(
      (await checkExecutableDistributionContracts(root)).diagnostics,
    ).toContainEqual(
      expect.objectContaining({ code: "EXECUTABLE_RELEASE_GATE_MISMATCH" }),
    );
  });

  test("rejects latest and incomplete release workflow semantics", async () => {
    const root = await fixture();
    await writeFile(
      join(root, "repos/arashi/.github/workflows/verify-aw-release.yml"),
      "on: workflow_dispatch\njobs:\n  verify-aw-windows:\n    runs-on: windows-latest\n    steps:\n      - run: pnpm release:verify-aw -- latest\n",
    );
    expect(
      (await checkExecutableDistributionContracts(root)).diagnostics,
    ).toContainEqual(
      expect.objectContaining({ code: "EXECUTABLE_RELEASE_GATE_MISMATCH" }),
    );
  });

  test.each([
    ["POSIX", 'pnpm release:verify-aw -- "$VERIFY_VERSION"'],
    ["Windows", 'pnpm release:verify-aw -- "$env:VERIFY_VERSION"'],
  ])(
    "rejects a %s release command disconnected from the dispatched exact version",
    async (_channel, boundCommand) => {
      const root = await fixture();
      const path = "repos/arashi/.github/workflows/verify-aw-release.yml";
      const workflow = await readFile(join(root, path), "utf8");
      await writeFile(
        join(root, path),
        workflow.replace(boundCommand, "pnpm release:verify-aw -- 1.2.3"),
      );
      expect(
        (await checkExecutableDistributionContracts(root)).diagnostics,
      ).toContainEqual(
        expect.objectContaining({ code: "EXECUTABLE_RELEASE_GATE_MISMATCH" }),
      );
    },
  );

  test("rejects a POSIX verifier environment disconnected from the dispatched exact version", async () => {
    const root = await fixture();
    const path = "repos/arashi/.github/workflows/verify-aw-release.yml";
    const workflow = await readFile(join(root, path), "utf8");
    await writeFile(
      join(root, path),
      workflow.replace(
        "VERIFY_VERSION: ${{ inputs.version }}",
        "VERIFY_VERSION: 1.2.3",
      ),
    );
    expect(
      (await checkExecutableDistributionContracts(root)).diagnostics,
    ).toContainEqual(
      expect.objectContaining({ code: "EXECUTABLE_RELEASE_GATE_MISMATCH" }),
    );
  });

  test("rejects expanded alias copy on the landing page", async () => {
    const root = await fixture();
    const path = "repos/arashi-docs/docs/index.mdx";
    await writeFile(
      join(root, path),
      `${landingDocs}\n\`aw\` means “Arashi Workspace”.\n`,
    );
    expect(
      (await checkExecutableDistributionContracts(root)).diagnostics,
    ).toContainEqual(
      expect.objectContaining({
        code: "EXECUTABLE_AUTHORED_DOCS_MISMATCH",
        source: path,
      }),
    );
  });

  test("requires the extracted packaged skill corpus", async () => {
    const root = await fixture();
    await rm(join(root, "package-check"), { force: true, recursive: true });
    expect(
      (await checkExecutableDistributionContracts(root)).diagnostics,
    ).toContainEqual(
      expect.objectContaining({
        code: "EXECUTABLE_PACKAGED_SKILL_MISMATCH",
        source: "package-check/skills/arashi/references/commands/setup.md",
      }),
    );
  });

  test("binds required true to the dispatched version input", async () => {
    const root = await fixture();
    const path = "repos/arashi/.github/workflows/verify-aw-release.yml";
    const workflow = await readFile(join(root, path), "utf8");
    await writeFile(
      join(root, path),
      workflow
        .replace("required: true", "required: false")
        .replace("jobs:\n", "jobs:\n  unrelated:\n    required: true\n"),
    );
    expect(
      (await checkExecutableDistributionContracts(root)).diagnostics,
    ).toContainEqual(
      expect.objectContaining({ code: "EXECUTABLE_RELEASE_GATE_MISMATCH" }),
    );
  });

  test("binds each release runner to its owning verification job", async () => {
    const root = await fixture();
    const path = "repos/arashi/.github/workflows/verify-aw-release.yml";
    const workflow = await readFile(join(root, path), "utf8");
    await writeFile(
      join(root, path),
      workflow
        .replace("runs-on: ubuntu-latest", "runs-on: runner-swap-placeholder")
        .replace("runs-on: windows-latest", "runs-on: ubuntu-latest")
        .replace("runs-on: runner-swap-placeholder", "runs-on: windows-latest"),
    );
    expect(
      (await checkExecutableDistributionContracts(root)).diagnostics,
    ).toContainEqual(
      expect.objectContaining({ code: "EXECUTABLE_RELEASE_GATE_MISMATCH" }),
    );
  });

  test("does not accept commented native-shell process tokens", async () => {
    const root = await fixture();
    const path = "repos/arashi/.github/workflows/verify-aw-release.yml";
    const workflow = await readFile(join(root, path), "utf8");
    await writeFile(
      join(root, path),
      `${workflow
        .replace("powershell.exe", "missing-powershell")
        .replace("cmd.exe", "missing-cmd")
        .replace(
          "bash.exe",
          "missing-bash",
        )}\n# powershell.exe cmd.exe bash.exe\n`,
    );
    expect(
      (await checkExecutableDistributionContracts(root)).diagnostics,
    ).toContainEqual(
      expect.objectContaining({ code: "EXECUTABLE_RELEASE_GATE_MISMATCH" }),
    );
  });

  test.each([
    ["authored docs", "repos/arashi-docs/docs/getting-started/index.md"],
    ["generated docs", "repos/arashi-docs/public/getting-started.md"],
    ["llms index", "repos/arashi-docs/public/llms.txt"],
    ["llms full export", "repos/arashi-docs/public/llms-full.txt"],
    [
      "authored skill",
      "repos/arashi-skills/skills/arashi/references/commands/setup.md",
    ],
    [
      "packaged skill",
      "package-check/skills/arashi/references/commands/setup.md",
    ],
  ])("rejects missing alias semantics in %s", async (_label, path) => {
    const root = await fixture();
    await writeFile(join(root, path), "arashi only\n");
    const result = await checkExecutableDistributionContracts(root);
    expect(result.ok).toBe(false);
    expect(result.diagnostics).toContainEqual(
      expect.objectContaining({
        source: path,
        code: expect.stringMatching(/^EXECUTABLE_/),
      }),
    );
  });
});
