## 1. Repository Bootstrap

- [x] 1.1 Create the public `corwinm/arashi-presentation` repository with MIT licensing, a focused README, and the `main` default branch
- [x] 1.2 Initialize Slidev and Vue with pnpm scripts, a pinned `packageManager` field, committed `pnpm-lock.yaml`, ignore rules, and project metadata
- [x] 1.3 Add contributor-facing commands and maintenance guidance for local authoring, validation, building, and keeping deck claims current

## 2. Narrative and Visual Foundation

- [x] 2.1 Define an Arashi-specific color, typography, spacing, and reusable component system with accessible contrast
- [x] 2.2 Build the opening around two explicit problems: parallel work that needs managed Git worktrees and organizational codebases distributed across repositories that need a meta-repository coordination surface
- [x] 2.3 Build the first problem/solution pillar around native worktrees and how Arashi simplifies creating, discovering, entering, inspecting, and removing isolated workspaces for parallel humans and agents
- [x] 2.4 Build the second problem/solution pillar around how a meta-repository coordinates planning, status, and execution across independently versioned owning repositories
- [x] 2.5 Build a composition section showing how the two pillars combine into aligned worktrees across the relevant repositories without merging their Git histories
- [x] 2.6 Build the feature and benefit section around create, list, switch, status, remove, pull, push, exec, doctor, handoff, and companion integrations without turning it into a command reference
- [x] 2.7 Build deterministic single-repository, meta-repository, and combined coordinated-worktree demos with concise commands, expected outcomes, and links to canonical documentation
- [x] 2.8 Build the boundaries, roadmap, resources, and closing slides
- [x] 2.9 Add useful presenter notes and transitions to substantive slides, including optional live-demo guidance and static fallback points

## 3. Quality and Deployment

- [x] 3.1 Add source-quality and production-build validation scripts suitable for local use and CI
- [x] 3.2 Add pull request CI that activates the pinned pnpm version, installs from the frozen lockfile, validates the deck, and completes a production build
- [x] 3.3 Add `netlify.toml` with a pinned Node runtime, pnpm deploy-preview and production validation/build commands, the `dist` publish directory, and required route fallback behavior
- [x] 3.4 Connect the repository to Netlify, enable deploy previews and `main` production deployment, and verify the deck, navigation, assets, code highlighting, and direct links in both preview and production

## 4. Project Integration

- [x] 4.1 Register `arashi-presentation` in the meta-repository `.arashi/config.json`
- [x] 4.2 Update the meta-repository README repository list and layout with links to the presentation source and live deck
- [x] 4.3 Open focused, cross-linked implementation and meta/OpenSpec pull requests that reference issue #38

## 5. Presentation QA and Closeout

- [x] 5.1 Render every slide to images and complete an independent visual QA pass for overflow, collision, alignment, spacing, contrast, and placeholder content
- [x] 5.2 Apply at least one visual QA correction cycle and re-render affected slides to verify the fixes
- [x] 5.3 Verify extracted slide content, presenter-note coverage, links, local validation, production build, pull request checks, and the final public deployment
- [x] 5.4 Archive and sync the completed OpenSpec change after implementation approval, then update the meta PR to close issue #38
