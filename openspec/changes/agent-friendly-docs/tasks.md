## 1. Discovery and Generator Choice

- [x] 1.1 Spike `starlight-llms-txt` with the current Astro 7 / Starlight 0.41 dependency set and document whether it installs, builds, and supports the required curated output shape.
- [x] 1.2 Choose either the plugin or a custom deterministic generator; if the plugin is not cleanly compatible, implement the custom generator from authored `docs/` Markdown.
- [x] 1.3 Define the public docs include/exclude/demotion rules for generated agent exports, including how draft, hidden, and maintainer-only pages are handled.

## 2. Agent-Readable Exports

- [x] 2.1 Add `/llms.txt` with a curated Arashi overview, agent interpretation guidance, and links to the agent workflow, getting started, command reference, contributing flow, `/llms-full.txt`, and representative Markdown routes.
- [x] 2.2 Add `/llms-full.txt` that concatenates relevant public docs in the intended landing/getting-started, workflows, commands, and contributing order.
- [x] 2.3 Ensure each `/llms-full.txt` page section includes a title and canonical URL.
- [x] 2.4 Exclude or demote maintainer-only migration/template/navigation/content-style pages so default agent context stays focused.

## 3. Markdown Page Routes

- [x] 3.1 Add `.md` route generation for public docs pages such as `/getting-started/index.md`, `/workflows/agents-and-specs.md`, `/commands/status.md`, and `/contributing/index.md`.
- [x] 3.2 Preserve authored Markdown content where practical and strip or normalize raw frontmatter for route output.
- [x] 3.3 Keep generated Markdown URLs aligned with canonical docs URLs and existing route-slug behavior.

## 4. Agent Workflow and Command Guidance

- [x] 4.1 Strengthen `docs/workflows/agents-and-specs.md` so it works as a standalone coding-agent bootstrap document.
- [x] 4.2 Add clear repository ownership guidance: implementation/tests/repo-specific docs in `repos/<project>/`; shared context/OpenSpec/cross-repo planning in the meta-repo.
- [x] 4.3 Add validation and handoff guidance covering affected-repo validation and focused, cross-linked PRs for multi-repo work.
- [x] 4.4 Add concise agent notes to key command pages: `status`, `create`, `pull`, `sync`, `remove`, and `shell`.

## 5. Validation and Smoke Checks

- [x] 5.1 Audit `repos/arashi-skills` for Arashi skill content that should link to or mirror the new agent-readable docs entrypoints and workflow guidance.
- [x] 5.2 Update `repos/arashi-skills` content when the audit finds stale or missing agent guidance; otherwise document why no skill changes were needed in the implementation PR notes.
- [x] 5.3 Extend internal link or export validation so required generated links and routes are checked during `bun run validate` where practical.
- [x] 5.4 Run `bun run validate` in `repos/arashi-docs` and the relevant validation for `repos/arashi-skills` if skill content changes.
- [x] 5.5 Build or serve the docs site locally and smoke-check `/llms.txt`, `/llms-full.txt`, `/workflows/agents-and-specs.md`, and `/commands/status.md`.
- [x] 5.6 Update implementation PR notes with the generator choice, validation results, smoke-check evidence, and any `arashi-skills` companion changes.
