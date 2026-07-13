## Context

Arashi's `release.yml` currently pins semantic-release to Node 22 because the v1.13.0 release used `@semantic-release/github` 12.0.8 under Node 24 and failed while uploading assets with `invalid content-length header`. npm publishing and tag creation had already succeeded, leaving a partial draft GitHub release. Upstream traced the failure to manually supplied content-length handling exposed by stricter Undici behavior and released the fix in `@semantic-release/github` 12.0.9.

The repository's `package.json` currently permits `semantic-release` updates, but `bun.lock` still resolves the GitHub plugin to 12.0.8. The implementation must therefore update the locked plugin resolution before changing the workflow runtime. Release validation must distinguish local/dry-run coverage from a real asset upload because semantic-release dry-run does not publish assets.

## Goals / Non-Goals

**Goals:**

- Ensure the installed release toolchain contains the upstream Node 24 asset-upload fix.
- Restore the release job to Node 24 without changing release order, assets, permissions, or publishing channels.
- Validate everything that can be tested safely before merge and explicitly verify asset upload during the next production release.
- Preserve a clear rollback path if the production upload exposes an unanticipated regression.

**Non-Goals:**

- Moving the release workflow to Node 26 while it is not supported by semantic-release.
- Replacing semantic-release or separating asset upload into a new publishing system.
- Triggering a throwaway public release solely to test the change.
- Changing Arashi CLI behavior, release asset names, installer behavior, or npm Trusted Publishing.

## Decisions

1. **Update the locked GitHub release plugin before restoring Node 24.**
   - The lockfile must resolve `@semantic-release/github` 12.0.9 or later. Updating only `node-version` would retain the known-broken 12.0.8 code.
   - Prefer the smallest dependency refresh that achieves the fixed resolution. If Bun requires refreshing the parent `semantic-release` package within its existing range, review all resulting lockfile changes and keep unrelated upgrades out of scope.
   - Alternative: add a direct exact dependency on `@semantic-release/github`. This is acceptable only if the transitive resolution cannot be updated reliably; otherwise it adds an unnecessary manifest-level dependency.

2. **Restore the release job to Node 24, not `latest`.**
   - Node 24 is the supported LTS runtime covered by the upstream fix. An explicit major keeps releases predictable while receiving patched Node 24 versions.
   - Alternative: use `lts/*`. That would automatically jump runtime majors when the LTS line changes and could reintroduce unreviewed release-tool incompatibility.

3. **Use layered validation without creating a throwaway release.**
   - Before merge, run repository quality gates, parse/review the workflow, confirm the resolved plugin version, build all release assets/checksums, and run semantic-release dry-run where credentials and branch context permit.
   - The first normal production release after merge is the definitive upload verification. Verify that the release is published rather than left as a draft and that every expected wrapper, binary, and checksum asset exists.
   - Alternative: publish a temporary release. This adds public tags/releases and risks exercising npm publication unnecessarily, so it is rejected.

4. **Keep rollback focused.**
   - If the next production upload fails for a new Node 24 compatibility reason, repair any partial release using the existing documented recovery process, then restore Node 22 in a focused follow-up while retaining the fixed plugin unless evidence implicates it.

## Risks / Trade-offs

- **Dry-run cannot prove GitHub asset upload** → Treat the next legitimate release as the final acceptance check and inspect all expected assets.
- **A broad dependency refresh introduces unrelated changes** → Prefer a targeted Bun update and review the lockfile diff and resolved dependency graph.
- **Node 24 or Undici changes again after merge** → Keep the runtime on explicit major 24, retain upstream fixed plugin coverage, and use the documented partial-release repair path if needed.
- **The workflow summary can claim success even after failure because it runs with `always()`** → Do not use summary text as proof; use the semantic-release step conclusion and GitHub release asset inventory.

## Migration Plan

1. Update the release dependency resolution and confirm `@semantic-release/github >=12.0.9`.
2. Change the release workflow setup runtime from Node 22 to Node 24 and remove the workaround comment.
3. Run local quality gates and release build/dry-run validation; inspect the workflow and dependency diffs.
4. Merge through the normal child-PR then meta-spec closeout sequence.
5. During the next normal release, verify semantic-release succeeds, the release is not a draft, npm/tag state is consistent, and all expected assets are present.
6. If verification fails, repair the partial release and temporarily restore Node 22 while opening a focused follow-up with the new evidence.

## Open Questions

None. Upstream 12.0.9 has merged Node 24 test coverage and is published, so implementation can proceed after proposal approval.
