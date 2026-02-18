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

# Example: stop tmux sessions whose names contain the branch name
if [ -n "$ARASHI_BRANCH_NAME" ] && command -v tmux >/dev/null 2>&1; then
  matching_sessions="$(tmux list-sessions -F '#{session_name}' -f "#{m:*${ARASHI_BRANCH_NAME}*,#{session_name}}" 2>/dev/null || true)"

  if [ -n "$matching_sessions" ]; then
    while IFS= read -r session_name; do
      [ -n "$session_name" ] || continue
      tmux kill-session -t "$session_name" || true
    done <<< "$matching_sessions"
  fi
fi

exit 0
