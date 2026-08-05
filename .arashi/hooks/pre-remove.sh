#!/usr/bin/env bash
# Stop tmux sessions containing panes rooted at exact worktree targets.
# This hook is intentionally idempotent because configured workspace hooks run
# once per target repository during remove.
set -euo pipefail

if ! command -v tmux >/dev/null 2>&1 || [[ -z "${ARASHI_REMOVE_TARGETS_JSON:-}" ]]; then
  exit 0
fi

target_paths=()
while IFS= read -r -d '' target_path; do
  target_paths+=("$target_path")
done < <(
  # JavaScript template expression; shell expansion is intentionally disabled.
  # shellcheck disable=SC2016
  node -e '
    const targets = JSON.parse(process.env.ARASHI_REMOVE_TARGETS_JSON ?? "[]");
    for (const target of targets) {
      if (typeof target.worktreePath === "string") process.stdout.write(`${target.worktreePath}\0`);
    }
  '
)

((${#target_paths[@]} > 0)) || exit 0

while IFS=$'\t' read -r session_id pane_path; do
  [[ -n "$session_id" && -n "$pane_path" ]] || continue
  for target_path in "${target_paths[@]}"; do
    if [[ "$pane_path" == "$target_path" ]]; then
      tmux kill-session -t "$session_id" 2>/dev/null || true
      break
    fi
  done
done < <(tmux list-panes -a -F $'#{session_id}\t#{pane_current_path}' 2>/dev/null || true)
