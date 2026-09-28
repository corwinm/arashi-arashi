## 1. CLI input and adapter boundary

- [x] 1.1 Add `--t3 [task]`, `--prompt-file`, and closed-choice `--permission` create options with pre-mutation prompt, permission, and launch-conflict validation.
- [x] 1.2 Implement isolated bridge discovery/version compatibility checks without a runtime dependency or implicit package download.
- [x] 1.3 Implement private prompt staging and argv-safe `t3code --json handover` execution against the exact folder/current checkout with explicit no-UI and permission arguments.
- [x] 1.4 Parse and sanitize bridge success/error results into explicit environment, project, thread, dispatch, UI, and recovery outcomes.

## 2. Receipt and create lifecycle integration

- [x] 2.1 Implement Git-common-directory handoff receipts with canonical workspace keys, prompt digests, owner-only atomic persistence, and no prompt/credential content.
- [x] 2.2 Enforce safe receipt transitions and block duplicate retry after success, dispatching, or indeterminate outcomes while allowing matching definite-failure retry.
- [x] 2.3 Integrate post-create dispatch without rollback, suppress configured launch defaults, preserve complete human/JSON creation results on handoff failure, and support non-mutating dry-run plans.
- [x] 2.4 Update CLI semantic contracts and generated shell completions for the new create options and JSON behavior.

## 3. CLI verification

- [x] 3.1 Add unit tests for prompt sources, permissions, version compatibility including the published embedded-version quirk, argv/path/multiline safety, result sanitization, and bridge failures.
- [x] 3.2 Add integration tests for pre-mutation rejection, exact parent dispatch, default/no-UI/full-access arguments, creation preservation, human/JSON stages, dry-run, and optional-tool isolation.
- [x] 3.3 Add receipt/retry tests for definite failure, success, active/indeterminate dispatch, changed intent, atomic/private persistence, and credential/prompt exclusion.
- [x] 3.4 Run CLI formatting, lint, typecheck, tests, contract/completion checks, and build; record any environment-limited end-to-end coverage accurately.

## 4. Canonical documentation

- [x] 4.1 Document create syntax, validation, launch precedence, default full-access permission, no-UI behavior, JSON outcomes, and pinned bridge/Node compatibility.
- [x] 4.2 Add the main-to-feature T3 workflow, self-contained prompt expectations, exact-workspace/manual desktop-mobile selection, failure/retry/reconciliation guidance, and honest platform evidence.
- [x] 4.3 Run the documentation repository's required validation and build checks.

## 5. Packaged agent guidance

- [x] 5.1 Add focused T3 create/handoff guidance while keeping `SKILL.md` a minimal router and using installed CLI help as the command source of truth.
- [x] 5.2 Add or update guidance validation so authored and packaged artifacts retain prompt, permission, navigation, and retry safety contracts.
- [x] 5.3 Run guidance, security, and release-archive validation for the skills repository.

## 6. Cross-repository review and delivery

- [x] 6.1 Review CLI, docs, skill, and cross-repository diffs against the issue and OpenSpec artifacts; update artifacts if implementation evidence changes a design decision.
- [x] 6.2 Run strict OpenSpec/meta validation and the applicable cross-repository command-contract assessment.
- [x] 6.3 Commit each changed repository separately and open issue-linked, mutually cross-linked pull requests. Archive timing was subsequently changed by the user's explicit request to archive and push before merging.
