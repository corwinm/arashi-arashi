## Why

Arashi's core value is not obvious to first-time visitors because the docs landing page and CLI README explain features, but do not quickly show the multi-repo workflow outcome. We need a clearer value proposition now so users can immediately understand how Arashi helps them coordinate parallel worktrees across frontend and backend repositories.

## What Changes

- Rework the docs landing page hero/value section to explicitly communicate the multi-repo, parallel-worktree workflow and outcome.
- Add a minimal end-to-end example that shows setting up a frontend repo and backend repo, creating worktrees for both, and switching focus while another worktree remains active.
- Add visual walkthrough assets (static sequence and lightweight animation) that demonstrate the workflow steps from setup through switching.
- Update CLI README guidance to include matching visuals and concise narrative aligned with the landing page message.

## Capabilities

### New Capabilities
- `docs-landing-value-proposition`: Define requirements for landing-page messaging that clearly explains Arashi's multi-repo parallel-worktree value.
- `multi-repo-worktree-visual-walkthrough`: Define requirements for minimal-example visuals and animation demonstrating add/create/switch flow across frontend and backend repos.
- `cli-readme-value-example`: Define requirements for a CLI README section that mirrors the value proposition with a concise, visual-first example.

### Modified Capabilities
- None.

## Impact

- Affected code/content: `repos/arashi-docs/` landing page content/components/assets and `repos/arashi/README.md`.
- Affected systems: documentation site presentation and repository-level onboarding documentation.
- Dependencies: existing docs site build pipeline/assets handling; no runtime CLI behavior or API contract changes.
