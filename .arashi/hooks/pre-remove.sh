#!/usr/bin/env bash
# Pre-Remove Hook Example
#
# This hook runs BEFORE remove operations start.
# Use it to stop related services/sessions or validate removal preconditions.
#
# Environment variables:
#   ARASHI_HOOK_NAME                  - Hook name (`pre-remove`)
#   ARASHI_MAIN_REPO_PATH             - Workspace root path
#   ARASHI_BRANCH_NAME                - Primary target branch (if available)
#   ARASHI_WORKTREE_PATH              - Primary target worktree path (if available)
#   ARASHI_REMOVE_TARGET_BRANCHES     - Comma-separated target branches
#   ARASHI_REMOVE_TARGET_WORKTREES    - Comma-separated target worktree paths
#   ARASHI_REMOVE_TARGET_REPOSITORIES - Comma-separated target repositories
#
# Exit codes:
#   0 - Success, continue removal
#   Non-zero - Abort remove command before destructive operations

set -e

echo "Pre-remove hook: preparing to remove worktrees"

# Example: stop tmux sessions whose names contain the branch name or worktree name.
# tmux/sesh flows commonly derive the session name from the worktree directory,
# which may not include the full git branch (for example, feat/status-fetch -> status-fetch).
if command -v tmux >/dev/null 2>&1; then
  worktree_name=""
  if [ -n "$ARASHI_WORKTREE_PATH" ]; then
    worktree_name="$(basename "$ARASHI_WORKTREE_PATH")"
  fi

  while IFS= read -r session_name; do
    [ -n "$session_name" ] || continue

    if { [ -n "$ARASHI_BRANCH_NAME" ] && [[ "$session_name" == *"$ARASHI_BRANCH_NAME"* ]]; } ||
      { [ -n "$worktree_name" ] && [[ "$session_name" == *"$worktree_name"* ]]; }; then
      tmux kill-session -t "$session_name" || true
    fi
  done < <(tmux list-sessions -F '#{session_name}' 2>/dev/null || true)
fi

exit 0
