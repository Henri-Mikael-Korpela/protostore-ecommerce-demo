# TypeScript Programming Style Guide

## Indentation

- Use 4 spaces for indentation. Do not use tabs.

## Paradigms

- Prefer imperative and procedural style over declarative and functional style. In embedded logic in JSX elements functional style is fine.

## Objects

- Separate each property assigned in an object on its own line.
  - Exception: One or two object properties assigned in a for statement may be put on the same line.
- Use trailing comma for assigned properties.

## Functions

- For functions composing a value as a return value using conditions and loops, place the variable for the return value in the beginning of the function with an empty line after it. For the single return statement at the end, ensure there's an empty line above it.

## React Components

- Use function components only, never class components.
- Place statements in a function component in the following order:
  - Hooks
  - States
  - Effects
