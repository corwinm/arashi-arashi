## Why

Arashi has detailed documentation but no concise, visual narrative organized around the two common development problems it solves: teams need Git worktrees to perform parallel work without repeatedly switching branches or duplicating clones, and many organizations need a meta-repository to coordinate changes across codebases that are distributed among many repositories. A maintained Slidev deck gives the project one reusable, web-accessible presentation that can support both guided talks and self-service exploration.

## What Changes

- Create a public `corwinm/arashi-presentation` repository built with Slidev and pnpm.
- Build a coherent presentation around two equal problem/solution pillars: parallel development through managed Git worktrees, and distributed-codebase coordination through a meta-repository and coordinated worktrees.
- Show how the two pillars work independently and together, then cover Arashi's benefits, architecture, representative workflows and demos, companion integrations, and near-term roadmap.
- Add presenter notes and demo guidance so the deck can be delivered consistently and adapted for different audiences.
- Add automated quality checks, Netlify deploy previews, and production deployment for the static Slidev build.
- Add the presentation repository to the coordinated Arashi workspace configuration and link the live deck and source repository from the meta-repository README.

## Capabilities

### New Capabilities

- `project-presentation`: Defines the content, usability, maintenance, and online delivery requirements for the Arashi presentation.

### Modified Capabilities

None.

## Impact

- New repository: `corwinm/arashi-presentation`.
- Meta-repository: `.arashi/config.json`, `README.md`, and OpenSpec artifacts.
- Tooling/dependencies: Slidev, Vue, pnpm, GitHub Actions, and Netlify.
- Public surface: a hosted deck URL and a source repository linked from the Arashi project overview.
