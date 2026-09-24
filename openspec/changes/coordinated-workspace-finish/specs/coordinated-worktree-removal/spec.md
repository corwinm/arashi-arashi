## MODIFIED Requirements

### Requirement: Configured worktree removal includes nested descendants
When configured worktree removal is enabled, the system SHALL construct an explicit worktree removal plan that closes the selected target set over every removable configured worktree nested beneath a selected ancestor, including descendants on different branches and descendants omitted by an exact path argument. Descendant discovery MUST use the complete configured worktree inventory and normalized path-component ancestry rather than repository configuration order or raw string prefixes. Auto-included descendants SHALL participate in confirmation context, lifecycle target planning, branch-deletion policy, human and JSON operation reporting, and real execution. When `--keep-worktrees` disables worktree removal, the system SHALL preserve existing exact target and branch-action semantics without descendant expansion.

For finish-originated removal only, the assessed parent plus all of its assessed configured descendants MUST match the final closed removal plan exactly. No unrelated worktree or branch action may enter it. The finish caller MUST NOT weaken the default removal descendant, dirty, confirmation, hook, branch-retention, concurrency or partial-failure protections. Ordinary `remove` without a finish caller retains its existing semantics.

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

#### Scenario: Finish plan includes an unassessed target
- **WHEN** exact-path removal would delete a branch or worktree outside finish's assessed participant set
- **THEN** finish rejects the plan before mutation and reports the difference

### Requirement: Configured worktree removal uses dependency-safe ordering
The system SHALL order every targeted descendant worktree before each targeted ancestor worktree that contains it. Path ancestry MUST use normalized path-component boundaries rather than repository configuration order or raw string prefixes. Unrelated target order SHALL remain deterministic. The same ordered plan SHALL drive confirmation context, lifecycle target planning, human and JSON operation reporting, and real execution. For finish-originated removal the **same accepted plan** SHALL additionally drive finish's preview, post-confirmation and post-hook validation; any mismatch MUST stop before mutation.

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

#### Scenario: Finish plan becomes stale after confirmation
- **WHEN** planned descendants or branch actions change after finish confirmation
- **THEN** no newly discovered action is silently appended to the accepted plan
- **AND** finish-originated removal fails before destructive operations

## ADDED Requirements

### Requirement: Finish-originated removal has a post-hook evidence gate
Configured remove SHALL accept an optional internal finish-specific pre-mutation validation callback, invoked after successful `pre-remove` hooks and after its own post-hook descendant discovery, within the finish-specific coordination barrier, while preserving ordinary remove's existing descendant gate before any detach, worktree removal or local branch deletion. Failure SHALL abort every destructive action and retain the evaluated pre-hook outcomes. Without this callback, ordinary remove SHALL retain its existing discovery, confirmation, dirty checks, hook execution, branch defaults, independent-operation continuation, descendant failure gating, post-remove finalization and JSON/human partial-failure reporting. The callback does not create a new public remove bypass flag.

#### Scenario: Pre-remove changes evidence but not descendants
- **WHEN** a successful pre-remove hook changes a base OID or participant HEAD without introducing an unplanned descendant
- **THEN** the finish-specific gate rejects the stale evidence before removal, despite the ordinary descendant check passing

#### Scenario: Ordinary remove has no finish caller
- **WHEN** `aw remove` runs without finish
- **THEN** no new finish evidence requirement or finish hook is imposed
- **AND** existing partial failure and post-remove behavior is unchanged
