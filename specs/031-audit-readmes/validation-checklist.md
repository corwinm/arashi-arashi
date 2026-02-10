# Validation Checklist

Feature: `031-audit-readmes`
Last updated: 2026-02-09

## Link and Badge Validation Checklist

- [x] Root README links to `CONTRIBUTING.md` in one click.
- [x] `repos/arashi/README.md` links to `repos/arashi/CONTRIBUTING.md` in one click.
- [x] npm badge target resolves to package page for `arashi`.
- [x] CI badge target resolves to `corwinm/arashi` CI workflow.
- [x] License badge target resolves to `repos/arashi` MIT license.
- [x] Cross-repo links do not use stale `/setup/` path prefixes.

## Badge Applicability Rules and Fallback Behavior

- Required badge types for primary README headers: `npm`, `ci`, `license`.
- Apply badges where they represent live implementation repository signals.
- If a repository is unpublished or has no CI workflow, omit unsupported badge and add a short applicability note.
- Use repository-scoped targets to avoid ambiguous status signals in multi-repo docs.

## Framework Support Taxonomy

- `Native`: Works directly with first-class workflow support and no structural changes.
- `Supported with modifications`: Works with documented adaptation or file/path convention changes.
- `Experimental`: Partially workable with known gaps and higher maintenance risk.
- `Not supported`: Not currently maintained or validated in this workflow.

## User Story Completion Status

- [x] US1 complete: README content and capability/status/usage claims aligned with current repositories.
- [x] US2 complete: Header badges normalized, validated, and caveats documented.
- [x] US3 complete: Contribution path simplified and framework support matrix added.

## Final Validation Pass

- Date: 2026-02-09
- Result: PASS
- Reviewer notes:
  - Core claims are evidence-backed.
  - No unresolved major/critical documentation findings remain.
  - Key links and badge targets are consistent across root and implementation READMEs.
