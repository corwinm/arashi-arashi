import { readFile } from "node:fs/promises";
import { describe, expect, test } from "vitest";
const path = ".github/workflows/cross-repo-command-contracts.yml";
function validate(source: string) {
  const errors: string[] = [];
  if (!source.includes("on:\n  workflow_dispatch:\n\npermissions:"))
    errors.push("dispatch-only");
  if (
    /workflow_call|changed_repository|CHANGED_|HEAD_REF|pull_request:|continue-on-error|secrets:/.test(
      source,
    )
  )
    errors.push("legacy or suppressed failure");
  const stages = [
    "Resolve immutable revisions",
    "Check out meta-repository",
    "Write revision manifest",
    "Upload revision manifest",
    "Report revision artifact digest",
    "Install pinned checker toolchain",
    "Check cross-repository contracts",
  ];
  if (
    /^        if:/m.test(
      source.split("      - name: Report advisory outcome")[0],
    )
  )
    errors.push(
      "evidence/semantic steps must use fail-closed default success gating",
    );
  let previous = -1;
  for (const name of stages) {
    const index = source.indexOf(`name: ${name}`);
    if (index <= previous) errors.push(`missing or misordered ${name}`);
    previous = index;
  }
  for (const name of [
    "arashi_arashi",
    "arashi",
    "arashi_docs",
    "arashi_skills",
    "arashi_vscode",
    "arashi_presentation",
  ]) {
    for (const [field, suffix] of [
      ["repository", "source"],
      ["ref", "sha"],
    ]) {
      if (
        !source.includes(
          `${field}: \${{ steps.revisions.outputs.${name}_${suffix} }}`,
        )
      )
        errors.push(`immutable ${name}`);
    }
  }
  for (const fragment of [
    "contents: read",
    "name: cross-repo-revisions",
    "path: meta/cross-repo-revisions.json",
    "if-no-files-found: error",
    "ARTIFACT_DIGEST: \${{ steps.revision_artifact.outputs.artifact-digest }}",
    "if (!process.env.ARTIFACT_DIGEST?.match(/^[0-9a-f]{64}$/))",
    "EVENT_SHA: \${{ github.sha }}",
    "WORKFLOW_SHA: \${{ github.workflow_sha }}",
    "WORKFLOW_REF: \${{ github.workflow_ref }}",
    "name: Report advisory outcome",
    "if: always()",
  ]) {
    if (!source.includes(fragment)) errors.push(`missing ${fragment}`);
  }
  if ((source.match(/persist-credentials: false/g) ?? []).length !== 6)
    errors.push("checkout credentials");
  return errors;
}
describe("manual advisory workflow", () => {
  test("is dispatch-only and gates semantics on durable immutable evidence", async () => {
    expect(validate(await readFile(path, "utf8"))).toEqual([]);
  });
  test.each([
    ["automatic trigger", "  workflow_dispatch:", "  push:"],
    [
      "floating checkout",
      "ref: \${{ steps.revisions.outputs.arashi_sha }}",
      "ref: main",
    ],
    [
      "log-only evidence",
      "name: Upload revision manifest",
      "name: Log revisions",
    ],
    ["missing file", "if-no-files-found: error", "if-no-files-found: warn"],
    [
      "missing digest gate",
      "if (!process.env.ARTIFACT_DIGEST?.match(/^[0-9a-f]{64}$/))",
      "if (false)",
    ],
    [
      "suppressed failure",
      "runs-on: ubuntu-latest",
      "runs-on: ubuntu-latest\n    continue-on-error: true",
    ],
  ])("rejects %s", async (_name, old, replacement) => {
    const source = await readFile(path, "utf8");
    expect(source).toContain(old);
    expect(validate(source.replace(old, replacement)).length).toBeGreaterThan(
      0,
    );
  });
  test("documents dispatch, snapshot limits, advisory failures and rollout", async () => {
    const source = await readFile(
      "docs/cross-repo-command-contracts.md",
      "utf8",
    );
    for (const fragment of [
      "gh workflow run cross-repo-command-contracts.yml",
      "--ref main",
      "gh run download RUN_ID -R corwinm/arashi-arashi -n cross-repo-revisions",
      "schemaVersion",
      "logicalRepository",
      "sourceRepository",
      "artifact-archive SHA-256",
      "inability to validate",
      "not a merge gate",
      "all five child callers",
    ])
      expect(source).toContain(fragment);
  });
});
