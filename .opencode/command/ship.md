---
description: Create coordinated multi-repo commits and optional PRs
---

Create coordinated commits across the parent specs repo and every changed child repo, then optionally open linked PRs.

**Input**: Optionally specify an issue URL/number or change name after `/ship`.

Examples:
- `/ship`
- `/ship https://github.com/corwinm/arashi-arashi/issues/123`
- `/ship #123`

**Goal**

- Commit all relevant changes in all affected repositories.
- Reference the original spec issue in every commit.
- Ask whether to open PRs.
- If yes, create PRs for each affected repository with cross-links.
- Ensure the parent specs PR closes the related issue.

**Steps**

1. **Detect affected repositories**

   - Treat the current workspace root as the **parent specs repo**.
   - Discover child repos under `repos/*` that are git repositories.
   - For each repository (parent + children), run `git status --short`.
   - Keep only repositories with changes.
   - If no repositories have changes, report and stop.

2. **Resolve the canonical issue reference**

   Prefer in this order:

   1) Argument passed to `/ship` if it is an issue URL/number
   2) Parse modified `specs/*/spec.md` files for an issue URL (`https://github.com/.../issues/<n>`)
   3) Parse changed OpenSpec artifacts (`openspec/changes/*`) for a linked issue URL

   If still missing or ambiguous, use **AskUserQuestion** to request the canonical issue URL.

   Also derive:
   - `issueUrl` (full URL)
   - `issueNumber` (numeric, when available)
   - `issueRefShort` (`owner/repo#number` when available)

3. **Commit each changed repository (one commit per repo)**

   For each changed repo, in sequence:

   - Run `git status`, `git diff`, and recent `git log` to align with local commit style.
   - Stage relevant tracked/untracked files.
   - Exclude likely secret files (`.env`, `*.pem`, credentials files).
   - Draft a focused commit message (why-oriented) and include issue reference.

   Commit message guidance:
   - Parent specs repo: include issue reference in body (for example `Refs: <issueUrl>`).
   - Child repos: include same issue reference in body.

   Quality checks before each commit:
   - Run project-required checks when available.
   - For `repos/arashi`, run:
     - `bun run lint`
     - `bun test`
     - `bun run build`
   - Fix failures before committing.

4. **Prompt to create PRs**

   Use **AskUserQuestion**:
   - "Create PRs for all committed repositories now?"
   - options: `Yes` / `No`

   If `No`, stop after reporting committed repos and branches.

5. **If Yes, create PRs for each committed repository**

   For each committed repo:

   - Verify current branch and remote tracking.
   - Push with upstream if needed: `git push -u origin <branch>`.
   - Create PR with `gh pr create` (title/body based on repo changes).
   - Capture every PR URL.

6. **Backfill cross-references in every PR body**

   After all PRs exist, update each PR body so links are bidirectional.

   Required body section in every PR:

   ```markdown
   ## Related
   - Companion implementation/spec PRs: <all other PR URLs>
   - Related issue: <issueUrl>
   ```

   Additional rule for parent specs PR:
   - Include a closing keyword for the issue (`Closes #<issueNumber>` when valid in that repo; otherwise `Closes <issueUrl>`).

   Additional rule for non-parent PRs:
   - Do **not** close the issue.
   - Include issue as reference only.

7. **Report final results**

   Show:
   - issue used (`issueUrl`)
   - committed repositories with commit SHAs
   - PR URL per repository (if created)
   - confirmation that parent PR closes the issue

**Output**

At minimum:

- Parent specs repo commit status
- Child repo commit status
- PR decision (`Yes`/`No`)
- PR URLs (if created)
- Cross-link/issue linkage confirmation

**Guardrails**

- One commit per changed repository (no cross-repo commit attempts).
- Do not commit unchanged repositories.
- Do not amend commits unless explicitly requested.
- Never use destructive git operations (`reset --hard`, force-push) unless explicitly requested.
- Do not skip hooks unless explicitly requested.
- Ask before proceeding only when issue resolution is ambiguous or missing.
