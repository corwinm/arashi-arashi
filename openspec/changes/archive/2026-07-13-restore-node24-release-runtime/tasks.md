## 1. Release Dependency Fix

- [x] 1.1 Update the `corwinm/arashi` release dependency resolution so `bun.lock` resolves `@semantic-release/github` 12.0.9 or later without unrelated dependency churn.
- [x] 1.2 Verify the installed semantic-release dependency graph and record the resolved semantic-release, GitHub plugin, and Undici versions.

## 2. Node 24 Workflow Restoration

- [x] 2.1 Change `.github/workflows/release.yml` from Node 22 to explicit Node 24 and remove the obsolete asset-upload workaround comment.
- [x] 2.2 Review the workflow diff and parse the YAML to confirm triggers, permissions, step order, publishing behavior, and expected assets remain unchanged.

## 3. Pre-Merge Validation

- [x] 3.1 Run `bun run lint`, `bun run test`, and `bun run build` in `corwinm/arashi`.
- [x] 3.2 Build all release binaries and generate checksums using the release workflow's pinned Bun compiler where practical; verify the expected asset set.
- [x] 3.3 Run semantic-release dry-run in a safe environment where branch and credentials permit, or document the exact environment limitation and the remaining production-only verification.
- [x] 3.4 Open and cross-link the `corwinm/arashi` implementation PR and this meta/OpenSpec PR to issue #168, with exact validation evidence.

## 4. Production Verification and Closeout

- [x] 4.1 Verify production release v1.19.1: workflow run 29226629162 succeeded on Node 24, npm and the tag report 1.19.1, the GitHub release is published rather than draft, and all seven uploaded assets match the checksum manifest.
- [x] 4.2 Archive and sync the OpenSpec change, update the meta PR to close issue #168, and complete the normal child-first merge and coordinated-worktree cleanup.
- [x] 4.3 Confirm no partial-release repair or Node 22 rollback is required because production verification succeeded.
