import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";

const commands = [
  "add",
  "clone",
  "completion",
  "create",
  "doctor",
  "exec",
  "handoff",
  "init",
  "install",
  "list",
  "move",
  "prune",
  "pull",
  "push",
  "remove",
  "setup",
  "shell",
  "status",
  "switch",
  "sync",
  "update",
];
const documentedOption = String.raw`(?:--[a-z][\w-]*(?:=[^\s\x60]+)?|-[A-Za-z])`;
const quotedLegacyExecutable = String.raw`(?<![\w./@-])(?:&\s+)?(?:"arashi"|'arashi')`;
const legacyInvocation = new RegExp(
  String.raw`(?:(?:\bcommand\s+)?(?<![./@-])\barashi|${quotedLegacyExecutable})\s+(?:--(?:help|version)\b|-[hV]\b|<command>(?=\s|\x60|$)|(?:${documentedOption}\s+)*(?:${commands.join("|")})\b)`,
  "g",
);
const compatibilityNote =
  "`arashi` executable remains supported for existing scripts and workflows";

function maskPackageRunnerSpecifiers(line: string): string {
  return line.replace(
    /\b(npx(?:\s+(?:--yes|-y))?|pnpm\s+dlx|npm\s+exec\s+--)(\s+)arashi(?=\s)/g,
    (_, runner: string, spacing: string) =>
      `${runner}${spacing}${" ".repeat("arashi".length)}`,
  );
}

export interface DocumentedCommandDiagnostic {
  severity: "error";
  category: "docs";
  code: "PREFERRED_COMMAND_SPELLING";
  source: string;
  message: string;
}

function logicalDocumentLines(content: string): Array<{
  line: string;
  lineNumber: number;
  inDatedManualAcceptanceOutcomes: boolean;
}> {
  const physicalLines = content.split(/\r?\n/);
  const logicalLines = [];
  let inDatedManualAcceptanceOutcomes = false;
  let activeFence: {
    marker: "`" | "~";
    length: number;
    powerShell: boolean;
  } | null = null;

  for (let index = 0; index < physicalLines.length; index += 1) {
    const lineNumber = index + 1;
    let line = physicalLines[index];
    if (/^#{1,6}\s+/.test(line)) {
      inDatedManualAcceptanceOutcomes =
        /^#{1,6}\s+Manual Acceptance Outcomes\s+\(\d{4}-\d{2}-\d{2}\)\s*$/.test(
          line,
        );
    }

    const fence = line.match(/^\s*(`{3,}|~{3,})\s*([A-Za-z0-9_-]*)\s*$/);
    if (
      fence &&
      activeFence !== null &&
      fence[1][0] === activeFence.marker &&
      fence[1].length >= activeFence.length &&
      fence[2] === ""
    ) {
      activeFence = null;
    } else if (fence && activeFence === null) {
      activeFence = {
        marker: fence[1][0] as "`" | "~",
        length: fence[1].length,
        powerShell: /^(?:powershell|pwsh)$/i.test(fence[2]),
      };
    }

    while (index + 1 < physicalLines.length) {
      const trailingBackticks = line.match(/(`+)[ \t]*$/);
      const powerShellContinuation =
        activeFence?.powerShell === true &&
        trailingBackticks !== null &&
        trailingBackticks[1].length % 2 === 1;
      const backslashContinuation = /\\[ \t]*$/.test(line);
      if (!powerShellContinuation && !backslashContinuation) break;

      line =
        line.replace(powerShellContinuation ? /`[ \t]*$/ : /\\[ \t]*$/, " ") +
        physicalLines[index + 1].trimStart();
      index += 1;
    }
    logicalLines.push({
      line,
      lineNumber,
      inDatedManualAcceptanceOutcomes,
    });
  }
  return logicalLines;
}

export function findPreferredArashiInvocations(
  content: string,
  source: string,
): DocumentedCommandDiagnostic[] {
  return logicalDocumentLines(content).flatMap(
    ({ line, lineNumber, inDatedManualAcceptanceOutcomes }) => {
      const searchableLine = maskPackageRunnerSpecifiers(line);
      if (/\blowerCombined\.includes\(/.test(searchableLine)) return [];
      legacyInvocation.lastIndex = 0;
      const hasPreferredInvocation = [
        ...searchableLine.matchAll(legacyInvocation),
      ].some((match) => {
        const start = match.index ?? 0;
        const prefix = searchableLine.slice(0, start);
        const suffix = searchableLine.slice(start + match[0].length);
        const clauseStart =
          Math.max(
            prefix.lastIndexOf(";"),
            prefix.lastIndexOf("."),
            prefix.lastIndexOf("!"),
            prefix.lastIndexOf("?"),
          ) + 1;
        const clausePrefix = prefix.slice(clauseStart);
        const recordedAcceptanceOutcome =
          inDatedManualAcceptanceOutcomes &&
          /^\s*-\s+\[[xX]\]\s+/.test(line) &&
          /\bcompleted\b/i.test(clausePrefix) &&
          /\barashi\b["']?\s+--version\b/i.test(match[0]) &&
          /^[\x60'"]*\s+returned\s+[\x60'"]*v?\d+(?:\.\d+){1,3}(?:[-+][0-9A-Za-z.-]+)?[\x60'"]*(?=[\s.,;!?]|$)/i.test(
            suffix,
          );
        const historicallyIntroduced =
          /\bhistorical(?:ly)?\b[^.!?;]*\b(?:used|ran|invoked|called)\s*(?:the\s+command\s+)?[\x60'"$ ]*$/i.test(
            prefix,
          ) ||
          (/\bhistorical(?:ly)?\b[^.!?;]*:\s*[\x60'"]*$/i.test(prefix) &&
            /^[\x60'"]*\s+was\s+(?:shown|used|invoked|called)\b/i.test(suffix));
        const compatibilityInvocation =
          prefix.includes(compatibilityNote) &&
          /^[\x60'"]*\s+(?:(?:is\s+still|remains)\s+valid\s+there)\b/i.test(
            suffix,
          );
        return (
          !recordedAcceptanceOutcome &&
          !historicallyIntroduced &&
          !compatibilityInvocation
        );
      });
      return hasPreferredInvocation
        ? [
            {
              severity: "error" as const,
              category: "docs" as const,
              code: "PREFERRED_COMMAND_SPELLING" as const,
              source,
              message: `line ${lineNumber}: preferred examples must use aw: ${line.trim()}`,
            },
          ]
        : [];
    },
  );
}

function walk(
  root: string,
  directory: string,
  extensions = new Set([".md", ".mdx", ".txt"]),
): string[] {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolute = join(directory, entry.name);
    if (entry.isDirectory()) return walk(root, absolute, extensions);
    const extension = entry.name.slice(entry.name.lastIndexOf("."));
    return extensions.has(extension) ? [relative(root, absolute)] : [];
  });
}

export function maintainedDocumentedCommandSources(root: string): string[] {
  return [
    "AGENTS.md",
    "README.md",
    "CONTRIBUTING.md",
    ".opencode/command/ship.md",
    ".pi/prompts/ship.md",
    ...walk(root, join(root, "docs"), new Set([".md", ".mdx"])),
    ...walk(root, join(root, ".agents/skills/arashi"), new Set([".md"])),
    "repos/arashi/README.md",
    "repos/arashi/CONTRIBUTING.md",
    ...walk(root, join(root, "repos/arashi/docs"), new Set([".md"])),
    ...walk(
      root,
      join(root, "repos/arashi-docs/docs"),
      new Set([".md", ".mdx"]),
    ),
    ...walk(
      root,
      join(root, "repos/arashi-docs/public"),
      new Set([".md", ".txt"]),
    ),
    ...walk(
      root,
      join(root, "repos/arashi-skills/skills/arashi"),
      new Set([".md"]),
    ),
    "repos/arashi-presentation/README.md",
    "repos/arashi-presentation/slides.md",
    "repos/arashi-vscode/README.md",
    "repos/arashi-vscode/src/commands/handlers.ts",
    "repos/arashi-vscode/src/worktrees/service.ts",
  ].filter(
    (source, index, sources) =>
      existsSync(join(root, source)) && sources.indexOf(source) === index,
  );
}

export function checkDocumentedCommandContracts(root: string) {
  const diagnostics = maintainedDocumentedCommandSources(root).flatMap(
    (source) =>
      findPreferredArashiInvocations(
        readFileSync(join(root, source), "utf8"),
        source,
      ),
  );
  return { ok: diagnostics.length === 0, diagnostics };
}

export function formatDocumentedCommandContracts(
  result: ReturnType<typeof checkDocumentedCommandContracts>,
) {
  if (result.ok)
    return "Primary documented command contract passed across all configured maintained surfaces.";
  return [
    "Primary documented command contract failed:",
    ...result.diagnostics.map((item) => `- ${item.source}: ${item.message}`),
  ].join("\n");
}
