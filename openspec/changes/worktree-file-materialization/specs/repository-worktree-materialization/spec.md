## ADDED Requirements

### Requirement: Repository configuration declares same-path materialization
Configured repository entries SHALL accept optional direct `copy: string[]` and `symlink: string[]` fields. Each entry SHALL identify one repository-relative path used unchanged for the canonical source checkout and new worktree destination. Normalization, persistence, and the generated JSON Schema MUST preserve declared array order and MUST NOT introduce remapping, globs, interpolation, required flags, per-entry modes, hard links, junctions, or fallback actions.

#### Scenario: Valid repository materialization configuration
- **WHEN** a repository entry declares `copy: [".env", "config/local.json"]` and `symlink: [".turbo"]`
- **THEN** typed loading, normalization, persistence, and generated schema retain those direct fields and ordered strings
- **AND** no additional nesting or source/destination mapping is required

#### Scenario: Existing configuration omits materialization
- **WHEN** a valid workspace has no `copy` or `symlink` fields
- **THEN** loading, create, dry-run, doctor, and persistence preserve existing observable behavior

#### Scenario: Invalid value type
- **WHEN** either field or one of its entries is not the required array-of-strings shape
- **THEN** configuration validation fails before repository discovery, hook discovery, Git mutation, or filesystem mutation

### Requirement: Materialization paths validate portably and fail closed
Every configured materialization path MUST be a non-empty relative path. Validation SHALL reject NUL, POSIX or Windows absolute/rooted forms, drive or UNC forms, any `..` segment, a normalized empty result, colon/NTFS alternate-stream syntax, any component ending in dot or space, and case-insensitive Windows reserved device components `CON`, `PRN`, `AUX`, `NUL`, `COM1` through `COM9`, or `LPT1` through `LPT9` with or without an extension. Validation SHALL treat `/` and `\` as separators, normalize Unicode to NFC, and case-fold for portable collision analysis; it SHALL reject duplicate normalized/collision-equivalent paths within either array and across `copy` and `symlink` before create mutation.

#### Scenario: Unsafe path forms are rejected
- **WHEN** configuration contains an empty path, absolute path, drive/UNC path, traversal segment, or normalized empty path
- **THEN** validation reports the owning repository, field, entry, and reason
- **AND** create performs no hook, Git, directory, file, or link mutation

#### Scenario: Normalized duplicate is rejected
- **WHEN** one array contains separator- or dot-normalization-equivalent entries
- **THEN** validation reports a duplicate rather than applying the path twice

#### Scenario: Copy and symlink collide
- **WHEN** normalized equivalents appear in both arrays
- **THEN** validation reports a cross-action collision before mutation
- **AND** does not choose an action by declaration order

#### Scenario: Windows alias forms are rejected portably
- **WHEN** a path uses an NTFS alternate stream, trailing dot/space, reserved device component, or differs from another entry only by case
- **THEN** validation rejects the unsafe form or collision on every host
- **AND** native Windows acceptance proves the same configuration cannot alias one destination

### Requirement: Canonical source and destination identities remain explicit
For each configured child repository, Arashi SHALL resolve materialization sources from that repository's Git primary non-bare checkout discovered from worktree metadata, not by joining the configuration root or execution root and not from the caller's active linked worktree. Destinations SHALL resolve beneath that repository's newly created worktree at the identical normalized relative path. A bare repository or other configuration with no usable non-bare primary checkout when a non-empty policy must be evaluated SHALL produce an actionable failure.

#### Scenario: Create runs from a coordinated feature worktree
- **WHEN** configured create is invoked from a linked coordinated worktree
- **THEN** materialization reads the source path from the canonical configured child checkout
- **AND** writes only beneath the newly created child worktree

#### Scenario: Configuration is loaded from a linked non-bare worktree
- **WHEN** the active configuration root and configured child paths belong to a coordinated feature worktree
- **THEN** Arashi resolves each child's Git primary checkout independently from repository worktree metadata
- **AND** does not treat the active configured child path as the source

#### Scenario: Canonical source checkout is unusable
- **WHEN** a selected repository has configured entries but no usable canonical source checkout
- **THEN** create or doctor identifies that repository and source-checkout problem
- **AND** does not substitute the active linked worktree or an external path

### Requirement: Create preflights materialization without mutation
Configured create SHALL build ordered materialization plans for every selected repository in the command layer before managed-ignore reconciliation, workspace `pre-create`, Git mutation, or any other create mutation. Using each repository's immutable planned target OID, preflight SHALL inspect the target Git tree for each configured destination and ancestor path so a tracked file, directory, or link that `git worktree add` would materialize is a blocking destination conflict before mutation. Missing sources SHALL be visible non-blocking skips. Discoverable existing or target-tree destinations, unsafe destination ancestors, unusable source checkouts, operational inspection failures, and determinably unsupported symbolic-link capability SHALL block before mutation. Dry-run SHALL emit the same ordered plan without hooks, Git changes, managed-ignore changes, filesystem changes, or mutating capability probes.

#### Scenario: Optional source is missing
- **WHEN** a configured source path does not exist
- **THEN** preflight records a visible `skipped` outcome for its action and relative path
- **AND** other valid entries remain eligible

#### Scenario: Existing destination is discoverable
- **WHEN** the planned destination already exists as a file, directory, symbolic link, or junction
- **THEN** preflight records a blocking no-overwrite failure
- **AND** create performs no mutation

#### Scenario: Target Git tree will materialize the destination
- **WHEN** the immutable planned target tree contains a configured destination or an incompatible ancestor even though the not-yet-created worktree path is absent
- **THEN** preflight records a blocking destination conflict before managed-ignore or Git mutation
- **AND** does not wait for `git worktree add` to expose the collision

#### Scenario: Blocker precedes managed-ignore reconciliation
- **WHEN** complete materialization preflight finds a blocking source, destination, containment, or capability problem
- **THEN** create performs no managed-ignore inspection-apply write or preference mutation
- **AND** reports no later hook, branch, worktree, directory, file, or link mutation

#### Scenario: Dry-run previews materialization
- **WHEN** configured create runs with `--dry-run`
- **THEN** human or JSON output lists copy entries followed by symlink entries with planned skip/block/action state
- **AND** no directory, file, link, hook, branch, or worktree is created or changed

#### Scenario: Inspection fails operationally
- **WHEN** source or destination inspection fails for a reason other than expected absence
- **THEN** Arashi preserves the operational failure classification
- **AND** does not relabel it as a missing optional source

### Requirement: Materialization has a deterministic lifecycle boundary
For each selected configured repository, Arashi SHALL apply declared copy entries in array order and then symlink entries in array order after Git creates the worktree and repository `pre-create` completes, but before repository `post-create`. Arashi SHALL refresh source, destination, containment, and capability checks immediately before mutation. `--no-hooks` SHALL disable hooks only and SHALL NOT disable declarative materialization.

#### Scenario: Post-create consumes a materialized file
- **WHEN** repository `pre-create` succeeds and configured materialization succeeds
- **THEN** repository `post-create` observes all copied and linked destinations

#### Scenario: Hooks are disabled
- **WHEN** configured create uses `--no-hooks` with materialization entries
- **THEN** no create hook is discovered or executed
- **AND** copy and symlink entries are still planned and applied

#### Scenario: State changes after preflight
- **WHEN** a hook or concurrent process changes a source or destination after command preflight
- **THEN** the refreshed check skips a newly missing source or fails a new conflict safely
- **AND** Arashi never overwrites the changed destination

### Requirement: Copy creates independent contained state
`copy` SHALL use native filesystem APIs to copy regular files and directories without shell command composition or outputting content. It SHALL create missing destination parents safely and exclusively. Source symbolic links at any copied path SHALL be dereferenced only when their resolved targets remain inside the canonical source checkout. The recursive walker MUST detect a canonical directory identity already on its active recursion stack and fail with `source_cycle`; broken, cyclic, or escaping source links MUST fail rather than recurse indefinitely, import an external source, or create a misdirected destination link.

#### Scenario: File and directory are copied
- **WHEN** configured copy sources contain a file and a nested directory
- **THEN** the destination worktree receives independent files at identical relative paths
- **AND** later destination mutation does not mutate canonical source content

#### Scenario: Paths contain spaces and metacharacters
- **WHEN** a valid configured relative path contains spaces or shell metacharacters
- **THEN** native filesystem APIs materialize the exact path once
- **AND** no path content is evaluated as a command

#### Scenario: Contained source link is copied
- **WHEN** a copied source link resolves within the canonical source checkout
- **THEN** its resolved file or directory content is copied as independent destination state

#### Scenario: Source link escapes or is broken
- **WHEN** a configured copy path or descendant source link is broken or resolves outside the canonical checkout
- **THEN** copy fails with a bounded source-containment diagnostic
- **AND** no external content is copied

#### Scenario: Source link forms a cycle
- **WHEN** a source link points to itself or to an ancestor directory in the active recursive copy
- **THEN** copy fails with reason `source_cycle` before unbounded recursion
- **AND** rollback removes only invocation-owned partial destinations while preserving the source tree

### Requirement: Symlink creates only the requested native link type
`symlink` SHALL create a native symbolic link at the identical relative destination targeting the absolute canonical source path. The source MUST resolve to an existing file or directory at execution. Arashi SHALL select the matching native file/directory link kind, SHALL never request a Windows junction, and SHALL never fall back to copy, hard link, or another link type when privilege, filesystem, or platform policy rejects symbolic links.

#### Scenario: File or directory link succeeds
- **WHEN** native symbolic links are available for the source kind
- **THEN** the destination is a symbolic link whose target is the exact canonical source path

#### Scenario: Symbolic links are unavailable
- **WHEN** the current privilege, policy, or filesystem cannot create the requested symbolic link
- **THEN** create fails with actionable platform guidance
- **AND** no copy, hard link, or junction is created

#### Scenario: Source disappears before execution
- **WHEN** a source that existed at preflight is absent at refreshed execution inspection
- **THEN** the entry is visibly skipped
- **AND** no broken destination link is created

### Requirement: Destinations cannot escape or be overwritten
Before each mutation Arashi SHALL verify that the normalized destination remains beneath the new worktree and that every existing ancestor beneath the worktree is a real directory rather than a symlink, junction/reparse-point equivalent, or non-directory object. Destination and parent creation MUST use no-overwrite semantics. Arashi MUST NOT follow an existing destination link during apply or cleanup.

#### Scenario: Existing ancestor is a symbolic link
- **WHEN** an existing destination ancestor redirects outside or elsewhere inside the worktree
- **THEN** materialization fails before writing through that ancestor

#### Scenario: Destination appears during execution
- **WHEN** another process creates the destination after preflight
- **THEN** exclusive creation fails without overwriting or removing that object

#### Scenario: Nested parents are absent
- **WHEN** a safe destination requires missing nested parents
- **THEN** Arashi creates only the required directories beneath the worktree
- **AND** records invocation ownership for rollback

### Requirement: Materialization outcomes are deterministic and bounded
Each selected repository SHALL retain materialization outcomes in copy-then-symlink declaration order. Executed status values SHALL be `copied`, `linked`, `skipped`, `failed`, or `rolled-back`; dry-run SHALL distinguish planned action, skip, and blocker without claiming execution. Each public record SHALL identify repository, action, normalized relative path, status, and stable reason where applicable, and MUST NOT include file contents, hashes, environment values, or source data.

#### Scenario: Mixed repository outcome
- **WHEN** one source is copied, one is missing, and one later action fails
- **THEN** the repository ledger preserves the exact configured order and statuses
- **AND** command-level partial failure preserves prior repository results

#### Scenario: JSON mode is used
- **WHEN** configured create succeeds or fails with `--json`
- **THEN** stdout remains exactly one structured document
- **AND** repository results or error details expose the same bounded materialization ledgers as human output

### Requirement: Rollback removes only invocation-owned destinations
Materialization SHALL maintain an invocation ledger for every created parent directory, directory, file, and link object. On a partial materialization failure, ledger cleanup SHALL process owned objects in reverse order, remove link objects without following targets, remove parent directories only when created by the invocation and empty, preserve objects that predated exclusive destination creation, and update successful outcome statuses to `rolled-back` only after confirmed removal. If the overall create rollback removes a newly created worktree, that entire worktree remains the existing invocation-owned Git rollback boundary and objects concurrently introduced inside it are not promised preservation. Rollback failures SHALL be reported alongside the initiating failure.

#### Scenario: Recursive copy fails partway
- **WHEN** an error occurs after some destination objects were created
- **THEN** rollback removes only ledgered objects from that invocation
- **AND** preserves the canonical source and all pre-existing destination state

#### Scenario: Post-create fails
- **WHEN** repository or workspace `post-create` fails after materialization
- **THEN** existing create rollback removes the failed invocation's worktree/materialized destinations
- **AND** canonical copy sources and symlink targets remain unchanged

#### Scenario: Cleanup encounters a link
- **WHEN** rollback or ordinary coordinated removal deletes a worktree containing a configured symbolic link
- **THEN** it removes the destination link object without traversing or deleting its target

### Requirement: Native acceptance covers materialization safety
The CLI repository SHALL run real filesystem and built-CLI acceptance on native macOS, Linux, and Windows for configured materialization. Coverage MUST be authored and wired into each native CI path before production implementation. It MUST include files, directories, spaces/metacharacters, nested parents, missing sources, existing destinations, duplicates/case and Windows alias collisions, source/destination link escapes, broken/misdirected/cyclic links, unavailable symbolic-link capability, `--no-hooks`, lifecycle order, dry-run, JSON isolation, multi-repository partial failure, rollback, and ordinary removal target safety.

#### Scenario: Native platform matrix runs
- **WHEN** pull-request validation executes on supported operating systems
- **THEN** native filesystem behavior proves copy, link, failure, and cleanup contracts
- **AND** injected platform flags alone are not treated as Windows acceptance

#### Scenario: Sabotage proves regression coverage
- **WHEN** the materialization lifecycle or no-overwrite guard is temporarily restored to pre-feature behavior
- **THEN** the focused regression tests fail for the intended missing contract
