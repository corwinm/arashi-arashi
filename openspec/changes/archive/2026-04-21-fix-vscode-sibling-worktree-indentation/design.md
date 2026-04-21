## Context

The Arashi VS Code extension builds a tree view that groups top-level worktrees and nests related child repositories underneath each worktree. The reported bug is that a modified child repository in a sibling worktree appears to lose the expected indentation, which points to a VS Code tree-item formatting or layout issue rather than a discovery issue.

The underlying worktree grouping logic already models parent worktrees and child repositories separately, so the fix should preserve existing command wiring, worktree grouping, and status text while making the visual hierarchy stable.

## Goals / Non-Goals

**Goals:**
- Keep child repositories visually nested under their parent worktree for both current and sibling worktrees.
- Preserve modified-state information without making a child entry appear like a top-level item.
- Add regression tests that cover sibling worktrees with modified child repositories.

**Non-Goals:**
- Redesign the overall worktree panel information architecture.
- Change CLI JSON contracts or worktree discovery behavior.
- Introduce new icons, assets, or external dependencies.

## Decisions

### Treat this as a VS Code tree-item formatting issue first
Implementation should start by inspecting the TreeItem fields that affect how VS Code lays out nested repository entries, especially the interaction between label, description, tooltip, and icon metadata for modified child repositories. The fix should target whichever presentation detail causes VS Code to render a modified child entry as if it were not nested.

**Rationale:** The issue report describes missing indentation specifically, and the current grouping model already preserves parent-child relationships. That makes a formatting problem in VS Code's rendering path more likely than a problem with worktree discovery.

**Alternative considered:** Change icon choices first. Icons may still contribute to the final appearance, but the reported symptom is whitespace and indentation, so the design should not assume icon changes are the primary fix before the formatting issue is confirmed.

### Limit the change to presentation-layer code
The implementation should stay in `src/worktrees/provider.ts` and the related presentation tests unless a failing test proves the grouping model is also incorrect.

**Rationale:** The issue report describes inconsistent alignment, and the existing presentation/grouping code already tracks child repositories separately from top-level worktrees. A small presentation-focused fix in the VS Code-facing rendering layer reduces risk.

**Alternative considered:** Rework worktree grouping or add new metadata from the CLI. This would increase scope without strong evidence that discovery is the root cause.

### Add regression coverage at the tree rendering boundary
Tests should verify that sibling worktrees with modified child repositories still render nested child items and preserve the expected indentation and formatting in the tree.

**Rationale:** The bug is user-visible in the tree view, so coverage should exercise the rendered panel model rather than only lower-level string helpers.

## Risks / Trade-offs

- **Formatting behavior may be hard to reproduce outside VS Code** → Add focused tests around the rendered tree-item model and manually verify the panel in VS Code if needed.
- **Root cause may be broader than a single TreeItem field** → Inspect label, description, tooltip, and icon-related metadata together before widening the change.
- **Theme-specific rendering differences may remain** → Prefer minimal, standard TreeItem configuration so the panel relies on VS Code defaults as much as possible.

## Migration Plan

- No data migration is required.
- Ship as a normal extension update.
- If the visual result regresses, revert the presentation-layer formatting change and restore the previous node rendering behavior.

## Open Questions

- Confirm during implementation which TreeItem property or combination of properties triggers the indentation problem in VS Code.
