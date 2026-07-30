## 1. Signing Contract

- [x] 1.1 Retain `@semantic-release/git`, its release assets/message, and the existing lightweight-tag topology
- [x] 1.2 Define immutable action pinning, separate secret wiring, repository-local commit signing, and explicit release identity requirements
- [x] 1.3 Define an isolated-object signed-commit preflight that checks identity, fingerprint/UID, cleanup, and repository non-mutation

## 2. Key Provisioning and Workflow

- [x] 2.1 Generate a dedicated passphrase-protected Arashi release GPG key using Corwin's verified noreply email
- [x] 2.2 Register the public GPG key with Corwin's GitHub account and store the armored private key/passphrase as separate repository Actions secrets
- [x] 2.3 Add the SHA-pinned GPG import step and configure repository-local OpenPGP automatic commit signing
- [x] 2.4 Set all `GIT_AUTHOR_*` and `GIT_COMMITTER_*` values for the semantic-release step to the registered key identity
- [x] 2.5 Add a non-mutating signed-commit preflight that fails before semantic-release on missing or invalid signing configuration

## 3. Verification and Delivery

- [x] 3.1 Run Bash/ShellCheck validation plus a branch-scoped Release workflow dry run using the actual repository secrets
- [x] 3.2 Run Arashi formatting, lint, typecheck, test, build, and lockfile validation gates after the final edit
- [x] 3.3 Open and cross-link the child implementation PR and proposal PR, then verify their CI and review surfaces
- [ ] 3.4 After merge, verify the first intentional production release commit is GitHub-verified and its lightweight tag resolves to the same commit
