## Context

The installed package boundary is `repos/arashi-skills/skills/arashi/`. It currently contains 11 files and approximately 132,838 characters. `references/commands.md` alone is approximately 64,898 characters, while `SKILL.md`, the tutorial, workflows, troubleshooting, shortcuts, and publication guidance repeat parts of the same operational surface.

The package is intentionally self-contained, and existing semantic checkers protect approved behavior across authored source and the canonical extracted release artifact. Apparent duplication is not automatically removable: current command behavior, negative safety constraints, package-boundary validation, and independently checked contracts must remain intact.

## Goals / Non-Goals

**Goals:**

- Reduce installed content by roughly 20% without removing supported operational behavior.
- Reduce typical narrow-task context substantially by routing agents to one focused command reference rather than a 65 KB monolith.
- Give each installed concept one primary owner and replace duplicated detail elsewhere with concise routing.
- Keep command examples deterministic, copy-pasteable, and subordinate to installed CLI help as the parameter authority.
- Preserve every existing semantic domain in authored-source and canonical extracted-package validation.

**Non-Goals:**

- Redesign the semantic-checker harness, registry, security gate, contracts, or GitHub workflows.
- Change Arashi CLI behavior, configuration, output schemas, or canonical docs.
- Replace essential installed guidance with web links alone.
- Turn size targets into a reason to remove safety boundaries or actionable recovery information.

## Decisions

### 1. Keep one externally holistic skill

The installed skill remains `arashi`; it is not split into independently installed skills. `SKILL.md` stays the stable entry point, while detailed content is modular internally.

Alternative considered: multiple separately installed command skills. Rejected because command workflows share configured/standalone policy, safety rules, and one product identity.

### 2. Split command guidance by user decision boundary

`references/commands.md` becomes a compact router. Detailed command guidance moves into focused references for setup/update/completion, workspace initialization and repository management, automation and coordinated execution, create, switch/launch, and remove/maintenance.

Each focused reference must be self-contained for its task, link to adjacent references only when needed, and begin with a concise scope/selection statement. A narrow task should normally need `SKILL.md`, the command router, and one focused leaf.

Alternative considered: retain one command file and only shorten it. Rejected because even a successful prose reduction would still make unrelated command families load together.

### 3. Preserve operational behavior; remove internal and historical detail

Installed guidance retains current commands, preconditions, precedence, non-mutation boundaries, structured refusals, expected outcomes, and recovery actions. Exact implementation guard ordering, internal executor responsibilities, exhaustive adapter implementation matrices, stale issue/PR examples, obsolete old-release workarounds, and detailed deprecated-normalization archaeology move out of operational prose or are removed when already represented by maintained contracts.

### 4. Assign one owner per installed concept

- `SKILL.md`: routing and universal policy.
- Command router/leaves: copy-pasteable command operation and command-specific outcomes.
- `workflows.md`: mode selection and lifecycle sequences.
- `tutorial.md`: one end-to-end successful journey.
- `hooks.md`: hook activation, scope, environment, input, timeout, and failure boundaries.
- `session-shortcuts.md`: optional navigation/session usage.
- `troubleshooting.md`: symptom, first diagnostic, recovery, and link.
- `prerequisites.md`: conditional capability requirements.

Other files route to the owner rather than restating its detailed contract.

### 5. Exclude maintainer publication policy from installed operational guidance

Marketplace/release tagging, repository security gates, and release-evidence templates are maintainer concerns. Still-current policy moves to repository-level `docs/publication.md` before `skills/arashi/references/publication.md` is removed from the installed routing surface. Operational security guidance remains discoverable from the installed skill; only maintainer release/security-gate procedure moves outside the package.

### 6. Change validation only as required by installed content

Before prose changes, extend the nearest existing semantic checks to enforce the new ownership and routing boundaries, including package-wide rejection of stale publication/version examples and unconditional Node/network prerequisites. Existing checker identities, registry behavior, workflow topology, and contract architecture remain unchanged.

## Risks / Trade-offs

- **Risk: splitting a reference drops a checker-enforced semantic claim.** → Inventory every checker that reads `commands.md` or another rewritten file, map each retained claim to its destination, and run all 14 source and extracted-package checkers.
- **Risk: smaller files become dependent fragments.** → Require each command leaf to state its scope, prerequisites, commands, outcomes, and recovery links sufficiently for independent use.
- **Risk: canonical docs and installed guidance drift.** → Preserve canonical links and run the coordinated meta contract checker after local source/package validation.
- **Risk: size optimization weakens safety guidance.** → Treat safety, non-mutation, failure classification, and recovery as retained requirements; remove only duplication, internal detail, and historical sediment.
- **Risk: moved paths break installation or links.** → Validate every Markdown link, build the canonical archive, inspect its member list, and run checkers against the extracted `skills/arashi` root.
- **Risk: SSH remote freshness is unknown in the current environment.** → Do not rewrite remotes or credentials; verify and refresh remote state before push/PR delivery when authentication is available.
