# 🎨 LeetLab UI - Quick Visual Reference

## Color Palette

### Primary Colors

```
Teal:    #14B8A6 (teal-500)
Pink:    #EC4899 (pink-500)
Purple:  #A855F7 (purple-500)
```

### Background Colors

```
Dark Base:     #020617 (slate-950)
Teal Dark:     #042F2E (teal-950)
Pink Dark:     #500724 (pink-950)
```

### Text Colors

```
Primary:       #FFFFFF (white)
Secondary:     #9CA3AF (gray-400)
Muted:         #6B7280 (gray-500)
```

---

## Component Quick Reference

### 🎴 Glassmorphism Card

```jsx
<div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-2xl">
  {/* Content */}
</div>
```

**Use for:** Main content containers, forms, lists

---

### 🔘 Gradient Button

```jsx
<button className="px-6 py-3 bg-gradient-to-r from-teal-500 to-pink-500 hover:from-teal-600 hover:to-pink-600 text-white font-semibold rounded-xl transition-all">
  Click Me
</button>
```

**Use for:** Primary actions, submit buttons

---

### 📝 Input Field

```jsx
<input className="w-full px-4 py-3 bg-slate-800/50 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-teal-400 transition-all" />
```

**Use for:** Text inputs, search bars, forms

---

### 🎯 Gradient Heading

```jsx
<h1 className="text-4xl font-bold bg-gradient-to-r from-teal-400 to-pink-400 bg-clip-text text-transparent">
  Page Title
</h1>
```

**Use for:** Page titles, section headings

---

### 🏷️ Difficulty Badge

```jsx
{
  /* Easy */
}
<span className="px-3 py-1 rounded-full text-sm font-medium bg-green-500/10 text-green-400 border border-green-500/30">
  Easy
</span>;

{
  /* Medium */
}
<span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-500/10 text-yellow-400 border border-yellow-500/30">
  Medium
</span>;

{
  /* Hard */
}
<span className="px-3 py-1 rounded-full text-sm font-medium bg-red-500/10 text-red-400 border border-red-500/30">
  Hard
</span>;
```

**Use for:** Problem difficulty, status indicators

---

### 📊 Stats Card

```jsx
<div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-4 hover:bg-slate-800/70 hover:border-teal-500/30 transition-all">
  <div className="text-xs text-slate-400 mb-1">Label</div>
  <div className="text-2xl text-white font-bold">Value</div>
</div>
```

**Use for:** Statistics, metrics, counters

---

### 🔗 Navigation Link

```jsx
<a className="text-gray-300 hover:text-teal-400 transition-colors">Link Text</a>
```

**Use for:** Navigation items, text links

---

## Animation Templates

### Page Background (All Pages)

```jsx
<>
  <style>{`
    @keyframes float {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      50% { transform: translateY(-20px) rotate(180deg); }
    }
    @keyframes pulse {
      0%, 100% { opacity: 0.2; }
      50% { opacity: 0.4; }
    }
    .floating-particle { animation: float 3s ease-in-out infinite; }
    .pulse-bg { animation: pulse 3s ease-in-out infinite; }
    .pulse-bg-delay-1 { animation: pulse 3s ease-in-out infinite; animation-delay: 1s; }
    .pulse-bg-delay-2 { animation: pulse 3s ease-in-out infinite; animation-delay: 0.5s; }
  `}</style>

  {/* Animated background blobs - Fixed position */}
  <div className="fixed inset-0 overflow-hidden pointer-events-none">
    <div className="pulse-bg absolute -top-40 -right-40 w-80 h-80 bg-teal-500/20 rounded-full mix-blend-multiply filter blur-3xl" />
    <div className="pulse-bg-delay-1 absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full mix-blend-multiply filter blur-3xl" />
    <div className="pulse-bg-delay-2 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-500/10 rounded-full mix-blend-multiply filter blur-3xl" />
  </div>

  {/* Floating particles - Fixed position */}
  <div className="fixed inset-0 pointer-events-none">
    {particles.map((particle) => (
      <div
        key={particle.id}
        className="floating-particle absolute w-1 h-1 bg-white rounded-full opacity-30"
        style={{
          left: particle.left,
          top: particle.top,
          animationDelay: particle.delay,
          animationDuration: particle.duration,
        }}
      />
    ))}
  </div>
</>
```

### Particle Generation

```jsx
// Generate floating particles
const particles = [];
for (let i = 0; i < 30; i++) {
  particles.push({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    delay: `${Math.random() * 2}s`,
    duration: `${3 + Math.random() * 4}s`,
  });
}
```

### Framer Motion Card

```jsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.2 }}
>
  {/* Card content */}
</motion.div>
```

---

## Layout Structure

### Page Container

```jsx
<div className="min-h-screen relative">
  <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    {/* Page content */}
  </div>
</div>
```

### Section Spacing

```
Gap between sections: mb-8 (32px)
Gap between cards: gap-6 (24px)
Card padding: p-6 (24px)
```

---

## Responsive Breakpoints

```
sm:  640px  - Small tablets
md:  768px  - Tablets
lg:  1024px - Laptops
xl:  1280px - Desktops
2xl: 1536px - Large desktops
```

### Grid Patterns

```jsx
{/* Mobile: 1 col, Tablet: 2 cols, Desktop: 3 cols */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

{/* Mobile: 1 col, Desktop: 4 cols */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

{/* Asymmetric: 1:2 ratio */}
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  <div className="lg:col-span-1">{/* Sidebar */}</div>
  <div className="lg:col-span-2">{/* Main content */}</div>
</div>
```

---

## Icon Library

Using **react-icons/fi** (Feather Icons):

```jsx
import {
  FiUser, // User/Profile
  FiMail, // Email
  FiLock, // Password/Security
  FiEye, // Show password
  FiEyeOff, // Hide password
  FiCheckCircle, // Success/Completed
  FiClock, // Time/Pending
  FiTrendingUp, // Stats/Growth
  FiStar, // Favorites/Featured
  FiBookmark, // Saved items
  FiPlay, // Start/Execute
  FiArrowLeft, // Back navigation
  FiArrowRight, // Forward/Next
  FiSearch, // Search
  FiFilter, // Filter
  FiRefreshCw, // Refresh/Reload
  FiCode, // Code/Programming
  FiLayers, // Layers/Sheets
  FiList, // List view
  FiGrid, // Grid view
} from "react-icons/fi";
```

---

## State Patterns

### Loading State

```jsx
if (loading) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-teal-950 to-pink-950 flex items-center justify-center">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-teal-400/30 border-t-teal-400 rounded-full animate-spin"></div>
      </div>
    </div>
  );
}
```

### Error State

```jsx
<div className="min-h-screen bg-gradient-to-br from-slate-950 via-teal-950 to-pink-950 flex items-center justify-center">
  <div className="text-center bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
    <h2 className="text-2xl font-bold text-white mb-4">Error Title</h2>
    <p className="text-gray-400 mb-6">Error message</p>
    <button className="px-6 py-3 bg-gradient-to-r from-teal-500 to-pink-500 text-white rounded-xl">
      Action
    </button>
  </div>
</div>
```

### Empty State

```jsx
<div className="text-center py-12 bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-white/10">
  <div className="text-6xl mb-4">📭</div>
  <h3 className="text-xl font-bold text-white mb-2">No items found</h3>
  <p className="text-gray-400">Try adjusting your filters</p>
</div>
```

---

## Hover Effects

### Card Hover

```jsx
className = "hover:bg-slate-800/70 hover:border-teal-500/30 transition-all";
```

### Button Hover

```jsx
className="hover:scale-105 transition-transform"
// or with Framer Motion
whileHover={{ scale: 1.05 }}
whileTap={{ scale: 0.95 }}
```

### Link Hover

```jsx
className = "hover:text-teal-400 transition-colors";
```

---

## Common Patterns

### Gradient Logo

```jsx
<span className="text-2xl font-bold">
  <span className="bg-gradient-to-r from-teal-400 to-pink-400 bg-clip-text text-transparent">
    Leet
  </span>
  <span className="text-white">Lab</span>
</span>
```

### Progress Bar

```jsx
<div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
  <div
    className="h-full bg-gradient-to-r from-teal-500 to-pink-500 transition-all duration-500"
    style={{ width: `${progress}%` }}
  />
</div>
```

### Avatar Circle

```jsx
<div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-teal-500 to-pink-500 rounded-full shadow-lg">
  <span className="text-3xl font-bold text-white">{name?.charAt(0).toUpperCase()}</span>
</div>
```

---

## Z-Index Layers

```
Background blobs:  fixed, z-auto
Floating particles: fixed, z-auto
Main content:      relative, z-10
Navbar:            sticky, z-50
Modals:            fixed, z-[100]
```

---

## Accessibility

### Focus States

```jsx
focus:outline-none focus:ring-2 focus:ring-teal-400
```

### Alt Text

```jsx
<img src="..." alt="Descriptive text" />
```

### ARIA Labels

```jsx
<button aria-label="Close dialog">×</button>
```

---

## Performance Tips

1. **Fixed Backgrounds**: Use `fixed` position for animated elements to prevent re-renders
2. **Pointer Events**: Add `pointer-events-none` to decorative elements
3. **Backdrop Blur**: Limit to visible cards only
4. **Particle Count**: Keep at ~30 per page
5. **CSS Animations**: Prefer CSS over JS for smooth 60fps

---

## Common Classes Reference

### Spacing

```
p-4:  padding 16px
p-6:  padding 24px
p-8:  padding 32px
gap-4: gap 16px
gap-6: gap 24px
mb-4: margin-bottom 16px
mb-8: margin-bottom 32px
```

### Borders

```
border:           1px
border-2:         2px
border-4:         4px
rounded-lg:       8px
rounded-xl:       12px
rounded-2xl:      16px
rounded-full:     9999px
```

### Shadows

```
shadow-lg:  Large shadow
shadow-xl:  Extra large shadow
shadow-2xl: 2X extra large shadow
```

### Opacity

```
/10:  10% opacity
/20:  20% opacity
/30:  30% opacity
/50:  50% opacity
/80:  80% opacity
```

---

## Quick Copy Templates

### New Page Template

```jsx
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const NewPage = () => {
  // Particle generation
  const particles = [];
  for (let i = 0; i < 30; i++) {
    particles.push({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      delay: `${Math.random() * 2}s`,
      duration: `${3 + Math.random() * 4}s`,
    });
  }

  return (
    <>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.4; }
        }
        .floating-particle { animation: float 3s ease-in-out infinite; }
        .pulse-bg { animation: pulse 3s ease-in-out infinite; }
        .pulse-bg-delay-1 { animation: pulse 3s ease-in-out infinite; animation-delay: 1s; }
        .pulse-bg-delay-2 { animation: pulse 3s ease-in-out infinite; animation-delay: 0.5s; }
      `}</style>

      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="pulse-bg absolute -top-40 -right-40 w-80 h-80 bg-teal-500/20 rounded-full mix-blend-multiply filter blur-3xl" />
        <div className="pulse-bg-delay-1 absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full mix-blend-multiply filter blur-3xl" />
        <div className="pulse-bg-delay-2 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-500/10 rounded-full mix-blend-multiply filter blur-3xl" />
      </div>

      {/* Floating particles */}
      <div className="fixed inset-0 pointer-events-none">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="floating-particle absolute w-1 h-1 bg-white rounded-full opacity-30"
            style={{
              left: particle.left,
              top: particle.top,
              animationDelay: particle.delay,
              animationDuration: particle.duration,
            }}
          />
        ))}
      </div>

      {/* Page content */}
      <div className="min-h-screen relative">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-400 to-pink-400 bg-clip-text text-transparent mb-2">
              Page Title
            </h1>
            <p className="text-gray-400">Page description</p>
          </motion.div>

          {/* Add your content here */}
        </div>
      </div>
    </>
  );
};

export default NewPage;
```

---

**Last Updated**: January 2025  
**Version**: 1.0  
**Status**: Production Ready ✅
