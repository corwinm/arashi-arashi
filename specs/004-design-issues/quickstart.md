# Quickstart: Completing Design Phase Documentation

**Feature**: 004-design-issues  
**Audience**: Contributors working on design documents D1-D7  
**Time to Complete**: ~20 hours total (distributed across 7 documents)

## Overview

This guide walks through the process of completing the seven design documents (D1-D7) for the Arashi git worktree manager project. These documents establish architectural contracts before implementation begins.

## Prerequisites

- **GitHub Access**: Ability to read issues #7-#13 and close them when complete
- **Git**: For committing completed documentation
- **Text Editor**: Markdown-capable editor (VS Code, Vim, Emacs, etc.)
- **Context**: Familiarity with git worktrees, CLI design, and TypeScript

## Repository Structure

```
arashi-arashi/                    # Meta-repository (specifications)
├── specs/
│   ├── 001-git-worktree-manager/ # Target location for design docs
│   │   ├── spec.md               # Feature specification (already complete)
│   │   ├── data-model.md         # YOU CREATE: D1 + D2
│   │   ├── contracts/            # YOU CREATE: D3, D4, D5, D6
│   │   │   ├── cli-commands.md
│   │   │   ├── git-api.md
│   │   │   ├── worktree-orchestration.md
│   │   │   └── hook-system.md
│   │   ├── quickstart.md         # YOU CREATE: D7
│   │   └── checklists/
│   │       └── design-review.md  # YOU CREATE: Validation checklist
│   └── 004-design-issues/        # This feature's planning docs
│       ├── spec.md
│       ├── plan.md
│       ├── research.md           # Reference for writing
│       └── quickstart.md         # This file
└── .specify/
    └── memory/
        └── constitution.md       # Project principles (reference)
```

## Workflow

### Step 1: Set Up Your Environment

```bash
# Clone the repository if you haven't already
git clone https://github.com/corwinm/arashi-arashi.git
cd arashi-arashi

# Switch to the design-issues branch
git checkout 004-design-issues

# Create the target directories
mkdir -p specs/001-git-worktree-manager/contracts
mkdir -p specs/001-git-worktree-manager/checklists
```

### Step 2: Read Background Materials

Before writing, familiarize yourself with:

1. **GitHub Issues**: Read issues #7-#13 for acceptance criteria
   ```bash
   gh issue view 7   # D1: Configuration Schema
   gh issue view 8   # D2: Type System
   gh issue view 9   # D3: CLI Contracts
   gh issue view 10  # D4: Git API
   gh issue view 11  # D5: Orchestration
   gh issue view 12  # D6: Hooks
   gh issue view 13  # D7: Quickstart
   ```

2. **Research Document**: `specs/004-design-issues/research.md`
   - Contains analysis of all requirements
   - Documents design decisions and rationale
   - Identifies cross-document dependencies

3. **Constitution**: `.specify/memory/constitution.md`
   - Core project principles
   - Constraints to respect in designs

### Step 3: Write Documents in Dependency Order

**Priority 1 (Critical Path)**:

1. **D1: Configuration Schema** (3 hours)
   - File: `specs/001-git-worktree-manager/data-model.md`
   - Section: "Configuration Schema"
   - Contents: config.json structure, validation rules, defaults, example
   - Reference: Issue #7, research.md "D1" section

2. **D2: Type System** (2 hours)
   - File: Same as D1 (`data-model.md`)
   - Section: "Type Definitions"
   - Contents: TypeScript interfaces matching configuration schema
   - Reference: Issue #8, research.md "D2" section

3. **D4: Git Wrapper API** (4 hours)
   - File: `specs/001-git-worktree-manager/contracts/git-api.md`
   - Contents: Function signatures, error handling, Bun.spawn wrapper design
   - Reference: Issue #10, research.md "D4" section

4. **D3: CLI Command Contracts** (4 hours)
   - File: `specs/001-git-worktree-manager/contracts/cli-commands.md`
   - Contents: All 7 command signatures, options, help text, examples
   - Reference: Issue #9, research.md "D3" section

5. **D5: Worktree Orchestration** (5 hours)
   - File: `specs/001-git-worktree-manager/contracts/worktree-orchestration.md`
   - Contents: Creation flow, rollback mechanism, conflict resolution
   - Reference: Issue #11, research.md "D5" section

**Priority 2 (Extensibility)**:

6. **D6: Hook System** (3 hours)
   - File: `specs/001-git-worktree-manager/contracts/hook-system.md`
   - Contents: Hook discovery, validation, execution order, env vars
   - Reference: Issue #12, research.md "D6" section

**Priority 3 (Onboarding)**:

7. **D7: Development Setup** (2 hours)
   - File: `specs/001-git-worktree-manager/quickstart.md`
   - Contents: Bun installation, repo structure, dev workflow
   - Reference: Issue #13, research.md "D7" section
   - **Note**: This can be written in parallel with other docs

### Step 4: Create Validation Checklist

**File**: `specs/001-git-worktree-manager/checklists/design-review.md`

Create a checklist with items for each document's acceptance criteria. Use the format:

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

[... continue for all documents ...]
```

Reference the acceptance criteria from each GitHub issue.

### Step 5: Self-Review Against Checklist

For each document you complete:

1. Open the design-review checklist
2. Go through each item for that document
3. Verify the content addresses every requirement
4. Fix any gaps or unclear sections
5. Ensure zero [NEEDS CLARIFICATION] markers remain

### Step 6: Commit Your Work

Commit each document as you complete it (don't batch all at the end):

```bash
# After completing data-model.md (D1 + D2)
git add specs/001-git-worktree-manager/data-model.md
git commit -m "docs(design): add configuration schema and type definitions (D1, D2)"

# After completing each contract document
git add specs/001-git-worktree-manager/contracts/cli-commands.md
git commit -m "docs(design): add CLI command contracts (D3)"

git add specs/001-git-worktree-manager/contracts/git-api.md
git commit -m "docs(design): add git wrapper API design (D4)"

# ... and so on
```

### Step 7: Request Review

Once all documents are complete:

1. Push your branch: `git push origin 004-design-issues`
2. Create a pull request
3. Request review from at least one other contributor
4. Address feedback and revise documents as needed

### Step 8: Close GitHub Issues

After PR is merged:

```bash
# Close each issue with link to completed document
gh issue close 7 --comment "Completed in specs/001-git-worktree-manager/data-model.md (Configuration Schema section)"
gh issue close 8 --comment "Completed in specs/001-git-worktree-manager/data-model.md (Type Definitions section)"
gh issue close 9 --comment "Completed in specs/001-git-worktree-manager/contracts/cli-commands.md"
gh issue close 10 --comment "Completed in specs/001-git-worktree-manager/contracts/git-api.md"
gh issue close 11 --comment "Completed in specs/001-git-worktree-manager/contracts/worktree-orchestration.md"
gh issue close 12 --comment "Completed in specs/001-git-worktree-manager/contracts/hook-system.md"
gh issue close 13 --comment "Completed in specs/001-git-worktree-manager/quickstart.md"
```

## Writing Tips

### 1. Use Concrete Examples

Instead of:
> "The configuration file contains repository metadata"

Write:
> "The configuration file contains repository metadata:
> ```json
> {
>   "discovered_repos": {
>     "backend": {
>       "path": "repos/backend",
>       "default_branch": "main",
>       "remote": "origin"
>     }
>   }
> }
> ```

### 2. Document the "Why"

Always include rationale for design decisions:

> **Decision**: Hook failures are non-fatal (warn but continue)
> 
> **Rationale**: User automation shouldn't break core functionality. If a hook fails, the user should be notified, but worktree creation should still succeed.

### 3. Think Like an Implementer

Write contracts that implementation teams can follow without asking questions:

❌ Bad: "Handle branch conflicts appropriately"

✅ Good: "When creating a worktree, if a branch already exists:
> 1. Display conflict dialog
> 2. Offer options: (A) Use existing branch, (B) Create new branch with suffix, (C) Abort
> 3. Default to option A with [Enter]
> 4. Execute user's choice"

### 4. Be Specific About Data Structures

Define exact field names, types, and constraints:

```typescript
interface RepoConfig {
  path: string;              // Relative path from meta-repo root
  default_branch: string;    // Remote's default branch name (e.g., "main")
  remote: string;            // Remote name (typically "origin")
  has_setup_script: boolean; // True if setup.sh exists in repo root
  git_url: string;           // Full git URL (e.g., "https://github.com/user/repo.git")
}
```

### 5. Use Diagrams for Flows

Text-based diagrams clarify multi-step processes:

```
Worktree Creation Flow:
┌────────────────────────────────────────────────────┐
│ 1. Validate: Check branch name, config exists     │
└────────────────┬───────────────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────────────────┐
│ 2. Fetch: Pull latest from default branches       │
└────────────────┬───────────────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────────────────┐
│ 3. Create Main: Main repo worktree                │
│    Log operation for rollback                     │
└────────────────┬───────────────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────────────────┐
│ 4. Create Sub-repos: Loop through each            │
│    - Check branch conflicts                       │
│    - Create branches if needed                    │
│    - Create worktrees                            │
│    - Log each operation                          │
└────────────────┬───────────────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────────────────┐
│ 5. Setup: Run setup scripts if auto_setup=true    │
└────────────────┬───────────────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────────────────┐
│ Success: Display created worktree paths           │
└────────────────────────────────────────────────────┘

Error at any step → Rollback all logged operations
```

## Troubleshooting

### "I don't understand the requirement"

1. Check the GitHub issue's acceptance criteria
2. Read the research.md analysis for that document
3. Look at the constitution for project principles
4. Ask in the PR or issue comments

### "Requirements conflict between documents"

Document both conflicting requirements with cross-references:

> **Conflict Detected**: D3 specifies `--parallel` flag for setup command, but D5 defines setup execution as "sequential by default, parallel with --parallel flag". These align.

If they truly conflict, document the conflict and escalate for architectural decision.

### "I can't finish a document without code examples"

Design documents should not include implementation code. Instead:
- Use TypeScript interfaces for type definitions
- Use pseudocode or algorithm descriptions for logic
- Use function signatures for API contracts

Example:
```typescript
// Type definition (good for design docs)
function createWorktree(repoPath: string, branch: string, location: string): Promise<void>;

// NOT implementation code (save for implementation phase)
async function createWorktree(repoPath, branch, location) {
  const result = await Bun.spawn(['git', 'worktree', 'add', ...]);
  // ... implementation details
}
```

## Success Criteria

You've completed this feature when:

✅ All seven documents exist at their specified paths  
✅ design-review.md checklist passes 100% for all documents  
✅ Zero [NEEDS CLARIFICATION] markers remain in documents  
✅ At least one reviewer has approved the documents  
✅ All GitHub issues #7-#13 are closed with links to deliverables  
✅ Implementation teams can reference docs without clarifying questions

## Next Steps

After completing design documentation:
- Implementation tasks will be defined in `/speckit.tasks` command output
- Foundation tasks (F1-F6) can begin using these design documents as contracts
- Core logic tasks (C1-C3) can follow with clear specifications

## Questions?

- Open an issue in the arashi-arashi repository
- Comment on the relevant GitHub issue (#7-#13)
- Ask in the pull request for this feature
