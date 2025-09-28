# 🧠 LeetLab - Advanced Code Arena Platform

A comprehensive coding platform with advanced authentication, RBAC (Role-Based Access Control), and containerized deployment.

## 🚀 Features

### Advanced Authentication System

- **JWT Access & Refresh Tokens** - Secure token-based authentication with automatic refresh
- **Password Reset** - Email-based password recovery (ready for SMTP integration)
- **Session Management** - Multi-device session control and logout options
- **Account Security** - Password strength validation and account status management
- **Email Verification** - Ready for email verification workflow

### Role-Based Access Control (RBAC)

- **Three-Tier Role System**: USER, ADMIN, SUPERADMIN
- **Granular Permissions** - Resource and action-based permissions matrix
- **Role Management** - Promote/demote users with complete audit trail
- **Permission Checking** - Comprehensive access control system
- **Audit Logging** - Track all role changes and administrative actions

### Containerized Deployment

- **Docker & Docker Compose** - Full application containerization
- **Multi-environment** - Production and development configurations
- **Load Balancing** - Nginx reverse proxy with rate limiting
- **Database & Cache** - PostgreSQL and Redis integration
- **Health Checks** - Service monitoring and auto-recovery

## 🏗️ System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     Frontend    │    │     Backend     │    │    Database     │
│   (React/Vite)  │◄──►│   (Node.js)     │◄──►│   (PostgreSQL)  │
│                 │    │   + Socket.IO   │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         ▲                       ▲                       ▲
         │                       │                       │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     Nginx       │    │     Redis       │    │   File Storage  │
│  (Reverse Proxy)│    │   (Sessions)    │    │   (Volumes)     │
│  + Rate Limit   │    │   + Cache       │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔧 Quick Start Guide

### Prerequisites

- Docker & Docker Compose
- Node.js 18+ (for local development)
- Git

### 1. Clone Repository

```bash
git clone https://github.com/Rahul5977/CodeArena
cd LeetLab
```

### 2. Environment Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit configuration with your values
nano .env
```

### 3. Production Deployment

```bash
# Build and start all services
docker-compose up -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f
```

### 4. Development Mode

```bash
# Use development configuration with hot reload
docker-compose -f docker-compose.dev.yml up -d

# Services will be available at:
# Backend: http://localhost:8080
# Frontend: http://localhost:3000
```

### 5. Database Migration

```bash
# Run migrations in production
docker-compose exec backend npm run migrate

# Or for development
docker-compose -f docker-compose.dev.yml exec backend npx prisma migrate dev
```

## 📁 Project Structure

```
LeetLab/
├── backend/                           # Node.js Backend
│   ├── src/
│   │   ├── controllers/              # Route controllers
│   │   │   ├── auth.controllers.js   # Advanced authentication
│   │   │   ├── rbac.controllers.js   # Role management
│   │   │   ├── problem.controllers.js
│   │   │   ├── contest.controllers.js
│   │   │   └── ...
│   │   ├── middleware/               # Auth & RBAC middleware
│   │   ├── routes/                   # API route definitions
│   │   ├── libs/                     # Database & external services
│   │   ├── utils/                    # Utilities & helpers
│   │   └── generated/                # Prisma client
│   ├── prisma/                       # Database schema & migrations
│   ├── Dockerfile                    # Production container
│   └── Dockerfile.dev                # Development container
├── frontend/                         # React Frontend
│   ├── src/
│   │   ├── components/               # React components
│   │   ├── pages/                    # Page components
│   │   ├── contexts/                 # React contexts (Auth, Toast)
│   │   └── utils/                    # Frontend utilities
│   ├── Dockerfile                    # Production container
│   └── Dockerfile.dev                # Development container
├── nginx/                            # Reverse proxy configuration
│   └── nginx.conf                    # Production nginx config
├── docker-compose.yml                # Production deployment
├── docker-compose.dev.yml            # Development environment
└── .env.example                      # Environment template
```

## 🔐 Authentication & RBAC

### User Role Permissions Matrix

| Resource  | USER             | ADMIN     | SUPERADMIN      |
| --------- | ---------------- | --------- | --------------- |
| Problems  | Read             | Full CRUD | Full CRUD       |
| Contests  | Read/Participate | Full CRUD | Full CRUD       |
| Playlists | Read             | Full CRUD | Full CRUD       |
| Users     | Own Profile Only | Read All  | Full Management |
| Roles     | -                | -         | Promote/Demote  |
| System    | -                | -         | Configure/Audit |

### New Authentication Endpoints

#### Public Endpoints

- `POST /api/v1/auth/register` - User registration with validation
- `POST /api/v1/auth/login` - Login with remember me option
- `POST /api/v1/auth/forgot-password` - Request password reset
- `POST /api/v1/auth/reset-password` - Reset password with token
- `POST /api/v1/auth/refresh-token` - Refresh access token
- `GET /api/v1/auth/health` - Service health check

#### Protected Endpoints

- `GET /api/v1/auth/profile` - Get detailed user profile
- `PUT /api/v1/auth/profile` - Update user profile
- `POST /api/v1/auth/change-password` - Change password
- `POST /api/v1/auth/logout` - Logout current session
- `POST /api/v1/auth/logout-all` - Logout all sessions

#### RBAC Management (Admin/SuperAdmin)

- `GET /api/v1/auth/users` - List all users with pagination
- `GET /api/v1/auth/permissions/:userId?` - Get user permissions
- `GET /api/v1/auth/role-history/:userId?` - View role change history

#### SuperAdmin Only

- `POST /api/v1/auth/promote` - Promote user role
- `POST /api/v1/auth/demote` - Demote user role
- `PATCH /api/v1/auth/users/:userId/status` - Activate/deactivate users

## 🐳 Docker Services

### Production Services

- **postgres** - PostgreSQL 15 with persistent storage
- **redis** - Redis for session storage and caching
- **backend** - Node.js API server with health checks
- **frontend** - Optimized React build served by Nginx
- **nginx** - Reverse proxy with rate limiting and SSL ready

### Development Services

- **postgres** - PostgreSQL database
- **redis** - Redis cache
- **backend** - Node.js with nodemon for hot reload
- **frontend** - Vite dev server with HMR

## 🔧 Environment Configuration

### Required Environment Variables

```bash
# JWT Security (CHANGE FOR PRODUCTION!)
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
REFRESH_SECRET=your-refresh-secret-key-min-32-chars

# External API Integration
SULU_API_KEY=your-sulu-api-key
JUDGE0_API_URL=https://judge0-ce.p.sulu.sh

# Payment Gateway
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-secret

# Email Service (for password reset)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Database Configuration
POSTGRES_DB=postgres
POSTGRES_USER=myuser
POSTGRES_PASSWORD=mypassword
REDIS_PASSWORD=redispassword
```

## 🚀 Production Deployment

### 1. Server Preparation

```bash
# Install Docker & Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 2. Application Deployment

```bash
# Clone to production directory
git clone https://github.com/Rahul5977/CodeArena /opt/leetlab
cd /opt/leetlab

# Configure environment
cp .env.example .env
nano .env  # Edit with production values

# Deploy services
docker-compose up -d

# Check status
docker-compose ps
```

### 3. SSL Configuration (Optional)

```bash
# Add SSL certificates to nginx/ssl/
# Uncomment SSL server block in nginx.conf
docker-compose restart nginx
```

### 4. First Time Setup

```bash
# Run database migrations
docker-compose exec backend npm run migrate

# Create first admin user through registration
# (First user automatically becomes SUPERADMIN)
```

## 🛠️ Development Workflow

### Local Development Setup

1. **Backend Development**

   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with development values
   npx prisma migrate dev
   npm run dev
   ```

2. **Frontend Development**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

### Database Operations

```bash
# Create new migration
npx prisma migrate dev --name migration_name

# Reset database (development only)
npx prisma migrate reset

# View database in browser
npx prisma studio

# Generate Prisma client after schema changes
npx prisma generate
```

## 📊 Monitoring & Maintenance

### Service Health Monitoring

```bash
# Check all service status
docker-compose ps

# View service logs
docker-compose logs -f [service-name]

# Monitor resource usage
docker stats

# Service-specific health checks
curl http://localhost:8080/api/v1/auth/health
curl http://localhost:3000/health
```

### Backup & Recovery

```bash
# Database backup
docker-compose exec postgres pg_dump -U myuser postgres > backup.sql

# Database restore
docker-compose exec -T postgres psql -U myuser postgres < backup.sql

# Volume backup
docker run --rm -v leetlab_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres_backup.tar.gz -C /data .
```

## 🔒 Security Features

### Authentication Security

- **Short-lived Access Tokens** (15 minutes) with secure refresh mechanism
- **Password Hashing** using bcrypt with 12 salt rounds
- **Token Rotation** on refresh to prevent token hijacking
- **Session Management** with device tracking and remote logout
- **Rate Limiting** on authentication endpoints

### Application Security

- **SQL Injection Protection** via Prisma ORM parameterized queries
- **XSS Protection** with secure headers and input validation
- **CORS Configuration** for cross-origin request control
- **Role-based Authorization** with permission matrices
- **Audit Logging** for administrative actions
- **Account Security** with activation/deactivation controls

## 🧪 Testing

### Backend Testing

```bash
cd backend
npm test                    # Run all tests
npm run test:auth          # Test authentication
npm run test:rbac          # Test RBAC functionality
npm run test:integration   # Integration tests
```

### Frontend Testing

```bash
cd frontend
npm test                   # Run component tests
npm run test:e2e          # End-to-end tests
```

## 🤝 Contributing

### Development Process

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Follow coding standards (ESLint + Prettier)
4. Write tests for new functionality
5. Commit changes (`git commit -m 'Add amazing feature'`)
6. Push to branch (`git push origin feature/amazing-feature`)
7. Create Pull Request

### Code Standards

- Use ESLint and Prettier configurations
- Write JSDoc comments for functions
- Follow REST API naming conventions
- Use TypeScript for type safety (future enhancement)

## 📋 Troubleshooting

### Common Issues

**Database Connection Issues**

```bash
# Check if PostgreSQL is running
docker-compose logs postgres

# Reset database connection
docker-compose restart backend postgres
```

**Permission Denied Errors**

```bash
# Fix file permissions
sudo chown -R $USER:$USER .
```

**Port Already in Use**

```bash
# Check what's using the port
sudo lsof -i :8080
sudo lsof -i :3000

# Kill the process
sudo kill -9 <PID>
```

### Health Check URLs

- Backend API: `http://localhost:8080/api/v1/auth/health`
- Frontend: `http://localhost:3000/health`
- Database: Check via `docker-compose logs postgres`

## 📝 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support & Contact

- **Documentation**: Check this README and inline code comments
- **Issues**: Create GitHub issues for bugs and feature requests
- **Community**: Join our discussions in GitHub Discussions
- **Email**: your-email@domain.com for direct support

## 🙏 Acknowledgments

- Judge0 API for code execution
- Prisma ORM for database management
- React and Node.js communities
- Docker for containerization

---

**Made with ❤️ for the competitive programming community**

_Last updated: September 2025_
