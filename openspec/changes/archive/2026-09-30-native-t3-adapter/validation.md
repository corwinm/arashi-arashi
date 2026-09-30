# Native T3 adapter evidence

Origin: [meta issue #389](https://github.com/corwinm/arashi-arashi/issues/389).

## Reviewed scope

Implementation lives in `repos/arashi`, user documentation in `repos/arashi-docs`, skill guidance in `repos/arashi-skills`, and design/coordination in this active OpenSpec change. Starting heads are recorded in `design.md`. No changes were made to the separate #387 workspace. VS Code's create flow supplies branch/editor-host arguments; additive T3 flags do not change that contract, so no VS Code implementation PR is required.

An independent repository-aware review identified premature project selection and relative executable resolution. Both were fixed and regression-covered. The reviewer independently reran native/handoff unit tests (34 passed), with no remaining actionable correctness/security findings.

## Local validation

- CLI: focused adapter, receipt, create-default, and CLI-contract suite: 147 passed. Completion ownership audit: 306 passed, 98 skipped. Format, lint (existing warnings, no errors), TypeScript, generated contracts/completions/schema, and compiled build passed.
- Docs: `pnpm validate` passed, including content, command semantics, build, links, and accessibility.
- Skills: guidance aggregate passed all 21 checkers. Canonical release archive inspected (28 members); extracted-package guidance passed all 21 checkers.
- Meta: strict active/all OpenSpec validation passed (84 changes); format, TypeScript, and tests passed (377 tests). Command, documented-command, and executable-distribution contract checks passed.

Required broad checks were run, with existing baseline failures disclosed rather than described as passing:

- CLI full suite on committed `9ab345b`: 3,407 passed, 116 skipped, two baseline failures (214 passing files, two failing, two skipped). The unchanged starting CLI revision independently reproduces `finish` partial-descendant fault injection (`expected exit 1, received 0`) and `handoff --markdown` warning rendering (`[WARN]` versus Unicode warning symbol) on this macOS environment. Neither affected source nor those tests is changed by this feature.
- Meta `contracts:check`: hook, inline-hook, materialization, and naming checkers still reference removed `repos/arashi/docs/{hooks,configuration}.md`; the hook checker additionally flags existing `.arashi/hooks/post-create.arashi-presentation.sh` package provenance. Those guidance files are already absent in starting CLI e696367, and checker/hook files are unchanged from starting meta bdd73c9. No user guides were recreated in the CLI to mask these failures.

Windows CI on the first implementation head passed all transport/catalog tests but exposed two POSIX-only receipt fault injectors. The test-only follow-up `0d0ed45` injects the Windows ACL step as well as directory sync, without changing runtime security behavior. The final test-only head `304ee1d` also satisfies the lint rules. Native/receipt tests (34), TypeScript, lint, and format passed locally; both corrected fault cases passed a local Windows-branch simulation. Independent review confirmed the fix. Fresh full-suite CI passes on the published head.

The validation-only VS Code checkout and extracted skills package are temporary fixtures and are removed before delivery. These baseline failures remain compatibility/validation limitations; affected PR descriptions disclose them.

## Bounded real handoff

Tested the user's updated local official T3 **0.0.43 / orchestration protocol 1**, on macOS arm64. The official CLI release archive was explicitly acquired only for this opt-in test and verified against official SHA256SUMS (`53697d51e92324e8e2596670ac5b0c9f33c509846438204362e047a78f4fa107`). Production Arashi never downloads a component.

The opt-in `scripts/test/t3-native-smoke.ts` creates an isolated Git parent/child fixture, hands off a fixed acknowledgement-only task with no tools/implementation request, checks exact canonical parent workspaceRoot and null thread worktreePath, waits at most 60 seconds for provider acknowledgement, and proves a repeat create is blocked by the receipt. It deletes only its owned project via official orchestration and removes only its temporary fixture. This avoids recursive implementation dispatch.

Observed selection: provider instance `codex`, model `gpt-6.1-sol`, `reasoningEffort=medium`, `serviceTier=default`; permission `full-access`; dispatch accepted and provider acknowledgement observed. UI mode `none`, exact-thread navigation false, UI skipped. Windows owner-only ACL branches have simulation and Windows CI coverage; Windows/Linux/mobile are not end-to-end validated against a real T3 provider.

Supported authentication still requires a matching installed official CLI. Desktop-only authentication and remote environment routing are not claimed. Existing bridge preferences migrate explicitly to `defaults.t3.{provider,model,effort}`; `thinkingEffort` maps to `effort`. Bridge-era receipts remain blocking.

## Companion pull requests (initial delivery)

CLI implementation commit `9ab345b` plus platform fault-injection test follow-ups through `304ee1d`, docs commit `36133be`, skills commit `fdfd9f9` were independently reviewed and committed. Companions: [CLI #205](https://github.com/corwinm/arashi/pull/205), [docs #121](https://github.com/corwinm/arashi-docs/pull/121), [skills #85](https://github.com/corwinm/arashi-skills/pull/85). Meta coordination: [meta #390](https://github.com/corwinm/arashi-arashi/pull/390). All four PRs are cross-linked and registered with the originating T3 thread. Do not merge or archive this change as part of this task.

## Remote validation

- [CLI CI on final head 304ee1d](https://github.com/corwinm/arashi/actions/runs/36624247117): all checks passed, including quality/schema/contracts, Linux and Windows full suites, and builds/native binary acceptance on Linux, macOS, and Windows. Linux: 3,507 passed, 18 skipped. Native T3 transport/receipt tests pass in both host suites; binary acceptance is separate from the real T3 provider smoke above.
- [Docs CI on 36133be](https://github.com/corwinm/arashi-docs/actions/runs/36622580222): passed; Netlify preview deployment passed.
- [Skills CI on fdfd9f9](https://github.com/corwinm/arashi-skills/actions/runs/36622610772): security/guidance gate passed.
- [Meta CI on 99c9ca2](https://github.com/corwinm/arashi-arashi/actions/runs/36624115632): passed. The final delivery-evidence-only commit is verified through the checks attached to meta #390.

All implementation PRs remain open and unmerged. Local baseline broad-check failures above remain explicitly disclosed despite green remote feature CI.

## Existing PR feedback corrections

Addressed the existing Codex feedback without requesting another Codex review:

- CLI [dry-run authentication mutation](https://github.com/corwinm/arashi/pull/205#discussion_r4137722009): dry-run checks CLI version and read-only runtime metadata, issuing/revoking no session. Actual execution still verifies authenticated capabilities.
- CLI [project path equivalence](https://github.com/corwinm/arashi/pull/205#discussion_r4137722015): resolve existing roots and compare physical filesystem identities, retaining ambiguous-match protection and avoiding blind case folding. Coverage includes aliases, duplicate equivalent roots, and Windows casing/separators.
- CLI [schema constraints](https://github.com/corwinm/arashi/pull/205#discussion_r4137846949): generated string/path patterns agree with runtime validation, including controls, whitespace, Unix/Windows/UNC paths, relative executable paths, trailing newlines, and Unicode line separators.
- Docs [recovery selection](https://github.com/corwinm/arashi-docs/pull/121#discussion_r4137715281) and skills [recovery selection](https://github.com/corwinm/arashi-skills/pull/85#discussion_r4137725769): repeat original provider/model/effort overrides and permission. Receipts retain their saved selection; conflicting flags or Arashi defaults block retry, while changed T3 defaults do not replace it.

Follow-up child commits: CLI `6187de4`, docs `961f77f`, skills `cec598b`. Independent repository-aware review checked the fixes; its two wording/regex findings were corrected before push. Focused adapter/create/schema tests: 115 passed, one Windows-only test skipped locally. CLI format, lint (zero errors), typecheck, generated schema, contracts/completions, and build pass. Docs `pnpm validate` passes. Skills guidance aggregate passes 21/21. Meta strict OpenSpec validation passes 84/84, format/typecheck pass, and tests pass 377/377. The complete local CLI suite finished with 3,410 passed, 117 skipped, and the same two previously reproduced baseline failures (finish fault injection and handoff warning formatting). Follow-up remote checks: [CLI 6187de4](https://github.com/corwinm/arashi/actions/runs/36638239584), [docs 961f77f](https://github.com/corwinm/arashi-docs/actions/runs/36638238571), [skills cec598b](https://github.com/corwinm/arashi-skills/actions/runs/36638240031), and [meta coordination f1d29cc](https://github.com/corwinm/arashi-arashi/actions/runs/36638309917). These links identify the exact follow-up validation runs; current PR checks cover subsequent evidence-only updates.

The meta aggregate remains limited by the documented baseline documentation/hook mismatches and absent validation-only VS Code/package fixtures; maintained documented-command checks pass. No VS Code implementation changes or additional live provider dispatch are needed for these focused fixes. The prior bounded T3 0.0.43 smoke remains the end-to-end evidence. All companion PRs remain cross-linked, open, and unmerged.

## Preserve options when pinning the current model

Addressed the additional existing [CLI Codex finding](https://github.com/corwinm/arashi/pull/205#discussion_r4138900418): explicit or layered model preferences no longer discard project/server options when they resolve to the same provider/model. Comparison happens after resolving the model slug/aliases. Explicit effort still overrides saved effort; changing provider or model uses catalog defaults for omitted options. Saved option validation remains fail-closed. Docs and skills clarify this behavior in their model-selection guidance.

Regression tests first reproduced the bug for project and server defaults, then passed with the correction. Coverage includes pinned slugs/aliases, aliases in saved selections, explicit effort override, genuinely changed models/providers, and unsupported saved options. Focused native/receipt/schema/create coverage: 117 passed, one Windows-only test skipped locally. CLI format, lint (zero errors), typecheck, schema/contracts/completions, and compiled build pass. Full-suite and new-head CI results are recorded through the companion PR checks. No additional provider task is dispatched for this selection-only fix and no new Codex review is requested.

Follow-up commits: CLI `5cec468`, docs `6e6ca96`, skills `f6c903c`. Docs validation passes, skills guidance passes 21/21, strict OpenSpec validation passes 84/84, and meta format/typecheck/tests pass (377 tests). All four existing PRs retain explicit companion cross-links and issue #389 references, and remain unmerged. Follow-up CLI CI: [run 36648043048](https://github.com/corwinm/arashi/actions/runs/36648043048).

## Newer stable T3 release compatibility

The initial exact 0.0.43 gate was conservative; it was not evidence that all newer releases are incompatible. Reviewed official v0.0.44 (`451afcb22d93f06cb24f9bc16703404564952553`) and current main (`0fcd5f906114`) against v0.0.43: no changes to this adapter's authentication/discovery/orchestration/catalog contract files. Official client compatibility in `packages/client-runtime/src/connection/compatibility.ts` is negotiated by orchestration protocol, not package-version equality.

Stable canonical versions >=0.0.43 are now eligible when installed CLI and selected server versions match, protocol 1 is advertised, and required auth/catalog/scopes/snapshot checks pass. Prerelease/nightly/malformed/old versions, mismatched components, incompatible protocols, and missing catalogs fail closed. Before dispatch authentication, recheck the server descriptor and installed CLI version to catch changes during workspace preparation. No downloads or private database access were added; receipt/uncertainty protection is retained.

Regression coverage includes stable newer versions, mismatches in either direction, protocol/catalog rejection, mocked 0.0.44 dispatch, and CLI/server upgrades after preflight that issue no session or orchestration mutations. Independent review found the need to recheck the installed CLI before dispatch; this is implemented and regression-covered. Real provider end-to-end evidence remains the earlier 0.0.43 smoke, while 0.0.44 is source-verified and covered with public-interface fixtures. Docs retain generic upstream links and describe the compatibility rule; skills and their guidance checks are aligned. No new Codex review requested.

Follow-up heads: CLI `6efc964`, docs `5e7e320`, skills `9edec33`. Final focused tests: 125 passed, one Windows-only skipped locally. CLI format/lint (zero errors)/typecheck/schema/contracts/completions/build pass. Docs validation passes, skills guidance passes 21/21, strict OpenSpec passes 84/84, and meta format/typecheck/tests pass (377 tests). Final full-suite results are tracked through the companion PR checks. No VS Code command contract changed. All companion PRs remain open and unmerged.

## Synchronization with merged user defaults

Merged each affected checkout's latest `origin/main`: CLI `653ef88` (#204), docs `00e8bd0` (#120), skills `785da05` (#84), and meta `75e965e` (#388). No other workspace was edited. The CLI reconciliation uses #387's shared, versioned personal configuration loader for `defaults.t3`, merges every field independently, and exposes values/provenance through `aw config effective`. Explicit handoff flags remain highest priority. Both published configuration schemas include the same T3 constraints. The documentation example includes required user-file version metadata; the dedicated integration page retains its current-state guidance and generic upstream links.

Focused validation: 213 passed, 4 platform-specific skips across native transport/receipts, create defaults, shared user configuration/effective diagnostics, CLI contracts, and configuration schema constraints. CLI format, lint (zero errors), typecheck, both schema regeneration checks, CLI contracts/completions, and compiled build passed. Docs `pnpm validate` passed. Skills source/package guidance aggregate passed 21/21; personal naming drift fixtures now target their owning paragraph rather than an earlier T3 preferences mention.

Meta: strict OpenSpec 85/85, format, typecheck, 377 tests, and maintained documented-command contracts passed. The broad contract aggregate remains unsuccessful: it expects absent VS Code/package fixtures and removed CLI user guides, flags existing hook provenance, and retains obsolete standalone naming expectations after #387. No removed guides were recreated to hide those failures. The full CLI host suite and fresh remote CI results are recorded on the companion implementation PR; the existing local finish fault-injection and handoff warning failures were observed again during that run. No new real-provider dispatch or Codex review was requested. All implementation PRs remain open and unmerged.

## Approved final integration and archive

The user subsequently authorized addressing existing feedback, syncing/archiving OpenSpec, and merging all four PRs with the meta-repo last. Earlier unmerged/no-archive statements above describe their historical delivery stage.

Final review found one new docs issue: the central configuration reference excluded `defaults.t3`. Docs commit `4c3d806` adds all five optional fields, validation, field precedence, T3 fallback semantics, and effective-source diagnostics; the integration page links to it. `pnpm validate` and [docs CI](https://github.com/corwinm/arashi-docs/actions/runs/36686752683) passed. All seven existing review threads were verified against implementation/tests/guidance and resolved. No new Codex feedback was requested.

[CLI CI](https://github.com/corwinm/arashi/actions/runs/36683675413) on `7280023` passed all quality, Linux/Windows full-suite, platform build, and native acceptance checks. Final local host suite: 3,480 passed, 123 skipped, and the same two baseline finish/handoff failures; no T3/user-configuration tests failed. [Skills CI](https://github.com/corwinm/arashi-skills/actions/runs/36683678130) passed on `966983f`. Local broad meta contract limitations above remain disclosed.

Child merges completed before the canonical OpenSpec archive: [CLI #205](https://github.com/corwinm/arashi/pull/205) at `940611168e0e30cc0748a4a3c9a12164123c1281`, [skills #85](https://github.com/corwinm/arashi-skills/pull/85) at `d7697238748668430cfa9a079c0028ecaffca79b`, and [docs #121](https://github.com/corwinm/arashi-docs/pull/121) at `3db53923456d8332a98464447a9d5ff9274f7881`. Meta [#390](https://github.com/corwinm/arashi-arashi/pull/390) owns the canonical spec sync and historical archive and merges last after its final checks pass.

Post-archive validation: canonical sync was compared against all nine complete delta requirement blocks; the former optional-bridge requirement is removed. Strict OpenSpec validation passed 84/84 active changes/specs, meta format/typecheck passed, all 377 meta tests passed, and maintained documented-command contracts passed. The broad local meta aggregate retains the disclosed unrelated removed-guide/naming/hook/absent-fixture failures.
