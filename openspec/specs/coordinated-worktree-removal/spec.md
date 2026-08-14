# coordinated-worktree-removal Specification

## Purpose
Define safety and reporting contracts for removing configured parent and nested child worktrees so descendants are planned and deregistered before ancestors without creating stale Git metadata.

## Requirements
### Requirement: Configured worktree removal includes nested descendants
When configured worktree removal is enabled, the system SHALL construct an explicit worktree removal plan that closes the selected target set over every removable configured worktree nested beneath a selected ancestor, including descendants on different branches and descendants omitted by an exact path argument. Descendant discovery MUST use the complete configured worktree inventory and normalized path-component ancestry rather than repository configuration order or raw string prefixes. Auto-included descendants SHALL participate in confirmation context, lifecycle target planning, branch-deletion policy, human and JSON operation reporting, and real execution. When `--keep-worktrees` disables worktree removal, the system SHALL preserve existing exact target and branch-action semantics without descendant expansion.

#### Scenario: Parent branch target contains a child on another branch
- **WHEN** configured branch-targeted removal selects a parent worktree that contains a nested child worktree on a different branch
- **THEN** the child worktree and its existing branch action are included in the removal plan
- **AND** the child is not omitted merely because its branch differs from the requested parent branch

#### Scenario: Exact parent path contains nested children
- **WHEN** configured path-targeted removal selects an exact parent worktree path
- **THEN** every removable configured descendant beneath that path is included in the removal plan
- **AND** confirmation and preview identify the expanded target set before mutation

#### Scenario: Deeper nesting is discovered transitively
- **WHEN** a selected ancestor contains multiple levels of configured descendant worktrees
- **THEN** the plan includes every removable descendant level

#### Scenario: Worktree removal is disabled
- **WHEN** configured removal uses `--keep-worktrees`
- **THEN** descendant closure is not applied solely because one selected worktree contains another configured worktree
- **AND** existing branch-only target semantics and the both-keep-flags no-op remain unchanged

### Requirement: Configured worktree removal uses dependency-safe ordering
The system SHALL order every targeted descendant worktree before each targeted ancestor worktree that contains it. Path ancestry MUST use normalized path-component boundaries rather than repository configuration order or raw string prefixes. Unrelated target order SHALL remain deterministic. The same ordered plan SHALL drive confirmation context, lifecycle target planning, human and JSON operation reporting, and real execution.

#### Scenario: Coordinated parent contains child worktrees
- **WHEN** configured removal targets a parent meta-repository worktree and child-repository worktrees nested beneath `<parent>/repos/...`
- **THEN** every nested child `worktree_remove` operation precedes the parent `worktree_remove` operation
- **AND** execution uses that reported order

#### Scenario: Similar sibling path is not a descendant
- **WHEN** configured removal targets unrelated worktree paths whose names share a string prefix but no path-component ancestry
- **THEN** the planner does not create a dependency between those worktrees
- **AND** their order remains deterministic

#### Scenario: Standalone removal is invoked
- **WHEN** removal runs in an implicit standalone workspace
- **THEN** its existing single-repository planning and execution behavior is unchanged

### Requirement: Successful coordinated removal leaves no stale registrations
A successful configured removal SHALL deregister every targeted parent and nested child worktree from its owning Git repository before reporting success. The command SHALL NOT require a subsequent prune to remove metadata created by that successful operation.

#### Scenario: Nested coordinated removal succeeds
- **WHEN** all planned worktree removals succeed
- **THEN** the parent and child worktree directories are absent
- **AND** every owning repository's Git worktree list contains none of the removed paths
- **AND** Git reports no prunable registration caused by the operation

#### Scenario: Existing stale metadata is unrelated
- **WHEN** a repository already contains stale worktree metadata outside the targeted removal plan
- **THEN** removal does not claim to repair that pre-existing metadata
- **AND** existing doctor and prune recovery guidance remains applicable

### Requirement: Descendant failure blocks destructive ancestor removal
The system MUST NOT attempt removal of a targeted ancestor worktree when a failed targeted descendant remains registered beneath that ancestor path. It SHALL record repository/path-attributed failure information for both the failed descendant and each ancestor blocked by that dependency, continue eligible independent removals, preserve post-remove finalization, and return a non-zero result without reporting complete success.

#### Scenario: Child removal fails before parent
- **WHEN** a nested child worktree removal fails
- **THEN** the containing parent worktree removal is not invoked
- **AND** the child and parent paths and owning repositories are identifiable in operation failures
- **AND** both registrations and paths remain available for recovery

#### Scenario: Independent removal remains eligible
- **WHEN** one descendant-to-ancestor chain is blocked and another target has no dependency on that failure
- **THEN** the command continues attempting the independent target
- **AND** the final result preserves successful and failed operation records

#### Scenario: Partial failure is rendered as JSON
- **WHEN** configured removal in JSON mode encounters a descendant failure and blocked ancestor
- **THEN** stdout remains one standard `ok: false` remove envelope
- **AND** existing structured details identify each affected repository, path, operation status, and error
