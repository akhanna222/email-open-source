# Port Mappings

Updated ports to avoid conflicts with existing services:

| Service  | Old Port | New Port | Access URL                      |
|----------|----------|----------|---------------------------------|
| Postgres | 5432     | **5433** | `localhost:5433`               |
| Redis    | 6379     | **6380** | `localhost:6380`               |
| API      | 8000     | **8083** | `http://localhost:8083/health` |
| Web      | 3000     | **3001** | `http://localhost:3001`        |

## Bootstrap Script Update

If using `bootstrap-workflow-agent.sh`, update the health check URL on line 80:

```bash
# Change from:
wait_for_health "http://localhost:8000/health"

# To:
wait_for_health "http://localhost:8083/health"
```

And update the final output line:

```bash
# Change from:
log "API:    http://localhost:8000/health"

# To:
log "API:    http://localhost:8083/health"
```

## Database Connection

Update your `.env` file to use the new Postgres port:

```env
POSTGRES_HOST=localhost
POSTGRES_PORT=5433
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/workflow_agent
```

## Testing

After starting services:
- API: `curl http://localhost:8083/health`
- Web: Open browser to `http://localhost:3001`
- Postgres: `psql -h localhost -p 5433 -U postgres -d workflow_agent`
- Redis: `redis-cli -p 6380`
