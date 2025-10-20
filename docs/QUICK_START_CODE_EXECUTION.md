# 🚀 Quick Start - Code Execution Feature

## Run the Application

### Backend

```bash
cd /Users/rahulraj/Desktop/LeetLab/backend
npm install
npm run dev
```

### Frontend

```bash
cd /Users/rahulraj/Desktop/LeetLab/frontend
npm install
npm run dev
```

Visit: **http://localhost:5173**

---

## Test in 5 Minutes ⚡

### 1. Login/Register (30 seconds)

- Navigate to **http://localhost:5173/login**
- Login with your credentials or register a new account

### 2. Open a Problem (30 seconds)

- Go to **Problems** page
- Click any problem (e.g., "Two Sum")
- Wait for problem page to load

### 3. Run Code (1 minute)

**Python Example:**

```python
def solution():
    print("Hello, LeetLab!")

if __name__ == "__main__":
    solution()
```

- Click **"Run Code"**
- Watch the loading animation
- See results in "Test Cases" tab

### 4. Test Custom Input (1 minute)

- Switch to **"Custom Input"** tab
- Enter test data:

```
5
```

- Update code:

```python
def solution():
    n = int(input())
    print(f"You entered: {n}")

if __name__ == "__main__":
    solution()
```

- Click **"Run Code"**
- Check output

### 5. Switch Languages (30 seconds)

- Click language dropdown
- Select **"JavaScript"**
- See default template load
- Write code:

```javascript
function solution() {
  console.log("Hello from JavaScript!");
}

solution();
```

- Click **"Run Code"**

### 6. Submit Solution (1 minute)

- Write a complete solution
- Click **"Submit"**
- View all test case results
- Check execution metrics

### 7. Test Reset (30 seconds)

- Click **"Reset"** button
- Confirm reset
- See default template restored

---

## ✅ What to Look For

### Visual Elements

- ✨ **Glassmorphism UI** - Transparent backgrounds with blur
- 🎨 **Gradient Buttons** - Teal to pink gradients
- 🔄 **Smooth Animations** - Loading spinners, tab transitions
- 📊 **Test Case Cards** - Individual results with metrics
- 🎯 **Status Badges** - Colored badges for pass/fail

### Functionality

- ⚡ **Fast Execution** - Results in 2-5 seconds
- 💾 **Auto-Save** - Code persists on refresh
- 🔄 **Language Switching** - Smooth template changes
- 📝 **Custom Input** - Test with your own data
- 🚨 **Error Handling** - Clear error messages

### Responsiveness

- 📱 **Mobile View** - Stacked layout
- 💻 **Desktop View** - Split-pane with draggable divider
- 🖱️ **Hover Effects** - Buttons and cards respond

---

## 🎯 Quick Test Cases

### Test 1: Simple Output

```python
print("Hello, World!")
```

**Expected**: Output displays "Hello, World!"

### Test 2: Read Input

```python
n = int(input())
print(n * 2)
```

**Custom Input**: `5`  
**Expected**: Output displays `10`

### Test 3: Compilation Error

```python
def solution(  # Missing closing parenthesis
    print("Error test")
```

**Expected**: Red error card with compilation error

### Test 4: Runtime Error

```python
x = 10 / 0
```

**Expected**: Runtime error displayed

---

## 📋 Feature Checklist

After testing, verify:

- [ ] Problem loads correctly
- [ ] Monaco editor appears
- [ ] Language dropdown works
- [ ] Code can be edited
- [ ] "Run Code" executes successfully
- [ ] Test results display correctly
- [ ] "Custom Input" tab works
- [ ] "Submit" button works
- [ ] Execution metrics shown (time, memory)
- [ ] Error handling works
- [ ] Loading animations appear
- [ ] Toast notifications show
- [ ] Code persists on refresh
- [ ] "Reset" button works
- [ ] Mobile layout responsive
- [ ] Desktop split-pane works

---

## 🐛 Common Issues & Fixes

### Issue: Backend not running

**Fix**:

```bash
cd backend && npm run dev
```

### Issue: Frontend not running

**Fix**:

```bash
cd frontend && npm run dev
```

### Issue: JWT expired

**Fix**: Logout and login again

### Issue: Judge0 API error

**Fix**: Check backend `.env` file for Judge0 configuration

### Issue: Code doesn't persist

**Fix**: Check browser localStorage (not in incognito mode)

---

## 🎉 Success!

If everything works:

- ✅ You can run code
- ✅ You can submit solutions
- ✅ You see beautiful UI
- ✅ Errors are handled gracefully

**The Code Execution Feature is working perfectly!** 🚀

---

## 📚 Next Steps

1. Read `CODE_EXECUTION_FEATURE.md` for detailed documentation
2. Check `CODE_EXECUTION_TESTING.md` for comprehensive test cases
3. Review `CODE_EXECUTION_COMPLETE.md` for implementation summary

---

**Time to Complete**: ~5 minutes  
**Difficulty**: Easy  
**Status**: ✨ Production Ready
