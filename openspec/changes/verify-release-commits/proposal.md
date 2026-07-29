## Why

Arashi's automated semantic-release commits are currently created locally by `@semantic-release/git` and pushed with `GITHUB_TOKEN`, which authenticates the push but leaves the commit unsigned. Future release metadata commits should carry GitHub-verifiable provenance without changing the established single-commit/tag release lifecycle or rewriting historical releases.

## What Changes

- Keep `@semantic-release/git` as the release metadata commit implementation.
- Generate a dedicated, passphrase-protected GPG signing key for Arashi releases and register only its public key with the maintainer's GitHub account.
- Store the private key and passphrase as GitHub Actions secrets and import them only into the ephemeral release runner.
- Configure Git commit signing and an identity matching the registered GPG key before semantic-release runs.
- Pin the GPG-import action to a reviewed immutable commit SHA.
- Preserve the release commit's tracked assets (`package.json` and `CHANGELOG.md`), existing commit message, lightweight tag target, npm trusted publishing, artifacts, and dry-run behavior.
- Leave historical unsigned release commits and existing tags unchanged.

## Capabilities

### New Capabilities

- `verified-release-commits`: Defines signing-key isolation, CI secret handling, commit identity, verification, and release-topology requirements for automated release commits.

### Modified Capabilities

None.

## Impact

- `repos/arashi/.github/workflows/release.yml`: imports the dedicated GPG key, configures commit signing, and supplies the matching Git author/committer identity.
- Repository Actions secrets: adds a release-only armored private key and passphrase.
- Maintainer GitHub account: registers the dedicated public GPG key against a verified noreply email.
- `@semantic-release/git`, `.releaserc.json`, package dependencies, npm trusted publishing, and release assets remain otherwise unchanged.
- No CLI runtime behavior, user-facing configuration, documentation site, skills package, or VS Code extension behavior changes.
