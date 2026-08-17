## ADDED Requirements

### Requirement: Packaged skill teaches safe repository worktree materialization
The authored and packaged Arashi skill SHALL teach configured repository `copy` and `symlink` fields in the smallest linked configuration/create references while keeping `SKILL.md` a minimal router. Guidance SHALL state that paths are same-relative-path and canonical-source-checkout owned, copy entries precede symlink entries between repository pre/post-create, missing sources skip visibly, destinations never overwrite or escape, `--no-hooks` does not disable materialization, and symbolic links never fall back to copies, hard links, or junctions.

#### Scenario: Agent needs independent local configuration
- **WHEN** an agent needs `.env` or local configuration to be independently mutable in each worktree
- **THEN** skill guidance recommends repository `copy`
- **AND** does not require a shell hook for the supported same-path case

#### Scenario: Agent needs intentionally shared state
- **WHEN** an agent needs state intentionally shared with the canonical checkout
- **THEN** skill guidance allows repository `symlink`
- **AND** explains shared mutation, platform capability, exact-target, and no-fallback risks

#### Scenario: Agent considers shared dependencies
- **WHEN** an agent considers symlinking `node_modules` or an equivalent dependency tree
- **THEN** guidance recommends package-manager content-addressed stores and per-worktree installs for normal use
- **AND** labels shared dependency trees advanced and risky because branches, lockfiles, runtimes, native modules, and install scripts may diverge or mutate shared state

#### Scenario: Agent needs custom mapping or conditions
- **WHEN** an agent needs globs, remapping, external sources, interpolation, required entries, or conditional behavior
- **THEN** the skill routes the agent to lifecycle hooks
- **AND** does not invent unsupported materialization fields

#### Scenario: Agent operates standalone
- **WHEN** an agent uses implicit zero-config standalone mode
- **THEN** guidance does not claim that repository materialization configuration is available there

### Requirement: Authored and extracted materialization guidance is aggregate-checked
A focused materialization guidance checker SHALL remain directly executable, SHALL be registered in the existing fail-closed skills checker manifest, and SHALL validate both authored source and the extracted canonical release archive through stable source and package aggregates. Maintainer contracts and fixtures MUST remain outside the installable skill tree.

#### Scenario: Authored guidance drifts
- **WHEN** source guidance loses or contradicts field shape, source ownership, lifecycle timing, safety, fallback, or copy-versus-symlink advice
- **THEN** the focused checker and source aggregate fail with the owning reference

#### Scenario: Packaged guidance drifts
- **WHEN** the canonical extracted package omits required materialization guidance while source remains correct
- **THEN** the package aggregate fails against extracted `skills/arashi`
- **AND** no feature-specific workflow step is required
