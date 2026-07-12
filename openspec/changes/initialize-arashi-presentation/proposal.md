## Why

Arashi has detailed documentation but no concise, visual narrative for onboarding teams, explaining the multi-repository architecture, or presenting the project at talks. A maintained Slidev deck gives the project one reusable, web-accessible presentation that can support both guided talks and self-service exploration.

## What Changes

- Create a public `corwinm/arashi-presentation` repository built with Slidev and Bun.
- Build a coherent presentation covering the problem Arashi solves, its benefits, architecture, representative workflows and demos, and the near-term roadmap.
- Add presenter notes and demo guidance so the deck can be delivered consistently and adapted for different audiences.
- Add automated quality checks and GitHub Pages deployment for the static Slidev build.
- Add the presentation repository to the coordinated Arashi workspace configuration and link the live deck and source repository from the meta-repository README.

## Capabilities

### New Capabilities

- `project-presentation`: Defines the content, usability, maintenance, and online delivery requirements for the Arashi presentation.

### Modified Capabilities

None.

## Impact

- New repository: `corwinm/arashi-presentation`.
- Meta-repository: `.arashi/config.json`, `README.md`, and OpenSpec artifacts.
- Tooling/dependencies: Slidev, Vue, Bun, and GitHub Actions/GitHub Pages.
- Public surface: a hosted deck URL and a source repository linked from the Arashi project overview.
