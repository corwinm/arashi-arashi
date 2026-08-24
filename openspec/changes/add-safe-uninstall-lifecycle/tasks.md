## 1. RED: Reduced ownership and command contract

- [ ] 1.1 Add failing tests for the closed minimal manifest: schema/channel/platform, exact file roles/digests, duplicate or escaping paths, unknown fields, symlinks/reparse points, and installer PATH provenance.
- [ ] 1.2 Add failing tests proving present modified files refuse, absent manifest-listed files are rerunnable no-ops, all blockers precede mutation, and the manifest is removed last.
- [ ] 1.3 Add failing wrapper-boundary tests for exact npm, pnpm, Yarn classic, Bun, and Vite+ global removal argv; conflicting/unsupported evidence must refuse without direct deletion.
- [ ] 1.4 Add failing command discovery and option tests for `uninstall` and `shell uninstall` through both executable names with only `--dry-run`/`-n` and `--yes`/`-y`; uninstall JSON and force options remain unsupported.

## 2. RED: Platform helpers and shell removal

- [ ] 2.1 Add failing POSIX helper tests for explicit/default install directory, complete preflight, default-no confirmation, `--dry-run`, `--yes`, modified-file refusal, exact PATH bytes, absent owned files, manifest-last cleanup, parent wait, and temporary self-cleanup.
- [ ] 2.2 Add equivalent PowerShell contract tests for exact user-PATH entry spelling/scope, `created: false` preservation, reparse-point refusal, parent wait, and temporary self-cleanup.
- [ ] 2.3 Add failing shell-only tests for one exact complete managed block, missing no-op, malformed/duplicate/nested/reversed refusal, outside-byte preservation, deterministic targets, and executable/PATH/project preservation.
- [ ] 2.4 Add failing integration tests proving direct product uninstall removes only manifest-owned files, exact safe PATH state, and exact managed blocks while preserving workspaces, repositories, worktrees, `.arashi.yaml`, Git metadata, unrelated profile bytes, and unrelated install-directory files.
- [ ] 2.5 Add failing CLI-unavailable tests that execute the bundled POSIX/PowerShell helper without invoking the installed CLI.

## 3. GREEN: Minimal manifest and installers

- [ ] 3.1 Implement the shared manifest parser, validator, deterministic planner, and manifest-last apply semantics.
- [ ] 3.2 Update `scripts/install.sh` to install the current POSIX payload/helper and atomically write the minimal manifest without claiming pre-existing PATH state.
- [ ] 3.3 Update `scripts/install.ps1` to install the current Windows payload/helper and atomically write equivalent user-PATH provenance.
- [ ] 3.4 Make an official reinstall/refresh replace the complete direct payload and establish schema v2; refuse to adopt unknown pre-existing files or persistent mutations.

## 4. GREEN: Commands, delegation, and helpers

- [ ] 4.1 Register `aw uninstall`/`arashi uninstall` and `aw shell uninstall`/`arashi shell uninstall` with human dry-run/consent behavior and no uninstall JSON mode.
- [ ] 4.2 Intercept package-manager uninstall before native first-use dispatch and delegate exactly once to the proven owner.
- [ ] 4.3 Implement bundled POSIX and PowerShell helpers using the shared manifest contract and explicit/deterministic install-directory lookup only.
- [ ] 4.4 Implement temporary helper staging, parent-PID wait, local manifest revalidation, manifest-last cleanup, and narrow temporary self-removal.
- [ ] 4.5 Implement exact managed shell-block removal and integrate safe exact blocks into direct product removal without scanning arbitrary files.

## 5. Generated contracts, release assets, and proportional docs

- [ ] 5.1 Update typed command discovery/semantics and regenerate CLI command contracts and Bash/Zsh/Fish/PowerShell completion.
- [ ] 5.2 Update executable-distribution, package-release, checksum, and release-archive producers so each platform includes its bundled helper.
- [ ] 5.3 Add concise CLI README/install/command documentation covering channel detection, inspection/consent, exact manager commands, legacy refresh, refusal, helper recovery, and preserved data.
- [ ] 5.4 Add proportional public uninstall and shell-uninstall pages plus static POSIX/PowerShell helper routes using existing docs generation/validation infrastructure.
- [ ] 5.5 Do not add packaged-skill uninstall guidance, uninstall JSON exports, or new feature-specific docs/skills semantic frameworks in this MVP.

## 6. Verification and delivery

- [ ] 6.1 Run focused RED/GREEN suites, full CLI tests, typecheck, lint, formatting, command/completion/distribution freshness, POSIX installer/helper tests, and native Windows installer/helper acceptance.
- [ ] 6.2 Stage only owned files and perform the destructive lifecycle self-review: complete preflight, exact identity, symlink/reparse refusal, package-manager boundary, manifest-last retry, shell/profile byte preservation, user-data preservation, and truthful partial-failure output.
- [ ] 6.3 Run strict OpenSpec validation and an independent scope/spec review against the reduced non-goals before implementation commits.
- [ ] 6.4 Open child PRs, cross-link issue #329 and proposal PR, verify exact-head CI, and merge child-first.
- [ ] 6.5 Archive the OpenSpec change, synchronize canonical capabilities, merge the meta PR last, verify issue closure, and clean the coordinated worktree/branches.
