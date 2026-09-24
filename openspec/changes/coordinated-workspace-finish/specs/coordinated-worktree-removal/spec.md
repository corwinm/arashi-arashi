## MODIFIED Requirements

### Requirement: Configured worktree removal includes nested descendants
When configured worktree removal is enabled, the system SHALL construct an explicit worktree removal plan that closes the selected target set over every removable configured worktree nested beneath a selected ancestor, including descendants on different branches and descendants omitted by an exact path argument. Descendant discovery MUST use the complete configured worktree inventory and normalized path-component ancestry rather than repository configuration order or raw string prefixes. Auto-included descendants SHALL participate in confirmation context, lifecycle target planning, branch-deletion policy, human and JSON operation reporting, and real execution. When `--keep-worktrees` disables worktree removal, the system SHALL preserve existing exact target and branch-action semantics without descendant expansion.

For finish-originated removal only, the assessed parent and configured descendants MUST match the closed worktree, branch and hook-target actions exactly; an unrelated action MUST NOT enter. Finish MUST NOT weaken ordinary remove's descendant, dirty, confirmation, hook, branch or partial-failure protections. Ordinary remove retains its existing behavior without a new lock or finish evidence policy.

#### Scenario: Parent branch target contains a child on another branch
- **WHEN** configured branch-targeted removal selects a parent containing a nested child worktree on a different branch
- **THEN** the child and its existing branch action are included in the removal plan

#### Scenario: Exact parent path contains nested children
- **WHEN** configured path-targeted removal selects an exact parent path
- **THEN** every removable configured descendant is included in confirmation, preview and execution

#### Scenario: Deeper nesting is discovered transitively
- **WHEN** a selected ancestor contains multiple configured descendant levels
- **THEN** the plan includes every removable descendant level

#### Scenario: Worktree removal is disabled
- **WHEN** configured removal uses `--keep-worktrees`
- **THEN** descendant closure is not applied solely because of containment, and existing branch-only/no-op semantics remain

#### Scenario: Finish plan includes an unassessed target
- **WHEN** exact-path removal would delete an unassessed worktree or branch
- **THEN** finish rejects the plan before mutation

### Requirement: Configured worktree removal uses dependency-safe ordering
The system SHALL order every targeted descendant before its ancestor using normalized path-component ancestry, with deterministic unrelated order. The same ordered actions SHALL drive confirmation, lifecycle target planning, reporting and execution. Finish SHALL compare its accepted actions and hook targets to the refreshed remove actions before mutation; mismatch MUST stop finish cleanup. Ordinary remove ordering and behavior are unchanged.

#### Scenario: Coordinated parent contains child worktrees
- **WHEN** removal targets the parent and nested child worktrees
- **THEN** every child `worktree_remove` operation precedes parent `worktree_remove`

#### Scenario: Similar sibling path is not a descendant
- **WHEN** two unrelated paths share a textual prefix but not a path-component ancestor
- **THEN** they have no false dependency

#### Scenario: Standalone removal is invoked
- **WHEN** removal runs in an implicit standalone workspace
- **THEN** existing single-repository behavior is unchanged

#### Scenario: Finish plan becomes stale
- **WHEN** descendants or branch actions change after finish consent
- **THEN** no new action is silently appended to finish's accepted scope before destruction

## ADDED Requirements

### Requirement: Finish-originated removal has a narrow post-hook gate
Configured remove SHALL expose only the minimal internal action/hook-target identities, result statuses and optional finish-only callback necessary for finish's scope comparison and safe reporting; it need not be split into a general pure planner and executor. The callback SHALL run after successful `pre-remove` hooks and existing descendant refresh, before any detach/worktree/branch mutation, and compare accepted finish evidence and exact actions. Failure SHALL abort destructive operations and retain hook outcomes. Ordinary remove SHALL retain discovery, confirmation, dirty checks, hook execution, branch defaults, independent-operation continuation, descendant gating, post-remove finalization and partial-failure semantics. No public bypass flag and no shared lock across remove/create/prune/add/delete is introduced. Concurrent Arashi commands and external Git/filesystem actors can race between gate and mutation; this is not an atomic guarantee.

#### Scenario: Pre-remove changes evidence without changing descendants
- **WHEN** a successful pre-remove hook changes base OID or HEAD
- **THEN** finish's callback rejects stale evidence before removal despite unchanged descendants

#### Scenario: Ordinary remove has no finish caller
- **WHEN** `aw remove` runs without finish
- **THEN** it has no finish evidence gate and retains existing partial-failure behavior
