# Data Model: Windows CLI Compatibility

## Entities

### Runtime Environment

- **Fields**: osName, osVersion, shellName, shellVersion, pathSeparator, isWindows
- **Validation**: osName and shellName required; isWindows derived from osName
- **Relationships**: Used by CLI Launcher to select launch path

### CLI Launcher

- **Fields**: entrypointName, supportedShells, fallbackShell, errorMessageTemplate
- **Validation**: supportedShells non-empty; fallbackShell must be one of supportedShells
- **Relationships**: Reads Runtime Environment; emits errors for unsupported contexts

### Install Context

- **Fields**: installScope (global/local), binPath, packageRoot
- **Validation**: installScope required; binPath must be resolvable
- **Relationships**: Provided to CLI Launcher for locating the correct wrapper

## Relationships Summary

- Runtime Environment and Install Context inform CLI Launcher decisions.
- CLI Launcher emits a launch outcome used to present success or failure guidance.
