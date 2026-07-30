## Context

Arashi's shared launcher currently detects Kitty from `KITTY_PID`, `KITTY_WINDOW_ID`, or `TERM`, then tries generic `kitty @ launch` commands and reports `mode: "fallback"`. It neither assigns a stable worktree identity nor inspects live Kitty state, so repeated switch/create launches can create duplicate tabs and cannot participate predictably in Kitty's session UI.

Kitty 0.43 introduced live sessions and session-aware matching. Local verification on macOS with Kitty/kitten 0.48.1 used a dedicated socket-only hidden instance and confirmed that `kitten @ launch --type=tab --cwd <path> --add-to-session <name> --var arashi_worktree_id=<identity> --title <title>` returns a window ID; `kitten @ ls` exposes `cwd`, `session_name`, `title`, and `user_vars`; and `kitten @ focus-window --match var:arashi_worktree_id=^<identity>$` focuses the marked window. The ordinary Hermes shell did not have `kitty`/`kitten` on `PATH`, while the child shell inside Kitty did, so executable absence must remain an explicit error rather than being confused with environment detection.

The shared launcher is used by both `arashi switch` and post-create launch. Post-create launch happens after Git worktree creation and is intentionally non-transactional. Kitty remote control is user-controlled through `allow_remote_control`, password policy, and optional `listen_on`; Arashi must diagnose that prerequisite, not weaken it.

## Goals / Non-Goals

**Goals:**

- Map one canonical worktree path to one stable live Kitty identity.
- Reuse/focus a live marked window and create a session-backed tab only when needed.
- Validate version, remote-control responses, and exact resulting state before success.
- Reconcile bounded query/focus and concurrent-launch races without closing Kitty windows.
- Preserve launcher precedence, argv safety, and post-create partial-success behavior.
- Keep canonical docs and packaged skills aligned with runtime behavior.

**Non-Goals:**

- Persistent `.kitty-session` generation or mutation.
- Restoring a session after Kitty exits.
- Closing Kitty windows or sessions during `arashi remove`.
- Arbitrary layouts, startup commands, or user-defined title templates.
- An explicit `--kitty` option or persistent `kitty` configuration value.
- Remote control configuration changes on the user's behalf.

## Decisions

### 1. Kitty remains an automatic managed context

Synchronous context detection trims `KITTY_PID` and `KITTY_WINDOW_ID` and treats either as evidence only when the result is non-empty; normalized `TERM` exactly equal to `xterm-kitty` is the third positive signal. That environment evidence selects managed Kitty only after automatic tmux, Herdr, cmux, and strictly detected supported IDE handling. It runs before contextual parent-shell `cd` and generic terminal/platform fallback. Executable/version validation is a later asynchronous preflight: once environment detection selects Kitty, missing or unsupported tooling fails closed rather than reclassifying the invocation and allowing `cd` or another launcher to win. Successful managed launch reports `mode: "kitty"`.

Explicit CLI launchers and configured non-auto launch modes remain authoritative. Tmux inside Kitty continues to use tmux. Kitty is not added to persistent launch vocabularies because this slice has no justified outside-Kitty socket-selection workflow.

**Alternative considered:** add `--kitty` and configured `kitty`. Rejected because external instance/socket targeting and credential selection are not designed, and an ephemeral local context does not justify persistent configuration.

### 2. Use `kitten @` and enforce Kitty 0.43+

The managed path resolves `kitten` from the inherited Kitty-child `PATH` first and, on macOS only, from the standard `/Applications/kitty.app/Contents/MacOS/kitten` bundle location second. It invokes `kitten --version` and remote commands as argv arrays. Version output must parse to a semantic Kitty version at least 0.43.0 before state inspection. Missing executables, malformed version output, and older versions produce actionable `LAUNCH_FAILED` detail.

`kitten @` is Kitty's documented remote-control interface. Arashi relies on Kitty's inherited terminal/socket environment and configured permission policy; it does not invent a socket, password, or config rewrite.

**Alternative considered:** retain `kitty @`. Rejected for the managed implementation because `kitten @` is the documented standalone remote-control entry point and cleanly separates remote operations from terminal startup.

### 3. Separate opaque identity from readable session metadata

Because a selected worktree already exists, Arashi resolves its absolute candidate path through filesystem `realpath`, applies the platform path normalizer, and removes a trailing separator except for a filesystem root. That exact canonical absolute path is both the Kitty cwd and the UTF-8 input to SHA-256. Arashi emits a versioned marker such as `arashi-v1-<hex-digest>` and uses the full digest so repositories or branches with similar names cannot collide. The marker is stored as user variable `arashi_worktree_id`.

The Kitty session name and title remain readable and derive from repository name plus branch label. Names, titles, paths, marker assignments, and match expressions are distinct argv values. Matching uses only the fixed-format alphanumeric identity anchored as an exact `var:` expression, never the raw path or readable label.

**Alternative considered:** use the readable session name as identity. Rejected because names can collide and Kitty match values are regular expressions.

### 4. Parse structured state into a narrow internal model

Arashi parses `kitten @ ls` JSON into only the fields it needs: OS-window/tab/window IDs and focus state, `last_focused_at`, `cwd`, `session_name`, `title`, and `user_vars`. Unknown fields are ignored; missing or wrong-typed required fields on a candidate are validation failures. Success requires an exact identity marker and canonical cwd; newly launched windows must also have the requested session name and readable title.

The launcher must not log or retain Kitty's full `env` object. This avoids exposing unrelated environment values while keeping state validation deterministic.

### 5. Serialize reuse/create with a bounded cross-process identity lock

Before inspecting Kitty, Arashi acquires an atomic cross-process lock at `<os-temp>/arashi-kitty-locks/<identity>.lock`. The lock directory contains owner metadata with the full identity, PID, and creation timestamp. Contenders poll for at most 10 seconds. A lock with a live owner PID is never stolen solely because of age; a dead-owner lock may be recovered immediately, and malformed/unverifiable metadata may be recovered only after 30 seconds. Acquisition, metadata creation, stale recovery, and release use filesystem operations without a shell, and release in `finally` removes only the lock still owned by the current invocation.

While holding the lock:

1. Inspect exact marker matches.
2. If exactly one valid match exists, focus it by numeric window ID and re-inspect to verify identity, canonical cwd, and focus. Existing readable title/session metadata is presentation-only: drift does not invalidate the exact identity/cwd match, trigger a duplicate launch, or cause Arashi to rewrite live Kitty metadata.
3. If the sole match closes before focus or validation, re-inspect once. Focus a single replacement match if present; launch once only when the marker is now absent; fail if state is duplicated or continues changing.
4. If no match exists, launch one tab with exact cwd, session, title, and marker. Parse the returned numeric window ID, explicitly focus that ID, and verify the exact returned window in structured state.
5. If inspection before or after launch finds multiple exact matches, fail actionably without launching or closing any Kitty window. The first slice never performs automatic duplicate cleanup.
6. Release the owned lock in `finally`. Lock timeout, unsafe stale recovery, or exhausted state reconciliation fails actionably.

This makes ordinary reuse non-mutating, prevents cooperating Arashi processes from creating duplicate tabs, handles close-between-query-and-focus once, and avoids destructive cleanup of ambiguous pre-existing Kitty state.

**Alternative considered:** launch optimistically and close the current invocation's losing duplicate. Rejected because automatic window closure is unsafe and a cross-process lock prevents cooperating invocations from creating the duplicate in the first place. An in-memory promise map was rejected because separate CLI processes would not share it.

### 6. Managed Kitty failures do not fall through

After Kitty is positively selected, unsupported version, missing `kitten`, denied remote control, malformed JSON, invalid launch ID/state, exhausted race reconciliation, and focus/launch failures produce `LAUNCH_FAILED` with the selected worktree, attempted argv (without secrets), phase, exit status, and useful stderr. Arashi does not silently open an ungrouped tab, a standalone Kitty process, another terminal, or parent-shell `cd`.

A post-create Kitty failure preserves all successfully created worktrees and reports completed creation separately from failed launch, matching the existing shared-launcher boundary.

### 7. Documentation and contract enforcement are coordinated

Canonical docs explain version/remote-control prerequisites, temporary live-session behavior, reuse, troubleshooting, and remove-time non-ownership. Packaged skills carry the same operational guidance. The meta checker compares the key Kitty semantics rather than merely checking that the word “Kitty” appears.

No CLI option/config schema changes are expected. Generated command artifacts are reviewed and regenerated only if the result-mode or semantic metadata surface actually changes.

## Risks / Trade-offs

- **Remote control is disabled by default or denied by password policy** → Fail with the exact remote-control phase and Kitty detail; document safe Kitty configuration choices without editing them automatically.
- **`kitten` is not on `PATH` despite Kitty environment markers** → Report the missing executable and detected context; do not use an unrelated generic fallback.
- **Kitty changes structured `ls` fields** → Parse a narrow versioned contract, ignore unrelated fields, and fail closed when required state cannot be validated.
- **Full Kitty state can contain sensitive environment values** → Never include full state in diagnostics and never log/serialize `env`; retain only the narrow internal projection.
- **Two invocations launch concurrently** → Serialize the complete inspect/focus-or-launch/validate sequence with an atomic identity lock and bounded wait.
- **A process crashes while holding the lock** → Record PID/timestamp metadata, recover dead owners, age-gate malformed locks, and remove only locks owned by the current invocation.
- **Multiple exact marked tabs already exist** → Fail actionably without choosing or closing one; leave cleanup to the user.
- **A window closes during focus/reconciliation** → One bounded re-inspection is allowed; exhausted races fail instead of looping or launching repeatedly.
- **Readable labels can change while identity stays stable** → Treat title/session text as launch-time presentation only; exact identity plus canonical cwd remains authoritative for reuse, and Arashi neither fails nor rewrites the live session solely because readable metadata drifted.
- **Canonical path spelling differs across platforms** → Reuse Arashi's normalized absolute-path conventions and add macOS/Linux/Windows path fixtures where the launcher is testable; hash the canonical representation, not user input.

## Migration Plan

1. Add failing identity/state-parser and launcher state-machine tests before production code.
2. Implement the managed Kitty mode behind strict positive detection while retaining all other launcher branches.
3. Add switch and post-create integration coverage, then update docs/skills and semantic checks.
4. Release as an additive automatic-context improvement. Users on Kitty below 0.43 or without permitted remote control receive actionable failure only when Kitty is positively selected for automatic launch.
5. Rollback is a normal code revert to the prior generic Kitty fallback; no persisted Arashi or Kitty data migration is required.

## Open Questions

None for the first slice. External socket targeting, explicit/configured Kitty selection, persistent session files, and remove-time lifecycle integration require separate proposals.
