## Why

The Arashi skill currently duplicates workflow details and command options that already live in references or the CLI help output. Keeping `SKILL.md` minimal reduces drift and makes the installed skill a stable routing/policy card instead of a second command manual.

## What Changes

- Refocus `repos/arashi-skills/skills/arashi/SKILL.md` on when to use the skill, core operating rules, and reference links.
- Direct agents to use `arashi --help` and `arashi <command> --help` as the source of truth for current command parameters before advising on flags.
- Move or preserve detailed workflow, command, troubleshooting, and security guidance in existing reference files rather than duplicating it in the top-level skill.
- Update package/readme guidance if needed so future contributors maintain the minimal-skill/reference-detail split.

## Capabilities

### New Capabilities
- `arashi-skill-guidance`: Defines the expected structure and behavior of the Arashi skill package guidance, including minimal top-level skill instructions and linked detailed references.

### Modified Capabilities

## Impact

- Affected repository: `repos/arashi-skills/`
- Primary files: `skills/arashi/SKILL.md`, potentially `skills/arashi/README.md`, repository `README.md`, and reference files under `skills/arashi/references/`
- No Arashi CLI behavior, APIs, or runtime dependencies change.
