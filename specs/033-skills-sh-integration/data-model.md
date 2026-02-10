# Data Model: skills.sh Integration Repository

## Entity: SkillDefinition

**Description**: Canonical metadata and instructions that represent the Arashi skill package.

**Fields**:
- `skillId` (string, required): Stable identifier for the skill.
- `displayName` (string, required): Human-readable skill name.
- `description` (string, required): Short purpose statement used for discovery.
- `versionReference` (string, required): Version or release pointer of the packaged skill.
- `compatibility` (string list, required): Supported environments and prerequisites.
- `entryCommands` (string list, required): Primary workflow entry points.
- `visibility` (enum: `public`, `restricted`, required): Discoverability mode.
- `status` (enum: `draft`, `validated`, `published`, required): Lifecycle state.

**Validation Rules**:
- `skillId` must be unique within the repository.
- `displayName` and `description` must be non-empty.
- `entryCommands` must include at least one installation verification command.
- `status=published` requires successful validation evidence.

## Entity: InstallationFlow

**Description**: Ordered installation and setup process for first-time users.

**Fields**:
- `flowId` (string, required): Unique installation flow identifier.
- `prerequisites` (string list, required): Required tools/access.
- `steps` (ordered list, required): Install and setup sequence.
- `validationChecks` (string list, required): Post-install checks.
- `failureModes` (list, required): Known failure categories.
- `recoveryActions` (map, required): Recommended fix path per failure mode.

**Validation Rules**:
- Flow must define at least one preflight prerequisite check.
- Every listed failure mode must have a mapped recovery action.
- Validation checks must include one command that confirms user can run a workflow.

## Entity: WorkflowExample

**Description**: End-to-end user scenario demonstrating an Arashi workflow through the skill.

**Fields**:
- `workflowId` (string, required): Unique example identifier.
- `title` (string, required): Goal-oriented workflow name.
- `userGoal` (string, required): Desired user outcome.
- `commandSequence` (ordered list, required): Steps to execute.
- `expectedOutcomes` (string list, required): User-visible success signals.
- `prerequisiteRefs` (string list, optional): Linked prerequisites.
- `difficulty` (enum: `beginner`, `intermediate`, `advanced`, required).

**Validation Rules**:
- Must include explicit success criteria that can be observed without source inspection.
- Must not rely on undocumented setup steps.
- Feature scope requires at least three workflow examples.

## Entity: IntegrationGuide

**Description**: User-facing documentation that combines install, usage, and troubleshooting.

**Fields**:
- `guideId` (string, required)
- `quickstartSection` (markdown block, required)
- `commandsReference` (list, required)
- `troubleshootingMatrix` (list of symptom/cause/fix entries, required)
- `faq` (list, optional)
- `lastReviewedAt` (date, required)

**Validation Rules**:
- Must include a first-run path from no setup to one successful workflow.
- Must include troubleshooting for prerequisites, network, and command failures.

## Entity: PublicationRecord

**Description**: Release evidence and publication status for the skill listing process.

**Fields**:
- `recordId` (string, required)
- `releaseTag` (string, required)
- `publishedAt` (datetime, optional)
- `discoveryProof` (string, optional): Reference proving discoverability.
- `publicationStatus` (enum: `not_applicable`, `ready`, `published`, `failed`, required)
- `notes` (string, optional)

**Validation Rules**:
- `publicationStatus=published` requires `publishedAt` and `discoveryProof`.
- If platform publication is unsupported, status should be `not_applicable` with notes.

## Relationships

- One `SkillDefinition` has one primary `InstallationFlow`.
- One `SkillDefinition` has many `WorkflowExample` entries.
- One `IntegrationGuide` references one `SkillDefinition` and many `WorkflowExample` entries.
- One `PublicationRecord` references one `SkillDefinition` release.

## State Transitions

### SkillDefinition.status

- `draft` -> `validated`: All validation gates pass (preflight, install, workflow).
- `validated` -> `published`: Publication succeeds and discoverability is verified.
- `validated` -> `draft`: Major validation regression found.

### PublicationRecord.publicationStatus

- `ready` -> `published`: Listing/discovery checks pass.
- `ready` -> `failed`: Publication attempt fails.
- `failed` -> `ready`: Issue remediated and publication retried.
