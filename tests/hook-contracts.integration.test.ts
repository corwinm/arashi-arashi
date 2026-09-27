import { spawnSync } from "node:child_process";
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import { checkHookContracts } from "../scripts/hook-contracts.ts";
import {
  docsOwningCheckerFixture,
  repositoryRoot,
  roots,
  runNodeChecker,
} from "./hook-contracts.fixtures";
describe("cross-repository lifecycle-hook contract", () => {
  test("accepts equivalent repository-remove semantics on the real maintained hook surfaces", async () => {
    const diagnostics = (
      await checkHookContracts(repositoryRoot)
    ).diagnostics.filter(({ code }) =>
      code.startsWith("HOOK_REPOSITORY_REMOVE_ALIAS_"),
    );
    expect(diagnostics).toEqual([]);
  });
  test("the real packaged-skill checker rejects mixed-polarity alias precedence", async () => {
    const root = await mkdtemp(join(tmpdir(), "arashi-skill-package-owner-"));
    roots.push(root);
    const archive = join(root, "arashi-skill-package.tar.gz");
    const packageRoot = join(root, "package-check");
    await mkdir(packageRoot);

    const created = spawnSync(
      process.execPath,
      [
        "repos/arashi-skills/scripts/create-release-archive.mjs",
        "--root",
        "repos/arashi-skills",
        "--output",
        archive,
      ],
      { cwd: repositoryRoot, encoding: "utf8" },
    );
    expect(created.status, `${created.stdout}${created.stderr}`).toBe(0);
    const extracted = spawnSync("tar", ["-xzf", archive, "-C", packageRoot], {
      encoding: "utf8",
    });
    expect(extracted.status, `${extracted.stdout}${extracted.stderr}`).toBe(0);

    const hooks = join(packageRoot, "skills/arashi/references/hooks.md");
    await writeFile(
      hooks,
      `${await readFile(hooks, "utf8")}\nRepository remove does not assign precedence among aliases, but it uses inline-first/file-fallback precedence.\n`,
    );
    const checked = spawnSync(
      process.execPath,
      [
        "repos/arashi-skills/scripts/validate-guidance.mjs",
        "--skill-root",
        join(packageRoot, "skills/arashi"),
      ],
      {
        cwd: repositoryRoot,
        encoding: "utf8",
        env: {
          ...process.env,
          ARASHI_REPOSITORY_REMOVE_GUIDANCE_SKIP_FIXTURES: "1",
        },
      },
    );
    expect(checked.status).toBe(1);
    expect(`${checked.stdout}${checked.stderr}`).toMatch(/precedence/);
  });
  test("the real CLI owner independently rejects generated inline lifecycle contract drift", async () => {
    const root = await mkdtemp(join(tmpdir(), "arashi-inline-hook-owner-"));
    roots.push(root);
    await mkdir(join(root, "scripts/contracts"), { recursive: true });
    await mkdir(join(root, "src/lib"), { recursive: true });
    await mkdir(join(root, "contracts"), { recursive: true });
    await cp(
      join(
        repositoryRoot,
        "repos/arashi/scripts/contracts/inline-lifecycle-hooks.ts",
      ),
      join(root, "scripts/contracts/inline-lifecycle-hooks.ts"),
    );
    await writeFile(
      join(root, "src/lib/config.ts"),
      'export const CURRENT_CONFIG_VERSION = "1.0.0" as const;\n',
    );
    expect(
      runNodeChecker(root, "scripts/contracts/inline-lifecycle-hooks.ts")
        .status,
    ).toBe(0);
    expect(
      runNodeChecker(root, "scripts/contracts/inline-lifecycle-hooks.ts", [
        "--check",
      ]).status,
    ).toBe(0);
    const generated = await readFile(
      join(root, "contracts/inline-lifecycle-hooks.json"),
      "utf8",
    );

    await writeFile(
      join(root, "contracts/inline-lifecycle-hooks.json"),
      generated.replace(
        '"fileOnlyCompatible": true',
        '"fileOnlyCompatible": false',
      ),
    );
    const drift = runNodeChecker(
      root,
      "scripts/contracts/inline-lifecycle-hooks.ts",
      ["--check"],
    );
    expect(drift.status).toBe(1);
    expect(drift.stderr).toContain("inline-lifecycle-hooks.json is stale");
  });
  test.each([
    "public/reference/hooks.md",
    "public/commands/remove.md",
    "public/reference/configuration.md",
    "public/commands/add.md",
    "public/commands/configure.md",
    "public/commands/delete.md",
  ])(
    "the real docs owner independently requires generated Markdown route %s",
    async (route) => {
      const root = await docsOwningCheckerFixture();
      expect(
        runNodeChecker(root, "scripts/check-repository-remove-hook-docs.ts")
          .status,
      ).toBe(0);
      await rm(join(root, route));
      const drift = runNodeChecker(
        root,
        "scripts/check-repository-remove-hook-docs.ts",
      );
      expect(drift.status).toBe(1);
      expect(drift.stderr).toContain(`${route} is missing`);
    },
  );
  test("the real docs owner independently requires the curated llms.txt export", async () => {
    const root = await docsOwningCheckerFixture();
    expect(
      runNodeChecker(root, "scripts/check-repository-remove-hook-docs.ts")
        .status,
    ).toBe(0);
    await rm(join(root, "public/llms.txt"));
    const drift = runNodeChecker(
      root,
      "scripts/check-repository-remove-hook-docs.ts",
    );
    expect(drift.status).toBe(1);
    expect(drift.stderr).toContain("public/llms.txt is missing");
  });
});
