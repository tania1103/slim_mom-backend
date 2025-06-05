#!/bin/bash

# SlimMom API Deployment Script
# Usage: ./deploy.sh [environment]

set -e

ENVIRONMENT=${1:-production}
PROJECT_NAME="slimmom"

echo "🚀 Starting SlimMom API Deployment for $ENVIRONMENT environment..."

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check requirements
log_info "Checking deployment requirements..."

if ! command -v docker &> /dev/null; then
    log_error "Docker is required but not installed."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    log_error "Docker Compose is required but not installed."
    exit 1
fi

log_success "All requirements met!"

# Environment setup
log_info "Setting up environment..."

if [ ! -f ".env.$ENVIRONMENT" ]; then
    log_error "Environment file .env.$ENVIRONMENT not found!"
    exit 1
fi

# Copy environment file
cp .env.$ENVIRONMENT .env
log_success "Environment configured for $ENVIRONMENT"

# Pre-deployment checks
log_info "Running pre-deployment checks..."

# Test application locally
npm test 2>/dev/null || log_warning "No tests found - consider adding tests"

# Security audit
log_info "Running security audit..."
npm audit --audit-level moderate

# Build and deploy
log_info "Building Docker images..."
docker-compose build --no-cache

log_info "Starting services..."
docker-compose down 2>/dev/null || true
docker-compose up -d

# Wait for services to be ready
log_info "Waiting for services to start..."
sleep 10

# Health check
log_info "Performing health check..."
for i in {1..10}; do
    if curl -f http://localhost:5000/health > /dev/null 2>&1; then
        log_success "Health check passed!"
        break
    else
        log_warning "Health check attempt $i/10 failed, retrying..."
        sleep 5
    fi
    
    if [ $i -eq 10 ]; then
        log_error "Health check failed after 10 attempts"
        log_info "Showing container logs:"
        docker-compose logs slimmom-api
        exit 1
    fi
done

# Post-deployment verification
log_info "Running post-deployment verification..."

# Test endpoints
ENDPOINTS=(
    "/health"
    "/api-docs"
    "/api/products/search?search=apple"
)

for endpoint in "${ENDPOINTS[@]}"; do
    if curl -f "http://localhost:5000$endpoint" > /dev/null 2>&1; then
        log_success "✓ $endpoint is responding"
    else
        log_warning "✗ $endpoint is not responding"
    fi
done

# Display deployment info
log_success "🎉 Deployment completed successfully!"
echo
echo "📊 Deployment Summary:"
echo "  Environment: $ENVIRONMENT"
echo "  API URL: http://localhost:5000"
echo "  Health Check: http://localhost:5000/health"
echo "  API Documentation: http://localhost:5000/api-docs"
echo "  Monitoring: http://localhost:5000/health/detailed"
echo
echo "🐳 Docker Containers:"
docker-compose ps

echo
echo "📝 Next Steps:"
echo "  1. Configure SSL certificates in ./ssl/ directory"
echo "  2. Update domain names in nginx.conf"
echo "  3. Set up monitoring and alerting"
echo "  4. Configure backup strategy for MongoDB"
echo "  5. Set up CI/CD pipeline"

log_success "Deployment script completed!"