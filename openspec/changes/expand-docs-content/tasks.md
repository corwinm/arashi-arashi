## 1. Finalize canonical docs messaging

- [x] 1.1 Confirm the canonical tagline and one-sentence product summary to reuse across the landing page, metadata, and README
- [x] 1.2 Decide the landing-page entry points that will route users to getting started, workflow guidance, integrations, and contributor or agent guidance

## 2. Update landing and social content in `repos/arashi-docs`

- [x] 2.1 Update `docs/index.mdx` hero and supporting copy to surface the canonical tagline and clearer product summary
- [x] 2.2 Update docs-site metadata in `astro.config.mjs` and any related landing metadata so social previews match the landing and README message
- [x] 2.3 Add or revise landing-page actions or cross-links so workflow guidance is discoverable without entering command pages first

## 3. Add workflow guidance sections

- [x] 3.1 Create or expand docs pages for hooks and configuration guidance with links back to detailed command references
- [x] 3.2 Create or expand integrations guidance covering VSCode, tmux, and tmux plus sesh workflows
- [x] 3.3 Update sidebar structure and onboarding cross-links so the new workflow pages are reachable from primary navigation and getting-started content

## 4. Add agent and spec-driven workflow guidance

- [x] 4.1 Add a docs page or section that explains implementation-versus-spec boundaries for agent-assisted workflows
- [x] 4.2 Document AGENTS-style workflow rules and recommended spec-driven development references in contributor-facing guidance
- [x] 4.3 Add explicit next-step links from the agent or workflow guidance to proposal, design, tasks, and implementation flows

## 5. Sync repository onboarding content

- [x] 5.1 Update `repos/arashi/README.md` so it mirrors the canonical message and links to the new workflow guidance sections
- [x] 5.2 Review `repos/arashi-skills/` references and update any docs or links that need to align with the new guidance structure

## 6. Validate and prepare for implementation review

- [x] 6.1 Verify docs navigation, cross-links, and markdown rendering across the landing page, getting-started content, and new workflow pages
- [x] 6.2 Run the relevant docs and repository validation commands for each touched repo and fix any broken links or build issues
- [x] 6.3 Review landing, README, and workflow guidance for message parity so the same product story is told across surfaces
