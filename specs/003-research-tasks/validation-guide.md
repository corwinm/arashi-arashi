# User Story 1 Validation Guide

## Overview

This guide provides instructions for manually validating the CLI Framework Documentation (User Story 1). These tests verify that the documentation in `research.md` is clear, complete, and actionable enough for developers to implement features without additional context.

**Target**: Success Criterion SC-001 - Developer can implement a CLI command in <30 minutes using only research.md

## Test Environment Setup

1. Create a new test directory:
   ```bash
   mkdir ~/arashi-validation-test
   cd ~/arashi-validation-test
   bun init -y
   ```

2. Install dependencies:
   ```bash
   bun add commander @inquirer/prompts ora chalk
   bun add -d @types/node
   ```

3. Create `tsconfig.json`:
   ```json
   {
     "compilerOptions": {
       "target": "ES2022",
       "module": "ES2022",
       "moduleResolution": "bundler",
       "strict": true,
       "esModuleInterop": true,
       "skipLibCheck": true,
       "forceConsistentCasingInFileNames": true
     }
   }
   ```

## Validation Tests

### Test T022: Implement Subcommand Using Documented Patterns

**Goal**: Verify that Section 1.1 (Commander.js patterns) provides enough information to implement a CLI subcommand.

**Task**: Using only `research.md` Section 1.1, implement a CLI with the following commands:
- `hello` - Prints "Hello, World!"
- `greet <name>` - Greets a person by name
- `greet <name> --formal` - Greets a person formally

**Time Limit**: 15 minutes

**Success Criteria**:
- [ ] Developer completes task within time limit
- [ ] Developer does NOT need to reference external documentation
- [ ] CLI accepts commands and options correctly
- [ ] Help text works with `--help`

**Implementation File**: `cli-test.ts`

**Expected Questions**: None. If developer asks questions, document them.

**Test Command**:
```bash
bun run cli-test.ts hello
bun run cli-test.ts greet Alice
bun run cli-test.ts greet Bob --formal
bun run cli-test.ts --help
```

**Pass/Fail**:
- **PASS**: Developer completes within 15 minutes without asking questions
- **FAIL**: Developer exceeds 15 minutes OR asks clarifying questions

---

### Test T023: Implement Prompts Using Documented Patterns

**Goal**: Verify that Section 1.2 (@inquirer/prompts patterns) provides enough information to implement interactive prompts.

**Task**: Using only `research.md` Section 1.2, implement an interactive script that:
1. Prompts user to select a branch from a list (use mock data: `main`, `develop`, `feature/new-ui`)
2. Asks for confirmation before proceeding
3. Prompts for a commit message with validation (min 3 characters)
4. Prints the collected information

**Time Limit**: 15 minutes

**Success Criteria**:
- [ ] Developer completes task within time limit
- [ ] Developer does NOT need to reference external documentation
- [ ] Select prompt works with arrow keys
- [ ] Confirm prompt accepts y/n
- [ ] Input validation works correctly

**Implementation File**: `prompts-test.ts`

**Expected Questions**: None. If developer asks questions, document them.

**Test Command**:
```bash
bun run prompts-test.ts
```

**Pass/Fail**:
- **PASS**: Developer completes within 15 minutes without asking questions
- **FAIL**: Developer exceeds 15 minutes OR asks clarifying questions

---

### Test T024: Implement Spinners Using Documented Patterns

**Goal**: Verify that Section 1.3 (ora patterns) provides enough information to implement loading spinners.

**Task**: Using only `research.md` Section 1.3, implement a function that:
1. Shows a spinner with text "Step 1/3: Fetching data"
2. Simulates work for 1 second
3. Updates text to "Step 2/3: Processing"
4. Simulates work for 1 second
5. Updates text to "Step 3/3: Saving"
6. Simulates work for 1 second
7. Shows success message "Operation complete"

**Time Limit**: 10 minutes

**Success Criteria**:
- [ ] Developer completes task within time limit
- [ ] Developer does NOT need to reference external documentation
- [ ] Spinner animates correctly
- [ ] Text updates during operation
- [ ] Success message displays with checkmark

**Implementation File**: `spinner-test.ts`

**Expected Questions**: None. If developer asks questions, document them.

**Test Command**:
```bash
bun run spinner-test.ts
```

**Pass/Fail**:
- **PASS**: Developer completes within 10 minutes without asking questions
- **FAIL**: Developer exceeds 10 minutes OR asks clarifying questions

---

### Test T025: Implement Colored Output Using Documented Patterns

**Goal**: Verify that Section 1.4 (chalk patterns) provides enough information to implement colored terminal output.

**Task**: Using only `research.md` Section 1.4, implement a script that prints:
1. A success message in green with checkmark
2. An error message in red with X symbol
3. A warning message in orange with warning symbol
4. An info message in blue with info symbol
5. A code snippet with background and color (e.g., a file path)

**Time Limit**: 10 minutes

**Success Criteria**:
- [ ] Developer completes task within time limit
- [ ] Developer does NOT need to reference external documentation
- [ ] All colors display correctly
- [ ] Symbols appear correctly
- [ ] Code uses semantic color functions (not direct chalk calls)

**Implementation File**: `colors-test.ts`

**Expected Questions**: None. If developer asks questions, document them.

**Test Command**:
```bash
bun run colors-test.ts
```

**Pass/Fail**:
- **PASS**: Developer completes within 10 minutes without asking questions
- **FAIL**: Developer exceeds 10 minutes OR asks clarifying questions

---

## Validation Checklist

After completing all tests, answer these questions:

### Documentation Quality
- [ ] Was the code structure clear and easy to follow?
- [ ] Were the examples complete and runnable?
- [ ] Were best practices highlighted effectively?
- [ ] Were common pitfalls mentioned?

### Completeness
- [ ] Did the documentation cover all necessary topics?
- [ ] Were there any missing pieces of information?
- [ ] Did the developer need external documentation?

### Clarity
- [ ] Were instructions clear and unambiguous?
- [ ] Were technical terms explained adequately?
- [ ] Was the difficulty level appropriate?

### Success Criteria Validation
- [ ] **SC-001**: Developer can implement CLI command in <30 minutes using only research.md
  - Total time for all 4 tests: _____ minutes (target: <30 minutes)
  - Number of questions asked: _____ (target: 0)

## Results Reporting

Fill out the following for each test:

### T022: Subcommand Implementation
- **Time**: _____ minutes
- **Questions**: _____ (list them)
- **Status**: PASS / FAIL
- **Notes**: 

### T023: Prompts Implementation
- **Time**: _____ minutes
- **Questions**: _____ (list them)
- **Status**: PASS / FAIL
- **Notes**: 

### T024: Spinners Implementation
- **Time**: _____ minutes
- **Questions**: _____ (list them)
- **Status**: PASS / FAIL
- **Notes**: 

### T025: Colors Implementation
- **Time**: _____ minutes
- **Questions**: _____ (list them)
- **Status**: PASS / FAIL
- **Notes**: 

## Overall Assessment

**Total Time**: _____ minutes  
**Total Questions**: _____  
**Tests Passed**: _____ / 4  
**SC-001 Status**: PASS / FAIL

**Recommendations for Documentation Improvements**:
1. 
2. 
3. 

**Signature**: _____________________  
**Date**: _____________________
