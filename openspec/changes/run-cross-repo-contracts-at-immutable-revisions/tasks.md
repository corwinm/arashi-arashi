## 1. Proposal and RED Contract

- [ ] 1.1 Validate the proposal, design, and `cross-repo-command-contracts` delta against issue #346 and the current workflow topology.
- [ ] 1.2 Add meta RED tests for `workflow_call` logical/source/SHA validation, `job.workflow_repository`/`job.workflow_sha` coordinator binding, fork-source handling, immutable resolver outputs, explicit-source/SHA checkouts, complete deterministic manifests, strict artifact/digest reporting, and preserved direct triggers.
- [ ] 1.3 Add foundation controlled-drift fixtures that reject fresh meta-`main` resolution, floating or misattributed triggering-child checkout, unsupported or malformed invocation, omitted/duplicate revisions, permissive missing-file upload, empty upload digests, and log-only revision reporting.

## 2. Callable Meta Foundation

- [ ] 2.1 Implement a fail-closed logical/source/revision resolver that validates the upstream caller, validates fork sources, binds called jobs to `job.workflow_repository`/`job.workflow_sha`, and selects coordinated meta-PR or default revisions exactly once before checkout.
- [ ] 2.2 Make every meta and child checkout consume only resolver source/SHA outputs and verify each checked-out `HEAD` before semantic validation.
- [ ] 2.3 Generate the canonical JSON revision manifest, append its exact bytes to the job summary, upload it as `cross-repo-revisions` before semantic validation with `if-no-files-found: error`, require a non-empty upload digest, and append the artifact-archive SHA-256 digest.
- [ ] 2.4 Add `workflow_call` inputs and preserve direct meta pull-request, `main`, and manual trigger behavior with read-only permissions.
- [ ] 2.5 Run meta tests, typecheck, formatting, contract checks, strict OpenSpec validation, Actionlint, and an independent foundation review; merge the narrow callable-workflow foundation before child callers reference `@main`.

## 3. Child Callers

- [ ] 3.1 Add a minimal read-only pull-request and `main` caller workflow to `arashi` that passes the repository name and exact event SHA without secrets.
- [ ] 3.2 Add equivalent caller workflows to `arashi-docs`, `arashi-skills`, `arashi-vscode`, and `arashi-presentation`.
- [ ] 3.3 Validate every child workflow locally and with repository contract checks, then open cross-linked child PRs against the merged callable foundation.
- [ ] 3.4 Verify exact-head child CI and at least one real reusable-workflow invocation per caller before merging each child PR.

## 4. Coordinated Closeout

- [ ] 4.1 Enable authoritative real-repository presence enforcement for all five merged caller workflows and prove its controlled-drift test fails when any caller is removed or altered.
- [ ] 4.2 Update `docs/cross-repo-command-contracts.md` and alignment checks for child invocation, fork/source identity, exact-revision reproduction, manifest/artifact retrieval, and artifact-archive digest meaning.
- [ ] 4.3 Record the final child merge SHAs in durable meta evidence and rerun the aggregate against those exact revisions.
- [ ] 4.4 Download a post-merge revision artifact, verify its JSON bytes, logical/source/SHA completeness, and GitHub-reported artifact-archive digest, and record the run URL.
- [ ] 4.5 Reconcile all eligible review feedback, mark tasks only from post-edit evidence, archive and sync OpenSpec, and pass final exact-head meta gates.
- [ ] 4.6 Merge the final meta closeout, verify issue #346 closure, remove coordinated branches/worktrees, and confirm all six repositories are clean and synchronized.
