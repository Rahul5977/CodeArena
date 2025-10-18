# LeetLab Frontend

A modern, production-ready frontend for the LeetLab coding platform built with **Vite + React**.

## 🚀 Features

- **Complete Authentication Flow**

  - Login with email/password
  - Registration with password strength indicator
  - Forgot/Reset password functionality
  - Protected routes with RBAC (Role-Based Access Control)
  - Cookie-based JWT authentication

- **Modern UI/UX**

  - Glassmorphism design
  - Dark/Light mode toggle
  - Smooth animations with Framer Motion
  - Responsive design (mobile-first)
  - Accessible components (ARIA attributes)

- **State Management**

  - Zustand for global auth state
  - React Context for toasts
  - Persistent authentication across page refreshes

- **Form Handling**

  - react-hook-form for performant forms
  - Zod for schema validation
  - Real-time validation feedback
  - Password strength indicator

- **API Integration**
  - Axios with interceptors
  - Automatic token refresh
  - Cookie-based authentication (httpOnly)
  - Error handling and retries

## 📦 Tech Stack

| Package             | Purpose                 |
| ------------------- | ----------------------- |
| **Vite**            | Build tool & dev server |
| **React 19**        | UI library              |
| **React Router v7** | Client-side routing     |
| **Zustand**         | State management        |
| **Axios**           | HTTP client             |
| **React Hook Form** | Form management         |
| **Zod**             | Schema validation       |
| **Framer Motion**   | Animations              |
| **TailwindCSS**     | Utility-first CSS       |
| **DaisyUI**         | Component library       |
| **React Icons**     | Icon library            |

## 🔧 Environment Configuration

Create a `.env` file in the `frontend` directory:

```env
# API Configuration
VITE_API_URL=http://localhost:8080/api/v1

# WebSocket Configuration (optional)
VITE_WS_URL=ws://localhost:8080
```

### Environment Variables

| Variable       | Description              | Default                        |
| -------------- | ------------------------ | ------------------------------ |
| `VITE_API_URL` | Backend API base URL     | `http://localhost:8080/api/v1` |
| `VITE_WS_URL`  | WebSocket URL (optional) | `ws://localhost:8080`          |

## 🏗️ Project Structure

```
frontend/
├── src/
│   ├── assets/           # Static assets (images, fonts)
│   ├── components/       # Reusable components
│   │   ├── Layout.jsx
│   │   ├── Navbar.jsx
│   │   ├── ProtectedRoute.jsx
│   │   └── LoadingSpinner.jsx
│   ├── contexts/         # React contexts
│   │   ├── AuthContext.jsx
│   │   └── ToastContext.jsx
│   ├── lib/              # Utilities and configurations
│   │   └── apiClient.js  # Axios instance with interceptors
│   ├── pages/            # Page components
│   │   ├── auth/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── ForgotPassword.jsx
│   │   │   └── ResetPassword.jsx
│   │   ├── Home.jsx
│   │   ├── Profile.jsx
│   │   ├── problems/
│   │   ├── playlists/
│   │   ├── contests/
│   │   ├── sheets/
│   │   └── admin/
│   ├── services/         # API service layer
│   │   └── authService.js
│   ├── stores/           # Zustand stores
│   │   └── authStore.js
│   ├── utils/            # Helper functions
│   ├── App.jsx           # Main app component
│   ├── main.jsx          # Entry point
│   └── index.css         # Global styles
├── public/               # Public assets
├── .env                  # Environment variables
├── .env.example          # Example env file
├── vite.config.js        # Vite configuration
├── tailwind.config.js    # Tailwind CSS config
└── package.json
```

## 🚦 Getting Started

### Prerequisites

- Node.js (v18+)
- npm or yarn
- Backend server running on `http://localhost:8080`

### Installation

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:3000`

### Build for Production

```bash
# Create optimized production build
npm run build

# Preview production build
npm run preview
```

## 🔐 Authentication Flow

### How Authentication Works

1. **Login**: User enters credentials → Backend validates → Sets httpOnly cookie → Returns user data
2. **Cookie Storage**: JWT is stored in httpOnly cookie (secure, not accessible via JavaScript)
3. **API Requests**: Axios automatically sends cookies with `withCredentials: true`
4. **Token Refresh**: Interceptor catches 401 errors → Attempts token refresh → Retries original request
5. **Logout**: Clears cookie on backend → Clears user state on frontend

### Backend Endpoints Expected

| Method | Endpoint                | Description            | Request Body                   | Response                            |
| ------ | ----------------------- | ---------------------- | ------------------------------ | ----------------------------------- |
| POST   | `/auth/register`        | Create new account     | `{ name, email, password }`    | `{ success: true, data: { user } }` |
| POST   | `/auth/login`           | Login user             | `{ email, password }`          | `{ success: true, data: { user } }` |
| POST   | `/auth/logout`          | Logout user            | -                              | `{ success: true }`                 |
| GET    | `/auth/me`              | Get current user       | -                              | `{ success: true, data: { user } }` |
| POST   | `/auth/forgot-password` | Request password reset | `{ email }`                    | `{ success: true, message }`        |
| POST   | `/auth/reset-password`  | Reset password         | `{ token, newPassword }`       | `{ success: true }`                 |
| POST   | `/auth/change-password` | Change password        | `{ oldPassword, newPassword }` | `{ success: true }`                 |
| POST   | `/auth/refresh-token`   | Refresh JWT token      | -                              | `{ success: true }`                 |

### User Object Structure

```javascript
{
  id: "uuid",
  name: "John Doe",
  email: "john@example.com",
  role: "USER" | "ADMIN" | "SUPERADMIN",
  image: "url", // optional
  createdAt: "ISO date string"
}
```

## 🎨 UI Components & Features

### Authentication Pages

#### Login (`/login`)

- Email and password fields with validation
- Show/hide password toggle
- "Remember me" checkbox (optional)
- Forgot password link
- Redirect to registration
- Loading states
- Error handling with toasts

#### Registration (`/register`)

- Name, email, password, and confirm password fields
- Real-time password strength indicator
- Color-coded strength meter (Weak/Medium/Strong)
- Suggestions to improve password strength
- Client-side validation with Zod
- Server error handling

#### Forgot Password (`/forgot-password`)

- Email input field
- Success message after submission
- Resend email option

#### Reset Password (`/reset-password/:token`)

- New password and confirm password fields
- Token validation
- Password strength indicator
- Redirect to login on success

### Protected Pages

#### Home/Dashboard (`/`)

- Welcome message with user name
- Statistics cards (problems solved, success rate, etc.)
- Quick action buttons
- Recent activity feed
- Featured learning paths

#### Profile (`/profile`)

- View user information (name, email, role)
- Change password form
- Account statistics
- Role badge (USER/ADMIN/SUPERADMIN)

### Navigation

#### Navbar

- Logo and branding
- Main navigation links
- Dark/Light mode toggle
- User profile dropdown
- Logout button
- Responsive mobile menu
- RBAC-aware links (Admin panel visible only for ADMIN/SUPERADMIN)

## 🔒 Role-Based Access Control (RBAC)

### User Roles

1. **USER**: Default role, access to basic features
2. **ADMIN**: Access to admin panel, user management
3. **SUPERADMIN**: Full access to all features

### Implementation

```jsx
// Protect route with specific roles
<ProtectedRoute allowedRoles={["ADMIN", "SUPERADMIN"]}>
  <AdminPanel />
</ProtectedRoute>;

// Check role in component
const { user } = useAuthStore();
const isAdmin = user?.role === "ADMIN" || user?.role === "SUPERADMIN";

// Conditionally render UI
{
  isAdmin && <Link to="/admin">Admin Panel</Link>;
}
```

## 🌐 API Client Configuration

### Axios Instance (`src/lib/apiClient.js`)

```javascript
import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // Send cookies with requests
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add custom headers if needed
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 - Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh token
        await apiClient.post("/auth/refresh-token");

        // Retry original request
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Redirect to login
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
```

### Usage in Components

```javascript
import apiClient from "../lib/apiClient";

// GET request
const response = await apiClient.get("/problems");
const problems = response.data;

// POST request
const response = await apiClient.post("/auth/login", { email, password });

// PUT request
await apiClient.put("/users/123", { name: "New Name" });

// DELETE request
await apiClient.delete("/users/123");
```

## 🧪 Form Validation Examples

### Login Form Validation

```javascript
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});
```

### Registration Form Validation

```javascript
const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain uppercase letter")
      .regex(/[a-z]/, "Must contain lowercase letter")
      .regex(/[0-9]/, "Must contain number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });
```

## 🐛 Troubleshooting

### CORS Issues

If you encounter CORS errors, ensure your backend has proper CORS configuration:

```javascript
// Backend (Express)
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
```

### Cookie Not Being Sent

Make sure:

1. `withCredentials: true` is set in Axios config
2. Backend sets cookie with `httpOnly: true` and appropriate `sameSite` policy
3. Frontend and backend are on the same domain (or proper CORS is configured)

### Environment Variables Not Loading

- Restart dev server after changing `.env`
- Ensure variables are prefixed with `VITE_`
- Access with `import.meta.env.VITE_VARIABLE_NAME`

### Authentication Persists Across Refreshes

The app checks authentication status on mount:

```javascript
// In App.jsx
useEffect(() => {
  checkAuth(); // Calls GET /auth/me
}, []);
```

## 📝 Adding New Features

### Adding a New Protected Page

1. Create page component in `src/pages/`
2. Add route in `App.jsx`
3. Wrap with `ProtectedRoute` if authentication required

```jsx
<Route
  path="/new-page"
  element={
    <ProtectedRoute>
      <NewPage />
    </ProtectedRoute>
  }
/>
```

### Adding a New API Endpoint

1. Add function in appropriate service file (e.g., `src/services/authService.js`)
2. Use `apiClient` for requests
3. Handle errors appropriately

```javascript
export const newAPICall = async (data) => {
  try {
    const response = await apiClient.post("/new-endpoint", data);
    return response.data;
  } catch (error) {
    throw error;
  }
};
```

## 🤝 Contributing

1. Follow existing code structure
2. Use TypeScript types if available
3. Add proper error handling
4. Test authentication flows
5. Ensure responsive design
6. Follow accessibility guidelines

## 📄 License

MIT License - see LICENSE file for details

## 🙋 Support

For issues or questions:

- Check backend logs for API errors
- Verify environment variables are set correctly
- Ensure backend is running and accessible
- Check browser console for frontend errors

---

Built with ❤️ by the LeetLab Team
