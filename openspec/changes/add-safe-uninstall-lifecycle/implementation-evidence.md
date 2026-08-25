# Implementation evidence

## Exact child merge revisions

The coordinated child pull requests were squash-merged and final parent verification uses these exact `main` revisions:

- CLI: `corwinm/arashi#164` — `bfeb10dfb95623771e016d087461355f6d5da1a4`
- Docs: `corwinm/arashi-docs#94` — `bc66b965c428f593e9ba3a2fae6e9cf61708c94b`

Both coordinated child checkouts were detached at those merge commits before the final meta validation.

## Verified delivery evidence

- CLI full suite: 206 files passed, 2 skipped; 2,859 tests passed, 17 skipped.
- CLI format, typecheck, lint, command/completion/executable contracts, Bash syntax, and exact-head CI passed.
- Native Windows installer, hook-input, build, materialization, validation, and test jobs passed.
- Docs canonical validation, static build, internal links, accessibility smoke checks, semantic checks, and deploy preview passed.
- Exact-head independent CLI confirmation returned `PASS` with no file modifications.
- All eligible child review threads were classified, replied to, and resolved before merge.
- Primary and coordinated child revisions were verified against the returned squash merge commits.

## Scope disposition

The shipped implementation remains the conservative MVP defined by this change. Uninstall JSON, force bypasses, generalized transaction journals, legacy/manual ownership adoption, downloaded helper trust protocols, exhaustive historical cleanup, and new packaged-skill guidance remain deferred.
