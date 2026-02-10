# Evidence Map

Feature: `031-audit-readmes`
Last updated: 2026-02-09

## Canonical Evidence References

| Evidence ID | Source | What it verifies |
| --- | --- | --- |
| EVD-001 | `repos/arashi/package.json` | Package name/version, npm metadata, supported platforms, scripts |
| EVD-002 | `repos/arashi/.github/workflows/ci.yml` | CI workflow name, quality/test/build/validate jobs |
| EVD-003 | `repos/arashi/LICENSE` | License type (MIT) |
| EVD-004 | `repos/arashi/src/index.ts` | Current CLI command surface (`init`, `add`, `create`, `list`, `status`, `remove`, `pull`, `sync`, `setup`) |
| EVD-005 | `repos/arashi/docs/INSTALLATION.md` | Installation guidance and usage references |
| EVD-006 | `repos/arashi/docs/hooks.md` | Hook behavior and script naming |
| EVD-007 | `CONTRIBUTING.md` | Canonical contribution flow for specs repository |
| EVD-008 | `repos/arashi/CONTRIBUTING.md` | Canonical contribution flow for implementation repository |

## Badge Source Mapping

| Badge type | Image URL pattern | Target URL |
| --- | --- | --- |
| npm | `https://img.shields.io/npm/v/arashi.svg` | `https://www.npmjs.com/package/arashi` |
| ci | `https://github.com/corwinm/arashi/actions/workflows/ci.yml/badge.svg` | `https://github.com/corwinm/arashi/actions/workflows/ci.yml` |
| license | `https://img.shields.io/github/license/corwinm/arashi.svg` | `https://github.com/corwinm/arashi/blob/main/LICENSE` |

## Claim Verification Notes

- Root repository README claims are scoped to documentation/spec workflow unless explicitly labeled as implementation-specific.
- Implementation claims in root README and `repos/arashi-skills/README.md` link back to `repos/arashi/README.md` for command-level details.
- All major claims in scope were mapped to at least one evidence source and resolved.
