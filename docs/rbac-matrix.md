# RBAC Matrix

The following matrix is the single source of truth for API and UI permissions. All enforcement derives from `packages/shared/rbac/permissions.py`.

## Role definitions

- **Admin**: Full access across tenant resources.
- **Builder**: Designs and publishes workflows; limited to their tenant.
- **Operator**: Operates published workflows (run, retry, cancel, approvals).
- **Viewer**: Read-only to published workflows, runs, and artifacts.

## Endpoint & Action Coverage

| Resource / Action          | Admin | Builder | Operator | Viewer |
| -------------------------- | :---: | :-----: | :------: | :----: |
| Tenant (create/read/update/delete) | ✅ | 🚫 | 🚫 | 🚫 |
| Users (create/read/update/delete) | ✅ | 🚫 | 🚫 | 🚫 |
| Workflows (create/read/update/delete) | ✅ | ✅ | 🛈 (read) | 🛈 (read) |
| Publish / Rollback         | ✅ | ✅ | 🚫 | 🚫 |
| Runs: start                | ✅ | ✅ | ✅ | 🚫 |
| Runs: retry / cancel       | ✅ | ✅ | ✅ | 🚫 |
| Runs: read                 | ✅ | ✅ | ✅ | ✅ |
| Steps: read                | ✅ | ✅ | ✅ | ✅ |
| Human approvals: approve/reject | ✅ | 🚫 | ✅ | 🚫 |
| Artifacts: read/download   | ✅ | ✅ | ✅ | ✅ |
| Credentials: manage        | ✅ | ✅ | 🚫 | 🚫 |
| Audit events: read         | ✅ | ✅ | ✅ | 🚫 |

`🛈` indicates read-only access. Any action not explicitly allowed is denied.

## UI implications

- Disabled buttons and hidden affordances mirror backend checks to prevent broken flows.
- The schema registry and node palette are accessible to all authenticated roles to allow exploratory browsing, but only Builder/Admin can save drafts.

## Tests

Permission tests should be generated from the shared matrix to avoid divergence between API and UI. See `tests/test_rbac_matrix.py` for an example of validating all entries.
