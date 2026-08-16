## ADDED Requirements

### Requirement: Packaged skill recognizes the supported executable alias without forking command guidance

The authored and packaged Arashi skill SHALL identify `aw` as the supported “Arashi Workspace” shorthand provided by supported installations while retaining canonical `arashi` entry commands, help discovery, examples, product identity, configuration, and environment-variable vocabulary. Alias guidance SHALL live in the smallest linked installation/tutorial reference rather than expanding the minimal `SKILL.md` routing surface or duplicating workflows with `aw` spellings.

#### Scenario: Agent verifies or discovers commands

- **WHEN** an agent reads skill entry commands or needs current command parameters
- **THEN** the skill continues to use `arashi --version`, `arashi --help`, and `arashi <command> --help` as canonical discovery commands
- **AND** does not present `aw` as a separate product, subcommand vocabulary, or preferred replacement

#### Scenario: Agent reads installation guidance

- **WHEN** an agent follows the smallest linked installation or tutorial reference
- **THEN** it learns that supported npm and direct installations provide equivalent canonical `arashi` and shorthand `aw` executable names
- **AND** it is directed to canonical docs for channel-specific collision, shell integration, completion, update, and manual-install behavior

#### Scenario: Authored or extracted guidance drifts

- **WHEN** the focused skill semantic checker runs against authored source or the extracted canonical release archive
- **THEN** it rejects missing/incorrect alias expansion, claims that `aw` is a separate command vocabulary, non-canonical entry/help commands, or alias guidance absent from either package boundary
- **AND** it remains registered through the stable source and package aggregates without feature-specific workflow steps
