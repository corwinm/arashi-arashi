## ADDED Requirements

### Requirement: Verified automated release commit
The release workflow SHALL use `@semantic-release/git` with GPG commit signing enabled so each future automated release metadata commit is cryptographically signed and GitHub reports the signature as verified.

#### Scenario: Successful release commit
- **WHEN** semantic-release creates the release metadata commit with the dedicated registered key and matching identity
- **THEN** GitHub reports the commit signature as valid and Verified

#### Scenario: Signing setup unavailable
- **WHEN** the private-key secret, passphrase secret, key import, or signing preflight is unavailable or invalid
- **THEN** the release fails before semantic-release prepares or pushes release metadata

#### Scenario: Signing preflight remains isolated
- **WHEN** the workflow creates a signed commit object for preflight
- **THEN** it writes the object only to a temporary object directory backed by the checkout object database through read-only alternates, removes that directory afterward, and leaves refs, HEAD, index, worktree status, and normal repository object storage unchanged

### Requirement: Dedicated release signing identity
The release workflow MUST use a dedicated release-only GPG key whose UID email is verified by the GitHub account that registers its public key and MUST set matching Git author and committer identity explicitly for `@semantic-release/git`.

#### Scenario: Semantic-release bot defaults
- **WHEN** `@semantic-release/git` would otherwise use its default semantic-release-bot author and committer
- **THEN** the workflow overrides all author and committer name/email environment variables with the registered release signing identity

#### Scenario: Preflight identity verification
- **WHEN** the isolated signed test commit is created
- **THEN** its author and committer match the release-step overrides and its valid-signature fingerprint and imported key UID match the expected registered release identity

#### Scenario: Identity or fingerprint mismatch
- **WHEN** the imported key fingerprint/UID, signed commit identity, or expected release identity differ
- **THEN** preflight fails before semantic-release mutates the repository

#### Scenario: Key rotation
- **WHEN** the dedicated signing key expires, is replaced, or is suspected compromised
- **THEN** maintainers can register a replacement public key, update the private-key and passphrase secrets, validate the replacement, and revoke the prior key without changing release history

### Requirement: Signing key isolation
The release workflow MUST keep private signing material out of the repository and logs, SHALL store the armored private key and passphrase as separate encrypted GitHub Actions secrets, and SHALL import them only into the ephemeral release runner.

#### Scenario: Workflow executes
- **WHEN** the manual Release workflow starts
- **THEN** key material is read only from encrypted secrets, is masked from logs, and exists only for the lifetime of the runner

#### Scenario: Manual dispatch targets a non-default branch
- **WHEN** a user dispatches the Release workflow with a ref other than `main`
- **THEN** the release job is skipped before checkout, runner allocation, or release-secret access

#### Scenario: Repository content is inspected
- **WHEN** tracked files and generated release artifacts are reviewed
- **THEN** they contain no private key, passphrase, or secret-derived signing material

### Requirement: Auditable repository-owned signing setup
The release workflow SHALL use reviewed repository-owned code to import and use the GPG key without passing signing secrets to a third-party action and SHALL configure repository-local commit signing without enabling tag signing.

#### Scenario: Signing setup executes
- **WHEN** the workflow imports the release key
- **THEN** repository-owned code confines key material to mode-restricted temporary storage, supplies the passphrase without process arguments or logs, configures `user.signingkey` plus `commit.gpgsign=true`, and removes the temporary signing state during an always-run cleanup step

#### Scenario: Semantic-release creates the tag
- **WHEN** the signed release commit has been created
- **THEN** semantic-release preserves its existing lightweight tag behavior and the tag resolves to that signed commit

### Requirement: Existing release behavior remains intact
The signing change SHALL preserve one release metadata commit containing `package.json` and `CHANGELOG.md`, the existing commit message, semantic version calculation, dry-run non-mutation, npm trusted publishing, binary/checksum generation, GitHub release assets, and historical Git references.

#### Scenario: Normal production release
- **WHEN** signing preflight succeeds and semantic-release determines a new version
- **THEN** the existing release pipeline completes with the sole behavioral difference that its release metadata commit is signed

#### Scenario: Release dry run
- **WHEN** the Release workflow is dispatched with dry-run enabled
- **THEN** signing setup and validation can run, but no release commit, tag, package publication, or GitHub release is created

#### Scenario: Historical releases
- **WHEN** CI signing is introduced
- **THEN** no existing commit, tag, or GitHub release is rewritten or replaced
