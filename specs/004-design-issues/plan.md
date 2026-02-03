# Implementation Plan: Complete Design Phase Documentation (D1-D7)

**Branch**: `004-design-issues` | **Date**: 2026-02-03 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-design-issues/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

This feature completes seven critical design documentation tasks (D1-D7, GitHub issues #7-#13) for the Arashi git worktree manager project. These documents establish the architectural foundation, API contracts, and developer onboarding materials needed before implementation begins. The deliverables are markdown documentation files stored in `specs/001-git-worktree-manager/`, not code implementation.

**Primary Requirement**: Create comprehensive design documents covering configuration schema, type system, CLI contracts, git wrapper API, worktree orchestration, hook system, and development setup guide.

**Technical Approach**: This is a documentation-only feature using markdown format. No code implementation, runtime, or dependencies required. Documents will be created by reviewing existing GitHub issues, extracting acceptance criteria, and synthesizing complete specifications.

## Technical Context

**Language/Version**: Markdown (CommonMark specification)  
**Primary Dependencies**: None (pure documentation)  
**Storage**: File system (specs/001-git-worktree-manager/ directory)  
**Testing**: Manual review against acceptance criteria checklists  
**Target Platform**: Documentation readers (developers implementing Arashi)  
**Project Type**: Documentation (not code)  
**Performance Goals**: N/A (static documents)  
**Constraints**: Documents must be complete per GitHub issue acceptance criteria; zero [NEEDS CLARIFICATION] markers; reviewable by implementation teams without author clarification  
**Scale/Scope**: 7 design documents covering ~50 functional requirements across configuration, types, CLI, APIs, orchestration, hooks, and setup

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Single-File Executable
✅ **PASS** - Not applicable to documentation feature. Main Arashi binary remains single-file executable.

### Automatic Worktree Management  
✅ **PASS** - Not applicable to documentation feature. These docs will define the worktree management contracts.

### Error Recovery & Rollback
✅ **PASS** - Not applicable to documentation feature. D5 (Worktree Orchestration Design) will define rollback mechanisms.

### User-Centric Interface
✅ **PASS** - Documentation itself serves users (developers). D3 (CLI Command Contracts) will define user-centric command interfaces. D7 (Development Setup Guide) provides user-friendly onboarding.

### Minimalist Configuration
✅ **PASS** - Not applicable to documentation feature. D1 (Configuration Schema Design) will define minimal configuration approach.

### Cross-Platform Compatibility
✅ **PASS** - Markdown documentation is platform-agnostic.

### Test Coverage
✅ **PASS** - Documentation quality validated through manual review checklists against acceptance criteria (see `checklists/design-review.md` to be created in Phase 1).

### Semantic Versioning
✅ **PASS** - Documentation versioned implicitly through git. No version numbering required for internal design docs.

### Hook System
✅ **PASS** - Not applicable to documentation feature. D6 (Hook System Design) will define the hook contracts.

### Performance Standards
✅ **PASS** - Not applicable to documentation feature. D5 will define performance standards for worktree operations.

**Compliance Summary**: All 10 constitution principles pass. This is a documentation feature that establishes the architectural contracts for the main implementation to follow.

## Project Structure

### Documentation (this feature)

```text
specs/004-design-issues/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output - analysis of existing GitHub issues
├── data-model.md        # Phase 1 output - N/A (no data models for documentation feature)
├── quickstart.md        # Phase 1 output - contributor workflow for completing docs
├── contracts/           # Phase 1 output - document structure templates
│   └── design-doc-structure.md
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Target Documentation Location (specs/001-git-worktree-manager/)

This feature creates deliverables in the main feature spec directory:

```text
specs/001-git-worktree-manager/
├── data-model.md           # D1 Configuration Schema + D2 Type Definitions
├── contracts/
│   ├── cli-commands.md     # D3 CLI Command Contracts
│   ├── git-api.md          # D4 Git Wrapper API Design
│   ├── worktree-orchestration.md  # D5 Worktree Orchestration Design
│   └── hook-system.md      # D6 Hook System Design
├── quickstart.md           # D7 Development Setup Guide
└── checklists/
    └── design-review.md    # Review checklist for all design docs
```

**Structure Decision**: Documents are placed in `specs/001-git-worktree-manager/` because they define contracts for the main Arashi feature (Issue #1: Git Worktree Manager). This feature (004-design-issues) is a meta-task that produces documentation artifacts for feature 001.

### Source Code (repository root)

N/A - This feature produces documentation only, no source code.

## Complexity Tracking

No constitution violations to justify.

## Phase 0: Research

**Objective**: Extract and synthesize requirements from GitHub issues D1-D7 (#7-#13) to prepare for document authoring.

### Research Tasks

1. **Analyze Configuration Requirements (D1 - Issue #7)**
   - Extract all acceptance criteria from issue body
   - Identify required config.json fields
   - Document validation rules and defaults
   - Research: Review existing meta-repository configurations for patterns

2. **Analyze Type System Requirements (D2 - Issue #8)**
   - Extract all interface definitions from acceptance criteria
   - Map type definitions to configuration schema (D1)
   - Document type relationships and dependencies
   - Research: Review TypeScript best practices for CLI tooling type systems

3. **Analyze CLI Contract Requirements (D3 - Issue #9)**
   - Extract all command signatures and options
   - Document help text format expectations
   - Identify exit code conventions
   - Research: Review CLI design patterns (POSIX conventions, modern CLI tools)

4. **Analyze Git API Requirements (D4 - Issue #10)**
   - Extract all function signatures from acceptance criteria
   - Document error handling patterns
   - Identify git command parsing requirements
   - Research: Review Bun.spawn API for git command execution

5. **Analyze Orchestration Requirements (D5 - Issue #11)**
   - Extract worktree creation flow steps
   - Document rollback mechanism structure
   - Identify conflict resolution dialogs
   - Research: Review multi-step operation patterns and transaction rollback designs

6. **Analyze Hook System Requirements (D6 - Issue #12)**
   - Extract hook lifecycle and execution order
   - Document environment variable passing
   - Identify timeout and error handling rules
   - Research: Review hook systems in git, npm, cargo for patterns

7. **Analyze Setup Guide Requirements (D7 - Issue #13)**
   - Extract all required documentation sections
   - Identify target audience (new contributors)
   - Document required tooling (Bun, git)
   - Research: Review exemplary open-source quickstart guides

**Deliverable**: `research.md` containing:
- Summary of each GitHub issue's acceptance criteria
- Identified patterns and conventions
- Design decisions to be made (with rationale)
- Cross-references between documents (e.g., D2 types depend on D1 schema)

## Phase 1: Design & Contracts

**Prerequisites**: `research.md` complete, all GitHub issues reviewed

### 1. Data Model (data-model.md)

**Sections**:

#### Configuration Schema (D1)
- config.json complete structure with field descriptions
- discovered_repos nested structure
- Validation rules table (field | type | validation | default)
- Configuration version migration strategy
- Complete example configuration with inline comments

#### Type Definitions (D2)
- ArashiConfig interface (maps to config schema)
- RepoConfig interface
- WorktreeInfo interface
- OperationLogEntry interface
- Command option interfaces (InitOptions, CreateOptions, etc.)
- ArashiError class definition
- HookContext interface

**Approach**: Synthesize D1 and D2 into single data-model.md since types directly map to configuration structure.

### 2. API Contracts (contracts/ directory)

#### contracts/cli-commands.md (D3)
- Each command documented with:
  - Signature: `arashi <command> [args] [options]`
  - Description: what the command does
  - Arguments: positional args with types
  - Options/Flags: optional parameters with defaults
  - Exit codes: 0=success, 1=error, 2=user abort
  - Help text example
  - Usage examples (2-3 per command)

#### contracts/git-api.md (D4)
- Function signature table: name | parameters | return type | throws
- Error handling strategy: ArashiError with git output
- Git command execution wrapper design (Bun.spawn approach)
- Output parsing specifications for:
  - `git worktree list --porcelain`
  - `git status --porcelain`
  - `git branch --list`
  - `git show-ref`
- Repository detection utilities

#### contracts/worktree-orchestration.md (D5)
- Worktree creation flow diagram (text-based)
- OperationLog structure: `{ type, data, rollback }[]`
- Rollback execution algorithm (reverse iteration)
- Branch conflict resolution dialog flow
- Repository selection logic: all / --only / interactive
- Setup script execution strategies: sequential vs parallel
- Error aggregation approach

#### contracts/hook-system.md (D6)
- Hook discovery mechanism: `.arashi/hooks/{name}.sh`
- Hook validation: execute permissions check
- Hook execution order flow diagram
- Environment variables table: variable | description | example
- Timeout handling: 5 minutes default
- Failure handling: warn but continue (non-fatal)
- --no-hooks flag behavior

### 3. Quickstart Guide (quickstart.md - D7)

**Sections**:
- Bun installation (curl command for all platforms)
- Repository structure explanation (meta-repo with repos/arashi/)
- Dependency installation: `cd repos/arashi && bun install`
- Development testing: `bun run dev <command>`
- Test execution: `bun test`
- Binary building: `bun run build:all`
- Debugging setup: VS Code launch.json example
- Link to CONTRIBUTING.md

### 4. Design Review Checklist (checklists/design-review.md)

Create validation checklist for all seven documents:

```markdown
# Design Document Review Checklist

## D1: Configuration Schema Design
- [ ] All fields defined with types
- [ ] Validation rules documented
- [ ] Default values with rationale
- [ ] Example configuration included
- [ ] Migration path documented

## D2: Type System Design
- [ ] All interfaces defined
- [ ] Types match configuration schema
- [ ] ArashiError with exit codes
- [ ] Command options interfaces complete

## D3: CLI Command Contracts
- [ ] All 7 commands documented
- [ ] Signatures, options, flags defined
- [ ] Exit codes documented
- [ ] Help text examples included
- [ ] Usage examples for each command

## D4: Git Wrapper API Design
- [ ] All function signatures defined
- [ ] Error handling strategy documented
- [ ] Git command execution wrapper designed
- [ ] Output parsing strategies defined

## D5: Worktree Orchestration Design
- [ ] Creation flow documented
- [ ] OperationLog structure defined
- [ ] Rollback mechanism designed
- [ ] Conflict resolution defined
- [ ] Repository selection logic complete

## D6: Hook System Design
- [ ] Hook discovery documented
- [ ] Validation approach defined
- [ ] Execution order documented
- [ ] Environment variables defined
- [ ] Timeout/failure handling complete

## D7: Development Setup Guide
- [ ] Bun installation instructions
- [ ] Repository structure explained
- [ ] Development workflow documented
- [ ] Testing instructions complete
- [ ] Debugging setup included
```

### 5. Agent Context Update

Run `.specify/scripts/bash/update-agent-context.sh opencode` to add:
- Technology: Markdown documentation
- No runtime dependencies added (pure documentation feature)

## Phase 2: Task Breakdown

**Created by `/speckit.tasks` command - NOT included in this plan output.**

Tasks will organize work by document (D1-D7), with each document as an independently deliverable task.

## Validation

### Definition of Done

Each design document (D1-D7) is complete when:

1. ✅ All acceptance criteria from GitHub issue are addressed
2. ✅ Document contains zero [NEEDS CLARIFICATION] markers
3. ✅ Review checklist passes all items for that document
4. ✅ At least one other contributor reviews and approves
5. ✅ GitHub issue is closed with link to completed document

### Success Metrics (from spec.md)

- **SC-001**: All seven design documents exist at specified paths ✅
- **SC-002**: Each document passes review checklist 100% ✅
- **SC-003**: Zero [NEEDS CLARIFICATION] markers ✅
- **SC-004**: Implementation teams can use docs without clarification ✅
- **SC-005**: GitHub issues #7-#13 closed with deliverable links ✅
- **SC-006**: At least one contributor review confirms completeness ✅

## Appendix: GitHub Issue References

- **D1** (Issue #7): Configuration Schema Design → `data-model.md`
- **D2** (Issue #8): Type System Design → `data-model.md`
- **D3** (Issue #9): CLI Command Contracts → `contracts/cli-commands.md`
- **D4** (Issue #10): Git Wrapper API Design → `contracts/git-api.md`
- **D5** (Issue #11): Worktree Orchestration Design → `contracts/worktree-orchestration.md`
- **D6** (Issue #12): Hook System Design → `contracts/hook-system.md`
- **D7** (Issue #13): Development Setup Guide → `quickstart.md`
