import { access, readFile, readdir } from "node:fs/promises";
import { join, relative } from "node:path";

export type Severity = "error" | "info";
export interface Diagnostic {
  severity: Severity;
  category: "schema" | "docs" | "skills" | "vscode";
  code: string;
  source: string;
  subject: string;
  message: string;
}
export interface CheckResult {
  ok: boolean;
  diagnostics: Diagnostic[];
}
type Obj = Record<string, unknown>;

const paths = {
  contract: "repos/arashi/contracts/cli-commands.json",
  cliCreateConfig: "repos/arashi/contracts/create-launch-config.json",
  configSchema: "repos/arashi/schema/config.schema.json",
  docs: "repos/arashi-docs/docs/commands",
  docsCreateConfig: "repos/arashi-docs/contracts/create-launch-config.json",
  docsSwitchConfig: "repos/arashi-docs/contracts/switch-config.json",
  skills: "repos/arashi-skills/skills/arashi",
  coverage: "repos/arashi-skills/contracts/command-coverage.json",
  skillsCreateConfig: "repos/arashi-skills/contracts/create-launch-config.json",
  skillsSwitchConfig: "repos/arashi-skills/contracts/switch-config.json",
  policy: "repos/arashi-vscode/contracts/command-policy.json",
  manifest: "repos/arashi-vscode/package.json",
} as const;
const switchModes = ["auto", "cd", "launch", "sesh", "herdr"];
const switchAutoOrder = ["tmux", "herdr", "cmux", "ide", "cd", "platform"];
const switchLegacyFields = [
  "defaults.switch.launchMode",
  "defaults.switch.launch_mode",
];
const object = (value: unknown): value is Obj =>
  typeof value === "object" && value !== null && !Array.isArray(value);
const text = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;
const strings = (value: unknown): string[] | undefined =>
  Array.isArray(value) && value.every(text) ? value : undefined;
const sorted = (values: string[]): string[] => [...values].sort();
const sameStrings = (left: string[] | undefined, right: string[]): boolean =>
  left !== undefined &&
  left.length === new Set(left).size &&
  JSON.stringify(sorted(left)) === JSON.stringify(sorted(right));
const cliStandaloneSupport = new Set([
  "full",
  "conditional",
  "configured-only",
  "not-applicable",
]);
const skillsStandaloneSupport = new Set([
  "supported",
  "conditional",
  "configured-only",
  "not-applicable",
]);
const normalizeStandaloneSupport = (value: unknown): string | undefined => {
  if (!text(value)) return undefined;
  return value === "full" ? "supported" : value;
};
const initCompatibleOptions = ["--dry-run", "--json", "--verbose"];
const initIncompatibleOptions = [
  "--force",
  "--ignore-scope",
  "--no-discover",
  "--repos-dir",
  "--worktrees-dir",
];
const tmuxOptionPolicies: Record<"create" | "switch", Obj> = {
  create: {
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
  switch: {
    compatibleOptions: ["--no-cd", "--no-default-launch"],
    conflicts: ["--cd", "--cursor", "--herdr", "--kiro", "--sesh", "--vscode"],
    environment: { name: "TMUX", nonEmptyAfterTrim: true },
    implies: ["launch"],
    json: {
      guardPrecedence: "before-option-validation",
      mode: "launch",
      unsupported: true,
    },
    persisted: false,
  },
};
const sameTmuxPolicy = (actual: Obj, expected: Obj): boolean => {
  const actualEnvironment = object(actual.environment)
    ? actual.environment
    : {};
  const expectedEnvironment = object(expected.environment)
    ? expected.environment
    : {};
  const actualJson = object(actual.json) ? actual.json : {};
  const expectedJson = object(expected.json) ? expected.json : {};
  return (
    sameStrings(
      strings(actual.compatibleOptions),
      strings(expected.compatibleOptions) ?? [],
    ) &&
    sameStrings(strings(actual.conflicts), strings(expected.conflicts) ?? []) &&
    sameStrings(strings(actual.implies), strings(expected.implies) ?? []) &&
    actualEnvironment.name === expectedEnvironment.name &&
    actualEnvironment.nonEmptyAfterTrim ===
      expectedEnvironment.nonEmptyAfterTrim &&
    actualJson.guardPrecedence === expectedJson.guardPrecedence &&
    actualJson.mode === expectedJson.mode &&
    actualJson.unsupported === expectedJson.unsupported &&
    actual.persisted === expected.persisted
  );
};
const sameInitPolicy = (left: Obj, right: Obj): boolean =>
  left.option === right.option &&
  left.dryRun === right.dryRun &&
  left.json === right.json &&
  sameStrings(
    strings(left.compatibleOptions),
    strings(right.compatibleOptions) ?? [],
  ) &&
  sameStrings(
    strings(left.incompatibleOptions),
    strings(right.incompatibleOptions) ?? [],
  );
const exists = async (path: string): Promise<boolean> => {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
};

async function json(
  root: string,
  path: string,
  diagnostics: Diagnostic[],
): Promise<Obj | undefined> {
  try {
    const value: unknown = JSON.parse(await readFile(join(root, path), "utf8"));
    if (!object(value)) throw new Error("root must be an object");
    return value;
  } catch (error) {
    diagnostics.push({
      severity: "error",
      category: "schema",
      code: "SCHEMA_INVALID",
      source: path,
      subject: path,
      message: `Cannot parse JSON object: ${error instanceof Error ? error.message : String(error)}`,
    });
  }
}
function version(
  value: Obj | undefined,
  source: string,
  diagnostics: Diagnostic[],
  expected = 1,
) {
  if (value && value.schemaVersion !== expected)
    diagnostics.push({
      severity: "error",
      category: "schema",
      code: "SCHEMA_VERSION_UNSUPPORTED",
      source,
      subject: String(value.schemaVersion),
      message: `Expected schemaVersion ${expected}.`,
    });
}
function reason(
  entry: Obj,
  source: string,
  subject: string,
  required: boolean,
  diagnostics: Diagnostic[],
) {
  if (required && !text(entry.reason))
    diagnostics.push({
      severity: "error",
      category: "schema",
      code: "POLICY_REASON_REQUIRED",
      source,
      subject,
      message: "This classification requires a non-empty reason.",
    });
}
function add(
  diagnostics: Diagnostic[],
  severity: Severity,
  category: Diagnostic["category"],
  code: string,
  source: string,
  subject: string,
  message: string,
) {
  diagnostics.push({ severity, category, code, source, subject, message });
}
function checkSwitchConfigContract(
  value: Obj | undefined,
  source: string,
  diagnostics: Diagnostic[],
) {
  if (!value) return;
  version(value, source, diagnostics);
  const expectations: Array<[string, boolean]> = [
    ["canonicalField", value?.canonicalField === "defaults.switch.mode"],
    ["modes", sameStrings(strings(value?.modes), switchModes)],
    ["absentMode", value?.absentMode === "launch"],
    [
      "autoOrder",
      JSON.stringify(strings(value?.autoOrder)) ===
        JSON.stringify(switchAutoOrder),
    ],
    [
      "legacyFields",
      sameStrings(strings(value?.legacyFields), switchLegacyFields),
    ],
    ["createDefaultsUnchanged", !("createDefaultsUnchanged" in value)],
  ];
  for (const [subject, matches] of expectations)
    if (!matches)
      add(
        diagnostics,
        "error",
        source.includes("arashi-docs") ? "docs" : "skills",
        "SWITCH_CONFIG_MISMATCH",
        source,
        subject,
        "Switch configuration semantics must match the canonical unified-mode contract.",
      );
}
const createUnorderedArraySubjects = [
  "modes",
  "editorHosts",
  "legacyFields",
  "acceptedMigrations",
  "rejectedMigrations",
  "jsonRestrictedModes",
] as const;

const createScalarSubjects = [
  "canonicalField",
  "absentMode",
  "editorScope",
  "editorScopeFallback",
  "failurePreservesCreatedWorktrees",
] as const;

const createCategory = (source: string): Diagnostic["category"] =>
  source.includes("arashi-docs")
    ? "docs"
    : source.includes("arashi-skills")
      ? "skills"
      : "schema";

function validateCreateConfigContract(
  value: Obj | undefined,
  source: string,
  diagnostics: Diagnostic[],
): boolean {
  if (!value) return false;
  version(value, source, diagnostics);
  const switchContract = object(value.switch) ? value.switch : {};
  const arrays = [...createUnorderedArraySubjects, "cliPrecedence"] as const;
  const expectations: Array<[string, boolean]> = [
    ["schemaVersion", value.schemaVersion === 1],
    ["canonicalField", text(value.canonicalField)],
    ["absentMode", text(value.absentMode)],
    ["editorScope", text(value.editorScope)],
    ["editorScopeFallback", text(value.editorScopeFallback)],
    [
      "switch",
      text(switchContract.field) &&
        text(switchContract.type) &&
        typeof switchContract.independent === "boolean" &&
        typeof switchContract.launchImpliesSwitch === "boolean",
    ],
    [
      "failurePreservesCreatedWorktrees",
      typeof value.failurePreservesCreatedWorktrees === "boolean",
    ],
    ...arrays.map((subject): [string, boolean] => {
      const values = strings(value[subject]) ?? [];
      return [
        subject,
        values.length > 0 && new Set(values).size === values.length,
      ];
    }),
  ];
  const modes = strings(value.modes) ?? [];
  const restricted = strings(value.jsonRestrictedModes) ?? [];
  expectations.push([
    "jsonRestrictedModes",
    restricted.every((mode) => modes.includes(mode)),
  ]);
  const accepted = strings(value.acceptedMigrations) ?? [];
  const rejected = new Set(strings(value.rejectedMigrations) ?? []);
  expectations.push([
    "migrationClassifications",
    accepted.every((classification) => !rejected.has(classification)),
  ]);

  let valid = true;
  for (const [subject, matches] of expectations) {
    if (matches) continue;
    valid = false;
    add(
      diagnostics,
      "error",
      createCategory(source),
      "CREATE_CONFIG_INVALID",
      source,
      subject,
      "Create launch semantic contract is missing or structurally invalid.",
    );
  }
  return valid;
}

function checkCreateConfigContract(
  value: Obj | undefined,
  canonical: Obj | undefined,
  source: string,
  diagnostics: Diagnostic[],
) {
  if (!value || !canonical) return;
  const switchContract = object(value.switch) ? value.switch : {};
  const canonicalSwitch = object(canonical.switch) ? canonical.switch : {};
  const expectations: Array<[string, boolean]> = [
    ...createScalarSubjects.map((subject): [string, boolean] => [
      subject,
      value[subject] === canonical[subject],
    ]),
    [
      "switch",
      switchContract.field === canonicalSwitch.field &&
        switchContract.type === canonicalSwitch.type &&
        switchContract.independent === canonicalSwitch.independent &&
        switchContract.launchImpliesSwitch ===
          canonicalSwitch.launchImpliesSwitch,
    ],
    ...createUnorderedArraySubjects.map((subject): [string, boolean] => [
      subject,
      sameStrings(strings(value[subject]), strings(canonical[subject]) ?? []),
    ]),
    [
      "cliPrecedence",
      JSON.stringify(strings(value.cliPrecedence)) ===
        JSON.stringify(strings(canonical.cliPrecedence)),
    ],
  ];
  for (const [subject, matches] of expectations) {
    if (matches) continue;
    add(
      diagnostics,
      "error",
      createCategory(source),
      "CREATE_CONFIG_MISMATCH",
      source,
      subject,
      "Create launch semantics must match the CLI semantic contract.",
    );
  }
}

async function markdownFiles(directory: string): Promise<string[]> {
  const result: string[] = [];
  async function walk(path: string) {
    for (const entry of await readdir(path, { withFileTypes: true })) {
      const child = join(path, entry.name);
      if (entry.isDirectory()) await walk(child);
      else if (entry.name.endsWith(".md")) result.push(child);
    }
  }
  try {
    await walk(directory);
  } catch {
    /* Missing tree is diagnosed through coverage/reference checks. */
  }
  return result.sort();
}

export async function checkContracts(
  root = process.cwd(),
): Promise<CheckResult> {
  const d: Diagnostic[] = [];
  const contract = await json(root, paths.contract, d);
  const cliCreateConfig = await json(root, paths.cliCreateConfig, d);
  const configSchema = await json(root, paths.configSchema, d);
  const docsCreateConfig = await json(root, paths.docsCreateConfig, d);
  const docsSwitchConfig = await json(root, paths.docsSwitchConfig, d);
  const coverage = await json(root, paths.coverage, d);
  const skillsCreateConfig = await json(root, paths.skillsCreateConfig, d);
  const skillsSwitchConfig = await json(root, paths.skillsSwitchConfig, d);
  const policy = await json(root, paths.policy, d);
  const manifest = await json(root, paths.manifest, d);
  const cliCreateConfigValid = validateCreateConfigContract(
    cliCreateConfig,
    paths.cliCreateConfig,
    d,
  );
  const docsCreateConfigValid = validateCreateConfigContract(
    docsCreateConfig,
    paths.docsCreateConfig,
    d,
  );
  const skillsCreateConfigValid = validateCreateConfigContract(
    skillsCreateConfig,
    paths.skillsCreateConfig,
    d,
  );
  if (cliCreateConfigValid && docsCreateConfigValid)
    checkCreateConfigContract(
      docsCreateConfig,
      cliCreateConfig,
      paths.docsCreateConfig,
      d,
    );
  if (cliCreateConfigValid && skillsCreateConfigValid)
    checkCreateConfigContract(
      skillsCreateConfig,
      cliCreateConfig,
      paths.skillsCreateConfig,
      d,
    );
  checkSwitchConfigContract(docsSwitchConfig, paths.docsSwitchConfig, d);
  checkSwitchConfigContract(skillsSwitchConfig, paths.skillsSwitchConfig, d);
  const definitions = object(configSchema?.definitions)
    ? configSchema.definitions
    : {};
  const switchMode = object(definitions.SwitchMode)
    ? definitions.SwitchMode
    : {};
  if (!sameStrings(strings(switchMode.enum), switchModes))
    add(
      d,
      "error",
      "schema",
      "SWITCH_CONFIG_MISMATCH",
      paths.configSchema,
      "modes",
      "SwitchMode must enumerate auto, cd, launch, sesh, and herdr.",
    );
  const switchDefaults = object(definitions.SwitchCommandDefaults)
    ? definitions.SwitchCommandDefaults
    : {};
  const switchProperties = object(switchDefaults.properties)
    ? switchDefaults.properties
    : {};
  if (!("mode" in switchProperties))
    add(
      d,
      "error",
      "schema",
      "SWITCH_CONFIG_MISMATCH",
      paths.configSchema,
      "mode",
      "SwitchCommandDefaults must expose the canonical mode field.",
    );
  for (const deprecated of ["launchMode", "launch_mode"])
    if (deprecated in switchProperties)
      add(
        d,
        "error",
        "schema",
        "SWITCH_CONFIG_DEPRECATED_FIELD",
        paths.configSchema,
        deprecated,
        "Deprecated switch launcher aliases must not be canonical schema properties.",
      );
  const commandDefaults = object(definitions.CommandDefaultsConfig)
    ? definitions.CommandDefaultsConfig
    : {};
  const commandDefaultProperties = object(commandDefaults.properties)
    ? commandDefaults.properties
    : {};
  const commandCreate = object(commandDefaultProperties.create)
    ? commandDefaultProperties.create
    : {};
  if (
    cliCreateConfig?.canonicalField !== "defaults.create.launch" ||
    commandCreate.$ref !== "#/definitions/CreateCommandDefaults"
  )
    add(
      d,
      "error",
      "schema",
      "CREATE_CONFIG_MISMATCH",
      paths.configSchema,
      "canonicalField",
      "The CLI canonical field and generated defaults.create schema path must resolve to CreateCommandDefaults.launch.",
    );
  const createDefaults = object(definitions.CreateCommandDefaults)
    ? definitions.CreateCommandDefaults
    : {};
  const createProperties = object(createDefaults.properties)
    ? createDefaults.properties
    : {};
  const createLaunchMode = object(definitions.CreateLaunchMode)
    ? definitions.CreateLaunchMode
    : {};
  const cliCreateModes = strings(cliCreateConfig?.modes) ?? [];
  if (!sameStrings(strings(createLaunchMode.enum), cliCreateModes))
    add(
      d,
      "error",
      "schema",
      "CREATE_CONFIG_MISMATCH",
      paths.configSchema,
      "modes",
      "CreateLaunchMode must enumerate none, auto, sesh, and herdr.",
    );

  if (!("launch" in createProperties))
    add(
      d,
      "error",
      "schema",
      "CREATE_CONFIG_MISMATCH",
      paths.configSchema,
      "launch",
      "CreateCommandDefaults must expose the canonical launch field.",
    );
  const createLaunch = object(createProperties.launch)
    ? createProperties.launch
    : {};
  if (createLaunch.$ref !== "#/definitions/CreateLaunchMode")
    add(
      d,
      "error",
      "schema",
      "CREATE_CONFIG_MISMATCH",
      paths.configSchema,
      "launch",
      "CreateCommandDefaults.launch must use the canonical create launch enum.",
    );
  const createSwitch = object(createProperties.switch)
    ? createProperties.switch
    : {};
  const cliCreateSwitch = object(cliCreateConfig?.switch)
    ? cliCreateConfig.switch
    : {};
  if (
    createSwitch.type !== "boolean" ||
    cliCreateSwitch.field !== "defaults.create.switch" ||
    cliCreateSwitch.type !== createSwitch.type
  )
    add(
      d,
      "error",
      "schema",
      "CREATE_CONFIG_MISMATCH",
      paths.configSchema,
      "switch",
      "CreateCommandDefaults.switch must remain an independent boolean.",
    );
  for (const deprecated of ["launchMode", "launch_mode"])
    if (deprecated in createProperties)
      add(
        d,
        "error",
        "schema",
        "CREATE_CONFIG_DEPRECATED_FIELD",
        paths.configSchema,
        deprecated,
        "Deprecated create launcher aliases must not be canonical schema properties.",
      );
  const commandEditors = object(commandDefaultProperties.editors)
    ? commandDefaultProperties.editors
    : {};
  if (
    cliCreateConfig?.editorScope !== "defaults.editors.<host>.create" ||
    commandEditors.$ref !== "#/definitions/EditorDefaultsConfig"
  )
    add(
      d,
      "error",
      "schema",
      "CREATE_CONFIG_MISMATCH",
      paths.configSchema,
      "editorScope",
      "The CLI editor scope and generated defaults.editors schema path must resolve through EditorDefaultsConfig.",
    );
  const editorCommandDefaults = object(definitions.EditorCommandDefaults)
    ? definitions.EditorCommandDefaults
    : {};
  const editorCommandProperties = object(editorCommandDefaults.properties)
    ? editorCommandDefaults.properties
    : {};
  const editorCreate = object(editorCommandProperties.create)
    ? editorCommandProperties.create
    : {};
  if (editorCreate.$ref !== "#/definitions/CreateCommandDefaults")
    add(
      d,
      "error",
      "schema",
      "CREATE_CONFIG_MISMATCH",
      paths.configSchema,
      "editorCreate",
      "EditorCommandDefaults.create must reference CreateCommandDefaults.",
    );
  const editorDefaults = object(definitions.EditorDefaultsConfig)
    ? definitions.EditorDefaultsConfig
    : {};
  const editorProperties = object(editorDefaults.properties)
    ? editorDefaults.properties
    : {};
  const cliEditorHosts = strings(cliCreateConfig?.editorHosts) ?? [];
  if (!sameStrings(Object.keys(editorProperties), cliEditorHosts))
    add(
      d,
      "error",
      "schema",
      "CREATE_CONFIG_MISMATCH",
      paths.configSchema,
      "editorHosts",
      "EditorDefaultsConfig hosts must match the CLI create-launch contract.",
    );
  for (const host of cliEditorHosts) {
    const editorHost = object(editorProperties[host])
      ? editorProperties[host]
      : {};
    if (editorHost.$ref !== "#/definitions/EditorCommandDefaults")
      add(
        d,
        "error",
        "schema",
        "CREATE_CONFIG_MISMATCH",
        paths.configSchema,
        `editorHost:${host}`,
        "Each editor host must reference EditorCommandDefaults.",
      );
  }
  version(contract, paths.contract, d, 3);
  version(coverage, paths.coverage, d);
  version(policy, paths.policy, d);
  const commandEntries = Array.isArray(contract?.commands)
    ? contract.commands.filter(object)
    : [];
  if (contract?.schemaVersion === 3 && "cliVersion" in contract)
    add(
      d,
      "error",
      "schema",
      "SCHEMA_INVALID",
      paths.contract,
      "cliVersion",
      "Contract schema version 3 excludes package release metadata.",
    );
  if (contract && !Array.isArray(contract.commands))
    add(
      d,
      "error",
      "schema",
      "SCHEMA_INVALID",
      paths.contract,
      "contract",
      "Contract requires commands.",
    );
  const commands = new Map<string, Obj>();
  for (const command of commandEntries) {
    if (!text(command.path) || commands.has(command.path)) {
      add(
        d,
        "error",
        "schema",
        "SCHEMA_INVALID",
        paths.contract,
        String(command.path),
        "Command paths must be non-empty and unique.",
      );
      continue;
    }
    commands.set(command.path, command);
    const semantics = object(command.semantics) ? command.semantics : {};
    for (const surface of ["json", "docs", "skills", "standalone", "vscode"])
      if (!object(semantics[surface]))
        add(
          d,
          "error",
          "schema",
          "SCHEMA_INVALID",
          paths.contract,
          `${command.path}.${surface}`,
          "Missing semantic classification.",
        );
    const jsonPolicy = object(semantics.json) ? semantics.json : {};
    reason(
      jsonPolicy,
      paths.contract,
      `${command.path}.json`,
      jsonPolicy.support === "conditional" ||
        jsonPolicy.support === "unsupported",
      d,
    );
    const standalonePolicy = object(semantics.standalone)
      ? semantics.standalone
      : {};
    if (!cliStandaloneSupport.has(String(standalonePolicy.support)))
      add(
        d,
        "error",
        "schema",
        "SCHEMA_INVALID",
        paths.contract,
        `${command.path}.standalone`,
        "Standalone support must be full, conditional, configured-only, or not-applicable.",
      );
    reason(
      standalonePolicy,
      paths.contract,
      `${command.path}.standalone`,
      standalonePolicy.support !== "full",
      d,
    );
    for (const surface of ["docs", "skills", "vscode"]) {
      const p = object(semantics[surface]) ? (semantics[surface] as Obj) : {};
      reason(
        p,
        paths.contract,
        `${command.path}.${surface}`,
        p.expectation === "excluded" || p.expectation === "represented",
        d,
      );
    }
  }

  let index = "";
  try {
    index = await readFile(join(root, paths.docs, "index.md"), "utf8");
  } catch {
    add(
      d,
      "error",
      "docs",
      "DOCS_INDEX_MISSING",
      `${paths.docs}/index.md`,
      "index",
      "Canonical command index is missing.",
    );
  }
  for (const [name, command] of commands) {
    const p =
      object(command.semantics) && object(command.semantics.docs)
        ? command.semantics.docs
        : {};
    if (p.expectation === "required") {
      if (!(await exists(join(root, paths.docs, `${name}.md`))))
        add(
          d,
          "error",
          "docs",
          "DOCS_PAGE_MISSING",
          `${paths.docs}/${name}.md`,
          name,
          "Required canonical command page is missing.",
        );
      if (!new RegExp(`(?:\\./|/)?commands/${name}(?:\\.md|/|\\))`).test(index))
        add(
          d,
          "error",
          "docs",
          "DOCS_INDEX_MISSING",
          `${paths.docs}/index.md`,
          name,
          "Required command is absent from the canonical index.",
        );
    } else if (p.expectation === "excluded")
      add(
        d,
        "info",
        "docs",
        "DOCS_EXCLUDED",
        paths.contract,
        name,
        String(p.reason),
      );
  }

  const covered = new Map<string, Obj>();
  const coverageEntries = Array.isArray(coverage?.commands)
    ? coverage.commands.filter(object)
    : [];
  if (coverage && !Array.isArray(coverage.commands))
    add(
      d,
      "error",
      "schema",
      "SCHEMA_INVALID",
      paths.coverage,
      "commands",
      "Coverage commands must be an array.",
    );
  for (const entry of coverageEntries) {
    const name = entry.name;
    if (!text(name) || covered.has(name)) {
      add(
        d,
        "error",
        "schema",
        "SCHEMA_INVALID",
        paths.coverage,
        String(name),
        "Coverage names must be non-empty and unique.",
      );
      continue;
    }
    covered.set(name, entry);
    reason(entry, paths.coverage, name, entry.status === "excluded", d);
    const standalonePolicy = object(entry.standalone) ? entry.standalone : {};
    if (!skillsStandaloneSupport.has(String(standalonePolicy.support)))
      add(
        d,
        "error",
        "schema",
        "SCHEMA_INVALID",
        paths.coverage,
        `${name}.standalone`,
        "Standalone support must be supported, conditional, configured-only, or not-applicable.",
      );
    reason(
      standalonePolicy,
      paths.coverage,
      `${name}.standalone`,
      standalonePolicy.support !== "supported",
      d,
    );
    if (!commands.has(name))
      add(
        d,
        "error",
        "skills",
        "SKILLS_STALE_COVERAGE",
        paths.coverage,
        name,
        "Coverage names a command absent from the CLI contract.",
      );
  }
  for (const [name, command] of commands) {
    const skillsPolicy =
      object(command.semantics) && object(command.semantics.skills)
        ? command.semantics.skills
        : {};
    const expectation = skillsPolicy.expectation;
    const entry = covered.get(name);
    if (expectation === "excluded" && !entry) {
      add(
        d,
        "info",
        "skills",
        "SKILLS_EXCLUDED",
        paths.contract,
        name,
        String(skillsPolicy.reason),
      );
      continue;
    }
    if (!entry)
      add(
        d,
        "error",
        "skills",
        "SKILLS_COVERAGE_MISSING",
        paths.coverage,
        name,
        "Command has no structured skills decision.",
      );
    else if (entry.status === "covered") {
      if (
        !text(entry.reference) ||
        !(await exists(join(root, paths.skills, entry.reference)))
      )
        add(
          d,
          "error",
          "skills",
          "SKILLS_REFERENCE_INVALID",
          paths.coverage,
          name,
          "Covered command requires an existing relative reference.",
        );
    } else if (entry.status === "excluded")
      add(
        d,
        "info",
        "skills",
        "SKILLS_EXCLUDED",
        paths.coverage,
        name,
        String(entry.reason),
      );
    else
      add(
        d,
        "error",
        "schema",
        "SCHEMA_INVALID",
        paths.coverage,
        name,
        "Status must be covered or excluded.",
      );
    if (expectation === "required" && entry?.status === "excluded")
      add(
        d,
        "error",
        "skills",
        "SKILLS_EXPECTATION_MISMATCH",
        paths.coverage,
        name,
        "CLI requires skills coverage but policy excludes it.",
      );
    if (entry) {
      const cliStandalone =
        object(command.semantics) && object(command.semantics.standalone)
          ? command.semantics.standalone
          : {};
      const skillsStandalone = object(entry.standalone) ? entry.standalone : {};
      const cliSupport = normalizeStandaloneSupport(cliStandalone.support);
      const skillsSupport = normalizeStandaloneSupport(
        skillsStandalone.support,
      );
      if (cliSupport !== skillsSupport)
        add(
          d,
          "error",
          "skills",
          "SKILLS_STANDALONE_MISMATCH",
          paths.coverage,
          name,
          `Skills classify standalone support as ${String(skillsStandalone.support)}, but the CLI classifies it as ${String(cliStandalone.support)}.`,
        );
    }
  }

  const initCommand = commands.get("init");
  const initCoverage = covered.get("init");
  if (initCommand) {
    const options = Array.isArray(initCommand.options)
      ? initCommand.options
          .filter(object)
          .flatMap((option) =>
            text(option.flags)
              ? (option.flags.match(/--[a-z0-9-]+/g) ?? [])
              : [],
          )
      : [];
    const semantics = object(initCommand.semantics)
      ? initCommand.semantics
      : {};
    const rawPolicy = object(semantics.zeroConfig) ? semantics.zeroConfig : {};
    const dryRun = object(rawPolicy.dryRun) ? rawPolicy.dryRun : {};
    const jsonPolicy = object(rawPolicy.json) ? rawPolicy.json : {};
    const policy: Obj = {
      compatibleOptions: rawPolicy.compatibleOptions,
      dryRun: dryRun.supported,
      incompatibleOptions: rawPolicy.incompatibleOptions,
      json: jsonPolicy.supported,
      option: rawPolicy.option,
    };
    const validPolicy =
      policy.option === "--zero-config" &&
      dryRun.supported === true &&
      dryRun.finalState === "unchanged" &&
      jsonPolicy.supported === true &&
      jsonPolicy.singleEnvelope === true &&
      jsonPolicy.suppressesHumanStdout === true &&
      sameStrings(strings(policy.compatibleOptions), initCompatibleOptions) &&
      sameStrings(
        strings(policy.incompatibleOptions),
        initIncompatibleOptions,
      ) &&
      sameStrings(options, [
        "--zero-config",
        ...initCompatibleOptions,
        ...initIncompatibleOptions,
      ]);
    if (!validPolicy)
      add(
        d,
        "error",
        "schema",
        "STANDALONE_INIT_POLICY_INVALID",
        paths.contract,
        "init.zeroConfig",
        "init --zero-config requires unchanged dry-run behavior, single-envelope JSON behavior, and complete compatible and incompatible option policy metadata.",
      );
    if (initCoverage) {
      const coverageStandalone = object(initCoverage.standalone)
        ? initCoverage.standalone
        : {};
      const coveragePolicy = object(coverageStandalone.policy)
        ? coverageStandalone.policy
        : {};
      const requiredOptions = strings(initCoverage.requiredOptions);
      if (
        !sameStrings(requiredOptions, ["--zero-config"]) ||
        !sameInitPolicy(policy, coveragePolicy)
      )
        add(
          d,
          "error",
          "skills",
          "SKILLS_INIT_POLICY_MISMATCH",
          paths.coverage,
          "init",
          "Skills init --zero-config option policy metadata must match the CLI contract.",
        );
    }
  }
  for (const commandName of ["create", "switch"] as const) {
    const command = commands.get(commandName);
    if (!command) continue;
    const commandOptions = Array.isArray(command.options)
      ? command.options
          .filter(object)
          .flatMap((option) =>
            text(option.flags)
              ? (option.flags.match(/--[a-z0-9-]+/g) ?? [])
              : [],
          )
      : [];
    const semantics = object(command.semantics) ? command.semantics : {};
    const optionPolicies = object(semantics.optionPolicies)
      ? semantics.optionPolicies
      : {};
    const tmuxPolicy = object(optionPolicies["--tmux"])
      ? optionPolicies["--tmux"]
      : {};
    const expectedPolicy = tmuxOptionPolicies[commandName];
    const requiredOptions = [
      "--tmux",
      ...(strings(expectedPolicy.compatibleOptions) ?? []),
      ...(strings(expectedPolicy.conflicts) ?? []),
    ];
    if (
      !sameTmuxPolicy(tmuxPolicy, expectedPolicy) ||
      !requiredOptions.every((option) => commandOptions.includes(option))
    )
      add(
        d,
        "error",
        "schema",
        "TMUX_OPTION_POLICY_MISMATCH",
        paths.contract,
        `${commandName}.--tmux`,
        `${commandName} --tmux requires the canonical conflict, prerequisite, implication, JSON-precedence, and non-persisted policy metadata.`,
      );
    const coverageEntry = covered.get(commandName);
    if (
      coverageEntry &&
      !(strings(coverageEntry.requiredOptions) ?? []).includes("--tmux")
    )
      add(
        d,
        "error",
        "skills",
        "SKILLS_TMUX_POLICY_MISMATCH",
        paths.coverage,
        commandName,
        `Skills coverage for ${commandName} must require --tmux.`,
      );
  }
  for (const file of await markdownFiles(join(root, paths.skills))) {
    const content = await readFile(file, "utf8");
    const regex = /`arashi\s+([a-z][a-z0-9-]*)(?=[\s`])/g;
    for (const match of content.matchAll(regex))
      if (
        !commands.has(match[1]) &&
        !["--help", "--version"].includes(match[1])
      )
        add(
          d,
          "error",
          "skills",
          "SKILLS_STALE_REFERENCE",
          relative(root, file),
          match[1],
          "Command-shaped reference is absent from the CLI contract.",
        );
  }

  const cliPolicy = object(policy?.cliCommands) ? policy.cliCommands : {};
  const extensionOnly = Array.isArray(policy?.extensionOnlyCommands)
    ? policy.extensionOnlyCommands.filter(text)
    : [];
  const contributed = new Set(
    (object(manifest?.contributes) &&
    Array.isArray(manifest.contributes.commands)
      ? manifest.contributes.commands
      : []
    )
      .filter(object)
      .map((x) => x.command)
      .filter(text),
  );
  for (const [name, raw] of Object.entries(cliPolicy)) {
    if (!object(raw)) {
      add(
        d,
        "error",
        "schema",
        "SCHEMA_INVALID",
        paths.policy,
        name,
        "CLI policy entry must be an object.",
      );
      continue;
    }
    if (!commands.has(name))
      add(
        d,
        "error",
        "vscode",
        "VSCODE_INVALID_CLI",
        paths.policy,
        name,
        "Policy names a command absent from the CLI contract.",
      );
    const ids = Array.isArray(raw.commands) ? raw.commands.filter(text) : [];
    reason(
      raw,
      paths.policy,
      name,
      raw.state === "excluded" || raw.state === "represented",
      d,
    );
    if (raw.state === "mapped" && ids.length === 0)
      add(
        d,
        "error",
        "vscode",
        "VSCODE_INVALID_MAPPING",
        paths.policy,
        name,
        "Mapped state requires extension command IDs.",
      );
    if (
      raw.state === "represented" &&
      ids.length === 0 &&
      !(Array.isArray(raw.views) && raw.views.some(text))
    )
      add(
        d,
        "error",
        "vscode",
        "VSCODE_INVALID_MAPPING",
        paths.policy,
        name,
        "Represented state requires commands or views.",
      );
    if (!["mapped", "represented", "excluded"].includes(String(raw.state)))
      add(
        d,
        "error",
        "schema",
        "SCHEMA_INVALID",
        paths.policy,
        name,
        "State must be mapped, represented, or excluded.",
      );
    for (const id of ids)
      if (!contributed.has(id))
        add(
          d,
          "error",
          "vscode",
          "VSCODE_INVALID_COMMAND",
          paths.policy,
          id,
          "Mapped extension command is not contributed by package.json.",
        );
    if (raw.state === "excluded")
      add(
        d,
        "info",
        "vscode",
        "VSCODE_EXCLUDED",
        paths.policy,
        name,
        String(raw.reason),
      );
  }
  for (const [name, command] of commands)
    if (!object(cliPolicy[name])) {
      const vscodePolicy =
        object(command.semantics) && object(command.semantics.vscode)
          ? command.semantics.vscode
          : {};
      if (vscodePolicy.expectation === "excluded")
        add(
          d,
          "info",
          "vscode",
          "VSCODE_EXCLUDED",
          paths.contract,
          name,
          String(vscodePolicy.reason),
        );
      else
        add(
          d,
          "error",
          "vscode",
          "VSCODE_PARITY_MISSING",
          paths.policy,
          name,
          "CLI command has no mapping, representation, or exclusion.",
        );
    }
  for (const id of extensionOnly)
    if (!contributed.has(id))
      add(
        d,
        "error",
        "vscode",
        "VSCODE_EXTENSION_ONLY_INVALID",
        paths.policy,
        id,
        "Extension-only command is not contributed.",
      );
  const classified = new Set(extensionOnly);
  for (const raw of Object.values(cliPolicy))
    if (object(raw) && Array.isArray(raw.commands))
      raw.commands.filter(text).forEach((id) => classified.add(id));
  for (const id of contributed)
    if (!classified.has(id))
      add(
        d,
        "error",
        "vscode",
        "VSCODE_COMMAND_UNCLASSIFIED",
        paths.manifest,
        id,
        "Contributed command is neither CLI-backed nor extension-only.",
      );

  d.sort((a, b) =>
    [
      a.severity === "error" ? "0" : "1",
      a.category,
      a.code,
      a.subject,
      a.source,
    ]
      .join("\0")
      .localeCompare(
        [
          b.severity === "error" ? "0" : "1",
          b.category,
          b.code,
          b.subject,
          b.source,
        ].join("\0"),
      ),
  );
  return { ok: !d.some((x) => x.severity === "error"), diagnostics: d };
}
export function formatHuman(result: CheckResult): string {
  const lines = result.diagnostics.map(
    (x) =>
      `[${x.severity}] ${x.code} (${x.category}) ${x.subject} — ${x.message} [${x.source}]`,
  );
  lines.push(
    result.ok
      ? `PASS: command contracts agree (${result.diagnostics.length} informational finding(s)).`
      : `FAIL: ${result.diagnostics.filter((x) => x.severity === "error").length} contract error(s).`,
  );
  return lines.join("\n");
}
