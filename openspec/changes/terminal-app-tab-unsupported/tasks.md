## 1. Pre-implementation RED coverage

- [ ] 1.1 Add failing shared-launcher plan and execution tests proving Terminal.app `tab` returns `TAB_DISPOSITION_UNSUPPORTED` before target preflight, AppleScript execution, or window fallback while default `window` remains unchanged.
- [ ] 1.2 Add failing switch and post-create tests across configured/coordinated and standalone create paths, proving Terminal.app tab rejection occurs before directory directives, managed-ignore reconciliation, worktree creation, hooks, or launch mutation, with no tab-to-window fallback.
- [ ] 1.3 Add failing human-output tests requiring Terminal.app guidance for manual Command-T followed by `arashi switch --cd`, the shell-integration prerequisite, and the conditional `arashi switch --no-cd --no-default-launch` launch-forcing alternative.
- [ ] 1.4 Add failing structured-output regressions through both Commander and exported executors, preserving the existing error code, `{ disposition, launcher }` details, schema, and exit behavior.
- [ ] 1.5 Add failing meta contract and deliberate-drift fixtures that reject any canonical docs or packaged guidance claiming Terminal.app can create a scripted true tab or omitting the approved manual alternatives.

## 2. CLI implementation

- [ ] 2.1 Reclassify Terminal.app `tab` as unsupported in the pure launch-plan resolver with application-specific actionable guidance and unchanged `{ disposition, launcher }` error details.
- [ ] 2.2 Remove or make unreachable Terminal.app tab-target preflight and mutating tab AppleScript while preserving its existing default-window AppleScript/settings behavior.
- [ ] 2.3 Verify iTerm2, Ghostty, generic macOS fallback, switch `--tab`/`--cd` conflict, and standalone/configured launch precedence remain unchanged.

## 3. Canonical and companion guidance

- [ ] 3.1 Correct canonical launcher capability documentation to mark Terminal.app tab disposition unsupported and document Command-T plus `arashi switch --cd` as a sequential manual workflow requiring shell integration.
- [ ] 3.2 Update packaged Arashi skill guidance and regenerate managed agent-readable exports without adding System Events or Accessibility-dependent automation.
- [ ] 3.3 Extend semantic cross-repository checks and CI reachability/self-tests for the corrected Terminal.app default-versus-tab matrix and manual alternatives.

## 4. Verification

- [ ] 4.1 Run focused CLI, command-boundary, contract, docs, and packaged-skill tests after the final edits.
- [ ] 4.2 Run complete lint, typecheck, format, test, native build, Windows cross-build, generated-contract, and cross-repository semantic validation required by each affected repository.
- [ ] 4.3 Perform an independent spec-compliance and code-quality review, reconcile blockers, and verify every related PR's current head and CI before merge.
