## Why

Arashi's docs are useful for humans, but coding agents need a smaller set of high-signal, fetchable entrypoints that explain the meta-repo workflow without requiring HTML navigation. Adding curated LLM exports and Markdown page routes will make it easier for agents to bootstrap safely: inspect the workspace, identify the owning child repo, keep planning in the meta-repo, and validate focused changes before handoff.

## What Changes

- Add curated agent-facing documentation entrypoints at `/llms.txt` and `/llms-full.txt`.
- Expose Markdown equivalents for public docs pages via `.md` URLs while preserving authored Markdown content where practical.
- Strengthen the existing agent/spec workflow guidance so it works as a standalone bootstrap document for coding agents.
- Add concise agent notes to key command pages such as `status`, `create`, `pull`, `sync`, `remove`, and `shell`.
- Keep generated LLM/Markdown exports focused on public contribution and workflow guidance, excluding or demoting maintainer-only migration/template/noise pages.
- Validate generated exports and smoke-check the important generated routes locally.

## Capabilities

### New Capabilities
- `docs-agent-readable-exports`: Public documentation can be fetched through curated LLM entrypoints and Markdown route variants suitable for coding-agent context.

### Modified Capabilities
- `docs-agent-sdd-guidance`: Agent/spec workflow guidance becomes a standalone bootstrap page that clearly states repository ownership, validation, and PR handoff expectations.

## Impact

- Affected repo: `repos/arashi-docs`.
- Likely affected areas: docs source pages under `docs/`, Starlight/Astro routing or static generation code, validation/link-check scripts, and package dependencies if a compatible LLM-export integration is adopted.
- No breaking changes to the Arashi CLI or existing docs URLs.
- The implementation should preserve the current source-of-truth model: authored docs in `docs/`, synced/generated Starlight content in `src/content/docs/`, and deterministic exports validated by the docs build or validation flow.
