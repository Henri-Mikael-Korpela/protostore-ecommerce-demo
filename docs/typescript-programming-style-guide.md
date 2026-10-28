# TypeScript Programming Style Guide

## Indentation

- Use 4 spaces for indentation. Do not use tabs.

## Imports

Place the import statements in the following sections, in the following order:
  - Standard library imports
  - 3rd party or external imports
  - Project specific local imports
    - TypeScript files
    - CSS files

Each of these sections should be separated by an empty line.

## Paradigms

- Prefer imperative and procedural style over declarative and functional style. In embedded logic in JSX elements functional style is fine.

## Control flow

- Use exhaustive checks in `switch` statements. Do not provide a default case for this will be bypass the exhaustive check.

## Objects

- Separate each property assigned in an object on its own line.
  - Exception: One or two object properties assigned in a for statement may be put on the same line.
- Use trailing comma for assigned properties.

## Functions

- Return from a function without a result variable whenever you can.
- For functions composing a value as a return value using conditions and loops, place the variable for the return value in the beginning of the function with an empty line after it. For the single return statement at the end, ensure there's an empty line above it.

## Null and undefined values

- Use `null` as an explicit, deliberate indication of a missing value that crosses the API boundary:
  - JSON properties with null values are preserved (instead of omitted when `undefined` is used), matching Java's `null`.
  - Project specific Java DTO plugin is able to generate `null` as part of a union type in TypeScript for `@Nullable` fields and for type `Optional<T>`.
- Use `undefined` for logic that stays in the TypeScript code:
  - For optional parameters and properties.

## Errors and exception handling

- Avoid exception handling whenever possible. Prefer errors as values.
- Return a `Result<T, E>` (see `frontend/src/result.ts`) from an operation that can fail.
- Convert exceptions of APIs that throw, such as `fetch` and `JSON.parse`, to error values right where the API is called.
- Model the kinds of errors as a discriminated union, e.g. `ApiError` in `frontend/src/api.ts`, and handle them with an exhaustive checks.
- Validate untrusted data, such as API responses and local storage contents, at runtime with the validators in `frontend/src/validation.ts` instead of asserting its type with `as`.
- Only throw and reject with `Error` objects, so that a stack trace is preserved. Pass the original error as `cause` when wrapping it: `new Error("message", { cause: error })`.
- Treat caught errors as `unknown` and narrow their type before use.

## Asynchronous programming

- Use `async`/`await` instead of `.then()` and `.catch()` chains.
- Handle every promise: await it, return it, or mark it explicitly ignored with the `void` operator.
- Use `void` only for a promise of an async function that handles its own errors and never rejects. Document that it never rejects in the function's doc comment.
- Inside a `try` block, use `return await` instead of `return` when returning a promise, so its rejection is caught by the `catch` block.
- In effects, ignore results of asynchronous work that finishes after the effect is cleaned up, so outdated results don't overwrite newer ones.

## CSS Styling

- Put the styles of a component in a CSS module (`Component.module.css`) next to the component and import it as `styles`. Class names of a CSS module are local to it, so they can't affect other components.
- Name the classes in camelCase (`styles.siteHeader`), and name them by their role in the component (`styles.title`), not by the component's name.
- Put only styles that are common to the whole app in `frontend/src/index.css`: CSS variables, element resets and the classes shared by several components.
- Don't find elements by their CSS module class names in code, the names are renamed on build. Use a `data-` attribute or an ID.

## React Components

- Use function components only, never class components.
- Place statements in a function component in the following order:
  - Hooks
  - States
  - Effects
