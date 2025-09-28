#!/bin/bash

# LeetLab Development Setup Script
# This script sets up the development environment for LeetLab

set -e

echo "🚀 LeetLab Development Setup"
echo "=============================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "✅ .env file created. Please edit it with your configuration."
    echo "⚠️  Make sure to set secure values for JWT_SECRET and REFRESH_SECRET"
else
    echo "✅ .env file already exists"
fi

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p nginx/ssl
mkdir -p nginx/logs
mkdir -p backend/uploads

# Build and start development environment
echo "🐳 Starting development environment..."
docker-compose -f docker-compose.dev.yml up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check service status
echo "🔍 Checking service status..."
docker-compose -f docker-compose.dev.yml ps

# Run database migrations
echo "🗄️  Running database migrations..."
docker-compose -f docker-compose.dev.yml exec -T backend npx prisma migrate dev --name initial_setup || true

# Generate Prisma client
echo "🔧 Generating Prisma client..."
docker-compose -f docker-compose.dev.yml exec -T backend npx prisma generate

echo ""
echo "✅ Development environment is ready!"
echo ""
echo "🌐 Services are available at:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:8080"
echo "   Database: localhost:5432"
echo "   Redis:    localhost:6379"
echo ""
echo "📊 Useful commands:"
echo "   View logs:           docker-compose -f docker-compose.dev.yml logs -f"
echo "   Stop services:       docker-compose -f docker-compose.dev.yml down"
echo "   Restart services:    docker-compose -f docker-compose.dev.yml restart"
echo "   Database studio:     docker-compose -f docker-compose.dev.yml exec backend npx prisma studio"
echo ""
echo "🔐 First user registration will automatically create a SUPERADMIN account"
echo ""
echo "Happy coding! 🎉"
