## Context

Issue `#89` identifies a documentation gap rather than a single missing page. The current docs site already has strong command pages and a landing animation, but it does not yet present a complete information path for users who need to understand hooks, configuration defaults, integrations, and agent-oriented workflows. The README contains some of this material, but discovery is uneven between the landing page, getting-started flow, and deeper docs pages.

This change is cross-cutting across `repos/arashi-docs/`, `repos/arashi/README.md`, and potentially `repos/arashi-skills/` links. The work is content and navigation heavy, with light metadata updates for social sharing. The issue also mentions init-flow guidance, but that request is ambiguous enough that this design treats it as a documentation and onboarding concern unless later implementation work justifies a CLI behavior change.

Constraints:
- Preserve the existing command-accurate docs pages as the source of detailed behavior.
- Keep the landing page concise even while adding more discoverability.
- Avoid introducing new command behavior requirements unless explicitly specified in a later change.
- Keep cross-repo messaging aligned so the docs site, README, and skills references do not drift.

## Goals / Non-Goals

**Goals:**
- Make the docs landing page and metadata communicate Arashi's purpose with clearer tagline reuse and stronger social-share copy.
- Add discoverable docs paths for hooks, configuration options, and integrations such as VSCode, tmux, and tmux plus sesh.
- Add guidance for agent-assisted and spec-driven workflows, including where implementation belongs versus where specs and planning artifacts belong.
- Ensure onboarding entry points in the landing page, getting-started content, and README route users toward the new workflow guidance.

**Non-Goals:**
- Redesigning the entire docs site visual system.
- Changing command semantics for `init`, `switch`, hooks, or integrations.
- Replacing detailed command pages with high-level overview pages.
- Standardizing on a single external agent framework beyond documenting supported guidance patterns.

## Decisions

1. Add overview guidance pages instead of overloading command pages.
- Decision: Implement new or expanded overview pages for workflow topics, while existing command pages remain the source of command behavior.
- Rationale: Hooks, config defaults, integrations, and agent workflows span multiple commands and are hard to learn from command pages alone.
- Alternatives considered:
  - Expanding each command page independently: would spread the narrative across too many pages and make discovery worse.
  - Putting all new content on the landing page: would make the landing page too dense.

2. Use one canonical message across landing metadata, landing hero copy, and README summary.
- Decision: Treat the README tagline and one-sentence product description as the canonical source for landing and social-share messaging, adapting only for channel length.
- Rationale: The site and repository should answer "what is Arashi" the same way, especially in link previews and first-screen content.
- Alternatives considered:
  - Separate marketing copy for each surface: allows tailoring, but creates drift risk.
  - Reusing only the existing docs description: less coordination, but misses the issue's request to surface README tagline value.

3. Model integrations as a curated workflow section with explicit tool examples.
- Decision: Document VSCode, tmux, and tmux plus sesh as first-class integration subsections with links back to command pages and existing setup details.
- Rationale: These are not isolated features; they are workflow choices users evaluate together.
- Alternatives considered:
  - Mention integrations only inline on command pages: technically accurate, but hard to compare or discover.
  - Create one page per integration with no index page: richer depth, but weaker onboarding.

4. Put agent and spec-driven guidance in docs, not only in repository policy files.
- Decision: Capture implementation-vs-spec boundaries, AGENTS-style rules, and SDD framework suggestions in user-facing docs pages that can link to canonical repo files where appropriate.
- Rationale: Users and contributors need this guidance before they are deep enough in the repo to discover root policy files.
- Alternatives considered:
  - Relying on `AGENTS.md` alone: too hidden for many users.
  - Writing only prose in the README: insufficient structure for longer-term maintenance.

5. Keep init-flow changes limited to navigation and recommendation unless a later change expands CLI behavior.
- Decision: Route users from landing and getting-started pages into hooks/config/integration guidance after `arashi init`, rather than proposing prompt or CLI changes in this change.
- Rationale: The issue asks to consider init guidance, but the strongest need is discoverability, not necessarily new runtime behavior.
- Alternatives considered:
  - Expanding `arashi init` prompts now: larger behavioral scope with no spec basis yet.
  - Ignoring init entirely: would leave onboarding disconnected from the new guidance sections.

## Risks / Trade-offs

- [Risk] Landing-page messaging becomes crowded as more entry points are added -> Mitigation: keep the hero concise and move detailed pathways into a short navigation or workflow chooser section.
- [Risk] New overview pages duplicate command documentation and drift over time -> Mitigation: keep overview pages focused on when-to-use and cross-linking, with command details delegated to command pages.
- [Risk] Agent and SDD guidance becomes tool-specific or stale -> Mitigation: document durable workflow rules and examples, not narrow vendor-specific instructions.
- [Risk] README and docs site evolve independently -> Mitigation: define a canonical summary structure and include parity checks in implementation tasks.

## Migration Plan

1. Update docs landing-page content and site metadata to reflect the canonical tagline and social-share summary.
2. Add or expand workflow overview content for hooks, configuration, integrations, and agent or spec-driven usage.
3. Update README and any skills-facing links so top-level onboarding points to the same guidance paths.
4. Validate navigation, markdown rendering, and docs build behavior.
5. Roll back by reverting content and metadata changes if the new structure reduces clarity or introduces broken navigation.

## Open Questions

- Should the workflow guidance live under a new top-level sidebar section or under Getting Started and Contributing with prominent cross-links?
- Does `repos/arashi-skills/` need direct content changes, or are updated links and references sufficient for this change?
- Is there an existing social preview image strategy in the docs site that should be updated along with title and description copy?
