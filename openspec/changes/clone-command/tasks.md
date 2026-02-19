## 1. Repository metadata and configuration groundwork

- [x] 1.1 Update workspace repository config handling to persist cloneable git URLs for every configured repository
- [x] 1.2 Add backward-compatible read and repair behavior for existing config entries that do not yet include URLs
- [x] 1.3 Add unit tests for URL persistence, validation, and migration/repair paths

## 2. Discovery and protocol utilities

- [x] 2.1 Implement shared repository state classification (configured-present, configured-missing, local-unmanaged)
- [x] 2.2 Implement protocol preference inference (SSH/HTTPS) with ambiguity detection and prompt fallback
- [x] 2.3 Add focused unit tests for discovery classification and protocol selection behavior

## 3. Clone command implementation

- [x] 3.1 Add and register `arashi clone` command with default interactive mode and `--all` non-interactive mode
- [x] 3.2 Implement clone candidate selection to include only configured-missing repositories
- [x] 3.3 Implement clone execution with per-repository success/failure reporting and continue-on-failure behavior
- [x] 3.4 Implement unmanaged local repository reconciliation prompts (add to config, delete with explicit confirmation, ignore)
- [x] 3.5 Add integration tests for no-missing, interactive-selection, `--all`, and partial-failure clone flows

## 4. Status and add command remediation updates

- [x] 4.1 Update `arashi status` to detect missing repository paths, skip git subprocess calls, and show `arashi clone` guidance
- [x] 4.2 Update duplicate handling in `arashi add` to recommend clone workflow and offer interactive clone fallback
- [x] 4.3 Remove incorrect `arashi remove` remediation suggestions from duplicate add output and add regression tests

## 5. Documentation and companion surface updates

- [x] 5.1 Update CLI docs with clone command behavior, options, reconciliation flow, and protocol selection rules
- [x] 5.2 Update related Skills and VS Code integration documentation/command guidance to reference `arashi clone`
- [x] 5.3 Document first-time setup and missing-repository recovery examples for team onboarding

## 6. Validation and readiness

- [x] 6.1 Run required quality checks in `repos/arashi`: `bun run lint` and `bun test`
- [x] 6.2 Run recommended build verification in `repos/arashi`: `bun run build`
- [x] 6.3 Perform end-to-end manual verification in a mixed workspace state and capture follow-up issues if gaps remain
