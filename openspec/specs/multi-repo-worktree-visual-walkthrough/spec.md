# multi-repo-worktree-visual-walkthrough Specification

## Purpose
Define documentation requirements for an accurate visual walkthrough of Arashi's minimal multi-repo add, create, and switch workflow.

## Requirements
### Requirement: Docs SHALL provide a visual walkthrough of the minimal multi-repo workflow
The docs landing page SHALL provide visuals that depict adding repositories, creating worktrees, and switching between worktrees while another worktree remains active.

#### Scenario: Visitor views the walkthrough
- **WHEN** the visitor reaches the walkthrough section
- **THEN** the visual sequence shows `add` -> `create` -> `switch` across frontend and backend repositories

### Requirement: Walkthrough SHALL include motion and non-motion presentation modes
The walkthrough SHALL include an animated presentation for motion-capable environments and SHALL provide an equivalent static sequence that preserves the same step order and meaning.

#### Scenario: Reduced-motion preference is active
- **WHEN** a visitor has reduced-motion preferences enabled
- **THEN** the docs present a non-animated walkthrough that communicates the same workflow steps

### Requirement: Walkthrough visuals MUST remain command-accurate
Walkthrough steps MUST reflect command behavior and terminology used by current Arashi documentation so that visuals and text do not conflict.

#### Scenario: Walkthrough copy and commands are validated
- **WHEN** walkthrough assets and captions are reviewed before release
- **THEN** the command labels and sequence match current documented Arashi command usage
