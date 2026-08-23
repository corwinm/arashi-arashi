import { describe, expect, test } from "vitest";
import {
  checkDocumentedCommandContracts,
  findPreferredArashiInvocations,
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

  test("rejects preferred arashi examples with stable source diagnostics", () => {
    expect(
      findPreferredArashiInvocations(
        "Run `arashi status`.\n$ arashi create topic\narashi -h\narashi -V\nPreserve Git history, then run arashi status",
        "negative.md",
      ),
    ).toEqual([
      expect.objectContaining({
        code: "PREFERRED_COMMAND_SPELLING",
        source: "negative.md",
        message: expect.stringContaining("line 1"),
      }),
      expect.objectContaining({
        code: "PREFERRED_COMMAND_SPELLING",
        source: "negative.md",
        message: expect.stringContaining("line 2"),
      }),
      expect.objectContaining({ message: expect.stringContaining("line 3") }),
      expect.objectContaining({ message: expect.stringContaining("line 4") }),
      expect.objectContaining({ message: expect.stringContaining("line 5") }),
    ]);
  });

  test("folds only unescaped PowerShell backtick continuations", () => {
    const diagnostics = findPreferredArashiInvocations(
      [
        "```powershell",
        "arashi --json `",
        "status",
        "```",
        "```pwsh",
        "arashi --json `",
        "status",
        "```",
        "```bash",
        "arashi --json `",
        "status",
        "```",
        "```powershell",
        "arashi --json ``",
        "status",
        "```",
      ].join("\n"),
      "powershell.md",
    );

    expect(diagnostics).toEqual([
      expect.objectContaining({ message: expect.stringContaining("line 2") }),
      expect.objectContaining({ message: expect.stringContaining("line 6") }),
    ]);
  });

  test("rejects commands preceded by documented option syntax", () => {
    expect(
      findPreferredArashiInvocations(
        "arashi --json status\narashi -j list\narashi --verbose status",
        "options.md",
      ),
    ).toHaveLength(3);
  });

  test("recognizes configure as part of the documented command vocabulary", () => {
    expect(
      findPreferredArashiInvocations(
        "Inspect settings with `arashi configure --json`.",
        "configure.md",
      ),
    ).toEqual([
      expect.objectContaining({
        code: "PREFERRED_COMMAND_SPELLING",
        source: "configure.md",
      }),
    ]);
  });

  test("rejects quoted executable invocations without matching quoted identifiers", () => {
    expect(
      findPreferredArashiInvocations(
        [
          'Run `"arashi" status`.',
          "Run `'arashi' status`.",
          'Run `& "arashi" status` from PowerShell.',
        ].join("\n"),
        "quoted-executables.md",
      ),
    ).toHaveLength(3);

    expect(
      findPreferredArashiInvocations(
        [
          'The package identifier is "arashi".',
          'Install the package with `npm install -g "arashi"`.',
          "Use the paths \"/opt/arashi\" and './vendor/arashi'.",
          'See "https://github.com/corwinm/arashi".',
        ].join("\n"),
        "quoted-identifiers.md",
      ),
    ).toEqual([]);
  });

  test("masks only supported package-runner specifiers", () => {
    expect(
      findPreferredArashiInvocations(
        [
          "Try npx arashi status.",
          "Try npx --yes arashi status.",
          "Try npx -y arashi status.",
          "Try pnpm dlx arashi status.",
          "Try npm exec -- arashi status.",
        ].join("\n"),
        "package-runners.md",
      ),
    ).toEqual([]);

    expect(
      findPreferredArashiInvocations(
        [
          "npx --yes arashi status; arashi status",
          "npx -y arashi status; `arashi status`",
          "npx --quiet arashi status",
        ].join("\n"),
        "package-runner-controls.md",
      ),
    ).toHaveLength(3);
  });

  test("limits compatibility exemptions to the compatibility clause", () => {
    expect(
      findPreferredArashiInvocations(
        "The `arashi` executable remains supported for existing scripts and workflows; `arashi status` remains valid there. For new work, run `arashi status`.",
        "compatibility.md",
      ),
    ).toEqual([
      expect.objectContaining({
        source: "compatibility.md",
        message: expect.stringContaining("line 1"),
      }),
    ]);
  });

  test("accepts historical framing without exempting unrelated history prose", () => {
    expect(
      findPreferredArashiInvocations(
        "Historical evidence: `arashi status` was shown in the launch notes.",
        "historical.md",
      ),
    ).toEqual([]);
    expect(
      findPreferredArashiInvocations(
        "Repository history was reviewed; we used `arashi status` for the next check.",
        "current.md",
      ),
    ).toHaveLength(1);
  });

  test("accepts only completed version results in dated manual acceptance outcomes", () => {
    const recordedOutcome = [
      "## Manual Acceptance Outcomes (2026-02-11)",
      "- [x] npm install flow: `npm install -g arashi --prefix <temp-dir>` completed and `arashi --version` returned `1.4.0`.",
    ].join("\n");
    expect(
      findPreferredArashiInvocations(recordedOutcome, "recorded-outcome.md"),
    ).toEqual([]);

    const controls = [
      "## Manual Acceptance Outcomes (2026-02-11)\n- [ ] Run `arashi --version` and record the returned version after the test is completed.",
      "## Manual Acceptance Outcomes (2026-02-11)\n- [x] Run `arashi --version` and record the returned version.",
      "## Release record\n- [x] 2026-02-11: `arashi --version` returned `1.4.0`.",
      "## Manual Acceptance Outcomes (2026-02-11)\n- [x] Legacy smoke test: `arashi status` completed successfully.",
    ];
    for (const [index, fixture] of controls.entries()) {
      expect(
        findPreferredArashiInvocations(
          fixture,
          `historical-control-${index + 1}.md`,
        ),
      ).toHaveLength(1);
    }
  });

  test("accepts identifiers, history, compatibility, and aw examples", () => {
    const valid = [
      "npm install -g arashi",
      "https://github.com/corwinm/arashi",
      "`.arashi/config.json` and `ARASHI_CONFIG_PATH`",
      "`arashi-windows-x64.exe`, `arashi.ps1`, and `arashi.binaryPath`",
      "pnpm --dir repos/arashi completion:check",
      "Historical guidance used `arashi status`.",
      "The `arashi` executable remains supported for existing scripts and workflows; `arashi status` remains valid there.",
      "Run `aw status`.",
    ].join("\n");
    expect(findPreferredArashiInvocations(valid, "positive.md")).toEqual([]);
  });
});
