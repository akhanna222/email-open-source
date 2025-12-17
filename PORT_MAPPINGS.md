# Port Mappings

Updated ports to avoid conflicts with existing services (using high-numbered ports):

| Service  | Old Port | New Port  | Access URL                       |
|----------|----------|-----------|----------------------------------|
| Postgres | 5432     | **15432** | `localhost:15432`               |
| Redis    | 6379     | **16379** | `localhost:16379`               |
| API      | 8000     | **18000** | `http://localhost:18000/health` |
| Web      | 3000     | **13000** | `http://localhost:13000`        |

## Bootstrap Script

The `bootstrap-workflow-agent.sh` script is already configured with the correct ports.

## Database Connection

Update your `.env` file to use the new Postgres port:

```env
POSTGRES_HOST=localhost
POSTGRES_PORT=15432
DATABASE_URL=postgresql://postgres:postgres@localhost:15432/workflow_agent
```

## Testing

After starting services:
- API: `curl http://localhost:18000/health`
- Web: Open browser to `http://localhost:13000`
- Postgres: `psql -h localhost -p 15432 -U postgres -d workflow_agent`
- Redis: `redis-cli -p 16379`
