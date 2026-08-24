## 1. RED: Ownership and public command contracts

- [ ] 1.1 Add failing closed-schema tests for POSIX and Windows ledger v2 payload roles, hashes, directory provenance, created-versus-pre-existing mutations, unknown fields, duplicate/escaping paths, symlinks/reparse points, and unsupported platforms.
- [ ] 1.2 Add failing installer/update migration tests for v1-to-v2 complete payload replacement, v2 provenance carry-forward, refusal of malformed/manual/modified state, and preservation of unproven historical PATH/profile/shell state.
- [ ] 1.3 Add failing command registration and wrapper tests for `aw`/`arashi uninstall`, `shell uninstall`, pre-native interception, `-n/-j/-y` parity, JSON/yes rejection, non-TTY confirmation, and no workspace discovery.
- [ ] 1.4 Add failing exact JSON schema tests for all channels, nullable fields, arrays, owner commands, actions, warnings, preserved scopes, every transaction error phase including `preflighted`/`backed-up`, equal-target `path < profile < shell` ordering, stdout isolation, and structured errors.
- [ ] 1.5 Add failing generated-contract and completion freshness tests for both commands, aliases/conflicts, inspection-only JSON, workspace independence, docs/skills requirements, and reasoned VS Code exclusion.

## 2. RED: Shell, package-manager, and transaction safety

- [ ] 2.1 Add failing byte-level shell tests for current/legacy complete blocks, absence, newline/separator variants, outside-byte preservation, selected shell target, finite full-uninstall candidates, and duplicate/orphan/reversed/nested/race/symlink failures.
- [ ] 2.2 Add failing owner-detection tests for npm, pnpm, Yarn, Bun, and Vite+; exact uninstall argv; conflicting/unknown/unavailable evidence; deterministic candidate guidance; and neutral working-directory delegation.
- [ ] 2.3 Add failing packed-package process tests proving both shims intercept uninstall without downloading a native binary, require consent, keep JSON non-mutating, propagate manager exits, and never directly delete package-owned files.
- [ ] 2.4 Add failing direct planner tests for exact ledger/payload/PATH/profile/shell preflight, deterministic plans, unrelated-neighbor preservation, modified/legacy/manual refusal, transaction-path collisions, and revalidation races.
- [ ] 2.5 Add failing journal tests for every phase, durable transitions, exact backups, interruption/retry, post-ledger retry authority, missing-without-evidence refusal, rollback success/failure, tri-state observation, completed-journal cleanup, repeated already-absent success, partial-state idempotency/refusal, and empty-created-directory removal.
- [ ] 2.6 Add failing POSIX helper integration tests for standalone recovery with the CLI unavailable, parent-PID wait/timeout, HUP/INT/TERM interruption, detached self-removal, exact profile rewrites, injected phase failures, retained recovery evidence, and script self-cleanup.
- [ ] 2.7 Add failing PowerShell 5.1/native Windows tests for standalone recovery with the CLI unavailable, locked self-removal, exact User PATH provenance/removal, fresh PowerShell/CMD/Git Bash observation, interruption, rollback/retry, reparse refusal, broadcast warnings, and test-state restoration.

## 3. RED: Documentation, skills, routes, and coordination

- [ ] 3.1 Add failing CLI documentation tests for dedicated uninstall command-list pages, command help examples, installer/recovery scripts, migration, and project-preservation guidance.
- [ ] 3.2 Add failing docs semantic/freshness fixtures for canonical workflow pages, Netlify route forms, command indexes, generated Markdown routes, `/llms.txt`, and `/llms-full.txt`.
- [ ] 3.3 Add failing skill source and extracted-package fixtures for channel detection, inspection/consent, shell-only scope, exact manager commands, migration, project preservation, and rejection of broad deletion.
- [ ] 3.4 Add failing meta controlled-mismatch fixtures and reachability tests for CLI contract, docs, generated exports, packaged skill, completion, hosted routes, and intentional VS Code exclusion through stable aggregates.
- [ ] 3.5 Record focused RED evidence for tasks 1.1-3.4 before editing production code, authored docs, generated artifacts, or semantic checker implementations.

## 4. Implement ownership and direct-uninstall core

- [ ] 4.1 Implement the typed closed ledger-v2 producer/parser/validator and generated executable-distribution ownership policy from the RED fixtures.
- [ ] 4.2 Expand POSIX and PowerShell install/update transactions to write v2 atomically, preserve mutation provenance, migrate valid v1 only through complete replacement, and refuse unsafe state.
- [ ] 4.3 Implement workspace-independent channel discovery, direct planning, deterministic human/JSON rendering, stable errors, confirmation precedence, and equivalent `aw`/`arashi` registration.
- [ ] 4.4 Implement the durable journal, exact backups, phase engine, revalidation, rollback, retry, final observation, and conservative empty-directory handling.
- [ ] 4.5 Implement POSIX and PowerShell uninstall helpers, hosted recovery options, parent-exit handoff, helper cleanup, and release packaging/checksum ownership.
- [ ] 4.6 Run focused ownership, planner, journal, POSIX, and PowerShell GREEN tests and reconcile every failure without weakening safety assertions.

## 5. Implement shell and package-manager paths

- [ ] 5.1 Extract the shared strict marker scanner/byte-preserving rewriter and implement confirmed `shell uninstall` plus finite full-uninstall shell discovery.
- [ ] 5.2 Refactor package-manager detection to operation-neutral evidence and implement exact npm/pnpm/Yarn/Bun/Vite+ delegation, ambiguity guidance, and neutral-cwd spawn behavior.
- [ ] 5.3 Intercept uninstall in the shared JavaScript wrapper before first-use native dispatch and preserve both generated shim paths.
- [ ] 5.4 Run focused shell, owner-detection, and packed-package GREEN suites through real process boundaries.

## 6. Generate CLI contracts and completion

- [ ] 6.1 Add typed command/option/JSON/docs/skills/completion/VS Code policy and regenerate `contracts/cli-commands.json` through its producer.
- [ ] 6.2 Advance executable-distribution ownership through its typed producer and regenerate checked-in artifacts; never hand-edit generated JSON.
- [ ] 6.3 Regenerate Bash, Zsh, Fish, and PowerShell completion and verify real-shell parity for both executable names without lifecycle side effects.
- [ ] 6.4 Run CLI contract, schema, completion, typecheck, lint, build, and focused process tests; verify second generation is byte-stable.

## 7. Implement docs, skills, routes, and semantic enforcement

- [ ] 7.1 Add CLI-local command docs and README installation/removal guidance, keeping exhaustive transactional internals in contracts rather than user prose.
- [ ] 7.2 Add website uninstall and shell-uninstall command pages, proportional install/troubleshooting workflow guidance, all four Netlify routes, indexes, and canonical exact manager commands.
- [ ] 7.3 Regenerate Markdown routes, `/llms.txt`, and `/llms-full.txt`; add the focused docs checker to the stable fail-closed aggregate and satisfy controlled fixtures.
- [ ] 7.4 Update the smallest authored skill installation/troubleshooting reference, package it, register focused semantic checking, and satisfy source plus extracted-package fixtures without expanding `SKILL.md` unnecessarily.
- [ ] 7.5 Add the meta registered uninstall checker and satisfy coordinated controlled-mismatch and aggregate-reachability tests without feature-specific workflow steps.
- [ ] 7.6 Run canonical docs validation, docs stable aggregate, skills source/package aggregates, and meta local/CI contract entrypoints against coordinated branches.

## 8. Review, PRs, and pre-archive delivery gates

- [ ] 8.1 Perform a read-only pre-commit review of each exact staged child diff against the approved design/specs and surrounding call sites; resolve supported findings before each commit.
- [ ] 8.2 Run the final full CLI suite plus POSIX installer/uninstaller acceptance after the final source edit; preserve exact logs and verify all child worktrees are clean after commits.
- [ ] 8.3 Run independent complete spec-compliance review, then bounded code/content-quality review, reconciling blockers with new focused RED tests before fixes.
- [ ] 8.4 Push and open cross-linked CLI, docs, and skills PRs early with non-closing references to issue #329; keep the proposal/meta PR open and as the sole eventual closing owner.
- [ ] 8.5 Verify each child PR exact head, complete CI, eligible feedback across comments/reviews/threads, mergeability, and reviewed contract evidence.
- [ ] 8.6 Run exact-version published POSIX/npm acceptance against `/uninstall` and both entrypoints; preserve all workspace/project/unrelated fixture bytes.
- [ ] 8.7 Run the same-version manual native Windows acceptance for `/uninstall.ps1`, locked self-removal, persistent PATH, fresh PowerShell/CMD/Git Bash resolution, rollback, and host-state restoration.
- [ ] 8.8 After approved child merges, verify child `main` contains reviewed heads, rerun coordinated meta validation against actual child `main`, reconcile all implementation evidence in this checklist, and confirm every pre-archive task is truthfully complete before OpenSpec archive/sync and final meta closeout.
