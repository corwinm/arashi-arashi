import { readFile } from "node:fs/promises";

import { describe, expect, test } from "vitest";

const workflowPath = ".github/workflows/cross-repo-command-contracts.yml";
const sha = {
  workflow: "a".repeat(40),
  trigger: "b".repeat(40),
  arashi: "c".repeat(40),
  docs: "d".repeat(40),
  skills: "e".repeat(40),
  vscode: "f".repeat(40),
  presentation: "1".repeat(40),
};

const revisions = [
  {
    logicalRepository: "arashi-arashi",
    sourceRepository: "corwinm/arashi-arashi",
    sha: sha.workflow,
  },
  {
    logicalRepository: "arashi",
    sourceRepository: "contributor/arashi",
    sha: sha.trigger,
  },
  {
    logicalRepository: "arashi-docs",
    sourceRepository: "corwinm/arashi-docs",
    sha: sha.docs,
  },
  {
    logicalRepository: "arashi-skills",
    sourceRepository: "corwinm/arashi-skills",
    sha: sha.skills,
  },
  {
    logicalRepository: "arashi-vscode",
    sourceRepository: "corwinm/arashi-vscode",
    sha: sha.vscode,
  },
  {
    logicalRepository: "arashi-presentation",
    sourceRepository: "corwinm/arashi-presentation",
    sha: sha.presentation,
  },
];

function extractScript(workflow: string, stepName: string): string {
  const step = workflow.indexOf(`- name: ${stepName}`);
  const marker = workflow.indexOf("          script: |\n", step);
  if (step < 0 || marker < 0) throw new Error(`${stepName} script not found`);
  const lines = workflow
    .slice(marker + "          script: |\n".length)
    .split("\n");
  const script: string[] = [];
  for (const line of lines) {
    if (line && !line.startsWith("            ")) break;
    script.push(line.startsWith("            ") ? line.slice(12) : line);
  }
  return script.join("\n");
}

type RepositoryData = {
  full_name: string;
  fork: boolean;
  source?: { full_name: string };
  default_branch?: string;
};

type GithubMockOptions = {
  sourceFork?: boolean;
  sourceForkRoot?: string;
  commitSha?: string;
};

function githubMock(
  expectedRepository: string,
  options: GithubMockOptions = {},
) {
  const branchShas = new Map([
    ["arashi", sha.arashi],
    ["arashi-docs", sha.docs],
    ["arashi-skills", sha.skills],
    ["arashi-vscode", sha.vscode],
    ["arashi-presentation", sha.presentation],
  ]);
  return {
    rest: {
      repos: {
        get: async ({ owner, repo }: { owner: string; repo: string }) => {
          const fullName = `${owner}/${repo}`;
          const isTriggerSource = fullName === "contributor/arashi";
          const data: RepositoryData = {
            full_name: fullName,
            fork: isTriggerSource ? (options.sourceFork ?? true) : false,
            default_branch: "main",
          };
          if (data.fork) {
            data.source = {
              full_name: options.sourceForkRoot ?? expectedRepository,
            };
          }
          return { data };
        },
        getCommit: async ({ ref }: { ref: string }) => ({
          data: { sha: options.commitSha ?? ref },
        }),
        getBranch: async ({ repo }: { repo: string }) => ({
          data: { commit: { sha: branchShas.get(repo) } },
        }),
      },
    },
  };
}

type ResolverOptions = {
  changedRepository?: string;
  changedSourceRepository?: string;
  changedSha?: string;
  eventSourceRepository?: string;
  eventSha?: string;
  eventName?: string;
  callerRepository?: string;
  workflowRepository?: string;
  workflowSha?: string;
  githubMock?: GithubMockOptions;
};

async function runResolver(options: ResolverOptions = {}) {
  const workflow = await readFile(workflowPath, "utf8");
  const script = extractScript(workflow, "Resolve immutable revisions");
  const changedRepository = options.changedRepository ?? "arashi";
  const changedSourceRepository =
    options.changedSourceRepository ?? "contributor/arashi";
  const changedSha = options.changedSha ?? sha.trigger;
  const eventSourceRepository =
    options.eventSourceRepository ?? "contributor/arashi";
  const eventSha = options.eventSha ?? sha.trigger;
  const callerRepository = options.callerRepository ?? "corwinm/arashi";
  const [owner, repo] = callerRepository.split("/");
  const core = {
    setFailed: () => undefined,
    setOutput: (name: string, value: string) => outputs.set(name, value),
  };
  const outputs = new Map<string, string>();
  const context = {
    eventName: options.eventName ?? "pull_request",
    repo: { owner, repo },
    payload: {
      pull_request: {
        head: {
          repo: { full_name: eventSourceRepository },
          sha: eventSha,
        },
      },
      repository: { full_name: eventSourceRepository },
    },
    sha: eventSha,
  };
  const previous = { ...process.env };
  Object.assign(process.env, {
    CHANGED_REPOSITORY: changedRepository,
    CHANGED_SOURCE_REPOSITORY: changedSourceRepository,
    CHANGED_SHA: changedSha,
    EVENT_NAME: context.eventName,
    HEAD_REF: "feature",
    META_EVENT_SOURCE: "corwinm/arashi-arashi",
    META_EVENT_SHA: "3".repeat(40),
    JOB_CONTEXT: JSON.stringify({
      workflow_repository:
        options.workflowRepository ?? "corwinm/arashi-arashi",
      workflow_sha: options.workflowSha ?? sha.workflow,
    }),
  });
  try {
    const AsyncFunction = Object.getPrototypeOf(
      async function () {},
    ).constructor;
    await new AsyncFunction("github", "context", "core", script)(
      githubMock("corwinm/arashi", options.githubMock),
      context,
      core,
    );
    return outputs;
  } finally {
    process.env = previous;
  }
}

type ManifestOptions = {
  workflowTransform?: (source: string) => string;
  environment?: Record<string, string>;
  checkoutHeads?: Record<string, string>;
};

async function runManifest(options: ManifestOptions = {}) {
  const workflow = (options.workflowTransform ?? ((source) => source))(
    await readFile(workflowPath, "utf8"),
  );
  const script = extractScript(workflow, "Write revision manifest");
  let manifest = "";
  const summaries: string[] = [];
  const heads = new Map(
    revisions.map((entry) => [entry.logicalRepository, entry.sha]),
  );
  for (const [repository, head] of Object.entries(
    options.checkoutHeads ?? {},
  )) {
    heads.set(repository, head);
  }
  const paths = new Map([
    ["meta", "arashi-arashi"],
    ["meta/repos/arashi", "arashi"],
    ["meta/repos/arashi-docs", "arashi-docs"],
    ["meta/repos/arashi-skills", "arashi-skills"],
    ["meta/repos/arashi-vscode", "arashi-vscode"],
    ["meta/repos/arashi-presentation", "arashi-presentation"],
  ]);
  const fakeRequire = (module: string) => {
    if (module === "node:child_process") {
      return {
        execFileSync: (_command: string, args: string[]) => {
          const repository = paths.get(args[1]);
          if (!repository)
            throw new Error(`unexpected checkout path: ${args[1]}`);
          return `${heads.get(repository)}\n`;
        },
      };
    }
    if (module === "node:fs") {
      return {
        writeFileSync: (_path: string, bytes: string) => {
          manifest = bytes;
        },
        appendFileSync: (_path: string, bytes: string) => summaries.push(bytes),
      };
    }
    throw new Error(`unexpected module: ${module}`);
  };
  const previous = { ...process.env };
  Object.assign(
    process.env,
    {
      CHANGED_REPOSITORY: "arashi",
      ARASHI_ARASHI_SOURCE: "corwinm/arashi-arashi",
      ARASHI_ARASHI_SHA: sha.workflow,
      ARASHI_SOURCE: "contributor/arashi",
      ARASHI_SHA: sha.trigger,
      ARASHI_DOCS_SOURCE: "corwinm/arashi-docs",
      ARASHI_DOCS_SHA: sha.docs,
      ARASHI_SKILLS_SOURCE: "corwinm/arashi-skills",
      ARASHI_SKILLS_SHA: sha.skills,
      ARASHI_VSCODE_SOURCE: "corwinm/arashi-vscode",
      ARASHI_VSCODE_SHA: sha.vscode,
      ARASHI_PRESENTATION_SOURCE: "corwinm/arashi-presentation",
      ARASHI_PRESENTATION_SHA: sha.presentation,
      GITHUB_STEP_SUMMARY: "/tmp/summary",
    },
    options.environment,
  );
  try {
    const AsyncFunction = Object.getPrototypeOf(
      async function () {},
    ).constructor;
    await new AsyncFunction("require", "core", script)(fakeRequire, {
      setFailed: () => undefined,
    });
    return { manifest, summaries };
  } finally {
    process.env = previous;
  }
}

describe("cross-repository revision resolver", () => {
  test("binds a fork pull request and called workflow to exact sources and SHAs", async () => {
    const outputs = await runResolver();

    expect(outputs.get("arashi_arashi_source")).toBe("corwinm/arashi-arashi");
    expect(outputs.get("arashi_arashi_sha")).toBe(sha.workflow);
    expect(outputs.get("arashi_source")).toBe("contributor/arashi");
    expect(outputs.get("arashi_sha")).toBe(sha.trigger);
    expect(outputs.get("arashi_docs_sha")).toBe(sha.docs);
    expect(outputs.get("arashi_skills_sha")).toBe(sha.skills);
    expect(outputs.get("arashi_vscode_sha")).toBe(sha.vscode);
    expect(outputs.get("arashi_presentation_sha")).toBe(sha.presentation);
  });

  test.each([
    [
      "caller source misattribution",
      { changedSourceRepository: "corwinm/arashi" },
      "does not match event source",
    ],
    [
      "caller SHA misattribution",
      { changedSha: "4".repeat(40) },
      "does not match event SHA",
    ],
    [
      "partial invocation tuple",
      { changedSourceRepository: "" },
      "requires logical repository, source repository, and SHA",
    ],
    [
      "unsupported logical repository",
      { changedRepository: "unknown", callerRepository: "corwinm/unknown" },
      "Unsupported child repository",
    ],
    [
      "malformed revision",
      { changedSha: "not-a-sha", eventSha: "not-a-sha" },
      "is not a full lowercase SHA",
    ],
    [
      "unexpected workflow repository",
      { workflowRepository: "contributor/arashi-arashi" },
      "Unexpected workflow repository",
    ],
    [
      "non-fork source repository",
      { githubMock: { sourceFork: false } },
      "is not in the corwinm/arashi fork network",
    ],
    [
      "wrong fork-network root",
      { githubMock: { sourceForkRoot: "other/arashi" } },
      "is not in the corwinm/arashi fork network",
    ],
    [
      "commit API identity mismatch",
      { githubMock: { commitSha: "5".repeat(40) } },
      "did not resolve to",
    ],
  ] as const)("rejects %s", async (_name, options, message) => {
    await expect(runResolver(options)).rejects.toThrow(message);
  });
});

describe("cross-repository revision manifest", () => {
  test("writes the exact canonical object and repository order", async () => {
    const { manifest, summaries } = await runManifest();
    const expected = {
      schemaVersion: 1,
      trigger: revisions[1],
      repositories: revisions,
    };

    expect(manifest).toBe(`${JSON.stringify(expected, null, 2)}\n`);
    expect(summaries).toEqual([
      `## Cross-repository revisions\n\n\`\`\`json\n${manifest}\`\`\`\n`,
    ]);
  });

  test("canonical comparison catches reordered repository definitions", async () => {
    const canonical = await runManifest();
    const reordered = await runManifest({
      workflowTransform: (workflow) =>
        workflow.replace(
          '["arashi", "ARASHI", "meta/repos/arashi"],\n              ["arashi-docs", "ARASHI_DOCS", "meta/repos/arashi-docs"],',
          '["arashi-docs", "ARASHI_DOCS", "meta/repos/arashi-docs"],\n              ["arashi", "ARASHI", "meta/repos/arashi"],',
        ),
    });

    expect(reordered.manifest).not.toBe(canonical.manifest);
    expect(
      JSON.parse(reordered.manifest).repositories.map(
        (entry: { logicalRepository: string }) => entry.logicalRepository,
      ),
    ).not.toEqual(revisions.map((entry) => entry.logicalRepository));
  });

  test.each([
    [
      "missing revision",
      { environment: { ARASHI_DOCS_SHA: "" } },
      "Incomplete revision for arashi-docs",
    ],
    [
      "malformed revision",
      { environment: { ARASHI_DOCS_SHA: "not-a-sha" } },
      "Incomplete revision for arashi-docs",
    ],
    [
      "checked-out HEAD mismatch",
      { checkoutHeads: { "arashi-docs": "9".repeat(40) } },
      "arashi-docs checkout mismatch",
    ],
    [
      "trigger omitted from manifest",
      { environment: { CHANGED_REPOSITORY: "unknown" } },
      "Trigger repository is missing",
    ],
  ] as const)("rejects %s", async (_name, options, message) => {
    await expect(runManifest(options)).rejects.toThrow(message);
  });
});
