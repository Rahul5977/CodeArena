# Code Execution Feature - Testing Guide

## 🧪 Complete Testing Checklist

### Prerequisites

- ✅ Backend server running on `http://localhost:8080`
- ✅ Frontend server running on `http://localhost:5173`
- ✅ Judge0 API configured in backend
- ✅ User logged in with valid JWT token

---

## 1️⃣ Basic Functionality Tests

### Test 1: Load Problem Page

**Steps:**

1. Navigate to any problem (e.g., `/problems/1`)
2. Wait for problem to load

**Expected:**

- Problem details displayed
- Monaco editor loaded with default Python template
- Empty output section with "Run your code to see results" message
- "Run Code" and "Submit" buttons visible

---

### Test 2: Language Switching

**Steps:**

1. Click language dropdown
2. Select "JavaScript"
3. Verify editor syntax highlighting changes
4. Check if default JavaScript template loads

**Expected:**

- Syntax highlighting updates to JavaScript
- Default template appears:

```javascript
function solution() {
  // Write your code here
}

solution();
```

---

### Test 3: Write and Run Code

**Steps:**

1. Write a simple Python program:

```python
def solution():
    print("Hello, World!")

if __name__ == "__main__":
    solution()
```

2. Click "Run Code"

**Expected:**

- Button shows "Running..." with spinner
- Loading animation appears in output section
- After execution, test case results displayed
- Toast notification: "All test cases passed! 🎉" (if successful)

---

### Test 4: Custom Input Testing

**Steps:**

1. Switch to "Custom Input" tab
2. Enter test input:

```
5
1 2 3 4 5
```

3. Update code to read input:

```python
def solution():
    n = int(input())
    numbers = list(map(int, input().split()))
    print(sum(numbers))

if __name__ == "__main__":
    solution()
```

4. Click "Run Code"

**Expected:**

- Code executes with custom input
- Output shows: `15`
- Test case status shows result

---

### Test 5: Submit Code

**Steps:**

1. Write a complete solution for the problem
2. Click "Submit" button

**Expected:**

- Button shows "Submitting..." with spinner
- All official test cases executed
- Results displayed with pass/fail status
- Overall verdict shown (Accepted/Wrong Answer)
- Toast notification with submission result

---

## 2️⃣ Error Handling Tests

### Test 6: Compilation Error

**Steps:**

1. Write invalid Python code:

```python
def solution()  # Missing colon
    print("Hello")
```

2. Click "Run Code"

**Expected:**

- Red error card displayed
- Compilation error message shown
- Toast: "Error: Compilation failed"

---

### Test 7: Runtime Error

**Steps:**

1. Write code with runtime error:

```python
def solution():
    x = 10 / 0  # Division by zero

if __name__ == "__main__":
    solution()
```

2. Click "Run Code"

**Expected:**

- Test case shows "Runtime Error" status
- Error message displayed in red box
- stderr output visible

---

### Test 8: Time Limit Exceeded

**Steps:**

1. Write infinite loop:

```python
def solution():
    while True:
        pass

if __name__ == "__main__":
    solution()
```

2. Click "Run Code"

**Expected:**

- Test case shows "Time Limit Exceeded" status
- Yellow warning badge
- Execution stopped automatically

---

### Test 9: Empty Code Submission

**Steps:**

1. Clear all code from editor
2. Click "Run Code"

**Expected:**

- Toast error: "Please write some code first"
- No API call made

---

## 3️⃣ UI/UX Tests

### Test 10: Loading States

**Steps:**

1. Click "Run Code"
2. Observe loading animation

**Expected:**

- Rotating spinner appears
- "Executing your code..." message
- "Please wait..." text with pulsing icon
- Buttons disabled during execution

---

### Test 11: Test Case Results Display

**Steps:**

1. Submit code with mixed results (some passing, some failing)

**Expected:**

- Overall status card (green for all pass, red for any fail)
- Individual test case cards with:
  - ✅/❌ Status badge
  - Execution time
  - Memory usage
  - Expected vs Actual output (for failed cases)
  - Error messages (if any)

---

### Test 12: Responsive Design (Mobile)

**Steps:**

1. Resize browser to mobile width (< 1024px)
2. Navigate problem page

**Expected:**

- Stacked layout (not split-pane)
- Problem description scrollable
- Editor and output sections properly sized
- Buttons remain accessible

---

### Test 13: Responsive Design (Desktop)

**Steps:**

1. Open on desktop (> 1024px)
2. Drag split pane divider

**Expected:**

- Split-pane layout (40% description, 60% editor)
- Divider draggable
- Smooth resize without flickering

---

## 4️⃣ Persistence Tests

### Test 14: Code Persistence

**Steps:**

1. Write code in editor
2. Refresh page
3. Check if code is restored

**Expected:**

- Code automatically loaded from localStorage
- Language selection restored
- No data loss

---

### Test 15: Reset Code

**Steps:**

1. Write custom code
2. Click "Reset" button
3. Confirm reset

**Expected:**

- Confirmation dialog appears
- Code reverts to default template
- localStorage cleared for this problem

---

## 5️⃣ Authentication Tests

### Test 16: JWT Token Expiration

**Steps:**

1. Wait for JWT to expire (or manually delete cookies)
2. Try to run code

**Expected:**

- Backend attempts token refresh
- If refresh succeeds: Code executes normally
- If refresh fails: Redirect to login with toast message

---

### Test 17: Unauthorized Access

**Steps:**

1. Logout
2. Try to access problem page

**Expected:**

- Redirect to login page
- Toast: "Please login to continue"

---

## 6️⃣ Edge Cases

### Test 18: Large Output

**Steps:**

1. Write code that prints large output:

```python
for i in range(1000):
    print("Line", i)
```

2. Run code

**Expected:**

- Output displayed in scrollable container
- Custom scrollbar visible
- UI doesn't freeze

---

### Test 19: Multiple Rapid Submissions

**Steps:**

1. Click "Run Code" multiple times quickly

**Expected:**

- Only one request sent
- Button disabled after first click
- Subsequent clicks ignored until completion

---

### Test 20: Network Error

**Steps:**

1. Stop backend server
2. Try to run code

**Expected:**

- Error toast: "Failed to execute code"
- Error message displayed
- Graceful error handling

---

## 📊 Success Criteria

All tests should pass with:

- ✅ No console errors
- ✅ Smooth animations
- ✅ Proper error messages
- ✅ Responsive layout
- ✅ Data persistence
- ✅ Authentication working

---

## 🐛 Bug Reporting Template

If you find issues, report with:

```
**Bug**: [Brief description]
**Steps**:
1. [Step 1]
2. [Step 2]
**Expected**: [What should happen]
**Actual**: [What actually happened]
**Console Errors**: [Any errors in browser console]
**Screenshot**: [If applicable]
```

---

## 🎯 Performance Benchmarks

- **Page Load**: < 2 seconds
- **Code Execution**: < 5 seconds (depends on Judge0)
- **UI Animations**: 60 FPS
- **Bundle Size**: ~650 KB (gzipped ~193 KB)

---

## 🏁 Final Verification

Run all tests in sequence and mark completion:

- [ ] Test 1-5: Basic Functionality ✅
- [ ] Test 6-9: Error Handling ✅
- [ ] Test 10-13: UI/UX ✅
- [ ] Test 14-15: Persistence ✅
- [ ] Test 16-17: Authentication ✅
- [ ] Test 18-20: Edge Cases ✅

**Status**: Ready for Production ✨

---

_Last Updated_: 2025-01-XX  
_Tested By_: [Your Name]  
_Version_: 1.0.0
