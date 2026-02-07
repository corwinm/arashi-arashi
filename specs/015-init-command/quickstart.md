# Quickstart: Init Command

**Feature**: 015-init-command  
**Audience**: Arashi users  
**Purpose**: Quick reference for initializing Arashi in your project

## What is `arashi init`?

The `init` command sets up Arashi in your git repository. It creates the necessary workspace structure, configuration files, and discovers any existing repositories you're managing.

**Think of it as**: The "git init" equivalent for Arashi - you run it once to prepare your project.

---

## Basic Usage

### First-Time Setup

```bash
cd /path/to/your/project
arashi init
```

**What happens**:
1. ✅ Validates you're in a git repository
2. ✅ Creates `.arashi/` directory for configuration
3. ✅ Generates default `config.json`
4. ✅ Creates `repos/` directory for managed repositories
5. ✅ Adds `repos/` to `.gitignore` automatically
6. ✅ Discovers any existing repos in `repos/`
7. ✅ Creates example hook templates

**Output**:
```text
✓ Initialized Arashi workspace

Created:
  • Configuration: /Users/you/project/.arashi/config.json
  • Hooks directory: /Users/you/project/.arashi/hooks/
  • Repositories directory: /Users/you/project/repos/

Discovered 0 repositories

Updated .gitignore to exclude: repos/

Next steps:
  • Create a worktree: arashi create <branch-name>
  
Completed in 0.3s
```

---

## Common Scenarios

### Scenario 1: You already have repos in a directory

If you have existing repositories in `repos/`, Arashi discovers them automatically:

```bash
project/
├── .git/
└── repos/
    ├── frontend/  (git repo)
    ├── backend/   (git repo)
    └── shared/    (git repo)
```

```bash
$ arashi init

✓ Initialized Arashi workspace

Discovered 3 repositories:
  • frontend (main)
  • backend (main)
  • shared (develop)

Completed in 1.2s
```

---

### Scenario 2: Custom repos location

Want to use a different directory name?

```bash
arashi init --repos-dir ./submodules
```

Now Arashi will manage repositories in `submodules/` instead of `repos/`.

**Use cases**:
- Existing project structure uses different naming
- Multiple sets of repositories
- Company/team conventions

---

### Scenario 3: Large workspace (skip discovery)

Have hundreds of repos and don't need them all cataloged immediately?

```bash
arashi init --no-discover
```

**Benefits**:
- ⚡ Much faster initialization
- 🎯 Add repos manually as needed with `arashi add`
- 💾 Smaller initial config file

**You'll add repos later**:
```bash
arashi add ./repos/my-app
arashi add ./repos/my-api
```

---

### Scenario 4: Reinitialize (reset configuration)

Made a mistake or want to start fresh?

```bash
arashi init --force
```

**What happens**:
- ⚠️ Backs up existing config: `.arashi/config.json.backup-{timestamp}`
- ✨ Creates fresh configuration
- 🔍 Rediscovers repositories

**Warning**: This doesn't delete worktrees, just resets Arashi's configuration.

---

## What Gets Created

### Directory Structure

```text
your-project/
├── .arashi/                    ← Arashi workspace
│   ├── config.json             ← Configuration file
│   └── hooks/                  ← Hook examples
│       ├── pre-create.sh.example
│       ├── post-create.sh.example
│       └── setup.sh.example
├── repos/                      ← Managed repositories
│   └── (your git repos)
└── .gitignore                  ← Updated automatically
```

### Configuration File

`.arashi/config.json`:

```json
{
  "version": "1.0.0",
  "repos_dir": "./repos",
  "auto_setup": true,
  "discovered_repos": {
    "my-app": {
      "path": "./repos/my-app",
      "default_branch": "main",
      "is_bare": false,
      "worktrees": []
    }
  }
}
```

**Fields explained**:
- `version`: Config format version (for future migrations)
- `repos_dir`: Where your managed repos live
- `auto_setup`: Run setup hooks automatically (yes/no)
- `discovered_repos`: Cataloged repositories with metadata

---

## Common Errors

### Error: Not a git repository

```text
✗ Error: Not a git repository

The current directory is not a git repository.
Run 'git init' first, or 'cd' to a git repository.
```

**Fix**: Initialize git first
```bash
git init
arashi init
```

---

### Error: Configuration already exists

```text
✗ Error: Arashi configuration already exists

To reinitialize, use: arashi init --force
```

**Fix**: Use `--force` flag
```bash
arashi init --force
```

---

### Error: Permission denied

```text
✗ Error: Permission denied

Cannot create directory: /path/.arashi
```

**Possible causes**:
1. Directory owned by different user
2. Read-only filesystem
3. Parent directory doesn't allow writes

**Fix**: Check permissions
```bash
ls -la .
chmod u+w .  # Add write permission
```

---

## Next Steps After Init

### 1. Create Your First Worktree

```bash
arashi create feature/my-feature
```

Creates worktrees in all discovered repos for branch `feature/my-feature`.

### 2. Customize Hook Examples (Optional)

Copy and enable hooks for custom automation:

```bash
# Copy example to active hook
cp .arashi/hooks/post-create.sh.example .arashi/hooks/post-create.sh

# Make executable
chmod +x .arashi/hooks/post-create.sh

# Edit to add your commands
vim .arashi/hooks/post-create.sh
```

**Hook ideas**:
- `post-create.sh`: Run `npm install` in each worktree
- `setup.sh`: Copy environment config files
- `pre-create.sh`: Validate branch name format

### 3. Add More Repositories

If you used `--no-discover` or want to add repos outside repos directory:

```bash
arashi add ./path/to/repo
```

---

## Tips & Best Practices

### ✅ DO

- ✅ Run `init` once per project
- ✅ Commit `.arashi/config.json` to version control
- ✅ Keep hook examples (`.example` files) in version control
- ✅ Use `--force` cautiously (backs up config but disrupts team)

### ❌ DON'T

- ❌ Delete `.arashi/` manually (use `arashi destroy` if needed)
- ❌ Edit `config.json` directly (use `arashi` commands instead)
- ❌ Commit `repos/` directory (it's in .gitignore for good reason)
- ❌ Run `init` in subdirectories (run at repository root only)

---

## Reference

### Full Command Syntax

```bash
arashi init [options]
```

### Options

| Option | Description | Default |
|--------|-------------|---------|
| `--repos-dir <path>` | Custom repos location | `./repos` |
| `--force` | Overwrite existing config | `false` |
| `--no-discover` | Skip repository discovery | `false` |
| `--auto-setup` | Enable auto setup hooks | `true` |

### Exit Codes

| Code | Meaning |
|------|---------|
| 0 | Success |
| 1 | Not in git repository |
| 2 | Config already exists (use --force) |
| 3 | Permission denied |
| 4 | Disk full |
| 5 | Invalid path |

---

## Examples

### Example 1: New Project

Starting fresh with Arashi:

```bash
# Create project
mkdir my-project && cd my-project
git init

# Initialize Arashi
arashi init

# Clone your repos into repos/
cd repos
git clone git@github.com:you/frontend.git
git clone git@github.com:you/backend.git
cd ..

# Rediscover (updates config with new repos)
arashi init --force

# Create worktrees
arashi create feature/new-feature
```

---

### Example 2: Existing Project

Adding Arashi to existing project with repos:

```bash
# You have this structure:
# project/
# ├── frontend/  (git repo)
# ├── backend/   (git repo)
# └── .git/

# Move repos into repos/ directory
mkdir repos
mv frontend repos/
mv backend repos/

# Initialize Arashi (discovers moved repos)
arashi init

# Start using coordinated worktrees
arashi create feature/my-feature
```

---

### Example 3: Monorepo with Many Services

Large project with many microservices:

```bash
# Fast init without discovery
arashi init --no-discover --repos-dir ./services

# Add services you actively develop
arashi add ./services/auth-service
arashi add ./services/api-gateway
arashi add ./services/user-service

# Others remain unmanaged (you can add later)
```

---

## Troubleshooting

### Init hangs during discovery

**Symptom**: Command seems stuck after "Discovering repositories..."

**Cause**: Large number of nested directories in repos/

**Fix**: Use `--no-discover` and add repos manually
```bash
# Cancel with Ctrl+C
arashi init --no-discover
```

---

### Can't find repos after init

**Symptom**: `config.json` shows `"discovered_repos": {}`

**Causes**:
1. Used `--no-discover` flag
2. Repos not in configured `repos_dir`
3. Directories don't contain `.git`

**Fix**: Verify repo structure
```bash
# Check what's in repos directory
ls -la repos/

# Check for .git directories
ls -la repos/*/.git

# Manually add if needed
arashi add ./repos/my-repo
```

---

## FAQ

**Q: Do I need to run `init` for every repository?**  
A: No! Run it once in your main/parent repository. Arashi manages multiple child repositories from one config.

**Q: What if I delete `.arashi/` by accident?**  
A: Just run `arashi init --force` to recreate it. Your worktrees won't be affected.

**Q: Can I have multiple `.arashi/` configs?**  
A: No, one per git repository. But you can manage different sets of repos in different parent repos.

**Q: Is `.arashi/config.json` safe to commit?**  
A: Yes! It's recommended. Just don't commit `repos/` directory itself.

**Q: What if my team member hasn't run `init`?**  
A: They should run `arashi init` after cloning. The config is tracked, so it'll match yours.

---

## Related Commands

- `arashi create <branch>` - Create coordinated worktrees
- `arashi add <path>` - Add repository to configuration
- `arashi list` - Show all worktrees
- `arashi status` - Check worktree status

---

## Getting Help

- Full documentation: `arashi init --help`
- Report issues: GitHub issues
- Ask questions: Discussions tab
