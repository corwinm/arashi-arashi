# Installed Arashi Skill Implementation Evidence

## Baseline

Measured from clean `repos/arashi-skills` at `2ae32053830b8217d08e325a46173cb13d4017ed` before implementation.

- Installed boundary: `skills/arashi/`
- Files: 11
- Characters: 132,838
- Lines: 1,799
- `SKILL.md`: 4,770 characters / 77 lines
- `references/commands.md`: 64,898 characters / 847 lines

### Installed file sizes

| Path | Characters | Lines |
| --- | ---: | ---: |
| `README.md` | 2,719 | 40 |
| `SKILL.md` | 6,001 | 96 |
| `assets/cheatsheet.md` | 895 | 28 |
| `references/commands.md` | 64,898 | 847 |
| `references/hooks.md` | 13,675 | 201 |
| `references/prerequisites.md` | 2,261 | 30 |
| `references/publication.md` | 1,943 | 51 |
| `references/session-shortcuts.md` | 4,641 | 104 |
| `references/troubleshooting.md` | 13,666 | 68 |
| `references/tutorial.md` | 7,620 | 167 |
| `references/workflows.md` | 14,519 | 167 |

### Representative task-context loads

These figures model the always-loaded entry skill plus one selected reference; they exclude tool metadata and source artifacts.

| Task route | Characters loaded |
| --- | ---: |
| Commands | 70,899 |
| Workflows | 11,070 |
| Hooks | 13,189 |
| Troubleshooting | 12,967 |
| Tutorial | 8,537 |
| Session shortcuts | 7,507 |
| Prerequisites | 7,091 |
| Publication | 7,944 |

## Existing checker readers

- `SKILL.md`: bare-init, CLI-rationalization, executable-alias, inline-hook, lifecycle-hook, standalone, tab-disposition, archive, aggregate, and security self-tests.
- `references/commands.md`: 13 of the 14 focused guidance checkers.
- `references/tutorial.md`: 7 focused guidance checkers.
- `references/workflows.md`: 6 focused guidance checkers.
- `references/session-shortcuts.md`: 5 focused guidance checkers.
- `references/troubleshooting.md`: 6 focused guidance checkers.
- `references/hooks.md`: inline-hook, lifecycle-hook, and standalone checkers.
- `references/prerequisites.md`: Kitty and tab-disposition checkers.

Detailed path and rule ownership will be recorded before content moves. Final measurements will be appended after source and extracted-package validation.

## RED-first validation

Before guidance edits, `node scripts/installed-content-guidance-selftest.mjs` exited `1`. Its controlled synthetic source/package fixtures first proved rejection of broken routing, duplicated command ownership, unconditional Node/network prerequisites, stale versioned publication tags, and installed maintainer publication policy. The source RED then identified the expected old architecture: six missing task references, a 64,898-character command monolith, a 6,001-character entry point, installed publication policy, unconditional prerequisites, and command headings owned by the monolith.

## Rule ownership ledger

Each retained command is routed by `references/commands.md` and has one detail owner:

| Owner | Commands |
| --- | --- |
| `commands/setup.md` | `completion`, `setup`, `shell`, `shell init`, `shell install`, `update` |
| `commands/workspace.md` | `init`, `add`, `clone` |
| `commands/automation.md` | `exec`, `handoff`, `pull`, `push`, `sync`; filtering and structured coordinated output for `status`/`doctor` |
| `commands/create.md` | `create`, `move` |
| `commands/switch-and-launch.md` | `list`, `switch`; launcher behavior shared with create |
| `commands/remove-and-maintenance.md` | `remove`, `prune` |
| `commands.md` router | global flags, canonical help authority, mode selection, cross-repository filtering, and commands with no additional installed detail |

Concept ownership:

| Concept | Primary owner |
| --- | --- |
| Configured versus standalone selection and universal mutation/security boundaries | `SKILL.md` |
| Install/update/completion outcomes and update JSON refusals | `commands/setup.md` |
| Managed-path defaults, ignore precedence, SSH URL preservation, add/clone recovery | `commands/workspace.md` |
| Selector normalization/intersection, groups, exec, handoff, push, and general JSON automation | `commands/automation.md` |
| Create base precedence, reuse non-mutation, create launch precedence, move recovery, create JSON refusal | `commands/create.md` |
| Switch selection, launcher precedence, tab/tmux/sesh/cmux/Kitty/Herdr boundaries, switch JSON refusal | `commands/switch-and-launch.md` |
| Remove preview, cleanup routing, stale worktree pruning | `commands/remove-and-maintenance.md` |
| Script/inline lifecycle order, environment, no-shell interpolation, recursion and standalone boundaries | `hooks.md` |
| Navigation composition only | `session-shortcuts.md` |
| Goal selection and completion criteria | `workflows.md` |
| One configured journey plus explicit standalone choice | `tutorial.md` |
| Symptom, first diagnostic, recovery, and escalation | `troubleshooting.md` |
| Conditional tool/network/integration requirements | `prerequisites.md` |
| Maintainer release/discoverability policy | repository-level `docs/publication.md`, excluded from the installed skill |

Cross-links may summarize a boundary but must route detailed syntax, precedence, result shape, and recovery to the owner above.

## Final measurements

Measured after the final authored-source and extracted-package validation.

- Installed files: 16
- Installed characters: 106,475
- Installed lines: 1,577
- Character reduction: 26,363 (19.85%) from 132,838
- `SKILL.md`: 4,770 characters / 76 lines
- `references/commands.md`: 2,951 characters / 27 lines
- The canonical archive extracted to the same 16 files and 106,475 characters.

### Representative final task-context loads

Command-family routes include `SKILL.md`, the compact command router, and one focused leaf. Other routes include `SKILL.md` and one selected reference.

| Task route | Characters loaded |
| --- | ---: |
| Setup/update/completion | 12,899 |
| Remove/maintenance | 10,036 |
| Tutorial | 8,537 |
| Workflows | 11,477 |
| Hooks | 16,280 |
| Troubleshooting | 13,895 |
| Session shortcuts | 7,507 |
| Prerequisites | 7,229 |
| Create | 18,046 |
| Automation/coordinated execution | 17,640 |
| Workspace/repository management | 22,876 |
| Switch/launch | 24,796 |

The common narrow routes are approximately 7–13 KB. The broader workspace and launcher leaves remain larger because they own retained topology, precedence, refusal, platform, and recovery semantics rather than duplicating them across every workflow.

## Final validation evidence

All successful gates below postdate the final installed-content edit.

### Authored source and checker architecture

- `node scripts/validate-guidance.mjs`: PASS, 16/16 registered checkers completed.
- `node scripts/guidance-registration-selftest.mjs`: PASS.
- `node scripts/guidance-aggregate-selftest.mjs`: PASS, including extracted-only drift rejection.
- `node scripts/workflow-composition-selftest.mjs`: PASS.
- `node scripts/release-archive-selftest.mjs`: PASS.
- `node scripts/security-gate.mjs --root . --exceptions security/audit-exceptions.json`: PASS, zero findings and zero suppressed findings.
- `node scripts/security-gate-selftest.mjs`: PASS.
- `git diff --check`: PASS in both child and meta repositories.

### Canonical release artifact

The production archive command created and verified a 28-member canonical release archive. Inspection confirmed:

- all six focused command leaves were present;
- `skills/arashi/references/publication.md` was absent;
- repository-level `docs/publication.md` was outside the artifact;
- extraction produced 16 installed files and 106,475 characters;
- `node repos/arashi-skills/scripts/validate-guidance.mjs --skill-root package-check/skills/arashi` passed all 16/16 package-capable checkers.

### Coordinated meta contracts

After generating docs exports and extracting the canonical archive:

- `corepack pnpm contracts:check`: PASS, all 4 registered coordinated contract checkers completed.
- `corepack pnpm test`: PASS, 5 files and 344 tests.
- `corepack pnpm typecheck`: PASS.
- Prettier check of all changed TypeScript files: PASS.

The repository-wide `format:check` also reports four pre-existing Markdown formatting files under `docs/`; those files are unchanged by this work, and no broad formatting churn was introduced.

### Independent final review

The independent review found three concrete blockers. Each was encoded as RED before correction and is now covered by source and extracted-package validation:

- zero-config recovery now states that init appends the literal `.worktrees/` repository-local exclude rule rather than an exact destination;
- `setup` and `list` coverage owners now contain actionable command guidance, and the coverage checker verifies both owners;
- installed guidance rejects URL-form issue/PR examples and numeric `gh pr checks`/`view` examples; handoff examples now use caller-supplied placeholders.

### Verified Codex PR feedback

Repeated authenticated Codex GitHub App review passes produced concrete findings, each independently verified and addressed with RED-first regression assertions. The corrections include:

- supported-only inline-hook JSON and fail-closed Bash, PowerShell, and cmd prompt examples;
- independent shell-completion activation and correct `arashi shell install` recovery;
- literal `.worktrees/` standalone exclusion and a copyable exact-path `git check-ignore` diagnostic;
- initialization before diagnostics across the tutorial, workflows, `SKILL.md`, the command router, troubleshooting, and package README;
- inert init-generated hook examples without claiming automatic activation;
- real project-worktree tutorial validation and pipe-friendly picker guidance without undeclared `jq`;
- quoted, separated picker selection and execution;
- project-local validation for standalone and parent-only workspaces, with `exec` conditional on configured children;
- plain tmux prerequisites independent from optional sesh integration;
- standalone ignore checks that resolve and enter the main worktree root before testing the relative destination;
- completion terminology that distinguishes Arashi-generated shell scripts from shell-builtin completion;
- complete supported 1.x lifecycle-hook aliases, lossy remove aggregates, and the no-earlier-than-2.0 migration boundary.

The child branch then merged current `main` commit `c3596d7` through signed merge commit `00e3764`. New repository worktree materialization guidance was moved into the refactored `references/commands/create.md` owner rather than restoring the old command monolith; inbound links and the semantic checker were updated with controlled placement, link, and capability-probe drift fixtures. The exact child head `8c67076` is mergeable, has zero unresolved review threads, and passed the pull-request `security-gate` run `32043435304`.

All source, canonical extracted-package, security, coordinated-contract, test, typecheck, and OpenSpec gates were rerun after the final corrections.

### Semantic reconciliation

The coordinated gate identified omitted hook-input, interpreter, ambiguity, Kitty lock/recovery, and launcher-refusal semantics. Those concrete gaps were restored concisely. Exact internal tab-refusal envelopes and the exhaustive adapter implementation matrix remain excluded from installed guidance; command/code/mode/exit/no-fallback behavior remains enforced by the focused source/package checker, and the coordinated aggregate executes that registered owner rather than reparsing the removed implementation-heavy table.
