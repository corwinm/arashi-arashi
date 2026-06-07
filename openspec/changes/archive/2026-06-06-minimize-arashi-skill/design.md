## Context

`repos/arashi-skills/skills/arashi/SKILL.md` is the installed skill entry point. It currently contains a mix of skill routing, operating rules, workflow summaries, command examples, and detailed flags. The package already has dedicated reference files for prerequisites, commands, workflows, session shortcuts, troubleshooting, publication policy, and a cheat sheet.

The change should make `SKILL.md` a stable policy/routing card while preserving detailed instructions in linked references and the Arashi website. The current CLI help output should be treated as authoritative for command parameters.

## Goals / Non-Goals

**Goals:**
- Keep `SKILL.md` short, durable, and focused on agent behavior.
- Point agents to `arashi --help` and `arashi <command> --help` before advising on non-trivial command parameters.
- Ensure detailed instructions remain discoverable through reference links.
- Align repository contribution guidance with the new split between minimal skill and detailed references.

**Non-Goals:**
- Change Arashi CLI commands or behavior.
- Remove detailed guidance from the skill package entirely.
- Replace the canonical website documentation.
- Add new dependencies or tooling.

## Decisions

- Use `SKILL.md` as a policy/routing card rather than a command manual.
  - Rationale: This minimizes duplication and drift while still giving agents enough context to know when and how to use the skill.
  - Alternative considered: keep detailed workflow summaries in `SKILL.md`; rejected because it keeps the duplication problem.

- Make CLI help discovery a first-class operating rule.
  - Rationale: `arashi --help` and `arashi <command> --help` reflect the installed CLI version and should be consulted before recommending flags.
  - Alternative considered: maintain exhaustive flag lists in references; rejected as brittle, though common examples can remain useful.

- Keep references as the home for detailed workflows and troubleshooting.
  - Rationale: The package already has a reference structure, so the implementation can mostly reorganize and clarify rather than invent new docs.
  - Alternative considered: link only to the website; rejected because installed skills should remain useful offline for package-specific guidance.

## Risks / Trade-offs

- Less detail in `SKILL.md` could make first response guidance too vague → Mitigate with a concise “Start here” sequence and complete reference links.
- References may still contain stale flag examples → Mitigate by framing examples as common patterns and adding the `--help` source-of-truth rule.
- Contribution guidance may continue encouraging `SKILL.md` edits first → Mitigate by updating README/AGENTS guidance where appropriate.
