# Installed Arashi Skill Implementation Evidence

## Baseline

Measured from clean `repos/arashi-skills` at `2ae32053830b8217d08e325a46173cb13d4017ed` before implementation.

- Installed boundary: `skills/arashi/`
- Files: 11
- Characters: 132,838
- Lines: 1,799
- `SKILL.md`: 6,001 characters / 96 lines
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
| Workflows | 20,520 |
| Hooks | 19,676 |
| Troubleshooting | 19,667 |
| Tutorial | 13,621 |
| Session shortcuts | 10,642 |
| Prerequisites | 8,262 |
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
- Installed characters: 98,062
- Installed lines: 1,501
- Character reduction: 34,776 (26.18%) from 132,838
- `SKILL.md`: 4,642 characters / 76 lines
- `references/commands.md`: 2,703 characters / 28 lines
- The canonical archive extracted to the same 16 files and 98,062 characters.

### Representative final task-context loads

Command-family routes include `SKILL.md`, the compact command router, and one focused leaf. Other routes include `SKILL.md` and one selected reference.

| Task route | Characters loaded |
| --- | ---: |
| Setup/update/completion | 12,143 |
| Remove/maintenance | 9,660 |
| Tutorial | 8,198 |
| Workflows | 10,690 |
| Hooks | 12,856 |
| Troubleshooting | 12,847 |
| Session shortcuts | 7,234 |
| Prerequisites | 6,963 |
| Create | 15,615 |
| Automation/coordinated execution | 17,181 |
| Workspace/repository management | 22,500 |
| Switch/launch | 24,420 |

The common narrow routes are approximately 7–13 KB. The broader workspace and launcher leaves remain larger because they own retained topology, precedence, refusal, platform, and recovery semantics rather than duplicating them across every workflow.

## Final validation evidence

All successful gates below postdate the final installed-content edit.

### Authored source and checker architecture

- `node scripts/validate-guidance.mjs`: PASS, 15/15 registered checkers completed.
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
- extraction produced 16 installed files and 98,062 characters;
- `node repos/arashi-skills/scripts/validate-guidance.mjs --skill-root package-check/skills/arashi` passed all 15/15 package-capable checkers.

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

### Semantic reconciliation

The coordinated gate identified omitted hook-input, interpreter, ambiguity, Kitty lock/recovery, and launcher-refusal semantics. Those concrete gaps were restored concisely. Exact internal tab-refusal envelopes and the exhaustive adapter implementation matrix remain excluded from installed guidance; command/code/mode/exit/no-fallback behavior remains enforced by the focused source/package checker, and the coordinated aggregate executes that registered owner rather than reparsing the removed implementation-heavy table.
