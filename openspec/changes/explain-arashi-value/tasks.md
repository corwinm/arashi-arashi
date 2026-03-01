## 1. Define canonical value narrative

- [x] 1.1 Finalize the canonical frontend+backend scenario wording and command sequence (`add` -> `create` -> `switch`) for reuse across docs and README
- [x] 1.2 Draft concise value-proposition copy for above-the-fold landing content that emphasizes parallel multi-repo worktrees
- [x] 1.3 Add a parity checklist (headline, 3-step flow, outcome statement) to use during review of both repos

## 2. Implement docs landing-page updates in `repos/arashi-docs`

- [x] 2.1 Update landing hero/value section content to lead with the multi-repo parallel-worktree outcome
- [x] 2.2 Add the minimal frontend+backend scenario section with short command-accurate captions
- [x] 2.3 Implement lightweight animated walkthrough for the 3-step flow on the landing page
- [x] 2.4 Implement reduced-motion/non-animated fallback that preserves the same workflow step order and meaning

## 3. Implement README updates in `repos/arashi`

- [x] 3.1 Add a value-focused README section describing the same canonical multi-repo workflow
- [x] 3.2 Add static visual sequence/assets in README-compatible markdown format to mirror the landing walkthrough
- [x] 3.3 Align README wording with landing-page structure and outcome statement to prevent messaging drift

## 4. Validate and finalize

- [x] 4.1 Verify command terminology and sequence in all captions/snippets against current Arashi docs/help output
- [x] 4.2 Validate docs site rendering on desktop/mobile and confirm reduced-motion behavior communicates the workflow clearly
- [x] 4.3 Validate README rendering on GitHub markdown and confirm visuals remain understandable without animation
- [x] 4.4 Run repository-specific checks required by each touched repo and prepare changes for review
