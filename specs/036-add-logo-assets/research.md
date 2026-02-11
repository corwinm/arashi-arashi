# Research: Unified Logo Presence

**Date**: 2026-02-11  
**Feature**: 036-add-logo-assets  
**Purpose**: Resolve planning decisions for ASCII logo rendering, docs-site favicon strategy, and multi-surface consistency governance.

## 1) ASCII Logo Strategy for README and CLI Help

### Decision

Adopt a two-variant ASCII logo family:

- **Full textual logo** for README top placement and wide CLI help views
- **Compact icon/logo mark** for constrained terminal contexts

Use printable ASCII characters only for text-rendered logo variants.

### Rationale

- ASCII-only rendering avoids cross-terminal width inconsistencies and keeps output portable.
- README fenced code blocks preserve spacing and line breaks needed for logo legibility.
- A compact fallback prevents wrapping artifacts in narrow terminals.

### Alternatives considered

- Unicode box-drawing logo: rejected due to inconsistent rendering across terminals/fonts.
- Color-dependent logo: rejected because it can fail with no-color output and piped logs.
- Always showing full logo: rejected due to poor readability in narrow terminal widths.

## 2) CLI Help Fallback Policy and Readability Constraints

### Decision

Use deterministic CLI fallback rules based on output context:

- Show full logo in interactive TTY when width is sufficient.
- Show compact logo when width is constrained but still usable.
- Show plain `arashi` text in very narrow or non-interactive output contexts.

Planned constraints:

- Full logo target <=52 columns and <=6 lines.
- Compact logo target <=12 columns and <=3 lines.

### Rationale

- Help output must remain scannable and not block command discovery.
- TTY and column-aware fallback protects the user experience across common terminal widths.
- Plain-text fallback keeps piped output automation-friendly.

### Alternatives considered

- Width-agnostic rendering: rejected because it causes wrapping and reduced readability.
- Hiding logo only for non-TTY without compact fallback: rejected because it reduces branding in interactive narrow terminals.

## 3) Docs Site Branding and Favicon Asset Set

### Decision

Represent docs branding with a visible site logo and a compact favicon strategy:

- Provide a compact icon treatment as favicon source.
- Use SVG as primary favicon format with `.ico` compatibility fallback.
- Include mobile/browser compatibility assets where needed (for example, Apple touch icon and manifest icons).

### Rationale

- Compact iconography remains recognizable at favicon sizes where full text logos fail.
- SVG keeps icon edges crisp, while `.ico` preserves broad compatibility.
- Explicit icon assets reduce cross-browser inconsistencies and simplify acceptance testing.

### Alternatives considered

- SVG-only favicon: rejected because compatibility can be inconsistent in some clients.
- Wordmark favicon: rejected because textual marks lose readability at small sizes.
- Oversized legacy icon matrix: rejected as maintenance-heavy without proportional benefit.

## 4) Multi-Surface Consistency Governance

### Decision

Treat logo usage as a governed multi-surface contract:

- Maintain one canonical logo family definition.
- Define approved usage by surface (README, CLI help, docs logo, favicon).
- Require review sign-off that verifies coherence across all required surfaces.

### Rationale

- Cross-repository updates are prone to drift without explicit ownership and validation.
- Surface mapping and sign-off criteria make acceptance auditable and repeatable.
- Governance model supports future brand updates without reinterpreting scope each time.

### Alternatives considered

- Informal visual review only: rejected due to inconsistency risk.
- Fully decentralized logo copies: rejected because drift and unauthorized variants are harder to detect.

## 5) Validation and Acceptance Pattern

### Decision

Use a mixed validation approach:

- Automated quality gates in `repos/arashi` and `repos/arashi-docs`
- Deterministic manual acceptance checks for the four required surfaces
- Reviewer sign-off confirming cohesive appearance and readability

### Rationale

- Automated checks catch regressions in changed repositories.
- Visual/logo quality requires human verification across markdown/terminal/browser contexts.
- Explicit sign-off criteria support the measurable success outcomes in the feature spec.

### Alternatives considered

- Manual-only verification: rejected because regressions are easier to miss.
- Automation-only verification: rejected because visual coherence is not fully machine-verifiable.

## Result

All planning unknowns for this feature are resolved:

- ASCII logo constraints and fallback behavior are defined.
- Docs logo/favicon strategy and compatibility approach are defined.
- Cross-surface governance and acceptance patterns are defined.

No unresolved `NEEDS CLARIFICATION` items remain.
