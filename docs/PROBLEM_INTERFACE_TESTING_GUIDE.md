# Problem Solving Interface - Testing Guide

## 🎉 Implementation Complete!

The modern Problem Solving Interface has been successfully implemented and is ready for testing.

---

## 🚀 Quick Start

### 1. Access the Application

- **Frontend URL**: http://localhost:3001/
- **Backend URL**: http://localhost:8080/

### 2. Login

- Navigate to http://localhost:3001/login
- Use your existing credentials or register a new account

### 3. Navigate to Problems

- Click on "Problems" in the navigation menu
- Or directly visit: http://localhost:3001/problems

### 4. Test a Problem

- Click on any problem from the list
- Or directly visit: http://localhost:3001/problems/{problemId}
- Example: http://localhost:3001/problems/1

---

## ✨ Features to Test

### 📋 Problem Description Panel (Left Side)

#### 1. Problem Information Display

- **Title**: Check if the problem title is displayed correctly
- **Difficulty Badge**:
  - Easy: Green badge
  - Medium: Yellow/Orange badge
  - Hard: Red badge
- **Tags**: Technology/topic tags should be displayed as badges
- **Statistics**: Acceptance rate and submission count

#### 2. Problem Statement

- **Description**: Full problem description with proper formatting
- **Examples**:
  - Input/Output pairs displayed in code blocks
  - Explanation text for each example
- **Constraints**: Listed in bullet points
- **Responsive Design**: Verify content is readable on mobile devices

### 💻 Code Editor Panel (Right Side)

#### 1. Monaco Editor

- **Syntax Highlighting**: Code should have proper syntax highlighting
- **Themes**: Professional dark theme
- **Line Numbers**: Visible on the left side
- **Auto-complete**: IntelliSense should work (try typing)
- **Bracket Matching**: Brackets should be highlighted when cursor is near them

#### 2. Language Selection

- **Dropdown Menu**: Located above the editor
- **Supported Languages**:
  - Python 3
  - JavaScript
  - C++
  - Java
- **Template Loading**:
  - Select a language
  - Verify that a starter template loads automatically
  - Templates should include class/function structure

#### 3. Code Templates

Each language has a default template:

**Python**:

```python
def solution():
    # Write your code here
    pass

if __name__ == "__main__":
    result = solution()
    print(result)
```

**JavaScript**:

```javascript
function solution() {
  // Write your code here
  return null;
}

console.log(solution());
```

**C++**:

```cpp
#include <iostream>
using namespace std;

int main() {
    // Write your code here
    return 0;
}
```

**Java**:

```java
public class Solution {
    public static void main(String[] args) {
        // Write your code here
    }
}
```

### 🎯 Custom Input/Output Section (Bottom Right)

#### 1. Custom Input

- **Text Area**: Multi-line input area for custom test cases
- **Placeholder**: "Enter your custom input here..."
- **Editable**: Users can type or paste input

#### 2. Output Display

- **Read-only**: Output should be displayed but not editable
- **Scrollable**: Long outputs should be scrollable
- **Formatted**: Output should maintain formatting (line breaks, spaces)

#### 3. Action Buttons

**Run Code Button** (▶ Run):

- Click the button
- Should show loading spinner while executing
- After ~2 seconds, should display mock output
- Output should include:
  - Execution time (e.g., "Runtime: 42ms")
  - Memory usage (e.g., "Memory: 38.5 MB")
  - Test results or actual output

**Submit Code Button** (✓ Submit):

- Currently shows an alert: "Submit functionality will be implemented with Judge0 integration"
- This is expected behavior (backend integration pending)

#### 4. Loading States

- Both buttons should be disabled while code is running
- Loading spinner should appear
- Buttons should re-enable after execution completes

---

## 🧪 Test Scenarios

### Scenario 1: Basic Problem Viewing

1. Navigate to http://localhost:3001/problems
2. Click on the first problem in the list
3. **Expected**: Problem details page loads with split layout
4. **Verify**:
   - Problem title, difficulty, and tags are visible
   - Problem description is readable
   - Examples are formatted correctly
   - Code editor is visible with default language (Python)

### Scenario 2: Language Switching

1. Open any problem
2. Click the language dropdown
3. Select "JavaScript"
4. **Expected**: JavaScript template loads in the editor
5. Select "C++"
6. **Expected**: C++ template loads in the editor
7. **Verify**: Each language has appropriate syntax highlighting

### Scenario 3: Code Execution

1. Open any problem
2. Write or use the default code template
3. Enter custom input (e.g., "5\n10")
4. Click "Run Code" button
5. **Expected**:
   - Button shows loading state
   - After ~2 seconds, output appears
   - Output shows execution time and memory usage
6. **Verify**:
   - Loading spinner appears and disappears
   - Output is displayed in the output section
   - Buttons are re-enabled after execution

### Scenario 4: Error Handling

#### Test 4a: Invalid Problem ID

1. Navigate to http://localhost:3001/problems/99999
2. **Expected**: Error message displayed: "Problem not found"

#### Test 4b: Network Error

1. Stop the backend server
2. Try to open a problem
3. **Expected**: Error message displayed
4. **Verify**: User-friendly error message (not technical stack trace)

### Scenario 5: Responsive Design

#### Desktop (> 1024px)

1. Open problem on desktop browser
2. **Expected**: Side-by-side split layout (description | editor)
3. **Verify**: Resizable split pane (drag the divider)

#### Tablet (768px - 1024px)

1. Resize browser to tablet size
2. **Expected**: Stacked layout (description on top, editor below)
3. **Verify**: Both sections are scrollable

#### Mobile (< 768px)

1. Resize browser to mobile size
2. **Expected**: Stacked layout, full width
3. **Verify**:
   - Description is readable
   - Code editor is usable
   - Buttons are tappable

### Scenario 6: User Experience

1. Open a problem
2. Write some code
3. Switch languages
4. **Expected**: Confirm dialog asks about losing changes
5. Click "Cancel"
6. **Expected**: Language doesn't change, code is preserved
7. Click language again, then "OK"
8. **Expected**: Language changes, new template loads

---

## 🐛 Common Issues & Solutions

### Issue 1: Problem Not Loading

**Symptom**: Blank page or loading spinner forever  
**Solution**:

- Check backend is running: `lsof -i :8080`
- Check browser console for errors (F12)
- Verify problem ID exists in database

### Issue 2: Monaco Editor Not Appearing

**Symptom**: Code editor section is blank  
**Solution**:

- Check browser console for errors
- Verify `@monaco-editor/react` is installed: `npm list @monaco-editor/react`
- Try refreshing the page (Cmd+R)

### Issue 3: Run Code Not Working

**Symptom**: Clicking Run Code does nothing  
**Solution**:

- Check browser console for errors
- Verify backend `/executeCode/test-input` endpoint is accessible
- Check network tab (F12) for failed requests

### Issue 4: Layout Issues

**Symptom**: Overlapping elements or weird sizing  
**Solution**:

- Clear browser cache
- Check if Tailwind CSS is loaded (inspect element, verify classes)
- Try different browser

---

## 📝 Testing Checklist

### Visual Testing

- [ ] Problem title displays correctly
- [ ] Difficulty badge has correct color
- [ ] Tags are visible and styled
- [ ] Examples are formatted with code blocks
- [ ] Constraints are listed properly
- [ ] Code editor has syntax highlighting
- [ ] Language dropdown is visible and functional
- [ ] Input/output sections are clearly separated
- [ ] Buttons have hover effects
- [ ] Loading spinners appear during execution

### Functional Testing

- [ ] Problem details fetch from backend
- [ ] Language selection works
- [ ] Code templates load for each language
- [ ] Custom input can be entered
- [ ] Run Code executes and shows output
- [ ] Submit Code shows alert (stub)
- [ ] Error handling works for invalid IDs
- [ ] Loading states work correctly

### Responsive Testing

- [ ] Desktop: Split layout works
- [ ] Desktop: Resizable pane works
- [ ] Tablet: Stacked layout
- [ ] Mobile: Full-width stacked layout
- [ ] All text is readable on small screens
- [ ] Buttons are tappable on touch devices

### Performance Testing

- [ ] Problem loads in < 2 seconds
- [ ] Monaco editor loads smoothly
- [ ] No console errors
- [ ] No memory leaks (check DevTools)
- [ ] Smooth scrolling

---

## 🔧 API Endpoints Used

### Problem Service

```javascript
// Get problem by ID
GET /problem/:id
Response: { id, title, description, difficulty, tags, examples, constraints, ... }

// Run code with custom input
POST /executeCode/test-input
Body: { problemId, code, languageId, input }
Response: { success, output, executionTime, memory }

// Submit code (stub)
POST /submission/submit
Body: { problemId, code, languageId }
Response: TBD
```

---

## 🎨 UI/UX Features

### Professional Design

- **Color Scheme**: Dark theme with purple/blue accents
- **Typography**: Clean, readable fonts
- **Spacing**: Generous padding and margins
- **Icons**: React Icons for visual cues
- **Badges**: Color-coded difficulty and tags

### Accessibility

- **Keyboard Navigation**: Tab through elements
- **Focus Indicators**: Visible focus states
- **Screen Reader**: Semantic HTML
- **Color Contrast**: WCAG AA compliant

### User Feedback

- **Loading Spinners**: Visual feedback during operations
- **Error Messages**: Clear, actionable error messages
- **Success States**: Confirmation after actions
- **Hover Effects**: Interactive elements have hover states

---

## 🔮 Next Steps

### Immediate (Required)

1. **Test the Interface**: Follow this guide to test all features
2. **Fix Any Bugs**: Report issues in the browser console
3. **Backend Integration**: Connect Submit Code to backend
4. **Judge0 Integration**: Replace mock execution with real Judge0

### Short-term (Recommended)

1. **Test Case Selector**: Add UI to select from predefined test cases
2. **Submission History**: Show previous submissions for the problem
3. **Code Persistence**: Save code in localStorage
4. **Keyboard Shortcuts**: Cmd+Enter to run code

### Long-term (Optional)

1. **Split Screen Settings**: Save user's split position preference
2. **Code Themes**: Let users choose editor themes (dark/light)
3. **Font Settings**: Customizable font family and size
4. **Vim/Emacs Mode**: Editor keybindings
5. **Code Snippets**: Common patterns and snippets
6. **Collaboration**: Real-time code sharing

---

## 📚 Architecture Overview

### Component Structure

```
ProblemDetails (Main Page)
├── ProblemDescription (Left Panel)
│   ├── Title, Difficulty, Tags
│   ├── Description
│   ├── Examples
│   └── Constraints
└── Right Panel (Split or Stacked)
    ├── CodeEditor
    │   ├── Language Selector
    │   └── Monaco Editor
    └── CustomInputOutput
        ├── Custom Input Text Area
        ├── Output Display
        └── Action Buttons (Run/Submit)
```

### Service Layer

```
problemService.js
├── getProblemById(id)
├── runCode(problemId, code, languageId, input)
└── submitCode(problemId, code, languageId)
```

### State Management

- **Local State**: React useState for component-specific state
- **Props**: Data passed between components
- **Context**: Auth state (from AuthContext)
- **Future**: Consider Zustand for problem state if needed

---

## 🎓 Code Quality

### Best Practices Followed

- ✅ Modular components (single responsibility)
- ✅ PropTypes for type checking
- ✅ Async/await for API calls
- ✅ Error boundaries and error handling
- ✅ Loading states for better UX
- ✅ Responsive design (mobile-first)
- ✅ Clean, readable code with comments
- ✅ Consistent naming conventions

### Code Organization

- **Components**: Reusable UI components in `/components/problem/`
- **Services**: API calls in `/services/problemService.js`
- **Pages**: Main page in `/pages/problems/ProblemDetails.jsx`
- **Routing**: Configured in `/App.jsx`

---

## 🎯 Success Criteria

### Minimum Viable Product (MVP) ✅

- [x] Display problem details from backend
- [x] Monaco code editor with syntax highlighting
- [x] Language selection (Python, JS, C++, Java)
- [x] Custom input section
- [x] Run code button with output display
- [x] Responsive layout (desktop, tablet, mobile)
- [x] Loading states and error handling
- [x] Professional UI matching LeetCode/HackerRank

### Ready for Production

- [ ] Judge0 integration for real code execution
- [ ] Submit code backend integration
- [ ] Test case selector
- [ ] Submission history
- [ ] Performance optimization
- [ ] Cross-browser testing
- [ ] User acceptance testing

---

## 📞 Support

### Debugging Tips

1. **Open Browser DevTools**: Press F12 or Cmd+Option+I
2. **Check Console**: Look for JavaScript errors (red text)
3. **Network Tab**: Verify API calls are succeeding
4. **React DevTools**: Install extension to inspect component state
5. **Backend Logs**: Check backend console for errors

### Common DevTools Commands

```javascript
// Check if Monaco is loaded
window.monaco;

// Check React version
React.version;

// Get current problem state (in console while on problem page)
// Look for component state in React DevTools
```

---

## 🏁 Conclusion

The Problem Solving Interface is now complete and ready for testing. Follow this guide to test all features and report any issues. The implementation is modular, professional, and ready for future enhancements like Judge0 integration.

**Enjoy coding! 🚀**

---

**Document Version**: 1.0  
**Last Updated**: January 2025  
**Implementation Status**: ✅ Complete and Ready for Testing
