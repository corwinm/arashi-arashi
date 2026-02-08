# Phase 0 Research: Fix Remove Worktree Grouping

## Decision 1: Group by parent-child relationship (not branch name)
- Decision: Derive grouping keys from worktree parent/child relationships based on nested worktree path rules and repository type detection, not branch name similarity.
- Rationale: `remove` currently groups by branch name only, which mis-associates worktrees with different branches. Existing worktree path calculation and repository type detection already encode parent-child structure and can be reused for stable grouping.
- Alternatives considered: Keep branch-name grouping with heuristic exceptions; rejected because it fails when parent/child branches differ and can falsely group unrelated worktrees.

## Decision 2: Mark missing worktree directories as prunable
- Decision: Treat missing worktree directories as `prunable` and avoid marking them `dirty` solely due to filesystem errors.
- Rationale: `getDirtyStatus()` currently treats errors as dirty; missing directories are common after manual cleanup and should be safe to remove. Using filesystem existence checks aligns with spec requirements and avoids false positives.
- Alternatives considered: Keep `dirty` on any error; rejected because it blocks safe cleanup and violates acceptance criteria.

## Decision 3: Preserve child status after parent removal
- Decision: Calculate child status based on its own path and git status, independent of parent entry presence, and re-run status on remaining entries in-session.
- Rationale: After parent removal, child entries should not be flagged dirty unless they have actual changes. The remove flow already supports re-listing and status evaluation; ensure it does not depend on parent existence.
- Alternatives considered: Mark children dirty when parent missing; rejected because it conflates hierarchy with working tree cleanliness.

## Decision 4: Follow existing CLI conventions for prompts and output
- Decision: Keep remove flow aligned with existing patterns for commander options, prompts via `lib/prompts`, and output formatting via `lib/logger`.
- Rationale: The CLI has consistent patterns for user prompts, JSON output, and error handling across commands. Using the same conventions reduces risk and aligns with user expectations.
- Alternatives considered: Introduce custom prompt/output handling in remove; rejected to avoid diverging from existing CLI UX patterns.
