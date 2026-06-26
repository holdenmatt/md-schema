# Agent Guidelines

- Only export symbols from `src/index.ts` when they are intended to be supported by package consumers.
- Keep the public API small; prefer internal modules until a symbol needs to be consumed externally.
- Use named exports only; no default exports.
- Add or update tests for behavior changes.
- Run `pnpm check` before committing.
