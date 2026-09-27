import { spawnSync } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { afterEach } from "vitest";
const metaRoot = process.cwd();
const checker = join(
  metaRoot,
  "scripts/check-worktree-materialization-contracts.ts",
);
const roots: string[] = [];
const schema = {
  definitions: {
    RepoConfig: {
      additionalProperties: false,
      properties: {
        copy: { items: { type: "string" }, type: "array" },
        path: { type: "string" },
        symlink: { items: { type: "string" }, type: "array" },
      },
      required: ["path"],
      type: "object",
    },
  },
};
const guidance = `
Configured workspaces only accept direct repos.<name>.copy and
repos.<name>.symlink arrays. Each entry uses the same relative path from the
Git-primary checkout to the new worktree. Create runs repository pre-create,
copy, symlink, and repository post-create; --no-hooks does not disable
materialization. Missing sources are visible optional skips. Existing destinations
fail because Arashi never overwrites them. Every destination must remain inside the new worktree. A rejected native symlink has no copy,
hard-link, or junction fallback. Use copy for independent isolated local
configuration. Use symlink only for intentionally shared state. Prefer
package-manager content-addressed stores and per-worktree installs rather than
shared node_modules. Use lifecycle hooks for globs, remapping, external sources,
and interpolation. Standalone mode is not supported. Dry-run previews the plan in declaration order. Doctor non-mutating diagnostics inspect materialization without repair.
`;
const groups = {
  cli: {
    primary: "repos/arashi/docs/configuration.md",
    sources: ["repos/arashi/docs/configuration.md", "repos/arashi/README.md"],
  },
  docs: {
    primary: "repos/arashi-docs/docs/reference/configuration.md",
    sources: [
      "repos/arashi-docs/docs/reference/configuration.md",
      "repos/arashi-docs/docs/commands/create.md",
    ],
  },
  generated: {
    primary: "repos/arashi-docs/public/llms-full.txt",
    sources: [
      "repos/arashi-docs/public/reference/configuration.md",
      "repos/arashi-docs/public/commands/create.md",
      "repos/arashi-docs/public/llms.txt",
      "repos/arashi-docs/public/llms-full.txt",
    ],
  },
  skills: {
    primary: "repos/arashi-skills/skills/arashi/references/commands/create.md",
    sources: [
      "repos/arashi-skills/skills/arashi/references/commands/create.md",
      "repos/arashi-skills/skills/arashi/references/workflows.md",
      "repos/arashi-skills/skills/arashi/references/hooks.md",
    ],
  },
} as const;
async function write(path: string, content: string) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, content);
}
async function fixture() {
  const root = await mkdtemp(
    join(tmpdir(), "arashi-materialization-contract-"),
  );
  roots.push(root);
  await write(
    join(root, "repos/arashi/schema/config.schema.json"),
    `${JSON.stringify(schema, null, 2)}\n`,
  );
  for (const group of Object.values(groups)) {
    for (const source of group.sources) {
      await write(
        join(root, source),
        source === group.primary
          ? guidance
          : "See the owning materialization reference.\n",
      );
    }
  }

  const skillsRoot = join(root, "repos/arashi-skills");
  await write(join(skillsRoot, "README.md"), "fixture\n");
  await write(join(skillsRoot, "LICENSE"), "fixture\n");
  await write(join(skillsRoot, "security/policy.md"), "fixture\n");
  await write(
    join(skillsRoot, "scripts/create-release-archive.mjs"),
    await readFile(
      join(metaRoot, "repos/arashi-skills/scripts/create-release-archive.mjs"),
      "utf8",
    ),
  );
  return root;
}
function run(root: string) {
  return spawnSync(
    process.execPath,
    ["--experimental-strip-types", checker, "--json"],
    {
      cwd: root,
      encoding: "utf8",
      env: { ...process.env, NO_COLOR: "1" },
    },
  );
}
function diagnostics(result: ReturnType<typeof run>) {
  try {
    return (
      JSON.parse(result.stdout) as {
        diagnostics: { category: string; code: string; source: string }[];
      }
    ).diagnostics;
  } catch {
    return [];
  }
}
afterEach(async () => {
  await Promise.all(
    roots.splice(0).map((root) => rm(root, { force: true, recursive: true })),
  );
});
export {
  checker,
  diagnostics,
  fixture,
  groups,
  guidance,
  metaRoot,
  roots,
  run,
  schema,
  write,
};
