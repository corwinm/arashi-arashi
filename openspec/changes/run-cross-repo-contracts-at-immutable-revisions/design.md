## Context

The authoritative workflow lives in the public `arashi-arashi` repository and validates the meta checker against five public child repositories. Today only meta events invoke it. Every child checkout begins from a mutable `main` ref, matching coordinated branches are resolved later, and revision output exists only as plain log lines.

Cross-repository `repository_dispatch` would require distributing a PAT or GitHub App credential to all child repositories. GitHub supports calling a reusable workflow in a public repository, so the same coverage can run in each child repository’s own Actions context without a shared credential.

## Goals / Non-Goals

**Goals:**

- Run the authoritative suite for pull requests and merged `main` commits in every participating child.
- Bind the triggering child to the trusted logical repository, actual pull-request source repository, and full SHA supplied by the caller.
- Resolve all other selected refs to full SHAs once, before checkout, and use only those SHAs afterward.
- Produce complete deterministic revision evidence that survives the log stream.
- Preserve direct meta events and coordinated matching-branch validation.
- Fail closed on malformed or incomplete invocation/evidence.

**Non-Goals:**

- Add a PAT, GitHub App, or release credential.
- Change application/runtime behavior or make the cross-repository check a required status in this change.
- Trigger a second meta-repository workflow run through the REST API; the child run of the public reusable workflow is the cross-repository dispatch mechanism.
- Redesign the semantic checker stages.

## Decisions

### Use a public reusable workflow

The existing meta workflow will add `workflow_call` inputs for `changed_repository`, `changed_source_repository`, and `changed_sha`. Each child receives a minimal caller workflow for `pull_request` and pushes to `main`. The logical repository is the fixed upstream child; the source repository is `github.event.pull_request.head.repo.full_name` for pull requests and the upstream caller repository for `main` pushes.

This keeps execution centralized while the check is reported on the child commit that caused it. It also avoids a shared write-capable credential. `repository_dispatch` was rejected because the built-in `GITHUB_TOKEN` cannot dispatch into another repository and distributing a PAT would widen the security boundary. The called workflow validates that `github.repository` is the expected upstream logical repository. When the source differs, it verifies through the GitHub API that the public source belongs to the expected fork network before fetching the exact head SHA from that source.

### Resolve every repository before checkout

An initial shell step validates the invocation and resolves one full lowercase 40-character SHA plus source repository for the meta repository and every child. The triggering child must use the caller-supplied source and SHA. A child-called run requires `job.workflow_repository` to equal `corwinm/arashi-arashi` and binds the meta checkout to `job.workflow_sha`, so the checked-out coordinator and manifest identify the exact commit that supplied the reusable workflow rather than a later `main`. Direct meta pull requests use their event head SHA and may select same-named child branches; direct manual and `main` runs use child default branches. All remaining repositories resolve their selected ref once.

Every subsequent `actions/checkout` receives one resolver source-repository output and one resolver SHA output, never `main`, a pull-request merge ref, or a branch name. The resolver rejects unsupported or mismatched logical/source repositories, malformed SHAs, missing refs, and duplicate/missing manifest entries before checker execution. Controlled drift explicitly rejects resolving `arashi-arashi/main` during a called run instead of using the job workflow identity.

### Keep a deterministic manifest as evidence

After checkout, a repository-owned script verifies each local `HEAD` against the resolver output and writes `cross-repo-revisions.json` with schema version, trigger logical/source repository and SHA, and a canonical repository list whose entries preserve logical repository, source repository, and SHA. The same JSON bytes are appended to the job summary and uploaded under the fixed artifact name `cross-repo-revisions` using `actions/upload-artifact` with `if-no-files-found: error`. A later fail-closed step requires the upload action's non-empty SHA-256 digest and appends it to the summary. That digest covers GitHub's uploaded artifact archive, not only the manifest file.

The manifest is uploaded before semantic validation so a later contract failure still carries exact revision evidence. Tests parse the JSON and mutate workflow fixtures to prove omitted, duplicate, malformed, floating, misattributed, missing-file, warning-only upload, or empty-digest evidence fails.

### Bootstrap in two meta phases

Child callers cannot safely reference `@main` until `main` exposes `workflow_call`. A narrow foundation PR will first add and validate callability, immutable resolution, and evidence without requiring caller files that necessarily do not exist yet. Child PRs then reference the stable `@main` workflow. After all five callers merge, the coordinating OpenSpec branch enables authoritative real-repository caller-presence enforcement and its controlled-drift test, refreshes final child revisions, archives the change, and merges last.

## Risks / Trade-offs

- **A child PR advances while a run is queued** → The caller passes the event's full head SHA and source repository, so the run remains bound to the triggering fork or upstream revision.
- **A non-triggering child `main` advances during a run** → All refs are resolved before checkout and later steps use only those outputs.
- **A fork cannot provide repository secrets** → No secrets are passed; all source repositories and the reusable workflow are public and permissions remain read-only. The upstream caller identity and source fork relationship are validated separately.
- **Calling `@main` means workflow implementation changes independently of a child PR** → GitHub resolves the called workflow for the run, and `job.workflow_repository` plus `job.workflow_sha` bind the meta checkout and manifest to that exact workflow source; workflow changes are reviewed in the meta repository.
- **Five callers add visible CI work** → The caller is intentionally small and centralizes all logic; no application suite is duplicated inside the child workflow file.

## Migration Plan

1. Merge the callable-workflow foundation into `arashi-arashi/main` after local and PR validation.
2. Add and merge caller workflows in all five child repositories, verifying each exact head and at least one real child invocation.
3. Refresh the coordinating meta branch with the foundation and final child merge SHAs, enable authoritative five-caller presence enforcement, update the canonical workflow documentation, run the full aggregate, archive OpenSpec, and merge the final meta closeout.
4. Verify one post-merge child `main` invocation and download/validate its revision artifact and digest.

Rollback removes or disables the child caller workflows first. The direct meta triggers remain functional throughout, so reverting callable inputs or evidence steps afterward does not remove the original validation path.

## Open Questions

None.
