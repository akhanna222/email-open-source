# Docker Build Improvements

## Issue Fixed

**Error**: `"/apps/web/package-lock.json": not found`

**Root Cause**: The `Dockerfile.web` was trying to copy `package-lock.json` which doesn't exist in the repository.

## Changes Made

### 1. Dockerfile.web (Development)
- ✅ Fixed: Uses wildcard pattern `package*.json` to handle missing lock file
- ✅ Improved: Added `libc6-compat` for better Alpine Linux compatibility
- ✅ Improved: Better layer caching (dependencies installed separately)
- ✅ Improved: Copies source to /app root instead of nested structure
- ✅ Improved: Added EXPOSE directive and environment variables
- ✅ Improved: Removed `|| true` flag to catch real npm errors

### 2. Dockerfile.web.production (Optional)
Created a production-optimized multi-stage build with:
- Separate stages for dependencies, building, and runtime
- Smaller final image size
- Non-root user for security
- Production optimizations

## Testing

To test the fixed build:

```bash
# Development build
docker-compose build web

# Or test individually
docker build -f Dockerfile.web -t web-dev .

# Production build (optional)
docker build -f Dockerfile.web.production -t web-prod .
```

## Usage

### Development (Current)
```bash
docker-compose up web
```

### Production (If using .production Dockerfile)
Update `docker-compose.yml`:
```yaml
web:
  build:
    context: .
    dockerfile: Dockerfile.web.production
```

## Additional Recommendations

1. **Generate lock file**: Run `npm install` in `apps/web/` to create `package-lock.json` for dependency consistency
2. **.dockerignore**: Create a `.dockerignore` file to exclude unnecessary files from build context
3. **Health checks**: Add health check endpoints and HEALTHCHECK directive
4. **Build args**: Use ARG for configurable build parameters
