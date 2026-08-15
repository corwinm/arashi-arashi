## ADDED Requirements

### Requirement: Packaged skill teaches safe inline lifecycle configuration
The Arashi skill SHALL teach inline lifecycle hooks in the smallest linked hook/configuration references while keeping `SKILL.md` a minimal router. Guidance SHALL use root `hooks.scripts.<lifecycle>` for workspace ownership and `repos.<name>.hooks.<lifecycle>` for repository ownership, cover all four lifecycles, string-as-Bash shorthand, `bash`/`powershell`/`cmd` maps, deterministic platform selection, same-location ambiguity, and file-only standalone/user-global behavior. It SHALL direct agents to installed CLI help/schema and MUST NOT recommend dynamic repository lifecycle keys, terminal selection, external script paths, or secrets in snippets.

#### Scenario: Agent configures a short hook
- **WHEN** an agent follows packaged guidance for a short workspace or repository command
- **THEN** it uses the canonical owner location and supported value shape
- **AND** does not create a second source at the same logical location

#### Scenario: Agent needs a substantial script
- **WHEN** automation is substantial, reusable, or needs independent tooling
- **THEN** the skill recommends a native hook file rather than an oversized inline value

### Requirement: Skill guidance preserves runtime and secrecy contracts
Authored and packaged guidance SHALL state that inline hooks preserve lifecycle timing, cwd, target multiplicity, scope order, timeout, create-only `--no-hooks`, shared `--no-hook-input`, TTY/EOF, JSON-owned quiet behavior, command-specific JSON/dry-run behavior, failure, rollback/finalization, and outcomes. It SHALL state that remove does not gain `--no-hooks`, remove dry-run retains source-aware previews, and configured-create dry-run retains no hook discovery, an empty ledger, and no preview surface. It SHALL teach shell-native environment syntax and fail-fast composition and SHALL state that outcomes, previews, diagnostics, and logs identify source kind/owner without snippet text. It SHALL warn that inline config is executable code and secrets MUST NOT be embedded or entered as hook input.

#### Scenario: Agent writes portable variants
- **WHEN** an agent configures Bash, PowerShell, and cmd entries
- **THEN** guidance uses `$ARASHI_*`, `$env:ARASHI_*`, and `%ARASHI_*%` respectively
- **AND** explains deterministic host selection and interpreter-unavailable failure

#### Scenario: Agent handles automation output
- **WHEN** an agent uses JSON or dry-run with inline hooks
- **THEN** guidance expects one-document/non-executing behavior and non-secret source metadata
- **AND** never instructs the agent to inspect or print snippet text from outcomes

### Requirement: Authored and extracted-package inline guidance is aggregate-checked
A focused inline-hook guidance checker SHALL remain directly executable, SHALL be registered in the existing fail-closed skills checker manifest, and SHALL validate both authored source and the extracted canonical release archive through the stable source and package aggregates. Maintainer fixtures/checkers MUST remain outside the installable skill tree.

#### Scenario: Authored guidance drifts
- **WHEN** source guidance loses or contradicts ownership, interpreter, ambiguity, lifecycle, no-disclosure, or security semantics
- **THEN** the focused checker and source aggregate fail with the owning reference

#### Scenario: Packaged guidance drifts
- **WHEN** the canonical extracted package omits required inline-hook guidance while authored source remains correct
- **THEN** the package aggregate fails against the extracted `skills/arashi` subtree
- **AND** source success does not mask the package defect

#### Scenario: Checker is registered
- **WHEN** the inline checker is added without changing workflow topology
- **THEN** existing stable source/package aggregates execute it through canonical registration
- **AND** no feature-specific workflow step is required
