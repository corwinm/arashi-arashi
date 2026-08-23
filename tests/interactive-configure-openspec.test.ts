import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

const changeRoot = join(
  process.cwd(),
  "openspec/changes/interactive-configure-workspace",
);

const readChange = (relativePath: string) =>
  readFile(join(changeRoot, relativePath), "utf8");

describe("interactive configure OpenSpec coordination", () => {
  test("replaces the stale generated-export boundary while keeping add scoped to onboarding", async () => {
    const delta = await readChange("specs/docs-agent-readable-exports/spec.md");

    expect(delta).toContain("## MODIFIED Requirements");
    expect(delta).toContain(
      "### Requirement: Agent-readable exports include optional add onboarding guidance",
    );
    expect(delta).toMatch(/existing-entry editing[^\n]+`aw configure`/i);
    expect(delta).toMatch(/`aw add`[^\n]+new repository/i);
  });

  test("replaces the stale coordinated future-scope boundary with add-versus-configure ownership", async () => {
    const delta = await readChange(
      "specs/cross-repo-command-contracts/spec.md",
    );

    expect(delta).toContain("## MODIFIED Requirements");
    expect(delta).toContain(
      "### Requirement: Coordinated contracts enforce interactive add onboarding semantics",
    );
    expect(delta).toMatch(/existing entr(?:y|ies)[^\n]+`aw configure`/i);
    expect(delta).toMatch(/`aw add`[^\n]+new repository/i);
  });

  test("records VS Code as a coordinated child repository and PR delivery task", async () => {
    const [proposal, tasks] = await Promise.all([
      readChange("proposal.md"),
      readChange("tasks.md"),
    ]);

    expect(proposal).toContain("**VS Code (`repos/arashi-vscode`)**");
    expect(tasks).toMatch(/arashi-vscode[^\n]+PR #36/i);
  });
});
