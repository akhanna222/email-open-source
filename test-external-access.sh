#!/bin/bash
# Quick script to test external access to services

# Get EC2 public IP automatically (if running on EC2)
EC2_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null)

if [ -z "$EC2_IP" ]; then
  echo "Not running on EC2 or cannot detect public IP"
  echo "Please set EC2_IP manually:"
  echo "  export EC2_IP=your.ec2.ip.address"
  echo "  ./test-external-access.sh"
  exit 1
fi

echo "Testing services at $EC2_IP"
echo "================================"

echo -n "API Health Check... "
if curl -sf "http://${EC2_IP}:8083/health" > /dev/null 2>&1; then
  echo "✓ API accessible at http://${EC2_IP}:8083"
else
  echo "✗ API not accessible"
  echo "  Try: curl http://${EC2_IP}:8083/health"
fi

echo -n "Web UI Check... "
if curl -sf "http://${EC2_IP}:3001" > /dev/null 2>&1; then
  echo "✓ Web accessible at http://${EC2_IP}:3001"
else
  echo "✗ Web not accessible"
  echo "  Try: curl http://${EC2_IP}:3001"
fi

echo ""
echo "Local service check:"
echo "================================"
docker-compose ps

echo ""
echo "Access URLs:"
echo "  Web UI: http://${EC2_IP}:3001"
echo "  API:    http://${EC2_IP}:8083/health"
echo "  Docs:   http://${EC2_IP}:8083/docs"
