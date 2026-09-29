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

## Companion pull requests

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
