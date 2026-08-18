# docs-agent-readable-exports Specification

## Purpose

Define the machine-readable documentation exports that help coding agents discover, fetch, and use Arashi documentation without scraping the full HTML site.
## Requirements
### Requirement: Docs SHALL publish a curated LLM entrypoint

The docs site SHALL expose `/llms.txt` as a concise Markdown-oriented entrypoint for coding agents that summarizes Arashi and points to the highest-value docs pages and exports.

#### Scenario: Agent fetches the curated entrypoint

- **WHEN** an agent requests `/llms.txt`
- **THEN** the response identifies Arashi, summarizes when to use it, explains how agents should interpret the docs, and links to core workflow, getting-started, command-reference, contributing, and generated Markdown/full-doc resources

### Requirement: LLM entrypoint SHALL prioritize Arashi workflow guidance over raw sitemap output

The `/llms.txt` entrypoint SHALL be curated and opinionated instead of listing every public page with equal weight.

#### Scenario: Maintainer-only pages exist

- **WHEN** maintainer references, migration evidence, page templates, or other low-priority pages remain public
- **THEN** `/llms.txt` excludes or demotes them so the default entrypoint emphasizes Arashi usage, agent workflow, commands, and contribution flow

### Requirement: Docs SHALL publish a full Markdown export

The docs site SHALL expose `/llms-full.txt` as a deterministic Markdown-oriented export of relevant public documentation.

#### Scenario: Agent fetches the full export

- **WHEN** an agent requests `/llms-full.txt`
- **THEN** the response concatenates relevant public docs in an intentional order that starts with landing or getting-started material, then workflows, commands, and contributing content

### Requirement: Full export SHALL identify source pages

Each page section in `/llms-full.txt` SHALL include enough metadata to identify its source, including a human-readable title and canonical documentation URL.

#### Scenario: Agent cites or narrows context from the full export

- **WHEN** an agent reads a section in `/llms-full.txt`
- **THEN** it can determine which source page the section came from and which canonical URL to open for more context

### Requirement: Docs SHALL expose Markdown page routes

The docs site SHALL expose `.md` route variants for public documentation pages so agents can fetch authored Markdown content directly.

#### Scenario: Agent requests a Markdown route

- **WHEN** an agent requests a public docs page with a `.md` route such as `/workflows/agents-and-specs.md` or `/commands/status.md`
- **THEN** the response returns a Markdown-oriented representation of that public page rather than the HTML Starlight shell

### Requirement: Section index Markdown pages SHALL have clean aliases

The docs site SHALL expose clean `.md` aliases for section index pages in addition to explicit `/index.md` routes.

#### Scenario: Agent requests a section index Markdown alias

- **WHEN** an agent requests a section index page with a clean `.md` route such as `/getting-started.md`, `/workflows.md`, `/commands.md`, or `/contributing.md`
- **THEN** the response returns the same Markdown-oriented page content as the corresponding explicit `/getting-started/index.md`, `/workflows/index.md`, `/commands/index.md`, or `/contributing/index.md` route

### Requirement: Markdown routes SHALL preserve authored content where practical

Generated `.md` page routes SHALL prefer the source Markdown from `docs/` and SHALL strip or normalize frontmatter and metadata that are not useful as agent context.

#### Scenario: Markdown source contains frontmatter

- **WHEN** the generated `.md` route is built from a source page with frontmatter
- **THEN** the response omits raw frontmatter syntax while preserving the page title and body content in useful Markdown form

### Requirement: Agent-readable exports SHALL avoid noisy default context

Generated agent-readable exports SHALL exclude draft or hidden pages and SHALL exclude or demote maintainer-only docs-site maintenance material that is not part of the primary Arashi usage/contribution flow.

#### Scenario: Export generation encounters maintainer-only pages

- **WHEN** export generation encounters docs-domain migration pages, page templates, navigation rules, or similar maintainer references
- **THEN** those pages do not appear in the default high-priority context unless explicitly included in a lower-priority section

### Requirement: Generated routes SHALL be validated locally

The docs validation flow SHALL cover generated agent-readable exports and representative Markdown routes.

#### Scenario: Contributor runs docs validation

- **WHEN** a contributor runs `bun run validate`
- **THEN** validation fails if required generated outputs such as `/llms.txt`, `/llms-full.txt`, `/workflows/agents-and-specs.md`, or `/commands/status.md` are missing or contain broken required links

### Requirement: Agent-readable exports include standalone workflow guidance

Generated Markdown routes, `/llms.txt`, and `/llms-full.txt` SHALL make the supported zero-config standalone workflow discoverable from authored documentation.

#### Scenario: Agent fetches standalone workflow Markdown

- **WHEN** an agent requests the standalone workflow's `.md` route
- **THEN** the response includes explicit CLI bootstrap, supported lifecycle commands, `.worktrees/<branch>` layout, ignore safety, configured-mode contrast, and upgrade guidance

#### Scenario: Agent fetches the curated entrypoint

- **WHEN** an agent requests `/llms.txt`
- **THEN** the curated guidance links directly or through a high-priority workflow index to zero-config standalone usage
- **AND** does not describe configured meta-repositories as the only valid Arashi workflow

#### Scenario: Full export is regenerated

- **WHEN** documentation validation generates `/llms-full.txt`
- **THEN** the standalone workflow and updated Getting Started and command guidance appear in the deterministic export
- **AND** validation fails when required standalone source pages or generated routes are stale or missing

### Requirement: Agent-readable exports carry executable alias guidance

Generated Markdown routes, `/llms.txt`, and `/llms-full.txt` SHALL identify `aw` concisely as a shorter alias for `arashi`, preserve `arashi` as canonical, and route agents to current installation and shell guidance without teaching a user-created shell alias as equivalent support.

#### Scenario: Agent fetches the curated entrypoint

- **WHEN** an agent requests `/llms.txt`
- **THEN** concise guidance states that supported installations provide `arashi` and `aw` while canonical examples continue to use `arashi`
- **AND** links to getting-started or installation guidance for channel and collision details

#### Scenario: Agent fetches generated installation Markdown

- **WHEN** an agent requests the relevant getting-started, installation, shell, or troubleshooting `.md` route or reads `/llms-full.txt`
- **THEN** the export describes npm, POSIX, and Windows alias availability, one-native-binary ownership, shell integration/completion, and collision-safe direct installation consistently with authored docs

#### Scenario: Generated alias guidance is stale

- **WHEN** authored documentation changes alias naming, canonical identity, installation channel, shell behavior, or manual payload requirements without regenerating exports
- **THEN** docs validation reports the stale generated route or export and exits unsuccessfully

### Requirement: Agent-readable exports include repository materialization guidance
Canonical website generation SHALL include repository worktree materialization guidance in agent-readable Markdown exports and `/llms.txt` discovery using the same field names, configured-only scope, source ownership, lifecycle ordering, safety, output, and copy-versus-symlink recommendations as maintained user documentation.

#### Scenario: Agent discovers materialization guidance
- **WHEN** an automation consumer follows `/llms.txt` or a canonical Markdown route for configuration/create guidance
- **THEN** it can discover direct `repos.<name>.copy` and `repos.<name>.symlink` arrays and their same-relative-path behavior
- **AND** it receives canonical safety and lifecycle guidance rather than generated implementation details

#### Scenario: Generated export is stale
- **WHEN** maintained materialization guidance changes without regenerating agent-readable output
- **THEN** docs freshness or semantic validation fails before publication

#### Scenario: Export invents unsupported behavior
- **WHEN** a generated or authored agent surface claims globs, remapping, external sources, implicit fallback, or standalone support
- **THEN** registered docs semantic validation identifies the contradiction and exits unsuccessfully

### Requirement: Generated agent exports preserve primary spelling
Generated Markdown routes, `/llms.txt`, and `/llms-full.txt` SHALL use `aw` for recommended actionable commands, preserve valid identifiers, and carry the same concise compatibility policy as their authored sources.

#### Scenario: Authored guidance is regenerated
- **WHEN** the owning docs generator produces agent-readable outputs
- **THEN** generated recommended commands use `aw`
- **AND** a second generation from unchanged inputs produces byte-identical tracked outputs

#### Scenario: Generated preferred spelling regresses
- **WHEN** an authored or generated fixture restores an unlabeled recommended `arashi` invocation
- **THEN** docs validation exits unsuccessfully with a source-specific diagnostic
