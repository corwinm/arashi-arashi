## 1. Review Current Skill Package

- [x] 1.1 Read `repos/arashi-skills/AGENTS.md`, `README.md`, `skills/arashi/README.md`, and `skills/arashi/SKILL.md` to confirm current guidance and contributor rules.
- [x] 1.2 Review `skills/arashi/references/*.md` to identify guidance already covered outside `SKILL.md`.

## 2. Minimize Skill Entry Point

- [x] 2.1 Rewrite `skills/arashi/SKILL.md` as a concise policy/routing card with use cases, start-here flow, operating rules, and reference links.
- [x] 2.2 Remove duplicated workflow manuals and exhaustive command-parameter lists from `SKILL.md`.
- [x] 2.3 Add an operating rule that agents must use `arashi --help` and `arashi <command> --help` to discover current command parameters before advising on non-trivial flags.

## 3. Align References and Contributor Guidance

- [x] 3.1 Update reference wording where needed so examples are presented as common patterns and CLI help remains the source of truth for current flags.
- [x] 3.2 Update `README.md`, `skills/arashi/README.md`, or `AGENTS.md` if needed so contributors update detailed references first and only change `SKILL.md` for routing, policy, or reference links.

## 4. Validate

- [x] 4.1 Run the repository's applicable validation or security gate for `repos/arashi-skills` if available.
- [x] 4.2 Review the final docs for broken relative links, duplicated detailed command syntax, and alignment with the new minimal-skill model.
