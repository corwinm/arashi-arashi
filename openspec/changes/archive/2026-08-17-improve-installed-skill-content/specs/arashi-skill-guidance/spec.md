## MODIFIED Requirements

### Requirement: Minimal skill entry point

The Arashi skill package SHALL keep `skills/arashi/SKILL.md` focused on skill routing, universal operating rules, and links to detailed references rather than duplicating workflow manuals, command-family details, canonical-doc indexes, or exhaustive command parameters.

#### Scenario: Agent opens the skill

- **WHEN** an agent reads `skills/arashi/SKILL.md`
- **THEN** the skill identifies when to use Arashi guidance, the non-negotiable operating rules, and where to find detailed references
- **AND** it does not embed exhaustive workflow, command-family, migration, launcher, or flag documentation

#### Scenario: Agent chooses detailed guidance

- **WHEN** an agent needs command, workflow, hook, shortcut, prerequisite, or troubleshooting detail
- **THEN** `SKILL.md` routes the agent to the smallest reference that owns that task
- **AND** does not require the agent to read unrelated command families first

### Requirement: Linked detailed references

The Arashi skill package SHALL keep operational instructions discoverable through linked, task-scoped reference files and canonical website links while excluding maintainer-only release and publication policy from the installed operating surface.

#### Scenario: User needs workflow details

- **WHEN** a user asks for detailed Arashi command, workflow, troubleshooting, shortcut, hook, prerequisite, or security guidance
- **THEN** the skill points the agent to the smallest appropriate installed reference and, where useful, canonical website documentation

#### Scenario: Maintainer prepares a skill release

- **WHEN** a maintainer needs release tagging, marketplace publication, repository security-gate, or release-evidence instructions
- **THEN** installed operational routing does not present that policy as Arashi usage guidance
- **AND** repository-level `docs/publication.md` remains its owner

## ADDED Requirements

### Requirement: Task-scoped command references

The installed Arashi skill SHALL route command guidance by user task so a narrow command request does not require loading the full command surface, while every focused command reference remains self-contained for its declared scope.

#### Scenario: Agent needs one command family

- **WHEN** an agent needs setup/update, workspace/repository, automation, create, switch/launch, or remove/maintenance guidance
- **THEN** the command router identifies one focused reference for that family
- **AND** that reference provides the applicable prerequisites, copy-pasteable commands, user-visible precedence, expected outcomes, safety boundaries, and recovery links

#### Scenario: Agent needs adjacent command behavior

- **WHEN** a task crosses two command families
- **THEN** the owning reference links directly to the adjacent focused reference
- **AND** the agent does not need to load every command family

### Requirement: Installed guidance has clear content ownership

The installed Arashi skill SHALL assign one primary owner to each detailed operational concept and SHALL use concise links rather than repeating the same contract across the tutorial, workflows, commands, shortcuts, hooks, and troubleshooting references.

#### Scenario: Agent follows the tutorial

- **WHEN** an agent opens the end-to-end tutorial
- **THEN** it completes one successful configured journey, presents an explicit standalone choice, verifies the outcome, and links optional setup, shortcut, hook, and recovery detail
- **AND** it does not concatenate full copies of those references

#### Scenario: Agent chooses a workflow

- **WHEN** an agent opens workflow guidance
- **THEN** it selects a mode by goal and follows a lifecycle sequence
- **AND** launcher implementation contracts and exhaustive command details remain in their owning surfaces

#### Scenario: Agent troubleshoots a failure

- **WHEN** an agent opens troubleshooting guidance
- **THEN** each entry provides a symptom, first diagnostic, likely recovery, and detailed link
- **AND** does not duplicate complete launcher, ignore, or command contracts

### Requirement: Prerequisites are capability-conditional

The installed Arashi skill SHALL distinguish universal operating prerequisites from requirements that apply only to installation channels, network operations, optional integrations, or repository-maintainer validation.

#### Scenario: Agent uses an installed standalone binary locally

- **WHEN** an agent performs a local Arashi operation with an already-installed standalone binary
- **THEN** the guidance requires Git and the applicable repository state
- **AND** does not claim that Node, npm, or GitHub network access is universally required

#### Scenario: Agent installs, updates, or validates the skill repository

- **WHEN** the task uses a package-manager installation channel, remote operation, optional integration, or maintainer validation command
- **THEN** the guidance states the corresponding Node, package-manager, network, or integration prerequisite in that task's scope

### Requirement: Installed guidance excludes implementation and historical sediment

The installed skill SHALL describe supported user-visible operation without teaching internal executor ownership, exhaustive adapter implementation matrices, stale issue/PR-specific examples, obsolete release-specific workarounds, or hard-coded historical release tags as current guidance.

#### Scenario: Agent operates a supported command

- **WHEN** an agent reads current command guidance
- **THEN** it receives current syntax, behavior, failure classification, safety boundaries, and recovery information
- **AND** internal Commander/exported-executor enforcement details and historical delivery examples are absent unless required to operate the command safely

#### Scenario: Agent encounters deprecated compatibility guidance

- **WHEN** a deprecated spelling or configuration form remains supported
- **THEN** it appears only in a bounded migration section with the canonical replacement and compatibility boundary
- **AND** it is not presented as preferred current usage

### Requirement: Skill reduction preserves semantic coverage

The installed-skill reduction SHALL preserve all approved command, standalone/configured, launcher, hook, JSON, ignore, and package-boundary semantic domains in authored source and the canonical extracted release artifact.

#### Scenario: Authored skill is validated

- **WHEN** the complete registered source guidance aggregate runs
- **THEN** every existing semantic domain passes against the reorganized installed content

#### Scenario: Canonical release artifact is validated

- **WHEN** the canonical skill archive is created and extracted
- **THEN** every package-capable semantic checker passes against the extracted `skills/arashi` subtree
- **AND** all intended focused references are present while maintainer-only scripts and contracts remain absent

#### Scenario: Reduction effectiveness is measured

- **WHEN** implementation validation is complete
- **THEN** the change reports before/after installed character counts and representative task-context sizes
- **AND** demonstrates materially smaller narrow-task loads without counting removed safety or recovery semantics as success
