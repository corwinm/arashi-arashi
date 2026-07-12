## Context

Arashi's public material is currently optimized for documentation and repository-level reference. Issue #38 asks for a separate Slidev repository that turns the project's value, architecture, workflows, and roadmap into a reusable talk. The deck must work as a live presentation, a self-guided web page, and a maintainable project surface without duplicating the full documentation site.

The implementation spans a new repository plus small coordination/linking changes in `arashi-arashi`. It must remain useful as Arashi evolves and must deploy without manually publishing generated files.

## Goals / Non-Goals

**Goals:**

- Deliver a polished, coherent deck suitable for team onboarding and a 20–30 minute project talk.
- Explain Arashi through a problem-to-workflow narrative with visual architecture and concrete commands.
- Keep the deck easy to run and edit with Bun and Slidev.
- Publish every accepted `main` change automatically to GitHub Pages.
- Make the deck discoverable from the Arashi meta-repository.

**Non-Goals:**

- Reproduce the complete command reference or replace `arashi-docs`.
- Create separate decks for every audience in the first release.
- Depend on a live demo environment or network access during presentation delivery.
- Export and version a PowerPoint file as the canonical source.
- Introduce a custom presentation framework or a server-side application.

## Decisions

### Use a separate `arashi-presentation` repository

The presentation will live at `corwinm/arashi-presentation`, matching the issue's separate-repository deliverable and keeping presentation dependencies, releases, and Pages settings isolated from the docs site. The meta-repository will register it as a managed child repository and link both source and deployed deck.

**Alternative considered:** place the deck in `arashi-docs`. This reduces repository count but couples talk-specific tooling and release concerns to the documentation site and does not satisfy the requested deliverable.

### Use Slidev with Bun and a focused custom theme layer

The repository will use current Slidev packages, Vue, and Bun scripts for development and production builds. The deck will use Slidev's built-in layouts, code highlighting, diagrams, presenter mode, and notes, with a small project-specific stylesheet and reusable components rather than a separately published theme package.

**Alternative considered:** generate a `.pptx`. PowerPoint is portable, but it is less reviewable as source, does not provide a natural hosted web artifact, and diverges from the issue's selected Slidev format.

### Organize the story as problem, model, workflow, proof, and future

The initial deck will be roughly 15–20 slides grouped into five sections:

1. why multi-repository work becomes difficult;
2. Arashi's coordinated-workspace model and value;
3. architecture and repository ownership;
4. command-driven workflows with reproducible demo examples;
5. current boundaries, roadmap, and calls to action.

Architecture and workflow slides will use Mermaid or native Slidev/Vue shapes. Command examples will be derived from current documented behavior and link back to canonical docs instead of embedding exhaustive references.

### Make demos deterministic and presentation-safe

Demo slides will contain commands and expected outcomes that can be presented statically. Presenter notes will distinguish optional live-demo steps from the guaranteed static narrative. The first release will not execute Arashi inside CI or require live GitHub state to render the deck.

### Deploy through GitHub Actions to GitHub Pages

A workflow triggered by pushes to `main` and manual dispatch will install with the lockfile, run validation, build Slidev with the `/arashi-presentation/` base path, upload the Pages artifact, and deploy through the official Pages actions using OIDC permissions. Pull requests will run the same non-deploying validation/build checks.

**Alternative considered:** Netlify. It offers previews, but GitHub Pages keeps the new repository self-contained and requires no external account configuration for the initial public deck.

### Treat source quality and visual review as release gates

Repository scripts will provide at least `dev`, `build`, and `validate`. Validation will include formatting/Markdown checks and a production build. The implementation review will render the deck and inspect every slide for overflow, contrast, alignment, code readability, and speaker-note completeness before it is considered ready.

## Risks / Trade-offs

- **Deck facts can drift from the CLI and docs** → Keep detailed reference content in `arashi-docs`, link to canonical pages, and include a maintenance note/checklist in the presentation README.
- **GitHub Pages subpath can break assets or navigation** → Configure and test the explicit `/arashi-presentation/` base path in the production build.
- **A broad audience can make the story unfocused** → Optimize the first deck for technical team onboarding and a 20–30 minute talk; use presenter notes to mark optional detail.
- **Live demos can fail because of network or repository state** → Make every demo understandable from static commands and expected output; keep live execution optional.
- **Mermaid and code blocks can become unreadable on projectors** → Limit diagram density, keep code excerpts short, and verify rendered slides at presentation resolution.

## Migration Plan

1. Create the public `corwinm/arashi-presentation` repository with its default `main` branch.
2. Add the Slidev source, assets, theme styles/components, checks, and deployment workflow.
3. Enable GitHub Pages with GitHub Actions as the deployment source.
4. Verify the production build and deployed URL.
5. Add the repository to `.arashi/config.json` and add source/live links to the meta-repository README.
6. If deployment must be rolled back, disable the Pages workflow while retaining the deck source and local build commands.

## Open Questions

None required before implementation. A custom domain and additional audience-specific variants can be evaluated after the initial deck is in use.
