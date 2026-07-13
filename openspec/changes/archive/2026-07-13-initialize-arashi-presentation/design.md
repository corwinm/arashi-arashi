## Context

Arashi's public material is currently optimized for documentation and repository-level reference. Issue #38 asks for a separate Slidev repository that turns the project's value, architecture, workflows, and roadmap into a reusable talk. The deck must work as a live presentation, a self-guided web page, and a maintainable project surface without duplicating the full documentation site.

The implementation spans a new repository plus small coordination/linking changes in `arashi-arashi`. It must remain useful as Arashi evolves and must deploy without manually publishing generated files.

## Goals / Non-Goals

**Goals:**

- Deliver a polished, coherent deck suitable for team onboarding and a 20–30 minute project talk.
- Present Arashi as the solution to two equally important development problems: managing Git worktrees for safe parallel work and using a meta-repository to coordinate work across an organization's distributed codebase.
- Show how these solutions work independently and combine into coordinated multi-repository worktrees when both problems are present.
- Keep the deck easy to run and edit with pnpm and Slidev.
- Publish every accepted `main` change automatically to Netlify and provide deploy previews for pull requests.
- Make the deck discoverable from the Arashi meta-repository.

**Non-Goals:**

- Reproduce the complete command reference or replace `arashi-docs`.
- Create separate decks for every audience in the first release.
- Depend on a live demo environment or network access during presentation delivery.
- Export and version a PowerPoint file as the canonical source.
- Introduce a custom presentation framework or a server-side application.

## Decisions

### Use a separate `arashi-presentation` repository

The presentation will live at `corwinm/arashi-presentation`, matching the issue's separate-repository deliverable and keeping presentation dependencies and releases isolated from the docs site. The meta-repository will register it as a managed child repository and link both source and deployed deck.

**Alternative considered:** place the deck in `arashi-docs`. This reduces repository count but couples talk-specific tooling and release concerns to the documentation site and does not satisfy the requested deliverable.

### Use Slidev with pnpm and a focused custom theme layer

The repository will use current Slidev packages, Vue, and pnpm scripts for development and production builds. It will pin pnpm through the `packageManager` field, commit `pnpm-lock.yaml`, and use Corepack where the environment does not already provide the pinned package manager. Starting the new repository on pnpm avoids an immediate package-manager migration and provides a low-risk proving ground for Arashi's possible broader move from Bun to pnpm. The deck will use Slidev's built-in layouts, code highlighting, diagrams, presenter mode, and notes, with a small project-specific stylesheet and reusable components rather than a separately published theme package.

**Alternative considered:** generate a `.pptx`. PowerPoint is portable, but it is less reviewable as source, does not provide a natural hosted web artifact, and diverges from the issue's selected Slidev format.

### Organize the story around two problem/solution pillars

The central framing will explicitly name two common problems rather than presenting one as merely an advanced form of the other:

1. **Parallel work problem:** Developers and agents need to work on several branches simultaneously without interrupting one another, repeatedly switching the primary checkout, or maintaining ad hoc duplicate clones. Arashi makes Git worktrees approachable and manages their lifecycle.
2. **Distributed codebase problem:** An organization's product or platform is often spread across many independently versioned repositories, but features and operational changes still need one coherent place for planning, status, and coordinated execution. Arashi uses a meta-repository to describe that larger workspace and coordinate worktrees across the owning repositories.

These are equal value propositions. A user can adopt Arashi for either problem independently. When both are present, the meta-repository and worktree capabilities compose: one feature workspace can contain aligned worktrees across the relevant repositories while each repository retains its own commits, reviews, and release history.

The initial deck will be roughly 15–20 slides grouped into five sections:

1. the two recurring development problems and why existing manual practices are costly;
2. the worktree solution: isolated parallel work and the simpler Arashi lifecycle for creating, entering, inspecting, and removing workspaces;
3. the meta-repository solution: one coordination surface over a distributed codebase while each owning repository keeps independent Git history;
4. how the two solutions compose, demonstrated through reproducible single-repository and coordinated multi-repository workflows;
5. current boundaries, roadmap, and calls to action.

The worktree and meta-repository stories will receive equal visual and narrative weight. Architecture and workflow slides will use Mermaid or native Slidev/Vue shapes for three distinct views: isolated worktrees around one repository, a meta-repository coordinating a distributed set of owning repositories, and the combined coordinated-worktree model. Command examples will be derived from current documented behavior and link back to canonical docs instead of embedding exhaustive references.

### Make demos deterministic and presentation-safe

Demo slides will contain commands and expected outcomes that can be presented statically. Presenter notes will distinguish optional live-demo steps from the guaranteed static narrative. The first release will not execute Arashi inside CI or require live GitHub state to render the deck.

### Deploy through Netlify like the Arashi documentation site

The repository will include a `netlify.toml` modeled on `arashi-docs`: Netlify will install with the pinned pnpm version and frozen `pnpm-lock.yaml`, run validation, build the static Slidev site, publish `dist`, create deploy previews for pull requests, and publish accepted `main` changes to the production site. GitHub Actions will retain an independent pull-request validation/build check so repository quality is not coupled solely to the external deployment service.

**Alternative considered:** GitHub Pages. It keeps hosting inside GitHub, but Netlify matches the established Arashi docs deployment model and provides useful per-PR visual previews for slide review.

### Treat source quality and visual review as release gates

Repository scripts will provide at least `dev`, `build`, and `validate`. Validation will include formatting/Markdown checks and a production build. The implementation review will render the deck and inspect every slide for overflow, contrast, alignment, code readability, and speaker-note completeness before it is considered ready.

## Risks / Trade-offs

- **Deck facts can drift from the CLI and docs** → Keep detailed reference content in `arashi-docs`, link to canonical pages, and include a maintenance note/checklist in the presentation README.
- **Netlify configuration can drift from the docs site's supported runtime** → Pin Node in `netlify.toml`, pin pnpm in `package.json`, and review runtime updates alongside the equivalent `arashi-docs` settings.
- **Single-page navigation can fail on direct Netlify routes** → Include the required static-site fallback/redirect behavior and verify direct slide links in deploy preview and production.
- **A broad audience can make the story unfocused** → Optimize the first deck for technical team onboarding and a 20–30 minute talk; use presenter notes to mark optional detail.
- **Live demos can fail because of network or repository state** → Make every demo understandable from static commands and expected output; keep live execution optional.
- **Mermaid and code blocks can become unreadable on projectors** → Limit diagram density, keep code excerpts short, and verify rendered slides at presentation resolution.

## Migration Plan

1. Create the public `corwinm/arashi-presentation` repository with its default `main` branch.
2. Add the Slidev source, assets, theme styles/components, checks, and deployment workflow.
3. Create and connect the Netlify site with deploy previews and `main` as the production branch.
4. Verify the production build, deploy preview, and production URL.
5. Add the repository to `.arashi/config.json` and add source/live links to the meta-repository README.
6. If deployment must be rolled back, stop Netlify auto-publishing or restore the prior production deploy while retaining the deck source and local build commands.

## Open Questions

None required before implementation. A custom domain and additional audience-specific variants can be evaluated after the initial deck is in use.
