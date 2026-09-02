import { readFile } from "node:fs/promises";

import { describe, expect, test } from "vitest";

const workflowPath = ".github/workflows/cross-repo-command-contracts.yml";
const repositories = [
  "arashi_arashi",
  "arashi",
  "arashi_docs",
  "arashi_skills",
  "arashi_vscode",
  "arashi_presentation",
] as const;
const childRepositories = [
  "arashi",
  "arashi-docs",
  "arashi-skills",
  "arashi-vscode",
  "arashi-presentation",
] as const;

function expectedChildCaller(repository: (typeof childRepositories)[number]) {
  return `name: Cross-repository command contracts

on:
  pull_request:
  push:
    branches: [main]

permissions:
  contents: read

jobs:
  contracts:
    uses: corwinm/arashi-arashi/.github/workflows/cross-repo-command-contracts.yml@main
    with:
      changed_repository: ${repository}
      changed_source_repository: \${{ github.event.pull_request.head.repo.full_name || github.repository }}
      changed_sha: \${{ github.event.pull_request.head.sha || github.sha }}
`;
}

function validateChildCaller(
  repository: (typeof childRepositories)[number],
  source: string,
) {
  return source === expectedChildCaller(repository)
    ? []
    : [
        `repos/${repository}/.github/workflows/cross-repo-command-contracts.yml must match the authoritative read-only caller`,
      ];
}

function requireFragment(
  diagnostics: string[],
  source: string,
  fragment: string,
  message: string,
): void {
  if (!source.includes(fragment)) diagnostics.push(message);
}

function requireExactlyOnce(
  diagnostics: string[],
  source: string,
  fragment: string,
  message: string,
): void {
  if (source.split(fragment).length - 1 !== 1) diagnostics.push(message);
}

function validateFoundationWorkflow(source: string): string[] {
  const diagnostics: string[] = [];
  requireFragment(
    diagnostics,
    source,
    "workflow_call:",
    "missing workflow_call",
  );
  for (const input of [
    "changed_repository:",
    "changed_source_repository:",
    "changed_sha:",
  ]) {
    requireFragment(diagnostics, source, input, `missing input ${input}`);
  }
  requireFragment(
    diagnostics,
    source,
    "JOB_CONTEXT: ${{ toJSON(job) }}",
    "job workflow identity is not exposed to the resolver",
  );
  requireFragment(
    diagnostics,
    source,
    "jobContext.workflow_repository",
    "meta source is not bound to job.workflow_repository",
  );
  requireFragment(
    diagnostics,
    source,
    "jobContext.workflow_sha",
    "meta revision is not bound to job.workflow_sha",
  );
  requireFragment(
    diagnostics,
    source,
    'expectedWorkflowRepository = "corwinm/arashi-arashi"',
    "called workflow repository is not validated",
  );
  requireFragment(
    diagnostics,
    source,
    "sourceRepositoryData.fork",
    "fork status is not validated",
  );
  requireFragment(
    diagnostics,
    source,
    "sourceRepositoryData.source?.full_name",
    "fork network root is not validated",
  );
  requireFragment(
    diagnostics,
    source,
    "github.rest.repos.getCommit",
    "caller SHA is not resolved in its source repository",
  );
  requireFragment(
    diagnostics,
    source,
    "context.payload.pull_request?.head.repo.full_name",
    "pull request source is not derived from the event",
  );
  requireFragment(
    diagnostics,
    source,
    "context.payload.pull_request?.head.sha",
    "pull request SHA is not derived from the event",
  );
  requireFragment(
    diagnostics,
    source,
    "changedSourceRepository !== eventSourceRepository",
    "caller source input is not checked against the event",
  );
  requireFragment(
    diagnostics,
    source,
    "changedSha !== eventSha",
    "caller SHA input is not checked against the event",
  );

  for (const repository of repositories) {
    requireFragment(
      diagnostics,
      source,
      `repository: \${{ steps.revisions.outputs.${repository}_source }}`,
      `${repository} checkout does not use resolved source`,
    );
    requireFragment(
      diagnostics,
      source,
      `ref: \${{ steps.revisions.outputs.${repository}_sha }}`,
      `${repository} checkout does not use resolved SHA`,
    );
  }
  const manifestEntries = [
    '["arashi-arashi", "ARASHI_ARASHI", "meta"]',
    '["arashi", "ARASHI", "meta/repos/arashi"]',
    '["arashi-docs", "ARASHI_DOCS", "meta/repos/arashi-docs"]',
    '["arashi-skills", "ARASHI_SKILLS", "meta/repos/arashi-skills"]',
    '["arashi-vscode", "ARASHI_VSCODE", "meta/repos/arashi-vscode"]',
    '["arashi-presentation", "ARASHI_PRESENTATION", "meta/repos/arashi-presentation"]',
  ];
  for (const entry of manifestEntries) {
    requireExactlyOnce(
      diagnostics,
      source,
      entry,
      `manifest entry is missing or duplicated: ${entry}`,
    );
  }
  if (/^\s+ref: main\s*$/m.test(source)) {
    diagnostics.push("workflow contains a floating main checkout");
  }
  if (source.includes("github.workflow_sha")) {
    diagnostics.push("workflow uses caller-oriented github.workflow_sha");
  }

  requireFragment(
    diagnostics,
    source,
    "name: cross-repo-revisions",
    "revision artifact name is not fixed",
  );
  requireFragment(
    diagnostics,
    source,
    "if-no-files-found: error",
    "missing manifest does not fail artifact upload",
  );
  requireFragment(
    diagnostics,
    source,
    "ARTIFACT_DIGEST: ${{ steps.revision_artifact.outputs.artifact-digest }}",
    "GitHub artifact archive digest output is not consumed",
  );
  requireFragment(
    diagnostics,
    source,
    "if (!process.env.ARTIFACT_DIGEST?.match(/^[0-9a-f]{64}$/))",
    "artifact digest is not validated fail-closed",
  );
  requireFragment(
    diagnostics,
    source,
    "artifactArchiveDigest",
    "summary does not identify archive digest semantics",
  );

  const resolver = source.indexOf("name: Resolve immutable revisions");
  const checkout = source.indexOf("name: Check out meta-repository");
  if (!(resolver >= 0 && checkout > resolver)) {
    diagnostics.push("revision resolver does not precede checkout");
  }
  const manifest = source.indexOf("name: Write revision manifest");
  const upload = source.indexOf("name: Upload revision manifest");
  const semantic = source.indexOf("name: Install pinned checker toolchain");
  if (!(manifest >= 0 && upload > manifest && semantic > upload)) {
    diagnostics.push("manifest is not uploaded before semantic validation");
  }
  return diagnostics;
}

describe("cross-repository workflow foundation", () => {
  test("supports direct and read-only child-called validation", async () => {
    const source = await readFile(workflowPath, "utf8");

    expect(source).toContain("pull_request:");
    expect(source).toContain("push:");
    expect(source).toContain("branches: [main]");
    expect(source).toContain("workflow_dispatch:");
    expect(source).toContain("permissions:\n  contents: read");
    expect(validateFoundationWorkflow(source)).toEqual([]);
  });

  test.each([
    [
      "fresh meta main resolution",
      (source: string) =>
        source.replace(
          "ref: ${{ steps.revisions.outputs.arashi_arashi_sha }}",
          "ref: main",
        ),
      "workflow contains a floating main checkout",
    ],
    [
      "caller-oriented workflow SHA",
      (source: string) =>
        source.replace("jobContext.workflow_sha", "github.workflow_sha"),
      "meta revision is not bound to job.workflow_sha",
    ],
    [
      "checkout before revision resolution",
      (source: string) =>
        source
          .replace(
            "name: Resolve immutable revisions",
            "name: Check out meta-repository",
          )
          .replace(
            "name: Check out meta-repository\n        uses: actions/checkout",
            "name: Resolve immutable revisions\n        uses: actions/checkout",
          ),
      "revision resolver does not precede checkout",
    ],
    [
      "upstream-attributed fork checkout",
      (source: string) =>
        source.replace(
          "repository: ${{ steps.revisions.outputs.arashi_source }}",
          "repository: corwinm/arashi",
        ),
      "arashi checkout does not use resolved source",
    ],
    [
      "omitted manifest repository",
      (source: string) =>
        source.replace(
          '["arashi-docs", "ARASHI_DOCS", "meta/repos/arashi-docs"],',
          "",
        ),
      "manifest entry is missing or duplicated",
    ],
    [
      "duplicate manifest repository",
      (source: string) =>
        source.replace(
          '["arashi-docs", "ARASHI_DOCS", "meta/repos/arashi-docs"],',
          '["arashi", "ARASHI", "meta/repos/arashi"],',
        ),
      "manifest entry is missing or duplicated",
    ],
    [
      "warning-only missing artifact",
      (source: string) => source.replace("if-no-files-found: error", ""),
      "missing manifest does not fail artifact upload",
    ],
    [
      "empty digest acceptance",
      (source: string) =>
        source.replace(
          "if (!process.env.ARTIFACT_DIGEST?.match(/^[0-9a-f]{64}$/))",
          "if (false)",
        ),
      "artifact digest is not validated fail-closed",
    ],
    [
      "log-only evidence",
      (source: string) =>
        source.replace("name: Upload revision manifest", "name: Log revisions"),
      "manifest is not uploaded before semantic validation",
    ],
  ])("rejects controlled drift: %s", async (_name, mutate, diagnostic) => {
    const source = await readFile(workflowPath, "utf8");
    expect(
      validateFoundationWorkflow(mutate(source)).some((entry) =>
        entry.includes(diagnostic),
      ),
    ).toBe(true);
  });
});

describe("merged child callers", () => {
  test.each(childRepositories)(
    "%s has the authoritative caller workflow",
    async (repository) => {
      const source = await readFile(
        `repos/${repository}/.github/workflows/cross-repo-command-contracts.yml`,
        "utf8",
      );
      expect(validateChildCaller(repository, source)).toEqual([]);
    },
  );

  test.each(childRepositories)(
    "%s caller enforcement rejects removal and contract drift",
    async (repository) => {
      const source = await readFile(
        `repos/${repository}/.github/workflows/cross-repo-command-contracts.yml`,
        "utf8",
      );
      expect(validateChildCaller(repository, "")).toHaveLength(1);
      expect(
        validateChildCaller(
          repository,
          source.replace(
            "github.event.pull_request.head.repo.full_name",
            "github.repository",
          ),
        ),
      ).toHaveLength(1);
    },
  );
});

describe("cross-repository revision documentation", () => {
  test("documents caller identity, immutable reproduction, and artifact digest semantics", async () => {
    const source = await readFile(
      "docs/cross-repo-command-contracts.md",
      "utf8",
    );
    for (const fragment of [
      "actual pull-request source repository",
      "exact PR-head or push SHA",
      "gh run download RUN_ID -R OWNER/REPOSITORY -n cross-repo-revisions",
      "logicalRepository",
      "sourceRepository",
      "artifact-archive SHA-256",
    ]) {
      expect(source).toContain(fragment);
    }
  });
});
