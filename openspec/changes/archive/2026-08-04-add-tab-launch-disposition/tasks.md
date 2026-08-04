## 1. CLI RED Coverage

- [x] 1.1 Add failing shared-launcher tests for the default `window` discriminant, explicit `tab` propagation, reported disposition, exact argv/path handling, stripped directive environment, and no tab-to-window fallback.
- [x] 1.2 Add failing Windows tests for `wt.exe -w new new-tab` versus `wt.exe -w 0 new-tab`, active `WT_PROFILE_ID`, exact `-d` paths, default MSYS/Git Bash/MinTTY independent-window behavior, unsupported-tab preflight, generic Windows default/unsupported mappings, and no fallback after Windows Terminal tab failure.
- [x] 1.3 Add failing terminal-app tests for exact-context WezTerm window/tab commands, unmanaged Kitty window/unsupported-tab behavior, data-safe Terminal.app and iTerm2 default-window/true-tab AppleScript, macOS-versus-Linux Ghostty default/tab/version mappings, missing macOS target/automation behavior, and generic macOS/Linux default-window versus unsupported-tab behavior.
- [x] 1.4 Add failing managed-context tests for each canonical Kitty marker independently plus exact session create/focus/reuse under both dispositions, tmux/sesh and cmux in-session tab equivalence, Herdr default workspace plus active-workspace tab creation and missing-workspace preflight, IDE default window/unsupported tab/unavailable-auto-CLI fallback, and nested Ghostty-plus-multiplexer precedence.
- [x] 1.5 Add failing switch command/help tests for `--tab`, override of configured/contextual parent-shell `cd`, the explicit `--cd` conflict, `--no-cd`/`--no-default-launch` compatibility, IDE and managed-launcher composition, JSON guard precedence at both public boundaries, and configured/standalone parity.
- [x] 1.6 Add failing create command/help tests for `--tab` implications, precedence over `--no-launch`/`--no-switch`, managed launcher composition, configured/standalone pre-mutation unsupported rejection, dry-run preview non-mutation, post-create failure preservation, and JSON guard precedence at both public boundaries.
- [x] 1.7 Add failing command-contract generator/schema/type tests for a schema-version bump, optional explicit-option environment prerequisites, command-specific `--tab` policy, and no-change tests proving configuration types, normalization, schemas, and structured configuration contracts do not accept or advertise persisted disposition.

## 2. CLI Implementation

- [x] 2.1 Add `LaunchDisposition`, resolved launcher-family support, `TAB_DISPOSITION_UNSUPPORTED`, and result reporting to the shared launcher without changing existing launcher-selection precedence.
- [x] 2.2 Implement the normative Windows Terminal, Git Bash/MinTTY, WezTerm, unmanaged Kitty, Ghostty, macOS terminal, and generic fallback disposition mappings with exact argv-safe paths and no requested-tab fallback.
- [x] 2.3 Reconcile managed Kitty detection to the canonical one-of-marker predicate, then thread disposition through Kitty, tmux/sesh, cmux, Herdr tab creation, and IDE availability/fallback paths while preserving structured validation, exact identity/workspace targeting, and existing no-fallback failure boundaries.
- [x] 2.4 Register and resolve `switch --tab`, implement command-specific conflicts and compatibility, preserve configured/standalone behavior, and enforce structured JSON rejection in both the action and exported executor.
- [x] 2.5 Register and resolve `create --tab`, implement launch/switch implications and negative-flag precedence, share support preflight before coordinated or standalone mutation, preserve dry-run behavior, and enforce JSON rejection in both public boundaries.
- [x] 2.6 Generalize explicit-option environment prerequisites, bump the command-contract schema, and regenerate `repos/arashi/contracts/cli-commands.json` with typed `--tab` policy while leaving configuration contracts unchanged.
- [x] 2.7 Run focused launcher, switch, create, standalone, JSON, contract, and configuration tests, then final CLI format, lint, typecheck, full test, build, and Windows build gates after the last CLI edit.

## 3. Canonical Documentation RED/GREEN

- [x] 3.1 Add failing canonical docs and generated-export contract tests for the default independent context, CLI-only `--tab`, switch/create policy, launcher matrix, JSON restrictions, unsupported no-fallback guidance, and configuration no-change.
- [x] 3.2 Update canonical switch, create/defaults, terminal-integration, and troubleshooting guidance with the complete disposition contract.
- [x] 3.3 Regenerate agent-readable documentation exports from canonical sources and run focused source/export freshness tests plus the full docs repository validation and production build.

## 4. Packaged Skill RED/GREEN

- [x] 4.1 Add failing source and extracted-package tests for switch/create `--tab`, launcher selection versus disposition, managed equivalents, pre-mutation/create-failure boundaries, JSON restrictions, unsupported handling, and non-persisted configuration.
- [x] 4.2 Update authored Arashi skill guidance and examples without adding a persisted disposition workflow.
- [x] 4.3 Build/extract the actual skill package and run focused source/package checks plus the full skills repository validation after the last skill edit.

## 5. Cross-Repository Contract RED/GREEN

- [x] 5.1 Add failing meta-checker fixtures for missing or contradictory normalized switch/create `--tab` policy, launcher-matrix semantics, docs/skill guidance, and configuration no-change.
- [x] 5.2 Extend the canonical cross-repository checker and owning-source diagnostics to compare disposition semantics rather than option presence alone.
- [x] 5.3 Add or update the workflow wiring self-test and CI step so the focused launch-disposition checker is directly reachable.
- [x] 5.4 Prove the checker rejects deliberate out-of-repository semantic drift, then run focused checker tests, the canonical aggregate validator, OpenSpec validation, and meta-repository quality gates.

## 6. Coordinated Delivery

- [x] 6.1 Open and cross-link separate CLI, docs, and skill PRs with non-closing references to issue #240 and exact post-edit validation evidence.
- [x] 6.2 Verify all related PR review surfaces and complete replacement CI matrices; address only approved-contract blockers and report any design contradiction or adjacent extension.
- [x] 6.3 Mark implementation tasks complete from verified evidence, merge green child PRs first, archive and directly validate the synced OpenSpec capabilities, change the meta PR to the sole closing reference, and merge it last.
- [x] 6.4 Verify issue #240 closure, synchronize main across the configured workspace, remove the coordinated feature worktree and surviving local/remote branches, and confirm final clean aligned status.
