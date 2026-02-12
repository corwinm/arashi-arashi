# Quickstart: Install Script and Onboarding Instructions

**Feature**: 038-add-install-script  
**Audience**: Maintainers implementing install flow and onboarding content updates  
**Last Updated**: 2026-02-11

## Goal

Ship two clear first-run install paths (curl script and npm) and present them consistently in README, docs onboarding, and landing hero so users can install and verify quickly.

## Prerequisites

- Workspace repositories are synced under `repos/`.
- You can edit these repositories:
  - `repos/arashi`
  - `repos/arashi-docs`
- You can run quality gates in both repositories.

## Step 1: Define Canonical Install Commands

1. Finalize the canonical curl one-command install text.
2. Finalize npm global install command text.
3. Define one verification command and one immediate next-step command shared across surfaces.

## Step 2: Implement curl Install Path

1. Add or update the installer script in `repos/arashi` as the canonical direct-install mechanism.
2. Ensure it covers supported platform mapping and clear failure messaging.
3. Ensure reruns are safe and predictable.

## Step 3: Align Release Binding for Installer

1. Confirm installer references release assets that align with current semantic-release outputs.
2. Ensure integrity metadata and fallback behavior are documented and wired into release expectations.
3. Ensure installer and release artifact naming stay synchronized.

## Step 4: Update README Installation Surface

1. Update `repos/arashi/README.md` installation section with both curl and npm methods.
2. Include prerequisites, verification, and fallback troubleshooting entry points.
3. Keep wording and command text consistent with docs onboarding content.

## Step 5: Update Docs Onboarding Surface

1. Update `repos/arashi-docs/docs/getting-started/index.md` with dual install methods.
2. Include prerequisite checks, verification step, troubleshooting guidance, and clear next action.
3. Keep this page as canonical detailed guidance for first-time users.

## Step 6: Update Landing Hero Visibility

1. Update `repos/arashi-docs/docs/index.md` hero content so both install methods are immediately visible.
2. Keep hero presentation concise while linking to complete onboarding details.
3. Verify mobile and desktop readability for copy-ready commands in hero context.

## Step 7: Validate Consistency and Quality

1. Verify command parity across:
   - `repos/arashi/README.md`
   - `repos/arashi-docs/docs/getting-started/index.md`
   - `repos/arashi-docs/docs/index.md`
2. Verify both install methods include matching verification and troubleshooting outcomes.
3. Perform manual acceptance checks for both methods from clean first-run conditions.

## Step 8: Run Required Quality Gates

In `repos/arashi`:

1. `bun run lint`
2. `bun test`
3. `bun run build`

In `repos/arashi-docs`:

1. `bun run validate`
2. `bun run build`

## Expected Outcome

Users can discover either install method from the landing hero, follow complete instructions in docs/README, and complete verified first-run install without account setup.
