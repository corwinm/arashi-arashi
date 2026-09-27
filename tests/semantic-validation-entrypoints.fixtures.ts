import { spawnSync } from "node:child_process";
import {
  cp,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { afterEach, expect } from "vitest";
const roots: string[] = [];
const metaRoot = process.cwd();
const registryPath = "scripts/contract-checks.json";
const registry = [
  "scripts/check-command-contracts.ts",
  "scripts/check-documented-command-contracts.ts",
  "scripts/check-executable-distribution-contracts.ts",
  "scripts/check-hook-contracts.ts",
  "scripts/check-inline-hook-contracts.ts",
  "scripts/check-worktree-materialization-contracts.ts",
  "scripts/check-worktree-naming-contracts.ts",
];
const metaInstallStage = "pnpm install --frozen-lockfile";
const cliInstallStage = "pnpm --dir repos/arashi install --frozen-lockfile";
const cliSchemaPublishStage = "pnpm --dir repos/arashi schema:publish";
const cliSchemaCheckStage = "pnpm --dir repos/arashi schema:check";
const cliContractGenerateStage = "pnpm --dir repos/arashi contract:generate";
const cliContractCheckStage = "pnpm --dir repos/arashi contract:check";
const cliCompletionGenerateStage =
  "pnpm --dir repos/arashi completion:generate";
const cliCompletionCheckStage = "pnpm --dir repos/arashi completion:check";
const cliGeneratedDiffStage =
  "git -C repos/arashi diff --exit-code -- schema/config.schema.json contracts/cli-commands.json contracts/executable-distribution.json src/generated/completions.ts";
const docsInstallStage =
  "pnpm --dir repos/arashi-docs install --frozen-lockfile";
const docsStage = "pnpm --dir repos/arashi-docs validate:semantic-docs";
const skillsSourceStage =
  "node repos/arashi-skills/scripts/validate-guidance.mjs";
const skillsPackageStage = `${skillsSourceStage} --skill-root package-check/skills/arashi`;
const skillsArchiveCreateStage =
  "node repos/arashi-skills/scripts/create-release-archive.mjs --root repos/arashi-skills --output arashi-skill-package.tar.gz";
const skillsArchiveVerifyStage =
  "node repos/arashi-skills/scripts/create-release-archive.mjs --verify arashi-skill-package.tar.gz";
const skillsArchiveDestinationStage = "mkdir package-check";
const skillsArchiveExtractStage =
  "tar -xzf arashi-skill-package.tar.gz -C package-check";
const metaLocalStage = "pnpm contracts:check";
const metaCiStage = "pnpm contracts:check:ci";
function run(command: string, args: string[], cwd: string) {
  return spawnSync(command, args, {
    cwd,
    encoding: "utf8",
    env: { ...process.env, NO_COLOR: "1" },
  });
}
async function write(path: string, content: string) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, content);
}
async function metaFixture() {
  const root = await mkdtemp(join(tmpdir(), "arashi-meta-entrypoints-"));
  roots.push(root);
  await cp(join(metaRoot, "scripts"), join(root, "scripts"), {
    recursive: true,
  });
  await cp(join(metaRoot, "package.json"), join(root, "package.json"));
  await write(
    join(root, registryPath),
    `${JSON.stringify(registry, null, 2)}\n`,
  );
  for (const identity of registry) {
    await write(
      join(root, identity),
      `import { appendFileSync } from "node:fs";\nappendFileSync("executed.log", ${JSON.stringify(identity)} + " " + process.argv.slice(2).join(" ") + "\\n");\n`,
    );
  }
  return root;
}
async function executeMeta(root: string, mode: "local" | "ci") {
  return run(
    "pnpm",
    ["run", mode === "local" ? "contracts:check" : "contracts:check:ci"],
    root,
  );
}
async function executeMetaJson(root: string, mode: "local" | "ci") {
  return run(
    "pnpm",
    [
      "--silent",
      "run",
      mode === "local" ? "contracts:check" : "contracts:check:ci",
      "--json",
    ],
    root,
  );
}
async function executionLog(root: string) {
  try {
    return await readFile(join(root, "executed.log"), "utf8");
  } catch {
    return "";
  }
}
async function mutateRegistry(
  root: string,
  mutate: (entries: string[]) => Promise<void> | void,
) {
  const entries = JSON.parse(
    await readFile(join(root, registryPath), "utf8"),
  ) as string[];
  await mutate(entries);
  await writeFile(join(root, registryPath), `${JSON.stringify(entries)}\n`);
}
function executableCommands(source: string): string[] {
  return source
    .split(/\r?\n/)
    .map((line) => line.trim())
    .map((line) => line.replace(/^-\s+/, "").replace(/^run:\s*/, ""))
    .map((line) => line.replace(/^`([^`]+)`[.;]?$/, "$1"))
    .filter(Boolean);
}
function expectStagesOnceInOrder(source: string, stages: string[]) {
  const commands = executableCommands(source);
  const indexes = stages.map((stage) => {
    const matches = commands
      .map((command, index) => (command === stage ? index : -1))
      .filter((index) => index >= 0);
    expect(matches, `executable stage: ${stage}`).toHaveLength(1);
    return matches[0];
  });
  expect(indexes).toEqual([...indexes].sort((left, right) => left - right));
}
async function skillsFixture(failingMode: "source" | "package") {
  const source = join(metaRoot, "repos/arashi-skills");
  const root = await mkdtemp(join(tmpdir(), "arashi-skills-aggregate-"));
  roots.push(root);
  await cp(join(source, "scripts"), join(root, "scripts"), { recursive: true });
  await cp(join(source, "skills"), join(root, "skills"), { recursive: true });

  const identities = (await readdir(join(root, "scripts")))
    .filter((name) =>
      /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?-guidance-selftest\.mjs$/.test(name),
    )
    .map((name) => `scripts/${name}`)
    .sort((left, right) => Buffer.from(left).compare(Buffer.from(right)));
  await write(
    join(root, "scripts/guidance-checkers.json"),
    `${JSON.stringify(identities, null, 2)}\n`,
  );
  for (const identity of identities) {
    const isSentinel = identity === identities[0];
    await write(
      join(root, identity),
      `const packaged = process.argv.includes("--skill-root");\nconsole.log(${JSON.stringify(`sentinel:${identity}`)});\n${
        isSentinel
          ? `if (${JSON.stringify(failingMode)} === (packaged ? "package" : "source")) { console.error("sentinel semantic failure"); process.exit(23); }\n`
          : ""
      }`,
    );
  }
  return { root, sentinel: identities[0] };
}
afterEach(async () => {
  await Promise.all(
    roots.splice(0).map((root) => rm(root, { recursive: true, force: true })),
  );
});
export {
  cliCompletionCheckStage,
  cliCompletionGenerateStage,
  cliContractCheckStage,
  cliContractGenerateStage,
  cliGeneratedDiffStage,
  cliInstallStage,
  cliSchemaCheckStage,
  cliSchemaPublishStage,
  docsInstallStage,
  docsStage,
  executableCommands,
  executeMeta,
  executeMetaJson,
  executionLog,
  expectStagesOnceInOrder,
  metaCiStage,
  metaFixture,
  metaInstallStage,
  metaLocalStage,
  metaRoot,
  mutateRegistry,
  registry,
  registryPath,
  roots,
  run,
  skillsArchiveCreateStage,
  skillsArchiveDestinationStage,
  skillsArchiveExtractStage,
  skillsArchiveVerifyStage,
  skillsFixture,
  skillsPackageStage,
  skillsSourceStage,
  write,
};
