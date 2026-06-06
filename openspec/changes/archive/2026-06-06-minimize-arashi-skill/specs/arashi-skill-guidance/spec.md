## ADDED Requirements

### Requirement: Minimal skill entry point
The Arashi skill package SHALL keep `skills/arashi/SKILL.md` focused on skill routing, core operating rules, and links to detailed references rather than duplicating workflow manuals or exhaustive command parameters.

#### Scenario: Agent opens the skill
- **WHEN** an agent reads `skills/arashi/SKILL.md`
- **THEN** the skill identifies when to use Arashi guidance, the required operating rules, and where to find detailed references without embedding exhaustive workflow or flag documentation

### Requirement: CLI help as parameter source of truth
The Arashi skill guidance SHALL direct agents to use `arashi --help` and `arashi <command> --help` to discover current command parameters before advising on non-trivial flags or options.

#### Scenario: Agent needs command flags
- **WHEN** an agent needs to recommend flags for an Arashi command
- **THEN** the guidance instructs the agent to inspect the installed CLI help output instead of relying on memorized or duplicated flag lists

### Requirement: Linked detailed references
The Arashi skill package SHALL keep detailed instructions discoverable through linked reference files and canonical website links.

#### Scenario: User needs workflow details
- **WHEN** a user asks for detailed Arashi workflow, troubleshooting, shortcut, security, or publication guidance
- **THEN** the skill points the agent to the appropriate reference file or canonical website documentation

### Requirement: Contributor guidance alignment
The Arashi skill package SHALL align contributor guidance with the minimal entry point model by treating `SKILL.md` as the place for routing and policy changes, while detailed procedural updates belong in reference files.

#### Scenario: Contributor updates procedural guidance
- **WHEN** a contributor changes detailed workflow, command, troubleshooting, or shortcut instructions
- **THEN** repository guidance directs them to update the smallest affected reference first and only update `SKILL.md` when routing, policy, or reference links change
