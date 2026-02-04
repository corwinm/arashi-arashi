# Data Model: Logger Utilities

**Feature**: 006-logger-utilities  
**Date**: 2026-02-04

## Overview

Logger Utilities is a pure output library with no persistent data model. All entities are runtime concepts.

## Entities

### Message
- `text` (string): Message content
- `level` (enum): info | success | warn | error
- `styled` (boolean): Whether colors/symbols applied

### Spinner (Ora Instance)
- `text` (string): Current spinner text
- `isSpinning` (boolean): Whether actively spinning
- `symbol` (string): Spinner character sequence

### Table
- `data` (array): Array of row objects
- `columns` (array): Derived column names
- `widths` (array): Computed column widths

### Section
- `title` (string): Section heading text
- `level` (number): Nesting level (for future use)

## NO_COLOR Support

When `process.env.NO_COLOR` is set:
- All colors stripped
- Unicode symbols replaced with ASCII
- Spinners use simple dots
