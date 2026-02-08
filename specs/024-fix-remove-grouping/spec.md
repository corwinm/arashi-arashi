# Feature Specification: Fix Remove Worktree Grouping

**Feature Branch**: `024-fix-remove-grouping`  
**Created**: 2026-02-08  
**Status**: Draft  
**Input**: User description: "Bug: arashi remove doesn't group worktrees if branches names differ"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Accurate Worktree Grouping (Priority: P1)

As a user running the remove workflow, I want related worktrees grouped under their parent even when branch names differ, so I can understand ownership and remove the right set safely.

**Why this priority**: Incorrect grouping leads to accidental deletions and confusion about which worktrees belong together.

**Independent Test**: Can be fully tested by listing or removing worktrees in a workspace with a parent and children using different branch names and verifying grouping is correct.

**Acceptance Scenarios**:

1. **Given** a parent worktree and child worktrees that use different branch names, **When** I view the remove list, **Then** the children appear grouped under the correct parent.
2. **Given** unrelated worktrees with similar branch names, **When** I view the remove list, **Then** they are not grouped together.

---

### User Story 2 - Prunable Missing Worktrees (Priority: P2)

As a user cleaning up worktrees, I want missing worktrees to be marked as prunable instead of dirty, so I can safely remove stale entries.

**Why this priority**: Missing directories are common after manual cleanup; marking them as dirty blocks safe cleanup and causes confusion.

**Independent Test**: Can be fully tested by deleting a worktree directory on disk and verifying the status is prunable and removable.

**Acceptance Scenarios**:

1. **Given** a worktree entry whose directory no longer exists, **When** I view the remove list, **Then** it is labeled as prunable rather than dirty.

---

### Edge Cases

- Parent exists but some child worktree directories are missing.
- Multiple children share the same branch name but belong to different parents.
- A previously removed parent entry remains while children are still present on disk.
- A worktree entry exists with no detectable parent relationship.

### Assumptions

- The remove list has access to a parent-child relationship independent of branch names.
- A missing worktree directory is safe to mark as prunable and does not indicate local modifications.
- Users may create worktrees with automated branch naming conventions.

### Scope

- In scope: grouping display and status labeling for worktrees in the remove workflow.
- Out of scope: changing how worktrees are created or altering branch naming conventions.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST group related worktrees under their parent regardless of branch name differences.
- **FR-002**: System MUST keep unrelated worktrees ungrouped even if branch names are similar.
- **FR-003**: System MUST label worktree entries whose directories are missing as prunable.
- **FR-004**: System MUST avoid marking remaining child worktrees as dirty solely because a parent entry was removed.
- **FR-005**: Users MUST be able to remove a parent entry and see the expected status of its children in the same session.

### Acceptance Criteria

- **AC-001**: Given a parent and child worktrees with different branch names, the remove list groups the children under the correct parent.
- **AC-002**: Given unrelated worktrees with similar branch names, the remove list keeps them in separate groups.
- **AC-003**: Given a worktree entry whose directory is missing, the remove list labels it prunable.
- **AC-004**: After removing a parent entry, remaining child entries are not labeled dirty unless they have actual uncommitted changes.
- **AC-005**: In a single remove session, users can remove a parent entry and still view accurate statuses for its children.

### Key Entities

- **Worktree Entry**: A listed workspace instance with a path, branch label, and status (present, missing, prunable, or dirty).
- **Parent Relationship**: A link that associates child worktree entries to a parent entry regardless of branch naming.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In all acceptance scenarios, related worktrees appear grouped under the correct parent without relying on branch name similarity.
- **SC-002**: Missing worktree directories are labeled prunable in 100% of observed cases.
- **SC-003**: Users complete a parent-plus-children removal workflow without any entries being misclassified as dirty in 95% of trials.
- **SC-004**: Support requests related to incorrect worktree grouping or misclassified dirty entries drop by 50% within one release cycle.
