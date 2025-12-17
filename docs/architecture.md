# Architecture Overview

Workflow Agent Studio is structured as a multi-service platform with a shared schema-first contract.

## Components

- **apps/api (FastAPI)**: Control plane that exposes authentication, workflow CRUD, runs, artifacts, schema registry, and RBAC enforcement.
- **apps/worker (Celery)**: Executes workflow steps and reports transitions back to the API.
- **apps/web (Next.js 14 + React Flow + shadcn/ui)**: Builder and observability UI.
- **packages/shared**: Authoritative JSON Schemas, RBAC matrix, and reusable utilities for API, worker, and UI.
- **Postgres**: Primary store for tenants, users, workflows, runs, artifacts, and human tasks.
- **Redis**: Celery broker + cache for idempotency keys and trigger state.
- **Object storage**: Local `./storage` in development (S3-ready abstraction later).

## Control plane vs data plane

- **Control plane**: API + web app. Responsible for authentication, RBAC, workflow design, publishing, and schema discovery. Tenancy and RBAC gates every endpoint.
- **Data plane**: Worker executing DAG steps with tenant-scoped credentials. Workers stream step events back to the API for persistence and observability.

## Execution model

1. A workflow version (validated against `workflow.schema.json`) is published.
2. A trigger (manual, webhook, schedule, or simulated messaging trigger) enqueues a run with tenant + version context.
3. Celery worker performs DAG orchestration (topological order, branch-aware) and emits step envelopes matching `step_output.schema.json`.
4. Runs transition through `QUEUED -> RUNNING -> SUCCEEDED|FAILED|WAITING` with retry + resume support.
5. Human approval tasks pause a run until an approver acts.

## Schema-first approach

The backend serves a schema registry (`GET /schemas/nodes`) powered by files in `packages/shared/schemas/nodes`. The frontend consumes the same registry to auto-render inspectors and validation. All workflow payloads are validated at the edge before persistence.

## Tenancy and RBAC

JWTs encode `tenant_id` and `role`. Every query and artifact download is scoped by `tenant_id`. RBAC rules live in `packages/shared/rbac/permissions.py` and are enforced by dependency injection middleware on the API routes. UI feature flags reuse the same map to hide disallowed controls.
