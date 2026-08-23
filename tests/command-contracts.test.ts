import { afterEach, describe, expect, test } from "vitest";
import {
  cp,
  copyFile,
  mkdtemp,
  mkdir,
  readFile,
  rm,
  writeFile,
} from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import {
  checkContracts as checkContractsWithFocusedAcceptance,
  createBaseSemanticPolicy,
  formatHuman,
} from "../scripts/command-contracts";

const checkContracts = (root: string) =>
  checkContractsWithFocusedAcceptance(root, { runFocusedCheckers: false });

const roots: string[] = [];
const createLaunchContract = {
  schemaVersion: 1,
  canonicalField: "defaults.create.launch",
  modes: ["none", "auto", "sesh", "herdr"],
  absentMode: "none",
  switch: {
    field: "defaults.create.switch",
    type: "boolean",
    independent: true,
    launchImpliesSwitch: true,
  },
  editorHosts: ["vscode", "cursor", "kiro"],
  editorScope: "defaults.editors.<host>.create",
  editorScopeFallback: "none",
  cliPrecedence: [
    "explicit-launcher",
    "launch",
    "no-launch",
    "configured",
    "none",
  ],
  legacyFields: ["launch:boolean", "launchMode", "launch_mode"],
  acceptedMigrations: [
    "launcher-without-boolean",
    "true-with-absent-or-launcher",
    "false-without-launcher",
    "canonical-with-compatible-launcher",
    "equal-launcher-aliases",
  ],
  rejectedMigrations: [
    "false-with-launcher",
    "conflicting-launcher-aliases",
    "none-with-launcher",
    "auto-with-explicit-launcher",
    "opposite-explicit-launchers",
    "invalid-values",
  ],
  jsonRestrictedModes: ["auto", "sesh", "herdr"],
  failurePreservesCreatedWorktrees: true,
};
const kittyWorktreeSessionContract = {
  schemaVersion: 1,
  minimumVersion: "0.43.0",
  resultMode: "kitty",
  autoOrder: ["tmux", "herdr", "cmux", "ide", "kitty", "cd", "platform"],
  detection: {
    beforeSupportPreflight: true,
    trimMarkers: true,
    requireAllEvidence: true,
    termOnlyManaged: false,
    evidence: ["KITTY_PID", "KITTY_WINDOW_ID"],
  },
  remoteControl: {
    required: true,
    clients: ["inherited-path", "macos-app-bundle"],
    arbitrarySocketDiscovery: false,
  },
  identity: {
    source: "canonical-realpath",
    algorithm: "sha256",
    marker: "arashi_worktree_id",
    exactMatch: true,
  },
  reuse: {
    existing: "focus",
    duplicate: "fail",
    closeRaceRetries: 1,
    automaticWindowCleanup: false,
    staleReadableMetadata: "accept",
  },
  locking: {
    crossProcess: true,
    scope: "identity",
    timeoutMs: 10_000,
    liveOwnerStealing: false,
    deadOwnerRecovery: true,
    malformedOwnerRecoveryAfterMs: 30_000,
    ownershipSafeRelease: true,
  },
  session: {
    scope: "live-only",
    persistentFiles: false,
    removeClosesWindows: false,
  },
  selection: {
    autoDetectedOnly: true,
    explicitFlag: false,
    persistedMode: false,
    failClosed: true,
  },
  create: {
    sharedLauncher: true,
    failurePreservesCreatedWorktrees: true,
  },
};
const addMaterializationContract = {
  activeConfigOwnership: true,
  canonicalCloneDefaultBranch: true,
  coordinatedBranch: "active-parent-branch",
  linkedMode: "git-topology",
  resultRoles: [
    "path",
    "materialization",
    "canonicalPath",
    "worktreePath",
    "defaultBranch",
    "coordinatedBranch",
    "setupScript",
    "setupScriptCreated",
  ],
};
const configureContract = {
  actions: ["keep", "edit", "clear"],
  descriptors: {
    commandDefaults: [
      "defaults.create.switch",
      "defaults.create.launch",
      "defaults.switch.mode",
    ],
    editorDefaults: [
      "defaults.editors.vscode.create.switch",
      "defaults.editors.vscode.create.launch",
      "defaults.editors.cursor.create.switch",
      "defaults.editors.cursor.create.launch",
      "defaults.editors.kiro.create.switch",
      "defaults.editors.kiro.create.launch",
    ],
    meta: ["meta.baseBranch"],
    repository: [
      "groups",
      "baseBranch",
      "copy",
      "symlink",
      "pre-create",
      "post-create",
      "pre-remove",
      "post-remove",
    ],
    workspace: [
      "reposDir",
      "worktreesDir",
      "baseBranch",
      "sync.timeoutSeconds",
    ],
    workspaceHooks: [
      "hooks.timeout",
      "hooks.scripts.pre-create",
      "hooks.scripts.post-create",
      "hooks.scripts.pre-remove",
      "hooks.scripts.post-remove",
    ],
  },
  invocation: {
    editing: "tty-stdin-and-stdout",
    json: "sanitized-inspection-only",
  },
  loading: "exact-bytes-strict-no-migration-or-repair",
  noOp: "preserve-original-bytes-before-confirmation",
  preview: {
    activeFiles: "separate-body-free-list",
    config: "exact-serialized-json-including-inline-bodies",
  },
  scopes: [
    "workspace-settings",
    "workspace-hooks",
    "command-defaults",
    "editor-defaults",
    "meta-policy",
    "repository",
  ],
  secrecy: {
    inlineEntry: "visible-plaintext",
    ordinaryAndJson: "lifecycle-and-interpreter-presence-only",
  },
  state: {
    effective: ["inherited", "built-in"],
    persisted: ["configured", "not-configured"],
  },
  transaction: {
    activeFiles: "atomic-no-replace-with-owned-rollback",
    configSavesAtMost: 1,
    expectedBytes: true,
    lock: "shared-workspace-add-configure-lock",
    nativeFiles: "metadata-only-observe-keep-skip-never-overwrite",
  },
} as const;
const addMaterializationGuidance = [
  "canonical clone",
  "child's default branch",
  "child default branch",
  "active linked parent worktree",
  "linked parent worktree",
  "active child worktree",
  "active child path",
  "coordinated branch",
  "active parent branch",
  "active parent configuration",
  "active parent's `.arashi/config.json`",
  "linked checkout's `.arashi/config.json`",
  "Only the active parent worktree's `.arashi/config.json`",
  "remote-tracking ref",
  "creates it from the detected default branch",
  "creates it from the detected child default branch",
  "`local`",
  "`local` scope",
  "`tracked`",
  "`tracked` scope",
  "`none`",
  "retains the canonical clone",
  "`canonicalPath`",
  "`worktreePath`",
].join("\n");
const option = (flags: string) => ({
  flags,
  description: flags,
  required: false,
  optional: false,
  variadic: false,
});
const tabLauncherSupport = {
  noFallback: true,
  supported: [
    "cmux",
    "herdr-with-workspace",
    "macos-ghostty-1.3+",
    "macos-iterm2",
    "managed-kitty",
    "sesh",
    "tmux",
    "wezterm-with-pane",
    "windows-terminal-with-session",
  ],
  unsupported: [
    "available-ide",
    "generic",
    "git-bash",
    "linux-ghostty",
    "macos-ghostty-before-1.3",
    "macos-terminal",
    "unmanaged-kitty",
  ],
};
const optionPolicies = {
  create: {
    "--tab": {
      compatibleOptions: [
        "--herdr",
        "--launch",
        "--no-launch",
        "--no-switch",
        "--sesh",
        "--switch",
        "--tmux",
      ],
      conflicts: [],
      dryRun: { runtimeTargetEvidenceRequired: false, supported: true },
      implies: ["launch", "switch"],
      json: {
        guardPrecedence: "before-option-validation",
        mode: "interactive-or-launch",
        unsupported: true,
      },
      launcherSupport: tabLauncherSupport,
      overrides: ["--no-launch", "--no-switch", "configured-launcher"],
      persisted: false,
    },
    "--tmux": {
      compatibleOptions: ["--no-launch", "--no-switch"],
      conflicts: ["--herdr", "--sesh"],
      environment: { name: "TMUX", nonEmptyAfterTrim: true },
      implies: ["launch", "switch"],
      json: {
        guardPrecedence: "before-option-validation",
        mode: "interactive-or-launch",
        unsupported: true,
      },
      persisted: false,
    },
  },
  switch: {
    "--tab": {
      compatibleOptions: [
        "--cursor",
        "--herdr",
        "--kiro",
        "--no-cd",
        "--no-default-launch",
        "--sesh",
        "--tmux",
        "--vscode",
      ],
      conflicts: ["--cd"],
      implies: ["launch"],
      json: {
        guardPrecedence: "before-option-validation",
        mode: "launch",
        unsupported: true,
      },
      launcherSupport: tabLauncherSupport,
      overrides: ["configured-cd", "configured-launcher", "contextual-cd"],
      persisted: false,
    },
    "--tmux": {
      compatibleOptions: ["--no-cd", "--no-default-launch"],
      conflicts: [
        "--cd",
        "--cursor",
        "--herdr",
        "--kiro",
        "--sesh",
        "--vscode",
      ],
      environment: { name: "TMUX", nonEmptyAfterTrim: true },
      implies: ["launch"],
      json: {
        guardPrecedence: "before-option-validation",
        mode: "launch",
        unsupported: true,
      },
      persisted: false,
    },
  },
} as const;
const docsTabContract = `# Window and Tab Launching

\`--tab\` is a CLI-only, one-invocation request and does not create a persistent preference.
For \`switch\`, explicit tab intent overrides configured parent-shell cd, bypasses configured launcher defaults, and conflicts only with explicit \`--cd\`.
For create, create tab implies launch and switch, wins over \`--no-launch\` and \`--no-switch\`, and bypasses configured launcher defaults.

| Launcher or context | Default independent launch | Explicit tab | Required target evidence |
| --- | --- | --- | --- |
| Windows Terminal | New window | True tab | Current window/profile when available |
| WezTerm | New window | True tab | Current exact pane for tab targeting |
| managed Kitty | Exact managed session/tab | Managed tab | Managed remote-control identity |
| tmux / sesh | tmux window or sesh-managed session | Managed tab equivalent | Active tmux/session evidence |
| cmux | Workspace | cmux workspace / vertical tab | Active session identifiers |
| active-workspace Herdr | Workspace | Herdr tab | Active workspace ID |
| Terminal.app | New window | Unsupported | No supported true-tab automation |
| iTerm2 | New window | True tab | Current application/window/session |
| macOS Ghostty older than 1.3 or missing supported-version evidence | New window | Unsupported | No supported tab API |
| macOS Ghostty 1.3+ | New window | True tab | Current Ghostty window and supported version |
| Git Bash / MinTTY | New supported default path only | Unsupported | No stable exact tab-group target |
| unmanaged Kitty | New supported default path only | Unsupported | No managed remote-control identity |
| Linux Ghostty | New window | Unsupported | No external true-tab adapter |
| IDE workspaces | Existing editor behavior | Unsupported | No terminal-tab contract |
| generic fallback | New terminal/platform window | Unsupported | No portable exact tab target |

For Terminal.app, press Command-T manually, then run \`aw switch --cd\`; this requires active Arashi shell integration. Normal automatic launch opens a new Terminal window only when automatic launcher resolution selects Terminal.app.

Unsupported tab disposition never opens a window or falls through to another launcher.
These guards win before launcher conflicts or runtime-context validation.

- \`switch --json --tab\` returns one \`JSON_UNSUPPORTED_FOR_MODE\` document using the existing \`launch\` mode and exit status \`2\`.
- \`create --json --tab\` returns one \`JSON_UNSUPPORTED_FOR_MODE\` document using the existing \`interactive-or-launch\` mode and exit status \`1\`.
`;
const skillsTabContract = `
### Launch disposition (\`--tab\`)

\`--tab\` is a one-shot CLI-only launch disposition and is never persisted.
A \`switch --tab\` request expresses explicit launch intent, overrides configured or contextual parent-shell \`cd\`, bypasses configured launcher defaults, and conflicts only with explicit \`--cd\`.
\`create --tab\` implies launch and switch, wins over \`--no-launch\` and \`--no-switch\`, and bypasses configured launcher defaults.
A requested tab never silently falls back. Enforce each guard before option or context validation.

\`switch --tab --json\` returns \`JSON_UNSUPPORTED_FOR_MODE\` with \`details.mode: "launch"\` and exits \`2\`.
\`create --tab --json\` returns \`JSON_UNSUPPORTED_FOR_MODE\` with \`details.mode: "interactive-or-launch"\` and exits \`1\`.

\`\`\`json
{"ok":false,"command":"switch","schemaVersion":1,"error":{"code":"JSON_UNSUPPORTED_FOR_MODE","message":"JSON output is not supported for this mode","details":{"mode":"launch"}},"warnings":[]}
\`\`\`

\`\`\`json
{"ok":false,"command":"create","schemaVersion":1,"error":{"code":"JSON_UNSUPPORTED_FOR_MODE","message":"JSON output is not supported for this mode","details":{"mode":"interactive-or-launch"}},"warnings":[]}
\`\`\`

| Launcher/context | Default \`window\` disposition | Explicit \`tab\` disposition |
|---|---|---|
| Windows Terminal | \`wt.exe -w new new-tab\` | \`wt.exe -w 0 new-tab\`; failure returns \`LAUNCH_FAILED\` without fallback |
| Standalone Git Bash / configured MinTTY | independent window | \`TAB_DISPOSITION_UNSUPPORTED\`; use the default window or Windows Terminal |
| WezTerm | \`wezterm cli spawn --new-window --cwd <path>\` | \`wezterm cli spawn --pane-id <WEZTERM_PANE> --cwd <path>\`; missing evidence returns \`TAB_DISPOSITION_UNSUPPORTED\` |
| Managed Kitty | managed independent session | same managed Kitty tab/session primitive, not a window fallback |
| Unmanaged Kitty | New Kitty OS window | \`TAB_DISPOSITION_UNSUPPORTED\`; never probe another instance |
| tmux and sesh | \`tmux new-window -c <path>\` | same managed primitive, reported as tab equivalent |
| cmux | workspace | same workspace/vertical-tab primitive |
| Herdr | \`herdr worktree open\` | \`herdr tab create\`; missing evidence returns \`TAB_DISPOSITION_UNSUPPORTED\` |
| Automatically detected IDE with unavailable CLI | continue terminal resolution | continue terminal resolution |
| VS Code / Cursor / Kiro | \`--new-window\` | \`TAB_DISPOSITION_UNSUPPORTED\` |
| Linux Ghostty | \`ghostty +new-window\` | \`TAB_DISPOSITION_UNSUPPORTED\`; never map to a window |
| macOS Ghostty older than 1.3 or missing supported-version evidence | independent window | \`TAB_DISPOSITION_UNSUPPORTED\` |
| macOS Ghostty 1.3+ | \`new window with configuration\` | \`new tab in <captured-window> with configuration\` |
| Terminal.app | new window transaction | \`TAB_DISPOSITION_UNSUPPORTED\`; no supported true-tab automation |
| iTerm2 | new window with current profile | tab in exact target window with current profile |
| Generic Linux/macOS/Windows fallback | independent window | \`TAB_DISPOSITION_UNSUPPORTED\` |

For Terminal.app, press Command-T manually, then run \`aw switch --cd\`; this requires active Arashi shell integration. Normal automatic launch opens a new Terminal window only when automatic launcher resolution selects Terminal.app.
`;
afterEach(async () =>
  Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true }))),
);

async function fixture(): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), "arashi-contracts-"));
  roots.push(root);
  const files: Record<string, unknown | string> = {
    "repos/arashi/contracts/create-launch-config.json": createLaunchContract,
    "repos/arashi/contracts/kitty-worktree-sessions.json":
      kittyWorktreeSessionContract,
    "repos/arashi/schema/config.schema.json": {
      definitions: {
        CommandDefaultsConfig: {
          properties: {
            create: { $ref: "#/definitions/CreateCommandDefaults" },
            editors: { $ref: "#/definitions/EditorDefaultsConfig" },
          },
        },
        CreateCommandDefaults: {
          properties: {
            launch: { $ref: "#/definitions/CreateLaunchMode" },
            switch: { type: "boolean" },
          },
        },
        CreateLaunchMode: { enum: ["none", "auto", "sesh", "herdr"] },
        EditorCommandDefaults: {
          properties: {
            create: { $ref: "#/definitions/CreateCommandDefaults" },
          },
        },
        EditorDefaultsConfig: {
          properties: {
            cursor: { $ref: "#/definitions/EditorCommandDefaults" },
            kiro: { $ref: "#/definitions/EditorCommandDefaults" },
            vscode: { $ref: "#/definitions/EditorCommandDefaults" },
          },
        },
        SwitchCommandDefaults: {
          additionalProperties: false,
          properties: { mode: { $ref: "#/definitions/SwitchMode" } },
        },
        SwitchMode: { enum: ["auto", "cd", "launch", "sesh", "herdr"] },
      },
    },
    "repos/arashi-docs/contracts/switch-config.json": {
      schemaVersion: 1,
      canonicalField: "defaults.switch.mode",
      modes: ["auto", "cd", "launch", "sesh", "herdr"],
      absentMode: "launch",
      autoOrder: ["tmux", "herdr", "cmux", "ide", "kitty", "cd", "platform"],
      legacyFields: [
        "defaults.switch.launchMode",
        "defaults.switch.launch_mode",
      ],
    },
    "repos/arashi-docs/contracts/create-launch-config.json":
      createLaunchContract,
    "repos/arashi-docs/contracts/kitty-worktree-sessions.json":
      kittyWorktreeSessionContract,
    "repos/arashi-skills/contracts/switch-config.json": {
      schemaVersion: 1,
      canonicalField: "defaults.switch.mode",
      modes: ["auto", "cd", "launch", "sesh", "herdr"],
      absentMode: "launch",
      autoOrder: ["tmux", "herdr", "cmux", "ide", "kitty", "cd", "platform"],
      legacyFields: [
        "defaults.switch.launchMode",
        "defaults.switch.launch_mode",
      ],
    },
    "repos/arashi-skills/contracts/create-launch-config.json":
      createLaunchContract,
    "repos/arashi-skills/contracts/kitty-worktree-sessions.json":
      kittyWorktreeSessionContract,
    "repos/arashi/contracts/cli-commands.json": {
      schemaVersion: 4,
      commands: [
        {
          path: "add",
          description: "add",
          aliases: [],
          hidden: false,
          arguments: [],
          options: [],
          semantics: {
            addMaterialization: addMaterializationContract,
            json: { support: "full" },
            docs: { expectation: "required" },
            skills: { expectation: "required" },
            standalone: { support: "full" },
            vscode: { expectation: "required" },
          },
        },
        {
          path: "init",
          description: "init",
          aliases: [],
          hidden: false,
          arguments: [],
          options: [
            "--dry-run",
            "--force",
            "--ignore-scope <scope>",
            "--json",
            "--no-discover",
            "--repos-dir <path>",
            "--verbose",
            "--worktrees-dir <path>",
            "--zero-config",
          ].map((flags) => ({
            flags,
            description: flags,
            required: flags.includes("<"),
            optional: false,
            variadic: false,
          })),
          semantics: {
            json: { support: "full" },
            docs: { expectation: "required" },
            skills: { expectation: "required" },
            standalone: {
              support: "conditional",
              reason:
                "Only init --zero-config prepares standalone mode; ordinary init creates configured mode.",
            },
            zeroConfig: {
              option: "--zero-config",
              dryRun: { finalState: "unchanged", supported: true },
              json: {
                singleEnvelope: true,
                supported: true,
                suppressesHumanStdout: true,
              },
              compatibleOptions: ["--dry-run", "--json", "--verbose"],
              incompatibleOptions: [
                "--force",
                "--ignore-scope",
                "--no-discover",
                "--repos-dir",
                "--worktrees-dir",
              ],
            },
            vscode: { expectation: "required" },
          },
        },
        ...(["create", "switch"] as const).map((path) => {
          const policies = optionPolicies[path];
          const flags = [
            ...Object.keys(policies),
            ...Object.values(policies).flatMap((policy) => [
              ...policy.compatibleOptions,
              ...policy.conflicts,
            ]),
          ];
          return {
            path,
            description: path,
            aliases: [],
            hidden: false,
            arguments: [],
            options: [...new Set(flags)].map(option),
            semantics: {
              json: { support: "conditional", reason: "launch" },
              docs: { expectation: "required" },
              skills: { expectation: "required" },
              standalone: { support: "full" },
              vscode: { expectation: "required" },
              optionPolicies: policies,
            },
          };
        }),
        {
          path: "old",
          description: "old",
          aliases: [],
          hidden: false,
          arguments: [],
          options: [],
          semantics: {
            json: { support: "unsupported", reason: "interactive" },
            docs: { expectation: "excluded", reason: "internal" },
            skills: { expectation: "excluded", reason: "internal" },
            standalone: { support: "not-applicable", reason: "internal" },
            vscode: { expectation: "excluded", reason: "internal" },
          },
        },
      ],
    },
    "repos/arashi/README.md": addMaterializationGuidance,
    "repos/arashi-docs/docs/commands/add.md": `# Add\n${addMaterializationGuidance}\n`,
    "repos/arashi-docs/docs/commands/create.md": "# Create\n`--tab`\n",
    "repos/arashi-docs/docs/commands/init.md": "# Init\n",
    "repos/arashi-docs/docs/commands/switch.md": "# Switch\n`--tab`\n",
    "repos/arashi-docs/docs/commands/index.md":
      "- [Add](/commands/add/)\n- [Create](/commands/create/)\n- [Init](/commands/init/)\n- [Switch](/commands/switch/)\n",
    "repos/arashi-docs/docs/workflows/launch-disposition.md": docsTabContract,
    "repos/arashi-docs/scripts/check-tab-launch-docs.ts":
      "console.log('tab launch docs checker passed');\n",
    "repos/arashi-docs/package.json": {
      scripts: {
        "validate:tab-launch-docs": "node scripts/check-tab-launch-docs.ts",
      },
    },
    "repos/arashi-docs/docs/workflows/kitty.md":
      "Kitty 0.43 or newer\n`allow_remote_control`\nexact Arashi worktree identity\nafter integrated IDE detection and before parent-shell `cd`\nlive only\n`.kitty-session`\n`aw remove` does not close Kitty windows or sessions\nno `--kitty` flag\ndoes not add Kitty to persistent Arashi launch configuration\n`LAUNCH_FAILED`\ndoes not fall back\ncreated worktrees remain available\ncross-process identity lock\n10 seconds\nlive owner\ndead owner\n30 seconds\nownership-safe release\n",
    "repos/arashi-docs/public/workflows/kitty.md":
      "Kitty 0.43 or newer\n`allow_remote_control`\nexact Arashi worktree identity\nafter integrated IDE detection and before parent-shell `cd`\nlive only\n`.kitty-session`\n`aw remove` does not close Kitty windows or sessions\nno `--kitty` flag\ndoes not add Kitty to persistent Arashi launch configuration\n`LAUNCH_FAILED`\ndoes not fall back\ncreated worktrees remain available\ncross-process identity lock\n10 seconds\nlive owner\ndead owner\n30 seconds\nownership-safe release\n",
    "repos/arashi-docs/public/commands/add.md": addMaterializationGuidance,
    "repos/arashi-docs/public/llms-full.txt":
      "Kitty 0.43 or newer\n`allow_remote_control`\nexact Arashi worktree identity\nafter integrated IDE detection and before parent-shell `cd`\nlive only\n`.kitty-session`\n`aw remove` does not close Kitty windows or sessions\nno `--kitty` flag\ndoes not add Kitty to persistent Arashi launch configuration\n`LAUNCH_FAILED`\ndoes not fall back\ncreated worktrees remain available\ncross-process identity lock\n10 seconds\nlive owner\ndead owner\n30 seconds\nownership-safe release\n" +
      addMaterializationGuidance,
    "repos/arashi-skills/contracts/command-coverage.json": {
      schemaVersion: 1,
      commands: [
        {
          name: "add",
          status: "covered",
          reference: "references/commands.md",
          standalone: { support: "supported" },
        },
        {
          name: "init",
          status: "covered",
          reference: "references/commands.md",
          requiredOptions: ["--zero-config"],
          standalone: {
            support: "conditional",
            reason:
              "Only init --zero-config prepares standalone mode; ordinary init creates configured mode.",
            policy: {
              option: "--zero-config",
              dryRun: true,
              json: true,
              compatibleOptions: ["--dry-run", "--json", "--verbose"],
              incompatibleOptions: [
                "--force",
                "--ignore-scope",
                "--no-discover",
                "--repos-dir",
                "--worktrees-dir",
              ],
            },
          },
        },
        ...(["create", "switch"] as const).map((name) => ({
          name,
          status: "covered",
          reference: "references/commands.md",
          requiredOptions: ["--tab", "--tmux"],
          standalone: { support: "supported" },
        })),
        {
          name: "old",
          status: "excluded",
          reason: "internal",
          standalone: { support: "not-applicable", reason: "internal" },
        },
      ],
    },
    "repos/arashi-skills/skills/arashi/references/commands.md":
      "Use `aw add`.\nUse `aw create feature --tab`.\nUse `aw switch --tab feature`.\n",
    "repos/arashi-skills/skills/arashi/references/commands/workspace.md":
      addMaterializationGuidance,
    "repos/arashi-skills/skills/arashi/references/commands/switch-and-launch.md":
      'tmux → Herdr → cmux → integrated IDE → Kitty → parent-shell `cd` → terminal application/platform fallback\n`mode: "kitty"`\nno explicit Kitty launcher flag\nnot a persisted create or switch mode\ndoes not fall back\n' +
      skillsTabContract,
    "repos/arashi-skills/scripts/tab-launch-disposition-guidance-selftest.mjs":
      "console.log('tab launch skill checker passed');\n",
    "repos/arashi-skills/skills/arashi/references/prerequisites.md":
      "Kitty 0.43+\nkitten --version\nremote control\nallow_remote_control\n",
    "repos/arashi-skills/skills/arashi/references/workflows.md":
      "Kitty 0.43+\nexact Arashi-managed marker\nstable identity\n`<repo-name>: <branch-name>`\nsame managed Kitty flow\nlive-only\n`.kitty-session`\nRemoval does not close Kitty\npreserves every successfully created worktree\n",
    "repos/arashi-skills/skills/arashi/references/troubleshooting.md":
      "Kitty 0.43+\nremote control\nLAUNCH_FAILED\nduplicate exact marked Kitty windows\ndoes not close ambiguous Kitty windows\npreserve the created worktrees\ncross-process identity lock\n10-second wait\nlive owner\ndead owner\n30 seconds\nownership-safe release\n",
    "repos/arashi-vscode/contracts/command-policy.json": {
      schemaVersion: 1,
      cliCommands: {
        add: { state: "mapped", commands: ["arashi.add"] },
        create: { state: "mapped", commands: ["arashi.add"] },
        init: { state: "mapped", commands: ["arashi.add"] },
        old: { state: "excluded", reason: "internal" },
        switch: { state: "mapped", commands: ["arashi.add"] },
      },
      extensionOnlyCommands: ["arashi.open"],
    },
    "repos/arashi-vscode/package.json": {
      contributes: {
        commands: [{ command: "arashi.add" }, { command: "arashi.open" }],
      },
    },
    ".github/workflows/cross-repo-command-contracts.yml":
      "jobs:\n  contracts:\n    runs-on: ubuntu-latest\n    steps:\n      - name: docs\n        run: pnpm --dir repos/arashi-docs validate:semantic-docs\n      - name: skills\n        run: node repos/arashi-skills/scripts/validate-guidance.mjs\n",
  };
  for (const [path, value] of Object.entries(files)) {
    const target = join(root, path);
    await mkdir(join(target, ".."), { recursive: true });
    await writeFile(
      target,
      typeof value === "string" ? value : JSON.stringify(value),
    );
  }
  return root;
}

async function schemaV5Fixture(): Promise<string> {
  const root = await fixture();
  for (const relativePath of [
    "repos/arashi/contracts/cli-commands.json",
    "repos/arashi-docs/contracts/cli-options.json",
    "repos/arashi-docs/docs/workflows/launch-disposition.md",
    "repos/arashi-skills/skills/arashi/references/commands.md",
    "repos/arashi-skills/skills/arashi/references/commands/workspace.md",
    "repos/arashi-skills/skills/arashi/references/commands/switch-and-launch.md",
  ]) {
    const target = join(root, relativePath);
    await mkdir(join(target, ".."), { recursive: true });
    await copyFile(join(process.cwd(), relativePath), target);
  }
  const contractPath = join(root, "repos/arashi/contracts/cli-commands.json");
  const contract = JSON.parse(await readFile(contractPath, "utf8"));
  contract.schemaVersion = 5;
  delete contract.root;
  contract.commands = contract.commands
    .filter(
      (command: any) =>
        command.path !== "configure" && !command.path.startsWith("completion"),
    )
    .map((command: any) => {
      delete command.aliasPaths;
      command.arguments.forEach((argument: any) => {
        delete argument.candidateKind;
        delete argument.choices;
        delete argument.hidden;
      });
      command.options = command.options.filter(
        (option: any) => option.long !== "--help",
      );
      command.options.forEach((option: any) => {
        delete option.candidateKind;
        delete option.choices;
        delete option.conflicts;
        delete option.repeatable;
      });
      return command;
    });
  await writeFile(contractPath, JSON.stringify(contract));
  await mkdir(join(root, "repos/arashi-docs/scripts"), { recursive: true });
  await mkdir(join(root, "repos/arashi-skills/scripts"), { recursive: true });
  await writeFile(
    join(root, "repos/arashi-docs/scripts/check-cli-option-docs.ts"),
    "console.log('CLI option docs fixture passed');\n",
  );
  await writeFile(
    join(
      root,
      "repos/arashi-skills/scripts/cli-flag-rationalization-guidance-selftest.mjs",
    ),
    "console.log('CLI flag skills fixture passed');\n",
  );
  const workflowPath = join(
    root,
    ".github/workflows/cross-repo-command-contracts.yml",
  );
  await writeFile(
    workflowPath,
    `${await readFile(workflowPath, "utf8")}      - name: skills option semantics\n        run: node repos/arashi-skills/scripts/validate-guidance.mjs\n      - name: package skills\n        run: |\n          node repos/arashi-skills/scripts/create-release-archive.mjs --root repos/arashi-skills --output arashi-skill-package.tar.gz\n          node repos/arashi-skills/scripts/create-release-archive.mjs --verify arashi-skill-package.tar.gz\n          mkdir -p package-check\n          tar -xzf arashi-skill-package.tar.gz -C package-check\n          node repos/arashi-skills/scripts/validate-guidance.mjs --skill-root package-check/skills/arashi\n`,
  );
  return root;
}

async function schemaV6Fixture(): Promise<string> {
  const root = await schemaV5Fixture();
  const copies = [
    "repos/arashi/README.md",
    "repos/arashi/contracts/cli-commands.json",
    "repos/arashi-docs/docs/commands",
    "repos/arashi-docs/docs/workflows/config.md",
    "repos/arashi-docs/public",
    "repos/arashi-docs/package.json",
    "repos/arashi-docs/.github/workflows/docs-validate.yml",
    "repos/arashi-docs/scripts/check-shell-completion-docs.ts",
    "repos/arashi-docs/scripts/check-ssh-host-alias-docs.ts",
    "repos/arashi-skills/contracts/command-coverage.json",
    "repos/arashi-skills/skills/arashi",
    "repos/arashi-skills/scripts/shell-completion-guidance-selftest.mjs",
    "repos/arashi-skills/scripts/ssh-host-alias-guidance-selftest.mjs",
    "repos/arashi-skills/.github/workflows/security-audit.yml",
    "repos/arashi-skills/.github/workflows/release-security-gate.yml",
    "repos/arashi-vscode/contracts/command-policy.json",
    "repos/arashi-vscode/package.json",
  ];
  for (const relativePath of copies) {
    const target = join(root, relativePath);
    await mkdir(join(target, ".."), { recursive: true });
    await cp(join(process.cwd(), relativePath), target, { recursive: true });
  }
  const cliContractPath = join(
    root,
    "repos/arashi/contracts/cli-commands.json",
  );
  const cliContract = JSON.parse(await readFile(cliContractPath, "utf8"));
  cliContract.schemaVersion = 6;
  cliContract.commands = cliContract.commands.filter(
    (command: { path: string }) => command.path !== "configure",
  );
  const create = cliContract.commands.find(
    (command: { path: string }) => command.path === "create",
  );
  create.options = create.options.filter(
    (entry: { long?: string }) => entry.long !== "--base",
  );
  await writeFile(cliContractPath, JSON.stringify(cliContract));
  const vscodePolicyPath = join(
    root,
    "repos/arashi-vscode/contracts/command-policy.json",
  );
  const vscodePolicy = JSON.parse(await readFile(vscodePolicyPath, "utf8"));
  delete vscodePolicy.cliCommands.configure;
  await writeFile(vscodePolicyPath, JSON.stringify(vscodePolicy));
  await writeFile(
    join(root, ".github/workflows/cross-repo-command-contracts.yml"),
    `jobs:
  contracts:
    steps:
      - run: pnpm --dir repos/arashi completion:generate
      - run: pnpm --dir repos/arashi completion:check
      - run: git -C repos/arashi diff --exit-code -- src/generated/completions.ts
      - run: pnpm --dir repos/arashi-docs validate:semantic-docs
      - run: node repos/arashi-skills/scripts/validate-guidance.mjs
      - run: |
          node repos/arashi-skills/scripts/create-release-archive.mjs --root repos/arashi-skills --output arashi-skill-package.tar.gz
          node repos/arashi-skills/scripts/create-release-archive.mjs --verify arashi-skill-package.tar.gz
          mkdir package-check
          tar -xzf arashi-skill-package.tar.gz -C package-check
          node repos/arashi-skills/scripts/validate-guidance.mjs --skill-root package-check/skills/arashi
`,
  );
  return root;
}

async function schemaV8Fixture(): Promise<string> {
  const root = await schemaV6Fixture();
  const copies = [
    "repos/arashi/contracts/cli-commands.json",
    "repos/arashi/schema/config.schema.json",
    "repos/arashi-docs/docs/workflows/standalone.md",
    "repos/arashi-docs/docs/workflows/json-automation.md",
    "repos/arashi-docs/scripts/check-create-base-docs.ts",
    "repos/arashi-docs/scripts/check-configure-docs.ts",
    "repos/arashi-docs/scripts/generate-agent-exports.ts",
    "repos/arashi-docs/scripts/semantic-doc-checks.json",
    "repos/arashi-docs/.github/workflows/docs-validate.yml",
    "repos/arashi-skills/contracts/create-base-branch.json",
    "repos/arashi-skills/scripts/create-base-guidance-selftest.mjs",
    "repos/arashi-skills/scripts/configure-workspace-guidance-selftest.mjs",
    "repos/arashi-skills/scripts/guidance-checkers.json",
    "repos/arashi-skills/.github/workflows/security-audit.yml",
    "repos/arashi-skills/.github/workflows/release-security-gate.yml",
    "repos/arashi-vscode/contracts/command-policy.json",
  ];
  for (const relativePath of copies) {
    const target = join(root, relativePath);
    await mkdir(join(target, ".."), { recursive: true });
    await cp(join(process.cwd(), relativePath), target, { recursive: true });
  }
  const workflowPath = join(
    root,
    ".github/workflows/cross-repo-command-contracts.yml",
  );
  await writeFile(
    workflowPath,
    `on:\n  pull_request:\n    paths:\n      - "repos/arashi/src/**"\n      - "repos/arashi/schema/**"\n      - "repos/arashi/contracts/**"\n      - "repos/arashi/.github/workflows/**"\n      - "repos/arashi-docs/docs/**"\n      - "repos/arashi-docs/scripts/**"\n      - "repos/arashi-docs/contracts/**"\n      - "repos/arashi-docs/.github/workflows/**"\n      - "repos/arashi-skills/skills/**"\n      - "repos/arashi-skills/scripts/**"\n      - "repos/arashi-skills/contracts/**"\n      - "repos/arashi-skills/.github/workflows/**"\njobs:\n  contracts:\n    steps:\n      - run: pnpm --dir repos/arashi install --frozen-lockfile\n      - run: pnpm --dir repos/arashi schema:publish\n      - run: pnpm --dir repos/arashi schema:check\n      - run: pnpm --dir repos/arashi contract:generate\n      - run: pnpm --dir repos/arashi contract:check\n      - run: pnpm --dir repos/arashi completion:generate\n      - run: pnpm --dir repos/arashi completion:check\n      - run: git -C repos/arashi diff --exit-code -- schema/config.schema.json contracts/cli-commands.json contracts/executable-distribution.json src/generated/completions.ts\n      - run: pnpm --dir repos/arashi-docs install --frozen-lockfile\n      - run: pnpm --dir repos/arashi-docs validate:tab-launch-docs\n      - run: pnpm --dir repos/arashi-docs validate:cli-option-docs\n      - run: pnpm --dir repos/arashi-docs validate:shell-completion-docs\n      - run: pnpm --dir repos/arashi-docs validate:ssh-host-alias-docs\n      - run: pnpm --dir repos/arashi-docs validate:semantic-docs\n      - run: node repos/arashi-skills/scripts/validate-guidance.mjs\n      - run: |\n          node repos/arashi-skills/scripts/create-release-archive.mjs --root repos/arashi-skills --output arashi-skill-package.tar.gz\n          node repos/arashi-skills/scripts/create-release-archive.mjs --verify arashi-skill-package.tar.gz\n          mkdir package-check\n          tar -xzf arashi-skill-package.tar.gz -C package-check\n          node repos/arashi-skills/scripts/validate-guidance.mjs --skill-root package-check/skills/arashi\n      - run: pnpm contracts:check\n`,
  );
  return root;
}

async function schemaV7Fixture(): Promise<string> {
  const root = await schemaV8Fixture();
  const schemaPath = join(root, "repos/arashi/schema/config.schema.json");
  const schema = JSON.parse(await readFile(schemaPath, "utf8"));
  schema.definitions.CreateCommandDefaults.properties.baseBranch =
    structuredClone(schema.definitions.Config.properties.baseBranch);
  await writeFile(schemaPath, JSON.stringify(schema));
  const contractPath = join(root, "repos/arashi/contracts/cli-commands.json");
  const contract = JSON.parse(await readFile(contractPath, "utf8"));
  contract.schemaVersion = 7;
  const create = contract.commands.find(
    (command: any) => command.path === "create",
  );
  create.options.find(
    (option: any) => option.long === "--base",
  ).semanticPolicy = structuredClone(createBaseSemanticPolicy);
  await writeFile(contractPath, JSON.stringify(contract));
  await writeFile(
    join(root, "repos/arashi-skills/contracts/create-base-branch.json"),
    JSON.stringify({
      schemaVersion: 7,
      command: "create",
      option: "--base",
      semanticPolicy: createBaseSemanticPolicy,
      compatibilityWorkaround: "precreate-targets-and-reuse-existing",
    }),
  );
  return root;
}

describe("cross-repository command contracts", () => {
  test("accepts coverage and reports intentional exclusions as info", async () => {
    const result = await checkContracts(await fixture());
    expect(result.ok, JSON.stringify(result.diagnostics, null, 2)).toBe(true);
    expect(result.diagnostics.map((d) => d.code)).toEqual([
      "DOCS_EXCLUDED",
      "SKILLS_EXCLUDED",
      "VSCODE_EXCLUDED",
    ]);
  });
  test("rejects a controlled linked-add materialization contract mismatch", async () => {
    const root = await fixture();
    const contractPath = join(root, "repos/arashi/contracts/cli-commands.json");
    const contract = JSON.parse(await readFile(contractPath, "utf8"));
    contract.commands.find(
      (command: { path: string }) => command.path === "add",
    ).semantics.addMaterialization.activeConfigOwnership = false;
    await writeFile(contractPath, JSON.stringify(contract));

    expect((await checkContracts(root)).diagnostics).toContainEqual(
      expect.objectContaining({
        code: "ADD_MATERIALIZATION_MISMATCH",
        source: "repos/arashi/contracts/cli-commands.json",
      }),
    );
  });
  test("rejects a controlled out-of-repository linked-add guidance mismatch", async () => {
    const root = await fixture();
    await writeFile(
      join(root, "repos/arashi-docs/docs/commands/add.md"),
      "# Add\nClone a repository.\n",
    );

    expect((await checkContracts(root)).diagnostics).toContainEqual(
      expect.objectContaining({
        category: "docs",
        code: "ADD_MATERIALIZATION_GUIDANCE_MISMATCH",
        source: "repos/arashi-docs/docs/commands/add.md",
      }),
    );
  });
  test("accepts schema v4 generic typed option policies for create and switch", async () => {
    const result = await checkContracts(await fixture());
    expect(result.diagnostics).not.toContainEqual(
      expect.objectContaining({ code: "OPTION_POLICY_MISMATCH" }),
    );
    expect(result.ok).toBe(true);
  });
  test("accepts the complete schema-v5 CLI option semantic contract", async () => {
    const result = await checkContracts(await schemaV5Fixture());
    expect(
      result.diagnostics.filter((diagnostic) =>
        [
          "CLI_OPTION_SCHEMA_INVALID",
          "CLI_ALIAS_MISMATCH",
          "CLI_ALIAS_COLLISION",
          "CLI_COMPATIBILITY_INVALID",
          "CLI_POLICY_REFERENCE_INVALID",
          "CLI_SELECTOR_POLICY_INVALID",
          "CLI_SELECTOR_POLICY_MISSING",
          "CLI_SWITCH_POLICY_INVALID",
          "CLI_UPDATE_POLICY_INVALID",
          "DOCS_CLI_OPTION_POLICY_MISMATCH",
        ].includes(diagnostic.code),
      ),
    ).toEqual([]);
    expect(result.diagnostics).not.toContainEqual(
      expect.objectContaining({
        code: "SCHEMA_VERSION_UNSUPPORTED",
        source: "repos/arashi/contracts/cli-commands.json",
      }),
    );
  });
  test("accepts schema v6 completion metadata and coordinated companion semantics", async () => {
    const result = await checkContracts(await schemaV6Fixture());
    expect(
      result.diagnostics.filter(
        (diagnostic) =>
          diagnostic.code.includes("COMPLETION") ||
          diagnostic.code === "SCHEMA_VERSION_UNSUPPORTED",
      ),
    ).toEqual([]);
    expect(result.ok, JSON.stringify(result.diagnostics, null, 2)).toBe(true);
  });
  test("accepts schema-v8 shared repository-base semantics", async () => {
    const result = await checkContracts(await schemaV8Fixture());
    expect(
      result.diagnostics.filter(
        (diagnostic) =>
          diagnostic.code.includes("CREATE_BASE") ||
          diagnostic.code === "SCHEMA_VERSION_UNSUPPORTED",
      ),
    ).toEqual([]);
    expect(result.ok, JSON.stringify(result.diagnostics, null, 2)).toBe(true);
  });

  test("normalizes the complete canonical configure policy and companion classifications", async () => {
    const result = await checkContracts(await schemaV8Fixture());
    expect(
      result.diagnostics.filter(
        (diagnostic) =>
          diagnostic.code.startsWith("CONFIGURE_") ||
          diagnostic.code.includes("CONFIGURE"),
      ),
    ).toEqual([]);
    expect(result.ok, JSON.stringify(result.diagnostics, null, 2)).toBe(true);
  });

  test.each([
    ["scopes", (policy: any) => policy.scopes.reverse()],
    ["descriptors", (policy: any) => policy.descriptors.repository.pop()],
    [
      "configured-effective-state",
      (policy: any) => policy.state.effective.reverse(),
    ],
    ["keep-edit-clear", (policy: any) => policy.actions.splice(1, 1)],
    [
      "tty-json-invocation",
      (policy: any) => (policy.invocation.json = "interactive-mutation"),
    ],
    ["strict-loading", (policy: any) => (policy.loading = "normalized-only")],
    ["semantic-no-op", (policy: any) => (policy.noOp = "confirm-then-save")],
    ["exact-preview", (policy: any) => (policy.preview.config = "summary")],
    [
      "separate-active-file-plan",
      (policy: any) => (policy.preview.activeFiles = "inline-with-config"),
    ],
    [
      "body-bearing-views",
      (policy: any) =>
        (policy.secrecy.ordinaryAndJson = "includes-inline-bodies"),
    ],
    [
      "shared-expected-byte-transaction",
      (policy: any) => (policy.transaction.expectedBytes = false),
    ],
    [
      "single-save-transaction",
      (policy: any) => (policy.transaction.configSavesAtMost = 2),
    ],
    [
      "shared-workspace-lock",
      (policy: any) => (policy.transaction.lock = "configure-only-lock"),
    ],
    [
      "native-file-safety",
      (policy: any) => (policy.transaction.nativeFiles = "overwrite-existing"),
    ],
  ])("rejects controlled configure %s drift", async (_axis, mutate) => {
    const root = await schemaV8Fixture();
    const contractPath = join(root, "repos/arashi/contracts/cli-commands.json");
    const contract = JSON.parse(await readFile(contractPath, "utf8"));
    const configure = contract.commands.find(
      (command: { path: string }) => command.path === "configure",
    );
    mutate(configure.semantics.configure);
    await writeFile(contractPath, JSON.stringify(contract));

    expect((await checkContracts(root)).diagnostics).toContainEqual(
      expect.objectContaining({
        code: "CONFIGURE_CLI_POLICY_MISMATCH",
        source: "repos/arashi/contracts/cli-commands.json",
      }),
    );
  });

  test.each([
    [
      "json support",
      (semantics: any) => (semantics.json.support = "unsupported"),
    ],
    [
      "standalone support",
      (semantics: any) => (semantics.standalone.support = "full"),
    ],
  ])("rejects controlled configure generic %s drift", async (_axis, mutate) => {
    const root = await schemaV8Fixture();
    const contractPath = join(root, "repos/arashi/contracts/cli-commands.json");
    const contract = JSON.parse(await readFile(contractPath, "utf8"));
    const configure = contract.commands.find(
      (command: { path: string }) => command.path === "configure",
    );
    mutate(configure.semantics);
    await writeFile(contractPath, JSON.stringify(contract));

    expect((await checkContracts(root)).diagnostics).toContainEqual(
      expect.objectContaining({
        code: "CONFIGURE_CLI_POLICY_MISMATCH",
        source: "repos/arashi/contracts/cli-commands.json",
      }),
    );
  });

  test("requires docs and skills coverage with a reasoned VS Code exclusion", async () => {
    const root = await schemaV8Fixture();
    const contractPath = join(root, "repos/arashi/contracts/cli-commands.json");
    const contract = JSON.parse(await readFile(contractPath, "utf8"));
    const configure = contract.commands.find(
      (command: { path: string }) => command.path === "configure",
    );
    configure.semantics.docs = { expectation: "excluded", reason: "omitted" };
    configure.semantics.skills = { expectation: "excluded", reason: "omitted" };
    configure.semantics.vscode = { expectation: "excluded", reason: "" };
    await writeFile(contractPath, JSON.stringify(contract));

    const diagnostics = (await checkContracts(root)).diagnostics;
    expect(diagnostics).toContainEqual(
      expect.objectContaining({
        code: "CONFIGURE_COMPANION_POLICY_MISMATCH",
        subject: "docs",
      }),
    );
    expect(diagnostics).toContainEqual(
      expect.objectContaining({
        code: "CONFIGURE_COMPANION_POLICY_MISMATCH",
        subject: "skills",
      }),
    );
    expect(diagnostics).toContainEqual(
      expect.objectContaining({
        code: "CONFIGURE_COMPANION_POLICY_MISMATCH",
        subject: "vscode",
      }),
    );
  });

  test.each([
    [
      "docs",
      "repos/arashi-docs/scripts/semantic-doc-checks.json",
      "check-configure-docs.ts",
      "DOCS_CONFIGURE_CHECK_UNREACHABLE",
    ],
    [
      "skills source and package",
      "repos/arashi-skills/scripts/guidance-checkers.json",
      "scripts/configure-workspace-guidance-selftest.mjs",
      "SKILLS_CONFIGURE_CHECK_UNREACHABLE",
    ],
  ])(
    "requires registered configure checker reachability for %s",
    async (_surface, manifestPath, entry, code) => {
      const root = await schemaV8Fixture();
      const absolute = join(root, manifestPath);
      const manifest = JSON.parse(await readFile(absolute, "utf8"));
      await writeFile(
        absolute,
        JSON.stringify(manifest.filter((item: string) => item !== entry)),
      );

      expect((await checkContracts(root)).diagnostics).toContainEqual(
        expect.objectContaining({ code, source: manifestPath }),
      );
    },
  );

  test("invokes the registered docs configure checker for controlled no-op drift", async () => {
    const root = await schemaV8Fixture();
    const guidancePath = join(
      root,
      "repos/arashi-docs/docs/workflows/config.md",
    );
    const guidance = await readFile(guidancePath, "utf8");
    expect(guidance).toContain("exits before final confirmation or save");
    await writeFile(
      guidancePath,
      guidance.replace(
        "exits before final confirmation or save",
        "continues to final confirmation and save",
      ),
    );

    expect(
      (await checkContractsWithFocusedAcceptance(root)).diagnostics,
    ).toContainEqual(
      expect.objectContaining({ code: "DOCS_CONFIGURE_CHECK_FAILED" }),
    );
  }, 30_000);

  test("invokes configure guidance checks in source and extracted-package flows", async () => {
    const root = await schemaV8Fixture();
    const guidancePath = join(
      root,
      "repos/arashi-skills/skills/arashi/references/commands/workspace.md",
    );
    const guidance = await readFile(guidancePath, "utf8");
    expect(guidance).toContain(
      "reports no changes before final mutation confirmation",
    );
    await writeFile(
      guidancePath,
      guidance.replace(
        "reports no changes before final mutation confirmation",
        "reports no changes after final mutation confirmation",
      ),
    );

    const diagnostics = (await checkContractsWithFocusedAcceptance(root))
      .diagnostics;
    expect(diagnostics).toContainEqual(
      expect.objectContaining({ code: "SKILLS_CONFIGURE_CHECK_FAILED" }),
    );
    expect(diagnostics).toContainEqual(
      expect.objectContaining({
        code: "SKILLS_CONFIGURE_PACKAGE_CHECK_FAILED",
      }),
    );
  }, 30_000);

  test("the configure fixture itself matches the expected canonical policy", async () => {
    const root = await schemaV8Fixture();
    const contract = JSON.parse(
      await readFile(
        join(root, "repos/arashi/contracts/cli-commands.json"),
        "utf8",
      ),
    );
    expect(
      contract.commands.find(
        (command: { path: string }) => command.path === "configure",
      ).semantics.configure,
    ).toEqual(configureContract);
  });
  test.each([
    "The deprecated `defaults.create.baseBranch` value remains create-only and does not affect clone.",
    "Set `defaults.create.baseBranch` to choose the create base.",
    "`defaults.create.baseBranch` is the workspace-wide default used by create.",
    "Although `defaults.create.baseBranch` was removed from the schema, create still accepts it.",
    "`defaults.create.baseBranch` was removed from the schema, but you can still use it.",
    "`defaults.create.baseBranch` was removed from the schema but continues to control create.",
    "The removed `defaults.create.baseBranch` controls the create base.",
    "`defaults.create.baseBranch` controls create, while editor-scoped defaults are unsupported.",
    "- `defaults.create.baseBranch` was removed.\n- `defaults.create.baseBranch` controls the create base",
  ])(
    "rejects removed create-base guidance on companion skill surfaces: %s",
    async (claim) => {
      const root = await schemaV8Fixture();
      const path = join(
        root,
        "repos/arashi-skills/skills/arashi/references/commands/workspace.md",
      );
      await writeFile(path, `${await readFile(path, "utf8")}\n${claim}\n`);

      expect((await checkContracts(root)).diagnostics).toContainEqual(
        expect.objectContaining({
          code: "REPOSITORY_BASE_GUIDANCE_MISMATCH",
          source:
            "repos/arashi-skills/skills/arashi/references/commands/workspace.md",
        }),
      );
    },
  );

  test("rejects removed create-base guidance on MDX surfaces", async () => {
    const root = await schemaV8Fixture();
    const path = join(root, "repos/arashi-docs/docs/index.mdx");
    await writeFile(
      path,
      "Set `defaults.create.baseBranch` to choose the create base.\n",
    );

    expect((await checkContracts(root)).diagnostics).toContainEqual(
      expect.objectContaining({
        code: "REPOSITORY_BASE_GUIDANCE_MISMATCH",
        source: "repos/arashi-docs/docs/index.mdx",
      }),
    );
  });

  test.each([
    "repos/arashi/README.md",
    "repos/arashi-docs/public/llms.txt",
    "repos/arashi-docs/public/llms-full.txt",
  ])(
    "rejects removed create-base guidance on generated and CLI surface %s",
    async (source) => {
      const root = await schemaV8Fixture();
      await writeFile(
        join(root, source),
        "`defaults.create.baseBranch` controls create.\n",
      );

      expect((await checkContracts(root)).diagnostics).toContainEqual(
        expect.objectContaining({
          code: "REPOSITORY_BASE_GUIDANCE_MISMATCH",
          source,
        }),
      );
    },
  );

  test("allows explicit rejection and negation of the removed create-base key", async () => {
    const root = await schemaV8Fixture();
    const path = join(
      root,
      "repos/arashi-skills/skills/arashi/references/commands/workspace.md",
    );
    await writeFile(
      path,
      `${await readFile(path, "utf8")}
\`defaults.create.baseBranch\` never applies. Do not set \`defaults.create.baseBranch\`. Replace \`defaults.create.baseBranch\` with root \`baseBranch\`; it is no longer supported.
Configuration supports root \`baseBranch\`; \`defaults.create.baseBranch\` was removed.
Configuration does not support \`defaults.create.baseBranch\`.
Support for \`defaults.create.baseBranch\` was removed.
Use of \`defaults.create.baseBranch\` is forbidden.
\`defaults.create.baseBranch\` is not supported.
Use root \`baseBranch\` instead of \`defaults.create.baseBranch\`.

## \`defaults.create.baseBranch\`

This property is unsupported; migrate to root \`baseBranch\`.
`,
    );

    expect(
      (await checkContracts(root)).diagnostics.filter(
        (diagnostic) => diagnostic.code === "REPOSITORY_BASE_GUIDANCE_MISMATCH",
      ),
    ).toEqual([]);
  });

  test.each([
    ["precedence", (policy: any) => policy.precedence.reverse()],
    ["meta selector", (policy: any) => (policy.options.metaSelector = "meta")],
    [
      "coordinated clone target",
      (policy: any) => (policy.clone.coordinated = "checkout-effective-base"),
    ],
    [
      "selected-set validation",
      (policy: any) => (policy.validation = "during-mutation"),
    ],
    ["output omission", (policy: any) => (policy.output.omitted = "never")],
    ["rollback boundary", (policy: any) => (policy.rollback = "all-targets")],
  ])("rejects schema-v8 repository-base %s drift", async (_label, mutate) => {
    const root = await schemaV8Fixture();
    const path = join(root, "repos/arashi/contracts/cli-commands.json");
    const data = JSON.parse(await readFile(path, "utf8"));
    const base = data.commands
      .find((command: any) => command.path === "create")
      .options.find((entry: any) => entry.long === "--base");
    mutate(base.semanticPolicy.repositoryBase);
    await writeFile(path, JSON.stringify(data));

    expect((await checkContracts(root)).diagnostics).toContainEqual(
      expect.objectContaining({
        code: "REPOSITORY_BASE_CLI_POLICY_MISMATCH",
        source: "repos/arashi/contracts/cli-commands.json",
      }),
    );
  });
  test.each([
    ["baseBranch", "Config"],
    ["meta.baseBranch", "MetaRepositoryConfig"],
    ["repos.<name>.baseBranch", "RepoConfig"],
  ])("rejects schema-v8 %s schema drift", async (subject, definition) => {
    const root = await schemaV8Fixture();
    const path = join(root, "repos/arashi/schema/config.schema.json");
    const data = JSON.parse(await readFile(path, "utf8"));
    data.definitions[definition].properties.baseBranch.pattern = ".+";
    await writeFile(path, JSON.stringify(data));

    expect((await checkContracts(root)).diagnostics).toContainEqual(
      expect.objectContaining({
        code: "REPOSITORY_BASE_CONFIG_SCHEMA_MISMATCH",
        source: "repos/arashi/schema/config.schema.json",
        subject,
      }),
    );
  });
  test.each([
    [
      "reintroduced removed create field",
      (schema: any) =>
        (schema.definitions.CreateCommandDefaults.properties.baseBranch = {
          minLength: 1,
          pattern: ".+",
          type: "string",
        }),
      "defaults.create.baseBranch",
    ],
    [
      "permissive create defaults",
      (schema: any) =>
        (schema.definitions.CreateCommandDefaults.additionalProperties = true),
      "defaults.create.additionalProperties",
    ],
    [
      "editor-scoped legacy field",
      (schema: any) =>
        (schema.definitions.EditorCreateCommandDefaults.properties.baseBranch =
          { type: "string" }),
      "defaults.editors.<host>.create.baseBranch",
    ],
    [
      "permissive editor create defaults",
      (schema: any) =>
        (schema.definitions.EditorCreateCommandDefaults.additionalProperties = true),
      "defaults.editors.<host>.create.additionalProperties",
    ],
    [
      "missing meta route",
      (schema: any) => delete schema.definitions.Config.properties.meta,
      "meta",
    ],
    [
      "wrong child collection route",
      (schema: any) =>
        (schema.definitions.Config.properties.repos.additionalProperties.$ref =
          "#/definitions/MetaRepositoryConfig"),
      "repos",
    ],
  ])("rejects schema-v8 %s", async (_label, mutate, subject) => {
    const root = await schemaV8Fixture();
    const path = join(root, "repos/arashi/schema/config.schema.json");
    const data = JSON.parse(await readFile(path, "utf8"));
    mutate(data);
    await writeFile(path, JSON.stringify(data));

    expect((await checkContracts(root)).diagnostics).toContainEqual(
      expect.objectContaining({
        code: "REPOSITORY_BASE_CONFIG_SCHEMA_MISMATCH",
        source: "repos/arashi/schema/config.schema.json",
        subject,
      }),
    );
  });
  test.each([
    [
      "missing policy",
      (policy: any) => delete policy.createBase,
      "create.--base.semanticPolicy.createBase",
    ],
    [
      "extra policy field",
      (policy: any) => (policy.createBase.extra = true),
      "create.--base.semanticPolicy.createBase.extra",
    ],
    [
      "wrong precedence",
      (policy: any) => policy.createBase.precedence.reverse(),
      "create.--base.semanticPolicy.createBase.precedence.0",
    ],
    [
      "wrong ref order",
      (policy: any) => policy.createBase.resolution.refs.reverse(),
      "create.--base.semanticPolicy.createBase.resolution.refs.0",
    ],
    [
      "wrong reuse ancestry",
      (policy: any) =>
        (policy.createBase.mutation.reusedTarget.ancestry = "must-descend"),
      "create.--base.semanticPolicy.createBase.mutation.reusedTarget.ancestry",
    ],
    [
      "wrong output fields",
      (policy: any) =>
        policy.createBase.output.json.failure.fields.splice(2, 1, "failures"),
      "create.--base.semanticPolicy.createBase.output.json.failure.fields.2",
    ],
    [
      "invented environment variable",
      (policy: any) =>
        (policy.createBase.environmentVariables.ARASHI_BASE_BRANCH =
          "provided"),
      "create.--base.semanticPolicy.createBase.environmentVariables.ARASHI_BASE_BRANCH",
    ],
  ])("rejects schema-v7 create-base %s", async (_label, mutate, subject) => {
    const root = await schemaV7Fixture();
    const path = join(root, "repos/arashi/contracts/cli-commands.json");
    const data = JSON.parse(await readFile(path, "utf8"));
    const base = data.commands
      .find((command: any) => command.path === "create")
      .options.find((entry: any) => entry.long === "--base");
    mutate(base.semanticPolicy);
    await writeFile(path, JSON.stringify(data));

    expect((await checkContracts(root)).diagnostics).toContainEqual(
      expect.objectContaining({
        code: "CREATE_BASE_CLI_POLICY_MISMATCH",
        source: "repos/arashi/contracts/cli-commands.json",
        subject,
      }),
    );
  });
  test("rejects create-base policy on the wrong command option", async () => {
    const root = await schemaV7Fixture();
    const path = join(root, "repos/arashi/contracts/cli-commands.json");
    const data = JSON.parse(await readFile(path, "utf8"));
    const create = data.commands.find(
      (command: any) => command.path === "create",
    );
    const base = create.options.find((entry: any) => entry.long === "--base");
    create.options.find(
      (entry: any) => entry.long === "--dry-run",
    ).semanticPolicy = structuredClone(base.semanticPolicy);
    await writeFile(path, JSON.stringify(data));

    expect((await checkContracts(root)).diagnostics).toContainEqual(
      expect.objectContaining({
        code: "CREATE_BASE_POLICY_WRONG_OWNER",
        subject: "create.--dry-run",
      }),
    );
  });
  test("rejects packaged skill create-base policy drift", async () => {
    const root = await schemaV7Fixture();
    const path = join(
      root,
      "repos/arashi-skills/contracts/create-base-branch.json",
    );
    const data = JSON.parse(await readFile(path, "utf8"));
    data.semanticPolicy.createBase.output.json.success.repositories =
      "affected-only-selected-set";
    await writeFile(path, JSON.stringify(data));

    expect((await checkContracts(root)).diagnostics).toContainEqual(
      expect.objectContaining({
        code: "CREATE_BASE_SKILLS_POLICY_MISMATCH",
        source: "repos/arashi-skills/contracts/create-base-branch.json",
        subject: "semanticPolicy.createBase.output.json.success.repositories",
      }),
    );
  });
  test.each([
    [
      "missing generic field",
      (schema: any) =>
        delete schema.definitions.CreateCommandDefaults.properties.baseBranch,
      "defaults.create.baseBranch",
    ],
    [
      "editor-scoped field",
      (schema: any) =>
        (schema.definitions.EditorCreateCommandDefaults.properties.baseBranch =
          { type: "string" }),
      "defaults.editors.<host>.create.baseBranch",
    ],
    [
      "weakened pattern",
      (schema: any) =>
        (schema.definitions.CreateCommandDefaults.properties.baseBranch.pattern =
          ".+"),
      "defaults.create.baseBranch.pattern",
    ],
  ])(
    "rejects create-base config schema %s",
    async (_label, mutate, subject) => {
      const root = await schemaV7Fixture();
      const path = join(root, "repos/arashi/schema/config.schema.json");
      const data = JSON.parse(await readFile(path, "utf8"));
      mutate(data);
      await writeFile(path, JSON.stringify(data));

      expect((await checkContracts(root)).diagnostics).toContainEqual(
        expect.objectContaining({
          code: "CREATE_BASE_CONFIG_SCHEMA_MISMATCH",
          source: "repos/arashi/schema/config.schema.json",
          subject,
        }),
      );
    },
  );
  test.each([
    [
      "docs focused checker",
      "pnpm --dir repos/arashi-docs validate:semantic-docs",
      "DOCS_CREATE_BASE_CHECK_UNREACHABLE",
    ],
    [
      "docs dependencies",
      "pnpm --dir repos/arashi-docs install --frozen-lockfile",
      "DOCS_CREATE_BASE_INSTALL_UNREACHABLE",
    ],
    [
      "skills source checker",
      "node repos/arashi-skills/scripts/validate-guidance.mjs",
      "SKILLS_CREATE_BASE_CHECK_UNREACHABLE",
    ],
    [
      "skills package checker",
      "node repos/arashi-skills/scripts/validate-guidance.mjs --skill-root package-check/skills/arashi",
      "SKILLS_CREATE_BASE_PACKAGE_CHECK_UNREACHABLE",
    ],
  ])(
    "rejects missing schema-v7 %s CI reachability",
    async (_label, command, code) => {
      const root = await schemaV7Fixture();
      const path = join(
        root,
        ".github/workflows/cross-repo-command-contracts.yml",
      );
      const workflow = await readFile(path, "utf8");
      await writeFile(path, workflow.replace(command, `# ${command}`));

      expect((await checkContracts(root)).diagnostics).toContainEqual(
        expect.objectContaining({
          code,
          source: ".github/workflows/cross-repo-command-contracts.yml",
        }),
      );
    },
  );
  test("rejects schema-v7 create-base prerequisites in a sibling CI job", async () => {
    const root = await schemaV7Fixture();
    await writeFile(
      join(root, ".github/workflows/cross-repo-command-contracts.yml"),
      `jobs:\n  prepare:\n    steps:\n      - run: pnpm --dir repos/arashi-docs install --frozen-lockfile\n  contracts:\n    steps:\n      - run: pnpm --dir repos/arashi-docs validate:semantic-docs\n      - run: node repos/arashi-skills/scripts/validate-guidance.mjs\n      - run: node repos/arashi-skills/scripts/validate-guidance.mjs --skill-root package-check/skills/arashi\n      - run: pnpm contracts:check\n`,
    );

    const codes = (await checkContracts(root)).diagnostics.map(
      (diagnostic) => diagnostic.code,
    );
    expect(codes).toContain("DOCS_CREATE_BASE_INSTALL_UNREACHABLE");
  });
  test("rejects commented and out-of-order schema-v7 CI commands", async () => {
    const root = await schemaV7Fixture();
    const path = join(
      root,
      ".github/workflows/cross-repo-command-contracts.yml",
    );
    const workflow = await readFile(path, "utf8");
    await writeFile(
      path,
      workflow
        .replace(
          "      - run: pnpm --dir repos/arashi schema:publish\n",
          "      # - run: pnpm --dir repos/arashi schema:publish\n",
        )
        .replace(
          "      - run: pnpm --dir repos/arashi-docs install --frozen-lockfile\n",
          "      - run: __CREATE_BASE_DOCS_SWAP__\n",
        )
        .replace(
          "      - run: pnpm --dir repos/arashi-docs validate:semantic-docs\n",
          "      - run: pnpm --dir repos/arashi-docs install --frozen-lockfile\n",
        )
        .replace(
          "      - run: __CREATE_BASE_DOCS_SWAP__\n",
          "      - run: pnpm --dir repos/arashi-docs validate:semantic-docs\n",
        ),
    );

    const codes = (await checkContracts(root)).diagnostics.map(
      (diagnostic) => diagnostic.code,
    );
    expect(codes).toContain("CLI_CREATE_BASE_SCHEMA_GENERATION_UNREACHABLE");
    expect(codes).toContain("DOCS_CREATE_BASE_SEQUENCE_UNREACHABLE");
  });
  test("rejects missing create-base child source, workflow, and contract trigger paths", async () => {
    const root = await schemaV7Fixture();
    const path = join(
      root,
      ".github/workflows/cross-repo-command-contracts.yml",
    );
    const workflow = await readFile(path, "utf8");
    await writeFile(
      path,
      workflow
        .replace('      - "repos/arashi/src/**"\n', "")
        .replace('      - "repos/arashi-docs/.github/workflows/**"\n', "")
        .replace('      - "repos/arashi-skills/contracts/**"\n', ""),
    );

    expect((await checkContracts(root)).diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "CREATE_BASE_TRIGGER_PATH_UNREACHABLE",
          subject: "repos/arashi/src/**",
        }),
        expect.objectContaining({
          code: "CREATE_BASE_TRIGGER_PATH_UNREACHABLE",
          subject: "repos/arashi-docs/.github/workflows/**",
        }),
        expect.objectContaining({
          code: "CREATE_BASE_TRIGGER_PATH_UNREACHABLE",
          subject: "repos/arashi-skills/contracts/**",
        }),
      ]),
    );
  });
  test.each([
    [
      "canonical docs contradiction",
      "repos/arashi-docs/docs/commands/create.md",
      (content: string) => `${content}\nConfiguration overrides CLI --base.\n`,
    ],
    [
      "generated curated export drift",
      "repos/arashi-docs/public/llms.txt",
      (content: string) =>
        content.replace(
          "Standalone create base selection is CLI-only and invocation-only",
          "Standalone create base selection reads workspace configuration",
        ),
    ],
  ])("rejects %s", async (_label, relativePath, mutate) => {
    const root = await schemaV7Fixture();
    const path = join(root, relativePath);
    await writeFile(path, mutate(await readFile(path, "utf8")));

    expect(
      (await checkContractsWithFocusedAcceptance(root)).diagnostics,
    ).toContainEqual(
      expect.objectContaining({ code: "DOCS_CREATE_BASE_CHECK_FAILED" }),
    );
  });
  test("rejects CLI contract drift from optional-user SSH alias syntax", async () => {
    const root = await schemaV6Fixture();
    const contractPath = join(root, "repos/arashi/contracts/cli-commands.json");
    const contract = JSON.parse(await readFile(contractPath, "utf8"));
    const add = contract.commands.find(
      (command: { path: string }) => command.path === "add",
    );
    add.arguments[0].description = "Git repository URL";
    await writeFile(contractPath, JSON.stringify(contract));

    expect((await checkContracts(root)).diagnostics).toContainEqual(
      expect.objectContaining({
        category: "schema",
        code: "SSH_ALIAS_CLI_CONTRACT_MISMATCH",
        source: "repos/arashi/contracts/cli-commands.json",
      }),
    );
  });
  test("rejects missing canonical and generated SSH alias guidance", async () => {
    const root = await schemaV6Fixture();
    await writeFile(
      join(root, "repos/arashi-docs/docs/commands/add.md"),
      "# add\n\nAdd a repository.\n",
    );

    expect((await checkContracts(root)).diagnostics).toContainEqual(
      expect.objectContaining({
        category: "docs",
        code: "SSH_ALIAS_GUIDANCE_MISMATCH",
        source: "repos/arashi-docs/docs/commands/add.md",
      }),
    );
  });
  test("rejects missing packaged SSH alias guidance", async () => {
    const root = await schemaV6Fixture();
    await writeFile(
      join(
        root,
        "repos/arashi-skills/skills/arashi/references/commands/workspace.md",
      ),
      "# Workspace commands\n\nRun Arashi commands.\n",
    );

    expect((await checkContracts(root)).diagnostics).toContainEqual(
      expect.objectContaining({
        category: "skills",
        code: "SSH_ALIAS_GUIDANCE_MISMATCH",
        source:
          "repos/arashi-skills/skills/arashi/references/commands/workspace.md",
      }),
    );
  });
  test("rejects repository-local insteadOf guidance for future clones", async () => {
    const root = await schemaV6Fixture();
    const guidancePath = join(
      root,
      "repos/arashi-skills/skills/arashi/references/commands/workspace.md",
    );
    const guidance = await readFile(guidancePath, "utf8");
    await writeFile(
      guidancePath,
      guidance
        .replace(
          "machine-global Git `url.<base>.insteadOf` rule",
          "local Git `url.<base>.insteadOf` rule",
        )
        .replace(
          'git config --global url."git@work-github:".insteadOf git@github.com:',
          "configure the rewrite in this repository",
        ),
    );

    expect((await checkContracts(root)).diagnostics).toContainEqual(
      expect.objectContaining({
        category: "skills",
        code: "SSH_ALIAS_GUIDANCE_MISMATCH",
        source:
          "repos/arashi-skills/skills/arashi/references/commands/workspace.md",
      }),
    );
  });
  test("requires focused SSH alias checks in coordinated CI", async () => {
    const root = await schemaV6Fixture();
    await writeFile(
      join(root, ".github/workflows/cross-repo-command-contracts.yml"),
      "jobs: {}\n",
    );

    expect((await checkContracts(root)).diagnostics).toContainEqual(
      expect.objectContaining({
        category: "docs",
        code: "SSH_ALIAS_WORKFLOW_UNWIRED",
        source: ".github/workflows/cross-repo-command-contracts.yml",
      }),
    );
  });
  test("rejects incomplete canonical completion guidance", async () => {
    const root = await schemaV6Fixture();
    await writeFile(
      join(root, "repos/arashi-docs/docs/commands/completion.md"),
      "# Completion\n\nRun `aw completion bash`.\n",
    );
    expect((await checkContracts(root)).diagnostics).toContainEqual(
      expect.objectContaining({
        code: "COMPLETION_GUIDANCE_INVALID",
        source: "repos/arashi-docs/docs/commands/completion.md",
      }),
    );
  });
  test("rejects polarity reversal in canonical completion safety guidance", async () => {
    const root = await schemaV6Fixture();
    const path = join(root, "repos/arashi-docs/docs/commands/completion.md");
    const content = await readFile(path, "utf8");
    await writeFile(
      path,
      content.replace(
        "It does not perform network requests or mutate workspace state. It does not execute hooks, does not prompt, and does not start child operations.",
        "It performs network requests and mutates workspace state. It executes hooks, prompts, and starts child operations.",
      ),
    );
    expect((await checkContracts(root)).diagnostics).toContainEqual(
      expect.objectContaining({
        code: "COMPLETION_GUIDANCE_INVALID",
        source: "repos/arashi-docs/docs/commands/completion.md",
      }),
    );
  });
  test("rejects incomplete canonical shell activation guidance", async () => {
    const root = await schemaV6Fixture();
    await writeFile(
      join(root, "repos/arashi-docs/docs/commands/shell.md"),
      "# Shell\n\nRun `aw shell install`.\n",
    );
    expect((await checkContracts(root)).diagnostics).toContainEqual(
      expect.objectContaining({
        code: "COMPLETION_GUIDANCE_INVALID",
        source: "repos/arashi-docs/docs/commands/shell.md",
      }),
    );
  });
  test.each([
    [
      "root help/version metadata",
      (data: any) => data.root.options.pop(),
      "CLI_COMPLETION_ROOT_INVALID",
      "root.--version",
    ],
    [
      "exact dynamic ownership",
      (data: any) => {
        data.commands
          .find((command: any) => command.path === "status")
          .options.find((entry: any) => entry.long === "--only").candidateKind =
          "worktree";
      },
      "CLI_COMPLETION_POLICY_INVALID",
      "status.--only",
    ],
    [
      "declared choices",
      (data: any) => {
        data.commands.find(
          (command: any) => command.path === "completion",
        ).arguments[0].choices = ["bash", "zsh"];
      },
      "CLI_COMPLETION_POLICY_INVALID",
      "completion.shell",
    ],
    [
      "declared conflicts",
      (data: any) => {
        data.commands
          .find((command: any) => command.path === "switch")
          .options.find((entry: any) => entry.long === "--tab").conflicts = [];
      },
      "CLI_COMPLETION_POLICY_INVALID",
      "switch.--tab",
    ],
    [
      "declared repeatability",
      (data: any) => {
        data.commands
          .find((command: any) => command.path === "handoff")
          .options.find((entry: any) => entry.long === "--risk").repeatable =
          false;
      },
      "CLI_COMPLETION_POLICY_INVALID",
      "handoff.--risk",
    ],
    [
      "hidden query exclusion",
      (data: any) => {
        data.commands.find(
          (command: any) => command.path === "completion __query",
        ).hidden = false;
      },
      "CLI_COMPLETION_HIDDEN_INVALID",
      "completion __query",
    ],
    [
      "completion companion policy",
      (data: any) => {
        data.commands.find(
          (command: any) => command.path === "completion",
        ).semantics.vscode.expectation = "required";
      },
      "CLI_COMPLETION_COMPANION_INVALID",
      "completion.vscode",
    ],
  ])("rejects schema-v6 %s drift", async (_label, mutate, code, subject) => {
    const root = await schemaV6Fixture();
    const path = join(root, "repos/arashi/contracts/cli-commands.json");
    const data = JSON.parse(await readFile(path, "utf8"));
    mutate(data);
    await writeFile(path, JSON.stringify(data));
    expect((await checkContracts(root)).diagnostics).toContainEqual(
      expect.objectContaining({ code, subject }),
    );
  });
  test.each([
    [
      "CLI generation",
      "pnpm --dir repos/arashi completion:generate",
      "CLI_COMPLETION_GENERATION_UNREACHABLE",
    ],
    [
      "CLI freshness",
      "pnpm --dir repos/arashi completion:check",
      "CLI_COMPLETION_FRESHNESS_UNREACHABLE",
    ],
    [
      "generated artifact diff",
      "git -C repos/arashi diff --exit-code -- src/generated/completions.ts",
      "CLI_COMPLETION_FRESHNESS_UNREACHABLE",
    ],
    [
      "focused docs",
      "pnpm --dir repos/arashi-docs validate:semantic-docs",
      "DOCS_COMPLETION_CHECK_UNREACHABLE",
    ],
    [
      "focused skills source",
      "node repos/arashi-skills/scripts/validate-guidance.mjs",
      "SKILLS_COMPLETION_CHECK_UNREACHABLE",
    ],
    [
      "focused skills package",
      "node repos/arashi-skills/scripts/validate-guidance.mjs --skill-root package-check/skills/arashi",
      "SKILLS_COMPLETION_PACKAGE_CHECK_UNREACHABLE",
    ],
  ])("rejects missing %s CI reachability", async (_label, command, code) => {
    const root = await schemaV6Fixture();
    const path = join(
      root,
      ".github/workflows/cross-repo-command-contracts.yml",
    );
    await writeFile(
      path,
      (await readFile(path, "utf8")).replace(`${command}\n`, ""),
    );
    expect((await checkContracts(root)).diagnostics).toContainEqual(
      expect.objectContaining({
        code,
        source: ".github/workflows/cross-repo-command-contracts.yml",
      }),
    );
  });
  test.each([
    [
      "docs",
      "repos/arashi-docs/scripts/check-shell-completion-docs.ts",
      "DOCS_COMPLETION_CHECK_FAILED",
      "process.exit(7);\n",
    ],
    [
      "skills source",
      "repos/arashi-skills/scripts/shell-completion-guidance-selftest.mjs",
      "SKILLS_COMPLETION_CHECK_FAILED",
      "if (!process.argv.includes('--skill-root')) process.exit(7);\n",
    ],
    [
      "skills extracted package",
      "repos/arashi-skills/scripts/shell-completion-guidance-selftest.mjs",
      "SKILLS_COMPLETION_PACKAGE_CHECK_FAILED",
      "if (process.argv.includes('--skill-root')) process.exit(7);\n",
    ],
  ])(
    "runs the focused %s completion checker",
    async (_label, relativePath, code, source) => {
      const root = await schemaV6Fixture();
      await writeFile(join(root, relativePath), source);
      expect(
        (await checkContractsWithFocusedAcceptance(root)).diagnostics,
      ).toContainEqual(expect.objectContaining({ code }));
    },
  );
  test("ordinary mutation fixtures do not execute focused checker subprocesses", async () => {
    const root = await fixture();
    await writeFile(
      join(root, "repos/arashi-docs/scripts/check-tab-launch-docs.ts"),
      "process.exit(9);\n",
    );

    expect((await checkContracts(root)).diagnostics).not.toContainEqual(
      expect.objectContaining({ code: "DOCS_OPTION_POLICY_CHECK_FAILED" }),
    );
  });
  test("rejects a string-valued schema version instead of bypassing schema-v5 checks", async () => {
    const root = await schemaV5Fixture();
    const path = join(root, "repos/arashi/contracts/cli-commands.json");
    const data = JSON.parse(await readFile(path, "utf8"));
    data.schemaVersion = "5";
    await writeFile(path, JSON.stringify(data));

    expect((await checkContracts(root)).diagnostics).toContainEqual(
      expect.objectContaining({
        code: "SCHEMA_VERSION_UNSUPPORTED",
        source: "repos/arashi/contracts/cli-commands.json",
      }),
    );
  });
  test.each([
    ["status selector", "status", "--only"],
    ["canonical switch option", "switch", "--ignore-configured-launcher"],
  ])("rejects a missing schema-v5 %s", async (_label, commandName, long) => {
    const root = await schemaV5Fixture();
    const path = join(root, "repos/arashi/contracts/cli-commands.json");
    const data = JSON.parse(await readFile(path, "utf8"));
    const command = data.commands.find(
      (entry: any) => entry.path === commandName,
    );
    command.options = command.options.filter(
      (option: any) => option.long !== long,
    );
    await writeFile(path, JSON.stringify(data));

    expect((await checkContracts(root)).diagnostics).toContainEqual(
      expect.objectContaining({
        code: "CLI_OPTION_SURFACE_MISMATCH",
        subject: `${commandName}.${long}`,
      }),
    );
  });
  test("rejects a missing audited zero-option command", async () => {
    const root = await schemaV5Fixture();
    const path = join(root, "repos/arashi/contracts/cli-commands.json");
    const data = JSON.parse(await readFile(path, "utf8"));
    data.commands = data.commands.filter(
      (entry: any) => entry.path !== "shell install",
    );
    await writeFile(path, JSON.stringify(data));

    expect((await checkContracts(root)).diagnostics).toContainEqual(
      expect.objectContaining({
        code: "CLI_OPTION_SURFACE_MISMATCH",
        subject: "shell install",
      }),
    );
  });
  test.each([
    [
      "unknown command",
      (data: any) => data.commands.push({ options: [], path: "future" }),
      "future",
    ],
    [
      "unknown option",
      (data: any) =>
        data.commands
          .find((entry: any) => entry.path === "status")
          .options.push({
            deprecated: false,
            description: "Future option",
            flags: "--future",
            hidden: false,
            long: "--future",
            optional: false,
            required: false,
            semanticPolicyOwner: "structural",
            short: null,
            valueShape: "boolean",
            variadic: false,
          }),
      "status.--future",
    ],
  ])("rejects an %s", async (_label, mutate, subject) => {
    const root = await schemaV5Fixture();
    const path = join(root, "repos/arashi/contracts/cli-commands.json");
    const data = JSON.parse(await readFile(path, "utf8"));
    mutate(data);
    await writeFile(path, JSON.stringify(data));

    expect((await checkContracts(root)).diagnostics).toContainEqual(
      expect.objectContaining({ code: "CLI_OPTION_SURFACE_MISMATCH", subject }),
    );
  });
  test("rejects malformed schema-v5 option array entries", async () => {
    const root = await schemaV5Fixture();
    const path = join(root, "repos/arashi/contracts/cli-commands.json");
    const data = JSON.parse(await readFile(path, "utf8"));
    data.commands
      .find((entry: any) => entry.path === "status")
      .options.push(null);
    await writeFile(path, JSON.stringify(data));

    expect((await checkContracts(root)).diagnostics).toContainEqual(
      expect.objectContaining({
        code: "CLI_OPTION_SCHEMA_INVALID",
        subject: "status.options[5]",
      }),
    );
  });
  test("rejects an unapproved specialized short alias", async () => {
    const root = await schemaV5Fixture();
    const path = join(root, "repos/arashi/contracts/cli-commands.json");
    const data = JSON.parse(await readFile(path, "utf8"));
    const check = data.commands
      .find((entry: any) => entry.path === "update")
      .options.find((option: any) => option.long === "--check");
    check.short = "-x";
    check.flags = "-x, --check";
    await writeFile(path, JSON.stringify(data));

    expect((await checkContracts(root)).diagnostics).toContainEqual(
      expect.objectContaining({
        code: "CLI_ALIAS_UNAPPROVED",
        subject: "update.--check",
      }),
    );
  });
  test("rejects inconsistent option flags, long name, and short alias", async () => {
    const root = await schemaV5Fixture();
    const path = join(root, "repos/arashi/contracts/cli-commands.json");
    const data = JSON.parse(await readFile(path, "utf8"));
    data.commands
      .find((entry: any) => entry.path === "status")
      .options.find((option: any) => option.long === "--json").flags = "--json";
    await writeFile(path, JSON.stringify(data));

    expect((await checkContracts(root)).diagnostics).toContainEqual(
      expect.objectContaining({
        code: "CLI_OPTION_SCHEMA_INVALID",
        subject: "status.--json",
      }),
    );
  });
  test.each(["hidden", "deprecated"])(
    "rejects a canonical compatibility option that is %s",
    async (field) => {
      const root = await schemaV5Fixture();
      const path = join(root, "repos/arashi/contracts/cli-commands.json");
      const data = JSON.parse(await readFile(path, "utf8"));
      data.commands
        .find((entry: any) => entry.path === "switch")
        .options.find((option: any) => option.long === "--launch")[field] =
        true;
      await writeFile(path, JSON.stringify(data));

      expect((await checkContracts(root)).diagnostics).toContainEqual(
        expect.objectContaining({
          code: "CLI_COMPATIBILITY_INVALID",
          subject: "switch.--launch",
        }),
      );
    },
  );
  test.each([
    ["missing", "create", "--json", null],
    ["stale", "create", "--json", "-x"],
    ["command-local add name exception", "add", "--name", "-o"],
    ["long-only exec jobs exception", "exec", "--jobs", "-j"],
  ])(
    "rejects %s alias policy drift",
    async (_label, commandName, long, short) => {
      const root = await schemaV5Fixture();
      const path = join(root, "repos/arashi/contracts/cli-commands.json");
      const data = JSON.parse(await readFile(path, "utf8"));
      const option = data.commands
        .find((command: { path: string }) => command.path === commandName)
        .options.find((entry: { long: string }) => entry.long === long);
      option.short = short;
      option.flags = option.flags.replace(/^-\w,\s*/, "");
      if (short) option.flags = `${short}, ${option.flags}`;
      await writeFile(path, JSON.stringify(data));

      expect((await checkContracts(root)).diagnostics).toContainEqual(
        expect.objectContaining({
          code: "CLI_ALIAS_MISMATCH",
          subject: `${commandName}.${long}`,
        }),
      );
    },
  );
  test("rejects a command-local short alias collision", async () => {
    const root = await schemaV5Fixture();
    const path = join(root, "repos/arashi/contracts/cli-commands.json");
    const data = JSON.parse(await readFile(path, "utf8"));
    const create = data.commands.find(
      (command: { path: string }) => command.path === "create",
    );
    const json = create.options.find(
      (entry: { long: string }) => entry.long === "--json",
    );
    json.short = "-n";
    json.flags = "-n, --json";
    await writeFile(path, JSON.stringify(data));

    expect((await checkContracts(root)).diagnostics).toContainEqual(
      expect.objectContaining({
        code: "CLI_ALIAS_COLLISION",
        subject: "create.-n",
      }),
    );
  });
  test.each([
    [
      "compatibility mapping",
      (data: any) =>
        (data.commands
          .find((command: any) => command.path === "switch")
          .options.find(
            (entry: any) => entry.long === "--launch",
          ).semanticPolicy.compatibility.alternatives = ["--invented"]),
      "CLI_COMPATIBILITY_INVALID",
      "switch.--launch",
    ],
    [
      "deprecation visibility",
      (data: any) =>
        (data.commands
          .find((command: any) => command.path === "switch")
          .options.find((entry: any) => entry.long === "--no-cd").hidden =
          false),
      "CLI_COMPATIBILITY_INVALID",
      "switch.--launch",
    ],
    [
      "removal boundary",
      (data: any) =>
        (data.commands
          .find((command: any) => command.path === "handoff")
          .options.find(
            (entry: any) => entry.long === "--markdown",
          ).semanticPolicy.compatibility.removal.earliestMajor = 1),
      "CLI_COMPATIBILITY_INVALID",
      "handoff.--markdown",
    ],
    [
      "stale conflict reference",
      (data: any) =>
        data.commands
          .find((command: any) => command.path === "switch")
          .options.find((entry: any) => entry.long === "--launch")
          .semanticPolicy.conflicts.push("--invented"),
      "CLI_POLICY_REFERENCE_INVALID",
      "switch.--launch",
    ],
    [
      "wrong policy owner",
      (data: any) =>
        (data.commands
          .find((command: any) => command.path === "switch")
          .options.find(
            (entry: any) => entry.long === "--launch",
          ).semanticPolicy.ownership = "structural"),
      "CLI_OPTION_SCHEMA_INVALID",
      "switch.--launch",
    ],
  ])("rejects schema-v5 %s drift", async (_label, mutate, code, subject) => {
    const root = await schemaV5Fixture();
    const path = join(root, "repos/arashi/contracts/cli-commands.json");
    const data = JSON.parse(await readFile(path, "utf8"));
    mutate(data);
    await writeFile(path, JSON.stringify(data));

    expect((await checkContracts(root)).diagnostics).toContainEqual(
      expect.objectContaining({ code, subject }),
    );
  });
  test.each([
    [
      "malformed selector literal",
      (option: any) => (option.semanticPolicy.selector.flatten = "sorted"),
      "CLI_SELECTOR_POLICY_INVALID",
    ],
    [
      "wrong selector owner",
      (option: any) => (option.semanticPolicyOwner = "structural"),
      "CLI_OPTION_SCHEMA_INVALID",
    ],
    [
      "missing selector policy",
      (option: any) => delete option.semanticPolicy,
      "CLI_SELECTOR_POLICY_MISSING",
    ],
  ])("rejects %s", async (_label, mutate, code) => {
    const root = await schemaV5Fixture();
    const path = join(root, "repos/arashi/contracts/cli-commands.json");
    const data = JSON.parse(await readFile(path, "utf8"));
    const option = data.commands
      .find((command: any) => command.path === "status")
      .options.find((entry: any) => entry.long === "--only");
    mutate(option);
    await writeFile(path, JSON.stringify(data));

    expect((await checkContracts(root)).diagnostics).toContainEqual(
      expect.objectContaining({ code, subject: "status.--only" }),
    );
  });
  test("rejects asymmetric update inspection conflicts", async () => {
    const root = await schemaV5Fixture();
    const path = join(root, "repos/arashi/contracts/cli-commands.json");
    const data = JSON.parse(await readFile(path, "utf8"));
    data.commands
      .find((command: any) => command.path === "update")
      .options.find(
        (entry: any) => entry.long === "--dry-run",
      ).semanticPolicy.conflicts = [];
    await writeFile(path, JSON.stringify(data));

    expect((await checkContracts(root)).diagnostics).toContainEqual(
      expect.objectContaining({
        code: "CLI_UPDATE_POLICY_INVALID",
        subject: "update.--dry-run",
      }),
    );
  });
  test("rejects update JSON execution drift", async () => {
    const root = await schemaV5Fixture();
    const path = join(root, "repos/arashi/contracts/cli-commands.json");
    const data = JSON.parse(await readFile(path, "utf8"));
    data.commands
      .find((command: any) => command.path === "update")
      .options.find(
        (entry: any) => entry.long === "--json",
      ).semanticPolicy.jsonExecution.prompt = true;
    await writeFile(path, JSON.stringify(data));

    expect((await checkContracts(root)).diagnostics).toContainEqual(
      expect.objectContaining({
        code: "CLI_UPDATE_POLICY_INVALID",
        subject: "update.--json",
      }),
    );
  });
  test("rejects normalized docs record drift instead of loose token parity", async () => {
    const root = await schemaV5Fixture();
    const path = join(root, "repos/arashi-docs/contracts/cli-options.json");
    const data = JSON.parse(await readFile(path, "utf8"));
    data.switch.ignoreConfiguredLauncher.preserveBehaviorModes = [
      "auto",
      "launch",
    ];
    await writeFile(path, JSON.stringify(data));

    expect((await checkContracts(root)).diagnostics).toContainEqual(
      expect.objectContaining({
        code: "DOCS_CLI_OPTION_POLICY_MISMATCH",
        subject: "switch.ignoreConfiguredLauncher.preserveBehaviorModes",
      }),
    );
  });
  test("accepts an arbitrary typed policy when its command option and skills coverage exist", async () => {
    const root = await fixture();
    const contractPath = join(root, "repos/arashi/contracts/cli-commands.json");
    const contract = JSON.parse(await readFile(contractPath, "utf8"));
    const create = contract.commands.find(
      (command: { path: string }) => command.path === "create",
    );
    create.options.push(option("--future-mode"));
    create.semantics.optionPolicies["--future-mode"] = {
      compatibleOptions: [],
      conflicts: [],
      implies: ["launch"],
      json: {
        guardPrecedence: "before-option-validation",
        mode: "interactive-or-launch",
        unsupported: true,
      },
      persisted: false,
    };
    await writeFile(contractPath, JSON.stringify(contract));
    const coveragePath = join(
      root,
      "repos/arashi-skills/contracts/command-coverage.json",
    );
    const coverage = JSON.parse(await readFile(coveragePath, "utf8"));
    coverage.commands
      .find((command: { name: string }) => command.name === "create")
      .requiredOptions.push("--future-mode");
    await writeFile(coveragePath, JSON.stringify(coverage));

    expect((await checkContracts(root)).ok).toBe(true);
  });
  test("rejects an option policy whose key is not an option on that exact command", async () => {
    const root = await fixture();
    const contractPath = join(root, "repos/arashi/contracts/cli-commands.json");
    const contract = JSON.parse(await readFile(contractPath, "utf8"));
    contract.commands
      .find((command: { path: string }) => command.path === "switch")
      .options.push(option("--future-mode"));
    contract.commands.find(
      (command: { path: string }) => command.path === "create",
    ).semantics.optionPolicies["--future-mode"] = {
      compatibleOptions: [],
      conflicts: [],
      implies: [],
      json: {
        guardPrecedence: "before-option-validation",
        mode: "interactive-or-launch",
        unsupported: true,
      },
      persisted: false,
    };
    await writeFile(contractPath, JSON.stringify(contract));

    expect((await checkContracts(root)).diagnostics).toContainEqual(
      expect.objectContaining({
        code: "OPTION_POLICY_OPTION_MISSING",
        subject: "create.--future-mode",
      }),
    );
  });
  test("requires skills coverage for every generic option policy", async () => {
    const root = await fixture();
    const contractPath = join(root, "repos/arashi/contracts/cli-commands.json");
    const contract = JSON.parse(await readFile(contractPath, "utf8"));
    const create = contract.commands.find(
      (command: { path: string }) => command.path === "create",
    );
    create.options.push(option("--future-mode"));
    create.semantics.optionPolicies["--future-mode"] = {
      compatibleOptions: [],
      conflicts: [],
      implies: [],
      json: {
        guardPrecedence: "before-option-validation",
        mode: "interactive-or-launch",
        unsupported: true,
      },
      persisted: false,
    };
    await writeFile(contractPath, JSON.stringify(contract));

    expect((await checkContracts(root)).diagnostics).toContainEqual(
      expect.objectContaining({
        code: "SKILLS_OPTION_POLICY_MISMATCH",
        subject: "create.--future-mode",
      }),
    );
  });
  test("rejects an excluded skills command whose option policy is absent from requiredOptions", async () => {
    const root = await fixture();
    const contractPath = join(root, "repos/arashi/contracts/cli-commands.json");
    const contract = JSON.parse(await readFile(contractPath, "utf8"));
    const old = contract.commands.find(
      (command: { path: string }) => command.path === "old",
    );
    old.options.push(option("--future-mode"));
    old.semantics.optionPolicies = {
      "--future-mode": {
        compatibleOptions: [],
        conflicts: [],
        implies: [],
        json: {
          guardPrecedence: "before-option-validation",
          mode: "interactive",
          unsupported: true,
        },
        persisted: false,
      },
    };
    await writeFile(contractPath, JSON.stringify(contract));

    expect((await checkContracts(root)).diagnostics).toContainEqual(
      expect.objectContaining({
        code: "SKILLS_OPTION_POLICY_MISMATCH",
        subject: "old.--future-mode",
      }),
    );
  });
  test("accepts an excluded skills command whose option policy is represented in requiredOptions", async () => {
    const root = await fixture();
    const contractPath = join(root, "repos/arashi/contracts/cli-commands.json");
    const contract = JSON.parse(await readFile(contractPath, "utf8"));
    const old = contract.commands.find(
      (command: { path: string }) => command.path === "old",
    );
    old.options.push(option("--future-mode"));
    old.semantics.optionPolicies = {
      "--future-mode": {
        compatibleOptions: [],
        conflicts: [],
        implies: [],
        json: {
          guardPrecedence: "before-option-validation",
          mode: "interactive",
          unsupported: true,
        },
        persisted: false,
      },
    };
    await writeFile(contractPath, JSON.stringify(contract));

    const coveragePath = join(
      root,
      "repos/arashi-skills/contracts/command-coverage.json",
    );
    const coverage = JSON.parse(await readFile(coveragePath, "utf8"));
    coverage.commands.find(
      (command: { name: string }) => command.name === "old",
    ).requiredOptions = ["--future-mode"];
    await writeFile(coveragePath, JSON.stringify(coverage));

    expect((await checkContracts(root)).ok).toBe(true);
  });
  test.each([
    [
      "extra top-level field",
      (policy: Record<string, unknown>) => (policy.extra = true),
    ],
    [
      "extra nested field",
      (policy: Record<string, unknown>) =>
        ((policy.json as Record<string, unknown>).extra = true),
    ],
    [
      "overlapping launcher classification",
      (policy: Record<string, unknown>) =>
        ((policy.launcherSupport as Record<string, unknown>).unsupported = [
          "tmux",
        ]),
    ],
    [
      "persisted option policy",
      (policy: Record<string, unknown>) => (policy.persisted = true),
    ],
    [
      "JSON-supported option policy",
      (policy: Record<string, unknown>) =>
        ((policy.json as Record<string, unknown>).unsupported = false),
    ],
    [
      "unsupported dry-run policy",
      (policy: Record<string, unknown>) =>
        ((policy.dryRun as Record<string, unknown>).supported = false),
    ],
    [
      "launcher policy that permits fallback",
      (policy: Record<string, unknown>) =>
        ((policy.launcherSupport as Record<string, unknown>).noFallback =
          false),
    ],
  ])("rejects generic policy malformed shape: %s", async (_label, mutate) => {
    const root = await fixture();
    const contractPath = join(root, "repos/arashi/contracts/cli-commands.json");
    const contract = JSON.parse(await readFile(contractPath, "utf8"));
    mutate(
      contract.commands.find(
        (command: { path: string }) => command.path === "create",
      ).semantics.optionPolicies["--tab"],
    );
    await writeFile(contractPath, JSON.stringify(contract));

    expect((await checkContracts(root)).diagnostics).toContainEqual(
      expect.objectContaining({
        code: "SCHEMA_INVALID",
        subject: "create.--tab",
      }),
    );
  });
  test("rejects the previous command contract schema without applying schema 4 rules", async () => {
    const root = await fixture();
    const path = join(root, "repos/arashi/contracts/cli-commands.json");
    const data = JSON.parse(await readFile(path, "utf8"));
    data.schemaVersion = 3;
    data.cliVersion = "1.20.1";
    await writeFile(path, JSON.stringify(data));

    const diagnostics = (await checkContracts(root)).diagnostics;
    expect(diagnostics).toContainEqual(
      expect.objectContaining({
        code: "SCHEMA_VERSION_UNSUPPORTED",
        source: "repos/arashi/contracts/cli-commands.json",
        subject: "3",
      }),
    );
    expect(diagnostics).not.toContainEqual(
      expect.objectContaining({
        code: "SCHEMA_INVALID",
        subject: "cliVersion",
      }),
    );
  });
  test("rejects package release metadata in schema version 4", async () => {
    const root = await fixture();
    const path = join(root, "repos/arashi/contracts/cli-commands.json");
    const data = JSON.parse(await readFile(path, "utf8"));
    data.cliVersion = "1.20.1";
    await writeFile(path, JSON.stringify(data));

    expect((await checkContracts(root)).diagnostics).toContainEqual(
      expect.objectContaining({
        code: "SCHEMA_INVALID",
        source: "repos/arashi/contracts/cli-commands.json",
        subject: "cliVersion",
      }),
    );
  });
  test.each([
    [
      "semantic drift",
      (policy: Record<string, unknown>) => (policy.overrides = []),
    ],
    [
      "missing policy",
      (_policy: Record<string, unknown>, policies: Record<string, unknown>) =>
        delete policies["--tab"],
    ],
  ])("rejects create --tab %s", async (_label, mutate) => {
    const root = await fixture();
    const path = join(root, "repos/arashi/contracts/cli-commands.json");
    const data = JSON.parse(await readFile(path, "utf8"));
    const policies = data.commands.find(
      (command: { path: string }) => command.path === "create",
    ).semantics.optionPolicies;
    mutate(policies["--tab"], policies);
    await writeFile(path, JSON.stringify(data));

    expect((await checkContracts(root)).diagnostics).toContainEqual(
      expect.objectContaining({
        code: "OPTION_POLICY_MISMATCH",
        source: "repos/arashi/contracts/cli-commands.json",
        subject: "create.--tab",
      }),
    );
  });
  test("rejects missing --tab skills coverage generically", async () => {
    const root = await fixture();
    const path = join(
      root,
      "repos/arashi-skills/contracts/command-coverage.json",
    );
    const data = JSON.parse(await readFile(path, "utf8"));
    data.commands.find(
      (command: { name: string }) => command.name === "switch",
    ).requiredOptions = ["--tmux"];
    await writeFile(path, JSON.stringify(data));

    expect((await checkContracts(root)).diagnostics).toContainEqual(
      expect.objectContaining({
        category: "skills",
        code: "SKILLS_OPTION_POLICY_MISMATCH",
        subject: "switch.--tab",
      }),
    );
  });
  test.each([
    [
      "docs",
      "pnpm --dir repos/arashi-docs validate:semantic-docs",
      "DOCS_OPTION_POLICY_CHECK_UNREACHABLE",
    ],
    [
      "skills",
      "node repos/arashi-skills/scripts/validate-guidance.mjs",
      "SKILLS_OPTION_POLICY_CHECK_UNREACHABLE",
    ],
  ])(
    "rejects missing %s focused option-policy CI coverage",
    async (_label, command, code) => {
      const root = await fixture();
      const path = join(
        root,
        ".github/workflows/cross-repo-command-contracts.yml",
      );
      const workflow = await readFile(path, "utf8");
      await writeFile(path, workflow.replace(`run: ${command}\n`, ""));

      expect((await checkContracts(root)).diagnostics).toContainEqual(
        expect.objectContaining({
          code,
          source: ".github/workflows/cross-repo-command-contracts.yml",
        }),
      );
    },
  );
  test.each([
    [
      "comment-only text",
      "# run: pnpm --dir repos/arashi-docs validate:semantic-docs\n# run: node repos/arashi-skills/scripts/validate-guidance.mjs\n",
    ],
    [
      "non-run step fields",
      'jobs:\n  contracts:\n    steps:\n      - name: "run: pnpm --dir repos/arashi-docs validate:semantic-docs"\n        env:\n          NOTE: "run: node repos/arashi-skills/scripts/validate-guidance.mjs"\n        uses: actions/checkout@v4\n',
    ],
    [
      "uses step with with.run",
      "jobs:\n  contracts:\n    steps:\n      - uses: actions/checkout@v4\n        with:\n          run: pnpm --dir repos/arashi-docs validate:semantic-docs\n      - uses: actions/checkout@v4\n        with:\n          run: node repos/arashi-skills/scripts/validate-guidance.mjs\n",
    ],
    [
      "uses step with env.run",
      "jobs:\n  contracts:\n    steps:\n      - uses: actions/checkout@v4\n        env:\n          run: pnpm --dir repos/arashi-docs validate:semantic-docs\n      - uses: actions/checkout@v4\n        env:\n          run: node repos/arashi-skills/scripts/validate-guidance.mjs\n",
    ],
    [
      "nested arbitrary run objects",
      "jobs:\n  contracts:\n    steps:\n      - name: docs\n        metadata:\n          run: pnpm --dir repos/arashi-docs validate:semantic-docs\n      - name: skills\n        metadata:\n          run: node repos/arashi-skills/scripts/validate-guidance.mjs\n",
    ],
  ])("rejects focused checker reachability in %s", async (_label, workflow) => {
    const root = await fixture();
    await writeFile(
      join(root, ".github/workflows/cross-repo-command-contracts.yml"),
      workflow,
    );

    const codes = (await checkContracts(root)).diagnostics.map(
      (diagnostic) => diagnostic.code,
    );
    expect(codes).toContain("DOCS_OPTION_POLICY_CHECK_UNREACHABLE");
    expect(codes).toContain("SKILLS_OPTION_POLICY_CHECK_UNREACHABLE");
  });
  test.each([
    [
      "docs configured-launcher override drift",
      "repos/arashi-docs/docs/workflows/launch-disposition.md",
      (content: string) =>
        content.replace(
          "bypasses configured launcher defaults",
          "retains configured launcher defaults",
        ),
      "DOCS_TAB_POLICY_MISMATCH",
    ],
    [
      "docs create configured-launcher override drift",
      "repos/arashi-docs/docs/workflows/launch-disposition.md",
      (content: string) =>
        content.replace(
          "For create, create tab implies launch and switch, wins over `--no-launch` and `--no-switch`, and bypasses configured launcher defaults.",
          "For create, create tab implies launch and switch and retains configured launcher defaults.",
        ),
      "DOCS_TAB_POLICY_MISMATCH",
    ],
    [
      "docs Terminal.app capability drift",
      "repos/arashi-docs/docs/workflows/launch-disposition.md",
      (content: string) =>
        content.replace(
          "| Terminal.app | New window | Unsupported | No supported true-tab automation |",
          "| Terminal.app | New window | True tab | Current application/window |",
        ),
      "DOCS_TAB_POLICY_MISMATCH",
    ],
    [
      "docs Terminal.app guidance drift",
      "repos/arashi-docs/docs/workflows/launch-disposition.md",
      (content: string) =>
        content.replace("press Command-T manually", "create a tab somehow"),
      "DOCS_TAB_POLICY_MISMATCH",
    ],
    [
      "docs invalid Terminal.app path-substitution guidance",
      "repos/arashi-docs/docs/workflows/launch-disposition.md",
      (content: string) =>
        `${content}\nWithout shell integration, run \`cd "$(aw switch --no-cd --no-default-launch)"\`.\n`,
      "DOCS_TAB_POLICY_MISMATCH",
    ],
    [
      "docs default disposition drift",
      "repos/arashi-docs/docs/workflows/launch-disposition.md",
      (content: string) =>
        content.replace(
          "| Windows Terminal | New window | True tab |",
          "| Windows Terminal | Reused current window | True tab |",
        ),
      "DOCS_TAB_POLICY_MISMATCH",
    ],
    [
      "docs missing old Ghostty row",
      "repos/arashi-docs/docs/workflows/launch-disposition.md",
      (content: string) =>
        content.replace(
          "| macOS Ghostty older than 1.3 or missing supported-version evidence | New window | Unsupported | No supported tab API |\n",
          "",
        ),
      "DOCS_TAB_POLICY_MISMATCH",
    ],
    [
      "docs launcher mapping",
      "repos/arashi-docs/docs/workflows/launch-disposition.md",
      (content: string) =>
        content.replace(
          "| WezTerm | New window | True tab |",
          "| WezTerm | New window | Unsupported |",
        ),
      "DOCS_TAB_POLICY_MISMATCH",
    ],
    [
      "docs unknown launcher row",
      "repos/arashi-docs/docs/workflows/launch-disposition.md",
      (content: string) =>
        content.replace(
          "| generic fallback | New terminal/platform window | Unsupported | No portable exact tab target |",
          "| Surprise Terminal | New window | True tab | Exact surprise target |\n| generic fallback | New terminal/platform window | Unsupported | No portable exact tab target |",
        ),
      "DOCS_TAB_POLICY_MISMATCH",
    ],
    [
      "docs JSON guard mode",
      "repos/arashi-docs/docs/workflows/launch-disposition.md",
      (content: string) => content.replace("`launch` mode", "`cd` mode"),
      "DOCS_TAB_POLICY_MISMATCH",
    ],
    [
      "docs no-fallback guarantee",
      "repos/arashi-docs/docs/workflows/launch-disposition.md",
      (content: string) =>
        content.replace(
          "never opens a window or falls through to another launcher",
          "may fall back to a window",
        ),
      "DOCS_TAB_POLICY_MISMATCH",
    ],
  ])(
    "rejects contradictory companion semantics: %s",
    async (_label, relativePath, mutate, code) => {
      const root = await fixture();
      const path = join(root, relativePath);
      await writeFile(path, mutate(await readFile(path, "utf8")));

      expect((await checkContracts(root)).diagnostics).toContainEqual(
        expect.objectContaining({ code }),
      );
    },
  );
  test.each([
    [
      "docs",
      "repos/arashi-docs/scripts/check-tab-launch-docs.ts",
      "DOCS_OPTION_POLICY_CHECK_FAILED",
    ],
    [
      "skills",
      "repos/arashi-skills/scripts/tab-launch-disposition-guidance-selftest.mjs",
      "SKILLS_OPTION_POLICY_CHECK_FAILED",
    ],
  ])(
    "rejects an empty %s focused checker stub",
    async (_label, relativePath, code) => {
      const root = await fixture();
      await writeFile(join(root, relativePath), "// empty fixture stub\n");

      expect((await checkContracts(root)).diagnostics).toContainEqual(
        expect.objectContaining({ code }),
      );
    },
  );
  test("finds missing docs page and index entry", async () => {
    const root = await fixture();
    await rm(join(root, "repos/arashi-docs/docs/commands/add.md"));
    await writeFile(
      join(root, "repos/arashi-docs/docs/commands/index.md"),
      "# Commands\n",
    );
    const codes = (await checkContracts(root)).diagnostics.map((d) => d.code);
    for (const code of ["DOCS_INDEX_MISSING", "DOCS_PAGE_MISSING"])
      expect(codes).toContain(code);
  });
  test("finds stale structured and constrained prose skills references", async () => {
    const root = await fixture();
    const path = join(
      root,
      "repos/arashi-skills/contracts/command-coverage.json",
    );
    const data = JSON.parse(await readFile(path, "utf8"));
    data.commands.push({
      name: "gone",
      status: "covered",
      reference: "references/commands.md",
    });
    await writeFile(path, JSON.stringify(data));
    await writeFile(
      join(root, "repos/arashi-skills/skills/arashi/references/commands.md"),
      "Use `arashi vanished --json`.\n",
    );
    const codes = (await checkContracts(root)).diagnostics.map((d) => d.code);
    for (const code of ["SKILLS_STALE_COVERAGE", "SKILLS_STALE_REFERENCE"])
      expect(codes).toContain(code);
  });
  test("rejects normalized standalone classification drift", async () => {
    const root = await fixture();
    const path = join(root, "repos/arashi/contracts/cli-commands.json");
    const data = JSON.parse(await readFile(path, "utf8"));
    data.commands.find(
      (command: { path: string }) => command.path === "add",
    ).semantics.standalone = {
      support: "configured-only",
      reason: "Changed CLI policy.",
    };
    await writeFile(path, JSON.stringify(data));

    expect((await checkContracts(root)).diagnostics).toContainEqual(
      expect.objectContaining({
        code: "SKILLS_STANDALONE_MISMATCH",
        subject: "add",
      }),
    );
  });
  test("rejects init options that are not classified for zero-config mode", async () => {
    const root = await fixture();
    const path = join(root, "repos/arashi/contracts/cli-commands.json");
    const data = JSON.parse(await readFile(path, "utf8"));
    data.commands
      .find((command: { path: string }) => command.path === "init")
      .options.push({
        description: "future mode",
        flags: "--future-mode",
        optional: false,
        required: false,
        variadic: false,
      });
    await writeFile(path, JSON.stringify(data));

    expect((await checkContracts(root)).diagnostics).toContainEqual(
      expect.objectContaining({ code: "STANDALONE_INIT_POLICY_INVALID" }),
    );
  });
  test.each([
    [
      "policy",
      (semantics: Record<string, unknown>) => delete semantics.zeroConfig,
    ],
    [
      "reason",
      (semantics: Record<string, unknown>) =>
        delete (semantics.standalone as Record<string, unknown>).reason,
    ],
    [
      "dry-run support",
      (semantics: Record<string, unknown>) =>
        ((
          (semantics.zeroConfig as Record<string, unknown>).dryRun as Record<
            string,
            unknown
          >
        ).supported = false),
    ],
    [
      "JSON support",
      (semantics: Record<string, unknown>) =>
        ((
          (semantics.zeroConfig as Record<string, unknown>).json as Record<
            string,
            unknown
          >
        ).supported = false),
    ],
    [
      "compatible options",
      (semantics: Record<string, unknown>) =>
        (
          (semantics.zeroConfig as Record<string, unknown>)
            .compatibleOptions as unknown[]
        ).pop(),
    ],
    [
      "incompatible options",
      (semantics: Record<string, unknown>) =>
        (
          (semantics.zeroConfig as Record<string, unknown>)
            .incompatibleOptions as unknown[]
        ).pop(),
    ],
  ])(
    "requires complete init --zero-config %s metadata",
    async (_label, mutate) => {
      const root = await fixture();
      const path = join(root, "repos/arashi/contracts/cli-commands.json");
      const data = JSON.parse(await readFile(path, "utf8"));
      mutate(
        data.commands.find(
          (command: { path: string }) => command.path === "init",
        ).semantics,
      );
      await writeFile(path, JSON.stringify(data));

      const codes = (await checkContracts(root)).diagnostics.map(
        (diagnostic) => diagnostic.code,
      );
      expect(codes).toContain(
        _label === "reason"
          ? "POLICY_REASON_REQUIRED"
          : "STANDALONE_INIT_POLICY_INVALID",
      );
    },
  );
  test.each([
    [
      "conflicts",
      (policy: Record<string, unknown>) => (policy.conflicts = ["--sesh"]),
    ],
    [
      "environment prerequisite",
      (policy: Record<string, unknown>) =>
        (policy.environment = { name: "TMUX", nonEmptyAfterTrim: false }),
    ],
    [
      "implications",
      (policy: Record<string, unknown>) => (policy.implies = []),
    ],
    [
      "JSON precedence and label",
      (policy: Record<string, unknown>) =>
        (policy.json = {
          guardPrecedence: "after-option-validation",
          mode: "wrong",
          unsupported: true,
        }),
    ],
    [
      "persistence",
      (policy: Record<string, unknown>) => (policy.persisted = true),
    ],
  ])("rejects switch --tmux %s drift", async (_label, mutate) => {
    const root = await fixture();
    const contractPath = join(root, "repos/arashi/contracts/cli-commands.json");
    const contract = JSON.parse(await readFile(contractPath, "utf8"));
    const tmuxPolicy = contract.commands.find(
      (command: { path: string }) => command.path === "switch",
    ).semantics.optionPolicies["--tmux"];
    mutate(tmuxPolicy);
    await writeFile(contractPath, JSON.stringify(contract));

    expect((await checkContracts(root)).diagnostics).toContainEqual(
      expect.objectContaining({
        code: "OPTION_POLICY_MISMATCH",
        subject: "switch.--tmux",
      }),
    );
  });
  test("rejects missing skills --tmux coverage", async () => {
    const root = await fixture();
    const coveragePath = join(
      root,
      "repos/arashi-skills/contracts/command-coverage.json",
    );
    const coverage = JSON.parse(await readFile(coveragePath, "utf8"));
    const createCoverage = coverage.commands.find(
      (command: { name: string }) => command.name === "create",
    );
    createCoverage.requiredOptions = ["--tab"];
    await writeFile(coveragePath, JSON.stringify(coverage));

    expect((await checkContracts(root)).diagnostics).toContainEqual(
      expect.objectContaining({
        code: "SKILLS_OPTION_POLICY_MISMATCH",
        subject: "create.--tmux",
      }),
    );

    createCoverage.requiredOptions = ["--tab", "--tmux", "--future-option"];
    await writeFile(coveragePath, JSON.stringify(coverage));
    expect((await checkContracts(root)).diagnostics).not.toContainEqual(
      expect.objectContaining({
        code: "SKILLS_OPTION_POLICY_MISMATCH",
        subject: "create.--tmux",
      }),
    );

    const contractPath = join(root, "repos/arashi/contracts/cli-commands.json");
    const contract = JSON.parse(await readFile(contractPath, "utf8"));
    contract.commands.find(
      (command: { path: string }) => command.path === "create",
    ).semantics.optionPolicies["--tmux"].conflicts = ["--sesh"];
    await writeFile(contractPath, JSON.stringify(contract));
    expect((await checkContracts(root)).diagnostics).toContainEqual(
      expect.objectContaining({
        code: "OPTION_POLICY_MISMATCH",
        subject: "create.--tmux",
      }),
    );
  });
  test("finds unresolved parity, invalid mappings, and undeclared extension commands", async () => {
    const root = await fixture();
    const policyPath = join(
      root,
      "repos/arashi-vscode/contracts/command-policy.json",
    );
    const policy = JSON.parse(await readFile(policyPath, "utf8"));
    delete policy.cliCommands.add;
    policy.cliCommands.gone = { state: "mapped", commands: ["arashi.missing"] };
    await writeFile(policyPath, JSON.stringify(policy));
    const codes = (await checkContracts(root)).diagnostics.map((d) => d.code);
    for (const code of [
      "VSCODE_INVALID_CLI",
      "VSCODE_INVALID_COMMAND",
      "VSCODE_PARITY_MISSING",
    ])
      expect(codes).toContain(code);
  });
  test("rejects unsupported versions and exclusions without reasons", async () => {
    const root = await fixture();
    const path = join(
      root,
      "repos/arashi-skills/contracts/command-coverage.json",
    );
    await writeFile(
      path,
      JSON.stringify({
        schemaVersion: 2,
        commands: [{ name: "old", status: "excluded" }],
      }),
    );
    const codes = (await checkContracts(root)).diagnostics.map((d) => d.code);
    for (const code of ["POLICY_REASON_REQUIRED", "SCHEMA_VERSION_UNSUPPORTED"])
      expect(codes).toContain(code);
  });
  test("accepts managed Kitty in the canonical automatic launcher order", async () => {
    const root = await fixture();
    const autoOrder = [
      "tmux",
      "herdr",
      "cmux",
      "ide",
      "kitty",
      "cd",
      "platform",
    ];
    for (const relativePath of [
      "repos/arashi-docs/contracts/switch-config.json",
      "repos/arashi-skills/contracts/switch-config.json",
    ]) {
      const path = join(root, relativePath);
      const data = JSON.parse(await readFile(path, "utf8"));
      data.autoOrder = autoOrder;
      await writeFile(path, JSON.stringify(data));
    }

    expect(
      (await checkContracts(root)).diagnostics.filter(
        (diagnostic) => diagnostic.code === "SWITCH_CONFIG_MISMATCH",
      ),
    ).toEqual([]);
  });
  test("rejects a controlled switch-configuration semantic mismatch", async () => {
    const root = await fixture();
    const path = join(root, "repos/arashi-docs/contracts/switch-config.json");
    const data = JSON.parse(await readFile(path, "utf8"));
    data.autoOrder = ["cd", "tmux", "herdr", "cmux", "ide", "platform"];
    await writeFile(path, JSON.stringify(data));

    expect((await checkContracts(root)).diagnostics).toContainEqual(
      expect.objectContaining({
        code: "SWITCH_CONFIG_MISMATCH",
        source: "repos/arashi-docs/contracts/switch-config.json",
        subject: "autoOrder",
      }),
    );
  });
  test.each([
    { subject: "minimumVersion", value: "0.42.0" },
    { subject: "remoteControl.required", value: false },
    { subject: "identity.exactMatch", value: false },
    { subject: "reuse.automaticWindowCleanup", value: true },
    { subject: "locking.timeoutMs", value: 9_999 },
    { subject: "locking.ownershipSafeRelease", value: false },
    { subject: "session.persistentFiles", value: true },
    { subject: "session.removeClosesWindows", value: true },
    { subject: "selection.autoDetectedOnly", value: false },
    { remove: true, subject: "selection.failClosed" },
  ])(
    "rejects controlled Kitty semantic drift at $subject",
    async ({ remove, subject, value }) => {
      const root = await fixture();
      const path = join(
        root,
        "repos/arashi-docs/contracts/kitty-worktree-sessions.json",
      );
      const data = JSON.parse(await readFile(path, "utf8")) as Record<
        string,
        unknown
      >;
      const segments = subject.split(".");
      const leaf = segments.pop()!;
      let parent = data;
      for (const segment of segments) {
        parent = parent[segment] as Record<string, unknown>;
      }
      if (remove) {
        delete parent[leaf];
      } else {
        parent[leaf] = value;
      }
      await writeFile(path, JSON.stringify(data));

      expect((await checkContracts(root)).diagnostics).toContainEqual(
        expect.objectContaining({
          code: "KITTY_WORKTREE_SESSION_MISMATCH",
          source: "repos/arashi-docs/contracts/kitty-worktree-sessions.json",
          subject,
        }),
      );
    },
  );
  test("rejects Kitty semantic drift in canonical human guidance", async () => {
    const root = await fixture();
    const path = join(root, "repos/arashi-docs/docs/workflows/kitty.md");
    const content = await readFile(path, "utf8");
    await writeFile(
      path,
      content.replace("Kitty 0.43 or newer", "Kitty 0.42 or newer"),
    );

    expect((await checkContracts(root)).diagnostics).toContainEqual(
      expect.objectContaining({
        code: "KITTY_GUIDANCE_MISMATCH",
        source: "repos/arashi-docs/docs/workflows/kitty.md",
        subject: "Kitty 0.43 or newer",
      }),
    );
  });
  test("rejects a controlled create-launch semantic mismatch", async () => {
    const root = await fixture();
    const contract = createLaunchContract;
    const skillsPath = join(
      root,
      "repos/arashi-skills/contracts/create-launch-config.json",
    );
    const docsPath = join(
      root,
      "repos/arashi-docs/contracts/create-launch-config.json",
    );
    await writeFile(skillsPath, JSON.stringify(contract));
    await writeFile(
      docsPath,
      JSON.stringify({
        ...contract,
        modes: ["none", "auto", "sesh", "herdr", "drift"],
      }),
    );

    expect((await checkContracts(root)).diagnostics).toContainEqual(
      expect.objectContaining({
        code: "CREATE_CONFIG_MISMATCH",
        source: "repos/arashi-docs/contracts/create-launch-config.json",
        subject: "modes",
      }),
    );
  });
  test("derives coordinated create semantics from the CLI contract and schema", async () => {
    const root = await fixture();
    const modes = ["none", "auto", "sesh", "herdr", "future"];
    for (const relativePath of [
      "repos/arashi/contracts/create-launch-config.json",
      "repos/arashi-docs/contracts/create-launch-config.json",
      "repos/arashi-skills/contracts/create-launch-config.json",
    ]) {
      const path = join(root, relativePath);
      const data = JSON.parse(await readFile(path, "utf8"));
      data.modes = modes;
      await writeFile(path, JSON.stringify(data));
    }
    const schemaPath = join(root, "repos/arashi/schema/config.schema.json");
    const schema = JSON.parse(await readFile(schemaPath, "utf8"));
    schema.definitions.CreateLaunchMode.enum = modes;
    await writeFile(schemaPath, JSON.stringify(schema));

    expect(
      (await checkContracts(root)).diagnostics.filter((diagnostic) =>
        diagnostic.code.startsWith("CREATE_CONFIG"),
      ),
    ).toEqual([]);
  });
  test("rejects effective create refs and editor schema drift", async () => {
    const root = await fixture();
    const path = join(root, "repos/arashi/schema/config.schema.json");
    const data = JSON.parse(await readFile(path, "utf8"));
    data.definitions.CreateCommandDefaults.properties.launch = {
      $ref: "#/definitions/SwitchMode",
      enum: ["none", "auto", "sesh", "herdr"],
    };
    delete data.definitions.EditorCommandDefaults.properties.create;
    delete data.definitions.EditorDefaultsConfig.properties.cursor;
    await writeFile(path, JSON.stringify(data));

    const diagnostics = (await checkContracts(root)).diagnostics;
    for (const subject of ["launch", "editorCreate", "editorHosts"]) {
      expect(diagnostics).toContainEqual(
        expect.objectContaining({
          code: "CREATE_CONFIG_MISMATCH",
          source: "repos/arashi/schema/config.schema.json",
          subject,
        }),
      );
    }
  });
  test("rejects stale switch schema modes and deprecated canonical fields", async () => {
    const root = await fixture();
    const path = join(root, "repos/arashi/schema/config.schema.json");
    const data = JSON.parse(await readFile(path, "utf8"));
    data.definitions.SwitchMode.enum = ["auto", "cd", "launch"];
    data.definitions.SwitchCommandDefaults.properties.launchMode = {
      $ref: "#/definitions/LaunchMode",
    };
    await writeFile(path, JSON.stringify(data));

    const diagnostics = (await checkContracts(root)).diagnostics;
    expect(diagnostics).toContainEqual(
      expect.objectContaining({
        code: "SWITCH_CONFIG_MISMATCH",
        source: "repos/arashi/schema/config.schema.json",
        subject: "modes",
      }),
    );
    expect(diagnostics).toContainEqual(
      expect.objectContaining({
        code: "SWITCH_CONFIG_DEPRECATED_FIELD",
        source: "repos/arashi/schema/config.schema.json",
        subject: "launchMode",
      }),
    );
  });
  test("rejects stale create schema modes and deprecated canonical fields", async () => {
    const root = await fixture();
    const path = join(root, "repos/arashi/schema/config.schema.json");
    const data = JSON.parse(await readFile(path, "utf8"));
    data.definitions.CreateLaunchMode.enum = ["none", "auto", "sesh"];
    data.definitions.CreateCommandDefaults.properties.launch = {
      type: "string",
    };
    data.definitions.CreateCommandDefaults.properties.launchMode = {
      $ref: "#/definitions/LaunchMode",
    };
    await writeFile(path, JSON.stringify(data));

    const diagnostics = (await checkContracts(root)).diagnostics;
    expect(diagnostics).toContainEqual(
      expect.objectContaining({
        code: "CREATE_CONFIG_MISMATCH",
        source: "repos/arashi/schema/config.schema.json",
        subject: "modes",
      }),
    );
    expect(diagnostics).toContainEqual(
      expect.objectContaining({
        code: "CREATE_CONFIG_MISMATCH",
        source: "repos/arashi/schema/config.schema.json",
        subject: "launch",
      }),
    );
    expect(diagnostics).toContainEqual(
      expect.objectContaining({
        code: "CREATE_CONFIG_DEPRECATED_FIELD",
        source: "repos/arashi/schema/config.schema.json",
        subject: "launchMode",
      }),
    );
  });
  test("authoritative workflow uses the stable docs semantic aggregate", async () => {
    const workflow = await readFile(
      join(process.cwd(), ".github/workflows/cross-repo-command-contracts.yml"),
      "utf8",
    );

    expect(workflow).toContain(
      "run: pnpm --dir repos/arashi-docs validate:semantic-docs",
    );
    expect(workflow).not.toMatch(
      /run: pnpm --dir repos\/arashi-docs validate:(?!semantic-docs)[^\n]*-docs/,
    );
  });
  test("authoritative workflow does not run hook contracts twice", async () => {
    const workflow = await readFile(
      join(process.cwd(), ".github/workflows/cross-repo-command-contracts.yml"),
      "utf8",
    );

    expect(workflow).not.toContain("run: pnpm contracts:hooks");
    expect(workflow.match(/run: pnpm contracts:check:ci/g)).toHaveLength(1);
  });
  test("sorts diagnostics deterministically and formats stable output", async () => {
    const root = await fixture();
    await rm(join(root, "repos/arashi-docs/docs/commands/add.md"));
    const a = await checkContracts(root);
    const b = await checkContracts(root);
    expect(a).toEqual(b);
    expect(formatHuman(a)).toContain("[error] DOCS_PAGE_MISSING");
  });
});
