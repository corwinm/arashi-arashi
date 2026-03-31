## Why

Arashi's documentation covers command behavior, but it does not yet give users a strong content path for the workflows they are actually trying to set up: hooks, configuration defaults, IDE and terminal integrations, and agent/spec-driven usage. We need to expand the docs now so the site, README, and supporting guidance reflect the current product surface and help users choose the right setup without piecing it together from scattered pages.

## What Changes

- Expand the docs landing experience to reuse the README tagline more clearly and improve social share messaging so the site's purpose is obvious before a user reads deep docs.
- Add or reorganize docs content for hooks, configuration options, and integrations including VSCode, tmux, and tmux plus sesh workflows.
- Add guidance for agent-assisted and spec-driven workflows, including where implementation work belongs versus where specs and context belong.
- Add cross-links from onboarding content so users can discover the new guidance from the landing page, getting started flow, and canonical README/docs entry points.
- Scope any init-flow guidance updates to documentation and onboarding recommendations unless a later artifact explicitly defines CLI behavior changes.

## Capabilities

### New Capabilities
- `docs-landing-and-social-content`: Define requirements for landing-page and social-share content that communicate Arashi's purpose with the canonical README tagline and clearer entry points.
- `docs-workflow-guidance-sections`: Define requirements for documentation sections covering hooks, configuration options, and editor or terminal integrations with actionable navigation.
- `docs-agent-sdd-guidance`: Define requirements for agent usage guidance, implementation-versus-spec boundaries, and recommended spec-driven development workflow references.

### Modified Capabilities
- None.

## Impact

- Affected code/content: `repos/arashi-docs/` landing page content, page metadata, navigation, and workflow guides; `repos/arashi/README.md`; potentially `repos/arashi-skills/` guidance links where docs navigation or workflow references need alignment.
- Affected systems: documentation site discoverability, repository onboarding content, and agent/workflow guidance.
- Dependencies: existing Astro/Starlight docs structure, current README messaging, and existing command documentation that new overview pages must link to accurately.
