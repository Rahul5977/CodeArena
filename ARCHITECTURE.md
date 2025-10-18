# 🏗️ LeetLab Frontend Architecture Guide

## 📁 Complete File Structure

```
frontend/src/
├── assets/
│   └── images/
├── components/
│   ├── Layout.jsx ✅
│   ├── Navbar.jsx ✅
│   ├── Sidebar.jsx ✅
│   ├── ProtectedRoute.jsx ✅
│   ├── LoadingSpinner.jsx ✅
│   ├── ErrorBoundary.jsx 🔴
│   ├── Toast.jsx 🔴
│   ├── Modal.jsx 🔴
│   ├── CodeEditor.jsx 🔴 (Monaco wrapper)
│   ├── ProblemCard.jsx 🔴
│   ├── ContestCard.jsx 🔴
│   ├── SheetCard.jsx 🔴
│   ├── SubmissionCard.jsx 🔴
│   ├── StatsCard.jsx 🔴
│   ├── ProgressBar.jsx 🔴
│   ├── Timer.jsx 🔴
│   ├── Pagination.jsx 🔴
│   └── SearchBar.jsx 🔴
├── contexts/
│   ├── AuthContext.jsx ✅
│   ├── ToastContext.jsx ✅
│   └── SocketContext.jsx 🔴
├── hooks/
│   ├── useAuth.js 🔴
│   ├── useSocket.js 🔴
│   ├── useDebounce.js 🔴
│   ├── useLocalStorage.js 🔴
│   └── useAsync.js 🔴
├── pages/
│   ├── auth/
│   │   ├── Login.jsx ✅
│   │   ├── Register.jsx 🟡
│   │   ├── ForgotPassword.jsx 🔴
│   │   └── ResetPassword.jsx 🔴
│   ├── Dashboard.jsx 🟡
│   ├── Profile.jsx ✅
│   ├── problems/
│   │   ├── Problems.jsx ✅
│   │   └── ProblemDetails.jsx 🔴
│   ├── contests/
│   │   ├── ContestList.jsx 🔴
│   │   ├── ContestDetail.jsx 🔴
│   │   ├── ContestLeaderboard.jsx 🔴
│   │   └── ContestSubmit.jsx 🔴
│   ├── sheets/
│   │   ├── SheetList.jsx 🔴
│   │   └── SheetDetail.jsx 🔴
│   ├── playlists/
│   │   ├── Playlists.jsx 🔴
│   │   └── PlaylistDetail.jsx 🔴
│   ├── submissions/
│   │   └── Submissions.jsx 🔴
│   └── admin/
│       ├── AdminDashboard.jsx 🔴
│       ├── UserManagement.jsx 🔴
│       ├── ProblemManagement.jsx 🔴
│       ├── ContestManagement.jsx 🔴
│       └── SheetManagement.jsx 🔴
├── utils/
│   ├── api.js ✅
│   ├── socket.js ✅
│   ├── constants.js 🔴
│   ├── helpers.js 🔴
│   └── validators.js 🔴
├── App.jsx ✅
├── main.jsx ✅
└── index.css ✅

Legend: ✅ Done | 🟡 Partial | 🔴 To Do
```

---

## 🎨 Component Design Patterns

### 1. Page Components (Smart Components)

```jsx
// Example: ProblemDetails.jsx
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import CodeEditor from "../../components/CodeEditor";
import api from "../../utils/api";

const ProblemDetails = () => {
  const { id } = useParams();
  const [problem, setProblem] = useState(null);
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProblem();
  }, [id]);

  const fetchProblem = async () => {
    // API call
  };

  const handleRunCode = async () => {
    // Execute code
  };

  const handleSubmit = async () => {
    // Submit solution
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Problem Description */}
      <div className="bg-base-100 p-6 rounded-lg">{/* Content */}</div>

      {/* Code Editor */}
      <div>
        <CodeEditor code={code} onChange={setCode} language={language} />
      </div>
    </div>
  );
};

export default ProblemDetails;
```

### 2. Reusable Components (Dumb Components)

```jsx
// Example: CodeEditor.jsx
import { Editor } from "@monaco-editor/react";

const CodeEditor = ({ code, onChange, language, theme = "vs-dark" }) => {
  return (
    <Editor
      height="500px"
      language={language}
      value={code}
      onChange={onChange}
      theme={theme}
      options={{
        minimap: { enabled: false },
        fontSize: 14,
        lineNumbers: "on",
        scrollBeyondLastLine: false,
      }}
    />
  );
};

export default CodeEditor;
```

### 3. Custom Hooks

```jsx
// Example: useSocket.js
import { useEffect, useState } from "react";
import { io } from "socket.io-client";

export const useSocket = (url) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socketInstance = io(url);

    socketInstance.on("connect", () => {
      setConnected(true);
    });

    socketInstance.on("disconnect", () => {
      setConnected(false);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [url]);

  return { socket, connected };
};
```

---

## 🔌 API Integration Pattern

### API Service Structure:

```javascript
// utils/api.js
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1",
  withCredentials: true,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle token refresh
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// API endpoints
export const authAPI = {
  login: (data) => api.post("/auth/login", data),
  register: (data) => api.post("/auth/register", data),
  logout: () => api.post("/auth/logout"),
  getProfile: () => api.get("/auth/profile"),
};

export const problemAPI = {
  getAll: (params) => api.get("/problems", { params }),
  getById: (id) => api.get(`/problems/${id}`),
  create: (data) => api.post("/problems", data),
  update: (id, data) => api.put(`/problems/${id}`, data),
  delete: (id) => api.delete(`/problems/${id}`),
};

export const submissionAPI = {
  create: (data) => api.post("/submission", data),
  getAll: () => api.get("/submission"),
  getByProblem: (problemId) => api.get(`/submission/problem/${problemId}`),
};

export const contestAPI = {
  getAll: () => api.get("/contests"),
  getById: (id) => api.get(`/contests/${id}`),
  register: (id) => api.post(`/contests/${id}/register`),
  submit: (id, data) => api.post(`/contests/${id}/submit`, data),
  getLeaderboard: (id) => api.get(`/contests/${id}/leaderboard`),
};

export default api;
```

---

## 🎨 UI Component Library (DaisyUI)

### Essential DaisyUI Components:

#### 1. Cards

```jsx
<div className="card bg-base-100 shadow-xl">
  <div className="card-body">
    <h2 className="card-title">Title</h2>
    <p>Content</p>
    <div className="card-actions justify-end">
      <button className="btn btn-primary">Action</button>
    </div>
  </div>
</div>
```

#### 2. Badges

```jsx
<span className="badge badge-success">Easy</span>
<span className="badge badge-warning">Medium</span>
<span className="badge badge-error">Hard</span>
```

#### 3. Stats

```jsx
<div className="stats shadow">
  <div className="stat">
    <div className="stat-title">Problems Solved</div>
    <div className="stat-value">145</div>
    <div className="stat-desc">↗︎ 12 (9%)</div>
  </div>
</div>
```

#### 4. Tables

```jsx
<table className="table table-zebra">
  <thead>
    <tr>
      <th>Title</th>
      <th>Status</th>
      <th>Time</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Two Sum</td>
      <td>
        <span className="badge badge-success">Accepted</span>
      </td>
      <td>2 hours ago</td>
    </tr>
  </tbody>
</table>
```

#### 5. Modals

```jsx
<dialog id="my_modal" className="modal">
  <div className="modal-box">
    <h3 className="font-bold text-lg">Modal Title</h3>
    <p className="py-4">Content</p>
    <div className="modal-action">
      <form method="dialog">
        <button className="btn">Close</button>
      </form>
    </div>
  </div>
</dialog>
```

---

## 🔥 State Management Pattern

### Using Context + Hooks (No Redux needed for this scale)

```jsx
// contexts/SocketContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    const socketInstance = io(import.meta.env.VITE_WS_URL);

    socketInstance.on("leaderboard:update", (data) => {
      setLeaderboard(data);
    });

    setSocket(socketInstance);

    return () => socketInstance.disconnect();
  }, []);

  return (
    <SocketContext.Provider value={{ socket, leaderboard }}>{children}</SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
```

---

## 🎯 Key Features Implementation Guide

### 1. Code Editor (Monaco)

```jsx
import { Editor } from "@monaco-editor/react";

const CodeEditor = ({ code, onChange, language }) => {
  const editorOptions = {
    minimap: { enabled: false },
    fontSize: 14,
    scrollBeyondLastLine: false,
    wordWrap: "on",
    automaticLayout: true,
  };

  return (
    <Editor
      height="500px"
      language={language}
      value={code}
      onChange={onChange}
      theme="vs-dark"
      options={editorOptions}
    />
  );
};
```

### 2. Countdown Timer

```jsx
const Timer = ({ endTime }) => {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const end = new Date(endTime);
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft("Contest Ended");
        clearInterval(interval);
        return;
      }

      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);

      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
    }, 1000);

    return () => clearInterval(interval);
  }, [endTime]);

  return <div className="text-2xl font-bold">{timeLeft}</div>;
};
```

### 3. Payment Integration (Razorpay)

```jsx
const handlePayment = async (sheetId) => {
  try {
    // Create order
    const { data } = await api.post("/sheets/payment/create", { sheetId });

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY,
      amount: data.amount,
      currency: data.currency,
      name: "LeetLab",
      description: "Premium Sheet Purchase",
      order_id: data.orderId,
      handler: async (response) => {
        // Verify payment
        await api.post("/sheets/payment/verify", {
          orderId: data.orderId,
          paymentId: response.razorpay_payment_id,
          signature: response.razorpay_signature,
        });
        showSuccess("Payment successful!");
      },
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  } catch (error) {
    showError("Payment failed");
  }
};
```

---

## 🚦 Routing Structure

```jsx
// App.jsx
<Routes>
  {/* Public Routes */}
  <Route path="/login" element={<Login />} />
  <Route path="/register" element={<Register />} />

  {/* Protected Routes */}
  <Route element={<ProtectedRoute />}>
    <Route element={<Layout />}>
      <Route path="/" element={<Dashboard />} />
      <Route path="/problems" element={<Problems />} />
      <Route path="/problems/:id" element={<ProblemDetails />} />
      <Route path="/contests" element={<ContestList />} />
      <Route path="/contests/:id" element={<ContestDetail />} />
      <Route path="/contests/:id/leaderboard" element={<ContestLeaderboard />} />
      <Route path="/sheets" element={<SheetList />} />
      <Route path="/sheets/:id" element={<SheetDetail />} />
      <Route path="/playlists" element={<Playlists />} />
      <Route path="/playlists/:id" element={<PlaylistDetail />} />
      <Route path="/submissions" element={<Submissions />} />
      <Route path="/profile" element={<Profile />} />
    </Route>
  </Route>

  {/* Admin Routes */}
  <Route element={<ProtectedRoute requiredRole="ADMIN" />}>
    <Route element={<Layout />}>
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/users" element={<UserManagement />} />
      <Route path="/admin/problems" element={<ProblemManagement />} />
      <Route path="/admin/contests" element={<ContestManagement />} />
      <Route path="/admin/sheets" element={<SheetManagement />} />
    </Route>
  </Route>
</Routes>
```

---

## 📱 Responsive Design Guidelines

### Breakpoints:

- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

### Grid Patterns:

```jsx
{
  /* Mobile: 1 col, Tablet: 2 cols, Desktop: 3 cols */
}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {items.map((item) => (
    <Card key={item.id} {...item} />
  ))}
</div>;
```

### Responsive Text:

```jsx
<h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">Title</h1>
```

---

## 🔒 Security Best Practices

1. **Token Management:**

   - Store JWT in httpOnly cookies (backend handled)
   - Fallback to localStorage with encryption
   - Implement token refresh logic

2. **API Security:**

   - Always validate input on frontend
   - Sanitize user input before display
   - Implement rate limiting UI feedback

3. **XSS Prevention:**

   - Use dangerouslySetInnerHTML carefully
   - Sanitize HTML content
   - Use libraries like DOMPurify

4. **CSRF Protection:**
   - Backend handles CSRF tokens
   - Include credentials in requests

---

## 🧪 Testing Checklist

### Manual Testing:

- [ ] Login/Register flow
- [ ] Problem solve and submit
- [ ] Contest registration and participation
- [ ] Sheet purchase and progress
- [ ] Playlist creation and management
- [ ] Admin panel functions
- [ ] Real-time features
- [ ] Mobile responsiveness
- [ ] Cross-browser compatibility

### Edge Cases:

- [ ] Empty states (no data)
- [ ] Loading states
- [ ] Error states (API failures)
- [ ] Network offline
- [ ] Token expiration
- [ ] Concurrent submissions
- [ ] Large data sets
- [ ] Slow network

---

## 📈 Performance Optimization

### Code Splitting:

```jsx
import { lazy, Suspense } from 'react'

const ProblemDetails = lazy(() => import('./pages/problems/ProblemDetails'))

<Suspense fallback={<LoadingSpinner />}>
  <ProblemDetails />
</Suspense>
```

### Image Optimization:

```jsx
<img src={url} loading="lazy" alt={alt} className="w-full h-auto" />
```

### Debouncing:

```jsx
const debouncedSearch = useDebounce(searchQuery, 500);

useEffect(() => {
  if (debouncedSearch) {
    performSearch(debouncedSearch);
  }
}, [debouncedSearch]);
```

---

**Happy Coding! 🚀**
