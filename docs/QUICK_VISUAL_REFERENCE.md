# Quick Visual Reference - LeetLab Modern Theme

## 🎨 Quick Start Guide

This is a quick visual reference for the modernized LeetLab UI theme. Use this as a cheat sheet for maintaining consistency when adding new features.

---

## 🌈 Color System

### Primary Gradients

```css
/* Background Gradient (All Pages) */
bg-gradient-to-br from-slate-950 via-teal-950 to-pink-950

/* Button Gradient */
bg-gradient-to-r from-teal-500 to-pink-500

/* Text Gradient */
bg-gradient-to-r from-teal-400 to-pink-400 bg-clip-text text-transparent
```

### Accent Colors

```css
Teal:   #14b8a6 (teal-500), #2dd4bf (teal-400)
Pink:   #ec4899 (pink-500), #f472b6 (pink-400)
Purple: #a855f7 (purple-500), #c084fc (purple-400)
```

### UI Colors

```css
Background:     bg-slate-900/80 backdrop-blur-xl
Border:         border-white/10 or border-white/20
Text Primary:   text-white
Text Secondary: text-gray-400
Input BG:       bg-slate-800/50
```

---

## 🎯 Common Components

### Glassmorphism Card

```jsx
<div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
  {/* Card content */}
</div>
```

### Gradient Button

```jsx
<button className="px-6 py-3 bg-gradient-to-r from-teal-500 to-pink-500 hover:from-teal-600 hover:to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all">
  Click Me
</button>
```

### Gradient Text

```jsx
<h1 className="text-4xl font-bold bg-gradient-to-r from-teal-400 to-pink-400 bg-clip-text text-transparent">
  Title
</h1>
```

### Input Field

```jsx
<input
  className="w-full px-4 py-3 bg-slate-800/50 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-teal-400 transition-all"
  placeholder="Enter text..."
/>
```

### Badge/Pill

```jsx
<span className="px-3 py-1 bg-teal-500/20 text-teal-400 border border-teal-500/30 rounded-full text-sm">
  Badge
</span>
```

---

## 🎬 Animations

### Animated Background Blobs

```jsx
<div className="fixed inset-0 overflow-hidden pointer-events-none">
  <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
  <div className="absolute top-0 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
  <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-purple-500/10 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
</div>
```

### Framer Motion Fade-In

```jsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
  {/* Content */}
</motion.div>
```

### Button Hover Effect

```jsx
<motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
  Click Me
</motion.button>
```

---

## 📋 Page Structure Template

```jsx
function NewPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-teal-950 to-pink-950 relative">
      {/* Animated Background Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-purple-500/10 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      {/* Navbar */}
      <Navbar2 />

      {/* Content */}
      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Page Title */}
            <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-400 to-pink-400 bg-clip-text text-transparent mb-8">
              Page Title
            </h1>

            {/* Content Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
                {/* Card content */}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
```

---

## 🎨 Status Colors

### Difficulty Badges

```jsx
// Easy
<span className="px-3 py-1 bg-green-500/20 text-green-400 border border-green-500/30 rounded-full">Easy</span>

// Medium
<span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-full">Medium</span>

// Hard
<span className="px-3 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded-full">Hard</span>
```

### Status Badges

```jsx
// Accepted
<span className="px-3 py-1 bg-green-500/20 text-green-400 border border-green-500/30 rounded-full">Accepted</span>

// Pending
<span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-full">Pending</span>

// Failed
<span className="px-3 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded-full">Failed</span>
```

---

## 🔤 Typography

### Headings

```jsx
// H1 - Main Page Title
<h1 className="text-4xl font-bold bg-gradient-to-r from-teal-400 to-pink-400 bg-clip-text text-transparent">
  Main Title
</h1>

// H2 - Section Title
<h2 className="text-2xl font-bold text-white">
  Section Title
</h2>

// H3 - Card Title
<h3 className="text-xl font-bold text-white">
  Card Title
</h3>
```

### Body Text

```jsx
// Primary
<p className="text-white">Primary text</p>

// Secondary
<p className="text-gray-400">Secondary text</p>

// Small
<p className="text-sm text-gray-500">Small text</p>
```

---

## 📊 Stats Card Example

```jsx
<div className="bg-gradient-to-br from-teal-500/20 to-pink-500/20 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
  <div className="flex items-center justify-between mb-2">
    <span className="text-gray-400 text-sm">Total Problems</span>
    <FiCode className="text-teal-400 text-xl" />
  </div>
  <div className="text-3xl font-bold text-white">150</div>
  <div className="mt-2 flex items-center gap-1 text-green-400 text-sm">
    <FiArrowUp className="text-xs" />
    <span>12% from last week</span>
  </div>
</div>
```

---

## 🎯 Loading States

### Spinner

```jsx
<div className="flex items-center justify-center">
  <div className="w-12 h-12 border-4 border-teal-400/30 border-t-teal-400 rounded-full animate-spin"></div>
</div>
```

### Skeleton Card

```jsx
<div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 animate-pulse">
  <div className="h-4 bg-white/10 rounded w-3/4 mb-4"></div>
  <div className="h-4 bg-white/10 rounded w-1/2"></div>
</div>
```

---

## 🎨 Form Elements

### Label

```jsx
<label className="block text-sm font-medium text-gray-400 mb-2">Field Label</label>
```

### Input with Icon

```jsx
<div className="relative">
  <input
    type="text"
    className="w-full px-4 py-3 pl-12 bg-slate-800/50 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-teal-400 transition-all"
    placeholder="Enter text..."
  />
  <FiUser className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
</div>
```

### Textarea

```jsx
<textarea
  className="w-full px-4 py-3 bg-slate-800/50 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-teal-400 transition-all resize-none"
  rows="4"
  placeholder="Enter description..."
/>
```

### Select/Dropdown

```jsx
<select className="w-full px-4 py-3 bg-slate-800/50 border border-white/20 rounded-xl text-white focus:outline-none focus:border-teal-400 transition-all">
  <option>Option 1</option>
  <option>Option 2</option>
</select>
```

---

## 🎭 Hover Effects

### Card Hover

```jsx
<div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-teal-400/50 hover:shadow-2xl hover:shadow-teal-500/10 transition-all cursor-pointer">
  {/* Content */}
</div>
```

### Link Hover

```jsx
<a className="text-gray-400 hover:text-teal-400 transition-colors">Link Text</a>
```

### Icon Button Hover

```jsx
<button className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white transition-all">
  <FiSettings />
</button>
```

---

## 📱 Responsive Breakpoints

```jsx
// Mobile First Approach
<div
  className="
  grid grid-cols-1           // Mobile: 1 column
  md:grid-cols-2            // Tablet: 2 columns
  lg:grid-cols-3            // Desktop: 3 columns
  xl:grid-cols-4            // Large: 4 columns
  gap-4 md:gap-6 lg:gap-8   // Responsive gaps
"
>
  {/* Grid items */}
</div>
```

---

## 🎨 CSS Utilities Reference

### Glassmorphism

- `backdrop-blur-xl` - Strong blur effect
- `backdrop-blur-lg` - Medium blur effect
- `backdrop-blur-md` - Light blur effect

### Opacity

- `bg-slate-900/80` - 80% opacity
- `bg-slate-900/60` - 60% opacity
- `border-white/10` - 10% opacity border

### Shadows

- `shadow-lg` - Large shadow
- `shadow-xl` - Extra large shadow
- `shadow-2xl` - Double extra large shadow
- `shadow-teal-500/10` - Colored shadow with opacity

### Transitions

- `transition-all` - All properties
- `transition-colors` - Color transitions
- `transition-transform` - Transform transitions
- `duration-300` - 300ms duration

---

## ✅ Checklist for New Pages

When creating a new page, ensure:

- [ ] Full-page gradient background (`from-slate-950 via-teal-950 to-pink-950`)
- [ ] Animated blobs in background
- [ ] Use Navbar2 component
- [ ] Glassmorphism cards (`bg-slate-900/80 backdrop-blur-xl`)
- [ ] Gradient buttons (`from-teal-500 to-pink-500`)
- [ ] Gradient text for titles (`from-teal-400 to-pink-400`)
- [ ] Consistent spacing (pt-24 for content after navbar)
- [ ] Framer Motion animations (fade-in)
- [ ] Responsive design (mobile-first)
- [ ] Proper z-index layering (relative z-10 for content)

---

## 🚀 Quick Copy-Paste Snippets

### Import Statements

```jsx
import { motion } from "framer-motion";
import { FiCode, FiUser, FiSettings } from "react-icons/fi";
import Navbar2 from "../components/Navbar2";
```

### Tailwind Classes (Most Used)

```
bg-gradient-to-br from-slate-950 via-teal-950 to-pink-950
bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl
bg-gradient-to-r from-teal-500 to-pink-500 hover:from-teal-600 hover:to-pink-600
bg-gradient-to-r from-teal-400 to-pink-400 bg-clip-text text-transparent
bg-slate-800/50 border border-white/20 focus:border-teal-400
```

---

**Need help?** Check the full documentation in `docs/PROJECT_SUMMARY.md`

**File:** `docs/QUICK_VISUAL_REFERENCE.md`  
**Updated:** January 2025  
**Status:** ✅ Current
