# LeetLab Modern Dark Theme Redesign - Implementation Guide

## 🎨 Theme Overview

We're implementing a modern dark theme inspired by VS Code and LeetCode using a **Slate + Teal** color palette.

### Color Palette

**Primary Colors:**

- Primary: `#14B8A6` (Teal-500)
- Secondary: `#22D3EE` (Cyan-400)
- Accent: `#06B6D4` (Cyan-500)

**Background (Dark Mode):**

- Primary: `#0F172A` (Slate-900)
- Secondary: `#1E293B` (Slate-800)
- Tertiary: `#334155` (Slate-700)

**Text (Dark Mode):**

- Primary: `#E2E8F0` (Slate-200)
- Secondary: `#CBD5E1` (Slate-300)
- Tertiary: `#94A3B8` (Slate-400)

**Semantic Colors:**

- Success: `#34D399` (Green-400)
- Error: `#F87171` (Red-400)
- Warning: `#FBBF24` (Amber-400)

---

## ✅ What's Been Implemented

### 1. **Tailwind Configuration** ✅

**File:** `/frontend/tailwind.config.js`

**Features:**

- Custom color tokens for dark/light themes
- Semantic color naming (`dark.bg.primary`, `dark.text.secondary`, etc.)
- Custom animations (fade-in, slide-up, scale-in)
- Custom shadows (glow effects, dark shadows)
- Font families (Inter, Rubik, Fira Code)
- DaisyUI themes configured for both dark and light modes

**Usage Example:**

```jsx
className = "bg-dark-bg-primary text-dark-text-primary";
className = "bg-brand-primary hover:shadow-glow-md";
```

---

### 2. **Theme Provider** ✅

**File:** `/frontend/src/contexts/ThemeContext.jsx`

**Features:**

- React Context for theme state
- Persistent theme storage (localStorage)
- Auto-applies theme class to `<html>` element
- Easy theme toggling

**Usage Example:**

```jsx
import { useTheme } from "../contexts/ThemeContext";

const { theme, isDark, toggleTheme } = useTheme();
```

---

### 3. **Reusable UI Components** ✅

#### Button Component

**File:** `/frontend/src/components/ui/Button.jsx`

**Features:**

- 6 variants: primary, secondary, outline, ghost, danger, success
- 5 sizes: xs, sm, md, lg, xl
- Loading state with spinner
- Icon support (left/right positioning)
- Full width option
- Disabled state

**Usage Example:**

```jsx
<Button variant="primary" size="md" loading={isLoading} icon={FiCheck}>
  Submit Code
</Button>
```

#### Input Component

**File:** `/frontend/src/components/ui/Input.jsx`

**Features:**

- Label and helper text support
- Error state with validation messages
- Icon support (left/right positioning)
- Password field with toggle visibility
- Full width option
- Consistent theming

**Usage Example:**

```jsx
<Input label="Email" type="email" icon={FiMail} error={errors.email} fullWidth />
```

#### Theme Toggle

**File:** `/frontend/src/components/ui/ThemeToggle.jsx`

**Features:**

- Smooth icon transition
- Sun/Moon icons
- Accessible (aria-label, title)
- Matches overall theme

---

### 4. **Updated Navbar** ✅

**File:** `/frontend/src/components/Navbar2.jsx`

**Features:**

- Modern dark theme styling
- Teal gradient logo with glow effect
- Active link highlighting
- Responsive mobile menu
- Theme toggle integrated
- Smooth transitions
- Admin links with special styling

---

### 5. **Core Setup** ✅

**Updated Files:**

- `/frontend/src/main.jsx` - Added ThemeProvider wrapper
- `/frontend/src/App.jsx` - Updated background colors
- `/frontend/src/components/Layout.jsx` - Using new Navbar

---

## 🚧 What Needs to Be Done

### Phase 1: Auth Pages (High Priority)

#### Login Page

**File:** `/frontend/src/pages/auth/Login.jsx`

**TODO:**

- Replace existing components with new `Button` and `Input`
- Update background to use `bg-dark-bg-primary`
- Add teal gradient accents
- Ensure form validation displays with new error styling
- Test API integration still works
- Add loading states with new Button component
- Smooth transitions on form submission

**Example Structure:**

```jsx
<div className="min-h-screen bg-dark-bg-primary flex items-center justify-center">
  <div className="w-full max-w-md p-8 bg-dark-bg-secondary rounded-2xl shadow-dark-lg border border-dark-border-DEFAULT">
    <h1 className="text-3xl font-bold text-brand-primary mb-6">Welcome Back</h1>
    <Input label="Email" type="email" icon={FiMail} fullWidth />
    <Input label="Password" type="password" icon={FiLock} fullWidth />
    <Button variant="primary" fullWidth loading={isLoading}>
      Sign In
    </Button>
  </div>
</div>
```

#### Register Page

**Similar updates as Login page**

#### Forgot Password & Reset Password

**Similar updates as Login page**

---

### Phase 2: Dashboard (High Priority)

#### Dashboard Page

**File:** `/frontend/src/pages/Dashboard.jsx`

**TODO:**

- Update stats cards with new theme
- Use `bg-dark-bg-secondary` for card backgrounds
- Teal accents for primary metrics
- Update charts/graphs to match color scheme
- Ensure smooth animations
- Test data fetching still works

**Card Structure:**

```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  <div className="bg-dark-bg-secondary rounded-xl p-6 border border-dark-border-DEFAULT hover:border-brand-primary transition-colors">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-dark-text-tertiary text-sm">Problems Solved</p>
        <p className="text-3xl font-bold text-brand-primary">45</p>
      </div>
      <FiCheckCircle className="w-12 h-12 text-brand-primary" />
    </div>
  </div>
</div>
```

---

### Phase 3: Problems Page (High Priority)

#### Problems List

**File:** `/frontend/src/pages/problems/Problems.jsx`

**TODO:**

- Update problem cards with new theme
- Difficulty badges (Easy: green, Medium: yellow, Hard: red)
- Search bar using new Input component
- Filter buttons using new Button component
- Hover effects with teal glow
- Update stats section

#### Problem Details

**File:** `/frontend/src/pages/problems/ProblemDetails.jsx`

**TODO:**

- Update split pane styling
- Problem description section with new theme
- Code editor wrapper styling
- Custom input/output section
- Run/Submit buttons using new Button component
- Loading states

---

### Phase 4: Code Editor Integration (Medium Priority)

**Monaco Editor Theme Configuration**

**TODO:**

- Create custom Monaco theme matching Slate + Teal
- Configure editor colors to match VS Code dark theme
- Teal accent for active line, selection
- Proper syntax highlighting colors

**Example:**

```javascript
monaco.editor.defineTheme("leetlab-dark", {
  base: "vs-dark",
  inherit: true,
  rules: [],
  colors: {
    "editor.background": "#0F172A",
    "editor.foreground": "#E2E8F0",
    "editor.lineHighlightBackground": "#1E293B",
    "editorLineNumber.foreground": "#64748B",
    "editor.selectionBackground": "#14B8A6",
    // ... more colors
  },
});
```

---

### Phase 5: Other Pages (Lower Priority)

- **Playlists**: Update card styling, buttons
- **Contests**: Update contest cards, leaderboard
- **Sheets**: Update sheet list and detail pages
- **Submissions**: Update submission cards, status badges
- **Profile**: Update user info cards, stats
- **Admin Pages**: Update tables, forms, modals

---

## 📋 Checklist

### Core Theme ✅

- [x] Tailwind config updated
- [x] Theme provider created
- [x] Theme toggle component
- [x] Color tokens defined
- [x] Animations configured
- [x] Fonts configured

### Reusable Components ✅

- [x] Button component (6 variants)
- [x] Input component
- [x] Theme toggle
- [x] Navbar updated

### Auth Pages ⏳

- [ ] Login page
- [ ] Register page
- [ ] Forgot password page
- [ ] Reset password page

### Main Pages ⏳

- [ ] Dashboard
- [ ] Problems list
- [ ] Problem details
- [ ] Code editor theme

### Additional Pages ⏳

- [ ] Playlists
- [ ] Contests
- [ ] Sheets
- [ ] Submissions
- [ ] Profile
- [ ] Admin pages

---

## 🎯 Design Principles

### 1. **Consistency**

- Use semantic color tokens (`dark.bg.primary` instead of hardcoded hex)
- Consistent spacing (4px grid: p-4, m-4, gap-4)
- Consistent border radius (rounded-lg, rounded-xl)

### 2. **Readability**

- High contrast text (Slate-200 on Slate-900)
- Proper text hierarchy (font sizes, weights)
- Adequate line height and letter spacing

### 3. **Visual Hierarchy**

- Primary actions: Teal gradient buttons
- Secondary actions: Gray outline buttons
- Destructive actions: Red buttons
- Disabled states: Reduced opacity

### 4. **Animations**

- Subtle, not flashy (200-300ms duration)
- Ease-in-out or ease-out curves
- Hover effects on interactive elements
- Loading states with spinners

### 5. **Accessibility**

- Color contrast ratios meeting WCAG AA
- Keyboard navigation support
- Focus indicators (ring-2)
- Screen reader support (aria-labels)

---

## 🚀 Quick Start Commands

### Install Dependencies (if needed)

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

### Test the New Theme

1. Open http://localhost:3000
2. Check navbar (should have teal logo, new styling)
3. Toggle theme (sun/moon icon in navbar)
4. Test dark/light mode switch
5. Navigate to different pages (they'll need updating)

---

## 💡 Tips for Implementation

### Using Color Tokens

```jsx
// ✅ Good - Uses semantic tokens
className = "bg-dark-bg-secondary text-dark-text-primary";

// ❌ Bad - Hardcoded colors
className = "bg-[#1E293B] text-[#E2E8F0]";
```

### Using Components

```jsx
// ✅ Good - Uses reusable Button
import Button from '../components/ui/Button';
<Button variant="primary" size="md">Click Me</Button>

// ❌ Bad - Custom button styling each time
<button className="px-4 py-2 bg-teal-500...">Click Me</button>
```

### Responsive Design

```jsx
// ✅ Mobile-first approach
className = "w-full md:w-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4";
```

### Dark/Light Support

```jsx
// ✅ Supports both themes
className =
  "bg-dark-bg-primary dark:bg-dark-bg-primary text-dark-text-primary dark:text-dark-text-primary";

// For light theme override:
className = "bg-light-bg-primary dark:bg-dark-bg-primary";
```

---

## 📊 Progress Tracker

**Overall Completion: 30%**

- Core Theme Setup: 100% ✅
- Reusable Components: 100% ✅
- Navigation: 100% ✅
- Auth Pages: 0% ⏳
- Main Pages: 0% ⏳
- Additional Features: 0% ⏳

---

## 🔗 Resources

- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [DaisyUI Themes](https://daisyui.com/docs/themes/)
- [React Context API](https://react.dev/reference/react/useContext)
- [Monaco Editor Themes](https://microsoft.github.io/monaco-editor/playground.html#extending-language-services-custom-themes)

---

## 📞 Next Steps

1. **Test Current Implementation**

   - Run `docker restart leetlab-frontend-dev`
   - Open http://localhost:3000
   - Verify navbar, theme toggle, colors

2. **Update Auth Pages**

   - Start with Login page
   - Then Register
   - Test API integration

3. **Update Dashboard**

   - Update stats cards
   - Test data fetching

4. **Update Problems Pages**

   - List and details
   - Code editor theme

5. **Polish and Test**
   - Cross-browser testing
   - Responsive testing
   - Accessibility testing

---

**Status**: 🚧 In Progress  
**Version**: 1.0  
**Last Updated**: October 19, 2025

🎉 **The foundation is complete! Now we can systematically update each page.**
