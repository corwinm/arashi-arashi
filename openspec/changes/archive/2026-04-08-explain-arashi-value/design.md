## Context

Arashi's documentation currently explains commands, but first-time readers do not quickly understand the outcome: coordinating parallel work across multiple repositories and worktrees. The proposal defines a docs-and-README update focused on value communication, especially for a frontend+backend scenario where users switch focus while another worktree stays active.

This change is content and presentation only (no CLI behavior changes), but it is cross-cutting across `repos/arashi-docs/` (landing page narrative + visuals) and `repos/arashi/README.md` (onboarding narrative + visuals).

Constraints:
- Keep the example minimal, concrete, and command-accurate.
- Preserve docs site performance and accessibility (including reduced-motion behavior).
- Keep messaging consistent between landing page and README.

## Goals / Non-Goals

**Goals:**
- Communicate the value proposition in the landing page above-the-fold area: "manage multiple repos and multiple worktrees in parallel without losing context."
- Show a single minimal workflow from setup to switching focus across frontend and backend repos.
- Provide an animated walkthrough on the landing page that visually reinforces the workflow.
- Mirror the same narrative in CLI README content so docs and repo onboarding tell the same story.

**Non-Goals:**
- Changing command behavior, flags, or configuration format.
- Creating a full tutorial covering every command permutation.
- Adding external analytics, tracking, or runtime dependencies.

## Decisions

1) Value-first landing section with scenario framing
- Decision: Rework landing content to lead with the outcome (parallel multi-repo workflow) before feature-level details.
- Rationale: Users decide quickly whether a tool is for them; outcome language reduces time-to-understanding.
- Alternatives considered:
  - Feature list first: easier to write but does not communicate workflow value quickly.
  - Command reference first: accurate but too implementation-centric for first contact.

2) Canonical minimal example: frontend + backend repos with parallel worktrees
- Decision: Use one concrete scenario throughout docs and README with explicit setup tree and short command sequence (`add` -> `create` -> `switch`).
- Rationale: A single repeated example builds comprehension and avoids cognitive overload from multiple disconnected examples.
- Alternatives considered:
  - Multiple domain-specific examples: richer but dilutes the core value proposition.
  - Abstract pseudo-example: shorter but less believable and less actionable.

3) Animated walkthrough implemented as lightweight docs asset with static fallback
- Decision: Implement a lightweight step animation for the docs landing page and provide static frames/sequence for README compatibility.
- Rationale: Animation clarifies temporal workflow (create then switch while another worktree remains active), while static assets ensure GitHub rendering compatibility.
- Alternatives considered:
  - Embedded video: strong storytelling but heavier payload and weaker accessibility defaults.
  - GIF only: simple distribution but poorer clarity on high-DPI displays and limited control over reduced-motion behavior.

4) Content parity enforced through shared structure, not shared runtime source
- Decision: Define a stable message structure (headline, 3-step flow, minimal command example, outcome statement) and apply it in both repos.
- Rationale: Repos are independent; structural parity is easier to maintain than trying to introduce cross-repo content imports.
- Alternatives considered:
  - Cross-repo content import/build step: tighter coupling and maintenance overhead.
  - Independent authoring without constraints: higher drift risk between docs and README.

## Risks / Trade-offs

- [Risk] Animation may distract or hurt readability on some devices -> Mitigation: keep animation short/loop-safe, provide reduced-motion fallback, and ensure key message is understandable without motion.
- [Risk] README and docs messaging can drift over time -> Mitigation: define identical section structure and wording checklist in follow-up tasks/review.
- [Risk] Example commands could become outdated as CLI evolves -> Mitigation: use commands already covered by existing command specs and validate against current help output before merge.
- [Risk] Too much detail in the hero area can reduce scannability -> Mitigation: enforce minimal copy, with links to deeper docs for details.

## Migration Plan

1. Update docs landing page content/components and add visual assets for the minimal workflow.
2. Update `repos/arashi/README.md` with matching value proposition and static visual sequence.
3. Validate docs rendering and repository markdown rendering.
4. Roll back by reverting docs/README content changes if messaging or assets do not meet clarity/performance expectations.

## Open Questions

- Should the landing animation be authored as CSS/SVG sequence or as pre-rendered asset, given maintenance and visual fidelity trade-offs?
- Which exact command snippets should be shown to balance correctness and brevity for first-time readers?
- Should the example emphasize one persona (solo developer) or remain neutral for both solo and team contexts?
