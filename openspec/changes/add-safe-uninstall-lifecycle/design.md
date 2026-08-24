# Design: Conservative uninstall MVP

## Context

Arashi reaches users through official direct installers, npm-compatible package managers, and manual placement. Current alias metadata proves only part of a direct installation, and a running executable cannot reliably delete every active wrapper in place. A safe MVP must therefore be useful without claiming it can automatically normalize all historical state.

The design favors bounded refusal over a generalized lifecycle platform. It establishes sufficient ownership only for new or refreshed official direct installs, delegates proven package-manager ownership, and leaves everything else untouched.

## Goals

- Provide an obvious official uninstall command and recovery helper on POSIX and Windows.
- Remove only exact state proven by a current direct-install manifest or exact managed shell markers.
- Support dry-run, default-no confirmation, and non-interactive consent.
- Preserve all workspace, repository, worktree, project, configuration, Git, and unrelated user state.
- Keep implementation proportional and rerunnable after partial direct cleanup.

## Non-Goals

- Closed JSON output for uninstall.
- A durable transaction journal, rollback protocol, or public phase vocabulary.
- Automatic legacy/manual ownership adoption.
- Dynamic helper download during uninstall.
- Whole-profile, whole-install-directory, package-root, or heuristic deletion.
- New packaged-skill guidance or exhaustive generated-doc semantic enforcement.

## Installation-channel decision

The coordinator classifies the running installation as:

1. **Confident package-manager ownership** — package-root evidence identifies exactly one supported manager. Execute its exact global removal command after inspection/consent. Never directly unlink package files or shims.
2. **Current official direct ownership** — a valid minimal schema-v2 manifest exists and passes complete preflight. Handoff to the bundled platform helper.
3. **Legacy direct, manual, modified, malformed, or ambiguous** — refuse automatic deletion and print bounded remediation. Legacy direct users may run the current official installer over the same install directory, then retry.

Environment hints may corroborate package ownership but cannot resolve conflicting package-root evidence.

## Minimal schema-v2 manifest

The official installer writes `.arashi-managed-entrypoints.json` only after installing the complete current payload. The closed MVP record contains:

- `schemaVersion: 2`;
- `installationChannel: "official-direct"`;
- `platform`;
- normalized absolute `installDirectory`;
- `files`: ordered records with `relativePath`, `role`, and lowercase SHA-256 `digest`;
- optional `pathMutation`:
  - POSIX: normalized absolute regular profile path plus the exact inserted byte sequence;
  - Windows: exact user-PATH entry spelling and `created: true|false`.

Allowed roles are the current canonical executable/native payload, wrappers for `arashi` and `aw`, bundled platform helper, and any release-owned launcher required by that platform. Unknown fields, duplicate paths/roles, absolute or escaping relative paths, unsupported platforms/channels, malformed hashes, and symlinked/reparse destinations invalidate the manifest.

The ledger is ownership metadata, not a file that authorizes its own directory recursively. The installer never claims pre-existing PATH state: `created: false` is recorded when the entry already existed.

## Direct preflight and apply

The CLI and helper share one planner/validator contract:

1. Resolve only the explicit install directory supplied by the CLI/helper or the deterministic default.
2. Parse and close-validate the manifest.
3. Resolve every listed path beneath the manifest install directory without following symlinks/reparse points.
4. For each listed file:
   - present regular file with matching digest: removable;
   - absent: already removed and safe to skip on a rerun;
   - present with different type or digest: blocker.
5. Inspect only the recorded PATH mutation:
   - exact single owned POSIX byte sequence: removable;
   - absent: already removed;
   - duplicate/changed/unreadable/symlinked profile: preserve and block PATH mutation without authorizing broader edits;
   - Windows `created: false`: always preserve;
   - Windows exact single `created: true` entry: removable.
6. Inspect deterministic supported startup files for exact complete Arashi marker pairs. Malformed or ambiguous marker state blocks shell mutation; no broad scan occurs.
7. Produce one deterministic human plan and the explicit preserved scopes.
8. Apply only after default-no confirmation or `--yes`.

All blockers are discovered before first mutation. Direct apply removes exact managed shell blocks and exact PATH state when safe, then manifest-listed payload files, and removes the manifest last. It never recursively removes the install directory. If interruption leaves some manifest files absent, a rerun skips those exact listed paths and continues validating every remaining present file. The manifest is the sole retained retry authority in the MVP.

This does not promise rollback. It promises complete preflight, narrow mutation, manifest-last cleanup, and safe rerun of partial progress.

## Self-removal and standalone helpers

Each official release contains:

- a POSIX `uninstall.sh` helper;
- a Windows `uninstall.ps1` helper.

The direct CLI copies its already-installed helper to a unique temporary path, passes the exact install directory and parent PID, launches it, and exits. The helper waits for the parent, re-reads and revalidates the local manifest, presents the same plan/consent policy, applies cleanup, and deletes only its temporary copy afterward.

The public documentation site may expose static routes to these release-owned scripts for CLI-unavailable recovery. The scripts themselves remain full local validators and never infer an install directory from PATH or a filesystem scan. The MVP does not download a helper during a normal CLI uninstall and does not claim a mutable route is authenticated by an old release checksum.

## Package-manager delegation

The package wrapper intercepts `uninstall` before first-use native dispatch so removal works even when the native payload is absent. Exact commands are:

- npm: `npm uninstall -g arashi`
- pnpm: `pnpm remove -g arashi`
- Yarn classic global: `yarn global remove arashi`
- Bun: `bun remove -g arashi`
- Vite+: `vp uninstall -g arashi`

Conflicting, unsupported, unavailable, or absent owner evidence produces guidance only. The CLI never tries several managers and never directly deletes package-manager roots or shims.

## Shell-only uninstall

`aw shell uninstall` and `arashi shell uninstall` use the same deterministic supported startup target policy as shell install. They remove exactly one complete canonical begin/end marker range and preserve every byte outside it. Missing markers are a no-op; orphaned, reversed, nested, overlapping, or duplicate markers refuse before writing. Shell-only removal never touches executable files, PATH, manifests, workspaces, or project state.

## CLI behavior

Product and shell-only uninstall support:

- `--dry-run`, `-n`: inspect only, no prompt or mutation;
- `--yes`, `-y`: consent to the already-preflighted human plan.

There is no uninstall `--json` or force option in the MVP. Non-interactive apply requires `--yes`. Human confirmation defaults to no. Syntax and option conflicts precede discovery; discovery and complete preflight precede confirmation and mutation.

## Documentation and generated surfaces

The CLI remains the authority for command discovery, completion, and command contracts. Update generated inventory and release distribution contracts from typed producers. Add concise CLI/public command pages, install/removal guidance, and static hosted script routes. Reuse existing docs generators and validators; do not add a new feature-specific semantic framework or packaged-skill workflow in this MVP.

## Risks and tradeoffs

- Legacy direct users need one official refresh before automatic removal.
- Ambiguous PATH/profile state may be left behind with a warning rather than forcibly edited.
- The MVP cannot roll back every interruption; it relies on manifest-last cleanup and exact-path reruns.
- No JSON output means uninstall automation is intentionally limited to argv, exit status, and human diagnostics.
- A later issue can add richer journaled recovery or agent-readable guidance if real usage justifies it.
