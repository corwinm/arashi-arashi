# Rollout evidence

- Foundation: [#380](https://github.com/corwinm/arashi-arashi/pull/380), main `e770a0021fa40ecf7296b8895e965e36bc6597e6`; required local context verified in successful [main run 36300566783](https://github.com/corwinm/arashi-arashi/actions/runs/36300566783) before settings edits.
- Meta ruleset `18285592`: replaced only `contracts` with `Meta quality checks`. CLI `16155709` and VS Code `22307414`: removed only `contracts / contracts`. Exact payload readbacks matched; effective main rules confirmed all unrelated requirements retained. All six legacy branch-protection reads returned 404; effective rulesets, not those 404s, established protection.
- Caller retirement: CLI #196, docs #114, skills #79, VS Code #48, presentation #9 merged with local checks passing. Reviewed diffs retained local/release workflows. Main workflow-content audit found no remaining cross-repository caller in any of the five children.
- Final workflow: [#381](https://github.com/corwinm/arashi-arashi/pull/381), main `d41631e5821c1b23d9e095d1a987c785d2226b3d`. Signed candidate `feb5cc2fb12781f7f255fc6288fae64e627884e7` independently reviewed; 377 local tests, typecheck, formatting, actionlint and strict change validation passed. Isolated populated workspace passed 174 integration tests, docs/source/package aggregates and all seven meta checkers. Real child worktrees remained unchanged.
- Live manual [run 36300790526](https://github.com/corwinm/arashi-arashi/actions/runs/36300790526) **succeeded**. Event `workflow_dispatch`, main coordinator SHA above. No drift or execution failure detected for the recorded snapshot. Meta automatic main quality [run 36300790598](https://github.com/corwinm/arashi-arashi/actions/runs/36300790598) also succeeded; no automatic integration push run occurred for this SHA.
- Downloaded artifact `10925820202` contains schema-v2 `cross-repo-revisions.json`, exactly six canonical upstream entries, matching dispatch/coordinator/trigger SHA. SHA-256 of the actual downloaded archive bytes matched the artifact API digest: `sha256:9455f7e91cebacf80e566342388e48351513f9590baadf9123c40dc6fb8d2532`.
- Negative evidence is from deterministic local resolver/evidence/workflow and real semantic mutation tests, plus effective required-status readbacks. No deliberately broken main commit or forbidden feature-ref dispatch was used to demonstrate failure. Runner-image migration notice is informational, not failed validation.

## Recorded child snapshot

- `corwinm/arashi`: `91a74a951357a486b3d4c533f23a367643b7218f`
- `corwinm/arashi-docs`: `55caaffa2a6273dbc0bc588069a39490bd5ba9fa`
- `corwinm/arashi-skills`: `5ab2b782e97016e771e0add4b1d71d076300c148`
- `corwinm/arashi-vscode`: `59b481802e540d2e182574e839aa46a2ec752c56`
- `corwinm/arashi-presentation`: `95ab3c2dc26ad0703e9a71dceca89c8198f1b184`
