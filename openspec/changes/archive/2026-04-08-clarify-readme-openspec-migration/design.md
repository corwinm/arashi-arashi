## Context

Issue #146 is a documentation-accuracy problem that affects two README surfaces: the meta-repo `README.md` in `arashi-arashi` and the implementation README in `repos/arashi/README.md`. The root README still documents `/speckit.*` commands and a Spec-Kit-first support matrix, even though the active spec workflow for this project has moved to OpenSpec. The child-repo README also needs to stay aligned with that current-state framing so contributors do not get contradictory guidance depending on which repository they open first.

This is a content-only change scoped to repository onboarding documentation across the meta repo and the child CLI repo. No CLI commands, repo structure, or implementation workflows are changing; the goal is to make both READMEs accurately describe the current state.

Constraints:
- Keep the explanation brief enough that it improves clarity without turning the README into a migration history document.
- Preserve each README's existing onboarding purpose rather than replacing it with tool-centric detail.
- Keep wording precise so SpecKit is treated as prior context, not as a current requirement.
- Respect the multi-repo workflow: implementation may require separate commits in the meta repo and `repos/arashi`.

## Goals / Non-Goals

**Goals:**
- State clearly that this project currently uses OpenSpec for its spec workflow in both README surfaces.
- Clarify that earlier SpecKit-oriented setup informed the work initially but is no longer the active workflow.
- Update tables and surrounding copy so a fast scan of either README yields the correct current-state understanding.
- Keep the meta-repo README and child-repo README consistent after the wording update.

**Non-Goals:**
- Changing any runtime behavior, commands, or repository automation.
- Reworking the docs site or other non-README documentation in this change.
- Writing a full comparison or migration guide between SpecKit and OpenSpec.

## Decisions

1) Add a short current-state clarification in both README surfaces where spec workflow is discussed
- Decision: Introduce concise wording that says the project started from SpecKit-oriented assumptions but now uses OpenSpec.
- Rationale: Readers need the current state first, while a brief historical note preserves context and trust.
- Alternatives considered:
  - Remove all mention of SpecKit: simpler, but loses context the user explicitly wants preserved.
  - Add a long migration section: more complete, but too heavy for README onboarding.

2) Treat root-README workflow steps and tables as first-class documentation requirements
- Decision: Update the root README workflow steps, framework matrix, and any summary copy so they describe present usage rather than legacy setup expectations.
- Rationale: The root README is the most obviously incorrect surface today, and tables are scanned faster than prose, so stale entries are especially likely to mislead readers.
- Alternatives considered:
  - Only adjust surrounding paragraphs: lower effort, but leaves the most visible inaccurate surface unchanged.
  - Remove the table entirely: avoids stale wording, but also removes a useful summary format.

3) Keep the scope limited to the two README files that define onboarding expectations
- Decision: Constrain this change to root `README.md` and `repos/arashi/README.md` unless implementation reveals a directly dependent README asset or link.
- Rationale: The issue is README-specific, and limiting the scope to the two relevant surfaces keeps the change focused while still resolving the cross-repo inconsistency.
- Alternatives considered:
  - Update docs site messaging in the same change: potentially helpful, but not required to resolve the issue.

4) Preserve audience-specific emphasis while aligning on current-state wording
- Decision: Let the meta-repo README focus on planning/spec workflow and let `repos/arashi/README.md` focus on the CLI product, while ensuring both agree that OpenSpec is the current workflow and SpecKit is historical context.
- Rationale: The two READMEs serve different audiences, so full content duplication would be noisy, but contradictory workflow framing would be confusing.
- Alternatives considered:
  - Force identical wording in both files: simpler to review, but awkward because the repos have different purposes.

## Risks / Trade-offs

- [Risk] Historical context could overshadow the current guidance -> Mitigation: limit the transition note to one concise statement near the relevant README section.
- [Risk] README wording may still drift from future tooling decisions -> Mitigation: phrase the content as the project's current workflow, not a permanent guarantee.
- [Risk] Root README table edits might become inconsistent with nearby prose -> Mitigation: review the full root README section as one unit during implementation instead of editing a single row in isolation.
- [Risk] The two READMEs could still diverge in emphasis or terminology -> Mitigation: review both files together for shared OpenSpec and SpecKit wording before finalizing.

## Migration Plan

1. Update root `README.md` narrative, workflow steps, and any comparison table entries that currently imply SpecKit-first requirements.
2. Update `repos/arashi/README.md` wherever spec-workflow framing needs to remain consistent with the current OpenSpec positioning.
3. Verify both READMEs read correctly in plain markdown and that the OpenSpec positioning is unambiguous.
4. If the new wording causes confusion or over-explains the history, roll back by reverting the affected README change and rewriting the clarification more narrowly.

## Open Questions

- Is README alignment alone sufficient, or should a follow-up change mirror the same SpecKit-to-OpenSpec clarification on docs pages linked from these READMEs?
