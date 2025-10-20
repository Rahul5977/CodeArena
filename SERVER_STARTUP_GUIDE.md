# 🚀 Server Startup Guide

## Current Status
- ✅ Backend code: No syntax errors
- ✅ Frontend code: Build successful
- ❌ PostgreSQL: Not running
- ❌ Docker: Not running

## Quick Start Options

### Option 1: Using Docker (Recommended)

#### 1. Start Docker Desktop
```bash
# Open Docker Desktop application
# Wait for Docker to fully start (whale icon in menu bar should be stable)
```

#### 2. Start all services with Docker Compose
```bash
cd /Users/rahulraj/Desktop/LeetLab

# Start PostgreSQL and Redis only (lightweight)
docker-compose -f docker-compose.dev.yml up -d postgres redis

# Wait 10 seconds for services to initialize
sleep 10

# Then start backend and frontend locally (for hot reload)
cd backend && npm run dev &
cd ../frontend && npm run dev &
```

### Option 2: Without Docker (Install PostgreSQL locally)

#### 1. Install PostgreSQL with Homebrew
```bash
# Install PostgreSQL
brew install postgresql@15

# Start PostgreSQL service
brew services start postgresql@15

# Create database and user
createdb postgres
psql postgres -c "CREATE USER myuser WITH PASSWORD 'mypassword';"
psql postgres -c "GRANT ALL PRIVILEGES ON DATABASE postgres TO myuser;"
```

#### 2. Run Prisma migrations
```bash
cd /Users/rahulraj/Desktop/LeetLab/backend
npx prisma migrate deploy
npx prisma generate
```

#### 3. Start servers
```bash
# Terminal 1: Backend
cd /Users/rahulraj/Desktop/LeetLab/backend
npm run dev

# Terminal 2: Frontend (open new terminal)
cd /Users/rahulraj/Desktop/LeetLab/frontend
npm run dev
```

---

## Automatic Startup Script

### Option 3: All-in-One Startup (With Docker)

Save this script as `start-dev.sh` in the project root:

```bash
#!/bin/bash
cd /Users/rahulraj/Desktop/LeetLab

echo "🚀 Starting LeetLab Development Environment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop first."
    exit 1
fi

# Start PostgreSQL and Redis
echo "📦 Starting PostgreSQL and Redis..."
docker-compose -f docker-compose.dev.yml up -d postgres redis

# Wait for services to be ready
echo "⏳ Waiting for services to initialize..."
sleep 10

# Start backend
echo "🔧 Starting Backend..."
cd backend
npm run dev > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

# Wait a bit for backend to start
sleep 3

# Start frontend
echo "🎨 Starting Frontend..."
cd ../frontend
npm run dev > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"

echo ""
echo "✅ All services started successfully!"
echo ""
echo "📍 Access your application:"
echo "   Frontend: http://localhost:5173"
echo "   Backend:  http://localhost:8080"
echo ""
echo "📊 View logs:"
echo "   Backend:  tail -f logs/backend.log"
echo "   Frontend: tail -f logs/frontend.log"
echo ""
echo "🛑 To stop services:"
echo "   kill $BACKEND_PID $FRONTEND_PID"
echo "   docker-compose -f docker-compose.dev.yml down"
```

Make it executable:
```bash
chmod +x start-dev.sh
./start-dev.sh
```

---

## Manual Startup (Current Best Option)

Since Docker is not running, here's what to do:

### Step 1: Start Docker Desktop
1. Open **Docker Desktop** application
2. Wait for it to fully start (whale icon should be stable)
3. Verify: `docker info` should work

### Step 2: Start Database Services
```bash
cd /Users/rahulraj/Desktop/LeetLab
docker-compose -f docker-compose.dev.yml up -d postgres redis
```

### Step 3: Wait and Verify
```bash
# Wait 10 seconds
sleep 10

# Verify PostgreSQL is running
docker-compose -f docker-compose.dev.yml ps
```

### Step 4: Start Backend
```bash
cd /Users/rahulraj/Desktop/LeetLab/backend
npm run dev
```

This should show:
```
Server is running on port 8080
Environment: development
```

### Step 5: Start Frontend (New Terminal)
```bash
cd /Users/rahulraj/Desktop/LeetLab/frontend
npm run dev
```

This should show:
```
VITE v7.1.7  ready in XXX ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

### Step 6: Access Application
Open browser and go to: **http://localhost:5173**

---

## Troubleshooting

### Issue: "Docker daemon not running"
**Solution**: Start Docker Desktop application

### Issue: "Port 8080 already in use"
**Solution**: 
```bash
lsof -ti:8080 | xargs kill -9
```

### Issue: "Port 5173 already in use"
**Solution**:
```bash
lsof -ti:5173 | xargs kill -9
```

### Issue: "Database connection error"
**Solution**:
```bash
# Restart PostgreSQL
docker-compose -f docker-compose.dev.yml restart postgres

# Wait and try again
sleep 5
```

### Issue: "Prisma Client not generated"
**Solution**:
```bash
cd backend
npx prisma generate
npm run dev
```

---

## Verification Checklist

After startup, verify everything is working:

- [ ] Docker Desktop is running
- [ ] PostgreSQL container is running: `docker ps | grep postgres`
- [ ] Backend responds: `curl http://localhost:8080/api/v1/auth/check`
- [ ] Frontend loads: Open http://localhost:5173
- [ ] No errors in backend terminal
- [ ] No errors in frontend terminal

---

## Current Environment Check

Run these commands to see what's needed:

```bash
# Check Docker
docker info 2>&1 | head -5

# Check if services are running
lsof -ti:5432,6379,8080,5173

# Check Docker containers
docker ps

# Check logs if running
docker-compose -f docker-compose.dev.yml logs --tail=20
```

---

## Next Steps

1. **Start Docker Desktop** (most important!)
2. Run the startup commands above
3. Access http://localhost:5173
4. Test the code execution feature

---

**Last Updated**: 2025-10-20  
**Status**: Waiting for Docker to start
