# Schema Registry and Validation

Workflow Agent Studio is schema-first. All nodes, workflows, and run outputs are defined by JSON Schemas under `packages/shared/schemas`.

## Structure

- `workflow.schema.json`: Canonical workflow definition (nodes, edges, triggers, metadata).
- `node.schema.json`, `edge.schema.json`, `trigger.schema.json`: Shared primitives referenced by workflows.
- `run.schema.json`: Run record with trigger payload + metadata.
- `step_output.schema.json`: Standard step envelope emitted by executors.
- `nodes/*.node.schema.json`: Per-node config schemas with `x-ui` hints to drive the inspector.

## Registry Endpoint

The API exposes `GET /schemas/nodes`, which serves all node schemas alongside human-friendly metadata (category, description, input/output docs). The frontend consumes this endpoint to render configuration editors and inline validation errors.

## Validation Flow

1. Client builds config using UI driven by node schema `x-ui` hints.
2. API validates node config against the node schema and the workflow against `workflow.schema.json` before persisting.
3. Workers perform a final validation of runtime payloads using the same schemas to guarantee compatibility.

## Adding a new node schema

1. Add a JSON Schema file to `packages/shared/schemas/nodes/<node>.node.schema.json` with an `$id` and `x-ui` hints.
2. Register metadata for the node type in `apps/api/schema_registry.py`.
3. Extend tests in `tests/test_schema_validation.py` with valid and invalid payloads.
