# Java Programming Style Guide

## Source files

- Use UTF-8 encoding.

### Layout

Java files should have items in the following sections, in this order:

- License of copyright information, if present
- Package declaration
- Import statements
- Only one top-level class declaration

Place exactly one empty line to separate each section.

## Indentation

- Use 4 spaces for indentation. Do not use tabs.

## Imports

- Do not use module imports since, as of 27th of October 2026, it is a preview feature.
- Do not use wildcard imports, static or non-static.

## Escape sequences

- Do not use octal or Unicode escape sequences for special character escape sequences (`\b`, `\t`, `\n`, `\f`, `\r`, `\s`, `\"`, `\'` and `\\`).
