# Quickstart: skills.sh Integration for Arashi

## Purpose

Get a first-time user from zero setup to one successful Arashi workflow using the installed skill guidance.

## Prerequisites

- Terminal access on macOS, Linux, or Windows.
- Git installed and available on `PATH`.
- Network access to GitHub and npm/release endpoints.

## 1) Install the Skill

```bash
npx skills add https://github.com/corwinm/arashi-skills --skill arashi
```

Expected result:

- Skill installs successfully.
- `skills/arashi/SKILL.md` and references are available locally.

## 2) Preflight

```bash
git --version
npm --version
git ls-remote https://github.com/corwinm/arashi.git
```

If a check fails, fix the prerequisite before continuing.

## 3) Install and Verify Arashi CLI

```bash
npm install -g arashi
arashi --version
arashi --help
```

Expected result:

- Install command exits `0`.
- `arashi` command is available and help output renders.

## 4) Execute a First Workflow

Use the Beginner workflow from `skills/arashi/references/workflows.md`:

```bash
arashi init
arashi status
```

Expected result:

- `.arashi/config.json` is created.
- `arashi status` prints repository/worktree status.

## 5) Optional Session Flow (tmux/sesh)

Use shortcuts from `skills/arashi/references/session-shortcuts.md`:

```bash
cd "$(arashi list | fzf)"
sesh connect "$(arashi list | fzf)"
```

## Troubleshooting Fast Path

If setup fails:

1. Confirm prerequisites in `skills/arashi/references/prerequisites.md`.
2. Confirm `arashi --version` works.
3. Follow symptom-to-fix guidance in `skills/arashi/references/troubleshooting.md`.

## Success Check

Quickstart is successful when a first-time user can:

- install the skill
- install and verify Arashi CLI
- run one workflow end-to-end
- optionally use session shortcuts with `fzf`/`sesh`
