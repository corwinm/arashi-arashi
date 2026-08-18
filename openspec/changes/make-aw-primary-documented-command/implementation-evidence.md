# Implementation evidence

## Exact child state

All child worktrees are clean on `issue-295-aw-primary-docs`:

- `arashi`: `107c1286255711ec1df1c0edd9f513dd4c9b4fdc` (`0f80375ad29fcbbd70dbce9734c37613d4b80914` plus the reviewed FZF compatibility fix)
- `arashi-docs`: `b656055426b861c03ead10babf98045533c41ae6`
- `arashi-presentation`: `b66b297cf479ad990fc9f3a24f9085643d3ca578`
- `arashi-skills`: `ee17e08b4fce31bb2b3095516f00faf48a437763`
- `arashi-vscode`: `7c2f4c84c27fc16c52862cddf7fec3ba8f3968e7` (`b3a9eb134d3ffeaff2447e7fe824bce78f89a7b0` plus the reviewed maintained-guidance follow-up)

## Test-first and generation evidence

- Initial policy REDs found 188 CLI defects, authored/generated docs failures, 11/16 skills checker failures, 9 presentation examples, and 3 VS Code examples.
- Focused checks turned GREEN in each child. Representative sabotage probes then restored `arashi status`, failed with the expected preferred-command diagnostic, were restored byte-for-byte, and passed again. The coordinated meta sabotage likewise failed at `.agents/skills/arashi/SKILL.md:18`, restored to the same SHA-256, and returned GREEN.
- Owning generators produced deterministic output from unchanged inputs: docs were identical across three runs (SHA-256 `03f38391147aa4a705012f909a48ab3e7e91ae6f133b070dffb5383f0b6c810d`); skills archives were identical across two runs (SHA-256 `669dca3d931724286449d2d4f66c44281250ab8a019687069ccf2922d99abe0e`) and extracted content matched.

## Canonical child validation and review

Independently completed child validations—not the later interrupted rerun—reported:

- CLI: lint had 0 errors (existing warnings only), typecheck/build passed, and 87 unit files passed with 1,249 passed / 9 skipped tests.
- Docs: `pnpm validate` passed, including 16 semantic checkers, Astro check/build, links, accessibility, domain checks, and generated Markdown/LLM exports.
- Presentation: `pnpm run validate` passed, including policy, Prettier, Markdown lint, and Slidev build.
- Skills: security gate passed with 0 findings; source/extracted aggregate passed 16/16; release archive, workflow composition, deterministic archive/extraction, and diff checks passed.
- VS Code: lint/build/package passed; 13 files and 112 tests passed; the generated VSIX was removed.
- Strict OpenSpec, coordinated meta tests/contracts, and `git diff --check` passed in the completed validation record.

## Docs homepage cursor and cadence follow-ups

The homepage cursor drift came from deriving the reveal width from separately maintained `--chars * 1ch` values rather than the rendered command content. Docs head `e03e0db2a6e0fbb7d55ef0408f42ead73265735f` includes the intrinsic-width inline-grid cursor fix and the follow-up commit `fix: normalize homepage typing cadence`. The final implementation derives Unicode-safe step counts and durations from each command at a shared 24 characters per second, replacing the previous 5.95–24.87 cps range; all 8 lines now measure exactly 24 cps. A shared schedule derives each output boundary from command completion, with no output preceding completion and an exact 0.18s completion hold while preserving ordering within the 19.6s cycle.

The focused homepage contract passes all 8 lines, `pnpm validate` passes with 17 semantic checkers, the deterministic build SHA-256 is `73f96c4ceb52866309e6c38a00e484c0b82492dcfecbd22b3de7cf00539b4525`, and `git diff --check` passes. Desktop/mobile sampling measured a 1.877–1.879px cursor gap with zero overlap or overflow; reduced motion has zero animations and hidden cursors. External read-back confirmed docs PR #82 remains open, non-draft, based on `main`, on the expected head branch, and mergeable at that exact clean head; docs quality and redirects succeeded, with expected neutral/skipped Netlify and publish contexts.

Earlier child-scope reviews found and fixed concrete issues: CLI FZF installation now installs both `aw` and compatibility wrapper `arashi`; the skills ATH005 eval allowlist is narrowly anchored to `eval "$(command aw shell init bash|zsh)"` with hostile variants rejected; and archive regressions now cover nested output self-inclusion, unavailable external gzip, safe same-filesystem staging, deterministic Node zlib compression, and temporary-file cleanup. A final cumulative meta review then found that the coordinated gate omitted VS Code runtime-owned user-facing command descriptions and that those committed child sources still contained preferred `arashi` examples. The reviewed VS Code follow-up corrected all eight maintained examples and extended its local policy coverage.

## Bounded meta confirmation

Before the final independent review: strict OpenSpec validation passed; the focused documented-command suite passed 3/3; `pnpm test` passed 7 files / 368 tests; and `pnpm run contracts:check:ci` passed all 6 registered checkers. The aggregate required the canonical extracted skill input, so a 28-member archive and `package-check/` were generated only for that bounded run and removed in a `finally` cleanup. The final review hardened short-option and historical-context matching and added omitted VS Code runtime-owned user-facing sources. After the VS Code follow-up commit, the focused documented-command suite passed 3/3 again. Strict OpenSpec and `git diff --check` also pass, and both temporary paths remain absent.

## Final bounded blocker fix

The final confirmed meta-only blocker cycle used focused TDD. Three new checker cases first failed 3/3 for option-before-command detection, clause-local compatibility exemption, and historical framing. A strengthened unrelated-history fixture then failed separately, proving the previous `history` escape was line-wide. The final focused suite passes 7/7. The checker now detects documented option syntax before known commands (including `arashi --json status`, short options, and analogous placements), exempts only the exact compatibility invocation, and recognizes clause-local historical evidence without exempting unrelated history prose.

The two maintained premise mismatches now consistently describe `aw` being absent while verifying `aw`: the tutorial's PATH recovery lead and the troubleshooting matrix symptom. The concise `arashi` executable compatibility note and established Arashi product/package/configuration identifiers remain intact. Cumulative self-review found no naming-boundary drift and confirmed the actual VS Code child head remains `7c2f4c84c27fc16c52862cddf7fec3ba8f3968e7`.

After the final source edit, `pnpm test` passed 7 files / 372 tests, strict OpenSpec validation passed, and `pnpm run contracts:check:ci` passed all 6 registered checkers against a verified 28-member canonical skills archive. The temporary archive and `package-check/` extraction were removed in `finally` cleanup. Focused Prettier checks and `git diff --check` also passed.

The final meta regression reproduces the dated `Manual Acceptance Outcomes (2026-02-11)` record exactly: a checked npm-install outcome that completed before `arashi --version` returned `1.4.0`. RED diagnosed that result under the prior checker. The minimal GREEN rule is section-, checklist-, clause-, command-, and returned-version-aware. It rejects unchecked/current guidance, a checked imperative, date/version evidence outside the named section, and unrelated completed legacy invocations. The focused suite passes 7/7; the full meta suite passes 7 files / 372 tests; strict OpenSpec, the six-checker aggregate against the verified 28-member canonical skills archive, focused Prettier, and `git diff --check` pass. The temporary archive and `package-check/` extraction were removed.

## Final exact-head review and CI read-back

The five child pull requests remain open, ready for review, and cleanly mergeable at the exact heads above. Every reported check is terminal with the expected result: CLI has 15 successful jobs; docs quality, redirects, and deploy preview succeeded with the expected neutral/skipped contexts; presentation validation and deploy preview succeeded; skills security passed; and all four VS Code CI jobs passed.

The live review-thread read-back is not yet clear enough to complete task 5.6. CLI and VS Code have zero threads, and the sole skills thread is resolved. Docs has one current unresolved PowerShell-continuation checker comment at `b656055426b861c03ead10babf98045533c41ae6`; presentation has one current unresolved `npx --yes` package-runner checker comment at `b66b297cf479ad990fc9f3a24f9085643d3ca578`. Both are exact-head, non-outdated comments. Because child edits are explicitly out of scope for this meta-only closeout, task 5.6 remains unchecked rather than claiming zero unresolved review threads.

## Known baseline exclusion

`pnpm run format:check` has a pre-existing RC 1 on exactly `scripts/check-worktree-materialization-contracts.ts` and `tests/worktree-materialization-contracts.test.ts`. Isolated baseline probes also returned RC 1 for both files. Neither file is changed by #295, so this formatter baseline is explicitly excluded as not introduced here.

## Coordinated pull requests

The child-first branches were pushed normally and the ready-for-review pull requests were opened and cross-linked:

- CLI: https://github.com/corwinm/arashi/pull/147
- Docs: https://github.com/corwinm/arashi-docs/pull/82
- Presentation: https://github.com/corwinm/arashi-presentation/pull/4
- Skills: https://github.com/corwinm/arashi-skills/pull/64
- VS Code: https://github.com/corwinm/arashi-vscode/pull/34
- Parent meta: https://github.com/corwinm/arashi-arashi/pull/309

Every pull request was opened against `main`, is ready for review, and uses the coordinated title. Each child body links all five child pull requests and the parent; the parent body links every child and closes #295. Live exact-head CI and eligible review feedback remain task 5.6 and are not marked complete here.
