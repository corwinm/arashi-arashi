# Git Worktree API Research - Validation Plan

**Feature**: 002-git-worktree-research  
**Purpose**: Define validation methodology for research.md documentation  
**Created**: Tue Feb 03 2026  
**Test Repository**: /tmp/git-worktree-test

## Validation Methodology

### 1. Command Validation Approach

For each git worktree command documented in research.md:

1. **Read Documentation**: Review syntax and examples from research.md
2. **Execute Examples**: Run documented examples in test repository
3. **Verify Output**: Compare actual output with documented behavior
4. **Test Variations**: Try documented flags and options
5. **Document Results**: Record any discrepancies or confirmations
6. **Update if Needed**: Correct research.md if inaccuracies found

### 2. Version Verification Approach

1. **Check Local Git Version**: Determine installed git version
2. **Cross-Reference Documentation**: Verify claims against official git docs
3. **Test Available Features**: Validate version-specific features work as documented
4. **Document Availability**: Record which features are available on current system

### 3. Repository Type Testing Approach

1. **Create Regular Repository**: Test worktree behavior in regular repo
2. **Create Bare Repository**: Test worktree behavior in bare repo
3. **Compare Structures**: Verify documented differences are accurate
4. **Document Observations**: Record actual vs documented behavior

### 4. Location Strategy Testing Approach

1. **Test Each Strategy**: Create worktrees using documented location patterns
2. **Evaluate Pros/Cons**: Verify documented advantages and disadvantages
3. **Assess Recommendations**: Validate recommended approach is sensible
4. **Document Findings**: Record practical observations

### 5. Error Scenario Testing Approach

1. **Attempt to Reproduce**: Try to trigger documented error conditions
2. **Verify Error Messages**: Compare actual error text with documentation
3. **Test Resolutions**: Validate documented fixes work as described
4. **Document Limitations**: Note any errors that cannot be easily reproduced

### 6. Remote Tracking Testing Approach

1. **Test Scenarios**: Execute documented remote tracking setups
2. **Verify Behavior**: Confirm tracking works as documented
3. **Test Commands**: Validate documented commands produce expected results
4. **Document Findings**: Record any deviations from documentation

### 7. File Format Inspection Approach

1. **Create Worktrees**: Generate actual worktree structures
2. **Inspect Files**: Examine .git files and metadata directories
3. **Verify Format**: Compare actual format with documentation
4. **Document Structure**: Confirm documented structure matches reality

## Test Environment

### System Information

- **Git Version**: 2.50.1 (Apple Git-155)
- **Operating System**: macOS (detected from output paths)
- **Filesystem**: Case-insensitive by default on macOS
- **Test Repository**: /tmp/git-worktree-test

### Available Features

Based on git version 2.50.1, all features documented in research.md are available:

✅ **git worktree add** - Available since 2.5.0  
✅ **git worktree list** - Available since 2.5.0  
✅ **git worktree prune** - Available since 2.5.0  
✅ **git worktree lock** - Available since 2.7.0  
✅ **git worktree unlock** - Available since 2.7.0  
✅ **git worktree move** - Available since 2.17.0  
✅ **git worktree remove** - Available since 2.22.0  

**Conclusion**: All 7 documented commands are available and can be fully validated on this system.

## Validation Criteria

### Success Criteria

- All documented commands execute without errors in test environment
- Command outputs match documented behavior
- Version information is accurate and verified
- Repository type differences are confirmed through testing
- Error scenarios can be understood even if not all can be reproduced
- Remote tracking behavior matches documentation
- File format documentation reflects actual git implementation

### Failure Criteria

- Documented syntax causes errors
- Actual behavior significantly differs from documentation
- Version information is incorrect or misleading
- Repository type differences are inaccurate
- Error resolutions don't work as documented
- Remote tracking documentation is incorrect
- File format documentation doesn't match reality

## Documentation Update Protocol

When inaccuracies are found:

1. **Document the Issue**: Record specific discrepancy in validation.md
2. **Research Correct Information**: Consult official git documentation
3. **Update research.md**: Correct the inaccurate information
4. **Note the Change**: Add note in validation.md about what was corrected
5. **Re-validate**: Verify the correction is accurate

## Validation Phases

1. **Phase 1-2**: Setup and foundational checks
2. **Phase 3-5**: P1 user stories (core commands, versions, repo types)
3. **Phase 6-8**: P2 user stories (locations, errors, remote tracking)
4. **Phase 9**: P3 user story (.git file format)
5. **Phase 10**: Edge cases and best practices
6. **Phase 11**: Final validation and success criteria verification

## Notes

- Not all error scenarios can be easily reproduced (e.g., disk space)
- Some features may not be available depending on git version
- Cross-platform differences will be noted where applicable
- Validation focuses on accuracy, not exhaustive testing of git itself
