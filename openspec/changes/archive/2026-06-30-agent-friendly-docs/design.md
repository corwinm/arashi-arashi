## Context

`arashi-docs` currently publishes a Starlight site from authored Markdown under `docs/`, synced/generated Starlight content under `src/content/docs/`, and a validation pipeline centered on `bun run validate`. The site already has an agent/spec workflow page and command pages, but agents still have to navigate HTML-oriented pages and infer which content is most important.

Issue #171 asks for agent-friendly docs delivery: a curated `/llms.txt`, a full Markdown export, `.md` page routes, stronger agent workflow guidance, concise command-page agent notes, and filtering so maintainer-only pages do not dominate default agent context.

The existing `starlight-llms-txt` package is worth evaluating, but its latest peer range currently advertises `astro: ^6.0.0` while `arashi-docs` uses Astro 7.0.3. The implementation should spike it before adoption; if compatibility is not clean, prefer a small custom generator that reads the authored docs source.

## Goals / Non-Goals

**Goals:**

- Provide deterministic agent-readable exports at `/llms.txt` and `/llms-full.txt`.
- Expose Markdown equivalents for public docs pages using `.md` routes.
- Preserve author-written Markdown from `docs/` as the primary source where practical.
- Keep default exports focused on Arashi usage, agent workflow, commands, and contribution flow.
- Validate generated routes/links through the existing docs validation flow.
- Strengthen the agent/spec workflow page and key command pages enough for standalone coding-agent bootstrap.
- Audit `repos/arashi-skills` and update skill content when the docs exports or workflow changes create new URLs, guidance, or entrypoints that should be reflected in packaged agent guidance.

**Non-Goals:**

- Building a full structured documentation API.
- Reworking the entire docs information architecture.
- Rewriting every command page.
- Adding new behavior to the Arashi CLI.
- Making maintainer-only migration/template pages disappear if they remain intentionally public; the default agent context only needs to exclude or demote them.

## Decisions

### Generate from authored docs source by default

Use `docs/` as the canonical input for `.md` routes and aggregate exports, with the same hidden/draft/public-page metadata interpretation used by the site where practical. This avoids HTML-to-Markdown artifacts and keeps exports aligned with what maintainers actually author.

Alternative considered: convert rendered Starlight HTML back into Markdown. That may simplify route discovery after build, but it risks noisy navigation/chrome artifacts and weaker fidelity to source docs.

### Keep `/llms.txt` curated and short

`/llms.txt` should not be a raw sitemap. It should summarize Arashi for agents, explain the ownership rule (`repos/<project>/` for implementation, meta-repo for shared context/planning), and link to the highest-value docs: agent workflow, getting started, command reference, contributing, selected command pages, `/llms-full.txt`, and Markdown route variants.

Alternative considered: generate `/llms.txt` mechanically from every public page. That would be easier but less useful for agents because maintainer and migration pages would compete with core workflow guidance.

### Use ordered include/exclude rules for full exports

`/llms-full.txt` should concatenate public docs in an intentional order: landing/getting-started, workflows, commands, contributing. It should exclude draft/hidden pages and either exclude or place low-priority maintainer references after core workflow material only if they are intentionally included.

Alternative considered: include every file under `docs/` alphabetically. That is deterministic but makes migration evidence/template pages too prominent for default agent context.

### Validate generated routes alongside existing validation

Add route smoke checks for `/llms.txt`, `/llms-full.txt`, `/workflows/agents-and-specs.md`, and `/commands/status.md`. Where practical, internal link validation should understand generated `.md` and LLM export links so broken generated links fail locally.

Alternative considered: rely on manual browser/curl checks only. Manual checks are still useful for the PR, but recurring validation should guard against later regressions.

### Spike `starlight-llms-txt`, then decide

Before taking a dependency on `starlight-llms-txt`, verify it installs and builds cleanly against Astro 7/Starlight 0.41.1 and can produce the required curated outputs without over-including noisy pages. If the peer mismatch or customization model causes churn, implement a small custom generator instead.

### Keep arashi-skills aligned when guidance changes

Treat `repos/arashi-skills` as in scope for companion updates when this work changes agent-facing recommendations, introduces new canonical docs URLs such as `/llms.txt` or `.md` routes, or improves workflow wording that belongs in the reusable Arashi skill. The docs site remains the primary implementation target, but the implementation pass should inspect the Arashi skill package and update it if leaving it unchanged would make skill users miss or contradict the new docs guidance.

Alternative considered: exclude `arashi-skills` and only update the website. That keeps the first implementation smaller, but it risks shipping improved agent guidance in one place while the package designed for agents remains stale.

## Risks / Trade-offs

- [Risk] Generated Markdown route mappings drift from canonical Starlight routes. → Mitigation: share route-slug derivation with existing docs URL helpers where possible and cover key routes in validation.
- [Risk] Full exports include maintainer-only pages that distract agents. → Mitigation: use explicit include/exclude/demotion rules and review `/llms-full.txt` ordering in smoke checks.
- [Risk] Adding a plugin with stale peer ranges creates dependency churn. → Mitigation: spike first and prefer a custom generator if Astro 7 compatibility is not clean.
- [Risk] Markdown frontmatter or MDX components leak into agent-facing output. → Mitigation: strip/normalize frontmatter and document known limitations for MDX pages; prefer clean Markdown content for docs source pages.
- [Risk] Link validation misses generated `.md` routes. → Mitigation: extend internal link checks or add a dedicated generated-export smoke script.
- [Risk] `arashi-skills` guidance drifts from the new docs entrypoints. → Mitigation: audit `repos/arashi-skills` during implementation and include a companion skills PR/update when the skill should link to or mirror the new guidance.

## Migration Plan

1. Spike `starlight-llms-txt` compatibility against the current `arashi-docs` dependency set.
2. Implement either plugin configuration or a custom deterministic generator, favoring source Markdown fidelity.
3. Update agent workflow and key command docs.
4. Audit `repos/arashi-skills`; update skill content if the new docs entrypoints or workflow guidance should be discoverable from packaged Arashi skills.
5. Add generated route/link validation and run `bun run validate`.
6. Smoke-check the generated routes locally with the built site or preview server.

Rollback is straightforward: remove generated routes/scripts/configuration and any dependency changes; existing HTML docs URLs should remain unaffected.

## Open Questions

- Should `/llms-small.txt` be included in the first implementation if it is cheap, or kept as a follow-up after `/llms.txt` and `/llms-full.txt` are proven?
- Should maintainer references be completely excluded from `/llms-full.txt` or included under a clearly lower-priority appendix when still public?
