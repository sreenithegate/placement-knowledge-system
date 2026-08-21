# Repository Guidelines

## Project Structure & Module Organization

This repository is currently unscaffolded. As implementation begins, keep the
top level focused on configuration and documentation. Use a predictable layout:

- `src/` for application or library code, organized by feature or domain.
- `tests/` for automated tests that mirror the relevant `src/` paths.
- `assets/` for static files such as images, fixtures, or templates.
- `docs/` for architecture notes and contributor-facing documentation.

Avoid placing generated output, local environments, or credentials under source
control. Add them to `.gitignore` when the relevant tooling is introduced.

## Build, Test, and Development Commands

No build system or package manifest is present yet. When adding one, document
the canonical commands in the project README and keep them reproducible from a
fresh checkout. Prefer a small set of commands such as `npm run dev`, `npm test`,
and `npm run build`, or their equivalent for the selected stack.

Run the formatter, linter, and complete test suite before opening a pull
request. Do not rely on machine-specific paths or unchecked global tools.

## Coding Style & Naming Conventions

Use the formatter and linter configured by the project rather than manual style
choices. Keep indentation consistent within each language (two spaces for
JavaScript/TypeScript unless the formatter says otherwise). Name directories and
files in `kebab-case`; use `PascalCase` for exported components/classes and
`camelCase` for functions and variables. Prefer focused modules with explicit,
descriptive names.

## Testing Guidelines

Add tests alongside each feature and cover normal behavior, validation failures,
and boundary cases. Use descriptive test names that state the expected outcome,
for example: `creates an application when required fields are valid`. Keep test
data small and deterministic; never depend on production services or secrets.

## Commit & Pull Request Guidelines

Git history is not available in this working directory, so no established commit
convention can be inferred. Use imperative, scoped commit subjects such as
`feat(auth): add sign-in validation` or `fix(api): handle empty responses`.

Pull requests should explain the change and its motivation, link related issues,
list verification performed, and include screenshots for user-visible changes.
Keep each pull request narrow enough for straightforward review.
