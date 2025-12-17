# Workflow Agent Studio

A schema-first, multi-tenant workflow automation platform for messaging + AI agents. This repository provides an initial scaffold for the FastAPI backend, Celery worker, shared JSON Schemas, and Next.js UI shell.

## Structure

- `apps/api`: FastAPI application with schema registry and RBAC utilities.
- `apps/worker`: Celery worker placeholder for orchestrating workflow steps.
- `apps/web`: Next.js UI placeholder (builder, runs, approvals).
- `packages/shared`: Canonical JSON Schemas and RBAC matrix shared across services.
- `docs`: Architecture, schemas, RBAC, and testing notes.

## Getting started

1. Install Python 3.11+ and Node.js 18+.
2. Create a virtual environment and install backend dependencies:

   ```bash
   pip install -r requirements-dev.txt
   ```

3. Run the API locally:

   ```bash
   uvicorn apps.api.main:app --reload
   ```

4. Hit the schema registry endpoint:

   ```bash
   curl http://localhost:8000/schemas/nodes | jq
   ```

## Testing

- `make test-fast` — schema + API unit tests.
- `make test` — placeholder full suite (expands as the platform evolves).

## Environment

Copy `.env.example` to `.env` and adjust values for local development.

## Docker Compose

`docker-compose.yml` contains service definitions for Postgres, Redis, API, worker, and web. Update image tags as the implementation grows.
