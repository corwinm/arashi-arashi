# Quick Reference

## Current Specification Paths

```text
openspec/changes/<change>/
├── proposal.md
├── design.md
├── specs/<capability>/spec.md
└── tasks.md

openspec/specs/<capability>/spec.md   # Canonical after archive
```

## OpenSpec Commands

```text
/opsx-explore
/opsx-propose <change-name>
/opsx-apply <change-name>
/opsx-archive <change-name>
```

```bash
openspec list
openspec status --change <change-name>
openspec validate <change-name> --strict
openspec validate --all --strict
```

## Coordinated Worktrees

```bash
# Inspect configured repositories
aw status

# Create a coordinated branch/worktree
aw create issue-NNN-short-name --only arashi --no-launch --no-switch

# Include several children
aw create issue-NNN-short-name \
  --only arashi \
  --only arashi-docs \
  --no-launch \
  --no-switch

# Preview first
aw create issue-NNN-short-name --only arashi --dry-run --json
```

Use a normal Git branch/worktree for a meta-only change.

## Repository Ownership

| Repository                  | Owns                                                        |
| --------------------------- | ----------------------------------------------------------- |
| `arashi-arashi`             | OpenSpec artifacts, cross-repo contracts, coordination docs |
| `repos/arashi`              | CLI source, tests, CLI README/docs, generated CLI contracts |
| `repos/arashi-docs`         | Public documentation site                                   |
| `repos/arashi-skills`       | Authored and packaged Arashi skill guidance                 |
| `repos/arashi-vscode`       | VS Code extension                                           |
| `repos/arashi-presentation` | Presentation site                                           |

## Validation

```bash
# Parent
openspec validate --all --strict
pnpm run format:check
pnpm run typecheck
pnpm test
pnpm run contracts:check

# CLI
cd repos/arashi
pnpm run format:check
pnpm run lint
pnpm run typecheck
pnpm test
pnpm run contract:check
pnpm run build
```

## Pull Request Checklist

- Issue and OpenSpec change linked
- Changes committed in the owning repositories
- Companion pull requests cross-linked
- Exact validation results recorded
- Independent base-to-head review complete
- Remote CI verified on the reviewed heads
- OpenSpec archived only after implementation completion
