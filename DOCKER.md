# 🐳 Docker Deployment Guide

Run Workflow Studio with Docker in seconds!

## Quick Start

### 1. Prerequisites

- Docker Engine 20.10+
- Docker Compose V2

**Install Docker:**
- **macOS**: [Docker Desktop](https://docs.docker.com/desktop/install/mac-install/)
- **Windows**: [Docker Desktop](https://docs.docker.com/desktop/install/windows-install/)
- **Linux**: [Docker Engine](https://docs.docker.com/engine/install/)

### 2. Run the Application

```bash
# Clone and enter directory
git clone <your-repo>
cd email-open-source

# Start everything (one command!)
./docker-run.sh up

# Or manually:
docker compose up -d
```

### 3. Access the Application

- **Frontend UI**: http://localhost:3000
- **Backend API**: http://localhost:18000
- **API Documentation**: http://localhost:18000/docs

## 🚀 Available Commands

### Using the helper script:

```bash
# Start services
./docker-run.sh up

# Stop services
./docker-run.sh stop

# View logs
./docker-run.sh logs

# Restart services
./docker-run.sh restart

# Rebuild images
./docker-run.sh rebuild

# Check status
./docker-run.sh ps

# Clean everything (removes volumes!)
./docker-run.sh clean

# Shell into backend
./docker-run.sh exec-backend

# Shell into frontend
./docker-run.sh exec-frontend
```

### Using Docker Compose directly:

```bash
# Start services
docker compose up -d

# Stop services
docker compose down

# View logs
docker compose logs -f

# Rebuild
docker compose up -d --build

# Scale services
docker compose up -d --scale backend=3
```

## 📦 What Gets Deployed

### Backend Container
- **Image**: `workflow-backend`
- **Port**: 18000
- **Volume**: Workflow data persisted at `/app/data`
- **Health Check**: `/health` endpoint
- **Base**: Python 3.11

### Frontend Container
- **Image**: `workflow-frontend`
- **Port**: 3000
- **Base**: Node.js 18 Alpine
- **Production build**: Next.js optimized

## 🔧 Configuration

### Environment Variables

Create `.env` file in project root:

```env
# Backend
PYTHONUNBUFFERED=1

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:18000

# Optional: API Keys
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
```

Load with:
```bash
docker compose --env-file .env up -d
```

### Volume Mounts

**Development mode** (live code reload):

```yaml
# In docker-compose.yml
volumes:
  - ./apps/api:/app/apps/api  # Backend hot reload
  - ./apps/web:/app           # Frontend hot reload
```

**Production mode** (no volumes, baked into image):

Comment out volume mounts in `docker-compose.yml`

## 🎯 Use Cases

### Development

```bash
# Start with live reload
docker compose up

# Watch logs
docker compose logs -f backend frontend

# Restart on code changes
docker compose restart backend
```

### Testing

```bash
# Run tests in container
docker compose exec backend pytest

# Frontend tests
docker compose exec frontend npm test
```

### Production Deployment

```bash
# Build optimized images
docker compose build --no-cache

# Start in detached mode
docker compose up -d

# Check health
curl http://localhost:18000/health
curl http://localhost:3000
```

## 🐛 Troubleshooting

### Container won't start

```bash
# Check logs
docker compose logs backend
docker compose logs frontend

# Rebuild from scratch
./docker-run.sh rebuild
```

### Port already in use

```bash
# Change ports in docker-compose.yml
ports:
  - "8000:18000"  # Backend
  - "8080:3000"   # Frontend
```

### Database/Volume issues

```bash
# Reset volumes
docker compose down -v
docker compose up -d
```

### Network issues

```bash
# Recreate network
docker network rm workflow-network
docker compose up -d
```

### Cannot connect frontend to backend

1. Check backend health: http://localhost:18000/health
2. Verify environment variable: `NEXT_PUBLIC_API_URL`
3. Check container networking:
   ```bash
   docker compose exec frontend ping backend
   ```

## 📊 Monitoring

### View resource usage

```bash
docker stats workflow-backend workflow-frontend
```

### Check container health

```bash
docker compose ps
# Look for "healthy" status
```

### Inspect logs

```bash
# All logs
docker compose logs

# Specific service
docker compose logs backend

# Follow mode
docker compose logs -f

# Last 100 lines
docker compose logs --tail 100
```

## 🔐 Security

### Production Checklist

- [ ] Use environment variables for secrets (not .env files)
- [ ] Run containers as non-root user
- [ ] Enable read-only root filesystem
- [ ] Limit container resources
- [ ] Use specific image tags (not `latest`)
- [ ] Scan images for vulnerabilities

```bash
# Scan images
docker scan workflow-backend
docker scan workflow-frontend
```

## 🚢 Deployment

### Docker Hub

```bash
# Login
docker login

# Tag images
docker tag workflow-backend yourusername/workflow-backend:v1.0
docker tag workflow-frontend yourusername/workflow-frontend:v1.0

# Push
docker push yourusername/workflow-backend:v1.0
docker push yourusername/workflow-frontend:v1.0
```

### Pull and Run Anywhere

```bash
# On any machine with Docker
docker compose pull
docker compose up -d
```

### AWS ECS / Azure / GCP

See cloud-specific deployment guides in `/docs/deployment/`

## 📝 Advanced

### Custom Build Args

```bash
docker compose build \
  --build-arg PYTHON_VERSION=3.11 \
  --build-arg NODE_VERSION=18
```

### Multi-stage Build

Images use multi-stage builds for optimization:
- **Builder stage**: Compiles/builds
- **Runner stage**: Minimal runtime (50% smaller)

### Health Checks

Both services have health checks:
- **Backend**: Curl to `/health`
- **Frontend**: Wget to homepage
- **Interval**: Every 30 seconds

## 🎓 Learning Resources

- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Docker Compose](https://docs.docker.com/compose/)
- [Multi-stage Builds](https://docs.docker.com/build/building/multi-stage/)

## 💡 Tips

1. **Use BuildKit**: `DOCKER_BUILDKIT=1 docker compose build`
2. **Layer Caching**: Order Dockerfile commands from least to most frequently changing
3. **Small Images**: Use Alpine base images
4. **Security**: Scan with `docker scan`
5. **Logs**: Use `docker compose logs -f` during development

## 🆘 Getting Help

- Check logs: `docker compose logs`
- Inspect container: `docker compose exec backend bash`
- Health status: `docker compose ps`
- Community: [GitHub Issues](https://github.com/your-repo/issues)
