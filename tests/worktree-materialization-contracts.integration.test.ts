import { readFile, rm, symlink } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import {
  diagnostics,
  fixture,
  groups,
  guidance,
  run,
  schema,
  write,
} from "./worktree-materialization-contracts.fixtures";
describe("worktree materialization coordinated contract", () => {
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
