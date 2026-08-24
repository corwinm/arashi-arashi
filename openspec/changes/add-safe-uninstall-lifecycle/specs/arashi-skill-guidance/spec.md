# arashi-skill-guidance Delta Specification

## ADDED Requirements

### Requirement: Packaged skill teaches ownership-aware uninstall proportionately

The authored and packaged Arashi skill SHALL route uninstall work to the smallest installation or troubleshooting reference while keeping `SKILL.md` a minimal router. Guidance SHALL prefer `aw`, retain `arashi` parity, direct agents to installed help for options, distinguish top-level from shell-only removal, require inspection and explicit consent, identify direct versus package-manager versus manual ownership, preserve project data, and reject broad or heuristic deletion. It SHALL link canonical documentation for exhaustive transaction and migration behavior.

#### Scenario: Agent is asked to uninstall Arashi

- **WHEN** the packaged skill handles a removal request
- **THEN** it first identifies channel and inspects the plan, uses exact package-manager delegation where proven, and refuses ambiguous/manual deletion
- **AND** it never treats `rm -rf ~/.arashi` or equivalent as product uninstall

#### Scenario: Agent is asked only to remove shell integration

- **WHEN** executable removal was not requested
- **THEN** guidance uses `aw shell uninstall` and preserves payload, PATH, workspace, repository, worktree, and project state

#### Scenario: Authored and package guidance drift

- **WHEN** a controlled source or extracted-package fixture omits or contradicts an uninstall safety invariant
- **THEN** the focused checker fails through both stable source and canonical package aggregates
- **AND** maintainer-only fixtures and checkers remain outside the installable skill subtree
