# Testing Strategy

Tests are split by layer to mirror the platform architecture. All suites run from `make test`.

## Layers

1. **Schema tests**: Compile every JSON Schema, validate valid/invalid examples, and guard workflow structure constraints.
2. **API unit tests**: Exercise utilities (RBAC matrix, schema registry endpoint) with FastAPI's `TestClient`.
3. **Integration and UI**: Future suites will spin up Postgres/Redis via Testcontainers, run the FastAPI app + Celery worker, and drive the Next.js UI via Playwright.

## Commands

- `make test-fast`: Run schema + API unit tests for quick feedback.
- `make test`: Full suite hook (currently maps to `pytest` and will be expanded to include frontend + e2e once those packages are scaffolded).

## Determinism

All schema fixtures use deterministic payloads and avoid network access to keep CI friendly.
