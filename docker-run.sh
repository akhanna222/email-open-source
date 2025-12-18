#!/bin/bash

# Docker Run Script for Workflow Studio

set -e

echo "🐳 Workflow Studio - Docker Deployment"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    echo "Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is available
if ! docker compose version &> /dev/null; then
    print_error "Docker Compose is not available."
    echo "Please install Docker Compose: https://docs.docker.com/compose/install/"
    exit 1
fi

# Parse command line arguments
COMMAND=${1:-up}

case $COMMAND in
    up|start)
        print_status "Starting Workflow Studio..."
        docker compose up -d
        echo ""
        print_success "Workflow Studio is starting!"
        echo ""
        print_status "Waiting for services to be healthy..."
        sleep 5
        echo ""
        print_status "Service Status:"
        docker compose ps
        echo ""
        print_success "🎉 Application is ready!"
        echo ""
        echo "📍 Access the application:"
        echo "   Frontend: ${GREEN}http://localhost:3000${NC}"
        echo "   Backend API: ${GREEN}http://localhost:18000${NC}"
        echo "   API Docs: ${GREEN}http://localhost:18000/docs${NC}"
        echo ""
        echo "📊 View logs: ${BLUE}docker compose logs -f${NC}"
        echo "🛑 Stop services: ${BLUE}./docker-run.sh stop${NC}"
        ;;

    down|stop)
        print_status "Stopping Workflow Studio..."
        docker compose down
        print_success "Services stopped!"
        ;;

    restart)
        print_status "Restarting Workflow Studio..."
        docker compose restart
        print_success "Services restarted!"
        ;;

    logs)
        docker compose logs -f
        ;;

    build)
        print_status "Building Docker images..."
        docker compose build --no-cache
        print_success "Build complete!"
        ;;

    rebuild)
        print_status "Rebuilding and restarting..."
        docker compose down
        docker compose build --no-cache
        docker compose up -d
        print_success "Rebuild complete!"
        ;;

    clean)
        print_warning "This will remove all containers, images, and volumes!"
        read -p "Are you sure? (y/N) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            print_status "Cleaning up..."
            docker compose down -v --rmi all
            print_success "Cleanup complete!"
        else
            print_status "Cleanup cancelled."
        fi
        ;;

    ps|status)
        docker compose ps
        ;;

    exec-backend)
        print_status "Opening shell in backend container..."
        docker compose exec backend /bin/bash
        ;;

    exec-frontend)
        print_status "Opening shell in frontend container..."
        docker compose exec frontend /bin/sh
        ;;

    pull)
        print_status "Pulling latest images..."
        docker compose pull
        print_success "Pull complete!"
        ;;

    *)
        echo "Usage: $0 {up|down|restart|logs|build|rebuild|clean|ps|exec-backend|exec-frontend|pull}"
        echo ""
        echo "Commands:"
        echo "  up/start       - Start all services"
        echo "  down/stop      - Stop all services"
        echo "  restart        - Restart all services"
        echo "  logs           - View logs (follow mode)"
        echo "  build          - Build Docker images"
        echo "  rebuild        - Rebuild and restart"
        echo "  clean          - Remove all containers, images, and volumes"
        echo "  ps/status      - Show service status"
        echo "  exec-backend   - Open shell in backend container"
        echo "  exec-frontend  - Open shell in frontend container"
        echo "  pull           - Pull latest code and images"
        exit 1
        ;;
esac
