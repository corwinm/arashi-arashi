# Feature Specification: Nested Worktree Paths for Multi-Repo Setup

**Feature Branch**: `016-nested-worktree-paths`  
**Created**: 2026-02-05  
**Status**: Draft  
**Input**: User description: "https://github.com/corwinm/arashi-arashi/issues/55"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Meta-repo Worktree Creation (Priority: P1)

As a developer working with a meta-repo (parent repository with `.arashi` configuration), when I create a new worktree for the meta-repo, the worktree should be created as a sibling to the original meta-repo directory, maintaining the expected flat structure for the parent repository.

**Why this priority**: This is the foundation for the entire multi-repo worktree system. Without correct meta-repo worktree creation, child repo worktrees cannot be properly nested.

**Independent Test**: Can be fully tested by creating a worktree for a meta-repo and verifying the worktree appears as a sibling directory with the correct naming pattern, delivering immediate value for single-repo workflows.

**Acceptance Scenarios**:

1. **Given** a meta-repo at `parent-repo/` with `.arashi/config.json`, **When** user creates a worktree for branch `feature`, **Then** worktree is created at `../parent-repo-feature/` (sibling to parent-repo)
2. **Given** a meta-repo worktree creation command, **When** the worktree is created, **Then** the directory structure matches: `parent-repo/` (original) and `parent-repo-feature/` (worktree) at the same level

---

### User Story 2 - Child Repo Worktree Nested in Parent Worktree (Priority: P1)

As a developer working with a multi-repo setup, when I create worktrees for child repositories, the child worktrees should be automatically placed inside their parent worktree's `repos/` folder, maintaining the same nested directory structure as the original repositories.

**Why this priority**: This is the core functionality that fixes the bug. Without this, child repos break out of the meta-repo structure, preventing proper multi-repo workflows.

**Independent Test**: Can be fully tested by creating worktrees for both a meta-repo and its child repos, then verifying the child worktrees are nested inside the parent worktree's repos folder, matching the original structure.

**Acceptance Scenarios**:

1. **Given** a meta-repo at `parent-repo/` containing child repo at `parent-repo/repos/child-repo/`, **When** user creates worktrees for branch `feature`, **Then** child worktree is created at `parent-repo-feature/repos/child-repo/` (nested inside parent worktree)
2. **Given** a multi-repo worktree creation, **When** both parent and child worktrees are created, **Then** the relative path from parent worktree to child worktree matches the original structure (`repos/child-repo/`)
3. **Given** a child repo worktree creation command, **When** the git worktree add command is executed, **Then** it uses the path `../../../<parent-worktree>/repos/<repo-name>` with the correct branch name

---

### User Story 3 - Preserve Existing Sibling Behavior for Non-Meta-Repos (Priority: P2)

As a developer working with standalone repositories (not part of a meta-repo setup), when I create a worktree, the worktree should continue to be created as a sibling to the original repository, preserving the existing behavior for simple single-repo workflows.

**Why this priority**: Ensures backward compatibility for users not using the multi-repo feature. This prevents breaking existing workflows.

**Independent Test**: Can be fully tested by creating a worktree for a standalone repository (without `.arashi` config or parent meta-repo) and verifying it's created as a sibling, not in a nested structure.

**Acceptance Scenarios**:

1. **Given** a standalone repo at `simple-repo/` without `.arashi` config, **When** user creates a worktree for branch `feature`, **Then** worktree is created at `../simple-repo-feature/` (sibling to original, not nested)
2. **Given** a repository that is not identified as part of a meta-repo structure, **When** worktree creation is invoked, **Then** the behavior matches the original sibling creation pattern

---

### Edge Cases

- What happens when the parent worktree's `repos/` folder doesn't exist yet during child worktree creation?
- How does the system handle deeply nested meta-repo structures (meta-repo containing meta-repos)?
- What happens if a child repo worktree is created before the parent meta-repo worktree exists?
- How does the system distinguish between a meta-repo (parent) and a regular repo when determining worktree path?
- What happens when branch names contain special characters or spaces that affect path construction?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST create meta-repo worktrees as siblings to the original meta-repo directory at path `../<meta-repo-name>-<branch-name>/`
- **FR-002**: System MUST identify child repositories within a meta-repo's `repos/` folder
- **FR-003**: System MUST create child repo worktrees inside the parent worktree's `repos/` folder at path `../../../<parent-worktree>/repos/<repo-name>/`
- **FR-004**: System MUST maintain the relative directory structure between parent and child repos in worktrees (matching original structure)
- **FR-005**: System MUST preserve existing sibling worktree creation behavior for standalone repositories (not part of meta-repo)
- **FR-006**: System MUST detect whether a repository is a meta-repo (has `.arashi` config) or a child repo (located in parent's `repos/` folder)
- **FR-007**: System MUST use the git command `git worktree add ../../../<parent-worktree>/repos/<repo-name> -b <branch-name>` for child repo worktrees
- **FR-008**: System MUST create any necessary parent directories (e.g., `repos/` folder) in the parent worktree before creating child worktrees
- **FR-009**: System MUST correctly calculate worktree paths based on repository type (meta-repo vs. child repo)

### Key Entities

- **Meta-Repo**: A parent repository containing `.arashi/config.json` configuration and a `repos/` folder with child repositories
- **Child Repo**: A repository located inside a meta-repo's `repos/` folder, managed as part of the multi-repo structure
- **Worktree**: A git worktree instance linked to a source repository, with path determined by repository type (meta-repo or child)
- **Repository Path**: The filesystem location of a repository, used to calculate the appropriate worktree destination path

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Child repo worktrees are created inside parent worktree's `repos/` folder 100% of the time for multi-repo setups
- **SC-002**: Meta-repo worktrees are created as siblings to the original meta-repo directory 100% of the time
- **SC-003**: Standalone repository worktrees maintain existing sibling creation behavior without regression
- **SC-004**: Directory structure in worktrees matches the original repository structure (parent-to-child relationship preserved)
- **SC-005**: Users can navigate from parent worktree to child worktree using the same relative path as in the original structure
