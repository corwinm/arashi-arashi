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
const legacyInvocation = new RegExp(
  String.raw`(?:\bcommand\s+)?(?<![./@-])\barashi\s+(?:--(?:help|version)\b|-[hV]\b|<command>(?=\s|\x60|$)|(?:${documentedOption}\s+)*(?:${commands.join("|")})\b)`,
  "g",
);
const compatibilityNote =
  "`arashi` executable remains supported for existing scripts and workflows";

export interface DocumentedCommandDiagnostic {
  severity: "error";
  category: "docs";
  code: "PREFERRED_COMMAND_SPELLING";
  source: string;
  message: string;
}

export function findPreferredArashiInvocations(
  content: string,
  source: string,
): DocumentedCommandDiagnostic[] {
  return content.split(/\r?\n/).flatMap((line, index) => {
    if (/\blowerCombined\.includes\(/.test(line)) return [];
    legacyInvocation.lastIndex = 0;
    const hasPreferredInvocation = [...line.matchAll(legacyInvocation)].some(
      (match) => {
        const start = match.index ?? 0;
        const prefix = line.slice(0, start);
        const suffix = line.slice(start + match[0].length);
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
        return !historicallyIntroduced && !compatibilityInvocation;
      },
    );
    return hasPreferredInvocation
      ? [
          {
            severity: "error" as const,
            category: "docs" as const,
            code: "PREFERRED_COMMAND_SPELLING" as const,
            source,
            message: `line ${index + 1}: preferred examples must use aw: ${line.trim()}`,
          },
        ]
      : [];
  });
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
