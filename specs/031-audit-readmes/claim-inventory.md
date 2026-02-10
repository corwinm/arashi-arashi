# Claim Inventory

Feature: `031-audit-readmes`
Last updated: 2026-02-09

## Classification Rules

- `critical`: Security, legal, or primary installation claim is incorrect.
- `major`: Core command/workflow/status claim is incorrect or misleading.
- `minor`: Discoverability, wording clarity, or non-blocking context is missing.
- Resolution states: `open` or `resolved`.

## Findings and Resolutions

| Finding ID | Asset | Claim ID | Severity | Issue | Action | Resolution | Evidence |
| --- | --- | --- | --- | --- | --- | --- | --- |
| FND-001 | `README.md` | CLM-ROOT-001 | major | Root README contained stale implementation status and legacy phase claims. | update | resolved | `repos/arashi/src/index.ts`, `repos/arashi/package.json` |
| FND-002 | `README.md` | CLM-ROOT-002 | major | Root README lacked high-signal badges and did not clarify applicability scope. | update | resolved | `repos/arashi/package.json`, `repos/arashi/.github/workflows/ci.yml`, `repos/arashi/LICENSE` |
| FND-003 | `repos/arashi/README.md` | CLM-AR-001 | major | Installation and roadmap text used "coming soon" wording despite published package metadata and active command surface. | update | resolved | `repos/arashi/package.json`, `repos/arashi/src/index.ts` |
| FND-004 | `repos/arashi-skills/README.md` | CLM-SK-001 | minor | README was a placeholder title with no project context. | add-context | resolved | `README.md`, `repos/arashi/README.md` |
| FND-005 | `README.md`, `repos/arashi/README.md` | CLM-LINK-001 | major | Several links pointed to legacy `/setup/` paths in specs repository. | update | resolved | repository paths under `.specify/memory/`, `CONTRIBUTING.md` |
| FND-006 | `README.md`, `repos/arashi/README.md` | CLM-CONTRIB-001 | minor | Contribution instructions duplicated long-form text instead of canonical contribution guides. | update | resolved | `CONTRIBUTING.md`, `repos/arashi/CONTRIBUTING.md` |
| FND-007 | `README.md` | CLM-FW-001 | minor | No framework support matrix was present for spec-driven workflows. | add-context | resolved | `README.md` support matrix section |

## Completion Status

- Critical findings unresolved: `0`
- Major findings unresolved: `0`
- Minor findings unresolved: `0`
- Audit state: `verified`
