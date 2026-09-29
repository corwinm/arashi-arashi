# Native T3 adapter evidence

Origin: [meta issue #389](https://github.com/corwinm/arashi-arashi/issues/389).

## Reviewed scope

Implementation lives in `repos/arashi`, user documentation in `repos/arashi-docs`, skill guidance in `repos/arashi-skills`, and design/coordination in this active OpenSpec change. Starting heads are recorded in `design.md`. No changes were made to the separate #387 workspace. VS Code's create flow supplies branch/editor-host arguments; additive T3 flags do not change that contract, so no VS Code implementation PR is required.

An independent repository-aware review identified premature project selection and relative executable resolution. Both were fixed and regression-covered. The reviewer independently reran native/handoff unit tests (34 passed), with no remaining actionable correctness/security findings.

## Local validation

- CLI: focused adapter, receipt, create-default, and CLI-contract suite: 147 passed. Completion ownership audit: 306 passed, 98 skipped. Format, lint (existing warnings, no errors), TypeScript, generated contracts/completions, and compiled build passed.
- Docs: `pnpm validate` passed, including content, command semantics, build, links, and accessibility.
- Skills: guidance aggregate passed all 21 checkers. Canonical release archive inspected (28 members); extracted-package guidance passed all 21 checkers.
- Meta: strict active/all OpenSpec validation passed (84 changes); format, TypeScript, and tests passed (377 tests). Command, documented-command, and executable-distribution contract checks passed.

Required broad checks were run, with existing baseline failures disclosed rather than described as passing:

- CLI full suite: final counts recorded below. The unchanged starting CLI revision independently reproduces `finish` partial-descendant fault injection (`expected exit 1, received 0`) and `handoff --markdown` warning rendering (`[WARN]` versus Unicode warning symbol) on this macOS environment. Neither affected source nor those tests is changed by this feature.
- Meta `contracts:check`: hook, inline-hook, materialization, and naming checkers still reference removed `repos/arashi/docs/{hooks,configuration}.md`; the hook checker additionally flags existing `.arashi/hooks/post-create.arashi-presentation.sh` package provenance. Those guidance files are already absent in starting CLI e696367, and checker/hook files are unchanged from starting meta bdd73c9. No user guides were recreated in the CLI to mask these failures.

The validation-only VS Code checkout and extracted skills package are temporary fixtures and are removed before delivery. These baseline failures remain compatibility/validation limitations; affected PR descriptions disclose them.

## Bounded real handoff

Tested the user's updated local official T3 **0.0.43 / orchestration protocol 1**, on macOS arm64. The official CLI release archive was explicitly acquired only for this opt-in test and verified against official SHA256SUMS (`53697d51e92324e8e2596670ac5b0c9f33c509846438204362e047a78f4fa107`). Production Arashi never downloads a component.

The opt-in `scripts/test/t3-native-smoke.ts` creates an isolated Git parent/child fixture, hands off a fixed acknowledgement-only task with no tools/implementation request, checks exact canonical parent workspaceRoot and null thread worktreePath, waits at most 60 seconds for provider acknowledgement, and proves a repeat create is blocked by the receipt. It deletes only its owned project via official orchestration and removes only its temporary fixture. This avoids recursive implementation dispatch.

Observed selection: provider instance `codex`, model `gpt-6.1-sol`, `reasoningEffort=medium`, `serviceTier=default`; permission `full-access`; dispatch accepted and provider acknowledgement observed. UI mode `none`, exact-thread navigation false, UI skipped. Windows owner-only ACL branches have simulated coverage; Windows/Linux/mobile are not end-to-end validated.

Supported authentication still requires a matching installed official CLI. Desktop-only authentication and remote environment routing are not claimed. Existing bridge preferences migrate explicitly to `defaults.t3.{provider,model,effort}`; `thinkingEffort` maps to `effort`. Bridge-era receipts remain blocking.

## Companion pull requests

CLI commit `9ab345b`, docs commit `36133be`, skills commit `fdfd9f9` were independently reviewed and committed. Companions: [CLI #205](https://github.com/corwinm/arashi/pull/205), [docs #121](https://github.com/corwinm/arashi-docs/pull/121), [skills #85](https://github.com/corwinm/arashi-skills/pull/85). Meta coordination and remote check results follow after publication. Do not merge or archive this change as part of this task.
