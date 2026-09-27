import { readFile } from "node:fs/promises";
import { describe, expect, test } from "vitest";

const workflowPath = ".github/workflows/cross-repo-command-contracts.yml";
const names = [
  "arashi-arashi",
  "arashi",
  "arashi-docs",
  "arashi-skills",
  "arashi-vscode",
  "arashi-presentation",
];
const sha = "a".repeat(40);
const childShas = Object.fromEntries(
  names.map((name, index) => [
    name,
    index === 0 ? sha : String(index).repeat(40),
  ]),
);
const workflowRef =
  "corwinm/arashi-arashi/.github/workflows/cross-repo-command-contracts.yml@refs/heads/main";
const environment = {
  EVENT_NAME: "workflow_dispatch",
  EVENT_REPOSITORY: "corwinm/arashi-arashi",
  EVENT_REF: "refs/heads/main",
  EVENT_SHA: sha,
  WORKFLOW_REF: workflowRef,
  WORKFLOW_SHA: sha,
};
function extractScript(workflow: string, name: string) {
  const step = workflow.indexOf(`- name: ${name}`);
  const marker = workflow.indexOf("          script: |\n", step);
  if (step < 0 || marker < 0) throw new Error(`Missing script ${name}`);
  const lines = workflow
    .slice(marker + "          script: |\n".length)
    .split("\n");
  const script = [];
  for (const line of lines) {
    if (line && !line.startsWith("            ")) break;
    script.push(line.slice(12));
  }
  return script.join("\n");
}
async function run(
  name: string,
  env: Record<string, string | undefined> = {},
  bindings: Record<string, unknown> = {},
  transform = (s: string) => s,
) {
  const script = extractScript(
    transform(await readFile(workflowPath, "utf8")),
    name,
  );
  const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
  return new AsyncFunction("process", "core", ...Object.keys(bindings), script)(
    { env: { ...environment, ...env } },
    { setFailed: () => {}, setOutput: () => {}, ...(bindings.core as object) },
    ...Object.values(bindings),
  );
}
async function resolve(
  env: Record<string, string | undefined> = {},
  fault = "",
  faultRepository = "arashi",
) {
  const calls: string[] = [];
  const outputs: Record<string, string | undefined> = {};
  const github = {
    rest: {
      repos: {
        get: async ({ owner, repo }: { owner: string; repo: string }) => {
          calls.push(`identity:${repo}`);
          if (fault === "api" && repo === faultRepository)
            throw new Error("API unavailable");
          return {
            data: {
              full_name:
                fault === "identity" && repo === faultRepository
                  ? "other/arashi"
                  : `${owner}/${repo}`,
              fork: fault === "fork" && repo === faultRepository,
            },
          };
        },
        getBranch: async ({
          repo,
          branch,
        }: {
          repo: string;
          branch: string;
        }) => {
          calls.push(`${repo}:${branch}`);
          if (fault === "missing") throw new Error("main missing");
          return {
            data: {
              name: branch,
              commit: { sha: fault === "sha" ? "INVALID" : childShas[repo] },
            },
          };
        },
      },
    },
  };
  await run("Resolve immutable revisions", env, {
    github,
    core: {
      setFailed: () => {},
      setOutput: (k: string, v: string) => (outputs[k] = v),
    },
  });
  return { calls, outputs };
}
describe("manual upstream resolution", () => {
  test("pins dispatch coordinator and resolves each upstream main once", async () => {
    const { calls, outputs } = await resolve();
    expect(calls).toEqual(
      names.flatMap((name, i) =>
        i ? [`identity:${name}`, `${name}:main`] : [`identity:${name}`],
      ),
    );
    for (const name of names) {
      expect(outputs[`${name.replaceAll("-", "_")}_source`]).toBe(
        `corwinm/${name}`,
      );
      expect(outputs[`${name.replaceAll("-", "_")}_sha`]).toBe(childShas[name]);
    }
  });
  test.each([
    { EVENT_NAME: "push" },
    { EVENT_NAME: "pull_request" },
    { EVENT_NAME: "workflow_call" },
    { EVENT_REF: "refs/heads/feature" },
    { EVENT_REF: "refs/tags/main" },
    { EVENT_REPOSITORY: "fork/arashi-arashi" },
    { WORKFLOW_REF: workflowRef.replace("corwinm", "fork") },
    { WORKFLOW_REF: workflowRef.replace("heads/main", "heads/feature") },
    { WORKFLOW_SHA: "b".repeat(40) },
    { WORKFLOW_SHA: "A".repeat(40) },
    { EVENT_SHA: "short" },
    { WORKFLOW_SHA: "" },
  ])("rejects provenance %j before API access", async (env) => {
    await expect(resolve(env, "api", "arashi-arashi")).rejects.toThrow(
      /dispatch|workflow|SHA|main|upstream/i,
    );
  });
  test.each(["identity", "fork", "api", "missing", "sha"])(
    "fails closed on %s",
    async (fault) => {
      await expect(resolve({}, fault)).rejects.toThrow();
    },
  );
});
async function manifest(
  env: Record<string, string | undefined> = {},
  badHead = false,
  transform = (s: string) => s,
) {
  let bytes = "";
  let summary = "";
  const revisions = names.map((logicalRepository) => ({
    logicalRepository,
    sourceRepository: `corwinm/${logicalRepository}`,
    sha: childShas[logicalRepository],
  }));
  const variables = Object.fromEntries(
    names.flatMap((name) => [
      [`${name.replaceAll("-", "_").toUpperCase()}_SOURCE`, `corwinm/${name}`],
      [`${name.replaceAll("-", "_").toUpperCase()}_SHA`, childShas[name]],
    ]),
  );
  await run(
    "Write revision manifest",
    { ...variables, ...env },
    {
      require: (module: string) => {
        if (module === "node:child_process")
          return {
            execFileSync: (command: string, args: string[]) => {
              const logicalRepository =
                args[1] === "meta"
                  ? names[0]
                  : args[1].replace("meta/repos/", "");
              expect(command).toBe("git");
              expect(args).toEqual([
                "-C",
                logicalRepository === names[0]
                  ? "meta"
                  : `meta/repos/${logicalRepository}`,
                "rev-parse",
                "HEAD",
              ]);
              return badHead ? "b".repeat(40) : childShas[logicalRepository];
            },
          };
        if (module === "node:fs")
          return {
            writeFileSync: (_p: string, s: string) => (bytes = s),
            appendFileSync: (_p: string, s: string) => (summary = s),
          };
        throw new Error(module);
      },
    },
    transform,
  );
  return { bytes, summary, revisions };
}
describe("revision evidence", () => {
  test("publishes the validated archive digest, not a manifest hash", async () => {
    let text = "";
    const summary = {
      addRaw: (value: string) => {
        text = value;
        return summary;
      },
      write: async () => {},
    };
    await run(
      "Report revision artifact digest",
      { ARTIFACT_DIGEST: "d".repeat(64) },
      { core: { summary } },
    );
    expect(text).toBe(
      `**Artifact archive digest:** \`sha256:${"d".repeat(64)}\``,
    );
  });
  test("emits deterministic schema v2 with coordinator provenance and identical summary JSON", async () => {
    const { bytes, summary, revisions } = await manifest();
    expect(bytes).toBe(
      JSON.stringify(
        {
          schemaVersion: 2,
          event: {
            name: "workflow_dispatch",
            repository: environment.EVENT_REPOSITORY,
            ref: environment.EVENT_REF,
            sha,
          },
          coordinator: {
            repository: environment.EVENT_REPOSITORY,
            ref: workflowRef,
            sha,
          },
          trigger: revisions[0],
          repositories: revisions,
        },
        null,
        2,
      ) + "\n",
    );
    expect(summary).toBe(
      `## Cross-repository revisions\n\n\`\`\`json\n${bytes}\`\`\`\n`,
    );
  });
  test.each([
    { ARASHI_DOCS_SHA: "" },
    { ARASHI_SHA: "BAD" },
    { ARASHI_SOURCE: "fork/arashi" },
    { EVENT_SHA: "b".repeat(40) },
    { WORKFLOW_REF: "wrong" },
  ])("rejects invalid evidence %j", async (env) => {
    await expect(manifest(env)).rejects.toThrow();
  });
  test("rejects checkout mismatch", async () => {
    await expect(manifest({}, true)).rejects.toThrow(/checkout/);
  });
  test.each(["missing", "duplicate", "extra", "reordered"])(
    "rejects %s manifest definitions",
    async (kind) => {
      await expect(
        manifest({}, false, (source) => {
          const entry =
            '["arashi-docs", "ARASHI_DOCS", "meta/repos/arashi-docs"],';
          if (kind === "missing") return source.replace(entry, "");
          if (kind === "duplicate")
            return source.replace(entry, entry + "\n              " + entry);
          if (kind === "extra")
            return source.replace(
              entry,
              entry + '\n              ["extra", "EXTRA", "meta/repos/extra"],',
            );
          const cli = '["arashi", "ARASHI", "meta/repos/arashi"],';
          return source
            .replace(cli, "SWAP")
            .replace(entry, cli)
            .replace("SWAP", entry);
        }),
      ).rejects.toThrow();
    },
  );
  test.each(["", "bad", "A".repeat(64)])(
    "rejects invalid archive digest %s",
    async (digest) => {
      await expect(
        run("Report revision artifact digest", { ARTIFACT_DIGEST: digest }),
      ).rejects.toThrow(/digest/i);
    },
  );
});

async function report(
  overrides: Record<string, string> = {},
  status = "success",
) {
  const source = await readFile(workflowPath, "utf8");
  const steps = Object.fromEntries(
    [...source.matchAll(/^        id: (.+)$/gm)].map((match) => [
      match[1],
      { outcome: "success" },
    ]),
  );
  for (const [id, outcome] of Object.entries(overrides))
    steps[id] = { outcome };
  let text = "";
  const summary = {
    addHeading: () => summary,
    addRaw: (s: string) => {
      text += s;
      return summary;
    },
    write: async () => {},
  };
  await run(
    "Report advisory outcome",
    { STEP_RESULTS: JSON.stringify(steps), JOB_STATUS: status },
    { core: { summary, setFailed: () => {} } },
  );
  return text;
}
describe("truthful advisory reporting", () => {
  test("reports only complete successful assessments", async () => {
    expect(await report()).toContain("Assessment passed");
  });
  test.each([
    "revisions",
    "write_revision_manifest",
    "revision_artifact",
    "report_revision_artifact_digest",
  ])("early failure %s cannot claim evidence or drift", async (id) => {
    const result = await report(
      {
        [id]: "failure",
        revision_artifact: "skipped",
        report_revision_artifact_digest: "skipped",
      },
      "failure",
    );
    expect(result).toContain("Inability to validate");
    expect(result).toContain("gate did not complete");
    expect(result).not.toContain("Assessment passed");
  });
  test.each([
    "check_documentation_semantics",
    "check_authored_skill_guidance",
    "check_packaged_skill_guidance",
    "check_cross_repository_contracts",
  ])("retains evidence on unclassified %s failure", async (id) => {
    const result = await report({ [id]: "failure" }, "failure");
    expect(result).toContain(id);
    expect(result).toContain("Inability to validate");
    expect(result).toContain("not proof of semantic drift");
    expect(result).toContain("remains available");
  });
  test.each([
    "check_documentation_semantics",
    "check_authored_skill_guidance",
    "check_packaged_skill_guidance",
    "check_cross_repository_contracts",
  ])("never calls skipped %s coverage a successful assessment", async (id) => {
    expect(await report({ [id]: "skipped" })).not.toContain(
      "Assessment passed",
    );
  });
});
