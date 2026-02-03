# Design Document Structure Template

**Purpose**: Standard structure for all Arashi design documents  
**Applies to**: D1-D7 documentation tasks  
**Date**: 2026-02-03

## Overview

All design documents should follow a consistent structure to enable efficient navigation and comprehension. This template defines the standard sections and formatting conventions.

## Standard Document Structure

### 1. Header Section

```markdown
# [Document Title]

**Feature**: 001-git-worktree-manager  
**Document**: [D#] [GitHub Issue #]  
**Created**: YYYY-MM-DD  
**Status**: Draft | Review | Complete  
**Dependencies**: [List dependent documents]
```

### 2. Purpose & Scope

```markdown
## Purpose

[1-2 sentences explaining what this document defines and why it's needed]

## Scope

**In Scope**:
- [Specific topics covered]

**Out of Scope**:
- [Related topics handled elsewhere]
```

### 3. Main Content Sections

The content sections vary by document type:

#### Configuration/Data Documents (D1, D2)
- **Schema Definition**: Field tables with types, constraints, defaults
- **Validation Rules**: Required vs optional, format requirements
- **Examples**: Complete, realistic examples with annotations
- **Migration Strategy**: Version evolution path

#### Contract Documents (D3, D4, D5, D6)
- **Overview**: High-level explanation of the contract
- **Signatures**: Function/command signatures with parameters
- **Behavior**: Expected behavior for each operation
- **Error Handling**: Error conditions and responses
- **Examples**: Usage demonstrations
- **Implementation Notes**: Guidance for developers

#### Guide Documents (D7)
- **Prerequisites**: Required knowledge and tools
- **Step-by-Step Instructions**: Numbered procedures
- **Examples**: Command snippets with expected output
- **Troubleshooting**: Common issues and solutions
- **Next Steps**: Links to related documentation

### 4. Design Decisions

```markdown
## Design Decisions

### Decision: [Name]

**Choice**: [What was decided]

**Rationale**: [Why this choice]

**Alternatives Considered**:
- [Option A]: Rejected because [reason]
- [Option B]: Rejected because [reason]

**Consequences**:
- [Implication 1]
- [Implication 2]
```

### 5. References

```markdown
## References

- **GitHub Issue**: #[number]
- **Related Documents**: [Links to dependent/related docs]
- **External Resources**: [Links to external documentation]
- **Constitution Principles**: [Relevant constitution sections]
```

## Formatting Conventions

### Code Blocks

Use language-specific syntax highlighting:

````markdown
```typescript
interface Config {
  version: string;
  repos_dir: string;
}
```
````

### Tables

Use markdown tables for structured data:

```markdown
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| version | string | Yes | "1.0.0" | Config schema version |
| repos_dir | string | No | "repos" | Sub-repos directory |
```

### Command Syntax

Use consistent formatting for CLI commands:

```markdown
**Signature**: `arashi create <branch> [options]`

**Options**:
- `-i, --interactive` - Enable interactive mode
- `--only <repos>` - Comma-separated repo names
- `--path <path>` - Custom worktree location
```

### Diagrams

Use text-based diagrams for flows and relationships:

```
┌────────────────┐
│ Configuration  │
└───────┬────────┘
        │ validates
        ▼
┌────────────────┐
│ Type System    │
└────────────────┘
```

### Admonitions

Use consistent markers for special notes:

```markdown
> **Note**: Additional context or clarification

> **Warning**: Important constraint or limitation

> **Example**: Demonstration of concept
```

## Document-Specific Structures

### D1: Configuration Schema Design

```markdown
# Configuration Schema Design

## Purpose
[Define config.json structure]

## Configuration Schema

### Fields

| Field | Type | Required | Default | Validation |
|-------|------|----------|---------|------------|
[Table of all fields]

### Nested Structures

#### discovered_repos

[Structure definition]

## Validation Rules

[Detailed validation logic]

## Default Values

[Table of defaults with rationale]

## Example Configuration

```json
{
  // Annotated example
}
```

## Version Migration

[Migration strategy from v1 to future versions]

## Design Decisions

[Rationale for key choices]
```

### D2: Type System Design

```markdown
# Type System Design

## Purpose
[Define TypeScript interfaces]

## Type Definitions

### Core Interfaces

#### ArashiConfig
```typescript
interface ArashiConfig {
  // Fields with descriptions
}
```

#### RepoConfig
[Interface definition]

[... all interfaces ...]

### Error Types

#### ArashiError
```typescript
class ArashiError extends Error {
  exitCode: number;
  gitOutput?: string;
}
```

## Type Relationships

[Diagram showing interface dependencies]

## Design Decisions

[Rationale for interface vs type, naming conventions]
```

### D3: CLI Command Contracts

```markdown
# CLI Command Contracts

## Purpose
[Define all CLI commands]

## Exit Codes

| Code | Meaning | When Used |
|------|---------|-----------|
| 0 | Success | Operation completed |
| 1 | Error | Operation failed |
| 2 | User Abort | User cancelled (Ctrl+C) |

## Commands

### arashi init

**Signature**: `arashi init [options]`

**Description**: [What it does]

**Options**:
- `--repos-dir <name>` - [Description]
- `--no-auto-setup` - [Description]

**Behavior**:
1. [Step 1]
2. [Step 2]

**Examples**:
```bash
arashi init
arashi init --repos-dir packages
```

**Exit Codes**: [When each code is returned]

[... repeat for all commands ...]
```

### D4: Git Wrapper API Design

```markdown
# Git Wrapper API Design

## Purpose
[Define internal git operations API]

## Command Execution Wrapper

### Design

[Description of Bun.spawn wrapper approach]

### Error Handling

[Strategy for capturing and propagating errors]

## Repository Detection

### isGitRepository

**Signature**: `function isGitRepository(path: string): Promise<boolean>`

**Behavior**: [Description]

**Implementation Notes**: [Check for .git directory or file]

[... repeat for all functions ...]

## Output Parsing

### Git Worktree List
```
# Input: git worktree list --porcelain
worktree /path/to/main
HEAD abc123...

worktree /path/to/feature-branch
HEAD def456...
branch refs/heads/feature-branch
```

**Parsing Strategy**: [How to extract data]

[... repeat for each git command ...]
```

### D5: Worktree Orchestration Design

```markdown
# Worktree Orchestration Design

## Purpose
[Define multi-repo worktree coordination]

## Worktree Creation Flow

```
[Text-based flow diagram]
```

### Step-by-Step

1. **Validate**: [Details]
2. **Fetch**: [Details]
3. **Create Main**: [Details]
[... all steps ...]

## Operation Logging

### OperationLog Structure

```typescript
interface OperationLogEntry {
  type: 'worktree' | 'branch' | 'directory';
  data: any;
  rollback: () => Promise<void>;
}
```

### Rollback Mechanism

[Algorithm description]

## Branch Conflict Resolution

### Conflict Detection

[When conflicts occur]

### Resolution Dialog

[User prompt flow and options]

## Repository Selection

[Logic for all / --only / interactive modes]

## Error Aggregation

[How errors are collected and displayed]
```

### D6: Hook System Design

```markdown
# Hook System Design

## Purpose
[Define lifecycle hooks for extensibility]

## Hook Discovery

**Location**: `.arashi/hooks/`

**Supported Hooks**:
- `pre-create.sh`
- `post-create.sh`
- `setup.sh`

**Discovery Process**: [How hooks are found and validated]

## Hook Validation

[Execute permission checking]

## Hook Execution Order

```
pre-create.sh
    ↓
[Worktree Operations]
    ↓
post-create.sh
    ↓
setup.sh (for each repo)
```

## Environment Variables

| Variable | Description | Example Value |
|----------|-------------|---------------|
| ARASHI_COMMAND | Command being executed | "create" |
| ARASHI_BRANCH | Target branch name | "feature-x" |
[... all env vars ...]

## Timeout & Failure Handling

**Timeout**: 5 minutes (configurable)

**Failure Behavior**: Warn but continue (non-fatal)

## Output Capture

[How hook output is streamed to console]

## --no-hooks Flag

[Behavior when hooks are disabled]
```

### D7: Development Setup Guide

```markdown
# Development Setup Guide

## Prerequisites

- **Bun**: Latest stable version
- **Git**: 2.5+ (for worktree support)
- **Operating System**: macOS, Linux, or Windows

## Installation

### 1. Install Bun

```bash
curl -fsSL https://bun.sh/install | bash
```

### 2. Clone Repository

```bash
git clone [URL]
cd arashi-arashi
```

[... all setup steps ...]

## Repository Structure

[Explanation of meta-repo pattern]

## Development Workflow

### Running Tests

```bash
cd repos/arashi
bun test
```

[... all workflows ...]

## Debugging

### VS Code Configuration

```json
{
  "version": "0.2.0",
  "configurations": [...]
}
```

## Troubleshooting

### Issue: [Common problem]
**Solution**: [How to fix]

[... common issues ...]

## Next Steps

- Read CONTRIBUTING.md for PR guidelines
- Review specs/001-git-worktree-manager/spec.md
- Join developer discussions
```

## Quality Checklist

Before submitting a design document, verify:

- [ ] All GitHub issue acceptance criteria addressed
- [ ] Consistent structure followed (header, purpose, content, decisions, references)
- [ ] Code blocks use appropriate syntax highlighting
- [ ] Tables are properly formatted
- [ ] Examples are complete and realistic
- [ ] Design decisions include rationale
- [ ] No [NEEDS CLARIFICATION] markers remain
- [ ] Cross-references to related documents included
- [ ] Spelling and grammar checked
- [ ] Markdown renders correctly (preview)

## Revision History

| Date | Author | Changes |
|------|--------|---------|
| 2026-02-03 | System | Initial template creation |
