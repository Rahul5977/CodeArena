# 🚀 LeetLab - Advanced Coding Platform

LeetLab is a comprehensive full-stack coding platform designed for developers to practice coding problems, participate in contests, access premium problem sheets, and get real-time code execution feedback. Built with modern technologies and containerized for easy deployment.

## ✨ Key Features

### Core Functionality

- 🧩 **Problem Solving**: Extensive library of coding problems with multiple difficulty levels
- 💻 **Real-time Code Execution**: Integrated Judge0 API for instant code compilation and execution
- 📊 **Progress Tracking**: Personal dashboard to track coding progress and statistics
- 🏆 **Contests**: Participate in timed coding competitions with leaderboards
- 📚 **Premium Sheets**: Curated DSA practice sheets with Razorpay payment integration

### Advanced Features

- 🔐 **Secure Authentication**: JWT-based auth with refresh tokens and role-based access
- 💳 **Payment Integration**: Razorpay integration for premium content access
- � **Responsive Design**: Modern UI built with React, Tailwind CSS, and Lucide icons
- ⚡ **Real-time Updates**: Live notifications and updates using Socket.IO
- � **Containerized**: Full Docker support for development and production environments
- 🗃️ **Database Management**: PostgreSQL with Prisma ORM for type-safe database operations
- 🚀 **Redis Caching**: Session management and performance optimization

### User Experience

- 🎨 **Modern Interface**: Clean, intuitive design with dark theme support
- 🔍 **Advanced Search**: Filter problems by difficulty, tags, and completion status
- 📈 **Analytics Dashboard**: Detailed progress tracking and performance insights
- 🛡️ **Admin Panel**: Comprehensive admin interface for content management
- 📧 **Email Notifications**: SMTP integration for user communications

## 🏗️ Architecture & Tech Stack

### Frontend

- **React 18** - Modern React with hooks and context
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icon library
- **Zustand** - Lightweight state management
- **Monaco Editor** - VS Code-based code editor

### Backend

- **Node.js & Express** - Server runtime and web framework
- **Prisma ORM** - Type-safe database client and migrations
- **PostgreSQL** - Primary relational database
- **Redis** - Session storage and caching layer
- **Socket.IO** - Real-time bidirectional communication
- **Judge0 API** - Code execution and compilation service

### DevOps & Infrastructure

- **Docker & Docker Compose** - Containerization and orchestration
- **Nginx** - Reverse proxy and load balancing
- **SSL/TLS** - HTTPS support with certificate management

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18+ recommended)
- **Docker & Docker Compose** (for containerized setup)
- **PostgreSQL** (if running locally without Docker)
- **Redis** (if running locally without Docker)

### Option 1: Docker Setup (Recommended)

#### Development Environment

```bash
# Clone the repository
git clone https://github.com/yourusername/leetlab.git
cd leetlab

# Copy environment template
cp .env.example .env

# Start development environment with hot reload
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f
```

#### Production Environment

```bash
# Set up environment variables
cp .env.example .env
# Edit .env with production values

# Start production environment
docker-compose up -d

# View logs
docker-compose logs -f
```

### Option 2: Manual Setup

#### 1. Clone and Install Dependencies

```bash
git clone https://github.com/yourusername/leetlab.git
cd leetlab

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

#### 2. Environment Configuration

Create `.env` file in the `backend` directory:

```env
# Database
DATABASE_URL="postgresql://myuser:mypassword@localhost:5432/leetlab"
REDIS_URL="redis://:redispassword@localhost:6379"

# Authentication
SECRET="your-super-secret-jwt-key-change-this-in-production"
REFRESH_SECRET="your-super-secret-refresh-key-change-this-in-production"

# External Services
JUDGE0_API_URL="https://judge0-ce.p.sulu.sh"
SULU_API_KEY="your-judge0-api-key"

# Payment Gateway
RAZORPAY_KEY_ID="your-razorpay-key-id"
RAZORPAY_KEY_SECRET="your-razorpay-key-secret"

# Email Configuration
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# Server Configuration
NODE_ENV="development"
PORT="8080"
```

#### 3. Database Setup

```bash
cd backend

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# Seed database (optional)
npm run seed
```

#### 4. Start Services

```bash
# Terminal 1: Start backend
cd backend
npm run dev

# Terminal 2: Start frontend
cd frontend
npm run dev

# Terminal 3: Start Redis (if not using Docker)
redis-server --requirepass redispassword
```

### Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080/api/v1
- **Admin Panel**: http://localhost:3000/admin (with admin credentials)

## 📁 Project Structure

```
leetlab/
├── 📁 backend/                 # Node.js Express API Server
│   ├── 📁 src/
│   │   ├── 📁 controllers/      # Route handlers and business logic
│   │   ├── 📁 routes/          # API route definitions
│   │   ├── 📁 middleware/      # Custom middleware functions
│   │   ├── 📁 libs/            # External service integrations
│   │   ├── 📁 utils/           # Utility functions and helpers
│   │   ├── 📁 generated/       # Prisma generated client
│   │   └── 📄 index.js         # Main server entry point
│   ├── 📁 prisma/
│   │   ├── 📁 migrations/      # Database migration files
│   │   └── 📄 schema.prisma    # Database schema definition
│   ├── 📁 uploads/             # File upload storage
│   ├── 📄 Dockerfile           # Production Docker config
│   ├── 📄 Dockerfile.dev       # Development Docker config
│   └── 📄 package.json         # Backend dependencies
│
├── 📁 frontend/                # React Vite Application
│   ├── 📁 src/
│   │   ├── 📁 components/      # Reusable React components
│   │   │   ├── 📁 ui/          # Base UI components
│   │   │   ├── 📁 layout/      # Layout components
│   │   │   └── 📁 shared/      # Shared components
│   │   ├── 📁 pages/           # Route-based page components
│   │   │   ├── 📁 auth/        # Authentication pages
│   │   │   ├── 📁 problems/    # Problem-related pages
│   │   │   ├── 📁 contests/    # Contest pages
│   │   │   ├── 📁 sheets/      # Sheet pages
│   │   │   └── 📁 admin/       # Admin panel pages
│   │   ├── 📁 contexts/        # React context providers
│   │   ├── 📁 stores/          # Zustand state management
│   │   ├── 📁 services/        # API service functions
│   │   ├── 📁 utils/           # Utility functions
│   │   ├── 📁 assets/          # Static assets
│   │   └── 📁 lib/             # Third-party library configs
│   ├── 📁 public/              # Public static files
│   ├── 📄 Dockerfile           # Production Docker config
│   ├── 📄 Dockerfile.dev       # Development Docker config
│   ├── 📄 vite.config.js       # Vite configuration
│   ├── 📄 tailwind.config.js   # Tailwind CSS config
│   └── 📄 package.json         # Frontend dependencies
│
├── 📁 nginx/                   # Nginx Reverse Proxy
│   ├── 📄 nginx.conf           # Nginx configuration
│   ├── 📁 ssl/                 # SSL certificates
│   └── 📁 logs/                # Nginx access/error logs
│
├── 📁 docs/                    # Project Documentation
│   ├── 📄 API_DOCS.md          # API documentation
│   ├── 📄 DEPLOYMENT.md        # Deployment guide
│   └── 📄 TESTING_GUIDE.md     # Testing instructions
│
├── 📄 docker-compose.yml       # Production compose config
├── 📄 docker-compose.dev.yml   # Development compose config
├── 📄 init-db.sql             # Database initialization
├── 📄 .env.example            # Environment variables template
└── 📄 README.md               # This file
```

## 🛠️ Available Scripts

### Docker Commands

```bash
# Development environment
docker-compose -f docker-compose.dev.yml up -d    # Start dev environment
docker-compose -f docker-compose.dev.yml down     # Stop dev environment
docker-compose -f docker-compose.dev.yml logs -f  # View live logs

# Production environment
docker-compose up -d                              # Start production
docker-compose down                               # Stop production
docker-compose logs -f                           # View live logs

# Individual services
docker-compose up -d postgres redis              # Start only database services
docker-compose restart backend                   # Restart backend service
```

### Frontend Scripts

```bash
cd frontend
npm run dev         # Start Vite development server (http://localhost:3000)
npm run build       # Build for production
npm run preview     # Preview production build locally
npm run lint        # Run ESLint code analysis
npm run lint:fix    # Fix ESLint issues automatically
```

### Backend Scripts

```bash
cd backend
npm run dev         # Start development server with nodemon
npm run start       # Start production server
npm run test        # Run test suite
npm run test:watch  # Run tests in watch mode

# Database operations
npx prisma migrate dev              # Create and apply new migration
npx prisma migrate deploy           # Apply migrations to production DB
npx prisma generate                 # Generate Prisma client
npx prisma studio                   # Open Prisma Studio (database GUI)
npx prisma db push                  # Push schema changes without migration
npx prisma db seed                  # Seed database with initial data
```

### Utility Scripts

```bash
# Setup scripts
chmod +x setup-dev.sh && ./setup-dev.sh        # Automated development setup
chmod +x deploy-prod.sh && ./deploy-prod.sh    # Production deployment

# Database management
psql -U myuser -d postgres -f init-db.sql      # Manual database initialization
psql -U myuser -d postgres -f sample-problem.sql  # Load sample problems
```

## 🔧 Configuration & Environment Variables

### Required Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
REFRESH_SECRET="your-super-secret-refresh-key-change-this-in-production"

# Judge0 API Configuration
JUDGE0_API_URL="https://judge0-ce.p.sulu.sh"
SULU_API_KEY="your-judge0-api-key"

# Razorpay Payment Gateway
RAZORPAY_KEY_ID="your-razorpay-key-id"
RAZORPAY_KEY_SECRET="your-razorpay-key-secret"

# Email/SMTP Configuration
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
```

### Service Configuration

#### Judge0 API Setup

1. Sign up at [Judge0](https://judge0.com/) or use the public API
2. Get your API key and update `SULU_API_KEY`
3. Configure rate limits and supported languages

#### Razorpay Integration

1. Create account at [Razorpay](https://razorpay.com/)
2. Get API keys from dashboard
3. Configure webhooks for payment verification

#### Email Service

1. Enable 2FA on Gmail account
2. Generate app-specific password
3. Update SMTP credentials in environment

## 📊 Database Schema

### Core Entities

- **Users**: Authentication, profiles, roles
- **Problems**: Coding challenges with test cases
- **Sheets**: Curated problem collections
- **Contests**: Timed competitions
- **Submissions**: Code submissions and results
- **Payments**: Transaction records

### Key Relationships

```sql
User 1---* Submission
User 1---* Payment
Problem 1---* Submission
Sheet 1---* SheetProblem *---1 Problem
Contest 1---* ContestProblem *---1 Problem
```

## 🧪 Testing

### Backend Testing

```bash
cd backend
npm test                    # Run all tests
npm run test:unit          # Unit tests only
npm run test:integration   # Integration tests only
npm run test:coverage      # Generate coverage report
```

### Frontend Testing

```bash
cd frontend
npm test                   # Run Jest/Vitest tests
npm run test:e2e          # Run end-to-end tests
npm run test:component    # Component testing
```

### API Testing

Use the provided Postman collection or test manually:

```bash
# Health check
curl http://localhost:8080/api/v1/health

# Authentication
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'
```

## 🚨 Troubleshooting

### Common Issues

#### Database Connection Issues

```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# View database logs
docker-compose logs postgres

# Reset database
docker-compose down -v
docker-compose up -d postgres
```

#### Prisma Migration Problems

```bash
# Reset migrations (CAUTION: Will lose data)
npx prisma migrate reset

# Apply pending migrations
npx prisma migrate deploy

# Generate client after schema changes
npx prisma generate
```

#### Frontend Build Issues

```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf .vite
npm run dev
```

#### Docker Issues

```bash
# Rebuild containers without cache
docker-compose build --no-cache

# Remove all containers and volumes
docker-compose down -v --remove-orphans

# Check container logs
docker-compose logs [service-name]
```

### Error Resolution

| Error                     | Solution                                    |
| ------------------------- | ------------------------------------------- |
| `ECONNREFUSED`            | Check if required services are running      |
| `Prisma Client not found` | Run `npx prisma generate`                   |
| `Migration failed`        | Check database connectivity and permissions |
| `Port already in use`     | Change port or kill existing process        |
| `CORS error`              | Verify frontend URL in backend CORS config  |
| `Judge0 API timeout`      | Check API key and network connectivity      |

## 🚀 Deployment

### Production Deployment with Docker

#### Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- SSL certificates (for HTTPS)
- Domain name configured

#### Deployment Steps

```bash
# Clone repository
git clone https://github.com/yourusername/leetlab.git
cd leetlab

# Configure production environment
cp .env.example .env
# Edit .env with production values

# Set up SSL certificates
mkdir -p nginx/ssl
# Add your SSL certificates to nginx/ssl/

# Deploy
chmod +x deploy-prod.sh
./deploy-prod.sh

# Verify deployment
docker-compose ps
curl -k https://yourdomain.com/health
```

#### Production Checklist

- [ ] Environment variables configured
- [ ] SSL certificates installed
- [ ] Database backups configured
- [ ] Monitoring setup (logs, metrics)
- [ ] Security hardening applied
- [ ] Load testing completed

### Cloud Deployment Options

#### AWS Deployment

- **ECS/Fargate**: Container orchestration
- **RDS**: Managed PostgreSQL
- **ElastiCache**: Managed Redis
- **CloudFront**: CDN for static assets
- **Route 53**: DNS management

#### Digital Ocean

- **App Platform**: Managed container deployment
- **Managed Database**: PostgreSQL and Redis
- **Spaces**: Object storage
- **Load Balancers**: High availability

#### Self-Hosted (VPS)

```bash
# Install Docker on Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Deploy application
git clone https://github.com/yourusername/leetlab.git
cd leetlab
./deploy-prod.sh
```

## 📈 Performance Optimization

### Backend Optimizations

- **Database Indexing**: Optimized queries with proper indexes
- **Redis Caching**: Session storage and frequent data caching
- **Connection Pooling**: PostgreSQL connection optimization
- **Compression**: Gzip compression for API responses

### Frontend Optimizations

- **Code Splitting**: Route-based lazy loading
- **Asset Optimization**: Image compression and lazy loading
- **Bundle Analysis**: Webpack bundle analyzer integration
- **PWA Features**: Service worker for offline functionality

### Database Optimizations

```sql
-- Add indexes for frequently queried columns
CREATE INDEX idx_problems_difficulty ON problems(difficulty);
CREATE INDEX idx_submissions_user_id ON submissions(user_id);
CREATE INDEX idx_sheets_type ON sheets(type);
```

## 🔐 Security Features

### Authentication & Authorization

- **JWT Tokens**: Secure stateless authentication
- **Refresh Tokens**: Extended session management
- **Role-Based Access**: User, Admin, SuperAdmin roles
- **Rate Limiting**: API endpoint protection

### Data Protection

- **Input Validation**: Comprehensive request validation
- **SQL Injection Protection**: Prisma ORM parameterized queries
- **XSS Prevention**: Content Security Policy headers
- **HTTPS Enforcement**: SSL/TLS encryption

### Security Best Practices

```bash
# Update dependencies regularly
npm audit
npm audit fix

# Use security headers
helmet.js middleware configured

# Environment variable validation
joi schema validation
```

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### Getting Started

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** and test thoroughly
4. **Commit your changes**: `git commit -m 'Add amazing feature'`
5. **Push to the branch**: `git push origin feature/amazing-feature`
6. **Open a Pull Request**

### Development Guidelines

- Follow existing code style and conventions
- Write comprehensive tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting
- Use meaningful commit messages

### Code Style

- **Frontend**: ESLint + Prettier configuration
- **Backend**: ESLint + Standard JavaScript style
- **Database**: Follow Prisma naming conventions
- **Git**: Conventional commit messages

### Reporting Issues

Please use GitHub Issues to report bugs or request features:

- **Bug Reports**: Include steps to reproduce, expected vs actual behavior
- **Feature Requests**: Describe the use case and proposed solution
- **Security Issues**: Email security@leetlab.com (do not use public issues)

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

### Core Technologies

- **[React](https://react.dev/)** - Frontend framework
- **[Node.js](https://nodejs.org/)** - Backend runtime
- **[PostgreSQL](https://postgresql.org/)** - Primary database
- **[Prisma](https://prisma.io/)** - Database ORM and migrations
- **[Docker](https://docker.com/)** - Containerization platform

### UI & Design

- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Lucide React](https://lucide.dev/)** - Beautiful icon library
- **[Monaco Editor](https://microsoft.github.io/monaco-editor/)** - Code editor

### External Services

- **[Judge0](https://judge0.com/)** - Code execution API
- **[Razorpay](https://razorpay.com/)** - Payment processing
- **[Redis](https://redis.io/)** - In-memory data structure store

### Community

Special thanks to all contributors, testers, and users who help make LeetLab better!

---

## 📞 Support

- **Documentation**: [Wiki](https://github.com/yourusername/leetlab/wiki)
- **Community**: [Discord Server](https://discord.gg/leetlab)
- **Issues**: [GitHub Issues](https://github.com/yourusername/leetlab/issues)
- **Email**: support@leetlab.com

---

<div align="center">

**[⬆ Back to Top](#-leetlab---advanced-coding-platform)**

Made with ❤️ by the LeetLab Team

</div>
