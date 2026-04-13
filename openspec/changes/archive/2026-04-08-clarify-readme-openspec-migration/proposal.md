## Why

Both the meta-repo README in `arashi-arashi` and the implementation README in `repos/arashi` need to reflect the project's current OpenSpec-based workflow without erasing the fact that the work started from SpecKit-oriented assumptions. Right now the root README still documents SpecKit as the primary path, which can mislead readers about how this project is actually operated today.

## What Changes

- Update the meta-repo `README.md` to describe OpenSpec as the current spec workflow for this project.
- Revise the meta-repo workflow steps, framework matrix, and related onboarding copy so SpecKit-specific requirements are not presented as the active path.
- Update `repos/arashi/README.md` so any spec-workflow references stay aligned with the current OpenSpec-based project workflow.
- Add concise transition language that makes it clear the work began with SpecKit-oriented setup but now uses OpenSpec successfully.
- Keep both README surfaces internally consistent with each other and with the current repository structure and command guidance.

## Capabilities

### New Capabilities
- `meta-repo-readme-openspec-guidance`: Define requirements for the root `arashi-arashi` README to describe the current OpenSpec workflow and treat SpecKit references as historical context.

### Modified Capabilities
- `cli-readme-value-example`: Expand README onboarding requirements so the child-repo README accurately reflects the project's OpenSpec-based workflow and explicitly avoids stale SpecKit-only framing.

## Impact

- Affected code/content: root `README.md` in `arashi-arashi` and `repos/arashi/README.md` in the child CLI repo.
- Affected systems: meta-repo onboarding documentation, child-repo onboarding documentation, and any README tables or workflow explanations tied to planning tooling.
- Dependencies: existing README structure, current OpenSpec workflow terminology, and cross-repo wording consistency; no runtime CLI or API changes.
