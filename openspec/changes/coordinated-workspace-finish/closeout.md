# Coordinated finish closeout

The delivered feature satisfies the user-approved bounded v1 scope for issue [#374](https://github.com/corwinm/arashi-arashi/issues/374). This is a cross-repository delivery closeout, not release authorization or a claim that every historical acceptance permutation was tested.

## Merged delivery

- Design: meta [#375](https://github.com/corwinm/arashi-arashi/pull/375); independent design approvals named `f058b8870f8ae5e9a3d16c68066908848f6929f9` (see historical audit).
- CLI implementation: [#194](https://github.com/corwinm/arashi/pull/194), merge `f6380e2a80b0b0e7b37d46e57ed3574190e854c5`.
- CLI acceptance repair: [#197](https://github.com/corwinm/arashi/pull/197), merge `486cbd08752762974ba0721b90894a0213fdf563`, reviewed/tested head `cbebeca0b7bff390d749de711120b2f43beb5d76`.
- Canonical docs: [#112](https://github.com/corwinm/arashi-docs/pull/112), followed by [#115](https://github.com/corwinm/arashi-docs/pull/115), merge `9bcb4a19321065d63c42e1f010d2a415590dfdae`.
- Packaged skill and command coverage: [#77](https://github.com/corwinm/arashi-skills/pull/77) and [#78](https://github.com/corwinm/arashi-skills/pull/78), latter merge `531e2b46fc8a0fdad3a48f4d16c612b89f080ceb`.
- Meta hook ownership contract: [#378](https://github.com/corwinm/arashi-arashi/pull/378).

The historical audit's nested distinct-branch plan mismatch (G1) is fixed. Base refs and relative paths now follow the existing outbound screening policy while internal Git identities remain exact (G2 was inconsistent screening, not a demonstrated credential leak). Failed strict post-hook inventory refresh now retains completed hook outcomes and invalidates finish before deletion. Canonical documentation explicitly disclaims remembered create-time overrides and atomic safety after the final revalidation.

## Verification and review

At CLI head `cbebeca0b7bff390d749de711120b2f43beb5d76`:

- Finish suite: 66 passed, 1 skipped.
- Finish plus four remove suites: 110 passed, 2 skipped.
- Full macOS host suite: 3343 passed, 104 skipped, 1 failed across 223 files. The remaining `configure-pty.test.ts:153` expected-phrase wrapping failure was independently reproduced on unchanged base `4a99788d932c98f5c6d670e1de3aabdbefb080dd` (24 passed, 1 failed). It was kept out of the bounded repair.
- Typecheck, full formatting, lint (0 errors; 3907 warnings), CLI/hook/executable contracts, completion check and compiled build passed. Strict OpenSpec validation passed as structural evidence only.
- [Exact-head CI](https://github.com/corwinm/arashi/actions/runs/36303762899) passed quality, Ubuntu/Windows tests, all three platform builds and all three native acceptance jobs.
- Independent cumulative semantic/architecture review approved the complete finish/remove implementation at that exact head, not just the latest diff. Local record: `~/.hermes/cache/scratch/finish-acceptance-review.txt`. The independent reviewer did not itself execute tests.
- [GitHub Codex review](https://github.com/corwinm/arashi/pull/197#issuecomment-5857752102) completed at the same head without findings. This was a no-findings result, not a formal GitHub approving review object.
- Docs #115 passed [docs quality CI](https://github.com/corwinm/arashi-docs/actions/runs/36301872472) and deployment preview. Its PR records successful generated Markdown, agent export and rendered-page checks.

New regression RED was observed for the reproduced plan/screening defects. Existing-behavior coverage that passed on first execution is not retrospectively called historical RED. The full historical compound RED section in tasks.md remains unchecked.

## Resolved design questions and deliberate limits

- Git ancestry can prove exact inspected HEAD integration only against freshly fetched named base history with replacements/grafts disabled and a complete graph. GitHub squash/rebase metadata is correlation, not immutable merge-time HEAD proof; uncertainty remains unknown/manual judgment.
- Revalidation occurs after consent and through the finish-only post-hook/pre-mutation remove gate. External actors can still race after the final check; no universal lock or atomic deletion guarantee is promised.
- JSON uses schemaVersion 1 and retains safe assessments on failures. Preview/success exit 0; required/declined consent exits 2; invalidation/removal failure exits 1.
- Noninteractive callers cannot manually confirm unknown completion in v1. Force covers discard/ordinary cleanup consent only.

Historical task wording says replacements/grafts are blanket unknown and pagination is exhaustive. The normative specification instead permits ancestry with replacements/grafts disabled, and the implemented adapter requires observed exhaustion within its bounded traversal; truncation is unavailable. This closeout records the discrepancy rather than changing behavior or claiming those literal historical tasks passed.

Explicitly deferred coverage: interactive per-repository manual base entry; shallow/missing-object and full squash/rebase histories; live authenticated gh/rate-limit behavior; real PTY declined discard/ordinary-remove consent; consent-time registration/plan mutation; contradictory remote-refresh/failure-class transitions. The user accepted bounded prioritization of reproduced defects and destructive cleanup safety, not an unlimited adapter/error matrix. No known implementation blocker remains within that accepted scope; these deferred cases remain residual uncertainty, not silently completed tests.

## Closeout scope

The issue's old remaining-design section and task heading were stale because the audit reconciliation remained uncommitted in a separate worktree. This record preserves that audit and publishes final disposition. Cross-repository integration is a separate manual advisory assessment, not an additional required merge gate. No fresh coordinated integration run is claimed here. Release publication and archival of this historical change directory are separate actions; neither is required to claim merged feature delivery. Dirty audit worktrees are not discarded by this closeout.
