# Quickstart: skills.sh Integration for Arashi

## Purpose

Get a first-time user from no setup to one successful Arashi workflow through the skills platform.

## Prerequisites

- Terminal access on macOS, Linux, or Windows.
- Git installed and available on `PATH`.
- Network access to skill source repository and package distribution endpoints.
- Permission to install user-level CLI tools.

## 1) Preflight Check

Run and confirm all required tools are available:

```bash
git --version
npx --version
git ls-remote https://github.com/corwinm/arashi-skills.git
```

If any check fails, install the missing prerequisite before continuing.

## 2) Install the Arashi Skill

```bash
npx skills add https://github.com/corwinm/arashi-skills --skill arashi
```

Expected result:
- Skill package is added without manual repository edits.
- Skill metadata is discoverable in local skills listing.

## 3) Validate Installation

Run the skill validation gates:

```bash
bash skills/arashi/scripts/validate.sh --check all
```

Expected result:
- Command completes with `PASS` lines for prerequisite, install, and workflow gates.
- Exit code is `0`.

## 4) Execute a First Workflow

Use one documented beginner workflow from the skill package.

Reference:

- `repos/arashi-skills/examples/workflow-beginner.md`

Expected result:
- Workflow completes with documented user-visible outcomes.
- No undocumented setup steps are required.

## 5) Troubleshooting Fast Path

If setup fails, follow this triage order:

1. Verify prerequisites and command availability on `PATH`.
2. Retry installation after confirming network access.
3. Check skill documentation troubleshooting matrix for exact symptom-to-fix steps.
4. Re-run validation after applying fixes.

## Success Check

Quickstart is considered successful when a first-time user can:

- Install the skill without manual repo edits.
- Run one documented workflow end-to-end.
- Confirm expected outcomes within 15 minutes.

## Validation Notes

### US1 Acceptance Sync (2026-02-10)

- Install command locked to `npx skills add https://github.com/corwinm/arashi-skills --skill arashi`.
- Verification command locked to `bash skills/arashi/scripts/validate.sh --check all`.
- First-run flow documented in `repos/arashi-skills/examples/install-first-run.md`.

### Final Quickstart Validation Record (2026-02-10)

- Executed: `bash skills/arashi/scripts/validate.sh --check all`
- Preflight gate: PASS (`git`, `npx` detected).
- Install gate: PASS (`SKILL.md` and command reference present).
- Workflow gate: PASS (`arashi` command and three workflow examples detected).
- Troubleshooting gate: PASS (triage path mapped to matrix guidance).
