#!/bin/bash

# LeetLab Production Deployment Script
# This script deploys LeetLab in production mode

set -e

echo "🚀 LeetLab Production Deployment"
echo "================================="

# Check if running as root (not recommended)
if [ "$EUID" -eq 0 ]; then
    echo "⚠️  Warning: Running as root is not recommended for production"
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    echo "✅ Docker installed. Please log out and log back in to use Docker without sudo."
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Installing Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    echo "✅ Docker Compose installed."
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "❌ .env file created but needs configuration!"
    echo "Please edit .env file with your production values before continuing."
    echo "Important: Set secure values for JWT_SECRET, REFRESH_SECRET, and all API keys."
    exit 1
fi

# Validate critical environment variables
echo "🔍 Validating environment configuration..."
source .env

if [ -z "$JWT_SECRET" ] || [ "$JWT_SECRET" = "your-super-secret-jwt-key-change-this-in-production" ]; then
    echo "❌ JWT_SECRET is not set or using default value. Please set a secure JWT_SECRET in .env"
    exit 1
fi

if [ -z "$REFRESH_SECRET" ] || [ "$REFRESH_SECRET" = "your-super-secret-refresh-key-change-this-in-production" ]; then
    echo "❌ REFRESH_SECRET is not set or using default value. Please set a secure REFRESH_SECRET in .env"
    exit 1
fi

echo "✅ Environment configuration validated"

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p nginx/ssl
mkdir -p nginx/logs
mkdir -p backend/uploads

# Set proper permissions
sudo chown -R $USER:$USER nginx/logs
sudo chown -R $USER:$USER backend/uploads

# Pull latest images and build
echo "🐳 Building and pulling Docker images..."
docker-compose pull
docker-compose build --no-cache

# Start production environment
echo "🚀 Starting production environment..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 20

# Check service health
echo "🔍 Checking service health..."
docker-compose ps

# Run database migrations
echo "🗄️  Running database migrations..."
docker-compose exec -T backend npm run migrate

# Check if services are responding
echo "🌐 Testing service endpoints..."
if curl -f http://localhost:8080/api/v1/auth/health > /dev/null 2>&1; then
    echo "✅ Backend is responding"
else
    echo "❌ Backend is not responding"
fi

if curl -f http://localhost/health > /dev/null 2>&1; then
    echo "✅ Frontend is accessible"
else
    echo "❌ Frontend is not accessible"
fi

# Show final status
echo ""
echo "🎉 Production deployment completed!"
echo ""
echo "🌐 Your application is available at:"
echo "   Frontend: http://localhost (or your domain)"
echo "   Backend API: http://localhost/api/v1"
echo ""
echo "📊 Management commands:"
echo "   View logs:           docker-compose logs -f [service-name]"
echo "   Stop services:       docker-compose down"
echo "   Update application:  git pull && docker-compose up -d --build"
echo "   Backup database:     docker-compose exec postgres pg_dump -U myuser postgres > backup.sql"
echo ""
echo "🔒 Security checklist:"
echo "   ✓ Change default passwords in .env"
echo "   ✓ Set up SSL certificates in nginx/ssl/"
echo "   ✓ Configure firewall to allow only necessary ports"
echo "   ✓ Set up regular backups"
echo "   ✓ Monitor logs regularly"
echo ""
echo "🔐 First user registration will create a SUPERADMIN account"
echo ""
echo "🎯 Next steps:"
echo "   1. Register the first user (becomes SUPERADMIN)"
echo "   2. Configure SSL certificates for HTTPS"
echo "   3. Set up monitoring and alerting"
echo "   4. Configure email service for password resets"
echo ""
echo "Happy deploying! 🚀"
