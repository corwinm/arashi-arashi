## Decisions

### Keep personal state separate

The user document requires `version: "1.0.0"`, recommends `https://unpkg.com/arashi/schema/user-config.schema.json`, and accepts only `defaults`, `worktreesDir`, and `worktreeNaming`. Repository definitions, groups, base branches, hooks, and materialization remain workspace-owned. Loading and inspection never persist merged values, so `init` and `configure` cannot copy personal choices into tracked configuration.

### Merge authored leaves before built-ins

Resolution is explicit CLI, authored workspace leaf, user leaf, then mode-specific built-in. Create/switch/editor subtrees merge independently and `false`/`"none"` are values rather than absence. Workspace `worktreesDir` authorship is tracked separately because legacy workspace normalization materializes its compatibility fallback; this prevents that fallback from hiding a user value.

### Anchor user paths at the primary root

Relative user worktree directories resolve to an absolute base at the Git primary workspace/repository root. The resolved absolute base is passed into create planning so main and linked invocations cannot drift with their current directory. An absolute user directory is a shared root and receives `<sanitized-main-root-basename>-<first-8-sha256(canonical-main-root)>`. The name is readable while the path digest separates unrelated repositories with identical names.

Naming and location apply prospectively. List, switch, remove, prune, and other lifecycle discovery continue to trust `git worktree list`, so preference changes neither relocate nor hide existing worktrees.

### Align standalone bootstrap and ignore safety

`init --zero-config` creates the effective user/built-in directory. If it is within the repository, it appends and verifies the effective repository-relative directory rule; if external, no ignore mutation is necessary. Standalone create checks the same effective base and naming policy. User settings remain in-memory and no workspace config is created.

### Add a dedicated inspection surface

`aw config effective` is a new read-only command group rather than another meaning for interactive `aw configure`. Human and JSON forms report mode, roots, files, and supported leaf values/sources. Inspection-only options demonstrate CLI provenance without writing files.

### Preserve editor integration

The VS Code extension already invokes `aw create ... --editor-host vscode`; the CLI loads the user file for that invocation and retains editor-specific selection rules. Watching or parsing the user file in the extension would duplicate CLI resolution and is unnecessary.

## Risks

- Legacy normalized workspace defaults could mask user values: carry explicit `worktreesDir` authorship from the source document.
- Shared absolute roots could collide: qualify by readable repository name plus a canonical-path digest.
- A custom in-repository standalone root could leak into Git status: derive, append, and verify its directory ignore rule transactionally.
- Tests could inherit a developer's real user file: integration fixtures set isolated `HOME` values where personal resolution is exercised; the validation suite runs with no repository user file assumed.

## Review follow-up

- In-repo configuration is the primary shared project policy. The separate home-directory configuration is an optional extra that supplies only unset personal fields; command-line options still take highest priority.
- Legacy version migration preserves an omitted worktree directory in the persisted document, including across repeated invocations.
- Standalone bootstrap, discovery, and doctor share effective-root ignore applicability. External roots require no Git ignore rule.
- Bootstrap records each newly created directory and rolls back empty ancestors without removing pre-existing parents.
- Companion create references and semantic checks describe optional standalone naming and full-path budget rejection without configured-mode shortening. Diagnostics use effective roots and exact planned destinations rather than fixed-layout inference.
- Workspace editing loads preserve omitted personal fields; add, clone, pull, and preference-only init resolve personal ignore inputs separately from the state they persist. Neither normalized built-ins nor merged user values become authored project settings through unrelated mutations.
- A personal worktree base cannot equal the primary checkout in either mode. Literal standalone ignore patterns escape metacharacters, and lifecycle JSON metadata reports the effective base consistently.
