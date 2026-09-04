# Implementation Workflow

Arashi separates cross-repository planning from repository-owned implementation.

## Ownership

```text
arashi-arashi/
├── openspec/              # Change context and canonical requirements
├── docs/                  # Workspace process guidance
└── repos/
    ├── arashi/            # CLI implementation
    ├── arashi-docs/       # Documentation site
    ├── arashi-skills/     # Agent skill package
    ├── arashi-vscode/     # VS Code extension
    └── arashi-presentation/
```

A parent commit cannot contain child-repository code. Commit and open a pull request in every repository that owns changed files.

## 1. Select the Specification Track

Confirm the issue, current behavior, affected repositories, acceptance criteria, and contract impact. Then select one track:

- **Direct implementation** — no durable product contract changes. The issue and implementation pull requests own scope, tasks, and verification.
- **Lightweight OpenSpec** — settled behavior changes a canonical requirement. Use the `lightweight` schema, which requires `proposal.md` and `specs/*/spec.md`.
- **Full OpenSpec** — use the default `spec-driven` schema when design alternatives remain or the change is destructive, migratory, security-sensitive, or difficult to reverse.

Cross-repository scope alone does not require OpenSpec when an issue fully specifies a mechanical change. Move direct work to lightweight or full OpenSpec before delivery if implementation reveals a durable contract decision.

For OpenSpec work, use Explore when requirements are unclear, create the artifacts required by the selected schema, and validate before implementation:

```bash
openspec validate <change-name> --strict
```

Pi and OpenCode provide the checked-in `/opsx-*` prompts; with Hermes, request the phase in plain language. For modified capabilities, delta requirements must preserve complete existing requirement blocks when using `## MODIFIED Requirements`.

## 2. Create the Worktree

Use Arashi when configured child repositories are affected:

```bash
aw create issue-NNN-short-name --only arashi --no-launch --no-switch
```

Add each affected child with another `--only` value or select a configured group. For meta-only work, use a normal Git branch/worktree.

Before editing, record each repository's branch, exact head, and dirty state. Do not overwrite unrelated local work.

## 3. Implement

- Write tests before runtime behavior changes.
- Keep source, tests, and repository-specific docs in the owning child repository.
- Keep durable shared requirements and OpenSpec artifacts in the parent.
- Keep implementation checklists and transient verification evidence in issues, pull requests, tests, and CI unless they establish a durable contract.
- Update docs, skills, editor integration, and generated contracts when their canonical interfaces are affected.
- Commit each repository separately and cross-link companion pull requests.

## 4. Validate

Parent repository:

```bash
openspec validate --all --strict
pnpm run format:check
pnpm run typecheck
pnpm test
pnpm run contracts:check
```

CLI repository:

```bash
pnpm run format:check
pnpm run lint
pnpm run typecheck
pnpm test
pnpm run contract:check
pnpm run build
```

Use each other child repository's `AGENTS.md` and package scripts for its exact checks. Report actual outcomes; do not describe unrun checks as passing.

## 5. Review and Deliver

1. Review the complete base-to-head diff in every changed repository.
2. Run an independent repository-aware review before the first ready-for-review push.
3. Push exact reviewed heads and open issue-linked pull requests.
4. Verify remote CI on those heads.
5. For OpenSpec tracks, merge child implementation first when the parent archives child-owned behavior.
6. Archive OpenSpec changes only after implementation is complete and approved. Direct changes need a parent pull request only when the parent itself changes.

The archived change is historical evidence; `openspec/specs/` is the post-archive canonical contract.
