## ADDED Requirements

### Requirement: Recommendation requires usable Arashi configuration

The extension SHALL evaluate repository scan depth only after it resolves a readable Arashi configuration associated with the active checkout and obtains at least one configured repository entry with a non-empty path. Missing, unreadable, malformed, or structurally unusable configuration SHALL NOT produce a repository-scan settings prompt or mutation.

#### Scenario: No Arashi configuration is available

- **WHEN** extension activation or refresh cannot resolve an Arashi configuration associated with the active checkout
- **THEN** the extension does not prompt for or mutate `git.repositoryScanMaxDepth`

#### Scenario: Arashi configuration is malformed

- **WHEN** the associated Arashi configuration cannot be read, parsed, or does not contain any usable configured repository path
- **THEN** the extension does not prompt for or mutate `git.repositoryScanMaxDepth`
- **AND** records an actionable diagnostic without claiming that a scan-depth change can repair the configuration

#### Scenario: Linked worktree reuses associated configuration

- **WHEN** an opened coordinated linked worktree resolves an associated sibling main-worktree Arashi configuration
- **THEN** relative configured repository paths are interpreted from the active linked-worktree root for repository-depth calculation

### Requirement: Required depth derives from configured repository paths

The extension SHALL normalize each usable configured `repos.<name>.path`, map it to the deepest opened workspace folder that contains it, and calculate its depth as the number of relative path segments from that folder to the configured repository root. The required depth for each applicable workspace folder SHALL be the maximum calculated depth among its applicable configured repositories.

#### Scenario: Default repository layout requires depth two

- **WHEN** the available Arashi configuration contains a repository path `repos/app` beneath the opened Arashi workspace folder
- **THEN** the calculated required repository scan depth for that folder is `2`

#### Scenario: Deeper custom repository layout requires its actual depth

- **WHEN** the available Arashi configuration contains a repository path `projects/services/app` beneath the opened Arashi workspace folder
- **THEN** the calculated required repository scan depth for that folder is `3`

#### Scenario: Multiple configured paths use the maximum depth

- **WHEN** applicable configured repository roots have calculated depths `1`, `2`, and `3` beneath the same opened workspace folder
- **THEN** the calculated required repository scan depth for that folder is `3`

#### Scenario: Configured repository is an explicit workspace folder

- **WHEN** a configured repository root equals an opened workspace folder
- **THEN** that repository does not contribute to a scan-depth recommendation because VS Code already opens the root directly

#### Scenario: Configured repository is outside opened workspace folders

- **WHEN** a normalized configured repository path is not contained by any opened workspace folder
- **THEN** that repository does not contribute to a scan-depth recommendation
- **AND** the extension does not claim that increasing scan depth can discover it

#### Scenario: Configured repository directory is not yet materialized

- **WHEN** a syntactically usable configured repository path is beneath an opened workspace folder but its target directory does not currently exist
- **THEN** the extension still includes its configured relative depth in the calculation

#### Scenario: Multi-root workspace scopes depth by containing folder

- **WHEN** configured repository paths are nested beneath different opened workspace folders
- **THEN** the extension calculates the required maximum independently for each containing workspace folder

### Requirement: Sufficient effective scan depth is not disturbed

For each applicable workspace folder, the extension SHALL read the effective resource-scoped `git.repositoryScanMaxDepth` value and SHALL NOT prompt for or mutate a value that is unlimited or sufficient for the calculated requirement.

#### Scenario: Effective depth is below the requirement

- **WHEN** an applicable folder requires depth `3` and its effective `git.repositoryScanMaxDepth` is `2`
- **THEN** the folder is included in the repository-scan recommendation

#### Scenario: Effective depth equals or exceeds the requirement

- **WHEN** an applicable folder requires depth `3` and its effective `git.repositoryScanMaxDepth` is `3` or greater
- **THEN** the extension does not recommend or mutate the setting for that folder

#### Scenario: Effective depth is unlimited

- **WHEN** the effective `git.repositoryScanMaxDepth` is `-1`
- **THEN** the extension treats repository scanning as sufficient and does not recommend or mutate the setting

#### Scenario: Effective value is unusable

- **WHEN** the effective setting cannot be interpreted as `-1` or a finite nonnegative number
- **THEN** the extension logs a diagnostic and does not mutate the setting automatically

### Requirement: Updating scan depth requires explicit user-selected scope

When one or more applicable workspace folders have insufficient effective depth, the extension SHALL present one explicit recommendation describing the exact calculated value for a single affected scope or the affected values for multiple scopes. The recommendation SHALL offer **Update Workspace Setting** and **Update User Setting** as separate actions, disclose that the user setting applies to unrelated workspaces, and persist no setting unless the user chooses one action. The selected target value SHALL be the maximum required depth across affected folders without lowering an existing sufficient or unlimited value at that target.

#### Scenario: User dismisses the recommendation

- **WHEN** the user dismisses the repository-scan recommendation or chooses not to update
- **THEN** the extension does not mutate any VS Code setting

#### Scenario: User chooses the current workspace

- **WHEN** one or more applicable folders require a maximum depth of `3`, the effective value and existing workspace-target value are below `3`, and the user chooses **Update Workspace Setting**
- **THEN** the extension recomputes and confirms the recommendation is still current
- **AND** writes `git.repositoryScanMaxDepth` as `3` at `ConfigurationTarget.Workspace`
- **AND** does not modify the user's global setting, any workspace-folder setting, or any other Git setting

#### Scenario: User chooses the global user setting

- **WHEN** one or more applicable folders require a maximum depth of `3`, the effective value and existing global-target value are below `3`, and the user chooses **Update User Setting**
- **THEN** the extension recomputes and confirms the recommendations are still current
- **AND** writes `git.repositoryScanMaxDepth` as `3` at `ConfigurationTarget.Global`
- **AND** does not modify the current workspace, any workspace folder, or any other Git setting

#### Scenario: Existing selected-scope value is higher or unlimited

- **WHEN** the user selects a persistence scope whose existing value is greater than the required maximum or is `-1`
- **THEN** the extension does not lower or replace that selected-scope value
- **AND** still verifies whether the effective value is sufficient for every affected folder

#### Scenario: Higher-precedence override defeats the selected scope

- **WHEN** the selected global or workspace target is updated or already sufficient but a higher-precedence setting leaves an affected folder's effective value insufficient
- **THEN** the extension explains and logs that the selected scope is overridden
- **AND** does not mutate the higher-precedence scope or offer to reload as though the update succeeded

#### Scenario: Recommendation changes before acceptance is applied

- **WHEN** the Arashi configuration, opened workspace folders, or effective Git setting changes while the recommendation is pending
- **THEN** the extension does not apply the stale recommendation
- **AND** reevaluates the current workspace state

#### Scenario: Settings update fails

- **WHEN** persisting an accepted scan-depth update fails or the resulting effective value remains insufficient for any affected folder
- **THEN** the extension surfaces and logs the failure
- **AND** does not offer to reload as though the update succeeded

### Requirement: Reload is a separate optional action

After every accepted scan-depth update succeeds, the extension SHALL report success and SHALL offer a separate action to reload the editor window. It SHALL reload only when the user explicitly chooses that action.

#### Scenario: User accepts reload

- **WHEN** the scan-depth updates succeed and the user chooses **Reload Window**
- **THEN** the extension executes `workbench.action.reloadWindow`

#### Scenario: User dismisses reload

- **WHEN** the scan-depth updates succeed and the user dismisses the reload action
- **THEN** the extension leaves the current editor window running

### Requirement: Recommendation does not spam repeated refreshes

The extension SHALL suppress a repository-scan recommendation snapshot after it has been presented during the current extension activation. The normalized snapshot identity SHALL contain each affected workspace-folder identity, its required depth, and its current insufficient effective depth in deterministic order. Reevaluation SHALL create a new actionable snapshot only when one of those values changes, and returning to a snapshot already presented during the activation SHALL remain suppressed.

#### Scenario: Visibility and focus refreshes repeat unchanged state

- **WHEN** repeated panel visibility, window-focus, or refresh events produce the same affected folder and required-depth set during one activation
- **THEN** the extension presents the recommendation at most once for that set

#### Scenario: Relevant state changes

- **WHEN** a relevant configuration or effective setting change produces a different affected folder, required depth, or current insufficient effective depth
- **THEN** the extension may present the new actionable recommendation once

#### Scenario: Insufficient effective depth changes

- **WHEN** a folder requires depth `3`, a recommendation was shown for effective depth `1`, and the effective depth changes to `2`
- **THEN** the extension treats folder/required `3`/current `2` as a new actionable recommendation snapshot and may present it once

#### Scenario: Previously shown snapshot returns

- **WHEN** the effective depth later returns to an insufficient folder/required/current snapshot already presented during the activation
- **THEN** the extension does not present that snapshot again
