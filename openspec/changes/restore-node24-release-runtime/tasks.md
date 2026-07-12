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

- [ ] 4.1 On the first normal release after merge, verify the semantic-release step succeeds, npm/tag state is consistent, the GitHub release is published rather than draft, and all expected wrapper, binary, and checksum assets exist.
- [ ] 4.2 If production verification succeeds, archive and sync the OpenSpec change, update the meta PR to close issue #168, and complete the normal child-first merge and coordinated-worktree cleanup.
- [ ] 4.3 If production verification fails, repair the partial release, restore the Node 22 workaround in a focused follow-up if necessary, and capture the new upstream evidence before closing issue #168.
