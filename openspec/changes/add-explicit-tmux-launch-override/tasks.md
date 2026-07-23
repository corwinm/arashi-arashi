## 1. CLI and configuration contracts

- [ ] 1.1 Add failing switch/create tests for `--tmux` help, parsing, explicit conflict sets, and per-invocation-only behavior.
- [ ] 1.2 Add or update no-change contract coverage proving create `LaunchMode`, unified `SwitchMode`, legacy switch normalization, generated schema, and switch-config exports do not gain a persisted `tmux` value.
- [ ] 1.3 Add the dedicated missing-tmux-context error code and structured error classification without changing existing sesh or generic launch errors.
- [ ] 1.4 Update typed CLI semantic metadata and regenerate `contracts/cli-commands.json` from the Commander tree so switch/create `--tmux` support and companion-surface policy remain source-derived.

## 2. Shared launcher behavior

- [ ] 2.1 Add failing shared-launcher tests proving forced tmux precedence, missing-context failure without fallback, argv-safe paths, subprocess failure behavior, and unchanged automatic launch resolution.
- [ ] 2.2 Implement forced tmux in the shared launcher by reusing one plain-tmux command path for explicit, configured, and automatic invocation.
- [ ] 2.3 Run focused launcher tests and the no-flag regression matrix for tmux, Herdr, cmux, IDE, terminal-app, and platform fallback behavior.

## 3. Switch command

- [ ] 3.1 Add failing unit and real temporary-workspace tests for configured-workspace and standalone `switch --tmux`, config/managed-context precedence, `--cd` and explicit-launch conflicts, `--no-cd`/`--no-default-launch` semantics, missing context, and JSON rejection at both Commander and direct-executor boundaries.
- [ ] 3.2 Register `--tmux`, carry the discriminated launcher choice through switch behavior and launch resolution, and validate conflicts/prerequisites before launch or directory switching.
- [ ] 3.3 Verify human and JSON result/error typing, exact-path behavior, unchanged configured modes, and unchanged switch behavior when `--tmux` is absent.

## 4. Create command

- [ ] 4.1 Add failing unit and real temporary-workspace tests for configured-workspace and standalone `create --tmux`, implied launch, generic/editor-default override precedence, `--no-launch`/`--no-switch` semantics, conflicts, missing-context non-mutation, JSON non-mutation at both Commander and direct-executor boundaries, argv safety, and post-create process failure preservation.
- [ ] 4.2 Register `--tmux`, resolve it as an implied explicit launch mode, validate missing explicit tmux context before mutation, and pass forced tmux to the shared post-create launcher.
- [ ] 4.3 Verify create hooks/worktrees are absent after preflight or JSON rejection and remain present after a post-create tmux subprocess failure.

## 5. CLI repository documentation and validation

- [ ] 5.1 Update `repos/arashi` README and command/configuration references so flag syntax, configuration vocabularies, conflict sets, opt-outs, JSON behavior, and automatic-versus-forced tmux semantics match help.
- [ ] 5.2 Run formatting, lint, focused tests, the complete test suite, schema checks, and the production binary build after the final CLI edit.
- [ ] 5.3 Open the CLI child PR with non-closing issue linkage, exact validation evidence, and links reserved for companion PRs.

## 6. Canonical docs

- [ ] 6.1 Update switch/create command pages and the tmux/sesh workflow guide with explicit and configured plain-tmux behavior, standalone examples, prerequisites, precedence, conflicts, JSON safety, and failure semantics.
- [ ] 6.2 Regenerate or verify agent-readable docs exports and semantic contracts, then run `pnpm validate` after the final docs edit.
- [ ] 6.3 Open the docs child PR with non-closing issue linkage and cross-links to the CLI and skill PRs.

## 7. Arashi skill guidance

- [ ] 7.1 Update the smallest affected session-shortcut, tutorial, troubleshooting, and command-contract references with `switch --tmux` and `create --tmux`, while keeping `skills/arashi/SKILL.md` minimal.
- [ ] 7.2 Run skill package validation and cross-repository semantic-contract checks against both source and packaged artifacts after the final skill edit.
- [ ] 7.3 Open the skill child PR with non-closing issue linkage and cross-links to the CLI and docs PRs.

## 8. Coordinated verification and closeout readiness

- [ ] 8.1 Reconcile all OpenSpec scenarios against implementation/tests, mark completed tasks with evidence, and run `openspec validate add-explicit-tmux-launch-override` after final artifact updates.
- [ ] 8.2 Verify all related child PR bodies, CI matrices, top-level feedback, inline comments, and unresolved review threads; address every actionable finding before declaring the change ready.
- [ ] 8.3 Confirm child PRs are green and mergeable, the meta proposal PR remains non-closing until archive, and exactly one final closing reference will live on the meta PR during approved closeout.
