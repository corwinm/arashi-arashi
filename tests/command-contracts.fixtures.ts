import {
  copyFile,
  cp,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach } from "vitest";
import {
  checkContracts as checkContractsWithFocusedAcceptance,
  createBaseSemanticPolicy,
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
Kitty uses a cross-process identity lock. A contender waits up to 10 seconds and never steals from a live owner. A dead owner can be recovered; malformed metadata is recoverable after 30 seconds. Ownership-safe release removes only the lock held by the current process.
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
    "repos/arashi-docs/docs/reference/launching.md": docsTabContract,
    "repos/arashi-docs/public/reference/launching.md": docsTabContract,
    "repos/arashi-docs/scripts/check-tab-launch-docs.ts":
      "console.log('tab launch docs checker passed');\n",
    "repos/arashi-docs/package.json": {
      scripts: {
        "validate:tab-launch-docs": "node scripts/check-tab-launch-docs.ts",
      },
    },
    "repos/arashi-docs/docs/workflows/kitty.md":
      "Kitty 0.43 or newer\n`allow_remote_control`\nexact Arashi worktree identity\nafter integrated IDE detection and before parent-shell `cd`\nlive only\n`.kitty-session`\n`aw remove` does not close Kitty windows or sessions\nno `--kitty` flag\nnot added to persistent launch configuration\n`LAUNCH_FAILED`\ndoes not fall back\ncreated worktrees remain available\ncross-process identity lock\n10 seconds\nlive owner\ndead owner\n30 seconds\nownership-safe release\nOwnership-safe release\n",
    "repos/arashi-docs/public/workflows/kitty.md":
      "Kitty 0.43 or newer\n`allow_remote_control`\nexact Arashi worktree identity\nafter integrated IDE detection and before parent-shell `cd`\nlive only\n`.kitty-session`\n`aw remove` does not close Kitty windows or sessions\nno `--kitty` flag\nnot added to persistent launch configuration\n`LAUNCH_FAILED`\ndoes not fall back\ncreated worktrees remain available\ncross-process identity lock\n10 seconds\nlive owner\ndead owner\n30 seconds\nownership-safe release\nOwnership-safe release\n",
    "repos/arashi-docs/public/commands/add.md": addMaterializationGuidance,
    "repos/arashi-docs/public/llms-full.txt":
      "Kitty 0.43 or newer\n`allow_remote_control`\nexact Arashi worktree identity\nafter integrated IDE detection and before parent-shell `cd`\nlive only\n`.kitty-session`\n`aw remove` does not close Kitty windows or sessions\nno `--kitty` flag\nnot added to persistent launch configuration\n`LAUNCH_FAILED`\ndoes not fall back\ncreated worktrees remain available\ncross-process identity lock\n10 seconds\nlive owner\ndead owner\n30 seconds\nownership-safe release\nOwnership-safe release\n" +
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
      "Kitty 0.43+\nremote control\nLAUNCH_FAILED\nduplicate exact marked Kitty windows\ndoes not close ambiguous Kitty windows\npreserve the created worktrees\ncross-process identity lock\n10-second wait\nlive owner\ndead owner\n30 seconds\nownership-safe release\nOwnership-safe release\n",
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
    "repos/arashi-docs/docs/reference/launching.md",
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
    "repos/arashi-docs/docs/reference/configuration.md",
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
    "repos/arashi-docs/docs/getting-started/standalone.md",
    "repos/arashi-docs/docs/workflows/automation.md",
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
export {
  addMaterializationContract,
  addMaterializationGuidance,
  checkContracts,
  configureContract,
  createLaunchContract,
  docsTabContract,
  fixture,
  kittyWorktreeSessionContract,
  option,
  optionPolicies,
  roots,
  schemaV5Fixture,
  schemaV6Fixture,
  schemaV7Fixture,
  schemaV8Fixture,
  skillsTabContract,
  tabLauncherSupport,
};
