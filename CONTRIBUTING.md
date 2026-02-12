# Contributing

## Branch Workflow

All changes go through pull requests — **never push directly to `main`**.

1. Create a feature branch from `main`:
   ```bash
   git checkout main && git pull
   git checkout -b feature/your-feature-name
   ```
2. Make your changes and commit.
3. Push and open a pull request:
   ```bash
   git push -u origin feature/your-feature-name
   ```
4. Wait for CI to pass and request a review.
5. Merge via GitHub once approved.

### Branch Naming

| Prefix | Use |
|--------|-----|
| `feature/` | New functionality |
| `fix/` | Bug fixes |
| `docs/` | Documentation only |
| `refactor/` | Code restructuring with no behavior change |

## Tests

- **JavaScript** — run with `npm test` (vitest). Tests live in `tests/experiment/`.
- **R** — run with `Rscript cleaning/tests/run_tests.R` (testthat). Tests live in `cleaning/tests/testthat/`.

Add or update tests whenever you change experiment logic or cleaning functions.

## Code Style

- **JavaScript:** ES modules, `const`/`let` (no `var`), descriptive names.
- **R:** tidyverse style, pipe-based workflows, document functions with `#'` comments.
