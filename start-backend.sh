#!/bin/bash

# Workflow Studio Backend Startup Script

echo "🚀 Starting Workflow Studio Backend..."
echo ""

# Check if we're in the right directory
if [ ! -f "apps/api/main.py" ]; then
    echo "❌ Error: apps/api/main.py not found"
    echo "Please run this script from the project root directory"
    exit 1
fi

# Check if uvicorn is installed
if ! command -v uvicorn &> /dev/null; then
    echo "⚠️  uvicorn not found. Installing dependencies..."
    pip install -r requirements-dev.txt
fi

# Change to API directory
cd apps/api

# Start the server
echo "✅ Starting API server on http://localhost:18000"
echo "📚 API docs available at http://localhost:18000/docs"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Run with module path to avoid import issues
cd ../..
python -m uvicorn apps.api.main:app --reload --host 0.0.0.0 --port 18000
