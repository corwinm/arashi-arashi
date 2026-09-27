# Design: manual advisory integration (#377)

## Decision and scope

The updated issue is the approved policy. This design changes integration ownership, not the contract semantics. The source assessment covers `corwinm/arashi-arashi` and its five upstream children: `arashi`, `arashi-docs`, `arashi-skills`, `arashi-vscode`, `arashi-presentation`. Child builds/tests/reviews and package/release validation retain their existing ownership and protection. A red integration run is actionable evidence, never an implicit ban on merges or further work.

## Entry point and provenance

The final `.github/workflows/cross-repo-command-contracts.yml` exposes only `workflow_dispatch`, without revision-selection inputs. Accept only upstream meta dispatch on `refs/heads/main`. Reject tags, feature refs, forks, reusable calls and other events before repository checkout. Validate the workflow repository/ref and full lowercase 40-hex workflow/event SHAs; the executing workflow SHA must equal the dispatch event SHA. Check out meta at that SHA, not a newly fetched main tip. This defines meta main at dispatch time and prevents a newer checker checkout from claiming an older workflow's provenance.

Resolve each child's upstream `refs/heads/main` once before any repository checkout; validate canonical repository identity and full commit SHA. There is no default-branch fallback, branch-name matching, PR/fork substitution or user-supplied candidate set. All checkouts use resolved source/SHA pairs with credentials not persisted. Main may advance during a run: the result describes the recorded snapshot, not a simultaneous multi-repository transaction or a promise of current freshness. A new dispatch obtains a new snapshot; reruns retain their original coordinator provenance and must not be presented as a fresh coordinator assessment.

Retain read-only contents permission, no inherited/release secrets or write tokens, and pinned toolchain/action policy. Removing child invocation eliminates its source/fork input validation code, not the new upstream identity/provenance guards.

## Evidence and outcomes

After all six checkouts, verify each HEAD equals its selected SHA and validate exactly one entry per repository in canonical order (meta, CLI, docs, skills, VS Code, presentation). Publish schema-versioned deterministic JSON with dispatch event/ref, coordinator workflow repository/ref/SHA, triggering meta source/SHA, and logical/source/SHA entries. Preserve the fixed `cross-repo-revisions` artifact, identical summary JSON, missing-file error, validated non-empty SHA-256 artifact-archive digest and digest semantics. Change schema version if the serialized trigger/provenance shape changes; do not leave obsolete child-trigger fields masquerading as current inputs.

Manifest validation, summary publication, upload and digest validation must finish before semantic stages. Invalid identity, checkout, manifest, upload or digest fails closed without semantic execution. On early failure, report the exact phase as inability to validate; never invent complete revision evidence. Later failures retain the already-published artifact. Report semantic drift separately from setup/build/API/artifact/runner inability to validate (or both if independently observed); an unclassified nonzero checker exit is not proof of drift. Both are unsuccessful runs. No `continue-on-error` or swallowed exit status may turn failure green merely to make it advisory.

## Separate local checker CI from integration

Current `pnpm test` includes live-child assumptions: caller-presence tests; `semantic-validation-entrypoints.test.ts` copies skills scripts; `command-contracts.test.ts` copies child assets; naming/materialization fixtures copy child guidance or archive tools; documented-command tests inspect the real workspace. Merely moving the existing test command to a meta-only checkout will fail or reintroduce sibling drift.

Make default `pnpm test` a complete meta-local suite using tracked, deterministic fixtures for checker semantics and resolver/workflow mutations. It must pass in a clean meta checkout with no `repos/` directory and no child fetches or sibling symlinks. Inventory every test's child reads, not only the examples above. Preserve positive and negative semantic mutation coverage: fixtures exercise real meta checkers, not success stubs. For tests whose purpose is execution of actual child aggregates/archive tools or verification of current owned guidance, move the assertions to an explicit integration test command selected by the manual workflow after its evidence gate. Missing children in that command fail, never skip. Keep executable source/package aggregate reachability proofs there; preserve fixture-based registry/runner tests in automatic CI. Do not replace child behavior with fixture assertions and then claim live integration coverage.

A separate automatic meta workflow runs `pnpm test`, `pnpm typecheck`, `pnpm format:check` on meta PRs and main pushes using only meta dependencies. Static workflow/documentation stage alignment remains local; checks for actual child wiring/absence belong to the audited workspace/manual integration. CI must reject accidental reintroduction of automatic integration triggers without checking out children. Preserve the existing docs aggregate, skills source aggregate, canonical extracted-package aggregate, and registry-backed meta aggregate with explicit prevalidated-child mode; execute each semantic stage once. Dedicated acceptance subprocesses may test failure propagation separately, not duplicate the authoritative semantic stage execution.

## Cleanup and rollout

Audit meta plus each of the five children for callers, invocation-only helpers/config, stale docs/check-name references and tests demanding retired wiring. Trace consumers before deleting anything: structured contract inputs, local semantic validators, fixtures used by retained checks and release/package scripts are not invocation junk. Record a reviewed diff or explicit no-change finding per child and before/after local-quality and release workflow coverage.

Rollout order is deliberately not an atomic merge:

1. Prepare and review all diffs and acceptance tests; introduce automatic meta-local CI before removing the workflow that currently runs those checks. If necessary, land that preparation separately while retaining the old reusable interface.
2. Read live repository/organization rulesets and branch protections for all six repositories; enumerate exact cross-repository status contexts and preserve unrelated settings. Obtain authorization for the specific external edits, remove only obsolete integration requirements, and read back the exact targets **before** deleting callers. If an inherited rule cannot be changed, stop rollout rather than strand PRs or bypass it.
3. Merge deletion of all five child callers and invocation-only artifacts while the old reusable interface still exists. Verify default-branch workflow files and new child PR/push checks no longer invoke it, and retain local quality/release coverage. Do not use reruns of old events as proof of new wiring.
4. Only after callers are retired, remove `workflow_call`, direct meta PR/push integration triggers and retired resolver branches; retain the separate automatic local CI. This avoids merging caller deletions against a removed interface. Temporary old in-flight runs are historical, not the final policy.
5. Read back final triggers, all required-status settings and child audit evidence. Dispatch on meta main, inspect the actual completed run and download/validate its artifact and digest. Report drift versus inability honestly; a dispatch acknowledgment is not acceptance. Test controlled failure using local isolated fixtures, not deliberate bad main commits or feature-ref dispatches that violate policy.

Update maintained docs/agent guidance and canonical OpenSpec through normal archive/sync; historical archives are not dangling active wiring. No implementation or live setting change is performed by this design commit.

## Risks and acceptance boundary

- Fixture isolation can accidentally erase coverage: require a test inventory mapping every moved assertion to local or manual execution and explicit no-child acceptance.
- Organization-owned protections can block rollout; identify authority before deleting callers.
- Dispatch/main races are addressed by binding meta to the event, not by claiming all six tips were sampled atomically.
- A main-only policy cannot prove the final live path before rollout; fixture/resolver tests precede rollout and a real main dispatch is mandatory afterward. Semantic drift is an acceptable reported result, not grounds to falsify success.
- These checks assess merged sources and canonical package construction, not compatibility with an independently published CLI version.
