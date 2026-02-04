# Data Model: Prompt Utilities

**Feature**: 007-prompt-utilities  
**Date**: 2026-02-04

## Overview

Prompt Utilities is a pure input library with no persistent data model.

## Entities

### Prompt
- `message` (string): Question displayed to user
- `type` (enum): confirm | select | multiSelect | input
- `defaultValue` (any): Pre-selected/filled value

### Choice<T>
- `value` (T): Actual value returned when selected
- `name` (string): Display label
- `description` (string?): Optional help text

### Input
- `value` (string | boolean | T | T[]): User's response
- `aborted` (boolean): Whether user pressed Ctrl+C

## Ctrl+C Handling

All prompts throw on Ctrl+C. Wrapper functions catch and call `process.exit(2)`.
