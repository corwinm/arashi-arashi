## Why

Arashi has detailed documentation but no concise, visual narrative for onboarding teams, explaining how it makes Git worktrees practical, showing how that model scales across multiple repositories, or presenting the project at talks. A maintained Slidev deck gives the project one reusable, web-accessible presentation that can support both guided talks and self-service exploration.

## What Changes

- Create a public `corwinm/arashi-presentation` repository built with Slidev and pnpm.
- Build a coherent presentation that leads with Git worktree isolation and parallel-development workflows, then shows how Arashi extends the same model through meta-repositories and coordinated multi-repository workspaces.
- Cover Arashi's benefits, architecture, representative workflows and demos, companion integrations, and near-term roadmap without treating the meta-repository as the whole product.
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
