## Context

Arashi already exposes most of the raw signals needed for workspace diagnosis, but they live behind separate command flows:

- `status` checks repository presence, dirty state, branch tracking, and default-branch drift.
- `prune --dry-run` discovers Git-prunable worktree metadata.
- `clone`, `setup`, `shell`, `install`, and `update` each contain targeted recovery or environment checks.
- Hook validation exists in command-specific paths such as remove/create hook previews rather than a single health surface.

`doctor` should compose these signals into a single read-only diagnostic command. It should be safer than asking users or agents to run mutating recovery commands just to understand the workspace state.

## Goals / Non-Goals

**Goals:**

- Provide a non-mutating CLI command that can be run early in troubleshooting.
- Produce stable finding codes and severities that tests, docs, agents, and future UI surfaces can reference.
- Reuse existing config, status, pruning, shell, hook, and install/update helper code where practical instead of adding separate Git/config parsers.
- Keep JSON mode aligned with Arashi's existing envelope and stdout-isolation contract.
- Document practical fix commands alongside findings.

**Non-Goals:**

- Automatically repair workspace state; suggested commands are informational unless a future explicit `--fix` proposal is accepted.
- Replace detailed command output from `status`, `prune`, `shell`, `setup`, or `update`.
- Contact remote services more broadly than existing status/update-style checks already do; implementation should keep remote checks bounded and resilient.
- Guarantee shell integration detection in every shell/terminal; unknown status should be informational rather than a failure.

## Decisions

### Model diagnostics as findings

Represent every diagnostic as a finding with a stable `code`, `severity`, `category`, `scope`, `message`, optional `details`, and zero or more `suggestedCommands`.

Rationale: findings let human output group by severity/category while JSON consumers can make decisions without scraping prose. Stable codes also make tests less brittle than matching full text.

Alternative considered: print a command-specific checklist only. That is simpler for humans, but not sufficient for agents and future integrations.

### Treat blocking findings as the exit-code boundary

Use severities such as `error`, `warning`, and `info`. The command exits non-zero when at least one `error` finding exists or a required diagnostic phase cannot run. Warnings and informational hints should not make the command fail.

Rationale: this matches the issue's requirement for non-zero blocking health failures while allowing useful warnings such as dirty worktrees or missing shell integration hints without making every advisory state fail.

Alternative considered: fail on any non-clean finding. That would make the command noisy for common non-blocking states such as local changes.

### Compose existing checkers behind a doctor runner

Add a `commands/doctor.ts` command backed by a reusable diagnostic runner (for example `lib/doctor.ts` or `core/doctor.ts`). The runner should call existing helpers where possible:

- Workspace/config discovery from `findWorkspaceRoot`, `loadConfig`, and config validation errors.
- Repository health from the status command's parsing/status helpers, refactored/exported only as needed.
- Stale worktree metadata from prune/remove discovery helpers.
- Hook file validation from hook-resolution utilities or a shared validation helper.
- Shell integration and install/update hints from existing shell/update detection helpers where those checks are safely detectable.

Rationale: doctor must agree with the commands it recommends. Shared helpers reduce drift between `doctor`, `status`, and `prune`.

Alternative considered: implement all checks independently inside the command. That is faster initially but risks inconsistent behavior and duplicated Git edge cases.

### Keep the first implementation conservative

The first pass should cover the acceptance-criteria checks plus safe advisory hints. Ambiguous environment checks, such as shell integration or install channel, should return `info`/`warning` findings only when detectable and should avoid destructive probes.

Rationale: a diagnostic command should be safe to run in CI, local terminals, and agent contexts. Conservative checks leave room for future capabilities without overpromising.

Alternative considered: deeply inspect all install channels and shell startup files up front. That could be useful but increases platform-specific complexity and false positives.

### Document command references and agent troubleshooting paths

Add a docs command page for `doctor`, include it in command navigation, and mention it from agent/troubleshooting-oriented workflow pages. Update Arashi skill guidance so agents run `arashi doctor --json` for structured diagnostics when diagnosing workspace health.

Rationale: `doctor` is most useful when users and agents know it is the safe first command before mutating recovery flows.

## Risks / Trade-offs

- [Risk] Reusing status helpers may require refactoring currently local functions from `commands/status.ts`. → Mitigation: extract shared parsing/checking code in small commits and keep status output behavior covered by existing tests.
- [Risk] Diagnostic severities can become subjective. → Mitigation: define explicit severity rules in the spec and assert representative states in tests.
- [Risk] Shell/install detection can produce false positives on uncommon environments. → Mitigation: keep unknown states informational and make suggested commands conservative.
- [Risk] JSON consumers may depend on finding details too early. → Mitigation: guarantee stable top-level fields and codes; keep detailed payloads additive.
- [Risk] Doctor could become a dumping ground for every command's edge cases. → Mitigation: scope first implementation to workspace health, repository state, stale metadata, hooks, shell integration hints, and install/update hints from the issue.
