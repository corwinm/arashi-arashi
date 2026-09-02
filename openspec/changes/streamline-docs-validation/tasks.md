## 1. Regression coverage

- [x] 1.1 Add a focused docs pipeline contract test that fails on job-level failure suppression, dependency installation in external-link health, duplicate semantic registration, a no-op publish gate, Netlify context command overrides, more than one build, or GitHub-owned validation inside Netlify
- [x] 1.2 Run the new test against the current configuration and record the expected failing assertions before implementation
- [x] 1.3 Add deterministic HTTP tests proving unsuccessful `HEAD` probes (including request errors) fall back to `GET`, successful fallback responses pass, and final failures report the `GET` result

## 2. GitHub Actions cleanup

- [x] 2.1 Make scheduled/manual external-link failures visible and run the built-in-only checker on pinned Node.js without package installation or cache restoration
- [x] 2.2 Use a bounded `GET` fallback for every unsuccessful `HEAD` probe and report the final request outcome
- [x] 2.3 Remove duplicate semantic-registration execution and the no-op publish-gate job from docs validation while preserving the required check name and PR/default-branch triggers

## 3. Netlify command cleanup

- [x] 3.1 Make every Netlify context inherit one canonical setup/install and build-only command
- [x] 3.2 Remove Netlify context overrides and deterministic quality checks duplicated from the required GitHub pipeline

## 4. Verification and delivery

- [x] 4.1 Run the focused contract test, full docs validation, Netlify build-command reproduction, Actionlint, formatting, and diff checks
- [x] 4.2 Obtain independent review of the exact implementation diff and reconcile actionable findings
- [ ] 4.3 Open and verify the docs implementation PR with exact-head GitHub Actions and Netlify deploy-preview evidence
- [ ] 4.4 From the reviewed docs head, push a disposable exact-ref fixture using a reserved `.invalid` link, dispatch external-link health against that ref, verify matching `headSha` and a failed workflow diagnostic, delete the fixture branch, then dispatch the clean implementation ref and verify its `headSha` and successful conclusion
- [ ] 4.5 Merge the child PR, then verify the default-branch GitHub run and Netlify production deploy both identify the docs merge SHA and smoke-test the public homepage, representative nested/generated routes, and install/uninstall redirects
- [ ] 4.6 If production verification fails, deliver a revert PR and verify its merge SHA in GitHub Actions, Netlify production, and the public endpoint before continuing
- [ ] 4.7 Only after successful production verification, archive and validate the OpenSpec change, commit the meta repository at the exact merged child head, open the meta PR, and merge it after exact-head checks pass
