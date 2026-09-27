import { describe, expect, test } from "vitest";
import {
  checkDocumentedCommandContracts,
  maintainedDocumentedCommandSources,
} from "../scripts/documented-command-contracts";
describe("coordinated primary documented command contract", () => {
  test("covers every configured repository and passes maintained guidance", () => {
    const sources = maintainedDocumentedCommandSources(process.cwd());
    for (const repository of [
      "arashi",
      "arashi-docs",
      "arashi-presentation",
      "arashi-skills",
      "arashi-vscode",
    ]) {
      expect(
        sources.some((source) => source.startsWith(`repos/${repository}/`)),
        repository,
      ).toBe(true);
    }
    expect(sources).toContain("repos/arashi-vscode/src/commands/handlers.ts");
    expect(sources).toContain("repos/arashi-vscode/src/worktrees/service.ts");
    expect(checkDocumentedCommandContracts(process.cwd())).toEqual({
      ok: true,
      diagnostics: [],
    });
  });
});
