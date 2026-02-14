# 🚀 CodeArena - Advanced Competitive Programming Platform

CodeArena is a comprehensive full-stack competitive programming platform designed for developers to practice coding problems, participate in contests, access premium DSA sheets, and get real-time code execution feedback. Built with modern technologies and containerized for easy deployment.

## ✨ Key Features

### Core Functionality

- 🧩 **Problem Solving**: Extensive library of coding problems with difficulty levels (Easy, Medium, Hard)
- 💻 **Real-time Code Execution**: Integrated Judge0 API for instant code compilation and execution across 5 languages
- 📊 **Progress Tracking**: Personal dashboard to track coding progress, submissions, and statistics
- 🏆 **Contests**: Full-featured timed coding competitions with live leaderboards and real-time updates
- 📚 **Premium DSA Sheets**: Curated Data Structures & Algorithms practice sheets with Razorpay payment integration
- 📋 **Custom Playlists**: Create and manage personal problem collections

### Advanced Features

- 🔐 **Secure Authentication**: JWT-based auth with refresh tokens and role-based access control (User, Admin, SuperAdmin)
- 💳 **Payment Integration**: Razorpay integration for premium DSA sheet purchases
- 🎨 **Responsive Design**: Modern UI built with React 19, Vite, Tailwind CSS 4, and Lucide icons
- ⚡ **Real-time Updates**: Live contest updates and notifications using Socket.IO
- 🐳 **Containerized**: Full Docker support with Docker Compose for development and production
- 🗃️ **Database Management**: PostgreSQL 15 with Prisma ORM 6 for type-safe database operations
- 🚀 **Redis Caching**: Session management and performance optimization with Redis 7
- 🔑 **Session Management**: Advanced session handling with token expiry and refresh mechanisms

### User Experience

- 🎨 **Modern Interface**: Clean, intuitive design with dark theme support and theme toggle
- 🔍 **Advanced Search**: Filter problems by difficulty, tags, and completion status
- 📈 **Analytics Dashboard**: Detailed progress tracking with recent submissions and activity feed
- 🛡️ **Admin Panel**: Comprehensive admin interface for user, problem, contest, and sheet management
- 📝 **Code Editor**: Monaco Editor (VS Code-based) with syntax highlighting and autocomplete
- ✅ **Test Cases**: Built-in test case execution with detailed results and error messages
- 🎯 **Contest Features**: Live leaderboards, real-time rankings, and submission tracking

## 🏗️ Architecture & Tech Stack

### Frontend

- **React 19** - Latest React with hooks and context
- **Vite 7.1** - Lightning-fast build tool and dev server
- **Tailwind CSS 4** - Utility-first CSS framework with modern features
- **Lucide React** - Beautiful icon library
- **Zustand** - Lightweight state management
- **Monaco Editor** - VS Code-based code editor with syntax highlighting
- **React Router 7** - Client-side routing
- **React Hook Form + Zod** - Form validation and management
- **DaisyUI** - Tailwind CSS component library
- **Framer Motion** - Animation library

### Backend

- **Node.js & Express 4.19** - Server runtime and web framework
- **Prisma ORM 6.12** - Type-safe database client and migrations
- **PostgreSQL 15** - Primary relational database
- **Redis 7** - Session storage and caching layer
- **Socket.IO 4.8** - Real-time bidirectional communication
- **Judge0 API** - Code execution and compilation service (supports 5 languages)
- **Razorpay SDK** - Payment processing integration
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication

### DevOps & Infrastructure

- **Docker & Docker Compose** - Containerization and orchestration
- **Nginx** - Reverse proxy and load balancing
- **PostgreSQL 15 Alpine** - Containerized database
- **Redis 7 Alpine** - Containerized cache
- **Health Checks** - Configured for all services

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
git clone https://github.com/Rahul5977/CodeArena.git
cd CodeArena

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
git clone https://github.com/Rahul5977/CodeArena.git
cd CodeArena

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
DATABASE_URL="postgresql://myuser:mypassword@localhost:5432/codearena"
REDIS_URL="redis://:redispassword@localhost:6379"

# Authentication
SECRET="your-super-secret-jwt-key-change-this-in-production"
REFRESH_SECRET="your-super-secret-refresh-key-change-this-in-production"

# External Services - Judge0 Code Execution
JUDGE0_API_URL="https://judge0-ce.p.sulu.sh"
SULU_API_KEY="your-judge0-api-key"

# Payment Gateway
RAZORPAY_KEY_ID="your-razorpay-key-id"
RAZORPAY_KEY_SECRET="your-razorpay-key-secret"

# Email Configuration (SMTP configured, not actively used)
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
CodeArena/
├── 📁 backend/                 # Node.js Express API Server
│   ├── 📁 src/
│   │   ├── 📁 controllers/      # Route handlers and business logic
│   │   │   ├── auth.controller.js
│   │   │   ├── problem.controller.js
│   │   │   ├── submission.controller.js
│   │   │   ├── contest.controller.js
│   │   │   ├── sheet.controller.js
│   │   │   ├── playlist.controller.js
│   │   │   ├── user.controller.js
│   │   │   └── admin.controller.js
│   │   ├── 📁 routes/          # API route definitions (11 route modules)
│   │   ├── 📁 middleware/      # Auth, validation, error handling
│   │   ├── 📁 libs/            # External service integrations (Judge0, Razorpay)
│   │   ├── 📁 utils/           # Utility functions and helpers
│   │   ├── 📁 generated/       # Prisma generated client
│   │   └── 📄 index.js         # Main server entry point
│   ├── 📁 prisma/
│   │   ├── 📁 migrations/      # Database migration files
│   │   └── 📄 schema.prisma    # Database schema definition
│   ├── 📄 Dockerfile           # Production Docker config
│   ├── 📄 Dockerfile.dev       # Development Docker config
│   └── 📄 package.json         # Backend dependencies
│
├── 📁 frontend/                # React Vite Application
│   ├── 📁 src/
│   │   ├── 📁 components/      # Reusable React components
│   │   │   ├── 📁 ui/          # Base UI components
│   │   │   ├── 📁 layout/      # Layout components (Navbar, Footer)
│   │   │   └── 📁 shared/      # Shared components
│   │   ├── 📁 pages/           # Route-based page components
│   │   │   ├── 📁 auth/        # Login, Register, ForgotPassword
│   │   │   ├── 📁 problems/    # Problem list, Problem solver
│   │   │   ├── 📁 contests/    # Contest list, Contest detail
│   │   │   ├── 📁 sheets/      # DSA sheets, Sheet detail
│   │   │   ├── 📁 playlists/   # Playlist management
│   │   │   ├── 📁 dashboard/   # User dashboard
│   │   │   └── 📁 admin/       # Admin panel
│   │   ├── 📁 contexts/        # React context providers (Auth, Theme)
│   │   ├── 📁 stores/          # Zustand state management
│   │   ├── 📁 services/        # API service functions
│   │   ├── 📁 utils/           # Utility functions
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
│   └── 📁 ssl/                 # SSL certificates directory
│
├── 📁 docs/                    # Project Documentation
│   ├── 📄 API_DOCS.md          # API endpoint documentation
│   ├── 📄 SHEETS_TESTING_GUIDE.md  # DSA sheets testing guide
│   ├── 📄 DASHBOARD_TESTING_GUIDE.md  # Dashboard testing guide
│   ├── 📄 CODE_EXECUTION_TESTING.md  # Code execution testing
│   ├── 📄 IMPLEMENTATION_SUMMARY.md  # Feature implementation summary
│   ├── 📄 PROJECT_SUMMARY.md   # Comprehensive project summary
│   └── (40+ additional documentation files)
│
├── 📄 docker-compose.yml       # Production compose config
├── 📄 docker-compose.dev.yml   # Development compose config
├── 📄 init-db.sql             # Database initialization
├── 📄 test-sheets.sql         # Test DSA sheets data
├── 📄 sample-problem.sql      # Sample problem data
├── 📄 more-problems.sql       # Additional problems
├── 📄 .env.example            # Environment variables template
├── 📄 SHEETS_TESTING_GUIDE.md # Sheet testing guide
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

The application uses a comprehensive Prisma schema with the following main models:

- **User**: Authentication, profiles, roles (USER, ADMIN, SUPERADMIN)
  - Fields: id, name, email, password, role, refreshToken, passwordResetToken, isActive, emailVerified
  - Relations: submissions, problems, playlists, contest participation, sheet purchases
  
- **Problem**: Coding challenges with test cases
  - Fields: id, title, description, difficulty (EASY, MEDIUM, HARD), tags, examples, constraints, hints, editorial
  - Relations: submissions, sheet problems, contest problems, playlists
  
- **Submission**: Code submissions and results
  - Fields: id, userId, problemId, code, language, status, runtime, memory, createdAt
  - Relations: user, problem, test case results
  
- **TestCaseResult**: Individual test case execution results
  - Fields: id, submissionId, input, expectedOutput, actualOutput, status, executionTime
  
- **Contest**: Timed competitions
  - Fields: id, title, description, startTime, endTime, status (UPCOMING, LIVE, COMPLETED, CANCELLED)
  - Relations: participants, submissions, leaderboard, problems
  
- **ContestParticipant**: User contest registrations
- **ContestSubmission**: Contest-specific submissions with scores
- **ContestLeaderboard**: Real-time contest rankings
  
- **Sheet**: DSA practice sheets
  - Fields: id, title, description, type (FREE, PREMIUM), price, difficulty, estimatedHours
  - Relations: sheet problems, user purchases, progress tracking
  
- **UserSheet**: Sheet purchases via Razorpay
  - Fields: id, userId, sheetId, paymentId, amount, status, purchaseDate
  
- **SheetProgress**: Problem-by-problem progress in sheets
  - Fields: id, userId, sheetId, problemId, isCompleted, completedAt
  
- **Playlist**: User-created problem collections
  - Fields: id, name, description, userId, createdAt
  - Relations: problems
  
- **Payment**: Transaction records
  - Fields: id, userId, razorpayOrderId, razorpayPaymentId, amount, status
  
- **UserSession**: Session management
  - Fields: id, userId, sessionToken, expiresAt
  
- **RoleChange**: Audit trail for user role modifications
  - Fields: id, userId, changedBy, previousRole, newRole, reason, createdAt

### Key Relationships

```
User 1---* Submission
User 1---* Payment
User 1---* Playlist
User 1---* ProblemSolved
User 1---* UserSheet
User 1---* ContestParticipant
Problem 1---* Submission
Problem 1---* TestCaseResult
Sheet 1---* SheetProblem *---1 Problem
Contest 1---* ContestProblem *---1 Problem
Contest 1---* ContestParticipant *---1 User
```

## ✅ Implemented Features

### 🔐 Authentication & Authorization System
- **Complete JWT-based authentication** with access and refresh tokens
- **Role-based access control** supporting three roles: USER, ADMIN, SUPERADMIN
- **Session management** with UserSession model and automatic cleanup
- **Password reset** functionality with secure token generation
- **Email verification** system (infrastructure ready)
- **Account status management** (active/inactive users)

### 💻 Code Execution Engine
- **Judge0 API integration** for real-time code compilation and execution
- **Multi-language support**: Python, Java, JavaScript, C++, C
- **Batch submission processing** for running multiple test cases
- **Detailed execution results** with runtime, memory usage, and error messages
- **Test case management** with expected vs actual output comparison
- **Submission history** tracking all code submissions per user

### 🧩 Problem Management System
- **CRUD operations** for problems (admin/superadmin only)
- **Rich problem metadata**: title, description, difficulty, tags, examples, constraints
- **Editorial support** with hints and detailed solutions
- **Test cases** stored in JSON format with input/output pairs
- **Code snippets** for different languages as starter templates
- **Problem-solving tracking** per user with ProblemSolved model
- **Search and filter** by difficulty, tags, and completion status

### 🏆 Contest Management
- **Full contest lifecycle**: UPCOMING → LIVE → COMPLETED
- **Contest registration** system with ContestParticipant tracking
- **Real-time leaderboards** with Socket.IO integration
- **Contest-specific submissions** with scoring and ranking
- **Time-based duration** management with automatic status updates
- **Penalty system** for wrong submissions
- **Multiple problems per contest** with ContestProblem association

### 📚 DSA Sheets System
- **Free and Premium sheets** with type-based access control
- **Razorpay payment integration** for premium sheet purchases
- **Sheet progress tracking** per problem for each user
- **Curated problem collections** organized by topics and difficulty
- **Estimated completion time** for each sheet
- **Prerequisites and topics** metadata for better organization
- **Purchase history** tracking with payment records

### 📋 Playlist Feature
- **User-created custom playlists** for organizing problems
- **Add/remove problems** from playlists dynamically
- **Playlist management** (create, update, delete)
- **Personal problem collections** for focused practice

### 👥 Admin Features
- **User management**: view all users, search, filter by role
- **Role modification**: promote/demote users with audit trail (RoleChange model)
- **Problem creation and management** through admin interface
- **Contest management**: create, update, cancel contests
- **Sheet management**: create and manage DSA sheets
- **Statistics dashboard** for system overview
- **Permission-based access control** for sensitive operations

### 👤 User Dashboard
- **Profile management**: update name, email, profile image
- **Activity feed** showing recent submissions
- **Statistics display**: problems solved, submission count, accuracy
- **Recent submissions** with status and language information
- **Progress visualization** for problem-solving journey
- **Problem recommendations** based on user history

### 🎨 Frontend Features
- **Dark/Light theme toggle** with persistent storage
- **Monaco Editor integration** with VS Code features
- **Split pane layout** for problem description and code editor
- **Custom test case input/output** for debugging
- **Loading states and error handling** throughout the app
- **Toast notifications** for user feedback
- **Responsive design** with Tailwind CSS
- **Smooth animations** with Framer Motion

### 🔧 Technical Features
- **Type-safe database operations** with Prisma ORM
- **RESTful API design** with 11 route modules
- **Comprehensive error handling** with custom middleware
- **Input validation** on all API endpoints
- **Password hashing** with bcryptjs
- **Redis session storage** for performance
- **Health check endpoints** for monitoring
- **Docker containerization** for easy deployment

### 📝 Current Limitations
- **Email notifications**: SMTP configured but not actively used
- **AI code review**: Endpoint stub exists but not fully implemented
- **Advanced analytics**: Basic statistics present, advanced features planned
- **Admin UI**: Some admin components are stubs requiring full implementation

## 🧪 Testing

### Backend Testing

The backend includes several SQL files for testing and seeding:

```bash
# Initialize database
psql -U myuser -d postgres -f init-db.sql

# Load test DSA sheets
psql -U myuser -d postgres -f test-sheets.sql

# Load sample problems
psql -U myuser -d postgres -f sample-problem.sql

# Load additional problems
psql -U myuser -d postgres -f more-problems.sql
```

### Testing Guides

The project includes comprehensive testing documentation in the `/docs` directory:

- **SHEETS_TESTING_GUIDE.md**: Complete guide for testing DSA sheets functionality
- **DASHBOARD_TESTING_GUIDE.md**: Dashboard feature testing guide
- **CODE_EXECUTION_TESTING.md**: Code execution and Judge0 integration testing

### API Testing

Use the provided API documentation or test manually:

```bash
# Health check
curl http://localhost:8080/api/v1/health

# Authentication
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Judge0 Integration Testing

Test code execution with supported languages:
- Python (language_id: 71)
- Java (language_id: 62)
- JavaScript (language_id: 63)
- C++ (language_id: 54)
- C (language_id: 50)

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
git clone https://github.com/Rahul5977/CodeArena.git
cd CodeArena

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
git clone https://github.com/Rahul5977/CodeArena.git
cd CodeArena
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

- **[React](https://react.dev/)** - Frontend framework (v19)
- **[Node.js](https://nodejs.org/)** - Backend runtime
- **[PostgreSQL](https://postgresql.org/)** - Primary database (v15)
- **[Prisma](https://prisma.io/)** - Database ORM and migrations (v6.12)
- **[Docker](https://docker.com/)** - Containerization platform

### UI & Design

- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework (v4)
- **[Lucide React](https://lucide.dev/)** - Beautiful icon library
- **[Monaco Editor](https://microsoft.github.io/monaco-editor/)** - Code editor
- **[DaisyUI](https://daisyui.com/)** - Tailwind CSS component library
- **[Framer Motion](https://www.framer.com/motion/)** - Animation library

### External Services

- **[Judge0](https://judge0.com/)** - Code execution API
- **[Razorpay](https://razorpay.com/)** - Payment processing
- **[Redis](https://redis.io/)** - In-memory data structure store (v7)

### State Management & Routing

- **[Zustand](https://zustand-demo.pmnd.rs/)** - Lightweight state management
- **[React Router](https://reactrouter.com/)** - Client-side routing (v7)

### Community

Special thanks to all contributors, testers, and users who help make CodeArena better!

---

## 📞 Support

- **Documentation**: [docs/ directory](docs/) - Comprehensive project documentation
- **Issues**: [GitHub Issues](https://github.com/Rahul5977/CodeArena/issues)
- **Repository**: [https://github.com/Rahul5977/CodeArena](https://github.com/Rahul5977/CodeArena)

---

<div align="center">

**[⬆ Back to Top](#-codearena---advanced-competitive-programming-platform)**

Made with ❤️ by the CodeArena Team

</div>
