# Implementation evidence

## Exact child merge revisions

The coordinated child pull requests were squash-merged and final parent verification uses these exact `main` revisions:

- CLI implementation: `corwinm/arashi#164` — `bfeb10dfb95623771e016d087461355f6d5da1a4`
- CLI merge-result contract repair: `corwinm/arashi#166` — `eac4d5aa7d4edecce250cacd1aecfad119b41f1c`
- Docs: `corwinm/arashi-docs#94` — `bc66b965c428f593e9ba3a2fae6e9cf61708c94b`

The coordinated CLI and docs checkouts were detached at the latest listed merge commits before final meta validation.

## Verified delivery evidence

- Latest CLI closeout full suite: 207 files passed, 2 skipped; 2,881 tests passed, 17 skipped.
- CLI format, typecheck, lint, command/completion/executable contracts, Bash syntax, and exact-head CI passed.
- Native Windows installer, hook-input, build, materialization, validation, and test jobs passed.
- Docs canonical validation, static build, internal links, accessibility smoke checks, semantic checks, and deploy preview passed.
- Exact-head independent CLI confirmation returned `PASS` with no file modifications.
- All eligible child review threads were classified, replied to, and resolved before merge.
- Primary and coordinated child revisions were verified against the returned squash merge commits.

## Scope disposition

The shipped implementation remains the conservative MVP defined by this change. Uninstall JSON, force bypasses, generalized transaction journals, legacy/manual ownership adoption, downloaded helper trust protocols, exhaustive historical cleanup, and new packaged-skill guidance remain deferred.
