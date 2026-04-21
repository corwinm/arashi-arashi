## Why

The VS Code worktree panel currently renders sibling worktrees inconsistently when a child repository has local modifications. A modified child repo can appear visually misaligned with other nested entries, which makes the worktree hierarchy harder to scan and breaks parity with the active worktree presentation.

## What Changes

- Adjust VS Code worktree panel presentation so child repositories remain visually nested under their parent worktree regardless of whether the worktree is current or a sibling.
- Ensure modified-state indicators for child repositories do not break alignment or make a child entry appear like a top-level item.
- Add regression coverage for sibling worktrees that include modified child repositories.

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `vscode-worktree-panel`: refine worktree panel rendering requirements so sibling worktrees and their modified child repositories keep consistent hierarchical alignment.

## Impact

- Affected repo: `repos/arashi-vscode`
- Likely affected areas: `src/worktrees/provider.ts`, `src/worktrees/presentation.ts`, and panel-related tests
- User-visible impact: clearer, consistent worktree hierarchy in the VS Code extension panel
