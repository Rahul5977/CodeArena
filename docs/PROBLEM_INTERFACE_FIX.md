# Problem Interface API Fix

## 🔧 Issues Fixed

### Issue: "Failed to load problem"

**Root Cause**: Incorrect API endpoint paths in the frontend component.

**Backend Endpoints** (from `/backend/src/routes/problem.route.js`):

- Get all problems: `/api/v1/problems/get-all-problems`
- Get problem by ID: `/api/v1/problems/get-all-problems/:id`
- Execute code: `/api/v1/execute-code/`
- Get submissions: `/api/v1/submission/get-submission/:problemId`

**Frontend was using**:

- ❌ `/api/v1/problem/:id` (incorrect)
- ❌ `/api/v1/execute` (incorrect)

**Frontend now uses**:

- ✅ `/api/v1/problems/get-all-problems/:id` (correct)
- ✅ `/api/v1/execute-code` (correct)

---

## ✅ Changes Made

### 1. Fixed Problem Fetch Endpoint

**File**: `/frontend/src/pages/problems/ProblemDetails.jsx`

**Before**:

```javascript
const response = await apiClient.get(`/problem/${id}`);
```

**After**:

```javascript
const response = await apiClient.get(`/problems/get-all-problems/${id}`);
```

### 2. Fixed Execute Code Endpoint

**File**: `/frontend/src/pages/problems/ProblemDetails.jsx`

**Before**:

```javascript
const response = await apiClient.post("/execute", payload);
```

**After**:

```javascript
const response = await apiClient.post("/execute-code", payload);
```

---

## 🚀 How to Test

### 1. Make Sure Services Are Running

**Check Docker containers**:

```bash
docker ps
```

You should see:

- `leetlab-backend-dev` on port 8080
- `leetlab-frontend-dev` on port 3000
- `leetlab-postgres-dev` on port 5432
- `leetlab-redis-dev` on port 6379

**If not running, start them**:

```bash
cd /Users/rahulraj/Desktop/LeetLab
docker-compose -f docker-compose.dev.yml up -d
```

### 2. Access the Application

**Frontend**: http://localhost:3000  
**Backend API**: http://localhost:8080/api/v1

### 3. Test the Problem Interface

**Step 1: Login**

1. Go to http://localhost:3000/login
2. Login with your credentials
3. Make sure you're authenticated (check if cookies are set)

**Step 2: Navigate to Problems**

1. Click "Problems" in the navigation
2. Or go directly to: http://localhost:3000/problems

**Step 3: Open a Problem**

1. Click on any problem from the list
2. Or go directly to: http://localhost:3000/problems/1
3. The problem details should now load successfully

**Step 4: Test Code Execution**

1. Select a language from the dropdown
2. Write code or use the default template
3. Enter custom input (optional)
4. Click "Run Code"
5. Check if output is displayed

---

## 🔐 Authentication Requirements

**Important**: All problem endpoints require authentication!

If you see "Unauthorized user - No token provided", you need to:

1. **Login First**: Make sure you're logged in at http://localhost:3000/login
2. **Check Cookies**: Open DevTools (F12) → Application tab → Cookies → Check if tokens exist
3. **API Client**: The `apiClient.js` is configured with `withCredentials: true` to send cookies

---

## 📊 API Endpoint Reference

### Backend Endpoints (with auth)

#### Problems

```
GET /api/v1/problems/get-all-problems
GET /api/v1/problems/get-all-problems/:id
POST /api/v1/problems/create-problem (admin only)
PUT /api/v1/problems/update-problem/:id (admin only)
DELETE /api/v1/problems/delete-problem/:id (admin only)
GET /api/v1/problems/get-solved-problem
```

#### Code Execution

```
POST /api/v1/execute-code/
Body: {
  source_code: string,
  language_id: number,
  stdin: string[],
  expected_outputs: string[],
  problemId: string
}
```

#### Submissions

```
GET /api/v1/submission/get-all-submissions
GET /api/v1/submission/get-submission/:problemId
GET /api/v1/submission/get-submission-count/:problemId
```

---

## 🐛 Troubleshooting

### Problem 1: "Failed to load problem"

**Symptoms**: Error message appears, problem doesn't load

**Possible Causes**:

1. Not logged in
2. Backend not running
3. Invalid problem ID
4. Network/CORS issue

**Solutions**:

1. **Check Login Status**:

   - Open DevTools (F12) → Console
   - Type: `document.cookie`
   - Look for `accessToken` or `refreshToken`
   - If missing, login again

2. **Check Backend**:

   ```bash
   curl http://localhost:8080/api/v1/auth/check
   ```

   - Should respond (even if unauthorized)
   - If connection refused, backend isn't running

3. **Check Problem Exists**:

   ```bash
   # Test with curl (replace YOUR_TOKEN with actual token from cookies)
   curl http://localhost:8080/api/v1/problems/get-all-problems/1 \
     -H "Cookie: accessToken=YOUR_TOKEN"
   ```

4. **Check CORS**:
   - Open DevTools → Network tab
   - Look for CORS errors
   - Backend should allow `http://localhost:3000`

### Problem 2: "Cannot GET /api/v1/problem/1"

**Cause**: Using old endpoint path

**Solution**: This is already fixed! If you still see this:

1. Clear browser cache (Cmd+Shift+R)
2. Close and reopen browser
3. Make sure you're on port 3000 (not 3001)

### Problem 3: Run Code doesn't work

**Symptoms**: Click "Run Code" but nothing happens

**Possible Causes**:

1. Backend execution endpoint not working
2. Judge0 API not configured
3. Invalid code or language ID

**Solutions**:

1. **Check Console**:

   - Open DevTools → Console
   - Look for error messages
   - Network tab → Check if POST request to `/execute-code` succeeds

2. **Check Judge0 Configuration**:

   ```bash
   # Check backend logs
   docker logs leetlab-backend-dev
   ```

   - Look for Judge0 API errors
   - Make sure `SULU_API_KEY` is set in environment

3. **Test Execute Endpoint**:
   ```bash
   curl -X POST http://localhost:8080/api/v1/execute-code \
     -H "Content-Type: application/json" \
     -H "Cookie: accessToken=YOUR_TOKEN" \
     -d '{
       "source_code": "print(\"Hello World\")",
       "language_id": 71,
       "stdin": [""],
       "expected_outputs": ["Hello World"],
       "problemId": "1"
     }'
   ```

---

## 📝 Environment Variables

Make sure these are set in your Docker environment:

### Backend (.env or docker-compose.dev.yml)

```env
DATABASE_URL=postgresql://myuser:mypassword@postgres:5432/postgres
REDIS_URL=redis://:redispassword@redis:6379
SECRET=dev-secret-key
REFRESH_SECRET=dev-refresh-secret-key
JUDGE0_API_URL=https://judge0-ce.p.sulu.sh
SULU_API_KEY=your_sulu_api_key_here
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:8080/api/v1
VITE_WS_URL=ws://localhost:8080
```

---

## ✅ Verification Checklist

Before testing, verify:

- [ ] Docker containers are running (`docker ps`)
- [ ] Backend is accessible (`curl http://localhost:8080`)
- [ ] Frontend is accessible (`curl http://localhost:3000`)
- [ ] You have user credentials to login
- [ ] Database has at least one problem
- [ ] SULU_API_KEY is set (for code execution)

After testing, verify:

- [ ] Can login successfully
- [ ] Can see problems list
- [ ] Can open a problem details page
- [ ] Problem information loads (title, description, examples)
- [ ] Code editor appears
- [ ] Language dropdown works
- [ ] Can type in code editor
- [ ] Run Code button works (even if Judge0 fails)
- [ ] Output section shows results or errors

---

## 🎯 Next Steps

1. **Test the fixes**: Follow the testing steps above
2. **Check authentication**: Make sure you can login
3. **Test problem loading**: Try opening different problems
4. **Test code execution**: Try running code with different languages
5. **Report issues**: If still not working, check:
   - Browser console errors
   - Network tab in DevTools
   - Backend logs: `docker logs leetlab-backend-dev`

---

## 📚 Related Documentation

- **Testing Guide**: `/docs/PROBLEM_INTERFACE_TESTING_GUIDE.md`
- **Visual Guide**: `/docs/PROBLEM_INTERFACE_VISUAL_GUIDE.md`
- **API Docs**: `/docs/API_DOCS.md`
- **Backend Routes**: `/backend/src/routes/`

---

## 🔗 Quick Links

- **Frontend**: http://localhost:3000
- **Login**: http://localhost:3000/login
- **Problems**: http://localhost:3000/problems
- **Backend Health**: http://localhost:8080/
- **Problem API**: http://localhost:8080/api/v1/problems/get-all-problems

---

**Status**: ✅ Fixed  
**Last Updated**: October 19, 2025  
**Version**: 1.1
