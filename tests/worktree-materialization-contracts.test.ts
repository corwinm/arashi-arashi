import { spawnSync } from "node:child_process";
import { afterEach, describe, expect, test } from "vitest";
import {
  mkdtemp,
  mkdir,
  readFile,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";

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

describe("worktree materialization coordinated contract", () => {
  test("is registered in the fail-closed aggregate", async () => {
    const registry = JSON.parse(
      await readFile(join(metaRoot, "scripts/contract-checks.json"), "utf8"),
    ) as string[];
    expect(registry).toContain(
      "scripts/check-worktree-materialization-contracts.ts",
    );
  });

  test("accepts aligned owning surfaces and the extracted canonical skill package", async () => {
    const root = await fixture();
    const result = run(root);
    expect(result.status, `${result.stdout}${result.stderr}`).toBe(0);
    expect(JSON.parse(result.stdout)).toEqual({ diagnostics: [], ok: true });
    await expect(
      readFile(join(root, "repos/arashi-skills/arashi-skills.tar.gz")),
    ).rejects.toThrow();
  });

  test("rejects removal of the sole generated schema field producer", async () => {
    const root = await fixture();
    const changed = structuredClone(schema);
    Reflect.deleteProperty(changed.definitions.RepoConfig.properties, "copy");
    await write(
      join(root, "repos/arashi/schema/config.schema.json"),
      `${JSON.stringify(changed, null, 2)}\n`,
    );
    const result = run(root);
    expect(result.status).not.toBe(0);
    expect(diagnostics(result).map(({ code }) => code)).toContain(
      "MATERIALIZATION_CONFIG_SCHEMA_MISMATCH",
    );
  });

  test("rejects contract fields becoming required", async () => {
    const root = await fixture();
    const changed = structuredClone(schema);
    Object.assign(changed.definitions.RepoConfig, {
      required: ["path", "copy", "symlink"],
    });
    await write(
      join(root, "repos/arashi/schema/config.schema.json"),
      `${JSON.stringify(changed, null, 2)}\n`,
    );
    const result = run(root);
    expect(result.status).not.toBe(0);
    expect(diagnostics(result).map(({ code }) => code)).toContain(
      "MATERIALIZATION_CONFIG_SCHEMA_MISMATCH",
    );
  });

  test.each(Object.entries(groups))(
    "rejects coordinated drift in the %s owning group",
    async (name, group) => {
      const root = await fixture();
      await write(
        join(root, group.primary),
        guidance.replaceAll("symlink", "hardlink"),
      );
      const result = run(root);
      expect(result.status).not.toBe(0);
      const found = diagnostics(result);
      expect(
        found.some(
          ({ category, code }) =>
            code === "MATERIALIZATION_GUIDANCE_MISMATCH" && category === name,
        ),
      ).toBe(true);
    },
  );

  test.each(Object.entries(groups))(
    "rejects additive contradiction in a secondary %s surface",
    async (name, group) => {
      const root = await fixture();
      const secondary =
        group.sources.find((source) => source !== group.primary) ??
        group.primary;
      await write(
        join(root, secondary),
        "Standalone mode is supported and missing sources abort creation.\n",
      );
      const result = run(root);
      expect(result.status).not.toBe(0);
      expect(diagnostics(result)).toContainEqual(
        expect.objectContaining({
          category: name,
          code: "MATERIALIZATION_GUIDANCE_MISMATCH",
        }),
      );
    },
  );

  test.each([
    "Materialization does not read sources from the caller checkout.",
    "Symlink never falls back to copy, hard-link, or junction.",
    "A symlink does not provide an independently mutable .env.",
  ])("accepts valid negated guidance: %s", async (claim) => {
    const root = await fixture();
    const secondary =
      groups.cli.sources.find((source) => source !== groups.cli.primary) ??
      groups.cli.primary;
    await write(join(root, secondary), `${claim}\n`);
    const result = run(root);
    expect(result.status, `${result.stdout}${result.stderr}`).toBe(0);
  });

  test.each([
    "Copy runs after symlink.",
    "Standalone materialization is supported.",
    "Missing sources cause creation to abort.",
  ])("rejects semantic contradiction: %s", async (claim) => {
    const root = await fixture();
    const secondary =
      groups.cli.sources.find((source) => source !== groups.cli.primary) ??
      groups.cli.primary;
    await write(join(root, secondary), `${claim}\n`);
    const result = run(root);
    expect(result.status).not.toBe(0);
    expect(diagnostics(result)).toContainEqual(
      expect.objectContaining({
        category: "cli",
        code: "MATERIALIZATION_GUIDANCE_MISMATCH",
      }),
    );
  });

  test("fails closed when canonical packaged guidance is a symlink", async () => {
    const root = await fixture();
    const commands = join(
      root,
      "repos/arashi-skills/skills/arashi/references/commands/create.md",
    );
    const outside = join(root, "outside-guidance.md");
    await write(outside, guidance);
    await rm(commands);
    await symlink(outside, commands);
    const result = run(root);
    expect(result.status).not.toBe(0);
    expect(diagnostics(result)).toContainEqual(
      expect.objectContaining({
        category: "skills",
        code: "MATERIALIZATION_GUIDANCE_MISMATCH",
      }),
    );
  });

  test("fails closed when the canonical package producer is unavailable", async () => {
    const root = await fixture();
    await rm(
      join(root, "repos/arashi-skills/scripts/create-release-archive.mjs"),
    );
    const result = run(root);
    expect(result.status).not.toBe(0);
    expect(diagnostics(result)).toContainEqual(
      expect.objectContaining({
        category: "skills",
        code: "MATERIALIZATION_GUIDANCE_MISMATCH",
        source: "repos/arashi-skills/package/skills/arashi/references",
      }),
    );
  });
});
