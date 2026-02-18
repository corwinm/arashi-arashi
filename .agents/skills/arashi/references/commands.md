# Command Reference

Canonical commands for installing and using the Arashi CLI.

## Most Common Commands

```bash
# install Arashi CLI
npm install -g arashi

# verify Arashi CLI
arashi --version

# inspect command surface
arashi --help
```

## Installation

Install with npm:

```bash
npm install -g arashi
```

Alternative install from GitHub Releases:

```bash
curl -L https://github.com/corwinm/arashi/releases/latest/download/arashi-macos-arm64 -o arashi
chmod +x arashi
sudo mv arashi /usr/local/bin/arashi
```

Expected outcome:

- install command exits `0`
- `arashi --version` returns a version string

## Workflow Execution

Choose one workflow from `references/workflows.md`.

Order of operations:

1. Confirm `arashi --version` succeeds.
2. Execute one workflow from start to finish.
3. Confirm expected outcomes from the workflow doc.

## Remove Cleanup Hooks

Use remove lifecycle hooks to automate teardown around `arashi remove`.

```bash
cp .arashi/hooks/pre-remove.sh.example .arashi/hooks/pre-remove.sh
chmod +x .arashi/hooks/pre-remove.sh

# optional post-remove finalizer
cp .arashi/hooks/post-remove.sh.example .arashi/hooks/post-remove.sh
chmod +x .arashi/hooks/post-remove.sh
```

`pre-remove.sh` runs before destructive remove actions.
`post-remove.sh` runs after remove actions are attempted.

## Session Navigation (Optional)

For tmux/sesh and worktree jump shortcuts, use:

- `references/session-shortcuts.md`

## Publication and Discoverability

Publication is optional and policy-dependent.

```bash
git tag -a skill-arashi-v0.1.0 -m "arashi skill package v0.1.0"
git push origin skill-arashi-v0.1.0
```

After release, validate that installation and workflow instructions remain accurate for new users.
