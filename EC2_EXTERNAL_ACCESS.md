# EC2 External Access Setup

## Making Services Accessible Outside EC2

### 1. Configure EC2 Security Group

Add inbound rules to allow traffic on these ports:

| Port  | Service  | Protocol | Source          | Description                    |
|-------|----------|----------|-----------------|--------------------------------|
| 13000 | Web UI   | TCP      | 0.0.0.0/0       | Public web interface           |
| 18000 | API      | TCP      | 0.0.0.0/0       | Public API access              |
| 15432 | Postgres | TCP      | Your IP only    | Database (secure access only)  |
| 16379 | Redis    | TCP      | Your IP only    | Cache (secure access only)     |

**AWS Console Steps:**
1. Go to EC2 → Instances → Select your instance
2. Security tab → Click Security Group link
3. Inbound rules → Edit inbound rules → Add rules:
   ```
   Type: Custom TCP
   Port: 13000
   Source: 0.0.0.0/0 (or your IP range)
   Description: Web UI
   ```
   ```
   Type: Custom TCP
   Port: 18000
   Source: 0.0.0.0/0 (or your IP range)
   Description: API
   ```
4. Save rules

### 2. Get Your EC2 Public IP

```bash
# From inside EC2:
curl ifconfig.me

# Or from AWS console:
# EC2 → Instances → Check "Public IPv4 address" column
```

### 3. Access Your Services

Replace `YOUR_EC2_IP` with your actual public IP:

- **Web UI**: `http://YOUR_EC2_IP:13000`
- **API**: `http://YOUR_EC2_IP:18000/health`
- **API Docs**: `http://YOUR_EC2_IP:18000/docs`

Example:
```bash
# Test API from your local machine
curl http://54.123.456.789:18000/health

# Open browser to:
http://54.123.456.789:13000
```

### 4. Configure CORS for API (if needed)

Update `apps/api/main.py` to allow cross-origin requests:

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 5. Optional: Set Up Domain Name

Instead of using IP addresses, set up a domain:

1. **Get a domain** (e.g., from Route 53, GoDaddy, etc.)
2. **Create DNS A records**:
   - `app.yourdomain.com` → EC2 IP (for web UI on port 13000)
   - `api.yourdomain.com` → EC2 IP (for API on port 18000)

3. **Use reverse proxy** (recommended for production):

Create `docker-compose.prod.yml`:
```yaml
version: "3.9"

services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - web
      - api

  # ... rest of your services
```

### 6. Production Security Checklist

- [ ] Use HTTPS (Let's Encrypt, AWS Certificate Manager)
- [ ] Set up proper firewall rules
- [ ] Don't expose Postgres/Redis ports publicly
- [ ] Use environment variables for secrets
- [ ] Enable authentication/authorization
- [ ] Set up logging and monitoring
- [ ] Use strong passwords
- [ ] Keep Docker images updated

### 7. Quick Test Script

Create `test-external-access.sh`:
```bash
#!/bin/bash
EC2_IP="YOUR_EC2_IP"

echo "Testing API..."
curl -s "http://${EC2_IP}:18000/health" && echo "✓ API accessible" || echo "✗ API not accessible"

echo "Testing Web..."
curl -s "http://${EC2_IP}:13000" > /dev/null && echo "✓ Web accessible" || echo "✗ Web not accessible"
```

### Troubleshooting

**Can't connect?**
1. Check security group rules are saved
2. Verify services are running: `docker-compose ps`
3. Check if ports are listening: `netstat -tulpn | grep -E "(13000|18000)"`
4. Try from EC2 first: `curl localhost:18000/health`
5. Check EC2 instance state (must be running)
6. Verify network ACLs allow traffic

**Timeout errors?**
- Security group might not be updated yet (wait 30 seconds)
- Check if EC2 instance has a public IP assigned
- Verify VPC/subnet configuration allows internet access

**Using high-numbered ports?**
- These ports (13000-18000) are chosen to avoid common conflicts
- No system services typically use these ports
- Safe for development and testing environments
