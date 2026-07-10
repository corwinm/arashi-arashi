# cli-readme-value-example Specification

## Purpose
Define README requirements that explain Arashi's current OpenSpec-based multi-repo value proposition and keep historical SpecKit references clearly contextualized.

## Requirements
### Requirement: CLI README SHALL include a value-focused multi-repo example section
The CLI README SHALL include a dedicated section that explains Arashi's value through a minimal frontend-and-backend multi-repo workflow and SHALL identify OpenSpec as the current spec workflow used for this project.

#### Scenario: User reads README onboarding content
- **WHEN** a user reads the top-level README for understanding what Arashi does
- **THEN** the README contains a concise value-focused example section describing parallel multi-repo worktrees and identifies OpenSpec as the workflow currently used in this project

#### Scenario: README references earlier tooling context
- **WHEN** the README mentions earlier SpecKit-oriented setup or planning context
- **THEN** it explains that SpecKit was part of the project's earlier context and does not imply that SpecKit-specific setup remains required

#### Scenario: CLI README is compared with the meta-repo README
- **WHEN** a maintainer or contributor reads `repos/arashi/README.md` alongside the root `arashi-arashi` `README.md`
- **THEN** both READMEs agree that OpenSpec is the project's current workflow and that SpecKit appears only as historical context

## ADDED Requirements

### Requirement: README tooling summaries SHALL reflect current OpenSpec usage
The README SHALL present comparison tables, summaries, or similar onboarding guidance in a way that reflects OpenSpec as the workflow currently used in this repository.

#### Scenario: User scans README comparison guidance
- **WHEN** a user reads a README table or summary that references spec or planning tooling
- **THEN** the current-state guidance identifies OpenSpec as the workflow used by this project and frames any SpecKit mention as historical context rather than an active requirement
