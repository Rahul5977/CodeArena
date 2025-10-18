# LeetLab Frontend - Quick Start Guide

## 🚀 Get Started in 3 Steps

### 1. Start the Backend

```bash
cd /Users/rahulraj/Desktop/LeetLab

# Start all services (PostgreSQL, Redis, Backend, Frontend)
docker-compose -f docker-compose.dev.yml up
```

**Or start services individually:**

```bash
# Backend only
cd backend
npm install
npm run dev

# Frontend only
cd frontend
npm install
npm run dev
```

### 2. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **Backend Health**: http://localhost:8080/api/v1/auth/health

### 3. Test the Features

#### Create Your First Account

1. Go to http://localhost:3000/register
2. Fill in your details
3. Watch the password strength indicator
4. Click "Create Account"
5. You'll be auto-logged in!

#### Try Login

1. Go to http://localhost:3000/login
2. Email: `your@email.com`
3. Password: `your-password`
4. Click "Log In"

#### Explore Features

- **Home** (`/`): See your dashboard
- **Profile** (`/profile`): View/edit your profile, change password
- **Problems** (`/problems`): Browse coding problems
- **Playlists** (`/playlists`): Study curated problem sets
- **Contests** (`/contests`): Join coding contests

## 🔑 Test Accounts

Create an account or use these credentials if you've seeded the database:

```
Email: admin@leetlab.com
Password: Admin123!
Role: SUPERADMIN
```

```
Email: user@leetlab.com
Password: User123!
Role: USER
```

## 🛠️ Configuration

### Frontend Environment (.env)

```env
VITE_API_URL=http://localhost:8080/api/v1
VITE_WS_URL=ws://localhost:8080
```

### Backend Environment

Already configured in `docker-compose.dev.yml`:

- Database: PostgreSQL on port 5432
- Redis: Redis on port 6379
- API: Express on port 8080

## 📋 Available Pages

### Public (No Auth Required)

- `/login` - Login page
- `/register` - Registration page
- `/forgot-password` - Request password reset
- `/reset-password/:token` - Reset password with token

### Protected (Auth Required)

- `/` - Home/Dashboard
- `/profile` - User profile & settings
- `/problems` - Browse problems
- `/playlists` - Study playlists
- `/sheets` - Problem sheets
- `/contests` - Coding contests
- `/submissions` - Your submissions

### Admin Only (ADMIN/SUPERADMIN)

- `/admin` - Admin dashboard
- `/admin/users` - User management (SUPERADMIN only)
- `/admin/contests` - Contest management
- `/admin/sheets` - Sheet management

## 🎯 Key Features to Test

### 1. Password Strength Indicator

On registration page, type a password and watch:

- Color changes (Red → Yellow → Green)
- Strength text updates (Weak → Medium → Strong)
- Suggestions appear for improvements

### 2. Form Validation

Try submitting forms with:

- Empty fields
- Invalid email format
- Mismatched passwords
- Short passwords

### 3. RBAC (Role-Based Access)

- Login as regular user → Admin link hidden
- Login as ADMIN → Admin link visible
- Try accessing `/admin` as regular user → Redirected

### 4. Protected Routes

- Logout
- Try accessing `/profile` → Redirected to login
- Login again → Access granted

### 5. Dark/Light Mode

Click the sun/moon icon in navbar to toggle theme

### 6. Responsive Design

- Resize browser window
- Check mobile menu (hamburger icon)
- Test on mobile device

## 🐛 Troubleshooting

### Backend not starting?

```bash
# Check if containers are running
docker ps

# View logs
docker-compose -f docker-compose.dev.yml logs backend

# Restart services
docker-compose -f docker-compose.dev.yml restart
```

### Frontend not loading?

```bash
# Check if dev server is running
cd frontend
npm run dev

# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Can't login?

1. Check backend is running: http://localhost:8080/api/v1/auth/health
2. Check browser console for errors
3. Verify credentials are correct
4. Check backend logs for errors

### CORS errors?

- Frontend must be on http://localhost:3000
- Backend must be on http://localhost:8080
- Check `.env` file has correct `VITE_API_URL`

## 📚 Next Steps

1. ✅ Test all authentication flows
2. ✅ Try creating problems, playlists, contests
3. ✅ Test RBAC features
4. ✅ Explore the codebase
5. ✅ Read `FRONTEND_README.md` for detailed docs

## 💡 Pro Tips

- **First user** is automatically SUPERADMIN
- **Cookies** are used for auth (httpOnly, secure)
- **Token refresh** happens automatically on 401
- **Toasts** show success/error messages (top-right)
- **Dark mode** is default (toggle in navbar)

## 🎉 You're All Set!

The frontend is production-ready with:

- ✅ Complete authentication flow
- ✅ Password strength indicator
- ✅ Protected routes & RBAC
- ✅ Modern UI with animations
- ✅ Responsive design
- ✅ Form validation
- ✅ Error handling
- ✅ Cookie-based auth

Start coding and enjoy LeetLab! 🚀
