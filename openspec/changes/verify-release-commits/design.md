## Context

The Release workflow runs semantic-release on a GitHub-hosted runner with `contents: write` and the repository-provided `GITHUB_TOKEN`. `@semantic-release/changelog` and `@semantic-release/npm` update `CHANGELOG.md` and `package.json`; `@semantic-release/git` creates one local release commit and pushes it; semantic-release then creates its lightweight release tag at that commit. The push is authenticated but the commit is currently unsigned.

`@semantic-release/git` officially supports signed commits through ordinary Git signing configuration. Preserving this plugin avoids a custom release plugin, preserves the existing commit/tag topology, and retains semantic-release's established lifecycle and failure behavior.

## Goals / Non-Goals

**Goals:**

- Make future `@semantic-release/git` release commits display as Verified on GitHub.
- Preserve one release commit containing `package.json` and `CHANGELOG.md`, with the release tag resolving to that commit.
- Use a dedicated release-only signing key rather than Corwin's workstation signing key.
- Keep private key material confined to encrypted GitHub Actions secrets and the ephemeral release runner.
- Fail before semantic-release mutates the repository when signing configuration is absent or invalid.

**Non-Goals:**

- Rewrite historical unsigned commits, tags, or releases.
- Change the release commit message, assets, semantic version calculation, or publication behavior.
- Sign semantic-release's lightweight tags or convert them to annotated tags.
- Introduce a GitHub bot account or custom semantic-release commit plugin.

## Decisions

### Retain `@semantic-release/git`

The release will continue using its existing prepare plugin and configuration. Git's `commit.gpgsign=true` makes the plugin's normal `git commit` operation signed without changing semantic-release's ordering, tag targeting, or recovery model.

**Alternatives considered:**

- GitHub GraphQL `createCommitOnBranch`: rejected because a repository-owned plugin would need to reproduce lifecycle synchronization, error recovery, and tag-target guarantees already provided by `@semantic-release/git`.
- `@semantic-release-extras/verified-git-commit`: rejected because its Contents API implementation creates one commit per asset and leaves the release tag on the preceding local commit.
- Reuse Corwin's workstation key: rejected to limit blast radius and permit independent rotation/revocation.

### Use a dedicated passphrase-protected GPG key

Create a release-only GPG certification/signing key whose UID is `Corwin Marsh <corwinm@users.noreply.github.com>`. The email must remain verified on Corwin's GitHub account. Register the public key with GitHub so signatures made by the corresponding private key are recognized as Verified.

Store the ASCII-armored private key and its passphrase as separate repository Actions secrets. Never commit key material, print it, expose it through workflow outputs, or reuse it outside Arashi releases. Rotation consists of adding a replacement public key, updating both secrets, validating a release, and then revoking/removing the old key.

### Import and configure signing with a SHA-pinned action

The workflow will use `crazy-max/ghaction-import-gpg` pinned to reviewed commit `2dc316deee8e90f13e1a351ab510b4d5bc0c82cd` (the current `v7` tag target at proposal time). It will receive the private key and passphrase secrets and set repository-local `user.signingkey` plus `commit.gpgsign=true`. The workflow will also explicitly set repository-local `gpg.format=openpgp` so a runner or developer-level SSH signing preference cannot be inherited by the release checkout. Tag signing remains disabled so semantic-release's current lightweight tags do not change form.

The release step will explicitly set `GIT_AUTHOR_NAME`, `GIT_AUTHOR_EMAIL`, `GIT_COMMITTER_NAME`, and `GIT_COMMITTER_EMAIL` to the GPG UID identity. This is required because `@semantic-release/git` otherwise supplies its own semantic-release-bot defaults, overriding ordinary `git config user.*` values.

### Validate signing before semantic-release

A preflight step will create and verify a signed commit object without writing it into the checkout's normal Git object database. Before preflight it will snapshot `HEAD`, refs, index metadata, worktree status, and normal-object-store counts. It will then point `GIT_OBJECT_DIRECTORY` at a newly created temporary directory and expose the checkout's existing objects only through `GIT_ALTERNATE_OBJECT_DIRECTORIES`. `git commit-tree -S` will write the test commit solely into that temporary object directory. After verification, the workflow will remove the temporary directory, restore the environment, and assert that the checkout snapshots and normal object storage are unchanged.

The preflight will use the same four `GIT_AUTHOR_*` and `GIT_COMMITTER_*` overrides as the semantic-release step. It will inspect the test commit's author and committer fields, parse `git verify-commit --raw`'s `VALIDSIG` fingerprint, and compare those values with the expected release identity and the fingerprint/UID imported by the pinned action. Cryptographic verification and identity matching happen locally; GitHub public-key registration and verified-email association remain an explicit provisioning check and production-release acceptance gate.

Missing secrets, failed key import, identity/fingerprint mismatch, an unusable passphrase, a failed signature, or any checkout-state mutation must fail at preflight, before version/changelog files are prepared or pushed.

Repository tests will enforce the pinned action SHA, secret wiring, commit-signing options, explicit author/committer identity, and the absence of tag-signing configuration. A real production release remains the final proof that GitHub associates the signature with the registered account key.

## Risks / Trade-offs

- **Long-lived private key in repository secrets** → Use a dedicated passphrase-protected release-only key, separate secrets, least reuse, and documented rotation/revocation.
- **Compromised workflow on the default branch can access the key** → Keep releases manual, use only reviewed default-branch workflow code, pin the import action by commit SHA, and retain GitHub environment/repository controls.
- **GPG UID, commit identity, or GitHub registration mismatch** → Compare imported fingerprint/UID and signed test-commit identity locally; fix the UID to Corwin's verified noreply email; verify public-key registration during provisioning and GitHub's badge in production.
- **`@semantic-release/git` overrides Git config identity** → Set all four `GIT_AUTHOR_*` and `GIT_COMMITTER_*` variables on the semantic-release step.
- **Accidental tag-format change** → Enable commit signing only; explicitly leave tag signing disabled and test that the workflow does not set `git_tag_gpgsign` or `tag.gpgSign`.
- **Key expiry or passphrase failure blocks release** → Fail during signing preflight and rotate/update secrets before rerunning; no repository mutation occurs.

## Migration Plan

1. Add source-level workflow contract tests for immutable action pinning, secret wiring, commit-only signing, explicit identity/fingerprint checks, and isolated temporary-object preflight cleanup.
2. Generate the dedicated passphrase-protected release GPG key outside the repository.
3. Register its public key with Corwin's GitHub account and store the private key/passphrase as repository Actions secrets.
4. Add the SHA-pinned import/configuration and signing preflight to the release workflow; retain `@semantic-release/git` unchanged.
5. Run focused tests, release dry-run, and the complete Arashi validation gates.
6. Merge through the normal PR process. On the next intentional release, verify the release commit is `verified: true`, its signer identity matches the dedicated key, and the lightweight release tag resolves to that commit.
7. Roll back by removing the import/preflight steps and secret references; do not rewrite historical refs. Revoke the dedicated key if compromise is suspected.

## Open Questions

None. Production GitHub verification is intentionally a post-merge release gate because dry-run mode must not create or push a release commit.
