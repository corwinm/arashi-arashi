## Why

Arashi now ships `aw` as a first-class executable, but maintained guidance still teaches `arashi` as the preferred command, creating two competing conventions. The project needs one concise user-facing spelling while preserving every legacy invocation and identifier contract.

## What Changes

- Make `aw` the primary spelling in maintained user command examples, quick starts, tutorials, troubleshooting, shell/completion/update guidance, companion surfaces, and agent guidance.
- Keep one concise compatibility note where introductory context needs it: `arashi` remains supported for existing scripts and workflows.
- Preserve Arashi product naming and `arashi` package, repository, URL, configuration/schema, environment-variable, native-binary, installer, extension-command, and historical identifiers.
- Regenerate docs Markdown/LLM exports and packaged skills only through their owning deterministic generators.
- Extend repository-local and coordinated semantic checks with positive/negative fixtures so preferred-command regressions fail without rejecting valid identifiers, history, or explicitly labeled compatibility examples.
- Do not remove, deprecate, or change behavior of either executable.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `executable-aliases`: Define `aw` as the primary documented command spelling while preserving `arashi` as a supported legacy-compatible executable and identifier.
- `cross-repo-command-contracts`: Enforce the documented-command naming policy and identifier boundaries across every configured maintained surface with regression fixtures.
- `cli-readme-value-example`: Require CLI introductory and workflow examples to lead with `aw` and carry a concise compatibility note.
- `docs-landing-and-social-content`: Require introductory website guidance to lead naturally with `aw` without repeatedly expanding the letters.
- `docs-agent-readable-exports`: Require generated Markdown and LLM exports to preserve the same preferred-command policy deterministically.
- `arashi-skill-guidance`: Require authored and packaged agent guidance to use `aw` for actionable commands while retaining identifier and compatibility exceptions.
- `project-presentation`: Require presentation terminal examples to use `aw` while retaining product identity.
- `vscode-extension-panel-guidance`: Require user-facing terminal examples in extension guidance to use `aw` without renaming extension identifiers or native executable configuration.

## Impact

- `corwinm/arashi`: maintained README/install/shell/completion/update/troubleshooting guidance and repository-local naming-policy validation.
- `corwinm/arashi-docs`: authored website content, semantic checks, generated Markdown routes, `llms.txt`, and `llms-full.txt`.
- `corwinm/arashi-skills`: authored skill references, package semantic checks, and deterministically extracted package validation.
- `corwinm/arashi-presentation`: maintained slides/examples and presentation validation.
- `corwinm/arashi-vscode`: extension-facing documentation/examples and local validation; runtime IDs and binary configuration remain unchanged.
- `corwinm/arashi-arashi`: OpenSpec deltas, naming-policy fixtures, and coordinated semantic validation.
