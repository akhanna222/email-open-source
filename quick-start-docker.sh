#!/bin/bash

# One-line Docker quick start for Workflow Studio

echo "🚀 Quick Start - Workflow Studio (Docker)"
echo "========================================"
echo ""

# Install Docker if needed (Linux only)
if ! command -v docker &> /dev/null; then
    echo "📦 Docker not found. Installing..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    rm get-docker.sh
fi

# Start services
echo "🐳 Starting Workflow Studio..."
docker compose up -d

echo ""
echo "✅ Done! Access the application at:"
echo "   🌐 Frontend: http://localhost:3000"
echo "   📡 Backend API: http://localhost:18000"
echo "   📚 API Docs: http://localhost:18000/docs"
