import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

const repositoryRoot = join(import.meta.dirname, "..");

function trackedWorkflowPaths() {
  const trackedPaths = execFileSync("git", ["ls-files"], {
    cwd: repositoryRoot,
    encoding: "utf8",
  })
    .trim()
    .split("\n")
    .filter(Boolean);

  return {
    hasLegacySpecs: trackedPaths.some((path) => path.startsWith("specs/")),
    hasSpecifyToolkit: trackedPaths.some((path) =>
      path.startsWith(".specify/"),
    ),
    openSpecConfig: trackedPaths.includes("openspec/config.yaml"),
    openSpecSpecs: trackedPaths.some((path) =>
      path.startsWith("openspec/specs/"),
    ),
    openSpecSkills: trackedPaths.filter((path) =>
      /^\.(?:opencode|pi)\/skills\/openspec-[^/]+\/SKILL\.md$/.test(path),
    ),
    opsxCommands: trackedPaths.filter((path) =>
      path.startsWith(".opencode/command/opsx-"),
    ),
    specKitCommands: trackedPaths.filter((path) =>
      path.startsWith(".opencode/command/speckit."),
    ),
  };
}

describe("specification workflow structure", () => {
  test("keeps OpenSpec as the only active tracked specification workflow", () => {
    expect(trackedWorkflowPaths()).toEqual({
      hasLegacySpecs: false,
      hasSpecifyToolkit: false,
      openSpecConfig: true,
      openSpecSpecs: true,
      openSpecSkills: expect.arrayContaining([
        ".opencode/skills/openspec-apply-change/SKILL.md",
        ".opencode/skills/openspec-archive-change/SKILL.md",
        ".opencode/skills/openspec-explore/SKILL.md",
        ".opencode/skills/openspec-propose/SKILL.md",
        ".pi/skills/openspec-apply-change/SKILL.md",
        ".pi/skills/openspec-archive-change/SKILL.md",
        ".pi/skills/openspec-explore/SKILL.md",
        ".pi/skills/openspec-propose/SKILL.md",
      ]),
      opsxCommands: expect.arrayContaining([
        ".opencode/command/opsx-apply.md",
        ".opencode/command/opsx-archive.md",
        ".opencode/command/opsx-explore.md",
        ".opencode/command/opsx-propose.md",
      ]),
      specKitCommands: [],
    });
  });

  test("documents the OpenSpec workflow across supported agent interfaces", () => {
    const contributing = readFileSync(
      join(repositoryRoot, "CONTRIBUTING.md"),
      "utf8",
    );

    expect(contributing).toContain("Pi");
    expect(contributing).toContain("OpenCode");
    expect(contributing).toContain("Hermes");
    expect(contributing).not.toContain("Open OpenCode in the parent worktree");
  });

  test("selects proportional specification tracks before implementation", () => {
    const guidance = [
      readFileSync(join(repositoryRoot, "README.md"), "utf8"),
      readFileSync(
        join(repositoryRoot, "docs/implementation-workflow.md"),
        "utf8",
      ),
      readFileSync(join(repositoryRoot, "CONTRIBUTING.md"), "utf8"),
    ].join("\n");

    expect(guidance).toContain("Direct implementation");
    expect(guidance).toContain("Lightweight OpenSpec");
    expect(guidance).toContain("Full OpenSpec");
    expect(guidance).toContain("durable product contract");
    expect(guidance).toContain("Cross-repository scope alone");
  });

  test("provides a proposal-and-specs-only lightweight schema", () => {
    const schema = readFileSync(
      join(repositoryRoot, "openspec/schemas/lightweight/schema.yaml"),
      "utf8",
    );

    expect(schema).toMatch(/id: proposal[\s\S]*instruction:/);
    expect(schema).toMatch(/id: specs[\s\S]*instruction:/);
    expect(schema).not.toMatch(/id: design/);
    expect(schema).not.toMatch(/id: tasks/);
  });

  test("passes the selected schema through every proposal interface", () => {
    const proposalInterfaces = [
      ".opencode/command/opsx-propose.md",
      ".opencode/skills/openspec-propose/SKILL.md",
      ".pi/prompts/opsx-propose.md",
      ".pi/skills/openspec-propose/SKILL.md",
    ];

    for (const path of proposalInterfaces) {
      expect(readFileSync(join(repositoryRoot, path), "utf8"), path).toContain(
        'openspec new change "<name>" --schema "<schema>"',
      );
    }
  });

  test("supports applying schemas without a task artifact", () => {
    const applyInterfaces = [
      ".opencode/command/opsx-apply.md",
      ".opencode/skills/openspec-apply-change/SKILL.md",
      ".pi/prompts/opsx-apply.md",
      ".pi/skills/openspec-apply-change/SKILL.md",
    ];

    for (const path of applyInterfaces) {
      expect(readFileSync(join(repositoryRoot, path), "utf8"), path).toContain(
        "task list is empty",
      );
    }
  });
});
